import json
from typing import AsyncGenerator, Dict, Any, Optional
from config import settings
from app.memory.short_term import add_message, get_session_messages
from app.security.permissions import check_dangerous_intent, create_pending_confirmation
from app.security.audit import log_audit

class CoreCoordinator:
    def __init__(self):
        if settings.agent_runtime == "cli":
            from app.runtime.gemini_cli import GeminiCLIRuntime
            self.runtime = GeminiCLIRuntime()
        else:
            from app.runtime.gemini_sdk import GeminiSDKRuntime
            self.runtime = GeminiSDKRuntime()

    async def handle_user_message(self, session_id: str, prompt: str) -> Dict[str, Any]:
        """Process a standard chat request with full security/audit checks and history logging."""
        # 1. Save user input to history
        add_message(session_id, "user", prompt)
        
        # 2. Check for dangerous actions/commands
        dangerous_action = check_dangerous_intent(prompt)
        if dangerous_action:
            token = create_pending_confirmation(dangerous_action)
            log_audit(session_id, action=dangerous_action, status="pending_approval", details=f"Token: {token}")
            return {
                "session_id": session_id,
                "response": "This action requires user confirmation before execution.",
                "status": "requires_confirmation",
                "pending_token": token
            }
        
        # 3. Retrieve history and execute agent runtime
        history = get_session_messages(session_id)
        # Format history for execution
        formatted_history = [{"role": m["role"], "content": m["content"]} for m in history[:-1]]
        
        log_audit(session_id, action="execute_runtime", status="success", details=prompt[:100])
        response = await self.runtime.execute_agent(prompt, session_id, formatted_history)
        
        if response.success:
            # Save assistant response to history
            add_message(session_id, "assistant", response.text)
            return {
                "session_id": session_id,
                "response": response.text,
                "status": "success",
                "pending_token": None
            }
        else:
            add_message(session_id, "assistant", f"Error: {response.text}")
            return {
                "session_id": session_id,
                "response": response.text,
                "status": "error",
                "pending_token": None
            }

    async def handle_user_message_stream(self, session_id: str, prompt: str) -> AsyncGenerator[str, None]:
        """Stream chat chunks back using Server-Sent Events (SSE)."""
        # Save user input to history
        add_message(session_id, "user", prompt)
        
        # Check for dangerous actions/commands
        dangerous_action = check_dangerous_intent(prompt)
        if dangerous_action:
            token = create_pending_confirmation(dangerous_action)
            log_audit(session_id, action=dangerous_action, status="pending_approval", details=f"Streaming Token: {token}")
            yield f"data: {json.dumps({'status': 'requires_confirmation', 'pending_token': token})}\n\n"
            return
            
        history = get_session_messages(session_id)
        formatted_history = [{"role": m["role"], "content": m["content"]} for m in history[:-1]]
        
        log_audit(session_id, action="execute_runtime_stream", status="success", details=prompt[:100])
        
        collected_response = []
        async for chunk in self.runtime.execute_agent_stream(prompt, session_id, formatted_history):
            collected_response.append(chunk)
            yield f"data: {json.dumps({'status': 'streaming', 'chunk': chunk})}\n\n"
            
        full_text = "".join(collected_response).strip()
        add_message(session_id, "assistant", full_text)
        yield f"data: {json.dumps({'status': 'success', 'response': full_text})}\n\n"
