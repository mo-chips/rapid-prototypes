/**
 * ============================================================================
 * Tshedza Playground - Coordinate Constants & Datasets (Expanded)
 * ============================================================================
 */

// Original specific character sets for "Tshedza Mbengeni"
export const originalLetterDots = {
  'T': [[100, 50, true], [200, 50, false], [150, 50, true], [150, 220, false]],
  's': [[180, 140, true], [150, 120, false], [120, 140, false], [150, 170, false], [180, 190, false], [150, 220, false], [120, 200, false]],
  'h': [[120, 50, true], [120, 220, false], [120, 150, true], [150, 120, false], [180, 150, false], [180, 220, false]],
  'e': [[120, 170, true], [180, 170, false], [180, 140, false], [150, 120, false], [120, 140, false], [120, 200, false], [150, 220, false], [180, 200, false]],
  'd': [[180, 50, true], [180, 220, false], [180, 170, true], [150, 120, false], [120, 150, false], [120, 190, false], [150, 220, false], [180, 190, false]],
  'z': [[120, 140, true], [180, 140, false], [120, 220, false], [180, 220, false]],
  'a': [[180, 140, true], [150, 120, false], [120, 150, false], [120, 190, false], [150, 220, false], [180, 190, false], [180, 140, true], [180, 220, false]],
  'M': [[100, 220, true], [100, 50, false], [150, 150, false], [200, 50, false], [200, 220, false]],
  'b': [[120, 50, true], [120, 220, false], [120, 170, true], [150, 120, false], [180, 150, false], [180, 190, false], [150, 220, false], [120, 190, false]],
  'n': [[120, 120, true], [120, 220, false], [120, 150, true], [150, 120, false], [180, 150, false], [180, 220, false]],
  'g': [[180, 140, true], [150, 120, false], [120, 150, false], [120, 190, false], [150, 220, false], [180, 190, false], [180, 140, true], [180, 270, false], [150, 290, false], [120, 270, false]],
  'i': [[150, 120, true], [150, 220, false], [150, 80, true], [150, 85, false]]
};

// Complete Alphabet Coordinate Paths (Uppercase) centered on a 300x300 canvas
export const alphabetPaths = {
  'A': [[90, 220, true], [150, 60, false], [210, 220, false], [120, 150, true], [180, 150, false]],
  'B': [[100, 60, true], [100, 220, false], [100, 60, true], [170, 60, false], [170, 130, false], [100, 130, false], [100, 130, true], [180, 130, false], [180, 220, false], [100, 220, false]],
  'C': [[200, 80, true], [140, 60, false], [100, 100, false], [100, 180, false], [140, 220, false], [200, 200, false]],
  'D': [[100, 60, true], [100, 220, false], [100, 60, true], [180, 60, false], [180, 140, false], [180, 220, false], [100, 220, false]],
  'E': [[100, 60, true], [100, 220, false], [100, 60, true], [180, 60, false], [100, 140, true], [170, 140, false], [100, 220, true], [180, 220, false]],
  'F': [[100, 60, true], [100, 220, false], [100, 60, true], [180, 60, false], [100, 140, true], [170, 140, false]],
  'G': [[200, 80, true], [140, 60, false], [100, 100, false], [100, 180, false], [140, 220, false], [200, 220, false], [200, 150, false], [160, 150, false]],
  'H': [[100, 60, true], [100, 220, false], [200, 60, true], [200, 220, false], [100, 140, true], [200, 140, false]],
  'I': [[150, 60, true], [150, 220, false], [110, 60, true], [190, 60, false], [110, 220, true], [190, 220, false]],
  'J': [[110, 60, true], [190, 60, false], [150, 60, true], [150, 190, false], [130, 220, false], [90, 200, false]],
  'K': [[100, 60, true], [100, 220, false], [180, 60, true], [100, 140, false], [100, 140, true], [180, 220, false]],
  'L': [[100, 60, true], [100, 220, false], [180, 220, false]],
  'M': [[80, 220, true], [80, 60, false], [150, 150, false], [220, 60, false], [220, 220, false]],
  'N': [[90, 220, true], [90, 60, false], [190, 220, false], [190, 60, true], [190, 220, false]],
  'O': [[150, 60, true], [100, 100, false], [100, 180, false], [150, 220, false], [200, 180, false], [200, 100, false], [150, 60, false]],
  'P': [[100, 60, true], [100, 220, false], [100, 60, true], [185, 60, false], [185, 140, false], [100, 140, false]],
  'Q': [[150, 60, true], [100, 100, false], [100, 180, false], [150, 220, false], [200, 180, false], [200, 100, false], [150, 60, false], [170, 180, true], [210, 220, false]],
  'R': [[100, 60, true], [100, 220, false], [100, 60, true], [185, 60, false], [185, 140, false], [100, 140, false], [100, 140, true], [190, 220, false]],
  'S': [[190, 80, true], [150, 60, false], [110, 90, false], [150, 130, false], [190, 170, false], [150, 220, false], [110, 200, false]],
  'T': [[100, 60, true], [200, 60, false], [150, 60, true], [150, 220, false]],
  'U': [[90, 60, true], [90, 180, false], [150, 220, false], [210, 180, false], [210, 60, false]],
  'V': [[90, 60, true], [150, 220, false], [210, 60, false]],
  'W': [[70, 60, true], [110, 220, false], [150, 120, false], [190, 220, false], [230, 60, false]],
  'X': [[80, 60, true], [220, 220, false], [220, 60, true], [80, 220, false]],
  'Y': [[80, 60, true], [150, 130, false], [220, 60, true], [150, 130, false], [150, 130, true], [150, 220, false]],
  'Z': [[90, 60, true], [210, 60, false], [90, 220, false], [210, 220, false]]
};

