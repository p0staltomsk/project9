import pytest
from aiohttp import web
from unittest.mock import Mock, patch

from src.service.main import ServiceHandler, health_check

@pytest.fixture
async def app():
    """Фикстура для создания тестового приложения"""
    app = web.Application()
    handler = ServiceHandler()
    
    # Добавляем routes
    app.router.add_get('/health', health_check)
    app.router.add_post('/chat', handler.handle_chat)
    
    return app

@pytest.fixture
async def client(aiohttp_client, app):
    """Фикстура для создания тестового клиента"""
    return await aiohttp_client(app)

class TestServiceUnit:
    """Модульные тесты сервиса"""

    async def test_health_check(self, client):
        """Тест health endpoint"""
        resp = await client.get('/health')
        assert resp.status == 200
        
        data = await resp.json()
        assert data['status'] == 'ok'
        assert 'timestamp' in data

    async def test_chat_empty_message(self, client):
        """Тест обработки пустого сообщения"""
        resp = await client.post('/chat', json={'message': ''})
        assert resp.status == 400
        
        data = await resp.json()
        assert 'error' in data

    async def test_chat_invalid_json(self, client):
        """Тест обработки невалидного JSON"""
        resp = await client.post('/chat', data='invalid json')
        assert resp.status == 400

    async def test_chat_missing_message(self, client):
        """Тест отсутствующего поля message"""
        resp = await client.post('/chat', json={'wrong_field': 'test'})
        assert resp.status == 400

    @pytest.mark.integration
    async def test_chat_success(self, client):
        """Интеграционный тест успешной обработки сообщения"""
        test_message = "Test message"
        resp = await client.post('/chat', json={'message': test_message})
        assert resp.status == 200
        
        data = await resp.json()
        assert data['status'] == 'success'
        assert 'id' in data
        assert 'message' in data

if __name__ == '__main__':
    pytest.main(['-v', __file__]) 