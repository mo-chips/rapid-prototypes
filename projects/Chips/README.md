
# Chips

Chips is a voice-enabled AI assistant that can be used to control your computer and interact with various services.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/chips.git
   ```
2. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file and populate it with your API keys and other configuration. See the `.env.example` file for more details.

## Usage

To run the application, use the following command:
```bash
python run.py
```

## Running Tests

To run the tests, use the following command:
```bash
pytest
```

## API Endpoints

The following are the main API endpoints:

* `/api/v1/chat`: Send a chat message to the assistant.
* `/api/v1/chat/stream`: Send a chat message and get a streaming response.
* `/api/v1/sessions`: Get a list of all chat sessions.
* `/api/v1/sessions/{session_id}`: Get the details of a specific chat session.
* `/api/v1/memory`: Get all long-term memories.
* `/api/v1/memory`: Add a new long-term memory.
* `/api/v1/memory/{memory_id}`: Delete a long-term memory.
* `/api/v1/commands`: Get a list of all available commands.
* `/api/v1/commands`: Execute a command.
* `/api/v1/commands/confirm`: Confirm a dangerous command.

## Configuration

The following are the main configuration options:

* `HOST`: The host to bind to.
* `PORT`: The port to listen on.
* `CHIPS_API_KEY`: The API key to use for the Chips API.
* `GEMINI_CLI_COMMAND`: The command to use to run the Gemini CLI.
* `GEMINI_API_KEY`: The API key to use for the Gemini API.
* `DATABASE_PATH`: The path to the database file.
* `MICROPHONE_INDEX`: The index of the microphone to use.

## License

This project is licensed under the MIT License.
