/**
 * ============================================================================
 * Tshedza Playground - Hybrid Voice Text-to-Speech Engine
 * ============================================================================
 */

let activeAudio = null;

// Clean text normalization mapping
const audioMap = {
  // Global & General
  "welcome to tshedza playground! let's choose a game and learn together!": "welcome",
  "magnificent!": "magnificent",
  "splendid!": "splendid_cheer",
  "try tracing the letter again.": "try_again",
  "try drawing along the dots.": "try_shape",
  "try drawing along the numbers.": "try_number",
  "oops! try again!": "oops_wrong_try_again",

  // Name Tracing
  "my name is.": "name_intro",
  "my name is chad zah.": "name_chad_zah",
  "my surname is.": "surname_intro",
  "my surname is mben ganny.": "surname_pronounce",
  "my full name is chad zah mben ganny.": "fullname_pronounce",
  "fantastic!": "fantastic",
  
  // Name letters
  "t": "name_T",
  "s": "name_s",
  "h": "name_h",
  "e": "name_e",
  "d": "name_d",
  "z": "name_z",
  "a": "name_a",
  "m": "name_M",
  "b": "name_b",
  "n": "name_n",
  "g": "name_g",
  "i": "name_i",

  // Balloon Pop Party
  "welcome to the balloon pop party! pop the floating balloons to count them!": "balloon_welcome",
  "outstanding! you popped 5 balloons!": "pop_milestone_5",
  "outstanding! you popped 10 balloons!": "pop_milestone_10",
  "outstanding! you popped 15 balloons!": "pop_milestone_15",
  "outstanding! you popped 20 balloons!": "pop_milestone_20",
  "outstanding! you popped 25 balloons!": "pop_milestone_25",
  "outstanding! you popped 30 balloons!": "pop_milestone_30",
  "outstanding! you popped 35 balloons!": "pop_milestone_35",
  "outstanding! you popped 40 balloons!": "pop_milestone_40",
  "outstanding! you popped 45 balloons!": "pop_milestone_45",
  "outstanding! you popped 50 balloons!": "pop_milestone_50",

  // Objects Game
  "welcome to object oasis! look at the cards and tap the correct item!": "objects_welcome",
  "oops! try again! can you find the correct item?": "objects_wrong",
  "can you find the apple?": "find_Apple",
  "can you find the ball?": "find_Ball",
  "can you find the car?": "find_Car",
  "can you find the book?": "find_Book",
  "can you find the sun?": "find_Sun",
  "can you find the tree?": "find_Tree",
  "can you find the star?": "find_Star",
  "can you find the cake?": "find_Cake",
  "excellent! you found the apple!": "correct_Apple",
  "excellent! you found the ball!": "correct_Ball",
  "excellent! you found the car!": "correct_Car",
  "excellent! you found the book!": "correct_Book",
  "excellent! you found the sun!": "correct_Sun",
  "excellent! you found the tree!": "correct_Tree",
  "excellent! you found the star!": "correct_Star",
  "excellent! you found the cake!": "correct_Cake",
  "apple. a juicy red apple!": "say_Apple",
  "ball. let's kick the ball!": "say_Ball",
  "car. zoom zoom goes the car!": "say_Car",
  "book. time to read a story book!": "say_Book",
  "sun. the bright yellow sun!": "say_Sun",
  "tree. a tall green tree!": "say_Tree",
  "star. twinkle twinkle little star!": "say_Star",
  "cake. yummy sweet cake!": "say_Cake",

  // Body parts game
  "let's explore body parts! where are your eyes, hands, and feet?": "body_welcome",
  "can you find the head?": "find_Head",
  "can you find the eyes?": "find_Eyes",
  "can you find the nose?": "find_Nose",
  "can you find the mouth?": "find_Mouth",
  "can you find the ears?": "find_Ears",
  "can you find the hands?": "find_Hands",
  "can you find the feet?": "find_Feet",
  "great job! you found the head!": "correct_Head",
  "great job! you found the eyes!": "correct_Eyes",
  "great job! you found the nose!": "correct_Nose",
  "great job! you found the mouth!": "correct_Mouth",
  "great job! you found the ears!": "correct_Ears",
  "great job! you found the hands!": "correct_Hands",
  "great job! you found the feet!": "correct_Feet",
  "head. nod your head!": "say_Head",
  "eyes. look around with your eyes!": "say_Eyes",
  "nose. smell the pretty flowers with your nose!": "say_Nose",
  "mouth. smile big with your mouth!": "say_Mouth",
  "ears. hear the music with your ears!": "say_Ears",
  "hands. clap your hands!": "say_Hands",
  "feet. stomp your feet!": "say_Feet",

  // Animals game
  "welcome to the animal sound safari! tap the animals to hear their sounds and meet them!": "animals_welcome",
  "the king of the jungle says roar!": "say_Lion",
  "the mighty elephant trumpets!": "say_Elephant",
  "the playful monkey goes ooo ooo aaa aaa!": "say_Monkey",
  "the little frog croaks ribbit ribbit!": "say_Frog",
  "the friendly cow says mooo!": "say_Cow",
  "the cute kitty cat says meow!": "say_Cat",

  // Alphabet details
  "try tracing the uppercase letter.": "try_upper",
  "try tracing the lowercase letter.": "try_lower",
  "outstanding! you drew both!": "success_both"
};

