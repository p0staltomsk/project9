import os
import sys
from pathlib import Path

# Добавляем пути к PYTHONPATH
service_dir = Path(__file__).parent.parent
project_dir = service_dir.parent.parent

# Создаем пакет service
if not (service_dir / '__init__.py').exists():
    with open(service_dir / '__init__.py', 'w') as f:
        pass

# Добавляем оба пути
sys.path.insert(0, str(project_dir))
sys.path.insert(0, str(service_dir.parent))
