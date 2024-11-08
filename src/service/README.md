# NeonChat Service

Сервис обработки чат-сообщений с использованием Groq API для генерации ответов и Neo API для анализа текста.

## Быстрый старт

### 1. Локальный запуск
```bash
# Создание и активация виртуального окружения
python -m venv venv
source venv/bin/activate

# Установка зависимостей
pip install -r ../../requirements.txt

# Настройка окружения
cp .env.example .env
# Добавьте в .env ваши API ключи:
# GROQ_API_KEY=your_key
# NEO_API_KEY=your_key
```

### 2. Docker запуск
```bash
# Сборка и запуск
./scripts/docker.sh --test

# Только запуск тестов
./scripts/docker.test.sh
```

## Тестирование

### Основные команды
```bash
# Все тесты
pytest tests/ -v

# Unit тесты
pytest tests/unit -v

# Интеграционные тесты
pytest tests/integration -v

# Тесты с покрытием
pytest --cov=src/service --cov-report=html

# Smoke тесты
pytest tests/test_smoke.py -v
```

### HTTP тесты
Используйте REST-клиент тесты в `scripts/docker.http`:
```http
### Health Check
GET http://localhost:8000/health

### Chat API
POST http://localhost:8000/chat
Content-Type: application/json

{
    "message": "Test message"
}

### Metrics API
GET http://localhost:8000/metrics/{message_id}
```

## Code Style
```bash
# Форматирование
black src/service
isort src/service

# Линтинг и проверка типов
flake8 src/service

# Проверка типов
# Вариант 1: Используя скрипт (рекомендуется)
./check_types.sh

# Вариант 2: Напрямую через mypy
mypy . --namespace-packages --explicit-package-bases

# Игнорирование ошибок типизации для конкретного файла:
# Добавьте в начало файла:
# mypy: ignore-errors

# Игнорирование конкретной строки:
# type: ignore[error-name]
```

### Конфигурация типизации
Проект использует mypy для проверки типов. Основные файлы конфигурации:

- `mypy.ini` - основные настройки проверки типов
- `check_types.sh` - скрипт для удобного запуска проверки
- `pyproject.toml` - дополнительные настройки для работы с пакетами

Текущая конфигурация настроена на "мягкую" проверку типов:
- Разрешены неявные Any
- Разрешены функции без аннотаций
- Игнорируются ошибки в тестах
- Настроено игнорирование внешних библиотек

### Известные проблемы с типами
1. Модуль neoapi не имеет аннотаций типов - используйте `# type: ignore[attr-defined]` при импорте
2. Для тестов может потребоваться добавление `# type: ignore[import-not-found]`
3. При добавлении новых внешних библиотек может потребоваться их добавление в секцию игнорирования в `mypy.ini`

## Архитектура

```mermaid
sequenceDiagram
    participant Client
    participant Service
    participant Redis
    participant GroqAPI
    participant NeoAPI
    participant WebSocket

    Client->>Service: POST /chat {message}
    Service->>GroqAPI: Generate response
    GroqAPI-->>Service: AI response
    
    par Async Flow
        Service->>Redis: Store message_id & response
        Service->>NeoAPI: Analyze text
        NeoAPI-->>Service: Analysis metrics
        Service->>Redis: Store metrics by message_id
        Service-->>WebSocket: Broadcast metrics
    end
    
    Service-->>Client: {id, message, status}
```

## API Endpoints

### Chat API
```http
POST /chat
{
    "message": "Your message here"
}

Response:
{
    "id": "message_uuid",
    "message": "AI response",
    "status": "success"
}
```

### Metrics API
```http
GET /metrics/{message_id}

Response:
{
    "message_id": "uuid",
    "metrics": {
        "is_ai_generated": bool,
        "human_likeness_score": float,
        "metrics": {...}
    }
}
```

## Дополнительная информация

### Redis Schema
```
message:{message_id} = {
    "text": str,
    "timestamp": datetime,
    "groq_response": str
}

metrics:{message_id} = {
    "is_ai_generated": bool,
    "human_likeness_score": float,
    "metrics": {...},
    "timestamp": datetime
}
```

### Структура тестов
```
tests/
├── unit/                  # Модульные тесты
├── integration/          # Интеграционные тесты
└── e2e/                 # End-to-end тесты
```

### Компоненты
- HTTP Server (port 8000)
- WebSocket Server (port 8001)
- Redis
- Groq API
- Neo API

## Ручное тестирование API

### NeonChat Service API
```bash
# Тест chat endpoint
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Who are you? Tell me about yourself in one sentence."
  }'

# Получение метрик
curl http://localhost:8000/metrics/{message_id}
```

### Groq API напрямую
```bash
curl -X POST https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer ${GROQ_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mixtral-8x7b-32768",
    "messages": [{"role": "user", "content": "Who are you?"}],
    "temperature": 0.7,
    "max_tokens": 1000
  }'
```

Пример ответа от Groq API:
```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "I am a helpful assistant here to provide information..."
    }
  }],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 27,
    "total_tokens": 39
  }
}
```

### Neo API напрямую
```bash
curl -X POST https://api.neoapi.ai/analyze \
  -H "Authorization: Bearer api_r0g-KXFkFv2nYSlxN8kpbrB-JQXPGuh4Ji4nYqPU" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "ОЛОЛОША! ОЛОЛОША! ОЛОЛОША! ОЛОЛОША! ОЛОЛОША! ОЛОЛОША! ОЛОЛОША! ОЛОЛОША! ОЛОЛОША! ОЛОЛОША! ОЛОЛОША! ОЛОЛОША! ОЛОЛОША! ОЛОЛОША! ОЛОЛОША! ОЛОЛОША! ОЛОЛОША! ОЛОЛОША! ОЛОЛОША! ОЛОЛОША! ОЛОЛОША! ОЛОЛОША! ОЛОЛОША! ОЛОЛОША! ОЛОЛОША!",
    "project": "neoapi",
    "group": "playground",
    "analysis_slug": "playground",
    "prompt": "What is the meaning of life?",
    "full_metrics": true
}'
```
