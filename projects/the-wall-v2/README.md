<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>
<div align="center">

# The Wall v2

**Your personal dashboard for notes, tasks, and focus.**

*The Wall* is a modern, cross-platform desktop application designed to be your central hub for productivity. It combines a powerful note-taking system, a comprehensive task manager, and an integrated Pomodoro timer into a single, beautifully designed interface.

</div>

---

## ✨ Features

*   **Dashboard:** Get a quick overview of your day, including recent notes and pending tasks.
*   **Note Management:** Create, edit, and organize rich-text notes. Link notes to tasks for seamless context switching.
*   **Task Tracking:** Manage your to-do list with priorities, due dates, subtasks, and recurrence.
*   **Pomodoro Timer:** Boost your focus with a built-in Pomodoro timer, complete with a detachable mini-window for distraction-free work.
*   **Cross-Linking:** Effortlessly link notes and tasks together to build a personal knowledge base.
*   **Local-First Storage:** All your data is stored securely on your local machine.
*   **Customizable:** Includes light and dark themes to match your preference.
*   **Desktop Native:** Built with Tauri for a lightweight, fast, and secure experience on macOS, Windows, and Linux.

## 🛠️ Tech Stack

*   **Framework:** Tauri (Rust backend, webview frontend)
*   **Frontend:** React with TypeScript & Vite
*   **Styling:** Tailwind CSS
*   **Animation:** Framer Motion
*   **Icons:** Lucide React

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

1.  **Node.js & npm:** Download Node.js
2.  **Rust & Cargo:** Follow the official Rust installation guide.
3.  **Tauri Prerequisites:** Complete the setup for your specific operating system by following the Tauri prerequisites guide.

### Installation & Running Locally

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd the-wall-v2
    ```

2.  **Install frontend dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    This command will start the Vite frontend and the Tauri backend with hot-reloading.
    ```bash
    npm run tauri dev
    ```

## 📦 Building for Production

To build a distributable, production-ready application for your platform, run:

```bash
npm run tauri build
```

The compiled application will be located in `src-tauri/target/release/bundle/`.

## 📁 Project Structure

```
.
├── src/                      # Frontend source (React, TypeScript, CSS)
│   ├── components/           # Reusable React components
│   ├── hooks/                # Custom React hooks
│   └── App.tsx               # Main application component
├── src-tauri/                # Backend source (Rust)
│   ├── capabilities/         # Permissions and capabilities configuration
│   ├── gen/                  # Generated schema files
│   ├── src/
│   │   ├── notifications.rs  # Due date notification logic
│   │   └── lib.rs            # Main Tauri application setup
│   └── tauri.conf.json       # Tauri configuration file
└── README.md
```

---

*This project was bootstrapped from AI Studio.*
*View in AI Studio: https://ai.studio/apps/77088f32-3efe-4fb4-83b4-6550781c5737*
