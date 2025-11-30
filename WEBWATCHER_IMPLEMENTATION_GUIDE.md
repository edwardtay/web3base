# WebWatcher Backend Implementation Guide

## Overview

This guide explains exactly which files in the **webwatcher repo** (`https://github.com/edwardtay/webwatcher`) need to be created or modified to add the missing endpoints.

## Files Involved

### 📁 File Structure in WebWatcher Repo

Assuming the webwatcher repo has a similar structure to this one:

```
webwatcher/
├── src/
│   ├── server.ts              ← MODIFY (add endpoints)
│   └── utils/
│       ├── logger.ts          ← EXISTS (used by ens-resolver)
│       └── ens-resolver.ts    ← CREATE (new file)
└── package.json               ← VERIFY (no new deps needed)
```

---

## Step-by-Step Implementation

### Step 1: Create ENS Resolver Utility File

**File:** `src/utils/ens-resolver.ts` (NEW FILE - CREATE THIS)

**Location:** Create this file in the `src/utils/` directory

**Full Content:** Copy lines 8-103 from `WEBWATCHER_PATCH_FULL.ts`

```typescript
/**
 * ENS (Ethereum Name Service) Resolver
 * Resolves .eth domains to wallet addresses using public APIs
 */

import { logger } from "./logger";

export async function resolveENS(ensDomain: string): Promise<string | null> {
  try {
    logger.info(`[ENS] Resolving ${ensDomain}...`);
    
    const normalizedName = ensDomain.toLowerCase().trim();
    
    // Method 1: Alchemy (if API key available)
    const alchemyKey = process.env.ALCHEMY_API_KEY;
    if (alchemyKey) {
      try {
        const response = await fetch(
          `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [{
                to: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
                data: '0x0178b8bf' + normalizedName.split('.')[0].padEnd(64, '0'),
              }, 'latest'],
              id: 1,
            }),
          }
        );
        
        if (response.ok) {
          const data = await response.json() as { result?: string };
          if (data.result?.startsWith('0x') && data.result.length === 42) {
            logger.info(`[ENS] Resolved ${ensDomain} -> ${data.result} (via Alchemy)`);
            return data.result;
          }
        }
      } catch (error) {
        logger.debug(`[ENS] Alchemy resolution failed:`, error);
      }
    }
    
    // Method 2: ENS.domains API (public)
    try {
      const response = await fetch(`https://api.ensideas.com/ens/resolve/${normalizedName}`, {
        headers: { 'Accept': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json() as { address?: string };
        if (data.address?.startsWith('0x') && data.address.length === 42) {
          logger.info(`[ENS] Resolved ${ensDomain} -> ${data.address} (via ENS API)`);
          return data.address;
        }
      }
    } catch (error) {
      logger.debug(`[ENS] ENS API resolution failed:`, error);
    }
    
    // Method 3: Web3.bio API (public)
    try {
      const response = await fetch(`https://api.web3.bio/profile/ens/${normalizedName}`, {
        headers: { 'Accept': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json() as { address?: string; ethereum?: { address?: string } };
        const address = data.address || data.ethereum?.address;
        if (address?.startsWith('0x') && address.length === 42) {
          logger.info(`[ENS] Resolved ${ensDomain} -> ${address} (via Web3.bio)`);
          return address;
        }
      }
    } catch (error) {
      logger.debug(`[ENS] Web3.bio resolution failed:`, error);
    }
    
    logger.warn(`[ENS] Could not resolve ${ensDomain} using any method`);
    return null;
  } catch (error) {
    logger.error(`[ENS] Error resolving ${ensDomain}:`, error);
    return null;
  }
}

export function isValidENS(domain: string): boolean {
  return /^[a-zA-Z0-9-]+\.eth$/i.test(domain);
}
```

**Dependencies:** 
- Requires `logger` from `./utils/logger` (should already exist in webwatcher)
- Uses native `fetch` API (Node.js 18+ or polyfill)

---

### Step 2: Modify Server File - Add Import

**File:** `src/server.ts` (MODIFY EXISTING FILE)

**Location:** At the top of the file, with other imports (around line 1-15)

**Action:** Add this import statement with your other imports:

```typescript
import { resolveENS, isValidENS } from "./utils/ens-resolver";
```

**Example Context:** Your imports section should look something like:

```typescript
import express from "express";
import { logger } from "./utils/logger";
import { strictLimiter } from "./middleware/security";
// ... other imports ...
import { resolveENS, isValidENS } from "./utils/ens-resolver";  // ← ADD THIS LINE
```

---

### Step 3: Modify Server File - Add Endpoints

**File:** `src/server.ts` (MODIFY EXISTING FILE)

**Location:** After your existing endpoints (e.g., after `/api/chat` endpoint, around line 250-550)

**Action:** Add these two endpoint handlers:

#### Endpoint 1: ENS Resolution

```typescript
/**
 * ENS Resolution endpoint
 */
app.post("/api/resolve-ens", strictLimiter, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "ENS name is required" });
    }

    const resolvedAddress = await resolveENS(name);

    if (resolvedAddress) {
      res.status(200).json({
        success: true,
        name,
        address: resolvedAddress
      });
    } else {
      res.status(404).json({
        success: false,
        error: "Could not resolve ENS name"
      });
    }
  } catch (error: any) {
    logger.error('ENS resolution error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resolve ENS name',
      message: error.message
    });
  }
});
```

#### Endpoint 2: Wallet Analysis (Simplified Version)

**Option A: Minimal Implementation (Works Immediately)**

```typescript
/**
 * Wallet Analysis endpoint - Basic implementation
 */
