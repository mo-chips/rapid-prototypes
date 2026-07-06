import sys
import os
import time
import httpx

# Dynamically append workspace root to sys.path to enable absolute imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))

from app.plugins.voice.stt import listen_and_transcribe
from app.plugins.voice.tts import speak
from config import settings

# REST API Endpoint
CHAT_URL = f"http://{settings.host}:{settings.port}/api/v1/conversations/chat"
HEADERS = {"X-Chips-API-Key": settings.chips_api_key}

def start_wake_word_listener():
    """Runs a continuous wake-word checking loop in low resources mode."""
    print("--------------------------------------------------")
    print("Starting Wake Word Listener client...")
    print("Listening for: \"Chips\"...")
    print("--------------------------------------------------")
    
    # Simulate a loop listening for the trigger phrase
    try:
        while True:
            time.sleep(4)
            print("[WW] Monitoring audio signals...")
            
            # Simulated wake word detection event
            print("[WW] Wake word \"Chips\" DETECTED!")
            
            # 1. Listen to user command
            prompt = listen_and_transcribe()
            
            # If microphone failed or timed out, report locally and skip API call
            if prompt.startswith("Error:"):
                print(f"[WW] Transcription skipped: {prompt}")
                speak(prompt)
                print("[WW] Resuming monitoring loop...\n")
                continue
            
            # Remove "Chips" prefix if spoken
            clean_prompt = prompt.replace("Chips,", "").strip()
            
            # 2. Call API-first Core backend with streaming response
            print(f"[WW] Dispatching request to Core API (Streaming): {clean_prompt}")
            try:
                import json
                stream_url = f"http://{settings.host}:{settings.port}/api/v1/conversations/chat/stream"
                buffered_response = []
                
                with httpx.Client() as client:
                    with client.stream(
                        "POST",
                        stream_url,
                        json={"session_id": "wake-word-session", "message": clean_prompt},
                        headers=HEADERS,
                        timeout=180.0
                    ) as response:
                        if response.status_code == 200:
                            print("[WW] Core response: ", end="", flush=True)
                            for line in response.iter_lines():
                                if not line.strip():
                                    continue
                                
                                if line.startswith("data: "):
                                    chunk_data = line[6:]
                                    try:
                                        payload = json.loads(chunk_data)
                                        status = payload.get("status")
                                        
                                        if status == "streaming":
                                            chunk = payload.get("chunk", "")
                                            print(chunk, end="", flush=True)
                                            buffered_response.append(chunk)
                                        elif status == "requires_confirmation":
                                            token = payload.get("pending_token")
                                            print(f"\n[WW Security] Action requires confirmation. Token: {token}")
                                            break
                                    except json.JSONDecodeError:
                                        pass
                            print()  # Final newline after stream completes
                            
                            response_text = "".join(buffered_response).strip()
                            if response_text:
                                # 3. Speak the response out
                                speak(response_text)
                        else:
                            print(f"[WW API Error] Server returned code {response.status_code}")
            except Exception as e:
                print(f"[WW Connection Error] Could not connect to Core API: {str(e)}")
                
            # Sleep before next listening cycle
            print("[WW] Resuming monitoring loop...\n")
            break # Break loop after single execution cycle for testing/demonstration purposes
    except KeyboardInterrupt:
        print("[WW] Wake word listener stopped.")

if __name__ == "__main__":
    start_wake_word_listener()
