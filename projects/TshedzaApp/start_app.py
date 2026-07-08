import http.server
import socketserver
import socket
import webbrowser
import os

PORT = 8080
# Serve the directory where this script is located
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
        
    # Disable caching so changes always appear immediately
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # This doesn't actually connect, just routes to find the local IP
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

def start_server():
    # Allow the port to be reused immediately if the script is restarted
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    
    try:
        with socketserver.ThreadingTCPServer(("", PORT), NoCacheHandler) as httpd:
            local_ip = get_local_ip()
            
            print("\n" + "="*55)
            print(" [OK] Tshedza Tracing App is Running!")
            print("="*55)
            print(f"\n [PC] To play on THIS computer, open:")
            print(f"    http://localhost:{PORT}")
            print(f"\n [PHONE/IPAD] To play on a PHONE or IPAD on your Wi-Fi, open:")
            print(f"    http://{local_ip}:{PORT}")
            print("\n [STOP] Press Ctrl+C in this window to stop the server.")
            print("="*55 + "\n")
            
            # Automatically open the browser on the computer
            webbrowser.open(f"http://localhost:{PORT}")
            
            # Keep the server running
            httpd.serve_forever()
            
    except OSError as e:
        if e.errno == 10048 or "Address already in use" in str(e):
            print(f"\n[ERROR] Error: Port {PORT} is already in use.")
            print("Please close any other web servers you have running and try again.")
    except KeyboardInterrupt:
        print("\nShutting down the server. Goodbye!")

if __name__ == "__main__":
    start_server()
