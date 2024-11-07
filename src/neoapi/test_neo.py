import os
import json
import time
import pytest
import logging
from dotenv import load_dotenv
from neoapi import NeoApiClientSync, track_llm_output

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

load_dotenv()

def get_analysis_from_logs(log_output: str, max_attempts: int = 3) -> dict:
    """Извлекает JSON анализа из логов с несколькими попытками"""
    for attempt in range(max_attempts):
        if "Analysis Response:" in log_output:
            try:
                json_str = log_output.split("Analysis Response:")[1].strip()
                return json.loads(json_str)
            except json.JSONDecodeError:
                logger.debug(f"Failed to parse JSON on attempt {attempt + 1}")
                time.sleep(1)
        else:
            logger.debug(f"No Analysis Response found in logs on attempt {attempt + 1}")
            time.sleep(1)
    return None

@pytest.fixture
def neo_client():
    neo_api_key = os.getenv('NEO_API_KEY')
    if not neo_api_key:
        pytest.skip("NEO_API_KEY not found in .env")
    return neo_api_key

@pytest.fixture
def caplog(caplog):
    caplog.set_level(logging.DEBUG)
    return caplog

def test_neo_api(neo_client, caplog):
    logger.info("\n=== Testing Neo API SDK ===")
    logger.info(f"✓ Found NEO_API_KEY: {neo_client[:10]}...")
    
    test_response = """GraphQL is a query language and runtime for APIs that was developed by Facebook. 
    It allows clients to define the structure of the data they want to retrieve."""
    
    with NeoApiClientSync(neo_client) as client:
        logger.info("✓ Neo API client initialized")
        
        @track_llm_output(
            client=client,
            need_analysis_response=True,
            format_json_output=True,
            project="test_project"
        )
        def get_llm_response() -> str:
            return test_response
        
        logger.info("\nSending text for analysis...")
        get_llm_response()
        
        # Ждем обработки и сбрасываем очередь
        client.flush()
        time.sleep(2)  # Даем время на получение и логирование ответа
        
        # Получаем результат анализа из логов pytest
        log_output = "\n".join(record.message for record in caplog.records)
        analysis = get_analysis_from_logs(log_output)
        
        # Проверяем наличие трёх обязательных полей
        assert analysis is not None, f"No analysis response found in logs. Available logs:\n{log_output}"
        assert 'is_ai_generated' in analysis, "Missing is_ai_generated field"
        assert 'human_likeness_score' in analysis, "Missing human_likeness_score field"
        assert 'metrics' in analysis, "Missing metrics field"
        
        logger.info("✓ All required fields found")
        logger.info(f"Analysis results: {json.dumps(analysis, indent=2)}")

if __name__ == "__main__":
    # Для прямого запуска используем другой способ логирования
    log_capture = []
    
    class LogCaptureHandler(logging.Handler):
        def emit(self, record):
            message = record.getMessage()
            log_capture.append(message)
            print(message)
    
    neo_logger = logging.getLogger('neoapi.client_sync')
    handler = LogCaptureHandler()
    neo_logger.addHandler(handler)
    
    pytest.main([__file__, '-v', '-s'])