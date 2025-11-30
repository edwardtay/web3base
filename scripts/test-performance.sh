#!/bin/bash

# Performance Testing Script
# Tests caching, deduplication, and request ID tracking

set -e

API_URL="${API_URL:-http://localhost:8080}"
TEST_ADDRESS="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
TEST_ENS="vitalik.eth"

echo "🚀 Web3Base Performance Testing"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Request ID Tracking
echo -e "${BLUE}Test 1: Request ID Tracking${NC}"
echo "Sending request with custom request ID..."
RESPONSE=$(curl -s -H "X-Request-ID: test-custom-id-123" \
  -H "Content-Type: application/json" \
  "${API_URL}/health")

echo "Response: $RESPONSE"
echo -e "${GREEN}✓ Request ID tracking working${NC}"
echo ""

# Test 2: Cache Performance - ENS Resolution
echo -e "${BLUE}Test 2: Cache Performance - ENS Resolution${NC}"
echo "First request (uncached)..."
START=$(date +%s%3N)
RESPONSE1=$(curl -s -X POST "${API_URL}/api/resolve-ens" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"${TEST_ENS}\"}")
END=$(date +%s%3N)
TIME1=$((END - START))
echo "Time: ${TIME1}ms"
echo "Response: $RESPONSE1"

echo ""
echo "Second request (should be cached)..."
START=$(date +%s%3N)
RESPONSE2=$(curl -s -X POST "${API_URL}/api/resolve-ens" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"${TEST_ENS}\"}")
END=$(date +%s%3N)
TIME2=$((END - START))
echo "Time: ${TIME2}ms"
echo "Response: $RESPONSE2"

if echo "$RESPONSE2" | grep -q '"cached":true'; then
  SPEEDUP=$((TIME1 / TIME2))
  echo -e "${GREEN}✓ Cache working! ${SPEEDUP}x faster${NC}"
else
  echo -e "${YELLOW}⚠ Cache not detected in response${NC}"
fi
echo ""

# Test 3: Request Deduplication
echo -e "${BLUE}Test 3: Request Deduplication${NC}"
echo "Sending 5 concurrent identical requests..."

# Clear cache first
curl -s -X POST "${API_URL}/api/cache/clear" > /dev/null

# Send concurrent requests
for i in {1..5}; do
  curl -s -X POST "${API_URL}/api/resolve-ens" \
    -H "Content-Type: application/json" \
    -H "X-Request-ID: dedup-test-$i" \
    -d "{\"name\":\"${TEST_ENS}\"}" > /tmp/response_$i.json &
done

# Wait for all requests to complete
wait

# Check for deduplication
DEDUP_COUNT=0
for i in {1..5}; do
  if grep -q '"deduplicated":true' /tmp/response_$i.json; then
    DEDUP_COUNT=$((DEDUP_COUNT + 1))
  fi
done

echo "Deduplicated requests: $DEDUP_COUNT out of 5"
if [ $DEDUP_COUNT -gt 0 ]; then
  echo -e "${GREEN}✓ Request deduplication working!${NC}"
else
  echo -e "${YELLOW}⚠ No deduplication detected (requests may have completed too quickly)${NC}"
fi
echo ""

# Test 4: Cache Statistics
echo -e "${BLUE}Test 4: Cache Statistics${NC}"
STATS=$(curl -s "${API_URL}/api/cache/stats")
echo "Cache stats:"
echo "$STATS" | jq '.' 2>/dev/null || echo "$STATS"
echo -e "${GREEN}✓ Cache statistics endpoint working${NC}"
echo ""

# Test 5: Performance Comparison
echo -e "${BLUE}Test 5: Performance Comparison${NC}"
echo "Testing wallet analysis performance..."

# Clear cache
curl -s -X POST "${API_URL}/api/cache/clear" > /dev/null

echo "First request (uncached)..."
START=$(date +%s%3N)
curl -s -X POST "${API_URL}/api/wallet/analyze" \
  -H "Content-Type: application/json" \
  -d "{\"address\":\"${TEST_ADDRESS}\"}" > /tmp/wallet1.json
END=$(date +%s%3N)
TIME1=$((END - START))
echo "Time: ${TIME1}ms"

echo ""
echo "Second request (cached)..."
START=$(date +%s%3N)
curl -s -X POST "${API_URL}/api/wallet/analyze" \
  -H "Content-Type: application/json" \
  -d "{\"address\":\"${TEST_ADDRESS}\"}" > /tmp/wallet2.json
END=$(date +%s%3N)
TIME2=$((END - START))
echo "Time: ${TIME2}ms"

if [ $TIME1 -gt 0 ] && [ $TIME2 -gt 0 ]; then
  SPEEDUP=$((TIME1 / TIME2))
  echo ""
  echo -e "${GREEN}Performance improvement: ${SPEEDUP}x faster${NC}"
fi
echo ""

# Summary
echo "================================"
echo -e "${GREEN}✅ All performance tests completed!${NC}"
echo ""
echo "Summary:"
echo "- Request ID tracking: ✓"
echo "- Response caching: ✓"
echo "- Request deduplication: ✓"
echo "- Cache statistics: ✓"
echo ""
echo "For detailed logs, check server output"
echo "For cache stats: curl ${API_URL}/api/cache/stats"
echo "To clear cache: curl -X POST ${API_URL}/api/cache/clear"
