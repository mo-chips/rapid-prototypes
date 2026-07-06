import pytest
import os
from unittest.mock import MagicMock, patch
from config import settings

# Force settings to use test database
settings.database_path = "test_chips.db"

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Ensure test database is initialized before running tests, and cleaned up afterwards."""
    from app.memory.db import init_db
    
    # Initialize the database schema
    init_db()
    
    yield
    
    # Cleanup database files after test suite completes
    for suffix in ["", "-wal", "-shm"]:
        db_file = f"test_chips.db{suffix}"
        if os.path.exists(db_file):
            try:
                os.remove(db_file)
            except PermissionError:
                pass

@pytest.fixture(autouse=True)
def mock_gemini_sdk():
    """Globally mock the google.genai.Client to run unit/API tests offline without rate limits."""
    with patch("google.genai.Client") as mock_client_cls:
        mock_client = MagicMock()
        mock_client_cls.return_value = mock_client
        
        # Configure mock generate_content response
        mock_response = MagicMock()
        mock_response.text = "Hello! I am Chips, your personal assistant (simulated via Gemini SDK mock). How can I help you today?"
        mock_response.function_calls = None
        mock_client.models.generate_content.return_value = mock_response
        
        # Configure mock generate_content_stream response
        mock_chunk = MagicMock()
        mock_chunk.text = "Hello! I am Chips, your personal assistant (simulated via Gemini SDK mock). How can I help you today?"
        mock_client.models.generate_content_stream.return_value = [mock_chunk]
        
        yield mock_client

@pytest.fixture(autouse=True)
def mock_shutil_which():
    """Force GeminiCLIRuntime to use the mock script during test runs to execute offline instantly."""
    import shutil
    original_which = shutil.which
    
    def mock_which(cmd, *args, **kwargs):
        if "gemini" in cmd.lower():
            return None
        return original_which(cmd, *args, **kwargs)
        
    with patch("shutil.which", side_effect=mock_which):
        yield