// Lowercase coordinate paths (a-z)
export const lowercasePaths = {
  'a': [[180, 140, true], [150, 120, false], [120, 150, false], [120, 190, false], [150, 220, false], [180, 190, false], [180, 140, true], [180, 220, false]],
  'b': [[120, 50, true], [120, 220, false], [120, 170, true], [150, 120, false], [180, 150, false], [180, 190, false], [150, 220, false], [120, 190, false]],
  'c': [[180, 140, true], [150, 120, false], [120, 150, false], [120, 190, false], [150, 220, false], [180, 200, false]],
  'd': [[180, 50, true], [180, 220, false], [180, 170, true], [150, 120, false], [120, 150, false], [120, 190, false], [150, 220, false], [180, 190, false]],
  'e': [[120, 170, true], [180, 170, false], [180, 140, false], [150, 120, false], [120, 140, false], [120, 200, false], [150, 220, false], [180, 200, false]],
  'f': [[170, 70, true], [140, 50, false], [140, 220, false], [110, 120, true], [170, 120, false]],
  'g': [[180, 140, true], [150, 120, false], [120, 150, false], [120, 190, false], [150, 220, false], [180, 190, false], [180, 140, true], [180, 270, false], [150, 290, false], [120, 270, false]],
  'h': [[120, 50, true], [120, 220, false], [120, 150, true], [150, 120, false], [180, 150, false], [180, 220, false]],
  'i': [[150, 120, true], [150, 220, false], [150, 80, true], [150, 85, false]],
  'j': [[160, 120, true], [160, 240, false], [130, 270, false], [100, 250, false], [160, 80, true], [160, 85, false]],
  'k': [[120, 50, true], [120, 220, false], [175, 120, true], [120, 170, false], [120, 170, true], [180, 220, false]],
  'l': [[150, 50, true], [150, 220, false]],
  'm': [[100, 120, true], [100, 220, false], [100, 150, true], [125, 120, false], [150, 150, false], [150, 220, false], [150, 150, true], [175, 120, false], [200, 150, false], [200, 220, false]],
  'n': [[120, 120, true], [120, 220, false], [120, 150, true], [150, 120, false], [180, 150, false], [180, 220, false]],
  'o': [[150, 120, true], [120, 150, false], [120, 190, false], [150, 220, false], [180, 190, false], [180, 150, false], [150, 120, false]],
  'p': [[120, 120, true], [120, 270, false], [120, 160, true], [150, 120, false], [185, 150, false], [185, 190, false], [150, 220, false], [120, 190, false]],
  'q': [[180, 120, true], [180, 270, false], [180, 160, true], [150, 120, false], [120, 150, false], [120, 190, false], [150, 220, false], [180, 190, false]],
  'r': [[120, 120, true], [120, 220, false], [120, 160, true], [150, 130, false], [180, 140, false]],
  's': [[180, 140, true], [150, 120, false], [120, 140, false], [150, 170, false], [180, 190, false], [150, 220, false], [120, 200, false]],
  't': [[140, 70, true], [140, 200, false], [160, 220, false], [110, 120, true], [170, 120, false]],
  'u': [[120, 120, true], [120, 190, false], [150, 220, false], [180, 190, false], [180, 120, true], [180, 220, false]],
  'v': [[120, 120, true], [150, 220, false], [180, 120, false]],
  'w': [[110, 120, true], [130, 220, false], [150, 170, false], [170, 220, false], [190, 120, false]],
  'x': [[125, 120, true], [175, 220, false], [175, 120, true], [125, 220, false]],
  'y': [[120, 120, true], [120, 180, false], [150, 220, false], [180, 180, false], [180, 120, true], [180, 260, false], [150, 290, false]],
  'z': [[120, 140, true], [180, 140, false], [120, 220, false], [180, 220, false]]
};

