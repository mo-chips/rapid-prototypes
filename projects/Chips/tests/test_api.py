import pytest
import uuid
from fastapi.testclient import TestClient
from config import settings

HEADERS = {"X-Chips-API-Key": settings.chips_api_key}

@pytest.fixture
def client():
    """Fixture to instantiate TestClient after mock fixtures have run."""
    from app.main import app
    return TestClient(app)

def test_health_and_status(client):
    """Verify health check and diagnostics endpoints do not require auth."""
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

    res = client.get("/api/v1/status")
    assert res.status_code == 200
    assert res.json()["status"] == "online"

def test_auth_protection(client):
    """Verify restricted endpoints return 401 when API Key is missing or incorrect."""
    res = client.get("/api/v1/conversations/sessions")
    assert res.status_code == 401

    res = client.get("/api/v1/conversations/sessions", headers={"X-Chips-API-Key": "wrong-key"})
    assert res.status_code == 401

def test_chat_interaction_workflow(client):
    """Verify chat endpoint stores sessions, parses requests, and logs history."""
    session_id = f"test-api-session-{uuid.uuid4().hex[:8]}"
    
    res = client.post(
        "/api/v1/conversations/chat",
        headers=HEADERS,
        json={"session_id": session_id, "message": "hello chips"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    
    # Check for general response terms from mock or live Gemini CLI
    response_lower = data["response"].lower()
    assert any(word in response_lower for word in ["assistant", "chips", "gemini", "help", "assist"])

    # Retrieve history
    res = client.get(f"/api/v1/conversations/sessions/{session_id}", headers=HEADERS)
    assert res.status_code == 200
    history = res.json()["messages"]
    assert len(history) == 2
    assert history[0]["role"] == "user"
    assert history[1]["role"] == "assistant"

def test_chat_security_interception(client):
    """Verify prompts containing destructive commands are stopped and return a confirmation token."""
    res = client.post(
        "/api/v1/conversations/chat",
        headers=HEADERS,
        json={"session_id": "unsafe-session", "message": "please taskkill my app"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "requires_confirmation"
    assert data["pending_token"] is not None

def test_memory_crud_api(client):
    """Test memory lifecycle REST operations (Create, List, Delete)."""
    # Create memory
    res = client.post(
        "/api/v1/memory",
        headers=HEADERS,
        json={"category": "preference", "key": "color", "value": "red"}
    )
    assert res.status_code == 200
    mem_id = res.json()["id"]

    # List memory
    res = client.get("/api/v1/memory?category=preference", headers=HEADERS)
    assert res.status_code == 200
    mems = res.json()["memories"]
    assert any(m["key"] == "color" and m["value"] == "red" for m in mems)

    # Delete memory
    res = client.delete(f"/api/v1/memory/{mem_id}", headers=HEADERS)
    assert res.status_code == 200

    # Verify deleted
    res = client.get("/api/v1/memory?category=preference", headers=HEADERS)
    assert not any(m["id"] == mem_id for m in res.json()["memories"])

def test_commands_list_and_confirmation(client):
    """Verify tool executing permissions, blocking, and token confirmations."""
    res = client.get("/api/v1/commands", headers=HEADERS)
    assert res.status_code == 200
    assert len(res.json()["tools"]) > 0

    res = client.post(
        "/api/v1/commands",
        headers=HEADERS,
        json={"tool_name": "system_information"}
    )
    assert res.status_code == 200
    assert res.json()["status"] == "success"
    assert "os" in res.json()["result"]

    res = client.post(
        "/api/v1/commands",
        headers=HEADERS,
        json={"tool_name": "close_application", "arguments": {"process_name": "notepad"}}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "requires_confirmation"
    token = data["pending_token"]
    assert token is not None

    res = client.post(
        "/api/v1/commands/confirm",
        headers=HEADERS,
        json={"token": token, "approved": True}
    )
    assert res.status_code == 200
    assert res.json()["status"] in ("success", "error")
