#!/bin/bash

# Install Docker Compose on Azure VM
# This script installs Docker Compose v2 (plugin) which is the recommended version

set -e

echo "🔧 Installing Docker Compose..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Install Docker Compose plugin (v2 - recommended)
echo "📦 Installing Docker Compose plugin..."
sudo apt-get update
sudo apt-get install -y docker-compose-plugin

# Verify installation
if docker compose version &> /dev/null; then
    echo "✅ Docker Compose plugin installed successfully!"
    echo ""
    echo "Docker Compose version:"
    docker compose version
    echo ""
    echo "📝 Note: Use 'docker compose' (with space) instead of 'docker-compose' (with hyphen)"
    echo "   Example: docker compose up -d"
else
    echo "❌ Docker Compose installation failed."
    exit 1
fi

