import speech_recognition as sr
import time
from config import settings

def listen_and_transcribe(timeout: int = 5) -> str:
    """Listen to the default PC microphone and transcribe it into text.
    
    If it fails to capture or recognize voice, it returns a message describing the failure.
    """
    recognizer = sr.Recognizer()
    device_index = settings.microphone_index
    
    with sr.Microphone(device_index=device_index) as source:
        print("\n[STT] Calibrating for ambient background noise... (please stay quiet)")
        recognizer.adjust_for_ambient_noise(source, duration=1.0)
        
        print(f"[STT] Microphone active. Speak your command now... (listening with {timeout}s timeout)")
        try:
            # Capture voice input
            audio = recognizer.listen(source, timeout=timeout, phrase_time_limit=15)
            print("[STT] Processing speech audio signals...")
            
            # Transcribe audio using Google Speech Recognition
            transcription = recognizer.recognize_google(audio)
            print(f"[STT] Transcribed speech: \"{transcription}\"")
            return transcription
            
        except sr.WaitTimeoutError:
            print("[STT Error] No speech detected (microphone timed out).")
            return "Error: No speech detected."
        except sr.UnknownValueError:
            print("[STT Error] Speech recognition could not understand the audio.")
            return "Error: Could not understand the voice command."
        except sr.RequestError as e:
            print(f"[STT Error] Speech Recognition service connection failed: {str(e)}")
            return "Error: Speech recognition service unavailable."
        except Exception as e:
            print(f"[STT Error] Unexpected audio exception: {str(e)}")
            return f"Error: Failed to record voice ({str(e)})."
