#!/bin/bash

# Test login API directly from EC2
echo "🧪 Testing login API directly..."

echo ""
echo "1. Testing API connectivity:"
curl -s -o /dev/null -w "Status: %{http_code}\n" https://rentcarhub.duckdns.org/api/

echo ""
echo "2. Testing login endpoint with admin credentials:"
response=$(curl -s -X POST https://rentcarhub.duckdns.org/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rentalhub.com",
    "password": "admin123"
  }')

echo "Response: $response"

echo ""
echo "3. Testing with wrong credentials:"
wrong_response=$(curl -s -X POST https://rentcarhub.duckdns.org/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rentalhub.com", 
    "password": "wrongpassword"
  }')

echo "Response: $wrong_response"

echo ""
echo "4. Backend container logs:"
sudo docker logs rentalhub-backend --tail 20