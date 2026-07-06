from typing import Optional
from app.memory.db import get_db_connection

def log_audit(session_id: Optional[str], action: str, status: str, details: Optional[str] = None) -> bool:
    """Write a security audit entry into the SQLite audit_logs table."""
    conn = get_db_connection()
    try:
        with conn:
            conn.execute(
                """
                INSERT INTO audit_logs (session_id, action, status, details)
                VALUES (?, ?, ?, ?);
                """,
                (session_id, action, status, details)
            )
        return True
    except Exception:
        return False
    finally:
        conn.close()
