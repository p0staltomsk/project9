import os
import json
import logging
import asyncio
from typing import Dict
from neoapi import NeoApiClientAsync, track_llm_output

logger = logging.getLogger(__name__)

class NeoAPI:
    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("NEO_API_KEY is required")
        self.api_key = api_key
        self.logger = logging.getLogger(__name__)

    async def analyze_text(self, text: str) -> Dict:
        """
        Анализирует текст через Neo API используя асинхронный SDK.
        """
        try:
            self.logger.info(f"Starting analysis of text: {text[:50]}...")
            result = {}

            async with NeoApiClientAsync(api_key=self.api_key) as client:
                self.logger.debug("Neo API async client created")

                @track_llm_output(
                    client=client,
                    project="chatbot",
                    need_analysis_response=True
                )
                async def analyze_with_neo(text_to_analyze: str) -> str:
                    self.logger.debug("Executing async analysis")
                    return text_to_analyze

                # Вызываем асинхронную функцию
                self.logger.debug("Calling async analysis")
                await analyze_with_neo(text)
                
                # Ждем результатов
                await asyncio.sleep(1)  # Даем время на обработку

                # Получаем результаты из логов
                if hasattr(client, 'logger') and hasattr(client.logger, 'records'):
                    for record in client.logger.records:
                        self.logger.debug(f"Processing log record: {record}")
                        if isinstance(record, str) and "Analysis Response:" in record:
                            json_str = record.split("Analysis Response:")[1].strip()
                            result = json.loads(json_str)
                            self.logger.info(f"Analysis complete: {result}")
                            return result

                if not result:
                    self.logger.warning("No analysis results found in logs")
                    raise ValueError("No analysis results received")

            return result

        except Exception as e:
            self.logger.error(f"Error in analyze_text: {str(e)}")
            raise

    def __del__(self):
        """Cleanup"""
        pass