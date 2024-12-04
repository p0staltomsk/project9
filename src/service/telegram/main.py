import logging
import requests
import aiohttp
from aiohttp import web

logger = logging.getLogger(__name__)

class Neon_Nexus_AI_bot_webhook:
    def __init__(self, token: str, webhook_url: str, service_url: str):
        self.token = token
        self.webhook_url = webhook_url
        self.service_url = service_url  # URL нашего основного сервиса
        self.app = None

    async def send_telegram_message(self, chat_id: int, text: str) -> bool:
        """Отправка сообщения в Telegram"""
        try:
            response = requests.post(
                f"https://api.telegram.org/bot{self.token}/sendMessage",
                json={
                    "chat_id": chat_id,
                    "text": text
                }
            )
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Ошибка отправки сообщения: {str(e)}")
            return False

    async def process_message(self, text: str) -> str:
        """Обработка сообщения через основной сер��ис"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.service_url}/api/neo/chat",
                    json={"message": text}
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data.get('message', 'No response from service')
                    else:
                        logger.error(f"Service error: {response.status}")
                        return "Neural interface malfunction"
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            return "Neural interface connection error"

    async def handle_webhook(self, request: web.Request) -> web.Response:
        """Обработчик вебхука от Telegram"""
        try:
            update = await request.json()
            logger.info(f"Получен webhook update: {update}")
            
            # Проверяем наличие сообщения
            if 'message' in update and 'text' in update['message']:
                message = update['message']
                chat_id = message['chat']['id']
                text = message['text']
                
                logger.info(f"Обработка сообщения от chat_id {chat_id}: {text}")
                
                # Обрабатываем сообщение через основной сервис
                response_text = await self.process_message(text)
                await self.send_telegram_message(chat_id, response_text)
                
            return web.Response(status=200)
            
        except Exception as e:
            logger.error(f"Ошибка обработки вебхука: {str(e)}")
            return web.Response(status=500)

    def check_and_setup_webhook(self) -> None:
        """Проверка и настройка вебхука при запуске"""
        try:
            response = requests.get(
                f"https://api.telegram.org/bot{self.token}/getWebhookInfo"
            )
            webhook_info = response.json()
            
            current_url = webhook_info.get('result', {}).get('url', '')
            
            if not current_url or current_url != self.webhook_url:
                logger.info(f"Настройка вебхука на {self.webhook_url}")
                response = requests.post(
                    f"https://api.telegram.org/bot{self.token}/setWebhook",
                    data={"url": self.webhook_url}
                )
                if response.status_code == 200:
                    logger.info("Вебхук успешно настроен")
                else:
                    logger.error(f"Ошибка настройки вебхука: {response.text}")
            else:
                logger.info("Вебхук уже настроен корректно")
                
        except Exception as e:
            logger.error(f"Ошибка при проверке/настройке вебхука: {str(e)}")

    def get_routes(self) -> list:
        """Возвращает список роутов для интеграции в основное приложение"""
        return [web.post('/getmemore', self.handle_webhook)]
