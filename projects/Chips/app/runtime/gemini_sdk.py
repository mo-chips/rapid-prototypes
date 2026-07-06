import asyncio
from typing import AsyncGenerator, List, Dict, Any
from google import genai
from google.genai import types
from app.runtime.base import AgentRuntime, AgentResponse
from app.tools.registry import tool_registry
from app.security.permissions import create_pending_confirmation
from app.security.audit import log_audit
from config import settings

# ---------------------------------------------------------------------------
# Static Python Function definitions for Gemini Tool/Function Schema compilation
# ---------------------------------------------------------------------------

def open_application(app_name: str) -> dict:
    """Launch a desktop application or file by name (Windows platform).
    
    Args:
        app_name: The command or executable name to launch (e.g. notepad, calc).
    """
    pass

def close_application(process_name: str) -> dict:
    """Close a running application by process name.
    
    Args:
        process_name: The process executable name to close (e.g. notepad.exe).
    """
    pass

def list_running_processes() -> dict:
    """Retrieve a list of currently running processes on the computer."""
    pass

def system_information() -> dict:
    """Get details about CPU load, memory utilization, OS version, and system architecture."""
    pass

def read_file(filepath: str) -> dict:
    """Read content of a file located within the workspace sandbox.
    
    Args:
        filepath: The relative path to the file inside the workspace.
    """
    pass

def write_file(filepath: str, content: str) -> dict:
    """Write content to a file inside the workspace sandbox.
    
    Args:
        filepath: Relative path to write the file.
        content: Text content to save.
    """
    pass

def search_files(pattern: str) -> dict:
    """Search files matching a wildcard pattern recursively in the workspace.
    
    Args:
        pattern: Glob pattern (e.g. *.py, **/*.json).
    """
    pass

def open_website(url: str) -> dict:
    """Open a web URL in the system's default browser.
    
    Args:
        url: The web address to open (must start with http:// or https://).
    """
    pass

def create_note(title: str, content: str) -> dict:
    """Create or update a personal note saved in long-term memory.
    
    Args:
        title: The title of the note (serves as the unique key).
        content: The content body of the note.
    """
    pass

def run_terminal_command(command: str) -> dict:
    """Execute a command in the Windows Command Prompt or PowerShell.
    
    Args:
        command: The terminal command line string to run.
    """
    pass

# Map tool names to static signatures
SDK_TOOLS = [
    open_application, close_application, list_running_processes, system_information,
    read_file, write_file, search_files, open_website, create_note, run_terminal_command
]

# ---------------------------------------------------------------------------
# GeminiSDKRuntime Implementation
# ---------------------------------------------------------------------------

class GeminiSDKRuntime(AgentRuntime):
    def __init__(self):
        # google-genai Client automatically reads GEMINI_API_KEY from os.environ
        self.client = genai.Client()
        self.model = settings.gemini_model

    def _prepare_contents(self, prompt: str, chat_history: List[dict]) -> List[types.Content]:
        """Convert memory history to SDK Content objects."""
        contents = []
        for msg in chat_history:
            role = "user" if msg["role"] == "user" else "model"
            contents.append(
                types.Content(
                    role=role,
                    parts=[types.Part.from_text(text=msg["content"])]
                )
            )
        # Append current user prompt
        contents.append(
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=prompt)]
            )
        )
        return contents

    async def execute_agent(
        self, 
        prompt: str, 
        session_id: str, 
        chat_history: List[dict]
    ) -> AgentResponse:
        contents = self._prepare_contents(prompt, chat_history)
        
        try:
            while True:
                # Call Gemini SDK directly
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        tools=SDK_TOOLS,
                        temperature=0.2
                    )
                )
                
                # Check if model requested any tool executions
                if response.function_calls:
                    # For simplicity in MVP, we process the first function call
                    call = response.function_calls[0]
                    tool_name = call.name
                    arguments = call.args
                    
                    try:
                        tool = tool_registry.get_tool(tool_name)
                    except ValueError:
                        # Fallback for unrecognized tools
                        return AgentResponse(text=f"Error: Unknown tool '{tool_name}' requested by model.", success=False)
                        
                    # Enforce security gate
                    if tool.requires_confirmation:
                        action_data = {
                            "type": "tool",
                            "tool_name": tool_name,
                            "arguments": arguments
                        }
                        token = create_pending_confirmation(action_data)
                        log_audit(
                            session_id=session_id,
                            action=f"execute_tool:{tool_name}",
                            status="pending_approval",
                            details=f"Token: {token}, Args: {arguments}"
                        )
                        return AgentResponse(
                            text=f"Tool execution for '{tool_name}' requires confirmation.",
                            success=True,
                            requires_input=True,
                            confirmation_token=token
                        )
                        
                    # Execute tool locally
                    log_audit(session_id=session_id, action=f"execute_tool:{tool_name}", status="success")
                    result = await tool.execute(**arguments)
                    
                    # Feed the function call and the tool execution result back into Gemini context
                    contents.append(response.candidates[0].content)
                    contents.append(
                        types.Content(
                            role="tool",
                            parts=[
                                types.Part.from_function_response(
                                    name=tool_name,
                                    response={"result": result}
                                )
                            ]
                        )
                    )
                    # Loop back to generate the next response turn (ReAct loop)
                    continue
                
                # No function calls, we have the final text answer
                return AgentResponse(text=response.text or "", success=True)
                
        except Exception as e:
            import traceback
            traceback.print_exc()
            return AgentResponse(text=f"Error executing SDK runtime: {str(e)}", success=False)

    async def execute_agent_stream(
        self, 
        prompt: str, 
        session_id: str, 
        chat_history: List[dict]
    ) -> AsyncGenerator[str, None]:
        contents = self._prepare_contents(prompt, chat_history)
        
        try:
            # ReAct Loop for streaming: we execute tools sequentially. Once we hit a final text turn, we stream it.
            while True:
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        tools=SDK_TOOLS,
                        temperature=0.2
                    )
                )
                
                if response.function_calls:
                    call = response.function_calls[0]
                    tool_name = call.name
                    arguments = call.args
                    
                    try:
                        tool = tool_registry.get_tool(tool_name)
                    except ValueError:
                        yield f"\n[Error: Unknown tool '{tool_name}' requested]"
                        return
                        
                    if tool.requires_confirmation:
                        # Yield special warning and abort streaming loop
                        action_data = {
                            "type": "tool",
                            "tool_name": tool_name,
                            "arguments": arguments
                        }
                        token = create_pending_confirmation(action_data)
                        yield f"The tool '{tool_name}' requires security confirmation. Code is: {token[:4]}"
                        return
                        
                    # Run tool
                    result = await tool.execute(**arguments)
                    
                    contents.append(response.candidates[0].content)
                    contents.append(
                        types.Content(
                            role="tool",
                            parts=[
                                types.Part.from_function_response(
                                    name=tool_name,
                                    response={"result": result}
                                )
                            ]
                        )
                    )
                    continue
                
                # Now that tools are finished, stream the final response chunk-by-chunk
                stream_response = self.client.models.generate_content_stream(
                    model=self.model,
                    contents=contents,
                    config=types.GenerateContentConfig(temperature=0.2)
                )
                
                for chunk in stream_response:
                    if chunk.text:
                        yield chunk.text
                break
                
        except Exception as e:
            yield f"\n[SDK Stream Exception: {str(e)}]"
            return
