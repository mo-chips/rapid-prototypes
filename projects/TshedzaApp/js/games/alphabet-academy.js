/**
 * ============================================================================
 * Tshedza Playground - Game 2: Alphabet Academy
 * ============================================================================
 */

import { TracingManager } from '../tracing-manager.js';
import { speak } from '../voice.js';
import { alphabetPaths, lowercasePaths, phonicsDict } from '../constants.js';
import { spawnChoiceConfetti } from './object-oasis.js';

let alphabetTracerInstance = null;
let activeAlphaLetter = null;
let isTracingLowercase = false;

export function setupAlphabetAcademy() {
  const selectorGrid = document.getElementById("alphabet-selector");
  const canvas = document.getElementById("alphaCanvas");

  // Generate A-Z selector buttons dynamically if empty
  if (selectorGrid.children.length === 0) {
    const letters = Object.keys(alphabetPaths).sort();
    letters.forEach(letter => {
      const btn = document.createElement("button");
      btn.className = "letter-btn";
      btn.textContent = letter;
      btn.addEventListener("click", () => selectAlphaLetter(letter));
      selectorGrid.appendChild(btn);
    });
  }

  if (!alphabetTracerInstance) {
    alphabetTracerInstance = new TracingManager(
      canvas,
      // Success Callback
      () => {
        handleTraceSuccess();
      },
      // Fail Callback
      () => {
        speak(isTracingLowercase ? "Try tracing the lowercase letter." : "Try tracing the uppercase letter.");
      }
    );
  }

  alphabetTracerInstance.setActive(true);
  
  // Select initial letter 'A'
  selectAlphaLetter('A');
}

function selectAlphaLetter(letter) {
  activeAlphaLetter = letter;
  isTracingLowercase = false; // Reset to uppercase start
  
  // UI Activation states
  const btns = document.querySelectorAll(".letter-btn");
  btns.forEach(btn => {
    if (btn.textContent === letter) {
      btn.classList.add("active");
      // Scroll active into view
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } else {
      btn.classList.remove("active");
    }
  });

  setupTraceState();
}

/**
 * Configure target canvas path depending on uppercase vs lowercase state.
 */
function setupTraceState() {
  const labelEl = document.getElementById("alpha-label");
  const hintEl = document.getElementById("alpha-hint");
  const canvas = document.getElementById("alphaCanvas");

  canvas.style.display = 'block';
  hintEl.textContent = "Draw to continue";

  if (!isTracingLowercase) {
    // 1. Uppercase State
    labelEl.textContent = `Trace Capital ${activeAlphaLetter}!`;
    speak(`Let's trace Capital ${activeAlphaLetter}!`);
    alphabetTracerInstance.setPath(alphabetPaths[activeAlphaLetter]);
  } else {
    // 2. Lowercase State
    const lower = activeAlphaLetter.toLowerCase();
    labelEl.textContent = `Now trace lowercase ${lower}!`;
    speak(`Great! Now let's trace lowercase ${lower}!`);
    alphabetTracerInstance.setPath(lowercasePaths[lower]);
  }
}

/**
 * Orchestrate success transitions.
 */
function handleTraceSuccess() {
  const canvas = document.getElementById("alphaCanvas");
  
  // Visual Confetti burst from center of alphabet canvas
  const rect = canvas.getBoundingClientRect();
  const x = rect.left + rect.width / 2 + window.scrollX;
  const y = rect.top + rect.height / 2 + window.scrollY;
  spawnChoiceConfetti(x, y);

  if (!isTracingLowercase) {
    // Completed Capital, transition to Lowercase
    isTracingLowercase = true;
    setTimeout(() => {
      if (!document.getElementById("alphabet-screen").classList.contains("active")) return;
      setupTraceState();
    }, 1500);
  } else {
    // Completed both! Trigger final phonic synthesis and advance
    speak(`Outstanding! You drew both! ${phonicsDict[activeAlphaLetter] || activeAlphaLetter}`);
    triggerAlphaSuccessAnimation();
  }
}

function triggerAlphaSuccessAnimation() {
  const labelEl = document.getElementById("alpha-label");
  labelEl.textContent = "⭐ Excellent! ⭐";
  
  // Highlight next letter logic after 3.2 seconds (giving voice phonic time to complete)
  setTimeout(() => {
    if (!document.getElementById("alphabet-screen").classList.contains("active")) return;
    
    // Find next index
    const letters = Object.keys(alphabetPaths).sort();
    const curIdx = letters.indexOf(activeAlphaLetter);
    const nextIdx = (curIdx + 1) % letters.length;
    selectAlphaLetter(letters[nextIdx]);
  }, 3200);
}

export function cleanupAlphabetAcademy() {
  if (alphabetTracerInstance) {
    alphabetTracerInstance.setActive(false);
  }
  activeAlphaLetter = null;
  isTracingLowercase = false;
}
