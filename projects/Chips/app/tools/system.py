import subprocess
import psutil
import platform
from typing import Dict, Any
from app.tools.base import BaseTool

class OpenAppTool(BaseTool):
    @property
    def name(self) -> str:
        return "open_application"

    @property
    def description(self) -> str:
        return "Launch a desktop application or file by name (Windows platform)."

    @property
    def parameters(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "app_name": {"type": "string", "description": "The command or executable name to launch (e.g. notepad, calc)."}
            },
            "required": ["app_name"]
        }

    async def execute(self, **kwargs) -> Dict[str, Any]:
        app_name = kwargs.get("app_name")
        try:
            # Launch process in background (use shell=True to support windows aliases)
            subprocess.Popen(app_name, shell=True)
            return {"status": "success", "message": f"Successfully launched {app_name}."}
        except Exception as e:
            return {"status": "error", "message": f"Failed to launch app: {str(e)}"}

class CloseAppTool(BaseTool):
    @property
    def name(self) -> str:
        return "close_application"

    @property
    def description(self) -> str:
        return "Close a running application by process name."

    @property
    def parameters(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "process_name": {"type": "string", "description": "The process executable name to close (e.g. notepad.exe)."}
            },
            "required": ["process_name"]
        }

    @property
    def requires_confirmation(self) -> bool:
        return True

    async def execute(self, **kwargs) -> Dict[str, Any]:
        process_name = kwargs.get("process_name")
        # Ensure it ends with .exe on windows
        if not process_name.lower().endswith(".exe"):
            process_name += ".exe"
            
        try:
            import asyncio
            proc = await asyncio.create_subprocess_exec(
                "taskkill", "/f", "/im", process_name,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await proc.communicate()
            if proc.returncode == 0:
                return {"status": "success", "message": f"Successfully terminated {process_name}."}
            else:
                stderr_str = stderr.decode(errors='replace').strip()
                return {"status": "error", "message": f"Taskkill returned: {stderr_str}"}
        except Exception as e:
            return {"status": "error", "message": f"Failed to close process: {str(e)}"}

class ListRunningProcessesTool(BaseTool):
    @property
    def name(self) -> str:
        return "list_running_processes"

    @property
    def description(self) -> str:
        return "Retrieve a list of currently running processes on the computer."

    @property
    def parameters(self) -> Dict[str, Any]:
        return {"type": "object", "properties": {}}

    async def execute(self, **kwargs) -> Dict[str, Any]:
        processes = []
        for proc in psutil.process_iter(['pid', 'name', 'username']):
            try:
                processes.append(proc.info)
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                pass
        # Return top 50 processes sorted by PID to avoid massive response payload
        processes = sorted(processes, key=lambda x: x['pid'])[:50]
        return {"status": "success", "processes": processes}

class SystemInformationTool(BaseTool):
    @property
    def name(self) -> str:
        return "system_information"

    @property
    def description(self) -> str:
        return "Get details about CPU load, memory utilization, OS version, and system architecture."

    @property
    def parameters(self) -> Dict[str, Any]:
        return {"type": "object", "properties": {}}

    async def execute(self, **kwargs) -> Dict[str, Any]:
        return {
            "status": "success",
            "os": platform.system(),
            "os_release": platform.release(),
            "os_version": platform.version(),
            "architecture": platform.machine(),
            "cpu_usage_percent": psutil.cpu_percent(interval=0.1),
            "cpu_cores_physical": psutil.cpu_count(logical=False),
            "cpu_cores_logical": psutil.cpu_count(logical=True),
            "memory_total_gb": round(psutil.virtual_memory().total / (1024 ** 3), 2),
            "memory_available_gb": round(psutil.virtual_memory().available / (1024 ** 3), 2),
            "memory_usage_percent": psutil.virtual_memory().percent
        }
