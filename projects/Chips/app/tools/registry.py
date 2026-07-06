from typing import Dict, List, Any
from app.tools.base import BaseTool

class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, BaseTool] = {}

    def register(self, tool: BaseTool) -> None:
        """Register a tool instance in the global map."""
        self._tools[tool.name] = tool

    def get_tool(self, name: str) -> BaseTool:
        """Retrieve a tool by name. Raises ValueError if not found."""
        if name not in self._tools:
            raise ValueError(f"Tool '{name}' is not registered.")
        return self._tools[name]

    def list_tools(self) -> List[Dict[str, Any]]:
        """List metadata schemas of all registered tools."""
        return [
            {
                "name": tool.name,
                "description": tool.description,
                "parameters": tool.parameters,
                "requires_confirmation": tool.requires_confirmation
            }
            for tool in self._tools.values()
        ]

# Global tool registry instance
tool_registry = ToolRegistry()
