#!/bin/bash

# Webhook Testing Script
BASE_URL="https://bet2025-web.onrender.com"

echo "🧪 ===== WEBHOOK ENDPOINT TESTING ======"
echo "🌐 Base URL: $BASE_URL"
echo "📅 Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo ""

# Test ping endpoint
echo "🔍 Testing ping endpoint..."
curl -X GET "$BASE_URL/api/paychangu/ping" \
  -H "Content-Type: application/json" \
  -H "User-Agent: Webhook-Test/1.0" \
  -w "\nHTTP Status: %{http_code}\nTime: %{time_total}s\n" \
  -s

echo ""

# Test webhook-test endpoint
echo "🔍 Testing webhook-test endpoint..."
curl -X POST "$BASE_URL/api/paychangu/webhook-test" \
  -H "Content-Type: application/json" \
  -H "User-Agent: Webhook-Test/1.0" \
  -d '{"test": true, "message": "Test webhook data", "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}' \
  -w "\nHTTP Status: %{http_code}\nTime: %{time_total}s\n" \
  -s

echo ""

# Test main webhook endpoint
echo "🔍 Testing main webhook endpoint..."
curl -X POST "$BASE_URL/api/paychangu/webhook" \
  -H "Content-Type: application/json" \
  -H "User-Agent: Webhook-Test/1.0" \
  -H "Signature: test-signature" \
  -d '{"test": true, "message": "Test webhook data", "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}' \
  -w "\nHTTP Status: %{http_code}\nTime: %{time_total}s\n" \
  -s

echo ""

# Test debug endpoint
echo "🔍 Testing debug endpoint..."
curl -X GET "$BASE_URL/api/paychangu/debug" \
  -H "Content-Type: application/json" \
  -H "User-Agent: Webhook-Test/1.0" \
  -w "\nHTTP Status: %{http_code}\nTime: %{time_total}s\n" \
  -s

echo ""
echo "🏁 ===== TESTING COMPLETE ======" 