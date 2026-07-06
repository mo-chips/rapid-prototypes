# ============================================================================
# Tshedza Playground - Studio Voice Generator
# ============================================================================

import os
import sys
import subprocess

# Auto-install gTTS if not present
try:
    from gtts import gTTS
except ImportError:
    print("gTTS library not found. Auto-installing gTTS via pip...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "gtts"])
        from gtts import gTTS
        print("gTTS successfully installed!")
    except Exception as e:
        print("Error: Could not install gTTS automatically. Please run 'pip install gtts' manually.")
        sys.exit(1)

# Ensure audio directory exists
AUDIO_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "audio")
if not os.path.exists(AUDIO_DIR):
    os.makedirs(AUDIO_DIR)
    print(f"Created audio assets directory at {AUDIO_DIR}")

# Master voice database mapping file keys to exact text phrases
phrases = {
  # 1. Global / Welcomes
  "welcome": "Welcome to Tshedza Playground! Let's choose a game and learn together!",
  "magnificent": "Magnificent!",
  "splendid_cheer": "Splendid!",
  "try_again": "Try tracing the letter again.",
  "try_shape": "Try drawing along the dots.",
  "try_number": "Try drawing along the numbers.",
  "oops_wrong_try_again": "Oops! Try again!",

  # 2. Name Tracing Game (Custom Pronunciations Copied Exactly As-Is!)
  "name_intro": "My name is.",
  "name_chad_zah": "My name is Chad zah.",
  "surname_intro": "My surname is.",
  "surname_pronounce": "My surname is Mben ganny.",
  "fullname_pronounce": "My full name is Chad zah Mben ganny.",
  "fantastic": "Fantastic!",

  # Name letters
  "name_T": "T",
  "name_s": "s",
  "name_h": "h",
  "name_e": "e",
  "name_d": "d",
  "name_z": "z",
  "name_a": "a",
  "name_M": "M",
  "name_b": "b",
  "name_n": "n",
  "name_g": "g",
  "name_i": "i",

  # 3. Shape Safari Game
  "prompt_circle": "Let's trace a circle!",
  "prompt_square": "Let's trace a square!",
  "prompt_triangle": "Let's trace a triangle!",
  "prompt_heart": "Let's trace a heart!",
  "prompt_star": "Let's trace a star!",
  "shape_circle": "This is a circle. Let's trace it!",
  "shape_square": "This is a square. Let's trace it!",
  "shape_triangle": "This is a triangle. Let's trace it!",
  "shape_heart": "This is a heart. Let's trace it!",
  "shape_star": "This is a star. Let's trace it!",
  "success_shape_circle": "Wow, you drew a perfect circle!",
  "success_shape_square": "Wow, you drew a perfect square!",
  "success_shape_triangle": "Wow, you drew a perfect triangle!",
  "success_shape_heart": "Wow, you drew a perfect heart!",
  "success_shape_star": "Wow, you drew a perfect star!",

  # 4. Balloon Pop Game Welcomes & Checkpoints
  "balloon_welcome": "Welcome to the Balloon Pop Party! Pop the floating balloons to count them!",
  "pop_milestone_5": "Outstanding! You popped 5 balloons!",
  "pop_milestone_10": "Outstanding! You popped 10 balloons!",
  "pop_milestone_15": "Outstanding! You popped 15 balloons!",
  "pop_milestone_20": "Outstanding! You popped 20 balloons!",
  "pop_milestone_25": "Outstanding! You popped 25 balloons!",
  "pop_milestone_30": "Outstanding! You popped 30 balloons!",
  "pop_milestone_35": "Outstanding! You popped 35 balloons!",
  "pop_milestone_40": "Outstanding! You popped 40 balloons!",
  "pop_milestone_45": "Outstanding! You popped 45 balloons!",
  "pop_milestone_50": "Outstanding! You popped 50 balloons!",

  # 5. Objects Identification Game (Object Oasis)
  "objects_welcome": "Welcome to Object Oasis! Look at the cards and tap the correct item!",
  "objects_wrong": "Oops! Try again! Can you find the correct item?",
  # Objects queries
  "find_Apple": "Can you find the Apple?",
  "find_Ball": "Can you find the Ball?",
  "find_Car": "Can you find the Car?",
  "find_Book": "Can you find the Book?",
  "find_Sun": "Can you find the Sun?",
  "find_Tree": "Can you find the Tree?",
  "find_Star": "Can you find the Star?",
  "find_Cake": "Can you find the Cake?",
  # Correct cheers
  "correct_Apple": "Excellent! You found the Apple!",
  "correct_Ball": "Excellent! You found the Ball!",
  "correct_Car": "Excellent! You found the Car!",
  "correct_Book": "Excellent! You found the Book!",
  "correct_Sun": "Excellent! You found the Sun!",
  "correct_Tree": "Excellent! You found the Tree!",
  "correct_Star": "Excellent! You found the Star!",
  "correct_Cake": "Excellent! You found the Cake!",
  # Descriptions
  "say_Apple": "Apple. A juicy red apple!",
  "say_Ball": "Ball. Let's kick the ball!",
  "say_Car": "Car. Zoom zoom goes the car!",
  "say_Book": "Book. Time to read a story book!",
  "say_Sun": "Sun. The bright yellow sun!",
  "say_Tree": "Tree. A tall green tree!",
  "say_Star": "Star. Twinkle twinkle little star!",
  "say_Cake": "Cake. Yummy sweet cake!",

  # 6. Body Parts Game
  "body_welcome": "Let's explore body parts! Where are your eyes, hands, and feet?",
  # Questions
  "find_Head": "Can you find the Head?",
  "find_Eyes": "Can you find the Eyes?",
  "find_Nose": "Can you find the Nose?",
  "find_Mouth": "Can you find the Mouth?",
  "find_Ears": "Can you find the Ears?",
  "find_Hands": "Can you find the Hands?",
  "find_Feet": "Can you find the Feet?",
  # Correct
  "correct_Head": "Great job! You found the Head!",
  "correct_Eyes": "Great job! You found the Eyes!",
  "correct_Nose": "Great job! You found the Nose!",
  "correct_Mouth": "Great job! You found the Mouth!",
  "correct_Ears": "Great job! You found the Ears!",
  "correct_Hands": "Great job! You found the Hands!",
  "correct_Feet": "Great job! You found the Feet!",
  # Descriptions
  "say_Head": "Head. Nod your head!",
  "say_Eyes": "Eyes. Look around with your eyes!",
  "say_Nose": "Nose. Smell the pretty flowers with your nose!",
  "say_Mouth": "Mouth. Smile big with your mouth!",
  "say_Ears": "Ears. Hear the music with your ears!",
  "say_Hands": "Hands. Clap your hands!",
  "say_Feet": "Feet. Stomp your feet!",

  # 7. Animal Safari Game
  "animals_welcome": "Welcome to the Animal Sound Safari! Tap the animals to hear their sounds and meet them!",
  "say_Lion": "The king of the jungle says Roar!",
  "say_Elephant": "The mighty elephant trumpets!",
  "say_Monkey": "The playful monkey goes ooo ooo aaa aaa!",
  "say_Frog": "The little frog croaks Ribbit Ribbit!",
  "say_Cow": "The friendly cow says Mooo!",
  "say_Cat": "The cute kitty cat says Meow!"
}

