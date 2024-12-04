import pytest
import redis.asyncio as redis
import json
import os
from typing import AsyncGenerator
import sys
from pathlib import Path

# Добавляем путь к корневой директории сервиса
sys.path.insert(0, str(Path(__file__).parent.parent))

@pytest.fixture
async def redis_client() -> AsyncGenerator[redis.Redis, None]:
    """Фикстура для Redis в докере"""
    # Проверяем, запущены ли мы в Docker
    host = 'neonchat-redis' if os.environ.get('DOCKER_ENV') else 'localhost'
    try:
        client = redis.Redis(
            host=host,
            port=6379,
            decode_responses=False,
            socket_timeout=30
        )
        # Проверяем соединение
        await client.ping()
        yield client
        await client.close()
    except redis.ConnectionError:
        pytest.skip("Redis is not available")

@pytest.mark.docker
async def test_redis_in_docker(redis_client: redis.Redis) -> None:
    """Тест Redis в докере"""
    await redis_client.set("test_key", "test_value")
    value = await redis_client.get("test_key")
    assert value == b"test_value"

if __name__ == '__main__':
    pytest.main(['-v', __file__])
