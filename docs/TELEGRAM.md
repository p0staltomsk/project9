# Telegram Bot Integration

## Overview

The Neon Nexus AI Chat project includes a Telegram bot integration (@Neon_Nexus_AI_bot) that allows users to interact with the AI system directly through Telegram. The bot processes messages using the same AI pipeline as the web interface.

## Architecture

The Telegram integration is implemented using webhooks, which allows our service to receive updates from Telegram in real-time. Here's how it works:

1. User sends a message to @Neon_Nexus_AI_bot
2. Telegram forwards the message to our webhook endpoint
3. Our service processes the message using the Grog AI and Neo API
4. The response is sent back to the user through Telegram

## Technical Implementation

The integration is built using:
- Python's `aiohttp` for handling webhook requests
- Telegram Bot API for message processing
- Webhook-based architecture for real-time updates

Key components:
- `src/service/telegram/main.py` - Main bot logic and webhook handler
- `src/service/tests/test_telegram.py` - Test coverage for bot functionality

## Setup

1. Get a Telegram Bot Token from @BotFather
2. Configure environment variables:

```env
TELEGRAM_BOT_TOKEN=your_bot_token
WEBHOOK_URL=https://your-domain.com/webhook
```

3. The bot will automatically configure the webhook on startup

## Features

- Real-time message processing
- Same AI capabilities as web interface
- Cyberpunk-themed responses
- Error handling and logging
- Automatic webhook management

## Security

The bot implementation includes:
- Token validation
- HTTPS webhook endpoints
- Request validation
- Error handling and logging
- Rate limiting

## Testing

The bot functionality is covered by unit tests in `src/service/tests/test_telegram.py`. Run tests using:

```bash
cd src/service
pytest tests/test_telegram.py
``` 