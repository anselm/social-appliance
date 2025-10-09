#!/bin/bash

# Social Appliance - Google Cloud Run Deployment Script
# This script builds and deploys the application to Google Cloud Run

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${GCLOUD_PROJECT_ID}"
REGION="${GCLOUD_REGION:-us-central1}"
SERVICE_NAME="${GCLOUD_SERVICE_NAME:-social-appliance}"
IMAGE_NAME="social-appliance"
IMAGE_TAG="latest"

echo -e "${GREEN}Social Appliance - Google Cloud Run Deployment${NC}"
echo "=============================================="

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    echo "Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if PROJECT_ID is set
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}Error: GCLOUD_PROJECT_ID environment variable is not set${NC}"
    echo "Set it with: export GCLOUD_PROJECT_ID=your-project-id"
    exit 1
fi

# Check if MONGODB_URI is set
if [ -z "$MONGODB_URI" ]; then
    echo -e "${RED}Error: MONGODB_URI environment variable is not set${NC}"
    echo "Set it with: export MONGODB_URI=your-mongodb-atlas-uri"
    echo "Get a free MongoDB Atlas cluster at: https://www.mongodb.com/cloud/atlas"
    exit 1
fi

echo -e "${YELLOW}Project ID: ${PROJECT_ID}${NC}"
echo -e "${YELLOW}Region: ${REGION}${NC}"
echo -e "${YELLOW}Service: ${SERVICE_NAME}${NC}"
echo ""

# Authenticate with Google Cloud
echo -e "${GREEN}Step 1: Authenticating with Google Cloud...${NC}"
gcloud auth configure-docker ${REGION}-docker.pkg.dev

# Set project
gcloud config set project ${PROJECT_ID}

# Enable required APIs
echo -e "${GREEN}Step 2: Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# Create Artifact Registry repository if it doesn't exist
echo -e "${GREEN}Step 3: Ensuring Artifact Registry repository exists...${NC}"
gcloud artifacts repositories create ${IMAGE_NAME} \
    --repository-format=docker \
    --location=${REGION} \
    --description="Social Appliance Docker images" \
    2>/dev/null || echo "Repository already exists"

# Build Docker image
echo -e "${GREEN}Step 4: Building Docker image...${NC}"
cd "$(dirname "$0")/.."
GCR_IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${IMAGE_NAME}/${IMAGE_NAME}:${IMAGE_TAG}"
docker build -f docker/Dockerfile -t ${GCR_IMAGE} .

# Push to Google Container Registry
echo -e "${GREEN}Step 5: Pushing image to Artifact Registry...${NC}"
docker push ${GCR_IMAGE}

# Deploy to Cloud Run
echo -e "${GREEN}Step 6: Deploying to Cloud Run...${NC}"
gcloud run deploy ${SERVICE_NAME} \
    --image=${GCR_IMAGE} \
    --platform=managed \
    --region=${REGION} \
    --allow-unauthenticated \
    --port=8080 \
    --memory=512Mi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=10 \
    --set-env-vars="NODE_ENV=production,PORT=8080,MONGODB_URI=${MONGODB_URI},DB_NAME=${DB_NAME:-social_appliance},SESSION_SECRET=${SESSION_SECRET:-change-me-in-production},JWT_SECRET=${JWT_SECRET:-change-me-in-production},MAGIC_SECRET_KEY=${MAGIC_SECRET_KEY:-},LOAD_SEED_DATA=${LOAD_SEED_DATA:-true},FLUSH_DB=${FLUSH_DB:-false}" \
    --timeout=300

# Get service URL
echo -e "${GREEN}Step 7: Getting service URL...${NC}"
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
    --platform=managed \
    --region=${REGION} \
    --format='value(status.url)')

echo ""
echo -e "${GREEN}=============================================="
echo "Deployment Complete!"
echo "=============================================="
echo -e "Service URL: ${YELLOW}${SERVICE_URL}${NC}"
echo -e "Access your app at: ${YELLOW}${SERVICE_URL}${NC}"
echo ""
echo -e "${GREEN}Important Notes:${NC}"
echo "1. Cloud Run is stateless - using MongoDB Atlas for database"
echo "2. Update CORS_ORIGIN in your environment to: ${SERVICE_URL}"
echo "3. For custom domain, see: https://cloud.google.com/run/docs/mapping-custom-domains"
echo ""
echo -e "${GREEN}Useful commands:${NC}"
echo "  View logs: gcloud run services logs read ${SERVICE_NAME} --region=${REGION}"
echo "  Update service: gcloud run services update ${SERVICE_NAME} --region=${REGION}"
echo "  Delete service: gcloud run services delete ${SERVICE_NAME} --region=${REGION}"
echo ""
echo -e "${GREEN}Environment Variables to Set:${NC}"
echo "  export GCLOUD_PROJECT_ID=${PROJECT_ID}"
echo "  export MONGODB_URI=your-mongodb-atlas-uri"
echo "  export SESSION_SECRET=your-session-secret"
echo "  export JWT_SECRET=your-jwt-secret"
echo "  export MAGIC_SECRET_KEY=your-magic-secret-key"
echo -e "${NC}"
