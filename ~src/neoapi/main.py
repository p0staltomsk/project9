import os
import json
import asyncio
import requests
from http.server import HTTPServer, BaseHTTPRequestHandler
from dotenv import load_dotenv
from neoapi import NeoApiClientSync
from typing import Dict, Any

load_dotenv()

class UnifiedAPIHandler:
    def __init__(self):
        self.groq_api_key = os.getenv('GROQ_API_KEY')
        self.neo_analyzer = NeoAnalyzer(os.getenv('NEO_API_KEY'))

    async def process_message(self, message: str) -> Dict[str, Any]:
        # 1. Получаем ответ от Groq через HTTP
        headers = {
            'Authorization': f'Bearer {self.groq_api_key}',
            'Content-Type': 'application/json'
        }
        
        groq_response = requests.post(
            'https://api.groq.com/v1/chat/completions',
            headers=headers,
            json={
                'model': 'llama3-groq-70b-8192-tool-use-preview',
                'messages': [{'role': 'user', 'content': message}]
            }
        ).json()
        
        llm_response = groq_response['choices'][0]['message']['content']
        message_id = str(hash(llm_response))

        # 2. Сразу возвращаем ответ и начинаем анализ
        response = {
            "id": message_id,
            "message": llm_response,
            "status": "processing"
        }

        # 3. Асинхронно запускаем анализ через Neo API
        asyncio.create_task(self._analyze_and_notify(llm_response, message_id))

        return response

    async def _analyze_and_notify(self, text: str, message_id: str):
        try:
            analysis = self.neo_analyzer.analyze_text(text, {"message_id": message_id})
            # Здесь будет логика отправки метрик через Server-Sent Events
            self._send_metrics_event(message_id, analysis)
        except Exception as e:
            print(f"Analysis error: {e}")

class RequestHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.api = UnifiedAPIHandler()
        super().__init__(*args, **kwargs)

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        request_data = json.loads(post_data.decode('utf-8'))

        try:
            if self.path == '/api/chat':
                response = asyncio.run(self.api.process_message(request_data['message']))
                self._send_json_response(200, response)
            else:
                self._send_json_response(404, {"error": "Not found"})
                
        except Exception as e:
            print(f"Error processing request: {e}")
            self._send_json_response(500, {"error": str(e)})

    def _send_json_response(self, status: int, data: Dict):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

def run(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, RequestHandler)
    print(f'Starting Unified API service on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))
    run(port=port)