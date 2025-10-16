#!/bin/bash

# KsheerMitra WhatsApp & Delivery Management API Test Script
# This script tests the new authentication and delivery management endpoints

BASE_URL="http://localhost:3000"
WHATSAPP_NUMBER="+919876543210"
OTP_CODE="123456"  # Replace with actual OTP from WhatsApp

echo "=== KsheerMitra API Test Script ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Send WhatsApp OTP
echo -e "${YELLOW}Test 1: Sending WhatsApp OTP${NC}"
response=$(curl -s -X POST "$BASE_URL/auth/whatsapp/send-otp" \
  -H "Content-Type: application/json" \
  -d "{\"whatsapp_number\": \"$WHATSAPP_NUMBER\"}")

if echo "$response" | grep -q "success"; then
  echo -e "${GREEN}✓ OTP sent successfully${NC}"
  echo "$response" | jq '.'
else
  echo -e "${RED}✗ Failed to send OTP${NC}"
  echo "$response" | jq '.'
fi
echo ""

# Wait for user to enter OTP
echo -e "${YELLOW}Please enter the OTP received on WhatsApp:${NC}"
read -p "OTP: " OTP_CODE
echo ""

# Test 2: Verify WhatsApp OTP
echo -e "${YELLOW}Test 2: Verifying WhatsApp OTP${NC}"
response=$(curl -s -X POST "$BASE_URL/auth/whatsapp/verify-otp" \
  -H "Content-Type: application/json" \
  -d "{\"whatsapp_number\": \"$WHATSAPP_NUMBER\", \"otp_code\": \"$OTP_CODE\"}")

if echo "$response" | grep -q "success"; then
  echo -e "${GREEN}✓ OTP verified successfully${NC}"
  echo "$response" | jq '.'
  
  # Extract tokens if user exists
  ACCESS_TOKEN=$(echo "$response" | jq -r '.data.accessToken // empty')
  USER_EXISTS=$(echo "$response" | jq -r '.data.userExists')
  
  if [ "$USER_EXISTS" = "true" ]; then
    echo -e "${GREEN}User exists, logged in${NC}"
  else
    echo -e "${YELLOW}New user, proceeding to signup${NC}"
  fi
else
  echo -e "${RED}✗ Failed to verify OTP${NC}"
  echo "$response" | jq '.'
  exit 1
fi
echo ""

# Test 3: Complete signup (if new user)
if [ "$USER_EXISTS" = "false" ]; then
  echo -e "${YELLOW}Test 3: Completing WhatsApp signup${NC}"
  response=$(curl -s -X POST "$BASE_URL/auth/whatsapp/complete-signup" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"Test User\",
      \"whatsapp_number\": \"$WHATSAPP_NUMBER\",
      \"latitude\": 12.9716,
      \"longitude\": 77.5946,
      \"address_manual\": \"123 Test Street, Bangalore\"
    }")

  if echo "$response" | grep -q "success"; then
    echo -e "${GREEN}✓ Signup completed successfully${NC}"
    echo "$response" | jq '.'
    ACCESS_TOKEN=$(echo "$response" | jq -r '.data.accessToken')
  else
    echo -e "${RED}✗ Failed to complete signup${NC}"
    echo "$response" | jq '.'
    exit 1
  fi
  echo ""
fi

# Test 4: Get customers with location (requires admin token)
echo -e "${YELLOW}Test 4: Getting customers with location (Admin only)${NC}"
echo "Note: This requires admin authentication. Using user token will fail."
response=$(curl -s -X GET "$BASE_URL/delivery-management/customers/locations" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$response" | grep -q "success"; then
  echo -e "${GREEN}✓ Retrieved customers with location${NC}"
  echo "$response" | jq '.'
else
  echo -e "${YELLOW}⚠ Expected to fail if not admin${NC}"
  echo "$response" | jq '.'
fi
echo ""

# Test 5: Get delivery areas
echo -e "${YELLOW}Test 5: Getting delivery areas${NC}"
response=$(curl -s -X GET "$BASE_URL/delivery-management/areas" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$response" | grep -q "success"; then
  echo -e "${GREEN}✓ Retrieved delivery areas${NC}"
  echo "$response" | jq '.'
else
  echo -e "${RED}✗ Failed to get delivery areas${NC}"
  echo "$response" | jq '.'
fi
echo ""

# Test 6: Health check
echo -e "${YELLOW}Test 6: Server health check${NC}"
response=$(curl -s -X GET "$BASE_URL/health")

if echo "$response" | grep -q "success"; then
  echo -e "${GREEN}✓ Server is healthy${NC}"
  echo "$response" | jq '.'
else
  echo -e "${RED}✗ Server health check failed${NC}"
  echo "$response" | jq '.'
fi
echo ""

echo -e "${GREEN}=== Test Complete ===${NC}"
echo ""
echo "Summary:"
echo "- WhatsApp OTP authentication: Tested"
echo "- User signup with location: Tested"
echo "- Delivery management endpoints: Available"
echo ""
echo "Next steps:"
echo "1. Test with admin account for delivery area management"
echo "2. Test route optimization with multiple customers"
echo "3. Test delivery boy route completion flow"
