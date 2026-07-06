/**
 * ============================================================================
 * Tshedza Playground - Game 8: Animal Sound Safari
 * ============================================================================
 */

import { speak } from '../voice.js';
import { animalsList } from '../constants.js';
import { spawnChoiceConfetti } from './object-oasis.js';

export function setupAnimalSafari() {
  speak("Welcome to the Animal Sound Safari! Tap the animals to hear their sounds and meet them!");

  const layout = document.getElementById("animals-grid-layout");
  layout.innerHTML = "";

  animalsList.forEach(animal => {
    const card = document.createElement("div");
    card.className = "animal-choice-card";

    const emoji = document.createElement("span");
    emoji.className = "choice-emoji";
    emoji.textContent = animal.emoji;
    card.appendChild(emoji);

    const name = document.createElement("span");
    name.className = "choice-name";
    name.textContent = animal.name;
    card.appendChild(name);

    // Tap/Click interaction
    const tapHandler = (e) => {
      e.stopPropagation();
      e.preventDefault();

      // Trigger bouncy animation
      card.style.transform = "scale(0.9) rotate(-3deg)";
      setTimeout(() => card.style.transform = "", 150);

      const rect = card.getBoundingClientRect();
      const x = rect.left + rect.width / 2 + window.scrollX;
      const y = rect.top + rect.height / 2 + window.scrollY;

      // 1. Play real animal sound with procedural fallback!
      playAnimalSound(animal.sound);

      // 2. Play confetti burst!
      spawnChoiceConfetti(x, y);

      // 3. Play voice intro
      speak(animal.say);
    };

    card.addEventListener("mousedown", tapHandler);
    card.addEventListener("touchstart", tapHandler, { passive: false });

    layout.appendChild(card);
  });
}

/**
 * Hybrid real animal sound effect player.
 * Attempts to play high-quality downloaded audio, falling back seamlessly
 * to standard procedural synthesis on any loading/playing errors.
 * @param {string} soundName - Sound ID to play.
 */
function playAnimalSound(soundName) {
  const audioPath = `./audio/animal_${soundName}.mp3`;
  const audio = new Audio(audioPath);

  audio.onerror = () => {
    console.warn(`[Animal Sound] Recording not found: ${audioPath}. Falling back to procedural synth.`);
    playAnimalSynthSound(soundName);
  };

  audio.play().catch(err => {
    console.warn(`[Animal Sound] Autoplay blocked or failed for ${audioPath}. Falling back to procedural synth.`, err);
    playAnimalSynthSound(soundName);
  });
}

/**
 * Procedural Synthesizer for safari animal noises using Web Audio API oscillators.
 * @param {string} soundName - Sound ID to play.
 */
function playAnimalSynthSound(soundName) {
  if (!window.AudioContext && !window.webkitAudioContext) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    if (soundName === 'meow') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(620, audioCtx.currentTime + 0.15);
      osc.frequency.exponentialRampToValueAtTime(360, audioCtx.currentTime + 0.4);
      
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } 
    else if (soundName === 'moo') {
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc1.type = "sawtooth";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(105, audioCtx.currentTime);
      osc1.frequency.linearRampToValueAtTime(90, audioCtx.currentTime + 0.6);
      osc2.frequency.setValueAtTime(105, audioCtx.currentTime);
      osc2.frequency.linearRampToValueAtTime(90, audioCtx.currentTime + 0.6);
      
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);
      osc1.start();
      osc2.start();
      osc1.stop(audioCtx.currentTime + 0.6);
      osc2.stop(audioCtx.currentTime + 0.6);
    }
    else if (soundName === 'croak') {
      const duration = 0.4;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      
      lfo.frequency.value = 24; 
      lfoGain.gain.value = 80;
      
      osc.type = "sawtooth";
      osc.frequency.value = 130;
      
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      lfo.start();
      osc.start();
      lfo.stop(audioCtx.currentTime + duration);
      osc.stop(audioCtx.currentTime + duration);
    }
    else if (soundName === 'chatter') {
      const now = audioCtx.currentTime;
      for (let i = 0; i < 4; i++) {
        const t = now + i * 0.12;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(950, t);
        osc.frequency.exponentialRampToValueAtTime(1650, t + 0.08);
        
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.2, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.1);
      }
    }
    else if (soundName === 'roar') {
      const osc = audioCtx.createOscillator();
      const oscMod = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(80, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(45, audioCtx.currentTime + 0.7);
      
      oscMod.type = "sawtooth";
      oscMod.frequency.value = 40; 
      
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.35, audioCtx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.7);
      
      oscMod.connect(gain.gain);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      oscMod.start();
      osc.start();
      oscMod.stop(audioCtx.currentTime + 0.7);
      osc.stop(audioCtx.currentTime + 0.7);
    }
    else if (soundName === 'trumpet') {
      const osc = audioCtx.createOscillator();
      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      const gain = audioCtx.createGain();
      
      lfo.frequency.value = 16; 
      lfoGain.gain.value = 20;
      
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(420, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(620, audioCtx.currentTime + 0.1);
      osc.frequency.linearRampToValueAtTime(480, audioCtx.currentTime + 0.65);
      
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.65);
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      lfo.start();
      osc.start();
      lfo.stop(audioCtx.currentTime + 0.65);
      osc.stop(audioCtx.currentTime + 0.65);
    }
  } catch (err) {
    console.error("Audio animal synth failed: ", err);
  }
}

export function cleanupAnimalSafari() {
  // Safe cleanup
}
