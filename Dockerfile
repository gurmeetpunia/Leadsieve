# Stage 1: Build dependencies
FROM python:3.11-slim as builder

WORKDIR /build

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements
COPY requirements.txt .

# Install Python packages to a custom directory
RUN pip install --user --no-cache-dir --compile -r requirements.txt

# Stage 2: Runtime image (Node.js included)
FROM node:18-slim

# Install Python runtime only (no build tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3.11 \
    python3-pip \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Python packages from builder
COPY --from=builder /root/.local /root/.local

# Set Python path
ENV PATH=/root/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY requirements.txt ./

# Install Node.js packages (use npm ci for exact versions)
RUN npm ci --only=production && \
    cd client && npm ci && cd .. && \
    npm cache clean --force

# Copy application code
COPY . .

# Build React frontend
RUN cd client && npm run build && cd .. && \
    # Clean up node_modules from client (not needed in production)
    rm -rf client/node_modules

# Expose ports
EXPOSE 3000 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python3 -c "import requests; requests.get('http://localhost:3000/api/health', timeout=5)"

# Start both services
CMD ["sh", "-c", "python3 nlp_engine.py & node server.js"]
