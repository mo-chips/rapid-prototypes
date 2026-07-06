import sys
import asyncio
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware

# Set ProactorEventLoop on Windows to support async subprocess execution
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from app.memory.db import init_db
from app.api.conversations import router as conversations_router
from app.api.commands import router as commands_router
from app.api.memory import router as memory_router
from app.api.system import router as system_router
from app.api.integrations import router as integrations_router

# Initialize FastAPI App
app = FastAPI(
    title="Chips Core",
    description="API-First Personal Assistant Platform centered around Gemini CLI.",
    version="1.0.0"
)

# Enable CORS for frontend/dashboard access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Run migrations/table creation on startup
@app.on_event("startup")
def startup_event():
    import asyncio
    import sys
    print("ACTIVE EVENT LOOP TYPE:", type(asyncio.get_event_loop()), file=sys.stderr, flush=True)
    init_db()

# Main Router Prefix
api_router = APIRouter(prefix="/api/v1")
api_router.include_router(conversations_router)
api_router.include_router(commands_router)
api_router.include_router(memory_router)
api_router.include_router(system_router)
api_router.include_router(integrations_router)

app.include_router(api_router)
