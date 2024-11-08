import os
import pytest
import logging
import json
from src.service.neoapi.main import NeoAPI

logger = logging.getLogger(__name__)

@pytest.fixture
def neo_api_key() -> str:
    """Фикстура для получения ключа Neo API"""
    api_key = os.getenv('NEO_API_KEY')
    if not api_key:
        pytest.skip("NEO_API_KEY not found in environment")
    return api_key

class TestNeoAPI:
    """Тесты для Neo API клиента"""

    def test_init_with_key(self, neo_api_key: str) -> None:
        """Тест инициализации с валидным ключом"""
        api = NeoAPI(neo_api_key)
        assert api.api_key == neo_api_key

    def test_init_without_key(self) -> None:
        """Тест инициализации без ключа"""
        with pytest.raises(ValueError):
            NeoAPI("")

    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_analyze_text_integration(self, neo_api_key: str) -> None:
        """Интеграционный тест с реальным API"""
        api = NeoAPI(neo_api_key)
        test_text = "ОЛОЛОША! " * 25

        # Отправляем запрос
        result = await api.analyze_text(test_text)
        logger.info(f"Got API response: {json.dumps(result, indent=2)}")

        # Проверяем структуру
        assert isinstance(result, dict)
        assert result["status"] == "success"
        assert result["is_ai_generated"] is True
        assert isinstance(result["human_likeness_score"], (int, float))
        assert "metrics" in result

        # Проверяем все нужные метрики
        metrics = result["metrics"]
        expected_metrics = [
            "text_coherence_complexity",
            "readability_metrics",
            "vocabulary_lexical_diversity",
            "topic_modeling_analysis",
            "sentiment_subjectivity",
            "stylistic_features",
            "statistical_metrics",
            "ai_signature_analysis",
            "structural_analysis"
        ]

        for metric in expected_metrics:
            assert metric in metrics, f"Missing metric: {metric}"
