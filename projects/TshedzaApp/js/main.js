/**
 * ============================================================================
 * Tshedza Playground - Main Entry Point & Router (Expanded)
 * ============================================================================
 */

import { speak, loadVoice } from './voice.js';
import { setupNameTracing, cleanupNameTracing } from './games/name-tracing.js';
import { setupAlphabetAcademy, cleanupAlphabetAcademy } from './games/alphabet-academy.js';
import { setupShapeSafari, cleanupShapeSafari } from './games/shape-safari.js';
import { setupBalloonPop, cleanupBalloonPop } from './games/balloon-pop.js';
import { setupNumberTracing, cleanupNumberTracing } from './games/number-tracing.js';
import { setupObjectOasis, cleanupObjectOasis } from './games/object-oasis.js';
import { setupBodyParts, cleanupBodyParts } from './games/body-parts.js';
import { setupAnimalSafari, cleanupAnimalSafari } from './games/animal-safari.js';

const viewIds = [
  'home-screen', 
  'name-tracing-screen', 
  'alphabet-screen', 
  'shape-screen', 
  'balloon-pop-screen',
  'number-screen',
  'objects-screen',
  'body-screen',
  'animals-screen'
];

/**
 * Handles view transitions, voice resets, and game setup/cleanup triggers.
 * @param {string} activeViewId - The target viewport container ID.
 */
function switchView(activeViewId) {
  // Stop sounds and Speech
  window.speechSynthesis.cancel();
  
  // Cleanup game scripts
  cleanupActiveGame();

  // Manage Navigation Bar title and displays
  const navbar = document.getElementById("global-navbar");
  if (activeViewId === 'home-screen') {
    navbar.style.display = 'none';
  } else {
    navbar.style.display = 'flex';
    let title = "Tshedza Playground";
    if (activeViewId === 'name-tracing-screen') title = "Name Tracing ✏️";
    if (activeViewId === 'alphabet-screen') title = "Alphabet Academy 🏫";
    if (activeViewId === 'shape-screen') title = "Shape Safari 🦁";
    if (activeViewId === 'balloon-pop-screen') title = "Balloon Pop Party 🎈";
    if (activeViewId === 'number-screen') title = "Number Tracing 🔢";
    if (activeViewId === 'objects-screen') title = "Object Oasis 🧩";
    if (activeViewId === 'body-screen') title = "My Body 🧠";
    if (activeViewId === 'animals-screen') title = "Animal Safari 🦁";
    document.getElementById("navbar-title").textContent = title;
  }

  // Switch View Active Class
  viewIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === activeViewId) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    }
  });

  // Start the appropriate game logic
  initGameForView(activeViewId);
}

/**
 * Trigger game-specific initialization.
 */
function initGameForView(viewId) {
  if (viewId === 'name-tracing-screen') setupNameTracing();
  if (viewId === 'alphabet-screen') setupAlphabetAcademy();
  if (viewId === 'shape-screen') setupShapeSafari();
  if (viewId === 'balloon-pop-screen') setupBalloonPop();
  if (viewId === 'number-screen') setupNumberTracing();
  if (viewId === 'objects-screen') setupObjectOasis();
  if (viewId === 'body-screen') setupBodyParts();
  if (viewId === 'animals-screen') setupAnimalSafari();
}

/**
 * Trigger cleanup of intervals, event bounds, and speech.
 */
function cleanupActiveGame() {
  cleanupNameTracing();
  cleanupAlphabetAcademy();
  cleanupShapeSafari();
  cleanupBalloonPop();
  cleanupNumberTracing();
  cleanupObjectOasis();
  cleanupBodyParts();
  cleanupAnimalSafari();
}

// ============================================================================
// BIND EVENTS DIRECTLY INSIDE MODULE SCOPE
// ============================================================================

// Back to Home nav button
document.getElementById("btn-back-home").addEventListener("click", () => switchView('home-screen'));

// Dashboard Menu selection cards
document.getElementById("card-name-tracing").addEventListener("click", () => switchView('name-tracing-screen'));
document.getElementById("card-alphabet").addEventListener("click", () => switchView('alphabet-screen'));
document.getElementById("card-shape").addEventListener("click", () => switchView('shape-screen'));
document.getElementById("card-balloon").addEventListener("click", () => switchView('balloon-pop-screen'));
document.getElementById("card-number").addEventListener("click", () => switchView('number-screen'));
document.getElementById("card-objects").addEventListener("click", () => switchView('objects-screen'));
document.getElementById("card-body").addEventListener("click", () => switchView('body-screen'));
document.getElementById("card-animals").addEventListener("click", () => switchView('animals-screen'));

// Friendly welcome voice prompt on landing click / touch interaction
let voiceGreeted = false;
const welcomeTrigger = () => {
  if (!voiceGreeted) {
    voiceGreeted = true;
    speak("Welcome to Tshedza Playground! Let's choose a game and learn together!");
    // Clean up startup listeners
    window.removeEventListener("click", welcomeTrigger);
    window.removeEventListener("touchstart", welcomeTrigger);
  }
};

window.addEventListener("click", welcomeTrigger);
window.addEventListener("touchstart", welcomeTrigger, { passive: true });

// ============================================================================
// REGISTER PWA SERVICE WORKER
// ============================================================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('[PWA] Service Worker registered successfully: ', reg.scope))
      .catch((err) => console.error('[PWA] Service Worker registration failed: ', err));
  });
}
