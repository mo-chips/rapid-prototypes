from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.responses import StreamingResponse
from typing import List, Dict, Any
from app.core.coordinator import CoreCoordinator
from app.memory.short_term import get_sessions, get_session_messages
from app.security.auth import verify_api_key

router = APIRouter(prefix="/conversations", tags=["Conversations"])
coordinator = CoreCoordinator()

class ChatRequest:
    session_id: str
    message: str

@router.post("/chat", dependencies=[Depends(verify_api_key)])
async def chat(payload: Dict[str, str] = Body(...)):
    session_id = payload.get("session_id")
    message = payload.get("message")
    if not session_id or not message:
        raise HTTPException(status_code=400, detail="session_id and message are required.")
    
    return await coordinator.handle_user_message(session_id, message)

@router.post("/chat/stream", dependencies=[Depends(verify_api_key)])
async def chat_stream(payload: Dict[str, str] = Body(...)):
    session_id = payload.get("session_id")
    message = payload.get("message")
    if not session_id or not message:
        raise HTTPException(status_code=400, detail="session_id and message are required.")
    
    async def event_generator():
        async for event in coordinator.handle_user_message_stream(session_id, message):
            yield event

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("/sessions", dependencies=[Depends(verify_api_key)])
async def list_sessions():
    return {"sessions": get_sessions()}

@router.get("/sessions/{session_id}", dependencies=[Depends(verify_api_key)])
async def get_session_history(session_id: str):
    messages = get_session_messages(session_id)
    if not messages:
        return {"session_id": session_id, "messages": []}
    return {"session_id": session_id, "messages": messages}
