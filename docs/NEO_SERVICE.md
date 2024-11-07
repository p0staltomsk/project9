# Neo API Service

Сервис обработки запросов через Neo API SDK в изолированном Docker-контейнере.

## 🛠 Структура проекта
```
/var/www/html/project9/
├── .env                  # Файл с переменными окружения
├── Dockerfile
└── src/
    └── neoapi/
        └── main.py      # Основной файл сервиса
```

## 🚀 Запуск сервиса

### 1. Подготовка окружения

Убедитесь, что файл `.env` содержит необходимые переменные:
```env
NEO_API_KEY=api_r0g-KXFkFv2nYSlxN8kpbrB-JQXPGuh4Ji4nYqPU
```

### 2. Сборка Docker образа

Перейдите в директорию проекта:
```bash
cd /var/www/html/project9
```

Соберите Docker образ:
```bash
docker build -t neon-nexus-neo-service .
```

### 3. Запуск контейнера

Запустите контейнер с подключением переменных окружения из файла:
```bash
docker run -d \
  --name neo-service \
  -p 8000:8000 \
  --env-file .env \
  neon-nexus-neo-service
```

### 4. Проверка работоспособности

Проверить статус контейнера:
```bash
docker ps -f name=neo-service
```

Просмотр логов:
```bash
docker logs neo-service
```

## 🔧 Обновление Dockerfile

Обновите путь к main.py в Dockerfile:

```dockerfile
# ... остальные настройки ...
CMD ["python", "src/neoapi/main.py"]
```

## 🔄 Перезапуск сервиса

Если нужно перезапустить сервис:

```bash
docker stop neo-service
docker rm neo-service
docker build -t neon-nexus-neo-service .
docker run -d --name neo-service -p 8000:8000 --env-file .env neon-nexus-neo-service
```

## 📝 Тестирование API

Тестовый запрос к сервису:
```bash
curl -X POST http://localhost:8000 \
  -H "Content-Type: application/json" \
  -d '{"message": "test message"}'
```