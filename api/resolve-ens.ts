import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel serverless function for ENS resolution
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'ENS name is required' });
    }

    const normalizedName = name.toLowerCase().trim();
    console.log(`[ENS] Resolving ${normalizedName}...`);

    // Method 1: Use Alchemy API
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
              params: [
                {
                  to: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
                  data: '0x0178b8bf' + normalizedName.split('.')[0].padEnd(64, '0'),
                },
                'latest'
              ],
              id: 1,
            }),
          }
        );

        if (response.ok) {
          const text = await response.text();
          const data = JSON.parse(text);
          if (data.result && data.result.startsWith('0x') && data.result.length === 42) {
            console.log(`[ENS] Resolved ${name} -> ${data.result}`);
            return res.status(200).json({
              success: true,
              name,
              address: data.result
            });
          }
        }
      } catch (error) {
        console.error('[ENS] Alchemy failed:', error);
      }
    }

    // Method 2: Use ENS.domains API
    try {
      const response = await fetch(`https://api.ensideas.com/ens/resolve/${normalizedName}`);
      if (response.ok) {
        const text = await response.text();
        const data = JSON.parse(text);
        if (data.address && data.address.startsWith('0x')) {
          console.log(`[ENS] Resolved ${name} -> ${data.address}`);
          return res.status(200).json({
            success: true,
            name,
            address: data.address
          });
        }
      }
    } catch (error) {
      console.error('[ENS] ENS API failed:', error);
    }

    // Method 3: Use Web3.bio
    try {
      const response = await fetch(`https://api.web3.bio/profile/ens/${normalizedName}`);
      if (response.ok) {
        const text = await response.text();
        const data = JSON.parse(text);
        const address = data.address || data.ethereum?.address;
        if (address && address.startsWith('0x')) {
          console.log(`[ENS] Resolved ${name} -> ${address}`);
          return res.status(200).json({
            success: true,
            name,
            address
          });
        }
      }
    } catch (error) {
      console.error('[ENS] Web3.bio failed:', error);
    }

    console.log(`[ENS] Could not resolve ${name}`);
    return res.status(404).json({
      success: false,
      error: 'Could not resolve ENS name'
    });

  } catch (error: any) {
    console.error('[ENS] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to resolve ENS name',
      message: error.message
    });
  }
}
