/**
 * FULL IMPLEMENTATION - Copy these endpoints to webwatcher backend
 * 
 * This file contains the complete implementation of both endpoints
 * with all integrations. Copy the relevant parts to your webwatcher repo.
 */

// ============================================================================
// 1. ENS RESOLVER UTILITY (src/utils/ens-resolver.ts)
// ============================================================================

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

// ============================================================================
// 2. ENDPOINTS TO ADD TO src/server.ts
// ============================================================================

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
 * Wallet Analysis endpoint - FULL IMPLEMENTATION
 * 
 * Requires integration modules from web3base-cursor/src/integrations/
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

    // Fetch data from multiple providers in parallel
    const [moralisData, blockscoutData, alchemyData, thirdwebData, revokeData, nansenData, metasleuthData, passportData] = await Promise.allSettled([
      // Moralis
      (async () => {
        try {
          const { analyzeWalletSecurity, getWalletTransactions } = await import('./integrations/moralis');
          const [analysis, transactions] = await Promise.all([
            analyzeWalletSecurity(address),
            getWalletTransactions(address, '0x1', 10),
          ]);
          return { analysis, transactions };
        } catch (e) {
          return { error: 'Moralis integration not available' };
        }
      })(),
      // Blockscout
      (async () => {
        try {
          const { getComprehensiveWalletData } = await import('./integrations/blockscout');
          return await getComprehensiveWalletData(address);
        } catch (e) {
          return { error: 'Blockscout integration not available' };
        }
      })(),
      // Alchemy
      (async () => {
        try {
          const { getComprehensiveWalletMetrics } = await import('./integrations/alchemy');
          return await getComprehensiveWalletMetrics(address);
        } catch (e) {
          return { error: 'Alchemy integration not available' };
        }
      })(),
      // Thirdweb
      (async () => {
        try {
          const { getWalletPortfolio } = await import('./integrations/thirdweb');
          return await getWalletPortfolio(address);
        } catch (e) {
          return { error: 'Thirdweb integration not available' };
        }
      })(),
      // Revoke.cash
      (async () => {
        try {
          const { getSecurityRecommendations, getApprovalSummary } = await import('./integrations/revoke');
          const [recommendations, summary] = await Promise.all([
            getSecurityRecommendations(address, 1),
            getApprovalSummary(address, 1),
          ]);
          return { recommendations, summary };
        } catch (e) {
          return { error: 'Revoke integration not available' };
        }
      })(),
      // Nansen
      (async () => {
        try {
          const { getWalletIntelligence } = await import('./integrations/nansen');
          return await getWalletIntelligence(address);
        } catch (e) {
          return { error: 'Nansen integration not available' };
        }
      })(),
      // MetaSleuth
      (async () => {
        try {
          const { getComprehensiveAnalysis } = await import('./integrations/metasleuth');
          return await getComprehensiveAnalysis(address, 'ethereum');
        } catch (e) {
          return { error: 'MetaSleuth integration not available' };
        }
      })(),
      // Passport
      (async () => {
        try {
          const { getPassportAnalysis } = await import('./integrations/passport');
          return await getPassportAnalysis(address);
        } catch (e) {
          return { error: 'Passport integration not available' };
        }
      })(),
    ]);

    const result: any = {
      success: true,
      address,
      timestamp: new Date().toISOString(),
    };

    // Merge results (handle both fulfilled and rejected promises)
    if (moralisData.status === 'fulfilled') {
      result.moralis = moralisData.value;
    } else {
      result.moralis = { error: 'Failed to fetch Moralis data' };
    }

    if (blockscoutData.status === 'fulfilled') {
      result.blockscout = blockscoutData.value;
    } else {
      result.blockscout = { error: 'Failed to fetch Blockscout data' };
    }

    if (alchemyData.status === 'fulfilled') {
      result.alchemy = alchemyData.value;
    } else {
      result.alchemy = { error: 'Failed to fetch Alchemy data' };
    }

    if (thirdwebData.status === 'fulfilled') {
      result.thirdweb = thirdwebData.value;
    } else {
      result.thirdweb = { error: 'Failed to fetch Thirdweb data' };
    }

    if (revokeData.status === 'fulfilled') {
      result.revoke = revokeData.value;
    } else {
      result.revoke = { error: 'Failed to fetch Revoke.cash data' };
    }

    if (nansenData.status === 'fulfilled') {
      result.nansen = nansenData.value;
    } else {
      result.nansen = { error: 'Failed to fetch Nansen data' };
    }

    if (metasleuthData.status === 'fulfilled') {
      result.metasleuth = metasleuthData.value;
    } else {
      result.metasleuth = { error: 'Failed to fetch MetaSleuth data' };
    }

    if (passportData.status === 'fulfilled') {
      result.passport = passportData.value;
    } else {
      result.passport = { error: 'Failed to fetch Passport data' };
    }

    res.status(200).json(result);
  } catch (error: any) {
    logger.error('Wallet analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze wallet',
      message: error.message 
    });
  }
});

