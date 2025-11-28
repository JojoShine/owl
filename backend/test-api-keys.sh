#!/bin/bash

# Test API Key Management Flow
# This script tests creating, retrieving, updating, and deleting API keys

BASE_URL="http://localhost:3001/api"
USER_EMAIL="admin@example.com"
USER_PASSWORD="123456"
ADMIN_TOKEN=""

echo "=== API Key Management Test ==="
echo ""

# Step 1: Login to get token
echo "Step 1: Logging in to get JWT token..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$USER_EMAIL\",
    \"password\": \"$USER_PASSWORD\",
    \"captcha\": \"test\"
  }")

echo "Login Response: $LOGIN_RESPONSE"
ADMIN_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "JWT Token: $ADMIN_TOKEN"
echo ""

# Step 2: Create a new API key
echo "Step 2: Creating a new API key..."
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api-builder/keys" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"app_name\": \"Test App 1\"
  }")

echo "Create Response: $CREATE_RESPONSE"
APP_ID=$(echo $CREATE_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
APP_KEY=$(echo $CREATE_RESPONSE | grep -o '"api_key":"[^"]*' | cut -d'"' -f4)
echo "App ID: $APP_ID"
echo "App Key: $APP_KEY"
echo ""

# Step 3: Get all API keys
echo "Step 3: Getting all API keys..."
GET_RESPONSE=$(curl -s -X GET "$BASE_URL/api-builder/keys" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Get Response: $GET_RESPONSE"
echo ""

# Step 4: Update API key name
echo "Step 4: Updating API key name..."
UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api-builder/keys/$APP_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"app_name\": \"Test App Updated\"
  }")

echo "Update Response: $UPDATE_RESPONSE"
echo ""

# Step 5: Test app_id/app_key authentication
echo "Step 5: Testing app_id/app_key authentication..."
AUTH_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"app_id\": \"$APP_ID\",
    \"app_key\": \"$APP_KEY\"
  }")

echo "Auth Response: $AUTH_RESPONSE"
API_KEY_TOKEN=$(echo $AUTH_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token from API Key: $API_KEY_TOKEN"
echo ""

# Step 6: Delete API key
echo "Step 6: Deleting API key..."
DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/api-builder/keys/$APP_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Delete Response: $DELETE_RESPONSE"
echo ""

echo "=== Test Complete ==="