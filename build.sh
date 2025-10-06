#!/bin/bash

# Build script for Social Appliance

echo "🏗️  Building Social Appliance..."

# Build the client
echo "📦 Building client..."
cd client-svelte
npm run build
cd ..

# Ensure the server has the latest dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

echo "✅ Build complete!"
echo ""
echo "To run in production mode:"
echo "  npm start"
echo ""
echo "The server will serve the client app and API on port 8000"
