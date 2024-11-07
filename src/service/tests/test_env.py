import os
import pytest
from dotenv import load_dotenv

def get_project_root():
    """Получаем корректный путь к корню проекта"""
    current = os.path.abspath(__file__)  # /var/www/html/project9/src/service/tests/test_env.py
    service_dir = os.path.dirname(os.path.dirname(current))  # /var/www/html/project9/src/service
    src_dir = os.path.dirname(service_dir)  # /var/www/html/project9/src
    return os.path.dirname(src_dir)  # /var/www/html/project9

def test_env_file_exists():
    """Проверка существования .env файла"""
    project_root = get_project_root()
    dotenv_path = os.path.join(project_root, '.env')
    
    print(f"Project root: {project_root}")
    print(f"Looking for .env file at: {dotenv_path}")
    
    assert os.path.exists(dotenv_path), f".env file not found at {dotenv_path}"
    print(f"Found .env file at {dotenv_path}")

    # Показываем содержимое файла (без значений)
    with open(dotenv_path) as f:
        env_vars = [line.split('=')[0] for line in f.readlines() if '=' in line]
        print(f"Environment variables found: {env_vars}")

def test_env_variables_loaded():
    """Проверка загрузки переменных окружения"""
    project_root = get_project_root()
    dotenv_path = os.path.join(project_root, '.env')
    
    print(f"Loading environment from: {dotenv_path}")
    load_dotenv(dotenv_path, override=True)
    
    # Проверяем наличие необходимых переменных
    required_vars = ['GROQ_API_KEY', 'NEO_API_KEY']
    for var in required_vars:
        value = os.getenv(var)
        print(f"Checking {var}: {'set' if value else 'not set'}")
        assert value is not None, f"{var} not found in environment"
        print(f"{var} is set: {value[:5]}...")

def test_env_variables_not_empty():
    """Проверка что переменные окружения не пустые"""
    project_root = get_project_root()
    dotenv_path = os.path.join(project_root, '.env')
    load_dotenv(dotenv_path, override=True)

    required_vars = ['GROQ_API_KEY', 'NEO_API_KEY']
    for var in required_vars:
        value = os.getenv(var)
        print(f"Checking length of {var}")
        assert value and len(value) > 0, f"{var} is empty"
        print(f"{var} length: {len(value)}")

if __name__ == '__main__':
    pytest.main(['-v', __file__])