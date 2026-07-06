/**
 * ============================================================================
 * Tshedza Playground - Game 5: Number Tracing
 * ============================================================================
 */

import { TracingManager } from '../tracing-manager.js';
import { speak } from '../voice.js';
import { numberPaths } from '../constants.js';

let numberTracerInstance = null;
let activeNumber = null;

export function setupNumberTracing() {
  const selectorGrid = document.getElementById("number-selector");
  const canvas = document.getElementById("numCanvas");

  // Generate 1-10 selector buttons dynamically if empty
  if (selectorGrid.children.length === 0) {
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    numbers.forEach(num => {
      const btn = document.createElement("button");
      btn.className = "letter-btn";
      btn.textContent = num;
      btn.addEventListener("click", () => selectNumber(num));
      selectorGrid.appendChild(btn);
    });
  }

  if (!numberTracerInstance) {
    numberTracerInstance = new TracingManager(
      canvas,
      // Success Callback
      () => {
        speak("Splendid! You traced number " + activeNumber + "!");
        triggerNumberSuccessAnimation();
      },
      // Fail Callback
      () => {
        speak("Try drawing along the numbers.");
      }
    );
  }

  numberTracerInstance.setActive(true);
  selectNumber('1');
}

function selectNumber(num) {
  activeNumber = num;

  // Toggle button state
  const btns = document.querySelectorAll("#number-selector .letter-btn");
  btns.forEach(btn => {
    if (btn.textContent === num) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  const labelEl = document.getElementById("number-label");
  const hintEl = document.getElementById("number-hint");
  const canvas = document.getElementById("numCanvas");

  labelEl.textContent = `Let's trace the number ${num}!`;
  hintEl.textContent = "Draw to continue";
  canvas.style.display = "block";

  // Speak number
  speak(`This is the number ${num}. Let's trace it!`);

  // Map path
  const path = numberPaths[num];
  numberTracerInstance.setPath(path);
}

function triggerNumberSuccessAnimation() {
  const labelEl = document.getElementById("number-label");
  labelEl.textContent = "🎉 Splendid! 🎉";
}

export function cleanupNumberTracing() {
  if (numberTracerInstance) {
    numberTracerInstance.setActive(false);
  }
  activeNumber = null;
}
