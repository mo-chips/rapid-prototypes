mod notifications;

use tauri::{Manager, Emitter, menu::{MenuBuilder, MenuItemBuilder}};
use tauri::tray::{TrayIconBuilder, MouseButton, MouseButtonState, TrayIconEvent};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(notifications::init())
    .setup(|app| {
      let quit_i = MenuItemBuilder::with_id("quit", "Quit").build(app)?;
      let show_i = MenuItemBuilder::with_id("show", "Show").build(app)?;
      let menu = MenuBuilder::new(app)
        .items(&[&show_i, &quit_i])
        .build()?;

      let _tray = TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .on_menu_event(|app, event| match event.id.as_ref() {
          "quit" => {
            app.exit(0);
          }
          "show" => {
            if let Some(window) = app.get_webview_window("main") {
              let _ = window.show();
              let _ = window.set_focus();
              let _ = window.emit("app-restore-requested", ());
            }
          }
          _ => {}
        })
        .on_tray_icon_event(|tray, event| {
          if let TrayIconEvent::Click {
            button: MouseButton::Left,
            button_state: MouseButtonState::Up,
            ..
          } = event {
            let app = tray.app_handle();
            if let Some(window) = app.get_webview_window("main") {
              let _ = window.show();
              let _ = window.set_focus();
              let _ = window.emit("app-restore-requested", ());
            }
          }
        })
        .build(app)?;

      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .on_window_event(|window, event| match event {
      tauri::WindowEvent::CloseRequested { api, .. } => {
        // Only intercept close for the main app window.
        // Mini-timer and notification windows close freely.
        if window.label() == "main" {
          let _ = window.emit("app-close-requested", ());
          api.prevent_close();
        }
      }
      _ => {}
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

