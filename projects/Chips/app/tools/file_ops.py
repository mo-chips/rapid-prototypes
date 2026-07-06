import os
import glob
from typing import Dict, Any
from app.tools.base import BaseTool

class ReadFileTool(BaseTool):
    @property
    def name(self) -> str:
        return "read_file"

    @property
    def description(self) -> str:
        return "Read content of a file located within the workspace sandbox."

    @property
    def parameters(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "filepath": {"type": "string", "description": "The relative path to the file inside the workspace."}
            },
            "required": ["filepath"]
        }

    async def execute(self, **kwargs) -> Dict[str, Any]:
        filepath = kwargs.get("filepath")
        # Sandbox path resolution
        base_dir = os.path.abspath(".")
        target_path = os.path.abspath(os.path.join(base_dir, filepath))
        
        if not target_path.startswith(base_dir):
            return {"status": "error", "message": "Access denied: Path is outside of workspace sandbox."}
            
        if not os.path.exists(target_path):
            return {"status": "error", "message": f"File '{filepath}' not found."}
            
        try:
            with open(target_path, "r", encoding="utf-8") as f:
                content = f.read()
            return {"status": "success", "content": content}
        except Exception as e:
            return {"status": "error", "message": f"Failed to read file: {str(e)}"}

class WriteFileTool(BaseTool):
    @property
    def name(self) -> str:
        return "write_file"

    @property
    def description(self) -> str:
        return "Write content to a file inside the workspace sandbox."

    @property
    def parameters(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "filepath": {"type": "string", "description": "Relative path to write the file."},
                "content": {"type": "string", "description": "Text content to save."}
            },
            "required": ["filepath", "content"]
        }

    @property
    def requires_confirmation(self) -> bool:
        return True

    async def execute(self, **kwargs) -> Dict[str, Any]:
        filepath = kwargs.get("filepath")
        content = kwargs.get("content")
        
        base_dir = os.path.abspath(".")
        target_path = os.path.abspath(os.path.join(base_dir, filepath))
        
        if not target_path.startswith(base_dir):
            return {"status": "error", "message": "Access denied: Path is outside of workspace sandbox."}
            
        try:
            os.makedirs(os.path.dirname(target_path), exist_ok=True)
            with open(target_path, "w", encoding="utf-8") as f:
                f.write(content)
            return {"status": "success", "message": f"Successfully wrote {len(content)} characters to {filepath}."}
        except Exception as e:
            return {"status": "error", "message": f"Failed to write file: {str(e)}"}

class SearchFilesTool(BaseTool):
    @property
    def name(self) -> str:
        return "search_files"

    @property
    def description(self) -> str:
        return "Search files matching a wildcard pattern recursively in the workspace."

    @property
    def parameters(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "pattern": {"type": "string", "description": "Glob pattern (e.g. *.py, **/*.json)."}
            },
            "required": ["pattern"]
        }

    async def execute(self, **kwargs) -> Dict[str, Any]:
        pattern = kwargs.get("pattern")
        base_dir = os.path.abspath(".")
        
        try:
            # Prevent directory escape in pattern
            if ".." in pattern or os.path.isabs(pattern):
                return {"status": "error", "message": "Invalid pattern: Absolute paths or parent directory traversals are not allowed."}
                
            search_pattern = os.path.join(base_dir, pattern)
            files = glob.glob(search_pattern, recursive=True)
            
            # Map back to relative paths
            relative_files = [os.path.relpath(f, base_dir) for f in files]
            return {"status": "success", "files": relative_files[:100]} # Cap results at 100
        except Exception as e:
            return {"status": "error", "message": f"Glob search failed: {str(e)}"}
