# backend/Dockerfile
FROM python:3.12-slim-bookworm

WORKDIR /app

# Install build essentials + ca-certificates
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        gcc \
        libpq-dev \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Upgrade pip + install with retry, timeout, and verbose
RUN pip install --upgrade pip && \
    pip install --no-cache-dir \
      --timeout=120 \
      --retries=5 \
      --verbose \
      -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]