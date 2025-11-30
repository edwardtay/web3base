# Performance Architecture

## Request Flow with Optimizations

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Request                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Request ID Middleware                         │
│  • Generate/Extract Request ID: req_1234567890_abc123           │
│  • Add to response headers: X-Request-ID                        │
│  • Attach to all logs: [req_1234567890_abc123]                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Security Middleware                         │
│  • Rate Limiting                                                 │
│  • CORS                                                          │
│  • Helmet                                                        │
│  • Input Validation                                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Cache Check                              │
│                                                                  │
│  cache.get(key) ──────────┬─────────────────────────────────┐  │
│                           │                                  │  │
│                      Cache Hit?                              │  │
│                           │                                  │  │
│                  ┌────────┴────────┐                        │  │
│                  │                 │                        │  │
│                 YES               NO                        │  │
│                  │                 │                        │  │
│                  ▼                 ▼                        │  │
│         ┌───────────────┐  ┌──────────────────┐           │  │
│         │ Return Cached │  │ Continue to      │           │  │
│         │ Response      │  │ Deduplication    │           │  │
│         │ (50-100ms)    │  │                  │           │  │
│         └───────┬───────┘  └────────┬─────────┘           │  │
│                 │                   │                      │  │
│                 │                   ▼                      │  │
└─────────────────┼───────────────────────────────────────────┘
                  │           ┌─────────────────────────────────┐
                  │           │   Request Deduplication         │
                  │           │                                 │
                  │           │  deduplicator.deduplicate()     │
                  │           │           │                     │
                  │           │    Already Pending?             │
                  │           │           │                     │
                  │           │  ┌────────┴────────┐           │
                  │           │  │                 │           │
                  │           │ YES               NO           │
                  │           │  │                 │           │
                  │           │  ▼                 ▼           │
                  │           │ ┌──────────┐  ┌──────────┐    │
                  │           │ │ Wait for │  │ Execute  │    │
                  │           │ │ Original │  │ Request  │    │
                  │           │ │ Request  │  │          │    │
                  │           │ └────┬─────┘  └────┬─────┘    │
                  │           │      │             │           │
                  │           │      └──────┬──────┘           │
                  │           │             │                  │
                  │           └─────────────┼──────────────────┘
                  │                         │
                  │                         ▼
                  │           ┌─────────────────────────────────┐
                  │           │    External API Calls           │
                  │           │                                 │
                  │           │  • Moralis (wallet data)        │
                  │           │  • Alchemy (token balances)     │
                  │           │  • Blockscout (transactions)    │
                  │           │  • Thirdweb (portfolio)         │
                  │           │  • Revoke.cash (approvals)      │
                  │           │  • Nansen (intelligence)        │
                  │           │  • MetaSleuth (risk)            │
                  │           │  • Passport (identity)          │
                  │           │                                 │
                  │           │  Time: 3000-5000ms              │
                  │           └─────────────┬───────────────────┘
                  │                         │
                  │                         ▼
                  │           ┌─────────────────────────────────┐
                  │           │      Process & Aggregate        │
                  │           │                                 │
                  │           │  • Merge data from 8 sources    │
                  │           │  • Calculate risk scores        │
                  │           │  • Detect threats               │
                  │           │  • Format response              │
                  │           └─────────────┬───────────────────┘
                  │                         │
                  │                         ▼
                  │           ┌─────────────────────────────────┐
                  │           │       Cache Result              │
                  │           │                                 │
                  │           │  cache.set(key, result, TTL)    │
                  │           │                                 │
                  │           │  TTL based on data type:        │
                  │           │  • Wallet: 5 minutes            │
                  │           │  • ENS: 1 hour                  │
                  │           │  • Quest: 2 minutes             │
                  │           └─────────────┬───────────────────┘
                  │                         │
                  └─────────────────────────┘
                                            │
                                            ▼
                              ┌─────────────────────────────────┐
                              │      Return Response            │
                              │                                 │
                              │  {                              │
                              │    "success": true,             │
                              │    "data": {...},               │
                              │    "cached": false,             │
                              │    "deduplicated": false        │
                              │  }                              │
                              │                                 │
                              │  Headers:                       │
                              │  X-Request-ID: req_123...       │
                              └─────────────────────────────────┘
```

## Performance Comparison

### Scenario 1: First Request (Cold Start)

```
Request 1 (0x123...)
│
├─ Request ID: req_001 ────────────────────────────────────────┐
├─ Cache Check: MISS                                           │
├─ Deduplication: NEW                                          │
├─ External APIs: 8 parallel calls ──────────────────────────┐ │
│  ├─ Moralis: 1200ms                                        │ │
│  ├─ Alchemy: 800ms                                         │ │
│  ├─ Blockscout: 1500ms                                     │ │
│  ├─ Thirdweb: 900ms                                        │ │
│  ├─ Revoke: 700ms                                          │ │
│  ├─ Nansen: 1100ms                                         │ │
│  ├─ MetaSleuth: 1300ms                                     │ │
│  └─ Passport: 600ms                                        │ │
│                                                             │ │
├─ Processing: 200ms ◄───────────────────────────────────────┘ │
├─ Cache Set: 5ms                                              │
└─ Total Time: 5000ms ◄────────────────────────────────────────┘
```

### Scenario 2: Repeated Request (Cache Hit)

```
Request 2 (0x123...) - Same address
│
├─ Request ID: req_002 ────────────────────────────────────────┐
├─ Cache Check: HIT ✓                                          │
├─ Return Cached Data: 50ms                                    │
└─ Total Time: 50ms ◄──────────────────────────────────────────┘

