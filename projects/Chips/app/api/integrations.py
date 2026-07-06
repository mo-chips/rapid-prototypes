from fastapi import APIRouter, Body, HTTPException
from typing import Dict, Any
from app.core.coordinator import CoreCoordinator
from app.security.audit import log_audit

router = APIRouter(prefix="/integrations", tags=["Integrations"])
coordinator = CoreCoordinator()

@router.post("/alexa")
async def alexa_integration(payload: Dict[str, Any] = Body(...)):
    """Handle Amazon Alexa Custom Skill requests, mapping speech inputs to assistant runs."""
    request_type = payload.get("request", {}).get("type")
    session_id = payload.get("session", {}).get("sessionId", "alexa-session-default")
    
    log_audit(
        session_id=session_id,
        action="alexa_request",
        status="success",
        details=f"Type: {request_type}"
    )

    if request_type == "LaunchRequest":
        speech = "Hello, I am Chips. How can I help you?"
        return format_alexa_response(speech, should_end=False)
        
    elif request_type == "IntentRequest":
        intent_name = payload.get("request", {}).get("intent", {}).get("name")
        
        if intent_name == "AMAZON.HelpIntent":
            return format_alexa_response("You can ask me to run commands, check status, or manage notes.", should_end=False)
        elif intent_name in ("AMAZON.StopIntent", "AMAZON.CancelIntent"):
            return format_alexa_response("Goodbye from Chips.", should_end=True)
        elif intent_name == "ChipsQueryIntent":
            # Extract slots (e.g. query)
            slots = payload.get("request", {}).get("intent", {}).get("slots", {})
            query_slot = slots.get("Query", {}) or slots.get("query", {})
            query_text = query_slot.get("value")
            
            if not query_text:
                return format_alexa_response("I didn't catch that. Could you repeat?", should_end=False)
                
            # Process query using Core Coordinator
            result = await coordinator.handle_user_message(session_id, query_text)
            response_speech = result.get("response", "No response received.")
            
            # If confirmation required, let Alexa speak it out
            if result.get("status") == "requires_confirmation":
                response_speech = f"This action contains dangerous commands and requires system confirmation. Code is: {result.get('pending_token')[:4]}"
                
            return format_alexa_response(response_speech, should_end=True)
        else:
            return format_alexa_response("I'm not sure how to handle that intent.", should_end=True)
            
    elif request_type == "SessionEndedRequest":
        return {"version": "1.0", "response": {}}
        
    raise HTTPException(status_code=400, detail="Unsupported Alexa request type.")

@router.post("/webhook")
async def webhook_integration(payload: Dict[str, Any] = Body(...)):
    """A generic webhook endpoint to receive notifications or trigger local hooks."""
    event = payload.get("event", "generic")
    data = payload.get("data", {})
    
    log_audit(
        session_id=None,
        action=f"webhook_event:{event}",
        status="success",
        details=str(data)
    )
    
    # Custom business logic based on webhook type can be integrated here
    return {"status": "processed", "event": event}

def format_alexa_response(speech_text: str, should_end: bool) -> Dict[str, Any]:
    """Helper to structure speech strings into official Alexa response format."""
    return {
        "version": "1.0",
        "response": {
            "outputSpeech": {
                "type": "PlainText",
                "text": speech_text
            },
            "shouldEndSession": should_end
        }
    }
