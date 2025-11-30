# WebWatcher Backend Patch - Add Wallet Analysis & ENS Resolution

This patch adds two missing API endpoints required by the Web3Base frontend:
- `/api/resolve-ens` - ENS domain resolution
- `/api/wallet/analyze` - Comprehensive wallet security analysis

## Overview

The Web3Base frontend (`https://web3-base-project.vercel.app`) requires these endpoints from the WebWatcher backend (`https://webwatcher.lever-labs.com`). Currently, the backend only exposes:
- ✅ `/api/chat`
- ✅ `/check`
- ✅ `/healthz`

Missing endpoints:
- ❌ `/api/resolve-ens`
- ❌ `/api/wallet/analyze`

## Files to Add/Modify

### 1. Add ENS Resolver Utility

**File:** `src/utils/ens-resolver.ts` (NEW)

```typescript
/**
 * ENS (Ethereum Name Service) Resolver
 * Resolves .eth domains to wallet addresses using public APIs
 */

import { logger } from "./logger";

/**
 * Resolve ENS domain to Ethereum address
 * Uses multiple public APIs for reliability
 */
export async function resolveENS(ensDomain: string): Promise<string | null {
  try {
    logger.info(`[ENS] Resolving ${ensDomain}...`);
    
    // Normalize ENS name
    const normalizedName = ensDomain.toLowerCase().trim();
    
    // Method 1: Use Alchemy's ENS resolution (most reliable if API key available)
    const alchemyKey = process.env.ALCHEMY_API_KEY;
    if (alchemyKey) {
      try {
        const response = await fetch(
          `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [
                {
                  to: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e', // ENS Registry
                  data: '0x0178b8bf' + normalizedName.split('.')[0].padEnd(64, '0'), // resolver(bytes32)
                },
                'latest'
              ],
              id: 1,
            }),
          }
        );
        
        if (response.ok) {
          const text = await response.text();
          try {
            const data = JSON.parse(text) as { result?: string };
            if (data.result && data.result.startsWith('0x') && data.result.length === 42) {
              logger.info(`[ENS] Resolved ${ensDomain} -> ${data.result} (via Alchemy)`);
              return data.result;
            }
          } catch (e) {
            logger.debug(`[ENS] Alchemy returned non-JSON response`);
          }
        }
      } catch (error) {
        logger.debug(`[ENS] Alchemy resolution failed:`, error);
      }
    }
    
    // Method 2: Use ENS.domains API (public, no key needed)
    try {
      const response = await fetch(`https://api.ensideas.com/ens/resolve/${normalizedName}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const text = await response.text();
        try {
          const data = JSON.parse(text) as { address?: string };
          if (data.address && data.address.startsWith('0x') && data.address.length === 42) {
            logger.info(`[ENS] Resolved ${ensDomain} -> ${data.address} (via ENS API)`);
            return data.address;
          }
        } catch (e) {
          logger.debug(`[ENS] ENS API returned non-JSON response`);
        }
      }
    } catch (error) {
      logger.debug(`[ENS] ENS API resolution failed:`, error);
    }
    
    // Method 3: Use simple public ENS resolver API
    try {
      const response = await fetch(`https://api.web3.bio/profile/ens/${normalizedName}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const text = await response.text();
        try {
          const data = JSON.parse(text) as { address?: string; ethereum?: { address?: string } };
          const address = data.address || data.ethereum?.address;
          if (address && address.startsWith('0x') && address.length === 42) {
            logger.info(`[ENS] Resolved ${ensDomain} -> ${address} (via Web3.bio)`);
            return address;
          }
        } catch (e) {
          logger.debug(`[ENS] Web3.bio returned non-JSON response`);
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

/**
 * Check if ENS domain is valid
 */
export function isValidENS(domain: string): boolean {
  const ensPattern = /^[a-zA-Z0-9-]+\.eth$/i;
  return ensPattern.test(domain);
}
```

### 2. Add Endpoints to Server

**File:** `src/server.ts` (MODIFY)

Add these imports at the top:

```typescript
import { resolveENS, isValidENS } from "./utils/ens-resolver";
```

Add these endpoints after your existing endpoints (e.g., after `/api/chat`):

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

/**
 * Wallet Analysis endpoint - Analyze wallet using multiple data providers
 * 
 * NOTE: This is a simplified version. Full implementation requires:
 * - Integration modules for Moralis, Blockscout, Alchemy, etc.
 * - API keys for these services
 * - See web3base-cursor repo for full implementation
 */
app.post("/api/wallet/analyze", strictLimiter, async (req, res) => {
  try {
    const { address } = req.body;

    if (!address || typeof address !== "string") {
      return res.status(400).json({ error: "Wallet address is required" });
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: "Invalid Ethereum address format" });
    }

    // TODO: Implement full wallet analysis
    // For now, return a basic response
    // Full implementation should fetch from:
    // - Moralis (wallet security, transactions)
    // - Blockscout (comprehensive wallet data)
    // - Alchemy (token balances, NFTs)
    // - Thirdweb (portfolio)
    // - Revoke.cash (token approvals)
    // - Nansen (wallet intelligence)
    // - MetaSleuth (risk scoring)
    // - Passport (identity verification)
    
    res.status(200).json({
      success: true,
      address,
      timestamp: new Date().toISOString(),
      message: "Wallet analysis endpoint - full implementation pending",
      note: "See web3base-cursor repo for full implementation with all integrations"
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

## Full Implementation (Optional)

For the full wallet analysis implementation with all integrations, you'll need to:

1. **Copy integration modules** from `web3base-cursor/src/integrations/`:
   - `moralis.ts`
   - `blockscout.ts`
   - `alchemy.ts`
   - `thirdweb.ts`
   - `revoke.ts`
   - `nansen.ts`
   - `metasleuth.ts`
   - `passport.ts`

2. **Add environment variables** for API keys:
   ```
   MORALIS_API_KEY=your_key
   BLOCKSCOUT_API_KEY=your_key
   ALCHEMY_API_KEY=your_key
   THIRDWEB_SECRET_KEY=your_key
   NANSEN_API_KEY=your_key
   METASLEUTH_LABEL_API_KEY=your_key
   METASLEUTH_RISK_API_KEY=your_key
   PASSPORT_API_KEY=your_key
   ```

3. **Update `/api/wallet/analyze` endpoint** with full implementation (see `web3base-cursor/src/server.ts` lines 288-449)

## Testing

After adding the endpoints, test them:

```bash
# Test ENS resolution
curl -X POST https://webwatcher.lever-labs.com/api/resolve-ens \
  -H "Content-Type: application/json" \
  -d '{"name": "vitalik.eth"}'

# Test wallet analysis
curl -X POST https://webwatcher.lever-labs.com/api/wallet/analyze \
  -H "Content-Type: application/json" \
  -d '{"address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"}'
```

## Dependencies

No new npm packages required for basic implementation. The ENS resolver uses native `fetch` API.

For full wallet analysis, you may need additional packages depending on your integration modules.

## CORS

Make sure your CORS middleware allows requests from:
- `https://web3-base-project.vercel.app`
- `*.vercel.app` (for all Vercel deployments)

## Deployment

After adding these endpoints:
1. Test locally
2. Deploy to your backend (Cloud Run, etc.)
3. Verify endpoints are accessible
4. Update Web3Base frontend `API_URL` to point to your backend

## References

- Full implementation: `https://github.com/edwardtay/web3base-cursor`
- ENS resolver: `src/utils/ens-resolver.ts`
- Wallet analysis: `src/server.ts` lines 288-449
- Integration modules: `src/integrations/`

