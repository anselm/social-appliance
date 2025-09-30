#!/bin/bash

echo "Testing 404 error handling..."
echo ""

# Test various invalid URLs
URLS=(
  "/asdfasdf"
  "/garbage/not-valid"
  "/does/not/exist"
  "/demo/invalid-child"
  "/really/deep/invalid/path"
)

for slug in "${URLS[@]}"; do
  echo "Testing slug: $slug"
  # Test the API directly
  api_url="http://localhost:3000/api/entities/slug${slug}"
  response=$(curl -s -o /dev/null -w "%{http_code}" "$api_url")
  echo "API Response: $response"
  
  # Also show the actual error message
  error=$(curl -s "$api_url" | jq -r '.error // "No error"' 2>/dev/null || echo "Failed to parse response")
  echo "Error message: $error"
  echo ""
done
