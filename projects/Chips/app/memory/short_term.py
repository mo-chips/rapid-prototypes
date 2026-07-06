from typing import List, Dict, Any, Optional
from app.memory.db import get_db_connection

def create_session(session_id: str) -> bool:
    """Create a new session if it does not already exist."""
    conn = get_db_connection()
    try:
        with conn:
            conn.execute(
                "INSERT OR IGNORE INTO sessions (session_id) VALUES (?);", 
                (session_id,)
            )
        return True
    except Exception:
        return False
    finally:
        conn.close()

def get_sessions() -> List[str]:
    """Retrieve list of all active session IDs."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT session_id FROM sessions ORDER BY updated_at DESC;")
        rows = cursor.fetchall()
        return [row["session_id"] for row in rows]
    finally:
        conn.close()

def get_session_messages(session_id: str) -> List[Dict[str, Any]]:
    """Retrieve chat history messages for a specific session."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT role, content, tool_calls, timestamp FROM messages WHERE session_id = ? ORDER BY id ASC;",
            (session_id,)
        )
        rows = cursor.fetchall()
        messages = []
        for row in rows:
            messages.append({
                "role": row["role"],
                "content": row["content"],
                "tool_calls": row["tool_calls"],
                "timestamp": row["timestamp"]
            })
        return messages
    finally:
        conn.close()

def add_message(session_id: str, role: str, content: str, tool_calls: Optional[str] = None) -> bool:
    """Save a chat message to history and update session updated_at timestamp."""
    create_session(session_id)
    conn = get_db_connection()
    try:
        with conn:
            conn.execute(
                "INSERT INTO messages (session_id, role, content, tool_calls) VALUES (?, ?, ?, ?);",
                (session_id, role, content, tool_calls)
            )
            conn.execute(
                "UPDATE sessions SET updated_at = CURRENT_TIMESTAMP WHERE session_id = ?;",
                (session_id,)
            )
        return True
    except Exception:
        return False
    finally:
        conn.close()
