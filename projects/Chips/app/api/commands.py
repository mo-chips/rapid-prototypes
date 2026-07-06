from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Dict, Any
from app.tools.registry import tool_registry
from app.security.auth import verify_api_key
from app.security.permissions import create_pending_confirmation, pop_pending_confirmation
from app.security.audit import log_audit

router = APIRouter(prefix="/commands", tags=["Commands"])

@router.get("", dependencies=[Depends(verify_api_key)])
async def list_commands():
    """List all registered tool commands and their execution schemas."""
    return {"tools": tool_registry.list_tools()}

@router.post("", dependencies=[Depends(verify_api_key)])
async def execute_command(payload: Dict[str, Any] = Body(...)):
    """Execute a registered tool directly, processing safety checks first."""
    tool_name = payload.get("tool_name")
    arguments = payload.get("arguments", {})
    
    if not tool_name:
        raise HTTPException(status_code=400, detail="tool_name is required.")
        
    try:
        tool = tool_registry.get_tool(tool_name)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
        
    # Check if the tool requires confirmation
    if tool.requires_confirmation:
        action_data = {
            "type": "tool",
            "tool_name": tool_name,
            "arguments": arguments
        }
        token = create_pending_confirmation(action_data)
        log_audit(
            session_id=None,
            action=f"execute_tool:{tool_name}",
            status="pending_approval",
            details=f"Token: {token}, Args: {arguments}"
        )
        return {
            "status": "requires_confirmation",
            "message": f"Execution of '{tool_name}' requires confirmation.",
            "pending_token": token
        }
        
    # Execute tool directly
    log_audit(session_id=None, action=f"execute_tool:{tool_name}", status="success")
    result = await tool.execute(**arguments)
    return {
        "status": "success",
        "result": result
    }

@router.post("/confirm", dependencies=[Depends(verify_api_key)])
async def confirm_command(payload: Dict[str, Any] = Body(...)):
    """Verify and execute (or reject) a pending tool execution command."""
    token = payload.get("token")
    approved = payload.get("approved", False)
    
    if not token:
        raise HTTPException(status_code=400, detail="token is required.")
        
    pending_action = pop_pending_confirmation(token)
    if not pending_action:
        raise HTTPException(status_code=404, detail="Pending confirmation token not found or already processed.")
        
    if not approved:
        log_audit(
            session_id=None,
            action=f"confirm_token:{token}",
            status="denied",
            details="User rejected execution"
        )
        return {"status": "denied", "message": "Command execution was rejected by user."}
        
    # Process confirmation
    if isinstance(pending_action, dict) and pending_action.get("type") == "tool":
        tool_name = pending_action["tool_name"]
        arguments = pending_action["arguments"]
        
        try:
            tool = tool_registry.get_tool(tool_name)
            log_audit(
                session_id=None,
                action=f"execute_tool_confirmed:{tool_name}",
                status="success"
            )
            result = await tool.execute(**arguments)
            return {
                "status": "success",
                "result": result
            }
        except Exception as e:
            log_audit(
                session_id=None,
                action=f"execute_tool_confirmed:{tool_name}",
                status="failure",
                details=str(e)
            )
            return {"status": "error", "message": f"Execution failed: {str(e)}"}
            
    # Fallback/Default text approval confirmation
    log_audit(
        session_id=None,
        action=f"confirm_text_token:{token}",
        status="success",
        details=str(pending_action)
    )
    return {
        "status": "success",
        "message": f"Confirmed action: {pending_action}"
    }
