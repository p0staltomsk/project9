#!/bin/bash

echo "🧹 Cleaning up Python cache..."
find . -type d -name "__pycache__" -exec rm -rf {} +
find . -type d -name ".pytest_cache" -exec rm -rf {} +

echo "🗑️ Removing old virtual environment..."
deactivate 2>/dev/null || true
rm -rf venv

echo "🏗️ Creating new virtual environment..."
python3.12 -m venv venv
source venv/bin/activate

echo "📦 Installing dependencies..."
pip install --no-cache-dir -r ../../requirements.txt

echo "🔍 Checking neoapi-sdk installation..."
pip show neoapi-sdk

echo "🧪 Running specific tests..."
echo "Running test_env.py..."
pytest tests/test_env.py -v

echo "Running test_grog.py..."
pytest tests/test_grog.py -v

echo "Running test_smoke.py..."
pytest tests/test_smoke.py -v

echo "🔬 Running problematic tests with debug info..."
echo "Running test_neoapi.py..."
PYTHONPATH=/var/www/html/project9 pytest tests/test_neoapi.py -vv --tb=long

echo "Running test_service.py..."
PYTHONPATH=/var/www/html/project9 pytest tests/test_service.py -vv --tb=long

echo "📋 Installed packages:"
pip freeze

echo "Done! 🎉"
