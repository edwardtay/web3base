import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel serverless function for wallet analysis
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address } = req.body;

    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address format' });
    }

    console.log(`[Wallet] Analyzing ${address}...`);

    // For now, return a simple response
    // In production, you would call your actual wallet analysis logic
    return res.status(200).json({
      success: true,
      address,
      message: 'Wallet analysis endpoint - full implementation requires backend services',
      timestamp: new Date().toISOString(),
      note: 'This is a simplified response. Full wallet analysis requires Moralis, Blockscout, Alchemy, etc. APIs which need to be called from a backend server with proper API keys.'
    });

  } catch (error: any) {
    console.error('[Wallet] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to analyze wallet',
      message: error.message
    });
  }
}
