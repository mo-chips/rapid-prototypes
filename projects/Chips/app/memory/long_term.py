from typing import List, Dict, Any, Optional
from app.memory.db import get_db_connection

def get_long_term_memories(category: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieve long-term memory records, optionally filtered by category."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        if category:
            cursor.execute(
                "SELECT id, category, key, value, created_at FROM long_term_memory WHERE category = ? ORDER BY id DESC;",
                (category,)
            )
        else:
            cursor.execute(
                "SELECT id, category, key, value, created_at FROM long_term_memory ORDER BY id DESC;"
            )
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()

def save_long_term_memory(category: str, key: str, value: str) -> int:
    """Save or update a long-term memory key-value pair and return its record ID."""
    conn = get_db_connection()
    try:
        with conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO long_term_memory (category, key, value) 
                VALUES (?, ?, ?)
                ON CONFLICT(category, key) DO UPDATE SET value=excluded.value;
                """,
                (category, key, value)
            )
            # Fetch the ID of the inserted/updated record
            cursor.execute(
                "SELECT id FROM long_term_memory WHERE category = ? AND key = ?;",
                (category, key)
            )
            row = cursor.fetchone()
            return row["id"] if row else -1
    finally:
        conn.close()

def delete_long_term_memory(memory_id: int) -> bool:
    """Delete a long-term memory record by its primary key ID."""
    conn = get_db_connection()
    try:
        with conn:
            cursor = conn.execute(
                "DELETE FROM long_term_memory WHERE id = ?;",
                (memory_id,)
            )
            return cursor.rowcount > 0
    finally:
        conn.close()
