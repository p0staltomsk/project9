#!/bin/bash
set -e

# Константы проекта
PROJECT_NAME="neonchat"
SERVICE_NAME="neonchat-service"
REDIS_NAME="neonchat-redis"
NETWORK_NAME="${PROJECT_NAME}_neonchat-network"

# Переходим в корневую директорию проекта
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)

# Функция безопасной очистки только контейнеров проекта
cleanup_project() {
    echo "Safely cleaning up only $PROJECT_NAME containers..."
    
    # Останавливаем и удаляем контейнеры
    for container in "$SERVICE_NAME" "$REDIS_NAME"; do
        if docker ps -a -q -f name="^/${container}$" > /dev/null 2>&1; then
            echo "Stopping and removing $container..."
            docker stop "$container" > /dev/null 2>&1 || true
            docker rm "$container" > /dev/null 2>&1 || true
        fi
    done
    
    # Удаляем образ
    if docker images "$SERVICE_NAME" -q > /dev/null 2>&1; then
        echo "Removing $SERVICE_NAME image..."
        docker rmi "$SERVICE_NAME" > /dev/null 2>&1 || true
    fi
    
    # Удаляем сеть
    if docker network ls -q -f name="^${NETWORK_NAME}$" > /dev/null 2>&1; then
        echo "Removing $NETWORK_NAME network..."
        docker network rm "$NETWORK_NAME" > /dev/null 2>&1 || true
    fi
    
    echo "Cleanup complete"
}

# Проверка наличия .env файла
check_env() {
    if [ ! -f "$PROJECT_ROOT/.env" ]; then
        echo "Error: .env file not found in $PROJECT_ROOT"
        exit 1
    fi
}

# Функция проверки запуска сервиса
check_service_startup() {
    echo "Checking service startup..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo "Startup check attempt $attempt/$max_attempts..."
        
        # Проверяем статус контейнера
        if [ "$(docker inspect -f '{{.State.Running}}' $SERVICE_NAME 2>/dev/null)" != "true" ]; then
            echo "Container is not running. Logs:"
            docker logs "$SERVICE_NAME" 2>&1
            return 1
        fi
        
        # Проверяем логи на наличие ошибок
        if docker logs "$SERVICE_NAME" 2>&1 | grep -i "error\|exception\|failed" > /dev/null; then
            echo "Found errors in logs:"
            docker logs "$SERVICE_NAME" 2>&1 | grep -i "error\|exception\|failed"
            return 1
        fi
        
        # Проверяем health endpoint
        if curl -s http://localhost:8000/health > /dev/null; then
            echo "✓ Service is responding to health checks"
            return 0
        fi
        
        sleep 1
        attempt=$((attempt + 1))
    done
    
    echo "Service failed to start properly. Full logs:"
    docker logs "$SERVICE_NAME"
    return 1
}

# Основной процесс сборки
main() {
    echo "Starting $PROJECT_NAME build process..."
    
    # Проверяем окружение
    check_env
    
    # Безопасная очистка
    cleanup_project
    
    # Собираем и запускаем сервисы
    echo "Building and starting services..."
    docker-compose build \
        --no-cache \
        --build-arg SERVICE_NAME="$SERVICE_NAME" \
        "$SERVICE_NAME"
    
    docker-compose --project-name "$PROJECT_NAME" \
                  --env-file "$PROJECT_ROOT/.env" \
                  up -d
    
    echo "✅ Build complete"
    echo "Service status:"
    docker ps --format "table {{.Names}}\t{{.Status}}" | grep "$PROJECT_NAME" || true
    
    # Проверяем запуск сервиса
    if ! check_service_startup; then
        echo "❌ Service startup check failed"
        exit 1
    fi
    
    # Запускаем тесты если передан параметр --test
    if [ "$1" = "--test" ]; then
        echo "Running tests..."
        chmod +x ./scripts/docker.test.sh  # Устанавливаем права на выполнение
        ./scripts/docker.test.sh
    fi
}

# Запускаем основной процесс
main "$@"
