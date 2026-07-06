import sqlite3
import os
from config import settings

def get_db_connection() -> sqlite3.Connection:
    """Return a connection to the SQLite database, with dictionary cursor support."""
    conn = sqlite3.connect(settings.database_path)
    conn.row_factory = sqlite3.Row
    # Enable Write-Ahead Logging (WAL) for concurrency
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA foreign_keys=ON;")
    return conn

def init_db():
    """Create all required tables for the application if they do not exist."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Sessions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sessions (
        session_id TEXT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Messages Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        role TEXT CHECK(role IN ('user', 'assistant', 'system', 'tool')) NOT NULL,
        content TEXT NOT NULL,
        tool_calls TEXT, -- JSON representation of tool calls
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
    );
    """)

    # Long-term Memory Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS long_term_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT CHECK(category IN ('preference', 'note', 'learned_behavior', 'alias')) NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(category, key)
    );
    """)

    # Audit Logs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        session_id TEXT,
        action TEXT NOT NULL,
        status TEXT CHECK(status IN ('success', 'failure', 'pending_approval', 'denied')) NOT NULL,
        details TEXT
    );
    """)

    # Tool Permissions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tool_permissions (
        tool_name TEXT PRIMARY KEY,
        requires_confirmation INTEGER DEFAULT 0
    );
    """)

    conn.commit()
    conn.close()
