import os
import json
import pytest
import aiohttp
import asyncio
import logging
import websockets
from typing import Dict

# Настройка логирования
logger = logging.getLogger(__name__)

# Настройка pytest-asyncio
pytestmark = pytest.mark.asyncio

@pytest.fixture
async def websocket():
    """Фикстура для WebSocket соединения"""
    async with websockets.connect('ws://localhost:8001') as ws:
        logger.info("WebSocket connection established")
        yield ws
        logger.info("WebSocket connection closed")

@pytest.fixture
async def http_client():
    """Фикстура для HTTP клиента"""
    async with aiohttp.ClientSession() as session:
        yield session

def check_environment():
    """Проверка наличия необходимых переменных окружения"""
    required_vars = ['GROQ_API_KEY', 'NEO_API_KEY']
    missing = [var for var in required_vars if not os.getenv(var)]
    
    if missing:
        logger.warning(f"Missing environment variables: {', '.join(missing)}")
        logger.warning("Some integration tests will be skipped")
        return True  # Продолжаем выполнение базовых тестов
    
    logger.info("All required environment variables found")
    return True

@pytest.mark.asyncio
async def test_health_check(http_client):
    """Тест health endpoint - не требует API ключей"""
    async with http_client.get('http://localhost:8000/health') as response:
        assert response.status == 200
        data = await response.json()
        assert data['status'] == 'ok'
        assert 'timestamp' in data

@pytest.mark.asyncio
async def test_chat_endpoint(http_client):
    """Тест chat endpoint - базовая функциональность"""
    # Тест валидного сообщения
    async with http_client.post(
        'http://localhost:8000/chat',
        json={'message': 'test message'}
    ) as response:
        assert response.status == 200
        data = await response.json()
        assert data['status'] == 'success'
        assert 'id' in data
        assert 'message' in data

@pytest.mark.asyncio
async def test_websocket_connection(websocket):
    """Тест WebSocket соединения - базовая функциональность"""
    assert websocket.open

@pytest.mark.integration
@pytest.mark.skipif(not os.getenv('GROQ_API_KEY'), reason="GROQ_API_KEY not set")
async def test_groq_integration(http_client):
    """Интеграционный тест с Groq API"""
    # ... тест с реальным API ...

@pytest.mark.integration
@pytest.mark.skipif(not os.getenv('NEO_API_KEY'), reason="NEO_API_KEY not set")
async def test_neo_integration(http_client, websocket):
    """Интеграционный тест с Neo API"""
    # ... тест с реальным API ...

if __name__ == '__main__':
    pytest.main(['-v', __file__])