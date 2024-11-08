import os
import sys
import pytest
import asyncio
from typing import Generator
from dotenv import load_dotenv
from pathlib import Path

# Получаем путь к корню проекта (где лежит src)
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))

# Определяем путь к корневому .env файлу
dotenv_path = os.path.join(project_root, '.env')

# Загружаем переменные окружения
print(f"Loading environment from: {dotenv_path}")
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path, override=True)
    print("Environment variables loaded:")
    print(f"GROQ_API_KEY: {'set' if os.getenv('GROQ_API_KEY') else 'not set'}")
    print(f"NEO_API_KEY: {'set' if os.getenv('NEO_API_KEY') else 'not set'}")
else:
    print(f"Warning: .env file not found at {dotenv_path}")

# Добавляем корневую директорию проекта в PYTHONPATH
sys.path.insert(0, str(project_root))

# Добавляем корневую директорию сервиса в PYTHONPATH
service_dir = Path(__file__).parent.parent
if str(service_dir) not in sys.path:
    sys.path.append(str(service_dir))

# Настройка pytest-asyncio
pytest_plugins = ['pytest_asyncio']

@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Фикстура для event loop"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session", autouse=True)
def load_env():
    """Фикстура для проверки и загрузки переменных окружения"""
    required_vars = ['GROQ_API_KEY', 'NEO_API_KEY']
    missing = [var for var in required_vars if not os.getenv(var)]

    # Выводим значения для отладки
    for var in required_vars:
        value = os.getenv(var)
        print(f"{var}: {'set' if value else 'not set'}")

    return {var: os.getenv(var) for var in required_vars}

@pytest.fixture(scope="session")
def api_keys():
    """Фикстура для API ключей"""
    groq_key = os.getenv('GROQ_API_KEY')
    neo_key = os.getenv('NEO_API_KEY')

    if not groq_key or not neo_key:
        missing = []
        if not groq_key:
            missing.append('GROQ_API_KEY')
        if not neo_key:
            missing.append('NEO_API_KEY')
        pytest.skip(f"Missing API keys: {', '.join(missing)}")

    return {
        'groq': groq_key,
        'neo': neo_key
    }

def pytest_configure(config):
    config.addinivalue_line(
        "markers", "integration: mark test as integration test"
    )
