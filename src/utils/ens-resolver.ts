/**
 * ENS (Ethereum Name Service) Resolver
 * Resolves .eth domains to wallet addresses using public APIs
 */

import { logger } from "./logger";

/**
 * Resolve ENS domain to Ethereum address
 * Uses Etherscan API or public ENS resolver
 */
export async function resolveENS(ensDomain: string): Promise<string | null> {
  try {
    logger.info(`[ENS] Resolving ${ensDomain}...`);
    
    // Method 1: Try Etherscan API (if API key available)
    const etherscanKey = process.env.ETHERSCAN_API_KEY;
    if (etherscanKey) {
      try {
        const response = await fetch(
          `https://api.etherscan.io/api?module=contract&action=getabi&address=${ensDomain}&apikey=${etherscanKey}`
        );
        const data = await response.json() as any;
        if (data.result && data.result.startsWith('0x')) {
          logger.info(`[ENS] Resolved ${ensDomain} -> ${data.result} (via Etherscan)`);
          return data.result;
        }
      } catch (error) {
        logger.debug(`[ENS] Etherscan resolution failed, trying alternative...`);
      }
    }
    
    // Method 2: Use ENS.domains API (public, no key needed)
    try {
      const response = await fetch(`https://api.ensideas.com/ens/resolve/${ensDomain}`);
      if (response.ok) {
        const data = await response.json() as { address?: string };
        if (data.address && data.address.startsWith('0x')) {
          logger.info(`[ENS] Resolved ${ensDomain} -> ${data.address} (via ENS API)`);
          return data.address;
        }
      }
    } catch (error) {
      logger.debug(`[ENS] ENS API resolution failed, trying RPC...`);
    }
    
    // Method 3: Direct RPC call (simplified)
    try {
      const rpcUrl = process.env.ETHEREUM_RPC_URL || "https://eth.llamarpc.com";
      
      // Use a simple approach: just try to resolve via public resolver
      // This is a simplified version - in production use ethers.js or viem
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_call",
          params: [
            {
              to: "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41", // ENS Public Resolver
              data: `0x3b3b57de${Buffer.from(ensDomain).toString('hex').padStart(64, '0')}`,
            },
            "latest"
          ],
          id: 1,
        }),
      });

      if (response.ok) {
        const data = await response.json() as { result?: string };
        if (data.result && data.result !== "0x" && data.result.length >= 42) {
          const address = "0x" + data.result.slice(-40);
          if (address !== "0x0000000000000000000000000000000000000000") {
            logger.info(`[ENS] Resolved ${ensDomain} -> ${address} (via RPC)`);
            return address;
          }
        }
      }
    } catch (error) {
      logger.debug(`[ENS] RPC resolution failed`);
    }
    
    logger.warn(`[ENS] Could not resolve ${ensDomain}`);
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
