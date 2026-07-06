import os
import datetime
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes
from database import init_db, add_user, remove_user, get_all_users
from api import get_today_fixtures, get_yesterday_results, format_fixtures, format_results

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    add_user(chat_id)
    await context.bot.send_message(
        chat_id=chat_id,
        text="Welcome to the Football Bot! ⚽\nYou are now subscribed to daily fixtures and results.\n\nCommands:\n/fixtures - Get today's fixtures\n/results - Get yesterday's results\n/stop - Unsubscribe"
    )

async def stop(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    remove_user(chat_id)
    await context.bot.send_message(
        chat_id=chat_id,
        text="You have been unsubscribed from daily updates."
    )

async def fixtures(update: Update, context: ContextTypes.DEFAULT_TYPE):
    fixes = get_today_fixtures()
    await context.bot.send_message(
        chat_id=update.effective_chat.id,
        text=format_fixtures(fixes),
        parse_mode="HTML"
    )

async def results(update: Update, context: ContextTypes.DEFAULT_TYPE):
    res = get_yesterday_results()
    await context.bot.send_message(
        chat_id=update.effective_chat.id,
        text=format_results(res),
        parse_mode="HTML"
    )

async def daily_update(context: ContextTypes.DEFAULT_TYPE):
    users = get_all_users()
    if not users:
        return
    
    fixes = get_today_fixtures()
    res = get_yesterday_results()
    
    msg = format_results(res) + "\n\n" + format_fixtures(fixes)
    
    for user_id in users:
        try:
            await context.bot.send_message(chat_id=user_id, text=msg, parse_mode="HTML")
        except Exception as e:
            print(f"Failed to send to {user_id}: {e}")

def run_bot():
    token = os.getenv('TELEGRAM_BOT_TOKEN')
    if not token:
        print("Error: TELEGRAM_BOT_TOKEN environment variable not set.")
        return

    init_db()
    
    app = ApplicationBuilder().token(token).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("stop", stop))
    app.add_handler(CommandHandler("fixtures", fixtures))
    app.add_handler(CommandHandler("results", results))

    # Schedule daily update at 8:00 AM UTC
    t = datetime.time(hour=8, minute=0, second=0)
    app.job_queue.run_daily(daily_update, time=t)

    print("Bot is running...")
    app.run_polling()
