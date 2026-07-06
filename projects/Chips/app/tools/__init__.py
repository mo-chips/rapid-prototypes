from app.tools.registry import tool_registry
from app.tools.system import OpenAppTool, CloseAppTool, ListRunningProcessesTool, SystemInformationTool
from app.tools.file_ops import ReadFileTool, WriteFileTool, SearchFilesTool
from app.tools.utility import OpenWebsiteTool, CreateNoteTool, RunTerminalCommandTool

# Instantiate and register all tools
tool_registry.register(OpenAppTool())
tool_registry.register(CloseAppTool())
tool_registry.register(ListRunningProcessesTool())
tool_registry.register(SystemInformationTool())
tool_registry.register(ReadFileTool())
tool_registry.register(WriteFileTool())
tool_registry.register(SearchFilesTool())
tool_registry.register(OpenWebsiteTool())
tool_registry.register(CreateNoteTool())
tool_registry.register(RunTerminalCommandTool())
