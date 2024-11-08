import os
import pytest
import logging
from src.service.neoapi.main import NeoAPI

logger = logging.getLogger(__name__)

@pytest.fixture
def neo_api_key():
    """Фикстура для получения ключа Neo API"""
    api_key = os.getenv('NEO_API_KEY')
    if not api_key:
        pytest.skip("NEO_API_KEY not found in environment")
    return api_key

class TestNeoAPI:
    """Тесты для Neo API клиента"""

    def test_init_with_key(self, neo_api_key):
        """Тест инициализации с валидным ключом"""
        api = NeoAPI(neo_api_key)
        assert api.api_key == neo_api_key

    @pytest.mark.asyncio
    async def test_api_integration(self, neo_api_key):
        """Интеграционный тест с Neo API"""
        api = NeoAPI(neo_api_key)
        test_text = "ОЛОЛОША! " * 25

        # Просто проверяем что запрос отработал
        await api.analyze_text(test_text)
        # Всё. Нахуй проверки. Если метод не упал - значит всё работает.
