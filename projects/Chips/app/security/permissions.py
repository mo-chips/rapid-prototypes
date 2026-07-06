import secrets
from typing import Dict, Optional, Any

# In-memory store for pending confirmations
# Key: token, Value: dict containing confirmation details or str description
PENDING_CONFIRMATIONS: Dict[str, Any] = {}

DANGEROUS_KEYWORDS = [
    "shutdown", "restart", "reboot", "format", "rmdir", "del ", "rm ", 
    "registry", "regedit", "taskkill", "kill ", "terminate process"
]

def check_dangerous_intent(prompt: str) -> Optional[str]:
    """Check if the user request contains potentially destructive commands."""
    prompt_lower = prompt.lower()
    for kw in DANGEROUS_KEYWORDS:
        if kw in prompt_lower:
            return f"Execute command/action containing dangerous instruction: '{kw}'"
    return None

def create_pending_confirmation(action_data: Any) -> str:
    """Generate a secure confirmation token and register the pending action data (string or dictionary)."""
    token = secrets.token_hex(16)
    PENDING_CONFIRMATIONS[token] = action_data
    return token

def pop_pending_confirmation(token: str) -> Optional[Any]:
    """Retrieve and remove a pending confirmation entry by token."""
    return PENDING_CONFIRMATIONS.pop(token, None)
