FROM python:3.11-slim

WORKDIR /app

# Install only necessary system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Environment setup
ENV PYTHONPATH=/app \
    PYTHONUNBUFFERED=1

# Copy and install requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY src/service ./src/service

# Health check
HEALTHCHECK --interval=5s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run service
CMD ["python", "-m", "src.service.main"]
