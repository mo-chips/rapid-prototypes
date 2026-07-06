from abc import ABC, abstractmethod
from typing import AsyncGenerator, List, Optional
from pydantic import BaseModel

class AgentResponse(BaseModel):
    text: str
    success: bool
    requires_input: bool = False
    confirmation_token: Optional[str] = None

class AgentRuntime(ABC):
    @abstractmethod
    async def execute_agent(
        self, 
        prompt: str, 
        session_id: str, 
        chat_history: List[dict]
    ) -> AgentResponse:
        """Run the agent loop and return the response."""
        pass

    @abstractmethod
    async def execute_agent_stream(
        self, 
        prompt: str, 
        session_id: str, 
        chat_history: List[dict]
    ) -> AsyncGenerator[str, None]:
        """Stream chunks from the agent runtime."""
        yield ""