// Complete Number Paths (1-10)
export const numberPaths = {
  '1': [[120, 100, true], [150, 70, false], [150, 220, false], [110, 220, true], [190, 220, false]],
  '2': [[110, 100, true], [150, 60, false], [190, 100, false], [110, 220, false], [190, 220, false]],
  '3': [[110, 80, true], [150, 60, false], [190, 85, false], [150, 130, false], [190, 175, false], [150, 220, false], [110, 200, false]],
  '4': [[170, 60, true], [100, 150, false], [200, 150, false], [170, 100, true], [170, 220, false]],
  '5': [[180, 70, true], [120, 70, false], [120, 140, false], [180, 140, false], [180, 210, false], [110, 210, false]],
  '6': [[180, 80, true], [120, 140, false], [120, 210, false], [180, 210, false], [180, 150, false], [120, 150, false]],
  '7': [[100, 70, true], [200, 70, false], [120, 220, false]],
  '8': [[150, 140, true], [110, 100, false], [150, 60, false], [190, 100, false], [150, 140, false], [110, 180, false], [150, 220, false], [190, 180, false], [150, 140, false]],
  '9': [[180, 130, true], [120, 130, false], [120, 70, false], [180, 70, false], [180, 210, false], [130, 220, false]],
  '10': [[90, 90, true], [110, 70, false], [110, 220, false], [180, 70, true], [150, 100, false], [150, 190, false], [180, 220, false], [210, 190, false], [210, 100, false], [180, 70, false]]
};

// Objects Identification Game Database
export const objectsList = [
  { name: 'Apple', emoji: '🍎', say: 'Apple. A juicy red apple!' },
  { name: 'Ball', emoji: '⚽', say: 'Ball. Let\'s kick the ball!' },
  { name: 'Car', emoji: '🚗', say: 'Car. Zoom zoom goes the car!' },
  { name: 'Book', emoji: '📚', say: 'Book. Time to read a story book!' },
  { name: 'Sun', emoji: '☀️', say: 'Sun. The bright yellow sun!' },
  { name: 'Tree', emoji: '🌳', say: 'Tree. A tall green tree!' },
  { name: 'Star', emoji: '⭐', say: 'Star. Twinkle twinkle little star!' },
  { name: 'Cake', emoji: '🍰', say: 'Cake. Yummy sweet cake!' }
];

// Animals Identification Safari Database
export const animalsList = [
  { name: 'Lion', emoji: '🦁', sound: 'roar', say: 'The king of the jungle says Roar!' },
  { name: 'Elephant', emoji: '🐘', sound: 'trumpet', say: 'The mighty elephant trumpets!' },
  { name: 'Monkey', emoji: '🐵', sound: 'chatter', say: 'The playful monkey goes ooo ooo aaa aaa!' },
  { name: 'Frog', emoji: '🐸', sound: 'croak', say: 'The little frog croaks Ribbit Ribbit!' },
  { name: 'Cow', emoji: '🐮', sound: 'moo', say: 'The friendly cow says Mooo!' },
  { name: 'Cat', emoji: '🐱', sound: 'meow', say: 'The cute kitty cat says Meow!' }
];

// Body Parts Identification Database
export const bodyPartsList = [
  { name: 'Head', emoji: '🙆', say: 'Head. Nod your head!' },
  { name: 'Eyes', emoji: '👀', say: 'Eyes. Look around with your eyes!' },
  { name: 'Nose', emoji: '👃', say: 'Nose. Smell the pretty flowers with your nose!' },
  { name: 'Mouth', emoji: '👄', say: 'Mouth. Smile big with your mouth!' },
  { name: 'Ears', emoji: '👂', say: 'Ears. Hear the music with your ears!' },
  { name: 'Hands', emoji: '🙌', say: 'Hands. Clap your hands!' },
  { name: 'Feet', emoji: '👣', say: 'Feet. Stomp your feet!' }
];

