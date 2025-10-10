#!/bin/bash

# Social Appliance - Docker Compose Deployment Script
# This script deploys the application using docker-compose

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Social Appliance - Docker Compose Deployment${NC}"
echo "=============================================="

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: docker-compose is not installed${NC}"
    echo "Install it from: https://docs.docker.com/compose/install/"
    exit 1
fi

# Determine docker-compose command
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

# Navigate to docker directory
SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DOCKER_DIR="$PROJECT_ROOT/docker"

cd "$DOCKER_DIR"

# Check if .env file exists in docker directory
if [ ! -f .env ]; then
    echo -e "${YELLOW}Warning: .env file not found in docker directory${NC}"
    
    # Check if .env.example exists
    if [ ! -f .env.example ]; then
        echo -e "${RED}Error: docker/.env.example not found${NC}"
        exit 1
    fi
    
    echo "Creating docker/.env from .env.example..."
    cp .env.example .env
    
    # Try to populate some values from root .env if it exists
    if [ -f "$PROJECT_ROOT/.env" ]; then
        echo -e "${GREEN}Found root .env file, copying some values...${NC}"
        
        # Load values from root .env
        set -a
        source <(grep -v '^#' "$PROJECT_ROOT/.env" | grep -v '^$' | sed 's/\r$//')
        set +a
        
        # Update docker/.env with values from root .env
        if [ ! -z "$MONGODB_URI" ]; then
            # Only copy if it's not the default local MongoDB
            if [[ "$MONGODB_URI" != "mongodb://localhost:27017"* ]]; then
                echo "  - Copying MONGODB_URI"
                sed -i.bak "s|MONGODB_URI=.*|MONGODB_URI=$MONGODB_URI|" .env
            fi
        fi
        
        if [ ! -z "$JWT_SECRET" ] && [ "$JWT_SECRET" != "your-jwt-secret-change-in-production" ]; then
            echo "  - Copying JWT_SECRET"
            sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env
        fi
        
        if [ ! -z "$MAGIC_SECRET_KEY" ]; then
            echo "  - Copying MAGIC_SECRET_KEY"
            sed -i.bak "s|MAGIC_SECRET_KEY=.*|MAGIC_SECRET_KEY=$MAGIC_SECRET_KEY|" .env
        fi
        
        if [ ! -z "$DB_NAME" ]; then
            echo "  - Copying DB_NAME"
            sed -i.bak "s|DB_NAME=.*|DB_NAME=$DB_NAME|" .env
        fi
        
        if [ ! -z "$DOMAIN" ]; then
            echo "  - Copying DOMAIN"
            sed -i.bak "s|DOMAIN=.*|DOMAIN=$DOMAIN|" .env
        fi
        
        if [ ! -z "$PM2_INSTANCES" ]; then
            echo "  - Copying PM2_INSTANCES"
            sed -i.bak "s|PM2_INSTANCES=.*|PM2_INSTANCES=$PM2_INSTANCES|" .env
        fi
        
        # Clean up backup files
        rm -f .env.bak
        
        echo -e "${GREEN}Values copied from root .env${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}Please review docker/.env and update the following:${NC}"
    echo "  - DOMAIN: Set your domain name (or leave as localhost for local testing)"
    echo "  - MONGODB_URI: Verify MongoDB connection string"
    echo "  - Other settings as needed"
    echo ""
    echo -e "${RED}Edit docker/.env and run this script again${NC}"
    exit 1
fi

# Build images
echo -e "${GREEN}Step 1: Building Docker images...${NC}"
$DOCKER_COMPOSE build

# Stop existing containers
echo -e "${GREEN}Step 2: Stopping existing containers...${NC}"
$DOCKER_COMPOSE down

# Start services
echo -e "${GREEN}Step 3: Starting services...${NC}"
$DOCKER_COMPOSE up -d

# Wait for services to be healthy
echo -e "${GREEN}Step 4: Waiting for services to be healthy...${NC}"
sleep 5

# Check service status
echo -e "${GREEN}Step 5: Checking service status...${NC}"
$DOCKER_COMPOSE ps

# Get app container logs
echo ""
echo -e "${GREEN}Recent application logs:${NC}"
$DOCKER_COMPOSE logs --tail=20 app

echo ""
echo -e "${GREEN}=============================================="
echo "Deployment Complete!"
echo "=============================================="
echo -e "Application is running at: ${YELLOW}http://localhost${NC}"
echo ""
echo -e "${GREEN}Useful commands:${NC}"
echo "  View logs: $DOCKER_COMPOSE logs -f"
echo "  View app logs: $DOCKER_COMPOSE logs -f app"
echo "  Stop services: $DOCKER_COMPOSE down"
echo "  Restart services: $DOCKER_COMPOSE restart"
echo "  Rebuild: $DOCKER_COMPOSE build --no-cache"
echo -e "${NC}"
