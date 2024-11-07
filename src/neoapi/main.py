import os
import json
import asyncio
import logging
import requests
import websockets
from http.server import HTTPServer, BaseHTTPRequestHandler
from dotenv import load_dotenv
from typing import Dict, Any, Set
from neoapi import NeoApiClientSync
import threading

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

load_dotenv()

def get_analysis_from_logs(log_output: str) -> dict:
    """Извлекает JSON анализа из логов Neo API"""
    if "Analysis Response:" in log_output:
        try:
            json_str = log_output.split("Analysis Response:")[1].strip()
            return json.loads(json_str)
        except json.JSONDecodeError:
            return None
    return None

class WebSocketManager:
    def __init__(self):
        self.connections: Set[websockets.WebSocketServerProtocol] = set()
        self.server = None
    
    async def register(self, websocket: websockets.WebSocketServerProtocol):
        self.connections.add(websocket)
        try:
            await websocket.wait_closed()
        finally:
            self.connections.remove(websocket)
    
    async def broadcast_metrics(self, message_id: str, metrics: Dict):
        if not self.connections:
            return
        
        message = json.dumps({
            "type": "metrics",
            "message_id": message_id,
            "data": metrics
        })
        
        await asyncio.gather(
            *[connection.send(message) for connection in self.connections]
        )

class UnifiedAPIHandler:
    def __init__(self, ws_manager: WebSocketManager):
        self.groq_api_key = os.getenv('GROQ_API_KEY')
        self.neo_api_key = os.getenv('NEO_API_KEY')
        self.ws_manager = ws_manager
        
        if not self.groq_api_key:
            raise ValueError("GROQ_API_KEY not found")
        if not self.neo_api_key:
            raise ValueError("NEO_API_KEY not found")
        
        self.neo_client = NeoApiClientSync(self.neo_api_key)
        logger.info(f"API Keys loaded: GROQ={'✓' if self.groq_api_key else '✗'}, NEO={'✓' if self.neo_api_key else '✗'}")

    async def process_message(self, message: str) -> Dict[str, Any]:
        try:
            # 1. Получаем ответ от Groq
            logger.info(f"\nSending to Groq API: {message[:50]}...")
            groq_response = self._get_groq_response(message)
            message_id = str(hash(groq_response))
            
            # 2. Анализируем через Neo API
            logger.info("\nSending to Neo API...")
            
            @self.neo_client.track_llm_output(
                need_analysis_response=True,
                format_json_output=True,
                project="chat_analysis"
            )
            def analyze_text() -> str:
                return groq_response
            
            analyze_text()
            self.neo_client.flush()
            await asyncio.sleep(2)  # Даем время на получение ответа
            
            # 3. Отправляем результаты через WebSocket
            if hasattr(self.neo_client, 'last_analysis'):
                metrics = {
                    'is_ai_generated': self.neo_client.last_analysis.get('is_ai_generated'),
                    'human_likeness_score': self.neo_client.last_analysis.get('human_likeness_score'),
                    'metrics': self.neo_client.last_analysis.get('metrics', {})
                }
                await self.ws_manager.broadcast_metrics(message_id, metrics)
            
            # 4. Возвращаем ответ от Groq
            return {
                "id": message_id,
                "message": groq_response,
                "status": "success"
            }
            
        except Exception as e:
            logger.error(f"Error in process_message: {str(e)}", exc_info=True)
            return {"error": str(e), "status": "error"}

    def _get_groq_response(self, message: str) -> str:
        response = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {self.groq_api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'mixtral-8x7b-32768',
                'messages': [{'role': 'user', 'content': message}]
            }
        )
        result = response.json()
        if 'error' in result:
            raise Exception(f"Groq API Error: {result['error']}")
        return result['choices'][0]['message']['content']

    def __del__(self):
        if hasattr(self, 'neo_client'):
            self.neo_client.stop()

class RequestHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.api = None  # Будет установлено позже через set_api_handler
        super().__init__(*args, **kwargs)
    
    @classmethod
    def create_handler(cls, ws_manager):
        def handler(*args, **kwargs):
            instance = cls(*args, **kwargs)
            instance.api = UnifiedAPIHandler(ws_manager)
            return instance
        return handler

    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            print(f"\nReceived request: {request_data}")
            
            if self.path == '/chat' or self.path == '/':
                response = self.api.process_message(request_data['message'])
                self._send_json_response(200, response)
            else:
                self._send_json_response(404, {"error": "Not found"})
                
        except Exception as e:
            logger.error(f"Error in request_handler: {str(e)}", exc_info=True)
            self._send_json_response(500, {"error": str(e)})

    def _send_json_response(self, status: int, data: Dict):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

async def start_websocket_server(ws_manager: WebSocketManager, port: int):
    async def handler(websocket):
        await ws_manager.register(websocket)
    
    ws_manager.server = await websockets.serve(handler, "", port)
    logger.info(f"WebSocket server started on port {port}")

def run(http_port=8000, ws_port=8001):
    ws_manager = WebSocketManager()
    server_address = ('', http_port)
    
    handler_class = RequestHandler.create_handler(ws_manager)
    httpd = HTTPServer(server_address, handler_class)
    
    # Создаем и запускаем event loop в отдельном потоке
    def run_async_loop():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.create_task(start_websocket_server(ws_manager, ws_port))
        loop.run_forever()
    
    # Запускаем WebSocket сервер в отдельном потоке
    ws_thread = threading.Thread(target=run_async_loop, daemon=True)
    ws_thread.start()
    
    # Запускаем HTTP сервер в отдельном потоке
    def run_http_server():
        logger.info(f'Starting HTTP server on port {http_port}...')
        httpd.serve_forever()
    
    http_thread = threading.Thread(target=run_http_server, daemon=True)
    http_thread.start()
    
    logger.info(f'Starting WebSocket server on port {ws_port}...')
    
    try:
        # Ждем завершения обоих потоков
        ws_thread.join()
        http_thread.join()
    except KeyboardInterrupt:
        logger.info("Shutting down servers...")
        httpd.shutdown()
        httpd.server_close()
        if ws_manager.server:
            asyncio.run(ws_manager.server.close())

if __name__ == '__main__':
    http_port = int(os.getenv('PORT', 8000))
    ws_port = int(os.getenv('WS_PORT', 8001))
    run(http_port=http_port, ws_port=ws_port)