// Complete phonic dictionary
export const phonicsDict = {
  'A': 'A is for Apple.', 'B': 'B is for Butterfly.', 'C': 'C is for Cat.', 'D': 'D is for Dolphin.',
  'E': 'E is for Elephant.', 'F': 'F is for Frog.', 'G': 'G is for Giraffe.', 'H': 'H is for Hippo.',
  'I': 'I is for Iguana.', 'J': 'J is for Jellyfish.', 'K': 'K is for Koala.', 'L': 'L is for Lion.',
  'M': 'M is for Monkey.', 'N': 'N is for Nest.', 'O': 'O is for Octopus.', 'P': 'P is for Penguin.',
  'Q': 'Q is for Queen.', 'R': 'R is for Rainbow.', 'S': 'S is for Sun.', 'T': 'T is for Tiger.',
  'U': 'U is for Umbrella.', 'V': 'V is for Violin.', 'W': 'W is for Whale.', 'X': 'X is for Xylophone.',
  'Y': 'Y is for Yo-Yo.', 'Z': 'Z is for Zebra.'
};

// Shapes Coordinate Vector Paths
export const shapePaths = {
  'circle': (() => {
    const path = [];
    const radius = 80;
    const cx = 150, cy = 150;
    const steps = 18;
    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      path.push([x, y, i === 0]);
    }
    return path;
  })(),
  'square': [
    [70, 70, true],
    [230, 70, false],
    [230, 230, false],
    [70, 230, false],
    [70, 70, false]
  ],
  'triangle': [
    [150, 60, true],
    [240, 220, false],
    [60, 220, false],
    [150, 60, false]
  ],
  'heart': [
    [150, 110, true],
    [170, 90, false],
    [200, 80, false],
    [230, 100, false],
    [240, 130, false],
    [230, 160, false],
    [190, 195, false],
    [150, 230, false],
    [110, 195, false],
    [70, 160, false],
    [60, 130, false],
    [70, 100, false],
    [100, 80, false],
    [130, 90, false],
    [150, 110, false]
  ],
  'star': [
    [150, 50, true],
    [179, 111, false],
    [246, 121, false],
    [197, 168, false],
    [209, 235, false],
    [150, 203, false],
    [91, 235, false],
    [103, 168, false],
    [54, 121, false],
    [121, 111, false],
    [150, 50, false]
  ]
};

// Name Tracing steps list
export const nameTracingSteps = [
  { text: "This is your name", value: "", say: "My name is.", traceLetter: null },
  { text: "T", value: "T", say: "T", traceLetter: 'T' },
  { text: "s", value: "Ts", say: "s", traceLetter: 's' },
  { text: "h", value: "Tsh", say: "h", traceLetter: 'h' },
  { text: "e", value: "Tshe", say: "e", traceLetter: 'e' },
  { text: "d", value: "Tshed", say: "d", traceLetter: 'd' },
  { text: "z", value: "Tshedz", say: "z", traceLetter: 'z' },
  { text: "a", value: "Tshedza", say: "a", traceLetter: 'a' },
  { text: "Tshedza", value: "Tshedza", say: "My name is Chad zah.", traceLetter: null },
  { text: "This is your surname", value: "Tshedza ", say: "My surname is.", traceLetter: null },
  { text: "M", value: "Tshedza M", say: "M", traceLetter: 'M' },
  { text: "b", value: "Tshedza Mb", say: "b", traceLetter: 'b' },
  { text: "e", value: "Tshedza Mbe", say: "e", traceLetter: 'e' },
  { text: "n", value: "Tshedza Mben", say: "n", traceLetter: 'n' },
  { text: "g", value: "Tshedza Mbeng", say: "g", traceLetter: 'g' },
  { text: "e", value: "Tshedza Mbenge", say: "e", traceLetter: 'e' },
  { text: "n", value: "Tshedza Mbengen", say: "n", traceLetter: 'n' },
  { text: "i", value: "Tshedza Mbengeni", say: "i", traceLetter: 'i' },
  { text: "Mbengeni", value: "Tshedza Mbengeni", say: "My surname is Mben ganny.", traceLetter: null },
  { text: "Tshedza Mbengeni", value: "Tshedza Mbengeni", say: "My full name is Chad zah Mben ganny.", traceLetter: null },
  { text: "Well done!", value: "Tshedza Mbengeni", say: null, traceLetter: null }
];
