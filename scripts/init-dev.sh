#!/bin/bash

# Создаем dev окружение
DEV_DIR="/var/www/html/project9-dev"

# Проверяем существование dev директории
if [ ! -d "$DEV_DIR" ]; then
    echo "Creating development environment..."
    
    # Создаем директорию для dev
    mkdir -p "$DEV_DIR"
    
    # Копируем текущий код, исключая node_modules и .next
    rsync -av --progress /var/www/html/project9/ "$DEV_DIR/" \
        --exclude 'node_modules' \
        --exclude '.next' \
        --exclude 'backup' \
        --exclude '.git'
    
    # Копируем dev конфигурацию
    cp /var/www/html/project9/.env.dev "$DEV_DIR/.env"
    
    echo "Development environment created at $DEV_DIR"
else
    echo "Development environment already exists at $DEV_DIR"
fi

# Переходим в dev директорию
cd "$DEV_DIR"

# Запускаем dev окружение
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

echo "Development environment is ready!"
echo "You can now work in $DEV_DIR" 