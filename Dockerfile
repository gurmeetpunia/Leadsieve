# Multi-stage build optimized for Railway
FROM python:3.11-slim as base

# Install Node.js and build dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./
COPY requirements.txt ./
COPY client/package*.json ./client/

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install Node.js dependencies
RUN npm ci
RUN cd client && npm ci && cd ..

# Copy application files
COPY . .

# Build frontend
RUN cd client && npm run build && cd ..

# Expose ports for both services
EXPOSE 3000 5001

# Use a simple shell script to start both services
CMD ["sh", "-c", "python nlp_engine.py & node server.js"]
