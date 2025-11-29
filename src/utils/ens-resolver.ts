/**
 * ENS (Ethereum Name Service) Resolver
 * Resolves .eth domains to wallet addresses using public APIs
 */

import { logger } from "./logger";

/**
 * Resolve ENS domain to Ethereum address
 * Uses multiple public APIs for reliability
 */
export async function resolveENS(ensDomain: string): Promise<string | null> {
  try {
    logger.info(`[ENS] Resolving ${ensDomain}...`);
    
    // Normalize ENS name
    const normalizedName = ensDomain.toLowerCase().trim();
    
    // Method 1: Use Cloudflare's ENS gateway (most reliable, no API key needed)
    try {
      const response = await fetch(`https://cloudflare-eth.com/v1/mainnet/ens/resolve/${normalizedName}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json() as { address?: string };
        if (data.address && data.address.startsWith('0x') && data.address.length === 42) {
          logger.info(`[ENS] Resolved ${ensDomain} -> ${data.address} (via Cloudflare)`);
          return data.address;
        }
      }
    } catch (error) {
      logger.debug(`[ENS] Cloudflare resolution failed:`, error);
    }
    
    // Method 2: Use ENS.domains API (public, no key needed)
    try {
      const response = await fetch(`https://api.ensideas.com/ens/resolve/${normalizedName}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json() as { address?: string };
        if (data.address && data.address.startsWith('0x') && data.address.length === 42) {
          logger.info(`[ENS] Resolved ${ensDomain} -> ${data.address} (via ENS API)`);
          return data.address;
        }
      }
    } catch (error) {
      logger.debug(`[ENS] ENS API resolution failed:`, error);
    }
    
    // Method 3: Use Etherscan API (if API key available)
    const etherscanKey = process.env.ETHERSCAN_API_KEY;
    if (etherscanKey) {
      try {
        const response = await fetch(
          `https://api.etherscan.io/api?module=account&action=txlist&address=${normalizedName}&apikey=${etherscanKey}`,
          {
            headers: {
              'Accept': 'application/json',
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json() as any;
          if (data.result && typeof data.result === 'string' && data.result.startsWith('0x')) {
            logger.info(`[ENS] Resolved ${ensDomain} -> ${data.result} (via Etherscan)`);
            return data.result;
          }
        }
      } catch (error) {
        logger.debug(`[ENS] Etherscan resolution failed:`, error);
      }
    }
    
    // Method 4: Use Alchemy's ENS resolution (if API key available)
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
              method: 'alchemy_resolveEns',
              params: [normalizedName],
              id: 1,
            }),
          }
        );
        
        if (response.ok) {
          const data = await response.json() as { result?: string };
          if (data.result && data.result.startsWith('0x') && data.result.length === 42) {
            logger.info(`[ENS] Resolved ${ensDomain} -> ${data.result} (via Alchemy)`);
            return data.result;
          }
        }
      } catch (error) {
        logger.debug(`[ENS] Alchemy resolution failed:`, error);
      }
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
