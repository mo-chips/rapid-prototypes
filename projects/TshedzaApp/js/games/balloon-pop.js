/**
 * ============================================================================
 * Tshedza Playground - Game 4: Balloon Pop Party (Updated with Checkpoints)
 * ============================================================================
 */

import { speak } from '../voice.js';

let poppedCount = 0;
let balloonSpawnInterval = null;

export function setupBalloonPop() {
  poppedCount = 0;
  document.getElementById("pop-counter").textContent = poppedCount;
  document.getElementById("checkpoint-overlay").style.display = "none";
  
  speak("Welcome to the Balloon Pop Party! Pop the floating balloons to count them!");

  // Start Spawning balloons
  if (balloonSpawnInterval) clearInterval(balloonSpawnInterval);
  balloonSpawnInterval = setInterval(() => {
    spawnBalloon();
  }, 1200);
}

// Spawns a floating balloon
function spawnBalloon() {
  const arena = document.getElementById("balloon-arena");
  if (!arena) return;

  const balloon = document.createElement("div");
  balloon.className = "balloon";
  
  // Custom random styling
  const colors = [
    'var(--coral-red)', 
    'var(--sunny-orange)', 
    'var(--lime-green)', 
    'var(--sky-blue)', 
    'var(--lavender)',
    '#ffc107' // Sunny yellow
  ];
  const color = colors[Math.floor(Math.random() * colors.length)];
  balloon.style.backgroundColor = color;
  balloon.style.color = color; // For the triangular tail stroke color match

  // Random size scaling (between 0.8 and 1.2)
  const scale = 0.8 + Math.random() * 0.4;
  balloon.style.transform = `scale(${scale})`;

  // Random horizontal spawning position
  const randomX = Math.random() * 80 + 5; // 5% to 85% width
  balloon.style.left = `${randomX}%`;

  // Random animation float duration (6s to 9s)
  const duration = 6 + Math.random() * 3;
  balloon.style.animationDuration = `${duration}s`;

  // Draw an interactive text inside showing current popping index
  const numSpan = document.createElement("span");
  numSpan.className = "balloon-text";
  numSpan.textContent = "🎈";
  balloon.appendChild(numSpan);

  // String line
  const string = document.createElement("div");
  string.className = "balloon-string";
  balloon.appendChild(string);

  // Pop listener
  const popHandler = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    poppedCount++;
    document.getElementById("pop-counter").textContent = poppedCount;

    // Synthesis pop sound via Web Audio API
    playPopSound();

    // Trigger visual confetti explosion
    const rect = balloon.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    spawnLocalCheckpointConfetti(x, y);

    // Check for popped count milestone checkpoints!
    if (poppedCount > 0 && poppedCount % 5 === 0) {
      triggerPopCheckpoint(poppedCount);
    } else {
      // Normal pop counting synthesis
      speak(String(poppedCount));
    }

    // Remove popped balloon
    balloon.remove();
  };

  balloon.addEventListener("mousedown", popHandler);
  balloon.addEventListener("touchstart", popHandler, { passive: false });

  // Self-remove when float animation ends
  balloon.addEventListener("animationend", () => {
    balloon.remove();
  });

  arena.appendChild(balloon);
}

/**
 * Handle 5-pop milestone checkpoint overlays and audio arpeggios.
 * @param {number} count - Total balloons popped.
 */
function triggerPopCheckpoint(count) {
  // 1. Pause spawner
  if (balloonSpawnInterval) clearInterval(balloonSpawnInterval);

  // 2. Play checkpoint fanfare arpeggio
  playCheckpointSound();

  // 3. Setup large print visual overlay
  const overlay = document.getElementById("checkpoint-overlay");
  const numEl = document.getElementById("checkpoint-num");
  const titleEl = document.getElementById("checkpoint-title");

  numEl.textContent = count;
  titleEl.textContent = `${count} BALLOONS!`;
  overlay.style.display = "flex";

  // 4. Speak checkpoint cheer
  speak(`Outstanding! You popped ${count} balloons!`);

  // 5. Massive Confetti Storm (spawn multiple bursts in intervals)
  let burstCount = 0;
  const stormInterval = setInterval(() => {
    const rx = Math.random() * window.innerWidth;
    const ry = Math.random() * window.innerHeight * 0.7 + window.innerHeight * 0.1;
    spawnLocalCheckpointConfetti(rx, ry);
    burstCount++;
    if (burstCount >= 8) clearInterval(stormInterval);
  }, 250);

  // 6. Resume game spawning after 3.5 seconds
  setTimeout(() => {
    if (!document.getElementById("balloon-pop-screen").classList.contains("active")) return;
    overlay.style.display = "none";
    // Resume spawning
    balloonSpawnInterval = setInterval(() => {
      spawnBalloon();
    }, 1200);
  }, 3500);
}

// High-pitch pop synthesizer
function playPopSound() {
  if (!window.AudioContext && !window.webkitAudioContext) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    // Slide tone upwards quickly to sound pop-py
    osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  } catch (err) {
    console.error("Audio Pop synthesis failed: ", err);
  }
}

// Synthesize arpeggio fanfare for checkpoints
function playCheckpointSound() {
  if (!window.AudioContext && !window.webkitAudioContext) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 major arpeggio
    
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.25);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.25);
    });
  } catch (e) {
    console.error(e);
  }
}

// Local canvas/screen confetti spawning
function spawnLocalCheckpointConfetti(x, y) {
  const colors = ['#f44336', '#e91e63', '#9c27b0', '#3f51b5', '#00bcd4', '#4caf50', '#ffeb3b', '#ff9800'];
  for (let i = 0; i < 20; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = `${x}px`;
    confetti.style.top = `${y}px`;
    confetti.style.zIndex = "1000";

    const angle = Math.random() * Math.PI * 2;
    const distance = 80 + Math.random() * 150;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - 50;

    confetti.style.setProperty("--tx", `${tx}px`);
    confetti.style.setProperty("--ty", `${ty}px`);

    document.body.appendChild(confetti);
    setTimeout(() => {
      confetti.remove();
    }, 600);
  }
}

export function cleanupBalloonPop() {
  if (balloonSpawnInterval) clearInterval(balloonSpawnInterval);
  const arena = document.getElementById("balloon-arena");
  if (arena) arena.innerHTML = "";
  poppedCount = 0;
  document.getElementById("checkpoint-overlay").style.display = "none";
}
