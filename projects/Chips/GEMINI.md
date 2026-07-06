# Chips Core

API-First Personal Assistant Platform centered around Gemini CLI.

## Architecture
- **FastAPI**: Main API backend.
- **Gemini Runtime**: Supports both Gemini CLI (`cli`) and Google GenAI SDK (`sdk`).
- **Memory**: SQLite-based short-term and long-term memory.
- **Plugins**: Voice (STT/TTS) and Wake Word detection.
- **Tools**: Extensible tool registry for system operations, file ops, etc.

## Setup
1. Install dependencies: `pip install -r requirements.txt`
2. Set up `.env` with `GEMINI_API_KEY`.
3. Run the core: `python run.py`

## Conventions
- Use `app/runtime/base.py` to implement new runtimes.
- Register tools in `app/tools/__init__.py`.
- Follow security checks in `app/security/permissions.py`.
- Run tests using `pytest`.
