import logging
import json
from typing import Dict, Any
try:
    from neoapi_sdk.client import NeoApiClientAsync
    from neoapi_sdk.tracking import track_llm_output
except ImportError:
    from neoapi_sdk import NeoApiClientAsync, track_llm_output
import asyncio

logger = logging.getLogger(__name__)

class NeoAPI:
    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("NEO_API_KEY is required")
        self.api_key = api_key
        self.logger = logging.getLogger(__name__)

    async def analyze_text(self, text: str) -> Dict[str, Any]:
        """Анализирует текст через Neo API используя асинхронный SDK."""
        self.logger.info(f"Starting analysis of text: {text[:50]}...")

        async with NeoApiClientAsync(api_key=self.api_key) as client:
            @track_llm_output(
                client=client,
                project="neoapi",
                group="playground",
                analysis_slug="playground",
                need_analysis_response=True,
                format_json_output=True
            )
            async def analyze_with_neo(text_to_analyze: str) -> str:
                return text_to_analyze

            # Делаем запрос
            await analyze_with_neo(text)
            await asyncio.sleep(1)

            # Получаем ответ из client.logger.records
            if hasattr(client, 'logger'):
                for record in client.logger.records:
                    if isinstance(record, str) and "Analysis Response:" in record:
                        json_str = record.split("Analysis Response:", 1)[1].strip()
                        if json_str.startswith('\n'):
                            json_str = json_str[1:]
                        return dict(json.loads(json_str))

            # Если не нашли в client.logger, ищем стандартном логгере
            neo_logger = logging.getLogger('neoapi.client_async')
            for handler in neo_logger.handlers:
                if isinstance(handler, logging.StreamHandler):
                    log_output = handler.stream.getvalue() if hasattr(handler.stream, 'getvalue') else ''
                    for line in log_output.split('\n'):
                        if "Analysis Response:" in line:
                            json_str = line.split("Analysis Response:", 1)[1].strip()
                            return dict(json.loads(json_str))

            # Если всё проебалось, хотя бы логируем это
            self.logger.error("Failed to get response from any source")
            return {}
