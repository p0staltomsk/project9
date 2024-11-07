import os
import pytest
import logging
from unittest.mock import patch, MagicMock
from src.service.grog.main import GroqAPI

logger = logging.getLogger(__name__)

@pytest.fixture
def groq_api_key():
    """Фикстура для получения ключа Groq API"""
    api_key = os.getenv('GROQ_API_KEY')
    if not api_key:
        pytest.skip("GROQ_API_KEY not found in environment")
    return api_key

@pytest.fixture
def mock_groq_response():
    """Фикстура с моком ответа от Groq API"""
    return {
        'choices': [{
            'message': {
                'content': 'Test response from mock'
            }
        }]
    }

@pytest.fixture
def mock_requests():
    """Фикстура для мока requests"""
    with patch('requests.post') as mock:
        response = MagicMock()
        response.status_code = 200
        response.json.return_value = {
            'choices': [{'message': {'content': 'Test response'}}]
        }
        mock.return_value = response
        yield mock

class TestGroqAPI:
    """Тесты для Groq API клиента"""

    def test_init_with_key(self, groq_api_key):
        """Тест инициализации с валидным ключом"""
        api = GroqAPI(groq_api_key)
        assert api.api_key == groq_api_key
        assert api.base_url == 'https://api.groq.com/openai/v1/chat/completions'

    def test_init_without_key(self):
        """Тест инициализации без ключа"""
        with pytest.raises(ValueError):
            GroqAPI("")

    @pytest.mark.asyncio
    async def test_get_response_mock(self, groq_api_key, mock_requests):
        """Тест получения ответа с моком"""
        api = GroqAPI(groq_api_key)
        response = await api.get_response("Test message")
        
        assert response == "Test response"
        mock_requests.assert_called_once()
        
        # Проверяем параметры запроса
        call_kwargs = mock_requests.call_args[1]
        assert 'messages' in call_kwargs['json']
        assert call_kwargs['json']['messages'][0]['content'] == "Test message"

    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_real_api_integration(self, groq_api_key):
        """Интеграционный тест с реальным Groq API"""
        api = GroqAPI(groq_api_key)
        test_message = "What is Python programming language?"
        
        response = await api.get_response(test_message)
        
        assert response
        assert len(response) > 50
        assert "Python" in response
        logger.info(f"Received response from Groq API: {response[:100]}...")

    @pytest.mark.asyncio
    async def test_error_handling(self, groq_api_key, mock_requests):
        """Тест обработки ошибок"""
        mock_requests.return_value.status_code = 401
        mock_requests.return_value.text = "Unauthorized"
        
        api = GroqAPI(groq_api_key)
        with pytest.raises(Exception) as exc_info:
            await api.get_response("Test message")
        assert "Groq API Error: 401" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_specific_question(self, groq_api_key):
        """Тест с конкретным вопросом для проверки ответа модели"""
        api = GroqAPI(groq_api_key)
        question = "Who are you?"
        
        response = await api.get_response(question)
        
        logger.info(f"Question: {question}")
        logger.info(f"Full Groq API response: {response}")
        
        # Проверяем только базовые характеристики ответа
        assert response, "Response should not be empty"
        assert len(response) > 20, "Response should be meaningful"
        assert isinstance(response, str), "Response should be a string"
        assert "." in response, "Response should be a complete sentence"

if __name__ == '__main__':
    pytest.main(['-v', __file__])