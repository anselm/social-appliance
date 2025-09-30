#!/bin/bash

echo "Testing 404 error handling..."
echo ""

# Test various invalid URLs
URLS=(
  "http://localhost:5173/asdfasdf"
  "http://localhost:5173/garbage/not-valid"
  "http://localhost:5173/does/not/exist"
  "http://localhost:5173/demo/invalid-child"
)

for url in "${URLS[@]}"; do
  echo "Testing: $url"
  # Check if the API returns 404
  api_url=$(echo $url | sed 's|5173|3000/api/entities/slug|' | sed 's|http://localhost:3000/api/entities/slug/|http://localhost:3000/api/entities/slug/|')
  response=$(curl -s -o /dev/null -w "%{http_code}" "$api_url")
  echo "API Response: $response"
  echo ""
done
