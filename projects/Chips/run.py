import uvicorn
import sys
import asyncio
from config import settings

if __name__ == "__main__":
    # Ensure Windows uses ProactorEventLoop to support asynchronous subprocesses
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
        
    print(f"Starting Chips Core on {settings.host}:{settings.port}...")
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=False  # Disable reload on Windows to prevent it from forcing SelectorEventLoop
    )
