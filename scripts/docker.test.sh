#!/bin/bash
set -e

# Константы проекта
SERVICE_NAME="neonchat-service"
REDIS_NAME="neonchat-redis"
TEST_LOG_FILE="/tmp/neonchat_test.log"
CURL_LOG_FILE="/tmp/neonchat_curl.log"

# Функции логирования
log_info() { echo "[INFO] $1" | tee -a "$TEST_LOG_FILE"; }
log_error() { echo "[ERROR] $1" | tee -a "$TEST_LOG_FILE"; }
log_success() { echo "[SUCCESS] $1" | tee -a "$TEST_LOG_FILE"; }

# Инициализация тестового окружения
init_test_env() {
    log_info "Initializing test environment..."
    rm -f "$TEST_LOG_FILE" "$CURL_LOG_FILE"
    touch "$TEST_LOG_FILE" "$CURL_LOG_FILE"
}

# Проверка Redis
check_redis() {
    log_info "Checking Redis connection..."
    if ! docker exec "$REDIS_NAME" redis-cli ping | grep -q "PONG"; then
        log_error "Redis is not responding"
        return 1
    fi
    log_success "Redis is healthy"
    return 0
}

# Проверка WebSocket
check_websocket() {
    log_info "Checking WebSocket connection..."

    # Устанавливаем websocat если его нет
    if ! command -v websocat &> /dev/null; then
        log_info "Installing websocat..."
        curl -L https://github.com/vi/websocat/releases/download/v1.11.0/websocat.x86_64-unknown-linux-musl > /tmp/websocat
        chmod +x /tmp/websocat
        WEBSOCAT=/tmp/websocat
    else
        WEBSOCAT=websocat
    fi

    # Пробуем подключиться к WebSocket
    echo '{"msg_id": "test"}' | timeout 5 $WEBSOCAT "ws://localhost:8001" 2>/dev/null
    if [ $? -eq 0 ]; then
        log_success "WebSocket connection successful"
        return 0
    else
        # Проверяем что сервис слушает порт
        if netstat -tuln | grep -q ":8001 "; then
            log_info "Port 8001 is open, checking service logs..."
            docker logs "$SERVICE_NAME" | tail -n 20
        else
            log_error "WebSocket port 8001 is not open"
        fi
        return 1
    fi
}

# Проверка health endpoint
check_health() {
    log_info "Checking service health..."
    local max_attempts=5
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        log_info "Health check attempt $attempt/$max_attempts"

        # Проверяем статус контейнера
        if ! docker ps -q -f name="^/${SERVICE_NAME}$" > /dev/null 2>&1; then
            log_error "Service container is not running"
            docker logs "$SERVICE_NAME" 2>&1 | tail -n 50
            return 1
        fi

        # Проверяем health endpoint
        response=$(curl -s http://localhost:8000/health)
        log_info "Health response: $response"

        # Проверяем что это валидный JSON и статус 200
        if [ $? -eq 0 ] && echo "$response" | jq -e . >/dev/null 2>&1; then
            log_success "Service is healthy"
            return 0
        fi

        sleep 1
        attempt=$((attempt + 1))
    done

    log_error "Service failed health check"
    docker logs "$SERVICE_NAME"
    return 1
}

# Тестирование API endpoints
test_api_endpoints() {
    log_info "Testing API endpoints..."
    local failures=0

    # Test chat endpoint with simple message
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{"message":"Hello!"}' \
        http://localhost:8000/chat)

    # Проверяем что ответ содержит нужные поля
    if echo "$response" | jq -e '. | select(.id and .message and .metrics)' > /dev/null; then
        log_success "Chat endpoint OK - Got valid response with metrics"
        log_info "Message ID: $(echo "$response" | jq -r .id)"
        log_info "AI Generated: $(echo "$response" | jq -r .metrics.is_ai_generated)"
        log_info "Human Likeness: $(echo "$response" | jq -r .metrics.human_likeness_score)"
    else
        log_error "Chat endpoint failed - Invalid response structure"
        log_error "Response: $response"
        ((failures++))
    fi

    return $failures
}

# Основной процесс тестирования
main() {
    init_test_env
    log_info "Starting test suite..."

    # Проверяем все компоненты
    components=(
        "check_redis"
        "check_websocket"
        "check_health"
        "test_api_endpoints"
    )

    failures=0
    for test in "${components[@]}"; do
        if ! $test; then
            log_error "$test failed"
            ((failures++))
        fi
    done

    # Выводим итоги
    if [ $failures -eq 0 ]; then
        log_success "All tests passed successfully!"
        echo -e "\nService endpoints:"
        echo "- Health check: http://localhost:8000/health"
        echo "- Chat API: http://localhost:8000/chat"
        echo "- WebSocket: ws://localhost:8001"
        echo "- Redis: localhost:6380"
        exit 0
    else
        log_error "$failures test(s) failed"
        exit 1
    fi
}

# Запускаем тесты
main
