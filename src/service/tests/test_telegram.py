import pytest
from unittest.mock import patch, MagicMock
from aiohttp import web
from telegram.main import Neon_Nexus_AI_bot_webhook

@pytest.fixture
def telegram_webhook():
    return Neon_Nexus_AI_bot_webhook(
        token="test_token",
        webhook_url="https://test.com/webhook",
        service_url="https://test.com"
    )

@pytest.mark.asyncio
async def test_webhook_handler_success(telegram_webhook):
    telegram_webhook.process_message = MagicMock(return_value="Test response")
    telegram_webhook.send_telegram_message = MagicMock(return_value=True)
    
    mock_request = MagicMock()
    mock_request.json = MagicMock(return_value={
        "update_id": 123,
        "message": {
            "message_id": 456,
            "text": "test message",
            "chat": {"id": 789}
        }
    })
    
    response = await telegram_webhook.handle_webhook(mock_request)
    assert response.status == 200
    
    telegram_webhook.process_message.assert_called_once_with("test message")
    telegram_webhook.send_telegram_message.assert_called_once_with(789, "Test response")

@pytest.mark.asyncio
async def test_webhook_handler_error(telegram_webhook):
    mock_request = MagicMock()
    mock_request.json = MagicMock(side_effect=Exception("Invalid JSON"))
    
    response = await telegram_webhook.handle_webhook(mock_request)
    assert response.status == 500

def test_check_and_setup_webhook(telegram_webhook):
    with patch('requests.get') as mock_get, \
         patch('requests.post') as mock_post:
        
        mock_get.return_value.json.return_value = {
            'result': {'url': ''}
        }
        mock_post.return_value.status_code = 200
        
        telegram_webhook.check_and_setup_webhook()
        mock_post.assert_called_once()
