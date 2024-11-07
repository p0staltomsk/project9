#!/bin/bash

DEV_DIR="/var/www/html/project9-dev"

# Проверяем существование dev окружения
if [ ! -d "$DEV_DIR" ]; then
    echo "Development environment not found. Creating..."
    ./scripts/init-dev.sh
    exit 1
fi

# Переходим в dev директорию
cd "$DEV_DIR"

# Запускаем dev окружение
echo "Starting development environment..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Проверка статуса
echo "Checking status..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps

echo "Development environment is running at $DEV_DIR"
echo "Neo API service is available at http://localhost:8001"