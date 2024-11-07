import os
import json
import asyncio
import logging
import datetime
from aiohttp import web
import websockets
from typing import Dict, Set
from dotenv import load_dotenv
from .grog.main import GroqAPI
from .neoapi.main import NeoAPI

# Загружаем переменные окружения
load_dotenv()

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ServiceHandler:
    def __init__(self):
        self.ws_connections: Set[websockets.WebSocketServerProtocol] = set()
        self.groq_api = GroqAPI(os.getenv('GROQ_API_KEY'))
        self.neo_api = NeoAPI(os.getenv('NEO_API_KEY'))
        logger.info("ServiceHandler initialized")

    async def broadcast_metrics(self, message_id: str, metrics: Dict):
        """Отправка метрик всем подключенным клиентам"""
        logger.info(f"Broadcasting metrics for message {message_id}")
        
        if not self.ws_connections:
            logger.warning("No WebSocket connections available")
            return

        message = json.dumps({
            "type": "metrics",
            "message_id": message_id,
            "data": metrics
        })

        # Отправляем метрики всем подключенным клиентам
        disconnected = set()
        sent_count = 0
        for ws in self.ws_connections:
            try:
                await ws.send(message)
                sent_count += 1
                logger.info(f"Sent metrics to WebSocket client")
            except websockets.exceptions.ConnectionClosed:
                logger.warning("WebSocket connection closed")
                disconnected.add(ws)
            except Exception as e:
                logger.error(f"Error sending metrics: {e}")
                disconnected.add(ws)
        
        # Удаляем отключенные соединения
        self.ws_connections -= disconnected
        logger.info(f"Metrics broadcast complete. Sent to {sent_count} clients")

    async def handle_chat(self, request: web.Request) -> web.Response:
        try:
            # Пробуем распарсить JSON
            try:
                data = await request.json()
            except json.JSONDecodeError:
                return web.json_response(
                    {"error": "Invalid JSON format"}, 
                    status=400
                )

            # Проверяем наличие сообщения
            message = data.get('message')
            if not message:
                return web.json_response(
                    {"error": "No message provided"}, 
                    status=400
                )

            try:
                # Получаем ответ от Groq
                ai_response = await self.groq_api.get_response(message)
                message_id = str(hash(ai_response))

                # Анализируем через Neo API
                try:
                    metrics = await self.neo_api.analyze_text(ai_response)
                    # Отправляем метрики через WebSocket
                    await self.broadcast_metrics(message_id, metrics)
                except Exception as e:
                    logger.error(f"Error analyzing text: {e}")
                    # Продолжаем выполнение даже если анализ не удался
                    metrics = {"error": str(e)}

                return web.json_response({
                    "id": message_id,
                    "message": ai_response,
                    "status": "success",
                    "metrics": metrics
                })
                
            except Exception as e:
                logger.error(f"Error processing message: {e}")
                return web.json_response(
                    {"error": str(e)}, 
                    status=500
                )
                
        except Exception as e:
            logger.error(f"Error processing chat request: {e}")
            return web.json_response(
                {"error": str(e)}, 
                status=500
            )

    async def register_websocket(self, websocket: websockets.WebSocketServerProtocol):
        """Регистрация WebSocket соединения"""
        logger.info("New WebSocket connection established")
        self.ws_connections.add(websocket)
        try:
            await websocket.wait_closed()
        finally:
            self.ws_connections.remove(websocket)
            logger.info("WebSocket connection closed")

async def health_check(request: web.Request) -> web.Response:
    """Простая проверка здоровья сервиса"""
    return web.json_response({
        "status": "ok",
        "timestamp": datetime.datetime.utcnow().isoformat()
    })

async def start_service(host: str = "", port: int = 8000, ws_port: int = 8001):
    try:
        # Создаем приложение
        app = web.Application()
        handler = ServiceHandler()
        
        # Routes
        app.router.add_get('/health', health_check)
        app.router.add_post('/chat', handler.handle_chat)
        
        # Start HTTP server
        runner = web.AppRunner(app)
        await runner.setup()
        site = web.TCPSite(runner, host, port)
        await site.start()
        
        # Start WebSocket server
        ws_server = await websockets.serve(
            handler.register_websocket, 
            host, 
            ws_port
        )
        
        logger.info(f"Service started - HTTP: {port}, WebSocket: {ws_port}")
        
        # Запускаем бесконечный цикл
        await asyncio.Future()
        
    except Exception as e:
        logger.error(f"Failed to start service: {e}")
        raise

if __name__ == "__main__":
    try:
        asyncio.run(start_service())
    except KeyboardInterrupt:
        logger.info("Service stopped by user")
    except Exception as e:
        logger.error(f"Service crashed: {e}")
        raise