# 8. Add Numbers 1-10 Tracing Prompts & Successes
for i in range(1, 11):
    phrases[f"prompt_num_{i}"] = f"Let's trace the number {i}!"
    phrases[f"success_num_{i}"] = f"Splendid! You traced number {i}!"

# 9. Add Alphabet A-Z Prompts & Phonics
letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
phonics_dict = {
  'A': 'A is for Apple.', 'B': 'B is for Butterfly.', 'C': 'C is for Cat.', 'D': 'D is for Dolphin.',
  'E': 'E is for Elephant.', 'F': 'F is for Frog.', 'G': 'G is for Giraffe.', 'H': 'H is for Hippo.',
  'I': 'I is for Iguana.', 'J': 'J is for Jellyfish.', 'K': 'K is for Koala.', 'L': 'L is for Lion.',
  'M': 'M is for Monkey.', 'N': 'N is for Nest.', 'O': 'O is for Octopus.', 'P': 'P is for Penguin.',
  'Q': 'Q is for Queen.', 'R': 'R is for Rainbow.', 'S': 'S is for Sun.', 'T': 'T is for Tiger.',
  'U': 'U is for Umbrella.', 'V': 'V is for Violin.', 'W': 'W is for Whale.', 'X': 'X is for Xylophone.',
  'Y': 'Y is for Yo-Yo.', 'Z': 'Z is for Zebra.'
}

