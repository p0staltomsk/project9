import pytest
import aioredis
import json
from typing import AsyncGenerator

@pytest.fixture
async def redis() -> AsyncGenerator[aioredis.Redis, None]:
    """Фикстура для Redis в докере"""
    redis = await aioredis.create_redis_pool(
        'redis://neonchat-redis:6379',  # ✅ Используем имя сервиса из docker-compose
        timeout=30  # Увеличиваем таймаут для докера
    )
    yield redis
    redis.close()
    await redis.wait_closed()

@pytest.mark.docker
async def test_redis_in_docker(redis: aioredis.Redis) -> None:
    """Тест Redis в докере"""
    # Тест подключения
    await redis.set("test_key", "test_value")
    value = await redis.get("test_key")
    assert value == b"test_value"