app.post("/api/wallet/analyze", strictLimiter, async (req, res) => {
  try {
    const { address } = req.body;

    if (!address || typeof address !== "string") {
      return res.status(400).json({ error: "Wallet address is required" });
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: "Invalid Ethereum address format" });
    }

    // Basic response - can be enhanced later with integrations
    res.status(200).json({
      success: true,
      address,
      timestamp: new Date().toISOString(),
      message: "Wallet analysis endpoint - basic implementation",
      note: "Full implementation with Moralis, Blockscout, etc. can be added later"
    });
  } catch (error: any) {
    logger.error('Wallet analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze wallet',
      message: error.message 
    });
  }
});
```

**Option B: Full Implementation (Requires Integration Modules)**

If you want the full implementation with all integrations, copy lines 149-308 from `WEBWATCHER_PATCH_FULL.ts`. This requires:
- Integration modules from `src/integrations/` directory
- API keys for various services
- More complex setup

**Recommendation:** Start with Option A (minimal), then enhance later.

---

### Step 4: Update Root Endpoint (Optional)

**File:** `src/server.ts` (MODIFY EXISTING FILE)

**Location:** In your root `/` endpoint response (around line 185-195)

**Action:** Update the `endpoints` object to include the new endpoints:

```typescript
endpoints: {
  agentCard: "GET /.well-known/agent.json",
  chat: "POST /api/chat",
  check: "POST /check",
  health: "GET /healthz",
  resolveEns: "POST /api/resolve-ens",        // ← ADD THIS
  walletAnalyze: "POST /api/wallet/analyze"  // ← ADD THIS
}
```

---

## File Modification Summary

| File | Action | Location | What to Do |
|------|--------|----------|------------|
| `src/utils/ens-resolver.ts` | **CREATE** | New file | Copy entire file content from patch |
| `src/server.ts` | **MODIFY** | Top (imports) | Add `import { resolveENS, isValidENS } from "./utils/ens-resolver";` |
| `src/server.ts` | **MODIFY** | Middle (routes) | Add two endpoint handlers after existing endpoints |
| `src/server.ts` | **MODIFY** | Root endpoint (optional) | Update endpoints list in JSON response |

---

## Verification Checklist

After making changes:

- [ ] `src/utils/ens-resolver.ts` file exists
- [ ] Import statement added to `src/server.ts`
- [ ] `/api/resolve-ens` endpoint added
- [ ] `/api/wallet/analyze` endpoint added
- [ ] Code compiles without errors
- [ ] Server starts successfully

---

## Testing

Test locally before deploying:

```bash
# Test ENS resolution
curl -X POST http://localhost:8080/api/resolve-ens \
  -H "Content-Type: application/json" \
  -d '{"name": "vitalik.eth"}'

# Test wallet analysis
curl -X POST http://localhost:8080/api/wallet/analyze \
  -H "Content-Type: application/json" \
  -d '{"address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"}'
```

---

## Dependencies

**No new npm packages required!** The implementation uses:
- Native `fetch` API (Node.js 18+)
- Existing `logger` utility
- Existing `strictLimiter` middleware

If your Node.js version is < 18, you may need to add a fetch polyfill:
```bash
npm install node-fetch
```

---

## Common Issues & Solutions

### Issue: `logger` not found
**Solution:** Make sure `src/utils/logger.ts` exists in webwatcher repo. If it doesn't, you may need to create a simple logger or adjust the import.

### Issue: `strictLimiter` not found
**Solution:** Check if webwatcher uses a different rate limiter. You can use `apiLimiter` or create a simple rate limiter if needed.

### Issue: TypeScript errors
**Solution:** Make sure TypeScript types are correct. The code uses `any` types in catch blocks which should work, but you may need to adjust based on your TS config.

---

## Next Steps After Implementation

1. **Test locally** - Verify endpoints work
2. **Deploy to staging** - Test on staging environment
3. **Update CORS** - Ensure `*.vercel.app` domains are allowed
4. **Deploy to production** - Deploy to `webwatcher.lever-labs.com`
5. **Verify** - Test from Web3Base frontend

---

## Full Implementation (Future Enhancement)

For the full wallet analysis with all integrations, you'll need to:

1. Copy integration modules from `web3base-cursor/src/integrations/`:
   - `moralis.ts`
   - `blockscout.ts`
   - `alchemy.ts`
   - `thirdweb.ts`
   - `revoke.ts`
   - `nansen.ts`
   - `metasleuth.ts`
   - `passport.ts`

2. Add environment variables for API keys

3. Update `/api/wallet/analyze` endpoint with full implementation

See `WEBWATCHER_PATCH_FULL.ts` for the complete implementation.