# General Alphabet items
phrases["try_upper"] = "Try tracing the uppercase letter."
phrases["try_lower"] = "Try tracing the lowercase letter."
phrases["success_both"] = "Outstanding! You drew both!"

for char in letters:
    phrases[f"letter_{char}"] = char
    phrases[f"letter_{char.lower()}"] = char.lower()
    phrases[f"prompt_capital_{char}"] = f"Let's trace Capital {char}!"
    phrases[f"prompt_lower_{char}"] = f"Great! Now let's trace lowercase {char.lower()}!"
    phrases[f"success_trace_{char}"] = f"Awesome job tracing {char}!"
    phrases[f"phonic_{char}"] = phonics_dict[char]

# 10. Add Balloon pop integers 1 to 50
for count in range(1, 51):
    phrases[f"count_{count}"] = str(count)

# ============================================================================
# Animal Sound Effect Downloads
# ============================================================================

animal_sounds = {
    "animal_meow": "https://orangefreesounds.com/wp-content/uploads/2023/07/Original-cat-sound-meow.mp3",
    "animal_moo": "https://raw.githubusercontent.com/SixStringsCoder/matching_game/master/audio/animals/cow.mp3",
    "animal_croak": "https://raw.githubusercontent.com/SixStringsCoder/matching_game/master/audio/animals/frog.mp3",
    "animal_trumpet": "https://raw.githubusercontent.com/SixStringsCoder/matching_game/master/audio/animals/elephant.mp3",
    "animal_chatter": "https://demo.twilio.com/hellomonkey/monkey.mp3",
    "animal_roar": "https://orangefreesounds.com/wp-content/uploads/2024/03/Lion-roar-sound-effect.mp3"
}

print("\n" + "="*50)
print(" [Lion] Downloading High-Quality Authentic Animal Sounds...")
print("="*50)

import urllib.request

for filename, url in animal_sounds.items():
    output_path = os.path.join(AUDIO_DIR, f"{filename}.mp3")
    
    if os.path.exists(output_path):
        print(f" Skipping existing animal sound: {filename}.mp3")
        continue

    try:
        print(f" Downloading {filename}.mp3 from {url}...")
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
        )
        with urllib.request.urlopen(req, timeout=15) as response:
            with open(output_path, 'wb') as out_file:
                out_file.write(response.read())
        print(f" Successfully downloaded: {filename}.mp3")
    except Exception as e:
        print(f" Error downloading {filename}.mp3: {e}")

# Start voice synthesis process
total_files = len(phrases)
print("\n" + "="*50)
print(f" [Studio] Beginning generation of {total_files} high-quality studio voices...")
print("="*50)

for idx, (filename, text) in enumerate(phrases.items(), 1):
    output_path = os.path.join(AUDIO_DIR, f"{filename}.mp3")
    
    # Skip if already generated to save network requests and time
    if os.path.exists(output_path):
        print(f"[{idx}/{total_files}] Skipping existing: {filename}.mp3")
        continue

    try:
        # Use English voice, standard slow rate
        tts = gTTS(text=text, lang='en', slow=False)
        tts.save(output_path)
        print(f"[{idx}/{total_files}] Generated: {filename}.mp3 -> '{text}'")
    except Exception as err:
        print(f"[{idx}/{total_files}] Error generating {filename}.mp3: {err}")

print("\n" + "="*50)
print(" [Done] Tshedza Studio Voice & Animal Sound Generation Complete!")
print(f" All files saved successfully in {AUDIO_DIR}")
print("="*50 + "\n")

