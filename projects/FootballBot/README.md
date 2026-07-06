# Telegram Football Bot ⚽

A simple Telegram bot that provides daily updates on football match fixtures and results.

## Features

- **Daily Updates**: Automatically sends yesterday's results and today's fixtures every day at 8:00 AM UTC.
- **On-demand Information**: Get current information anytime using commands.
- **Subscription Model**: Users can `/start` to subscribe and `/stop` to unsubscribe from daily updates.

## Commands

- `/start` - Subscribe to daily updates and welcome message.
- `/fixtures` - Get today's match fixtures.
- `/results` - Get yesterday's match results.
- `/stop` - Unsubscribe from daily updates.

## Prerequisites

- Python 3.8+
- A Telegram Bot Token. You can get one from BotFather.
- An API key for a football data provider (e.g., football-data.org, API-Football). This is used in `api.py`.

## Setup and Installation

1.  **Clone the repository:**
    ```sh
    git clone <your-repository-url>
    cd FootballBot
    ```

2.  **Create a virtual environment:**
    ```sh
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

3.  **Install dependencies:**
    Create a `requirements.txt` file with the following content:
    ```
    python-telegram-bot[job-queue]
    python-dotenv
    requests
    ```
    Then install them:
    ```sh
    pip install -r requirements.txt
    ```

4.  **Configure environment variables:**
    Create a `.env` file in the root directory of the project and add your secret keys:
    ```
    TELEGRAM_BOT_TOKEN="your_telegram_bot_token_here"
    FOOTBALL_API_KEY="your_football_api_key_here"
    ```

5.  **Run the bot:**
    ```sh
    python main.py  # Assuming you have a main.py that calls run_bot()
    ```

The bot will initialize, and you should see the message "Bot is running..." in your console. You can now interact with it on Telegram!