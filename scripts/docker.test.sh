#!/bin/bash
set -e

# Константы проекта
SERVICE_NAME="neonchat-service"
TEST_LOG_FILE="/tmp/neonchat_test.log"
CURL_LOG_FILE="/tmp/neonchat_curl.log"

# Функции логирования
log_info() {
    echo "[INFO] $1" | tee -a "$TEST_LOG_FILE"
}

log_error() {
    echo "[ERROR] $1" | tee -a "$TEST_LOG_FILE"
}

log_success() {
    echo "[SUCCESS] $1" | tee -a "$TEST_LOG_FILE"
}

# Инициализация тестового окружения
init_test_env() {
    echo "Initializing test environment..."
    rm -f "$TEST_LOG_FILE" "$CURL_LOG_FILE"
    touch "$TEST_LOG_FILE" "$CURL_LOG_FILE"
}

# Функция проверки health endpoint
check_health() {
    log_info "Checking service health..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log_info "Health check attempt $attempt/$max_attempts"
        
        # Проверяем статус контейнера и логи
        if ! docker ps -q -f name="^/${SERVICE_NAME}$" > /dev/null 2>&1; then
            log_error "Service container is not running"
            echo "Container logs:"
            docker logs "$SERVICE_NAME" 2>&1 | tail -n 50
            return 1
        fi
        
        # Проверяем health endpoint
        response=$(curl -s http://localhost:8000/health)
        if [ $? -eq 0 ]; then
            echo "Health endpoint response: $response"
            if echo "$response" | grep -q '"status":"ok"'; then
                log_success "Service is healthy: $response"
                return 0
            fi
        fi
        
        # Показываем последние логи при каждой неудачной попытке
        if [ $((attempt % 5)) -eq 0 ]; then
            echo "Recent logs:"
            docker logs "$SERVICE_NAME" 2>&1 | tail -n 10
        fi
        
        sleep 1
        attempt=$((attempt + 1))
    done
    
    log_error "Service failed health check"
    echo "Full container logs:"
    docker logs "$SERVICE_NAME"
    return 1
}

# Асинхронное тестирование API endpoints
test_api_endpoints() {
    log_info "Starting API endpoint tests..."
    local failures=0

    # Запускаем тесты параллельно и собираем результаты
    {
        # Health endpoint test
        curl -s http://localhost:8000/health > "$CURL_LOG_FILE.health" &
        
        # Chat endpoint tests
        curl -s -X POST \
            -H "Content-Type: application/json" \
            -d '{"message":"Hello, how are you?"}' \
            http://localhost:8000/chat > "$CURL_LOG_FILE.chat1" &
            
        curl -s -X POST \
            -H "Content-Type: application/json" \
            -d '{"message":""}' \
            http://localhost:8000/chat > "$CURL_LOG_FILE.chat2" &
            
        # Ждем завершения всех curl запросов
        wait
    }

    # Анализируем результаты
    if grep -q '"status":"ok"' "$CURL_LOG_FILE.health"; then
        log_success "Health endpoint OK"
    else
        log_error "Health endpoint failed"
        ((failures++))
    fi

    if grep -q '"status":"success"' "$CURL_LOG_FILE.chat1"; then
        log_success "Chat endpoint OK"
    else
        log_error "Chat endpoint failed"
        ((failures++))
    fi

    if grep -q '"error"' "$CURL_LOG_FILE.chat2"; then
        log_success "Empty message handled correctly"
    else
        log_error "Empty message not handled properly"
        ((failures++))
    fi

    # Очистка временных файлов
    rm -f "$CURL_LOG_FILE"*
    
    return $failures
}

# Мониторинг логов сервиса
monitor_logs() {
    log_info "Starting log monitoring..."
    docker logs -f "$SERVICE_NAME" > "$TEST_LOG_FILE.service" 2>&1 &
    MONITOR_PID=$!
    
    # Остановка мониторинга через 10 секунд
    (sleep 10 && kill $MONITOR_PID) &
}

# Основной процесс тестирования
main() {
    init_test_env
    log_info "Starting test suite..."
    
    # Запускаем мониторинг логов асинхронно
    monitor_logs
    
    # Проверяем health
    if ! check_health; then
        log_error "Service is not healthy"
        exit 1
    fi

    # Тестируем API endpoints
    if ! test_api_endpoints; then
        log_error "API tests failed"
        exit 1
    fi
    
    log_success "All tests passed"
    echo -e "\nAPI endpoints available at:"
    echo "- Health check: http://localhost:8000/health"
    echo "- Chat API: http://localhost:8000/chat"
    echo "- WebSocket: ws://localhost:8001"
    
    # Выводим итоговые логи
    echo -e "\nTest Logs:"
    cat "$TEST_LOG_FILE"
}

# Запускаем тесты
main
