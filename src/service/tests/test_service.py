import pytest
from aiohttp import web
from unittest.mock import AsyncMock, patch

from src.service.main import ServiceHandler, health_check

@pytest.fixture
async def app():
    """Фикстура для создания тестового приложения"""
    app = web.Application()
    handler = ServiceHandler()

    app.router.add_get('/health', health_check)
    app.router.add_post('/chat', handler.handle_chat)

    return app

@pytest.fixture
async def client(aiohttp_client, app):
    """Фикстура для создания тестового клиента"""
    return await aiohttp_client(app)

class TestServiceUnit:
    """Базовые тесты сервиса"""

    async def test_health_check(self, client):
        """Проверка что health endpoint работает"""
        resp = await client.get('/health')
        assert resp.status == 200
        data = await resp.json()
        assert data['status'] == 'ok'

    async def test_chat_validation(self, client):
        """Проверка базовой валидации входных данных"""
        # Пустое сообщение
        resp = await client.post('/chat', json={'message': ''})
        assert resp.status == 400

        # Отсутствует поле message
        resp = await client.post('/chat', json={'wrong_field': 'test'})
        assert resp.status == 400

    # TODO: Добавить тесты WebSocket функционала после реализации
    # async def test_websocket_handling(self):
    #     """Проверка работы с WebSocket соединениями"""
    #     pass

if __name__ == '__main__':
    pytest.main(['-v', __file__])
