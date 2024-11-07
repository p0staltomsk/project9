#!/bin/bash

DEV_DIR="/var/www/html/project9-dev"

# Проверяем существование dev окружения
if [ ! -d "$DEV_DIR" ]; then
    echo "Development environment not found at $DEV_DIR"
    exit 1
fi

# Останавливаем контейнеры
echo "Stopping development containers..."
cd "$DEV_DIR"
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

# Удаляем dev директорию
echo "Removing development environment..."
rm -rf "$DEV_DIR"

echo "Development environment cleaned up successfully!" 