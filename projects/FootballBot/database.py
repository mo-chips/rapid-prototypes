import sqlite3
import os

DB_PATH = 'subscriptions.db'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            chat_id INTEGER PRIMARY KEY
        )
    ''')
    conn.commit()
    conn.close()

def add_user(chat_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    try:
        c.execute('INSERT INTO users (chat_id) VALUES (?)', (chat_id,))
        conn.commit()
    except sqlite3.IntegrityError:
        pass # User already exists
    finally:
        conn.close()

def remove_user(chat_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('DELETE FROM users WHERE chat_id = ?', (chat_id,))
    conn.commit()
    conn.close()

def get_all_users():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT chat_id FROM users')
    users = [row[0] for row in c.fetchall()]
    conn.close()
    return users
