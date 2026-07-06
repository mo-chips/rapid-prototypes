/**
 * ============================================================================
 * Tshedza Playground - Game 6: Object Oasis
 * ============================================================================
 */

import { speak } from '../voice.js';
import { objectsList } from '../constants.js';

let activeTargetObject = null;
let objectsAutoAdvanceTimeout = null;

export function setupObjectOasis() {
  speak("Welcome to Object Oasis! Look at the cards and tap the correct item!");
  generateNewQuestion();
}

function generateNewQuestion() {
  if (objectsAutoAdvanceTimeout) clearTimeout(objectsAutoAdvanceTimeout);

  const grid = document.getElementById("objects-grid");
  const questionEl = document.getElementById("object-question");
  const hintEl = document.getElementById("object-hint");

  grid.innerHTML = "";
  hintEl.textContent = "Tap the correct item!";

  // 1. Pick a target object randomly
  activeTargetObject = objectsList[Math.floor(Math.random() * objectsList.length)];
  questionEl.textContent = `Can you find the ${activeTargetObject.name}?`;
  speak(`Can you find the ${activeTargetObject.name}?`);

  // 2. Select 2 other decoy objects randomly
  const decoys = objectsList.filter(obj => obj.name !== activeTargetObject.name);
  const shuffledDecoys = decoys.sort(() => 0.5 - Math.random()).slice(0, 2);

  // 3. Merge target and decoys, then shuffle
  const choices = [activeTargetObject, ...shuffledDecoys].sort(() => 0.5 - Math.random());

  // 4. Render choice cards
  choices.forEach(obj => {
    const card = document.createElement("div");
    card.className = "object-choice-card";
    
    const emoji = document.createElement("span");
    emoji.className = "choice-emoji";
    emoji.textContent = obj.emoji;
    card.appendChild(emoji);

    const name = document.createElement("span");
    name.className = "choice-name";
    name.textContent = obj.name;
    card.appendChild(name);

    // Click trigger
    const clickHandler = (e) => {
      e.stopPropagation();
      e.preventDefault();
      
      const rect = card.getBoundingClientRect();
      const x = rect.left + rect.width / 2 + window.scrollX;
      const y = rect.top + rect.height / 2 + window.scrollY;

      if (obj.name === activeTargetObject.name) {
        // Correct tap!
        speak(`Excellent! You found the ${obj.name}! ${obj.say}`);
        questionEl.textContent = `⭐ You found it! ⭐`;
        hintEl.textContent = "Perfect! Moving to next...";
        
        spawnChoiceConfetti(x, y);
        
        // Disable choices
        document.querySelectorAll(".object-choice-card").forEach(c => c.style.pointerEvents = "none");
        
        // Next question
        objectsAutoAdvanceTimeout = setTimeout(() => {
          generateNewQuestion();
        }, 3200);
      } else {
        // Incorrect tap!
        card.style.animation = "wobble 0.3s ease-in-out";
        setTimeout(() => card.style.animation = "", 300);
        speak(`Oops! That's the ${obj.name}. Try again! Where is the ${activeTargetObject.name}?`);
      }
    };

    card.addEventListener("mousedown", clickHandler);
    card.addEventListener("touchstart", clickHandler, { passive: false });

    grid.appendChild(card);
  });
}

export function spawnChoiceConfetti(x, y) {
  const colors = ['var(--coral-red)', 'var(--sunny-orange)', 'var(--lime-green)', 'var(--sky-blue)', 'var(--lavender)', '#ffeb3b'];
  for (let i = 0; i < 20; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = `${x}px`;
    confetti.style.top = `${y}px`;
    confetti.style.zIndex = "1000";

    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 110;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - 40; // upward trajectory

    confetti.style.setProperty("--tx", `${tx}px`);
    confetti.style.setProperty("--ty", `${ty}px`);

    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 600);
  }
}

export function cleanupObjectOasis() {
  if (objectsAutoAdvanceTimeout) clearTimeout(objectsAutoAdvanceTimeout);
  activeTargetObject = null;
}
