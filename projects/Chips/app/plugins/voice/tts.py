import os
import time
import win32com.client
from gtts import gTTS

def speak(text: str, output_path: str = "output.mp3") -> bool:
    """Convert text to speech, save as MP3, and play it natively on Windows speakers.
    
    Uses standard win32com client interface to control background WMPlayer object.
    Keeps the player object in scope until playback has fully completed.
    """
    # Strip basic markdown elements (like asterisks) before speaking to prevent TTS spelling out formatting
    clean_text = text.replace("**", "").replace("*", "").replace("`", "").strip()
    
    print(f"[TTS] Speaking: \"{clean_text}\"")
    try:
        # Generate MP3 file
        tts = gTTS(text=clean_text, lang='en')
        tts.save(output_path)
        print(f"[TTS] Speech saved to {os.path.abspath(output_path)}")
        
        # Play sound via Windows Media Player Background COM automation
        print("[TTS] Sounding out response over speakers...")
        player = win32com.client.Dispatch("WMPlayer.OCX")
        
        # Configure player settings for active output
        player.settings.mute = False
        player.settings.volume = 100
        
        player.URL = os.path.abspath(output_path)
        player.controls.play()
        
        import pythoncom
        
        # Wait for the player to transition away from loading/undefined states
        start_time = time.time()
        while player.playState in (0, 9, 10) and (time.time() - start_time) < 5.0:
            pythoncom.PumpWaitingMessages()
            time.sleep(0.1)
            
        # Loop until the player transitions into Stopped (1) or MediaEnded (8)
        # We also enforce a 45-second timeout safety guard to prevent infinite hangs
        start_time = time.time()
        while player.playState not in (1, 8) and (time.time() - start_time) < 45.0:
            pythoncom.PumpWaitingMessages()
            time.sleep(0.1)
            
        print("[TTS] Playback completed.")
        return True
    except Exception as e:
        print(f"[TTS Error] Failed to generate or play speech: {str(e)}")
        return False
