# mypy: ignore-errors
import os
import json
import logging
from typing import Dict, Optional, List, Any
import requests
import asyncio

logger = logging.getLogger(__name__)

class GroqAPI:
    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("GROQ_API_KEY is required")
        self.api_key = api_key
        self.base_url = 'https://api.groq.com/openai/v1/chat/completions'
        self.model = 'mixtral-8x7b-32768'

    async def get_response(self, message: str, context: Optional[List[Dict[str, str]]] = None, max_retries: int = 3) -> str:
        """
        Асинхронно получает ответ от Groq API с учетом контекста диалога.

        Args:
            message: Текст сообщения
            context: Список предыдущих сообщений в формате [{role: str, content: str}]
            max_retries: Максимальное количество попыток

        Returns:
            str: Ответ от API

        Raises:
            Exception: При ошибке запроса к API
        """
        for attempt in range(max_retries):
            try:
                logger.info(f"Attempt {attempt + 1}/{max_retries} - Sending request to Groq API: {message[:50]}...")

                messages = context if context else []
                if not context:
                    messages = [{'role': 'user', 'content': message}]

                response = requests.post(
                    self.base_url,
                    headers={
                        'Authorization': f'Bearer {self.api_key}',
                        'Content-Type': 'application/json'
                    },
                    json={
                        'model': self.model,
                        'messages': messages,
                        'temperature': 0.7,
                        'max_tokens': 1000
                    },
                    timeout=30
                )

                if response.status_code == 503:
                    if attempt < max_retries - 1:
                        await asyncio.sleep(1)  # Пауза перед повторной попыткой
                        continue

                if response.status_code != 200:
                    error_msg = f"Groq API Error: {response.status_code} - {response.text}"
                    logger.error(error_msg)
                    raise Exception(error_msg)

                result = response.json()
                content: str = result['choices'][0]['message']['content']
                logger.info(f"Received response from Groq API: {content[:50]}...")
                return content

            except Exception as e:
                if attempt < max_retries - 1:
                    logger.warning(f"Attempt {attempt + 1} failed: {str(e)}")
                    await asyncio.sleep(1)
                    continue
                logger.error(f"Error in Groq API request: {str(e)}")
                raise

        return "Failed to get response after all retries"  # Добавлен возвращаемый результат по умолчанию
