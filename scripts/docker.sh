#!/bin/bash

# Константы
PROJECT_NAME="project9"
SERVICE_NAME="neo-service"
REDIS_NAME="neo-redis"
NETWORK_NAME="${PROJECT_NAME}_neo-network"

# Очистка только наших сервисов
cleanup() {
    echo "Cleaning up $PROJECT_NAME services..."
    docker-compose down
    docker rmi $SERVICE_NAME 2>/dev/null || true
    echo "Cleanup complete"
}

# Пересборка с новыми зависимостями
rebuild() {
    echo "Rebuilding $SERVICE_NAME with dependencies..."
    docker-compose build --no-cache $SERVICE_NAME
}

# Тест Groq API
test_groq() {
    echo -e "\n=== Testing Groq API ==="
    local TEST_RESPONSE=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{"message":"What is GraphQL?"}' \
        http://localhost:8000/chat)
    
    echo "Groq API Response:"
    echo "$TEST_RESPONSE" | jq .
    
    # Проверяем успешность
    if echo "$TEST_RESPONSE" | jq -e '.message' > /dev/null; then
        echo "✓ Groq API test passed"
        return 0
    else
        echo "✗ Groq API test failed"
        return 1
    fi
}

# Тест Neo API
test_neo() {
    echo -e "\n=== Testing Neo API ==="
    # Получаем ID из предыдущего ответа Groq
    local GROQ_RESPONSE=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{"message":"test neo api"}' \
        http://localhost:8000/chat)
    
    local MESSAGE_ID=$(echo "$GROQ_RESPONSE" | jq -r '.id')
    
    echo "Waiting for Neo API processing..."
    sleep 2
    
    # Проверяем логи на наличие Neo API вызовов
    echo "Neo API Logs:"
    docker logs $SERVICE_NAME | grep -A 2 "Sending to Neo API" | tail -n 3
    
    if docker logs $SERVICE_NAME | grep -q "Neo API Response"; then
        echo "✓ Neo API test passed"
        return 0
    else
        echo "✗ Neo API test failed"
        return 1
    fi
}

# Запуск сервисов
echo "Starting $PROJECT_NAME services..."
cleanup
rebuild
docker-compose up -d $SERVICE_NAME redis
sleep 5

# Запуск тестов
TESTS_FAILED=0

# 1. Тест Groq API
test_groq || TESTS_FAILED=$((TESTS_FAILED + 1))

# 2. Тест Neo API
test_neo || TESTS_FAILED=$((TESTS_FAILED + 1))

# Статус сервисов и итог
echo -e "\n=== Service Status ==="
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "$SERVICE_NAME|$REDIS_NAME"

echo -e "\n=== Test Summary ==="
if [ $TESTS_FAILED -eq 0 ]; then
    echo "✓ All tests passed"
    exit 0
else
    echo "✗ $TESTS_FAILED tests failed"
    echo "Check service logs:"
    docker logs $SERVICE_NAME
    exit 1
fi
