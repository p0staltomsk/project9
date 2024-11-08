import os
import json
import pytest
import aiohttp
import logging
from typing import Dict

logger = logging.getLogger(__name__)
pytestmark = pytest.mark.asyncio

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
        return False
    return True

@pytest.mark.asyncio
async def test_health_check(http_client):
    """Тест health endpoint"""
    async with http_client.get('http://localhost:8000/health') as response:
        assert response.status == 200
        data = await response.json()
        assert data['status'] == 'ok'

@pytest.mark.asyncio
async def test_chat_endpoint(http_client):
    """Тест chat endpoint"""
    # Проверяем переменные окружения
    if not check_environment():
        pytest.skip("Required environment variables not set")

    # Тестируем чат
    async with http_client.post(
        'http://localhost:8000/chat',
        json={'message': 'test message'}
    ) as response:
        assert response.status == 200
        data = await response.json()
        assert data['status'] == 'success'
        assert 'id' in data
        assert 'message' in data

if __name__ == '__main__':
    pytest.main(['-v', __file__])
