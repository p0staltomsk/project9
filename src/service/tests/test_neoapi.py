import os
import pytest
import logging
from unittest.mock import patch, MagicMock
from src.service.neoapi.main import NeoAPI

logger = logging.getLogger(__name__)

# Константы для тестов
TEST_TEXT = """
This is a static test message that will be used for Neo API analysis.
It should be long enough to get meaningful metrics and consistent results.
The text should represent a typical message that would be analyzed in production.
"""

EXPECTED_METRICS = {
    "is_ai_generated": True,
    "human_likeness_score": 0.85,
    "metrics": {
        "coherence": 0.9,
        "complexity": 0.7,
        "sentiment": "neutral",
        "formality": 0.6,
        "toxicity": 0.1
    }
}

@pytest.fixture
def neo_api_key():
    """Фикстура для получения ключа Neo API"""
    api_key = os.getenv('NEO_API_KEY')
    if not api_key:
        pytest.skip("NEO_API_KEY not found in environment")
    return api_key

@pytest.fixture
def mock_neo_client():
    """Фикстура для мока Neo API клиента"""
    with patch('neoapi.NeoApiClientSync') as mock:
        client = mock.return_value
        # Настраиваем мок для возврата ожидаемых метрик
        client.analyze.return_value = EXPECTED_METRICS
        client.flush = MagicMock()
        client.stop = MagicMock()
        yield client

class TestNeoAPI:
    """Тесты для Neo API клиента"""

    def test_init_with_key(self, neo_api_key):
        """Тест инициализации с валидным ключом"""
        api = NeoAPI(neo_api_key)
        assert api.api_key == neo_api_key
        assert api.client is not None

    def test_init_without_key(self):
        """Тест инициализации без ключа"""
        with pytest.raises(ValueError, match="NEO_API_KEY is required"):
            NeoAPI("")

    @pytest.mark.asyncio
    async def test_analyze_text_mock(self, neo_api_key, mock_neo_client):
        """Тест анализа текста с моком"""
        api = NeoAPI(neo_api_key)
        api.client = mock_neo_client
        
        result = await api.analyze_text(TEST_TEXT)
        
        # Проверяем вызов метода analyze с правильным текстом
        mock_neo_client.analyze.assert_called_once_with(TEST_TEXT)
        
        # Проверяем структуру ответа
        assert result == EXPECTED_METRICS
        assert isinstance(result['human_likeness_score'], float)
        assert isinstance(result['metrics'], dict)
        assert all(metric in result['metrics'] for metric in [
            'coherence', 'complexity', 'sentiment', 'formality', 'toxicity'
        ])

    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_real_api_integration(self, neo_api_key):
        """Интеграционный тест с реальным Neo API"""
        api = NeoAPI(neo_api_key)
        result = await api.analyze_text(TEST_TEXT)
        
        logger.info(f"Received analysis from Neo API: {result}")
        
        # Проверяем структуру ответа от реального API
        assert isinstance(result, dict)
        assert 'is_ai_generated' in result
        assert 'human_likeness_score' in result
        assert 'metrics' in result
        
        # Проверяем типы данных в метриках
        assert isinstance(result['human_likeness_score'], float)
        assert isinstance(result['metrics'], dict)
        assert all(isinstance(result['metrics'].get(metric), float) 
                  for metric in ['coherence', 'complexity'])

    def test_cleanup(self, neo_api_key, mock_neo_client):
        """Тест очистки ресурсов"""
        api = NeoAPI(neo_api_key)
        api.client = mock_neo_client
        
        api.__del__()
        mock_neo_client.stop.assert_called_once()

if __name__ == '__main__':
    pytest.main(['-v', __file__])