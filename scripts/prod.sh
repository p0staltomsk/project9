#!/bin/bash

# Проверка наличия бэкапа
if [ ! -f "backup/neo-service-prod.tar" ]; then
    echo "No backup found. Creating initial backup..."
    mkdir -p backup
    docker save neon-nexus-neo-service:prod > backup/neo-service-prod.tar
fi

# Создание нового бэкапа перед обновлением
echo "Creating backup..."
docker save neon-nexus-neo-service:prod > backup/neo-service-prod-$(date +%Y%m%d_%H%M%S).tar

# Запуск продакшен окружения
echo "Starting production environment..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Проверка статуса
echo "Checking status..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps 