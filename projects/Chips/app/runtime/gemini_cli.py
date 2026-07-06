import asyncio
import os
import sys
import shutil
from typing import AsyncGenerator, List
from app.runtime.base import AgentRuntime, AgentResponse
from config import settings

class GeminiCLIRuntime(AgentRuntime):
    def __init__(self):
        self.cli_command = settings.gemini_cli_command
        self.fallback_script = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "..", "tests", "mock_gemini_cli.py")
        )

    def _get_execution_args(self, prompt: str, session_id: str, chat_history: List[dict]) -> List[str]:
        """Construct the execution command and arguments for the Gemini CLI."""
        # Clean session ID to be a safe string
        safe_session_id = str(session_id).replace("-", "")
        
        # Resolve target executable command path, handling Windows .cmd shells
        target_command = self.cli_command
        if sys.platform == "win32" and not target_command.endswith((".cmd", ".bat", ".exe")):
            resolved_command = shutil.which(f"{target_command}.cmd") or shutil.which(target_command)
        else:
            resolved_command = shutil.which(target_command)

        # Decide whether to start a new session or resume an existing one
        # If there is history, we resume; otherwise, we start a new session
        session_arg = ["--resume", safe_session_id] if len(chat_history) > 0 else ["--session-id", safe_session_id]

        if resolved_command is not None:
            # Use real Gemini CLI installed on system PATH
            return [
                resolved_command, 
                "--prompt", prompt, 
                "--output-format", "text", 
                "--skip-trust"
            ] + session_arg
        else:
            # Fall back to mock script
            return [
                sys.executable, 
                self.fallback_script, 
                "--prompt", prompt, 
                "--output-format", "text", 
                "--skip-trust"
            ] + session_arg

    async def execute_agent(
        self, 
        prompt: str, 
        session_id: str, 
        chat_history: List[dict]
    ) -> AgentResponse:
        args = self._get_execution_args(prompt, session_id, chat_history)
        
        try:
            # Run the command asynchronously using Windows-compatible Proactor Event Loop
            proc = await asyncio.create_subprocess_exec(
                *args,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            try:
                # Add 45-second timeout to prevent process hangs (e.g. waiting for login inputs)
                stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=45.0)
            except asyncio.TimeoutError:
                try:
                    proc.kill()
                    await proc.wait()
                except Exception:
                    pass
                return AgentResponse(
                    text="Error executing agent runtime: CLI command timed out (45s max).", 
                    success=False
                )
            
            if proc.returncode == 0:
                response_text = stdout.decode().strip()
                return AgentResponse(text=response_text, success=True)
            else:
                error_msg = stderr.decode().strip() or f"Exit code {proc.returncode}"
                return AgentResponse(
                    text=f"Failed to execute Gemini CLI: {error_msg}", 
                    success=False
                )
        except Exception as e:
            import traceback
            traceback.print_exc()
            return AgentResponse(
                text=f"Error executing agent runtime: {str(e)}", 
                success=False
            )

    async def execute_agent_stream(
        self, 
        prompt: str, 
        session_id: str, 
        chat_history: List[dict]
    ) -> AsyncGenerator[str, None]:
        args = self._get_execution_args(prompt, session_id, chat_history)
        
        try:
            # For streaming, run the process and yield stdout chunks line-by-line
            proc = await asyncio.create_subprocess_exec(
                *args,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            while True:
                line = await proc.stdout.readline()
                if not line:
                    break
                yield line.decode()
                
            await proc.wait()
            if proc.returncode != 0:
                stderr_content = await proc.stderr.read()
                yield f"\n[Runtime Error: {stderr_content.decode().strip()}]"
        except Exception as e:
            yield f"\n[Runtime Exception: {str(e)}]"
            return
