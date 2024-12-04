import pytest
from aiohttp import web
from typing import AsyncGenerator, Any
import sys
from pathlib import Path

# Добавляем путь к корневой директории сервиса
service_dir = Path(__file__).parent.parent
sys.path.insert(0, str(service_dir))

# Теперь импортируем из пакета service
from service.main import ServiceHandler, health_check

@pytest.fixture
async def app() -> web.Application:
    """Фикстура для создания тестового приложения"""
    app = web.Application()
    handler = ServiceHandler()

    app.router.add_get('/health', health_check)
    app.router.add_post('/chat', handler.handle_chat)

    return app

@pytest.fixture
async def client(aiohttp_client: Any, app: web.Application) -> AsyncGenerator:
    """Фикстура для создания тестового клиента"""
    return await aiohttp_client(app)

class TestServiceUnit:
    """Базовые тесты сервиса"""

    async def test_health_check(self, client: Any) -> None:
        """Проверка что health endpoint работает"""
        resp = await client.get('/health')
        assert resp.status == 200
        data = await resp.json()
        assert data['status'] == 'ok'

    async def test_chat_validation(self, client: Any) -> None:
        """Проверка базовой валидации входных данных"""
        # Пустое сообщение
        resp = await client.post('/chat', json={'message': ''})
        assert resp.status == 400

        # Отсутствует поле message
        resp = await client.post('/chat', json={'wrong_field': 'test'})
        assert resp.status == 400

if __name__ == '__main__':
    pytest.main(['-v', __file__])
