#!/bin/bash
set -e

# Проверяем наличие необходимых переменных окружения
if [ -z "$GROQ_API_KEY" ] || [ -z "$NEO_API_KEY" ]; then
    echo "Error: GROQ_API_KEY and NEO_API_KEY must be set"
    exit 1
fi

# Ждем Redis
until nc -z redis 6379; do
    echo "Waiting for Redis..."
    sleep 1
done

echo "Starting service..."
exec python -m src.service.main 