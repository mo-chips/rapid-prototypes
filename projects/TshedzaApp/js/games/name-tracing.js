/**
 * ============================================================================
 * Tshedza Playground - Game 1: Name and Surname Tracing
 * ============================================================================
 */

import { TracingManager } from '../tracing-manager.js';
import { speak } from '../voice.js';
import { originalLetterDots, nameTracingSteps } from '../constants.js';
import { spawnChoiceConfetti } from './object-oasis.js';

let nameStepIndex = 0;
let nameAutoAdvanceTimeout = null;
let nameTracerInstance = null;

export function setupNameTracing() {
  const canvas = document.getElementById("traceCanvas");
  
  if (!nameTracerInstance) {
    nameTracerInstance = new TracingManager(
      canvas,
      // Success Callback
      () => {
        speak("Fantastic!");
        
        // Burst confetti from the center of the drawing canvas!
        const rect = canvas.getBoundingClientRect();
        const x = rect.left + rect.width / 2 + window.scrollX;
        const y = rect.top + rect.height / 2 + window.scrollY;
        spawnChoiceConfetti(x, y);

        advanceNameStep();
      },
      // Fail Callback
      () => {
        speak("Try tracing the letter again.");
      }
    );
  }
  
  nameStepIndex = 0;
  nameTracerInstance.setActive(true);
  showNameStep(0);
}

function showNameStep(index) {
  if (index >= nameTracingSteps.length) return;
  nameStepIndex = index;
  const step = nameTracingSteps[index];

  const labelEl = document.getElementById("label");
  const lettersEl = document.getElementById("letters");
  const hintEl = document.getElementById("hint");
  const canvas = document.getElementById("traceCanvas");

  labelEl.textContent = step.text;

  if (step.traceLetter) {
    lettersEl.style.display = 'none';
    canvas.style.display = 'block';
    hintEl.style.visibility = 'visible';
    hintEl.textContent = "Draw to continue";
    
    // Feed the path mapping into the generic tracer
    const path = originalLetterDots[step.traceLetter];
    nameTracerInstance.setPath(path);
  } else {
    lettersEl.style.display = 'block';
    canvas.style.display = 'none';
    lettersEl.textContent = step.value;
    
    if (index === nameTracingSteps.length - 1) {
      hintEl.style.visibility = 'visible';
      hintEl.textContent = "Touch to restart";
    } else {
      hintEl.style.visibility = 'hidden';
    }
  }

  speak(step.say);

  // If it's a non-tracing step, automatically move to next after a delay
  if (!step.traceLetter && index < nameTracingSteps.length - 1) {
    const delay = step.say && step.say.length > 20 ? 3500 : 2000;
    nameAutoAdvanceTimeout = setTimeout(() => advanceNameStep(), delay);
  }
}

function advanceNameStep() {
  showNameStep(nameStepIndex + 1);
}

export function cleanupNameTracing() {
  if (nameAutoAdvanceTimeout) clearTimeout(nameAutoAdvanceTimeout);
  if (nameTracerInstance) {
    nameTracerInstance.setActive(false);
  }
}

// Global click restart logic for Name Tracing (bound locally in the module)
window.addEventListener('click', () => {
  const nameScreen = document.getElementById("name-tracing-screen");
  if (nameScreen && nameScreen.classList.contains('active') && nameStepIndex === nameTracingSteps.length - 1) {
    setupNameTracing();
  }
});

window.addEventListener('touchstart', () => {
  const nameScreen = document.getElementById("name-tracing-screen");
  if (nameScreen && nameScreen.classList.contains('active') && nameStepIndex === nameTracingSteps.length - 1) {
    setupNameTracing();
  }
}, { passive: true });
export { nameTracingSteps };
