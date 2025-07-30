#!/bin/bash

echo "🔍 Testing webhook delivery..."

# Test 1: Test the webhook test endpoint
echo "📋 Test 1: Testing webhook test endpoint"
curl -X POST https://bet2025-2.onrender.com/api/paychangu/webhook-test \
  -H "Content-Type: application/json" \
  -d '{
    "status": "success",
    "message": "Test webhook delivery",
    "data": {
      "payment_link": {
        "reference_id": "CURL_TEST_'$(date +%s)'",
        "email": "test@curl.com",
        "amount": 1000,
        "currency": "MWK"
      }
    }
  }'

echo -e "\n\n"

# Test 2: Test the main webhook endpoint
echo "📋 Test 2: Testing main webhook endpoint"
curl -X POST https://bet2025-2.onrender.com/api/paychangu/webhook \
  -H "Content-Type: application/json" \
  -H "x-test-mode: true" \
  -d '{
    "status": "success",
    "message": "Test main webhook",
    "data": {
      "payment_link": {
        "reference_id": "CURL_MAIN_'$(date +%s)'",
        "email": "test@main.com",
        "amount": 2000,
        "currency": "MWK"
      }
    }
  }'

echo -e "\n\n🎉 Webhook tests completed!" 