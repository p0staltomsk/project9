import os
import sys

# Добавляем корневую директорию проекта в PYTHONPATH
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, project_root)

# Настройка pytest-asyncio
pytest_plugins = ['pytest_asyncio']

def pytest_configure(config):
    config.addinivalue_line(
        "markers", "integration: mark test as integration test"
    ) 