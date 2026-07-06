import pytest
import asyncio
import uuid
from app.runtime.gemini_cli import GeminiCLIRuntime
from app.memory.short_term import add_message, get_session_messages, create_session
from app.memory.long_term import save_long_term_memory, get_long_term_memories, delete_long_term_memory
from app.security.permissions import check_dangerous_intent, create_pending_confirmation, pop_pending_confirmation

@pytest.mark.asyncio
async def test_gemini_cli_runtime_fallback():
    """Verify GeminiCLIRuntime correctly executes and returns valid response from the CLI or mock."""
    runtime = GeminiCLIRuntime()
    session_id = f"test-session-{uuid.uuid4().hex[:8]}"
    
    # Run a simple greeting prompt
    res = await runtime.execute_agent("hello", session_id, [])
    assert res.success is True
    # The output could be from the real Gemini CLI or the mock script. Look for common words.
    text_lower = res.text.lower()
    assert any(word in text_lower for word in ["assistant", "chips", "gemini", "help", "assist"])

    # Run a status prompt
    session_id2 = f"test-session-{uuid.uuid4().hex[:8]}"
    res = await runtime.execute_agent("status", session_id2, [])
    assert res.success is True
    # Should contain either system status or assistant help
    assert len(res.text) > 0

    # Run an error prompt to verify exit code handling (force error)
    # Note: the real CLI won't fail on "error" prompt unless we run in mock mode.
    # To test error exit code handling, we check if we fall back to mock or handle it.
    import shutil
    if shutil.which(runtime.cli_command) is None:
        session_id3 = f"test-session-{uuid.uuid4().hex[:8]}"
        res = await runtime.execute_agent("error", session_id3, [])
        assert res.success is False
        assert "failure" in res.text

@pytest.mark.asyncio
async def test_gemini_cli_runtime_stream():
    """Verify GeminiCLIRuntime can read and stream chunks from stdout subprocess."""
    runtime = GeminiCLIRuntime()
    session_id = f"test-session-{uuid.uuid4().hex[:8]}"
    chunks = []
    async for chunk in runtime.execute_agent_stream("hello", session_id, []):
        chunks.append(chunk)
        
    full_response = "".join(chunks)
    assert len(chunks) > 0
    text_lower = full_response.lower()
    assert any(word in text_lower for word in ["assistant", "chips", "gemini", "help", "assist"])

def test_database_short_term_memory():
    """Test session creation and message tracking in SQLite short-term memory."""
    session_id = f"test-session-{uuid.uuid4().hex[:8]}"
    assert create_session(session_id) is True
    
    assert add_message(session_id, "user", "What's the weather?") is True
    assert add_message(session_id, "assistant", "Partly cloudy.") is True
    
    messages = get_session_messages(session_id)
    assert len(messages) == 2
    assert messages[0]["role"] == "user"
    assert messages[0]["content"] == "What's the weather?"
    assert messages[1]["role"] == "assistant"
    assert messages[1]["content"] == "Partly cloudy."

def test_database_long_term_memory():
    """Test preference, note saving, filtering, and deletion in long-term memory."""
    rec_id = save_long_term_memory("preference", "theme", "dark-mode")
    assert rec_id > 0
    
    save_long_term_memory("note", "meeting", "Discuss architecture with team.")
    
    prefs = get_long_term_memories("preference")
    assert len(prefs) == 1
    assert prefs[0]["key"] == "theme"
    assert prefs[0]["value"] == "dark-mode"
    
    all_mem = get_long_term_memories()
    assert len(all_mem) >= 2
    
    assert delete_long_term_memory(rec_id) is True
    prefs_after = get_long_term_memories("preference")
    assert len(prefs_after) == 0

def test_security_check_and_confirmation():
    """Verify dangerous command filtering and token validation workflows."""
    assert check_dangerous_intent("hello Chips, check my processor specs") is None
    
    desc = check_dangerous_intent("reboot the workstation and format drive C:")
    assert desc is not None
    assert "reboot" in desc or "format" in desc
    
    action_data = {"command": "format C:"}
    token = create_pending_confirmation(action_data)
    assert len(token) == 32
    
    retrieved_data = pop_pending_confirmation(token)
    assert retrieved_data == action_data
    assert pop_pending_confirmation(token) is None

@pytest.mark.asyncio
async def test_gemini_sdk_runtime():
    """Verify GeminiSDKRuntime correctly executes using the mocked SDK client."""
    from app.runtime.gemini_sdk import GeminiSDKRuntime
    runtime = GeminiSDKRuntime()
    session_id = f"test-sdk-session-{uuid.uuid4().hex[:8]}"
    
    res = await runtime.execute_agent("hello", session_id, [])
    assert res.success is True
    assert "personal assistant" in res.text.lower()

@pytest.mark.asyncio
async def test_gemini_sdk_runtime_stream():
    """Verify GeminiSDKRuntime correctly streams chunks using the mocked SDK client."""
    from app.runtime.gemini_sdk import GeminiSDKRuntime
    runtime = GeminiSDKRuntime()
    session_id = f"test-sdk-session-{uuid.uuid4().hex[:8]}"
    
    chunks = []
    async for chunk in runtime.execute_agent_stream("hello", session_id, []):
        chunks.append(chunk)
        
    full_response = "".join(chunks)
    assert len(chunks) > 0
    assert "personal assistant" in full_response.lower()