// ============================================================================
// DYNAMIC COMPILATION OF CODES
// ============================================================================

// Dynamically compile digits 1-10 tracing dialogs
for (let i = 1; i <= 10; i++) {
  audioMap[`let's trace the number ${i}!`] = `prompt_num_${i}`;
  audioMap[`splendid! you traced number ${i}!`] = `success_num_${i}`;
}

// Dynamically compile popping counts 1-50
for (let i = 1; i <= 50; i++) {
  audioMap[String(i)] = `count_${i}`;
}

// Dynamically compile A-Z uppercase and lowercase lines
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const phonicsDictLocal = {
  'A': 'A is for Apple.', 'B': 'B is for Butterfly.', 'C': 'C is for Cat.', 'D': 'D is for Dolphin.',
  'E': 'E is for Elephant.', 'F': 'F is for Frog.', 'G': 'G is for Giraffe.', 'H': 'H is for Hippo.',
  'I': 'I is for Iguana.', 'J': 'J is for Jellyfish.', 'K': 'K is for Koala.', 'L': 'L is for Lion.',
  'M': 'M is for Monkey.', 'N': 'N is for Nest.', 'O': 'O is for Octopus.', 'P': 'P is for Penguin.',
  'Q': 'Q is for Queen.', 'R': 'R is for Rainbow.', 'S': 'S is for Sun.', 'T': 'T is for Tiger.',
  'U': 'U is for Umbrella.', 'V': 'V is for Violin.', 'W': 'W is for Whale.', 'X': 'X is for Xylophone.',
  'Y': 'Y is for Yo-Yo.', 'Z': 'Z is for Zebra.'
};

for (let char of letters) {
  audioMap[char.toLowerCase()] = `letter_${char.toLowerCase()}`;
  audioMap[char] = `letter_${char}`;
  audioMap[`let's trace capital ${char}!`] = `prompt_capital_${char}`;
  audioMap[`great! now let's trace lowercase ${char.toLowerCase()}!`] = `prompt_lower_${char}`;
  audioMap[`awesome job tracing ${char}!`] = `success_trace_${char}`;
  if (phonicsDictLocal[char]) {
    audioMap[phonicsDictLocal[char].toLowerCase()] = `phonic_${char}`;
  }
}

/**
 * Speaks text using pre-recorded expressive studio MP3 files.
 * @param {string|null} text - The text to speak.
 */
export function speak(text) {
  if (!text) return;

  // Clean and normalize text search keys
  const cleanText = text.trim().toLowerCase();
  const audioKey = audioMap[cleanText];

  if (audioKey) {
    if (activeAudio) {
      activeAudio.pause();
      activeAudio = null;
    }

    const audioPath = `./audio/${audioKey}.mp3`;
    activeAudio = new Audio(audioPath);

    activeAudio.onerror = () => {
      console.warn(`[Audio] Asset not found: ${audioPath}`);
    };

    activeAudio.play().catch((err) => {
      console.warn(`[Audio] Autoplay blocked or failed on ${audioPath}`, err);
    });
  } else {
    console.warn(`[Audio] No audio mapping found for text: "${text}"`);
  }
}

/**
 * Stops any currently playing audio.
 */
export function stopSpeech() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio = null;
  }
}
