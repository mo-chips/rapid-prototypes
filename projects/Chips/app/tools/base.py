from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseTool(ABC):
    @property
    @abstractmethod
    def name(self) -> str:
        """Unique identifier for the tool."""
        pass

    @property
    @abstractmethod
    def description(self) -> str:
        """Description of what the tool does."""
        pass

    @property
    @abstractmethod
    def parameters(self) -> Dict[str, Any]:
        """JSON Schema dictionary defining parameters."""
        pass

    @property
    def requires_confirmation(self) -> bool:
        """Whether this tool execution requires user prompt approval."""
        return False

    @abstractmethod
    async def execute(self, **kwargs) -> Dict[str, Any]:
        """Core execution logic of the tool."""
        pass
