# Tshedza Playground 🎈

A premium, highly interactive, and responsive kids' educational multi-game web application designed for learning, writing, and counting. The application is built as a lightweight, single-page Progressive Web App (PWA) with rich micro-animations, vibrant gradients, and friendly typography.

Originally created to help a child learn to write their name step-by-step, the app has expanded into a full learning playground featuring shape drawing, alphabet phonic exploration, and balloon counting.

---

## 🤝 Progressive Web App (PWA) Features 📱
* **Installable Native App**: Can be added directly to the home screen on iPads, iPhones, Android devices, and PCs, running in standalone fullscreen mode without browser URL address bars!
* **Full Offline Support**: Powered by a Service Worker (`sw.js`), the application caches all static assets (HTML, CSS, JS, fonts, and icons), allowing children to play the entire playground **completely offline** (perfect for road trips or plane rides!).
* **Generated App Icons**: Custom-crafted, high-resolution child-friendly square vector app icon generated dynamically for device home screen launchers.

---

## 🌟 Why I Made It
I wanted something simple, personal, and interactive.
Instead of generic alphabet practice, this starts with **her own name** (Tshedza Mbengeni) — something familiar and meaningful — so learning feels more engaging.

---

## 🌟 Features

### 1. ✏️ Name & Surname Tracing
* Designed specifically for **Tshedza Mbengeni** with customized phonetic pronunciations and voice instructions.
* Traces uppercase and lowercase letter strokes with high-fidelity, speed-independent coordinate evaluation, accompanied by beautiful canvas-centered success confetti bursts.

### 2. 🏫 Alphabet Academy (Double Tracing)
* Features an interactive **A-to-Z letter board** where children can tap any letter.
* **Capital & Lowercase Progression**: First traces the Uppercase letter (Capital), triggers visual confetti, and then prompts sequentially to trace the Lowercase letter!
* Integrates delightful phonics-based voice synthesis (e.g. *"A is for Apple"*, *"B is for Butterfly"*).

### 3. 🦁 Shape Safari
* Introduces children to basic shapes: **Circle**, **Square**, **Triangle**, **Heart**, and **Star**.
* Tracks tracing paths geometrically and triggers completion banners when drawn accurately.

### 4. 🎈 Balloon Pop Party (Milestone Checkpoints)
* A lively physics-style balloon-popping counting game where colorful balloons float up the screen.
* **Web Audio API Synth Pop**: Generates high-pitch bubble popping sounds dynamically in-browser (requires no external audio assets!).
* **Milestone Checkpoints**: Triggers full-screen visual checkpoints at **every 5 pops** (5, 10, 15, 20...). Pauses the spawner, displays a large-print trophy card, sounds a major arpeggio fanfare, and triggers a massive multi-burst confetti storm!

### 5. 🔢 Number Tracing (Number Jungle)
* Trace numbers **1 through 10** step-by-step with full coordinate evaluation and speech prompts.

### 6. 🧩 Object Oasis (Identification Match)
* An interactive picture-matching game using beautiful emojis on cards. Speaks questions like *"Can you find the Apple?"* and triggers confetti upon correct taps.

### 7. 🧠 My Body (Body Parts Match)
* Explores major body parts (**Head, Eyes, Nose, Mouth, Ears, Hands, and Feet**) through interactive cards and target questions.

### 8. 🦁 Animal Safari (Safari Soundboard)
* Tap friendly safari animals to trigger custom **procedural Web Audio API sound synthesizers** (lion roars, cat meows, elephant trumpets, frog croaks, monkey chatters) and meet them!

---

## 🛠️ Key Technical Implementations

* **Speed-Independent Tracing Engine**: Implements a geometric distance-accumulation buffer in JavaScript. This guarantees that even if a child draws extremely slowly (generating tiny, sub-pixel mouse/touch events), their tracing coordinates are captured uniformly every 5px, preventing the canvas from falsely resetting.
* **Modern CSS Design System**: Upgraded typography using Google Font **Fredoka** (a highly readable rounded kids' font), 3D pushable buttons, bouncy hover states, and smooth viewport transitions.
* **Responsive Layouts**: Designed to center game cards automatically on larger displays (like iPads, Tablets, and Laptops) while adapting gracefully with scrollable sections on mobile phones to prevent any cut-off text.
* **Windows Console Encoding Safe**: Serving script modified to use safe ASCII brackets (`[OK]`, `[PC]`, `[PHONE/IPAD]`) to prevent Python script crashes from emoji characters under Windows terminal encodings.
* **Zero Caching Server**: Serves files locally with absolute caching disabled (`no-cache`, `no-store`, `must-revalidate`), allowing updates to register instantly upon reloading.

---

## 🚀 Getting Started

You can run this application on your local computer or on a mobile device connected to the same network.

### 💻 Running on Your Computer
1. Make sure you have Python installed.
2. **(Optional) Generate Audio Files**: If this is your first time running the app or you've added new voice phrases, run the audio generation script. This will download high-quality animal sounds and create all the necessary voice-over files.
   ```powershell
   python generate_audio.py
   ```
3. **Start the Server**: Double-click or run the startup script in your terminal:
   ```powershell
   python start_app.py
   ```
4. A web browser will automatically open to **`http://localhost:8080`**.

### 📱 Playing on Another Device (iPad / Tablet / Phone)
1. Ensure both your computer and your tablet/phone are connected to the **same Wi-Fi network**.
2. Run the server on your computer using `python start_app.py`.
3. Open a browser on your phone/tablet and enter your computer's local network URL. This URL is printed in the terminal when you start the server (e.g., `http://192.168.1.10:8080`).
4. You can now play the game with full touch support!

---

## 🗂️ Project Structure

The project is organized into a clear and modular structure:

```
TshedzaApp/
├── 📄 index.html            # Main application entry point
├── 🎨 styles.css            # All application styles
├── 📱 manifest.json         # PWA web app manifest
├── ⚙️ sw.js                  # PWA Service Worker for offline caching
├── 🖼️ icon-192.png           # App icons
├── 🖼️ icon-512.png
├── 🎵 audio/                # (Generated) All voice and sound effect assets
├── 🐍 start_app.py           # Local Python web server
├── 🐍 generate_audio.py      # Script to generate/download all audio files
└── 🧠 js/                   # Core application logic
    ├── 🎮 games/            # Individual game modules
    ├── 🗣️ voice.js           # Hybrid TTS and pre-recorded audio engine
    ├── ✍️ tracing-manager.js # Reusable canvas tracing engine
    ├── 📦 constants.js      # Shared constants (e.g., canvas paths)
    └── 🚀 main.js           # Main app entry, router, and event binding
```

## 🗂️ Tech Stack
* **PWA Engine**: Service Worker caching (`sw.js`), Web Manifest (`manifest.json`)
* **Frontend**: HTML5, Vanilla CSS3, Vanilla JavaScript (ES6 Modules)
* **Canvas Processing**: HTML5 2D Context (`CanvasRenderingContext2D`)
* **Audio Systems**: Web Audio API (Synthesized waves), Web Speech API (`SpeechSynthesis`)
* **Backend Serving**: Python 3 standard library `http.server` (No-Cache Handler)

---

## 🤝 Acknowledgments
This educational playground was designed, refactored, and upgraded in collaboration with **Antigravity**, an agentic AI coding assistant designed by the Google DeepMind team. Together, we transformed the name-tracing utility into a comprehensive, multi-game playground, resolved key speed-independent drawing inaccuracies, and polished the experience for mobile devices!
