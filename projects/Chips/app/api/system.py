import psutil
import time
from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter(prefix="", tags=["System"])

START_TIME = time.time()

@router.get("/status")
async def get_status() -> Dict[str, Any]:
    """Retrieve system diagnostics, resource utilization, and uptime metrics."""
    return {
        "status": "online",
        "uptime_seconds": int(time.time() - START_TIME),
        "cpu_usage_percent": psutil.cpu_percent(interval=None),
        "memory_usage_percent": psutil.virtual_memory().percent,
        "memory_available_gb": round(psutil.virtual_memory().available / (1024 ** 3), 2),
        "disk_usage_percent": psutil.disk_usage('.').percent
    }

@router.get("/health")
async def get_health() -> Dict[str, Any]:
    """Simple health check endpoint for monitoring tools."""
    return {
        "status": "healthy",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