Performance: 100x faster (5000ms → 50ms)
API Calls Saved: 8 calls (100% reduction)
```

### Scenario 3: Concurrent Identical Requests (Deduplication)

```
Request 3 (0x456...) ──┐
Request 4 (0x456...) ──┼─ All arrive within 100ms
Request 5 (0x456...) ──┘
│
├─ Request IDs: req_003, req_004, req_005
│
├─ Request 3:
│  ├─ Cache Check: MISS
│  ├─ Deduplication: NEW (starts processing)
│  └─ External APIs: 8 parallel calls ────────────────────────┐
│                                                              │
├─ Request 4:                                                  │
│  ├─ Cache Check: MISS                                       │
│  ├─ Deduplication: PENDING (waits for req_003)             │
│  └─ Waits... ────────────────────────────────────────────┐  │
│                                                           │  │
├─ Request 5:                                               │  │
│  ├─ Cache Check: MISS                                    │  │
│  ├─ Deduplication: PENDING (waits for req_003)          │  │
│  └─ Waits... ─────────────────────────────────────────┐  │  │
│                                                        │  │  │
├─ Request 3 completes: 5000ms ◄────────────────────────┘  │  │
├─ Request 4 gets result: 5010ms ◄──────────────────────────┘  │
├─ Request 5 gets result: 5015ms ◄─────────────────────────────┘
│
└─ Total API Calls: 8 (instead of 24)
   Savings: 67% reduction in processing time
   API Call Reduction: 66% (16 calls saved)
```

### Scenario 4: Mixed Requests (Cache + Deduplication)

```
Time 0ms:   Request A (0x111...) ─┐
Time 100ms: Request B (0x222...) ─┼─ Different addresses
Time 200ms: Request C (0x111...) ─┘  (same as A)
│
├─ Request A (0x111...):
│  ├─ Cache: MISS
│  ├─ Deduplication: NEW
│  ├─ Processing: 5000ms
│  └─ Result at 5000ms
│
├─ Request B (0x222...):
│  ├─ Cache: MISS
│  ├─ Deduplication: NEW
│  ├─ Processing: 5000ms
│  └─ Result at 5100ms
│
└─ Request C (0x111...):
   ├─ Cache: HIT ✓ (A's result cached)
   ├─ Result at 250ms
   └─ 20x faster than A
```

## Memory Usage

```
┌─────────────────────────────────────────────────────────────┐
│                      Cache Memory                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Typical Entry Size:                                        │
│  • Wallet Analysis: ~50KB                                   │
│  • ENS Resolution: ~200 bytes                               │
│  • Quest Verification: ~2KB                                 │
│                                                              │
│  Estimated Memory (100 cached entries):                     │
│  • 50 wallets × 50KB = 2.5MB                               │
│  • 30 ENS × 200B = 6KB                                     │
│  • 20 quests × 2KB = 40KB                                  │
│  • Total: ~2.5MB                                           │
│                                                              │
│  Max Recommended: 500MB                                     │
│  Cleanup: Every 5 minutes (automatic)                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Deduplication Memory                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Typical Entry Size: ~1KB (promise reference)               │
│  Average Pending: 5-10 requests                             │
│  Memory Usage: ~10KB                                        │
│  Cleanup: Every 1 minute (automatic)                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Monitoring Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│                   Performance Metrics                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Cache Statistics:                                          │
│  ├─ Hit Rate: 85% ████████████████████░░░░                 │
│  ├─ Miss Rate: 15% ███░░░░░░░░░░░░░░░░░░░                 │
│  ├─ Total Entries: 127                                     │
│  └─ Memory Usage: 3.2MB                                    │
│                                                              │
│  Deduplication:                                             │
│  ├─ Active Requests: 3                                     │
│  ├─ Deduplicated Today: 1,247                              │
│  └─ Savings: 62% API calls                                 │
│                                                              │
│  Request Tracking:                                          │
│  ├─ Total Requests: 5,432                                  │
│  ├─ Avg Response Time: 245ms                               │
│  ├─ P95 Response Time: 850ms                               │
│  └─ P99 Response Time: 5200ms                              │
│                                                              │
│  API Call Reduction:                                        │
│  ├─ Without Optimization: 43,456 calls                     │
│  ├─ With Optimization: 4,128 calls                         │
│  └─ Savings: 90.5% (39,328 calls saved)                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Cost Savings Example

### Monthly API Costs (10,000 requests/month)

**Without Optimizations:**
```
10,000 requests × 8 API calls = 80,000 API calls
80,000 calls × $0.001/call = $80/month
```

**With Optimizations (85% cache hit rate):**
```
First requests: 1,500 × 8 = 12,000 API calls
Cached requests: 8,500 × 0 = 0 API calls
Total: 12,000 API calls
12,000 calls × $0.001/call = $12/month

Savings: $68/month (85% reduction)
```

## Implementation Checklist

- [x] Request ID middleware
- [x] In-memory cache with TTL
- [x] Request deduplication
- [x] Cache statistics endpoint
- [x] Automatic cleanup
- [x] Response indicators (cached, deduplicated)
- [x] Comprehensive logging
- [x] Performance testing script
- [x] Documentation

## Next Steps

1. **Monitor in Production**
   - Track cache hit rates
   - Monitor memory usage
   - Analyze deduplication effectiveness

2. **Optimize TTL Values**
   - Adjust based on data volatility
   - Balance freshness vs performance

3. **Consider Redis**
   - For multi-instance deployments
   - For persistent caching
   - For distributed deduplication

4. **Add Metrics**
   - Prometheus/Grafana integration
   - Real-time dashboards
   - Alerting on anomalies
