/**
 * ============================================================================
 * Tshedza Playground - Game 7: My Body Parts Identification
 * ============================================================================
 */

import { speak } from '../voice.js';
import { bodyPartsList } from '../constants.js';
import { spawnChoiceConfetti } from './object-oasis.js';

let activeTargetBodyPart = null;
let bodyAutoAdvanceTimeout = null;

export function setupBodyParts() {
  speak("Let's explore body parts! Where are your eyes, hands, and feet?");
  generateNewBodyQuestion();
}

function generateNewBodyQuestion() {
  if (bodyAutoAdvanceTimeout) clearTimeout(bodyAutoAdvanceTimeout);

  const grid = document.getElementById("body-parts-grid");
  const questionEl = document.getElementById("body-question");
  const hintEl = document.getElementById("body-hint");

  grid.innerHTML = "";
  hintEl.textContent = "Tap the correct body part!";

  // 1. Pick target body part
  activeTargetBodyPart = bodyPartsList[Math.floor(Math.random() * bodyPartsList.length)];
  questionEl.textContent = `Can you find the ${activeTargetBodyPart.name}?`;
  speak(`Can you find the ${activeTargetBodyPart.name}?`);

  // 2. Select 2 other decoy body parts
  const decoys = bodyPartsList.filter(part => part.name !== activeTargetBodyPart.name);
  const shuffledDecoys = decoys.sort(() => 0.5 - Math.random()).slice(0, 2);

  // 3. Merge and shuffle choices
  const choices = [activeTargetBodyPart, ...shuffledDecoys].sort(() => 0.5 - Math.random());

  // 4. Render choice cards
  choices.forEach(part => {
    const card = document.createElement("div");
    card.className = "body-choice-card";

    const emoji = document.createElement("span");
    emoji.className = "choice-emoji";
    emoji.textContent = part.emoji;
    card.appendChild(emoji);

    const name = document.createElement("span");
    name.className = "choice-name";
    name.textContent = part.name;
    card.appendChild(name);

    // Click handler
    const clickHandler = (e) => {
      e.stopPropagation();
      e.preventDefault();

      const rect = card.getBoundingClientRect();
      const x = rect.left + rect.width / 2 + window.scrollX;
      const y = rect.top + rect.height / 2 + window.scrollY;

      if (part.name === activeTargetBodyPart.name) {
        // Correct tap!
        speak(`Great job! You found the ${part.name}! ${part.say}`);
        questionEl.textContent = `⭐ Wonderful! ⭐`;
        hintEl.textContent = "Awesome! Moving to next...";

        spawnChoiceConfetti(x, y);

        // Disable choices
        document.querySelectorAll(".body-choice-card").forEach(c => c.style.pointerEvents = "none");

        // Next question
        bodyAutoAdvanceTimeout = setTimeout(() => {
          generateNewBodyQuestion();
        }, 3200);
      } else {
        // Incorrect tap!
        card.style.animation = "wobble 0.3s ease-in-out";
        setTimeout(() => card.style.animation = "", 300);
        speak(`Oops! That's the ${part.name}. Try again! Where is the ${activeTargetBodyPart.name}?`);
      }
    };

    card.addEventListener("mousedown", clickHandler);
    card.addEventListener("touchstart", clickHandler, { passive: false });

    grid.appendChild(card);
  });
}

export function cleanupBodyParts() {
  if (bodyAutoAdvanceTimeout) clearTimeout(bodyAutoAdvanceTimeout);
  activeTargetBodyPart = null;
}
