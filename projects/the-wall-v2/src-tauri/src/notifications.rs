use tauri::plugin::{Builder, TauriPlugin};
use tauri::{Manager, Runtime};
use chrono::prelude::*;

#[derive(Clone, serde::Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct Subtask {
    id: String,
    text: String,
    completed: bool,
    #[serde(default)]
    due_date: Option<String>,
}

#[derive(Clone, serde::Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct Task {
    id: String,
    text: String,
    completed: bool,
    created_at: i64,
    priority: String,
    due_date: Option<String>,
    #[serde(default)]
    subtasks: Option<Vec<Subtask>>,
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
  Builder::new("notifications")
    .invoke_handler(tauri::generate_handler![])
    .setup(|app, _api| {
      let app_handle = app.clone();
      tauri::async_runtime::spawn(async move {
        let mut notified_tasks = std::collections::HashSet::new();
        loop {
          // Check for due tasks every 60 seconds
          tokio::time::sleep(std::time::Duration::from_secs(60)).await;
          check_due_tasks(&app_handle, &mut notified_tasks);
        }
      });
      Ok(())
    })
    .build()
}

fn check_due_tasks<R: Runtime>(app: &tauri::AppHandle<R>, notified_tasks: &mut std::collections::HashSet<String>) {
    let path_resolver = app.path();
    let app_data_dir = match path_resolver.app_data_dir() {
        Ok(dir) => dir,
        Err(e) => {
            println!("Error getting app data dir: {}", e);
            return;
        }
    };

    let tasks_file = app_data_dir.join("the-wall-tasks.json");

    if !tasks_file.exists() {
        return;
    }

    let tasks: Vec<Task> = match std::fs::read_to_string(&tasks_file) {
        Ok(content) => match serde_json::from_str::<Vec<Task>>(&content) {
            Ok(tasks) => tasks,
            Err(e) => {
                println!("Error deserializing tasks: {:?}", e);
                return;
            }
        },
        Err(e) => {
            println!("Error reading tasks file: {:?}", e);
            return;
        }
    };

    let now = Local::now();

    for task in tasks {
        if !task.completed {
            if let Some(ref due_date_str) = task.due_date {
                if let Ok(due_date) = NaiveDateTime::parse_from_str(&due_date_str, "%Y-%m-%dT%H:%M") {
                    let due_date = Local.from_local_datetime(&due_date).unwrap();
                    if now > due_date && !notified_tasks.contains(&task.id) {
                        spawn_notification_window(app, &task.id, &task.text);
                        notified_tasks.insert(task.id.clone());
                    }
                }
            }
        }

        if let Some(subtasks) = task.subtasks {
            for sub in subtasks {
                if !sub.completed {
                    if let Some(ref due_date_str) = sub.due_date {
                        if let Ok(due_date) = NaiveDateTime::parse_from_str(&due_date_str, "%Y-%m-%dT%H:%M") {
                            let due_date = Local.from_local_datetime(&due_date).unwrap();
                            if now > due_date && !notified_tasks.contains(&sub.id) {
                                spawn_notification_window(app, &sub.id, &sub.text);
                                notified_tasks.insert(sub.id.clone());
                            }
                        }
                    }
                }
            }
        }
    }
}

fn spawn_notification_window<R: Runtime>(app: &tauri::AppHandle<R>, id: &str, text: &str) {
    let Some(monitor) = app.primary_monitor().unwrap_or(None) else { return; };
    let size = monitor.size();
    
    // Notification dimensions
    let width = 340.0;
    let height = 120.0;
    let padding = 16.0;
    
    // Calculate bottom-right position
    let x = (size.width as f64) - width - padding;
    let y = (size.height as f64) - height - padding;
    let position = tauri::PhysicalPosition::new(x, y);
    
    let url = format!(
        "/?notification=true&title={}&body={}",
        urlencoding::encode("Task Overdue"),
        urlencoding::encode(text)
    );
    
    if let Err(e) = tauri::WebviewWindowBuilder::new(
        app,
        format!("notification-{}", id),
        tauri::WebviewUrl::App(url.into())
    )
    .inner_size(width, height)
    .position(position.x, position.y)
    .transparent(true)
    .decorations(false)
    .always_on_top(true)
    .skip_taskbar(true)
    .resizable(false)
    .build() {
        println!("Error creating notification window: {:?}", e);
    }
}
