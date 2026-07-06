from abc import ABC, abstractmethod
from typing import AsyncGenerator

class AIProvider(ABC):
    @abstractmethod
    async def generate_completion(self, prompt: str, **kwargs) -> str:
        """Query LLM for completion."""
        pass

    @abstractmethod
    async def generate_stream(self, prompt: str, **kwargs) -> AsyncGenerator[str, None]:
        """Stream completion from LLM."""
        yield ""
