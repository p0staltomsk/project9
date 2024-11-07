import os
import json
import logging
from typing import Dict
from neoapi import NeoApiClientSync

logger = logging.getLogger(__name__)

class NeoAPI:
    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("NEO_API_KEY is required")
        
        self.api_key = api_key
        self.client = NeoApiClientSync(api_key)
        self.logger = logging.getLogger(__name__)

    async def analyze_text(self, text: str) -> Dict:
        """
        Анализирует текст через Neo API.
        Возвращает метрики в формате:
        {
            "is_ai_generated": bool,
            "human_likeness_score": float,
            "metrics": {
                "coherence": float,
                "complexity": float,
                ...
            }
        }
        """
        try:
            self.logger.info(f"Analyzing text: {text[:50]}...")
            
            # Прямой вызов API без декоратора
            response = self.client.analyze(text)
            
            if not response:
                raise ValueError("Empty response from Neo API")
            
            if isinstance(response, dict) and "error" in response:
                raise ValueError(f"Neo API Error: {response['error']}")
            
            self.logger.info(f"Received analysis: {response}")
            return response

        except Exception as e:
            self.logger.error(f"Error in analyze_text: {e}")
            raise

    def __del__(self):
        """Закрываем клиент при удалении объекта"""
        try:
            self.client.stop()
        except:
            pass