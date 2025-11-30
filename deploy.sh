#!/bin/bash

# AI-First CRM HCP Module - Automated Deployment Script
# This script sets up and deploys the complete application

set -e

echo "🚀 AI-First CRM HCP Module - Deployment Script"
echo "================================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file. Please edit it and add your GROQ_API_KEY."
        echo ""
        echo "To get Groq API key: https://console.groq.com"
        echo ""
        read -p "Press Enter after you've updated the .env file..."
    else
        echo "❌ .env.example not found. Please create .env manually."
        exit 1
    fi
fi

# Verify GROQ_API_KEY is set
source .env
if [ -z "$GROQ_API_KEY" ] || [ "$GROQ_API_KEY" == "your_groq_api_key_here" ]; then
    echo "❌ GROQ_API_KEY not set in .env file."
    echo "Please get your API key from https://console.groq.com and update .env"
    exit 1
fi

echo "✅ Environment variables configured"
echo ""

# Stop any running containers
echo "🛑 Stopping any running containers..."
docker-compose down 2>/dev/null || true
echo ""

# Build and start containers
echo "🔨 Building Docker images..."
docker-compose build --no-cache
echo ""

echo "🚀 Starting containers..."
docker-compose up -d
echo ""

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🏥 Checking service health..."
echo ""

# Check database
if docker-compose ps | grep -q "crm_database.*Up"; then
    echo "✅ Database is running"
else
    echo "❌ Database failed to start"
    docker-compose logs db
    exit 1
fi

# Check backend
if docker-compose ps | grep -q "crm_backend.*Up"; then
    echo "✅ Backend is running"
else
    echo "❌ Backend failed to start"
    docker-compose logs backend
    exit 1
fi

# Check frontend
if docker-compose ps | grep -q "crm_frontend.*Up"; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend failed to start"
    docker-compose logs frontend
    exit 1
fi

echo ""
echo "🎉 Deployment successful!"
echo ""
echo "================================================"
echo "Access your application:"
echo "================================================"
echo "Frontend:  http://localhost:3000"
echo "Backend:   http://localhost:8000"
echo "API Docs:  http://localhost:8000/docs"
echo ""
echo "================================================"
echo "Useful commands:"
echo "================================================"
echo "View logs:        docker-compose logs -f"
echo "Stop services:    docker-compose down"
echo "Restart services: docker-compose restart"
echo "View status:      docker-compose ps"
echo ""
echo "📝 Sample HCPs are pre-loaded in the database"
echo "💬 Try the chat interface to log interactions!"
echo ""