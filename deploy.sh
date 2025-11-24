#!/bin/bash

# Azure VM Deployment Script for Dynamic SMTP Server
# This script automates the deployment process

set -e

echo "🚀 Starting Dynamic SMTP Server Deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed (try both v1 and v2)
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed."
    echo ""
    echo "To install Docker Compose:"
    echo "  Option 1 (Recommended - Plugin version):"
    echo "    sudo apt-get update"
    echo "    sudo apt-get install -y docker-compose-plugin"
    echo ""
    echo "  Option 2 (Standalone version):"
    echo "    sudo curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)\" -o /usr/local/bin/docker-compose"
    echo "    sudo chmod +x /usr/local/bin/docker-compose"
    echo ""
    echo "  Or run: chmod +x install-docker-compose.sh && ./install-docker-compose.sh"
    exit 1
fi

# Determine which docker compose command to use
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    echo "❌ Docker Compose not found"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    if [ -f env.template ]; then
        cp env.template .env
        echo "✅ Created .env file from template."
        echo "⚠️  Please edit .env file and set ENCRYPTION_KEY before continuing."
        echo "   Generate key: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
        exit 1
    else
        echo "❌ env.template not found. Cannot create .env file."
        exit 1
    fi
fi

# Check if MONGODB_URI is set
if ! grep -q "MONGODB_URI=" .env && ! grep -q "MONGODB_CONNECTION_STRING=" .env; then
    echo "⚠️  MONGODB_URI or MONGODB_CONNECTION_STRING is not set in .env file."
    echo "   MongoDB connection string is required."
    exit 1
fi

# Check if ENCRYPTION_KEY is set
if ! grep -q "ENCRYPTION_KEY=" .env || grep -q "ENCRYPTION_KEY=$" .env; then
    echo "⚠️  ENCRYPTION_KEY is not set in .env file."
    echo "   Generate key: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    exit 1
fi

echo "✅ Prerequisites check passed."

# Stop existing containers if running
echo "🛑 Stopping existing containers..."
$COMPOSE_CMD down 2>/dev/null || true

# Build and start containers
echo "🔨 Building Docker image..."
$COMPOSE_CMD build

echo "🚀 Starting containers..."
$COMPOSE_CMD up -d

# Wait for container to be ready
echo "⏳ Waiting for server to start..."
sleep 5

# Check if container is running
if docker ps | grep -q "dynamic-smtp-server"; then
    echo "✅ Container is running!"
    
    # Check health endpoint
    echo "🏥 Checking health endpoint..."
    sleep 3
    
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo "✅ Server is healthy!"
        echo ""
        echo "🎉 Deployment successful!"
        echo ""
        echo "📍 Access your application:"
        echo "   Admin Dashboard: http://$(hostname -I | awk '{print $1}'):3000/admin"
        echo "   API Endpoint: http://$(hostname -I | awk '{print $1}'):3000/api/send-inquiry"
        echo "   Health Check: http://$(hostname -I | awk '{print $1}'):3000/health"
        echo ""
        echo "📊 View logs: $COMPOSE_CMD logs -f"
        echo "🛑 Stop server: $COMPOSE_CMD down"
    else
        echo "⚠️  Server started but health check failed. Check logs:"
        echo "   $COMPOSE_CMD logs"
    fi
else
    echo "❌ Container failed to start. Check logs:"
    $COMPOSE_CMD logs
    exit 1
fi

