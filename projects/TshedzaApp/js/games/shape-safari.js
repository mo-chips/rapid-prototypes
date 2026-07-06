/**
 * ============================================================================
 * Tshedza Playground - Game 3: Shape Safari
 * ============================================================================
 */

import { TracingManager } from '../tracing-manager.js';
import { speak } from '../voice.js';
import { shapePaths } from '../constants.js';

let shapeTracerInstance = null;
let activeShape = null;

export function setupShapeSafari() {
  const canvas = document.getElementById("shapeCanvas");
  
  // Bind shape button toggles
  const shapeBtns = document.querySelectorAll(".shape-btn");
  shapeBtns.forEach(btn => {
    // Prevent duplicate binding
    btn.onclick = null;
    btn.addEventListener("click", (e) => {
      const shape = e.currentTarget.getAttribute("data-shape");
      selectShape(shape);
    });
  });

  if (!shapeTracerInstance) {
    shapeTracerInstance = new TracingManager(
      canvas,
      // Success Callback
      () => {
        speak("Wow, you drew a perfect " + activeShape + "!");
        triggerShapeSuccessAnimation();
      },
      // Fail Callback
      () => {
        speak("Try drawing along the dots.");
      }
    );
  }

  shapeTracerInstance.setActive(true);
  selectShape("circle");
}

function selectShape(shape) {
  activeShape = shape;

  // Toggle button state
  const shapeBtns = document.querySelectorAll(".shape-btn");
  shapeBtns.forEach(btn => {
    if (btn.getAttribute("data-shape") === shape) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  const labelEl = document.getElementById("shape-label");
  const hintEl = document.getElementById("shape-hint");
  const canvas = document.getElementById("shapeCanvas");

  labelEl.textContent = `Let's trace a ${shape.toUpperCase()}!`;
  hintEl.textContent = "Draw to continue";
  canvas.style.display = "block";

  // Speak shape name
  speak(`This is a ${shape}. Let's trace it!`);

  // Map path
  const path = shapePaths[shape];
  shapeTracerInstance.setPath(path);
}

function triggerShapeSuccessAnimation() {
  const labelEl = document.getElementById("shape-label");
  labelEl.textContent = "🌟 Magnificent! 🌟";
}

export function cleanupShapeSafari() {
  if (shapeTracerInstance) {
    shapeTracerInstance.setActive(false);
  }
  activeShape = null;
}
