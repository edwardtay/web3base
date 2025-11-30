/**
 * Quest Verification System
 * Verifies user interaction with partner protocols and awards passes
 */

import { logger } from "./logger";

export interface QuestResult {
  protocol: string;
  completed: boolean;
  proof?: string;
  timestamp?: number;
  details?: string;
}

export interface QuestPass {
  address: string;
  quests: QuestResult[];
  totalCompleted: number;
  passAwarded: boolean;
}

/**
 * Verify Circle USDC holdings on any chain
 */
export async function verifyCircleQuest(address: string): Promise<QuestResult> {
  try {
    // Check USDC balance using Alchemy (supports multiple chains)
    const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
    if (!ALCHEMY_API_KEY) {
      throw new Error("ALCHEMY_API_KEY not configured");
    }

    // Check multiple chains for USDC
    const chains = [
      { name: "Ethereum", url: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` },
      { name: "Polygon", url: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` },
      { name: "Base", url: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` },
    ];

    // USDC contract addresses
    const USDC_CONTRACTS: Record<string, string> = {
      Ethereum: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      Polygon: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      Base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    };

    for (const chain of chains) {
      const response = await fetch(chain.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "alchemy_getTokenBalances",
          params: [address, [USDC_CONTRACTS[chain.name]]],
          id: 1,
        }),
      });

      if (response.ok) {
        const data = await response.json() as any;
        const balances = data.result?.tokenBalances || [];
        
        for (const balance of balances) {
          if (balance.tokenBalance && balance.tokenBalance !== "0x0") {
            const balanceNum = parseInt(balance.tokenBalance, 16);
            if (balanceNum > 0) {
              return {
                protocol: "Circle",
                completed: true,
                proof: `Holds USDC on ${chain.name}`,
                timestamp: Date.now(),
                details: `Balance: ${(balanceNum / 1e6).toFixed(2)} USDC`,
              };
            }
          }
        }
      }
    }

    return {
      protocol: "Circle",
      completed: false,
      details: "No USDC holdings found on any chain",
    };
  } catch (error) {
    logger.error("Circle quest verification error:", error);
    return {
      protocol: "Circle",
      completed: false,
      details: "Verification failed",
    };
  }
}

/**
 * Verify ZetaChain transactions (mainnet or testnet)
 */
export async function verifyZetaChainQuest(address: string): Promise<QuestResult> {
  try {
    // Check both mainnet and testnet
    const networks = [
      { name: "Mainnet", rpc: "https://zetachain-evm.blockpi.network/v1/rpc/public" },
      { name: "Testnet", rpc: "https://zetachain-athens-evm.blockpi.network/v1/rpc/public" },
    ];

    for (const network of networks) {
      const response = await fetch(network.rpc, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getTransactionCount",
          params: [address, "latest"],
          id: 1,
        }),
      });

      if (response.ok) {
        const data = await response.json() as any;
        const txCount = parseInt(data.result, 16);
        
        if (txCount > 0) {
          return {
            protocol: "ZetaChain",
            completed: true,
            proof: `${txCount} transactions on ${network.name}`,
            timestamp: Date.now(),
            details: `Active on ZetaChain ${network.name}`,
          };
        }
      }
    }

    return {
      protocol: "ZetaChain",
      completed: false,
      details: "No transactions found on ZetaChain",
    };
  } catch (error) {
    logger.error("ZetaChain quest verification error:", error);
    return {
      protocol: "ZetaChain",
      completed: false,
      details: "Verification failed",
    };
  }
}

/**
 * Verify Somnia transactions (mainnet or testnet)
 */
export async function verifySomniaQuest(address: string): Promise<QuestResult> {
  try {
    // Somnia RPC endpoints
    const networks = [
      { name: "Mainnet", rpc: "https://rpc.somnia.network" },
      { name: "Testnet", rpc: "https://testnet-rpc.somnia.network" },
    ];

    for (const network of networks) {
      try {
        const response = await fetch(network.rpc, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_getTransactionCount",
            params: [address, "latest"],
            id: 1,
          }),
        });

        if (response.ok) {
          const data = await response.json() as any;
          const txCount = parseInt(data.result, 16);
          
          if (txCount > 0) {
            return {
              protocol: "Somnia",
              completed: true,
              proof: `${txCount} transactions on ${network.name}`,
              timestamp: Date.now(),
              details: `Active on Somnia ${network.name}`,
            };
          }
        }
      } catch (err) {
        // Try next network
        continue;
      }
    }

    return {
      protocol: "Somnia",
      completed: false,
      details: "No transactions found on Somnia",
    };
  } catch (error) {
    logger.error("Somnia quest verification error:", error);
    return {
      protocol: "Somnia",
      completed: false,
      details: "Verification failed",
    };
  }
}

/**
 * Verify Seedify user (via API if available)
 */
export async function verifySeedifyQuest(address: string): Promise<QuestResult> {
  try {
    // Check if user has interacted with Seedify contracts
    // Seedify token contract on BSC: 0x477bC8d23c634C154061869478bce96BE6045D12
    const BSC_RPC = "https://bsc-dataseed.binance.org/";
    const SEEDIFY_TOKEN = "0x477bC8d23c634C154061869478bce96BE6045D12";

    const response = await fetch(BSC_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_call",
        params: [
          {
            to: SEEDIFY_TOKEN,
            data: `0x70a08231000000000000000000000000${address.slice(2)}`, // balanceOf
          },
          "latest",
        ],
        id: 1,
      }),
    });

    if (response.ok) {
      const data = await response.json() as any;
      const balance = parseInt(data.result, 16);
      
      if (balance > 0) {
        return {
          protocol: "Seedify",
          completed: true,
          proof: "Holds SFUND tokens",
          timestamp: Date.now(),
          details: `Balance: ${(balance / 1e18).toFixed(2)} SFUND`,
        };
      }
    }

    return {
      protocol: "Seedify",
      completed: false,
      details: "No SFUND tokens found",
    };
  } catch (error) {
    logger.error("Seedify quest verification error:", error);
    return {
      protocol: "Seedify",
      completed: false,
      details: "Verification failed",
    };
  }
}

/**
 * Verify NodeOps user (check if running a node or staking)
 */
export async function verifyNodeOpsQuest(address: string): Promise<QuestResult> {
  try {
    // Check if address is a validator or has staked
    // This would require NodeOps API access or checking staking contracts
    // For now, we'll check if they have any validator-related activity
    
    // Placeholder: Check Ethereum validator deposits
    const BEACON_DEPOSIT_CONTRACT = "0x00000000219ab540356cBB839Cbe05303d7705Fa";
    const ETH_RPC = `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;

    const response = await fetch(ETH_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getLogs",
        params: [
          {
            fromBlock: "0x0",
            toBlock: "latest",
            address: BEACON_DEPOSIT_CONTRACT,
            topics: [
              "0x649bbc62d0e31342afea4e5cd82d4049e7e1ee912fc0889aa790803be39038c5", // DepositEvent
              null,
              null,
              `0x000000000000000000000000${address.slice(2)}`,
            ],
          },
        ],
        id: 1,
      }),
    });

    if (response.ok) {
      const data = await response.json() as any;
      if (data.result && data.result.length > 0) {
        return {
          protocol: "NodeOps",
          completed: true,
          proof: "Ethereum validator detected",
          timestamp: Date.now(),
          details: `${data.result.length} validator deposit(s)`,
        };
      }
    }

    return {
      protocol: "NodeOps",
      completed: false,
      details: "No validator activity found",
    };
  } catch (error) {
    logger.error("NodeOps quest verification error:", error);
    return {
      protocol: "NodeOps",
      completed: false,
      details: "Verification failed",
    };
  }
}

/**
 * Verify all quests for an address
 */
export async function verifyAllQuests(address: string): Promise<QuestPass> {
  logger.info(`Verifying quests for address: ${address}`);

  const quests = await Promise.all([
    verifyCircleQuest(address),
    verifyZetaChainQuest(address),
    verifySomniaQuest(address),
    verifySeedifyQuest(address),
    verifyNodeOpsQuest(address),
  ]);

  const totalCompleted = quests.filter((q) => q.completed).length;
  const passAwarded = totalCompleted >= 3; // Need at least 3 quests completed

  return {
    address,
    quests,
    totalCompleted,
    passAwarded,
  };
}
