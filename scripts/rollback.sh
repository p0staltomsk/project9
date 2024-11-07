#!/bin/bash

# Остановка текущего контейнера
echo "Stopping current container..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

# Получение последнего бэкапа
LATEST_BACKUP=$(ls -t backup/neo-service-prod-*.tar | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "No backup found. Using initial backup..."
    LATEST_BACKUP="backup/neo-service-prod.tar"
fi

# Восстановление из бэкапа
echo "Restoring from backup: $LATEST_BACKUP"
docker load < $LATEST_BACKUP

# Перезапуск продакшен окружения
echo "Restarting production environment..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d 