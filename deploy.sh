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

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
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

# Create data directory if it doesn't exist
mkdir -p data

# Check if ENCRYPTION_KEY is set
if ! grep -q "ENCRYPTION_KEY=" .env || grep -q "ENCRYPTION_KEY=$" .env; then
    echo "⚠️  ENCRYPTION_KEY is not set in .env file."
    echo "   Generate key: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    exit 1
fi

echo "✅ Prerequisites check passed."

# Stop existing containers if running
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Build and start containers
echo "🔨 Building Docker image..."
docker-compose build

echo "🚀 Starting containers..."
docker-compose up -d

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
        echo "📊 View logs: docker-compose logs -f"
        echo "🛑 Stop server: docker-compose down"
    else
        echo "⚠️  Server started but health check failed. Check logs:"
        echo "   docker-compose logs"
    fi
else
    echo "❌ Container failed to start. Check logs:"
    docker-compose logs
    exit 1
fi

