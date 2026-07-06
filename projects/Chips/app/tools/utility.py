import webbrowser
import subprocess
from typing import Dict, Any
from app.tools.base import BaseTool
from app.memory.long_term import save_long_term_memory

class OpenWebsiteTool(BaseTool):
    @property
    def name(self) -> str:
        return "open_website"

    @property
    def description(self) -> str:
        return "Open a web URL in the system's default browser."

    @property
    def parameters(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "url": {"type": "string", "description": "The web address to open (must start with http:// or https://)."}
            },
            "required": ["url"]
        }

    async def execute(self, **kwargs) -> Dict[str, Any]:
        url = kwargs.get("url")
        if not url.startswith(("http://", "https://")):
            url = "https://" + url
        try:
            webbrowser.open(url)
            return {"status": "success", "message": f"Opened browser for URL: {url}."}
        except Exception as e:
            return {"status": "error", "message": f"Failed to open URL: {str(e)}"}

class CreateNoteTool(BaseTool):
    @property
    def name(self) -> str:
        return "create_note"

    @property
    def description(self) -> str:
        return "Create or update a personal note saved in long-term memory."

    @property
    def parameters(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "The title of the note (serves as the unique key)."},
                "content": {"type": "string", "description": "The content body of the note."}
            },
            "required": ["title", "content"]
        }

    async def execute(self, **kwargs) -> Dict[str, Any]:
        title = kwargs.get("title")
        content = kwargs.get("content")
        try:
            record_id = save_long_term_memory(category="note", key=title, value=content)
            return {"status": "success", "message": f"Note '{title}' saved with ID {record_id}."}
        except Exception as e:
            return {"status": "error", "message": f"Failed to save note: {str(e)}"}

class RunTerminalCommandTool(BaseTool):
    @property
    def name(self) -> str:
        return "run_terminal_command"

    @property
    def description(self) -> str:
        return "Execute a command in the Windows Command Prompt or PowerShell."

    @property
    def parameters(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "command": {"type": "string", "description": "The terminal command line string to run."}
            },
            "required": ["command"]
        }

    @property
    def requires_confirmation(self) -> bool:
        return True

    async def execute(self, **kwargs) -> Dict[str, Any]:
        command = kwargs.get("command")
        try:
            import asyncio
            proc = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            try:
                stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=30)
                return {
                    "status": "success",
                    "returncode": proc.returncode,
                    "stdout": stdout.decode(errors='replace'),
                    "stderr": stderr.decode(errors='replace')
                }
            except asyncio.TimeoutError:
                try:
                    proc.kill()
                    await proc.wait()
                except Exception:
                    pass
                return {"status": "error", "message": "Command execution timed out (30s max)."}
        except Exception as e:
            return {"status": "error", "message": f"Failed to run command: {str(e)}"}
