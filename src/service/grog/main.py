import os
import json
import logging
import requests
import asyncio
from typing import Dict, Optional

logger = logging.getLogger(__name__)

class GroqAPI:
    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("GROQ_API_KEY is required")
        self.api_key = api_key
        self.base_url = 'https://api.groq.com/openai/v1/chat/completions'
        self.model = 'mixtral-8x7b-32768'

    async def get_response(self, message: str, max_retries: int = 3) -> str:
        """
        Асинхронно получает ответ от Groq API с повторными попытками.
        """
        for attempt in range(max_retries):
            try:
                logger.info(f"Attempt {attempt + 1}/{max_retries} - Sending request to Groq API: {message[:50]}...")
                
                response = requests.post(
                    self.base_url,
                    headers={
                        'Authorization': f'Bearer {self.api_key}',
                        'Content-Type': 'application/json'
                    },
                    json={
                        'model': self.model,
                        'messages': [{'role': 'user', 'content': message}],
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
                content = result['choices'][0]['message']['content']
                logger.info(f"Received response from Groq API: {content[:50]}...")
                return content

            except Exception as e:
                if attempt < max_retries - 1:
                    logger.warning(f"Attempt {attempt + 1} failed: {str(e)}")
                    await asyncio.sleep(1)
                    continue
                logger.error(f"Error in Groq API request: {str(e)}")
                raise