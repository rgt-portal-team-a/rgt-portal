# Stage 1: Install dependencies using uv
FROM python:3.12-slim AS builder

# Install uv for faster dependency installation
RUN apt-get update && apt-get install -y curl && \
  curl -LsSf https://astral.sh/uv/install.sh | sh && \
  apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only requirements to leverage Docker cache
COPY requirements.txt /app/

# Install dependencies globally to speed up the build
RUN uv pip install -r requirements.txt --system --no-cache-dir

# Stage 2: Final runtime image
FROM python:3.12-slim AS runtime

WORKDIR /app

# Copy installed dependencies from builder
COPY --from=builder /usr/local/lib/python3.12 /usr/local/lib/python3.12
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application files
COPY . /app/

# Create a non-root user for security
RUN useradd --create-home appuser
USER appuser

# Expose the port FastAPI runs on
EXPOSE 8000

# Default command to start FastAPI with Uvicorn
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
