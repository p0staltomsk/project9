import aiohttp
import logging
import json
from typing import Dict, Any

logger = logging.getLogger(__name__)

class NeoAPI:
    API_URL = "https://api.neoapi.ai/analyze"

    def __init__(self, api_key: str) -> None:
        if not api_key:
            raise ValueError("NEO_API_KEY is required")
        self.api_key = api_key
        self.logger = logging.getLogger(__name__)

    async def analyze_text(self, text: str) -> Dict[str, Any]:
        """Анализирует текст через Neo API."""
        # Проверяем входной текст
        if not text or len(text.strip()) == 0:
            self.logger.warning("Empty text received from GROQ")
            return {
                "status": "error",
                "error": "Empty response from GROQ",
                "is_ai_generated": False,  # Важно для фронта
                "human_likeness_score": 0,
                "metrics": {}
            }

        self.logger.info(f"Starting analysis of text: {text[:50]}...")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "text": text,
            "project": "neoapi",
            "group": "playground",
            "analysis_slug": "playground",
            "prompt": "What is the meaning of life?",
            "full_metrics": True,
            "language": "auto"
        }

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(self.API_URL, json=payload, headers=headers) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        self.logger.error(f"API error {response.status}: {error_text}")
                        self.logger.error(f"Request payload: {json.dumps(payload, ensure_ascii=False)}")
                        return {
                            "status": "error",
                            "error": "Neo API analysis failed",
                            "is_ai_generated": False,  # Дефолтное значение
                            "human_likeness_score": 0,
                            "metrics": {}
                        }

                    data = await response.json()
                    self.logger.info(f"Got API response: {json.dumps(data, indent=2)}")

                    return {
                        "status": "success",
                        "text": text,
                        "is_ai_generated": data.get("is_ai_generated", False),
                        "human_likeness_score": data.get("human_likeness_score", 0),
                        "metrics": data.get("metrics", {})
                    }

        except Exception as e:
            self.logger.error(f"Error analyzing text: {e}")
            return {
                "status": "error",
                "error": "Neo API connection failed",
                "is_ai_generated": False,
                "human_likeness_score": 0,
                "metrics": {}
            }
