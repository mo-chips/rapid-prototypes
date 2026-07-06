import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

# Load .env file into os.environ for subprocesses to inherit (e.g. GEMINI_API_KEY)
load_dotenv()

class Settings(BaseSettings):
    host: str = "127.0.0.1"
    port: int = 8000
    chips_api_key: str
    gemini_cli_command: str = "gemini"
    database_path: str = "chips.db"
    microphone_index: Optional[int] = None
    agent_runtime: str = "sdk"
    gemini_model: str = "gemini-2.5-flash"
    google_genai_use_vertexai: Optional[str] = None
    google_cloud_project: Optional[str] = None
    google_cloud_location: Optional[str] = None

    # Load from .env file if it exists
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
