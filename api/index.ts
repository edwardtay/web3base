// Vercel serverless function entry point
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Load environment variables
import * as dotenv from "dotenv";
dotenv.config();

// Set environment for Vercel
process.env.NODE_ENV = 'production';
process.env.SERVE_FRONTEND = 'true';
process.env.VERCEL = '1';

// Import the Express app
let app: any;

async function getApp() {
  if (!app) {
    try {
      // Try to import the compiled server
      const serverModule = await import("../dist/server.js");
      app = serverModule.default || serverModule;
    } catch (error) {
      console.error('Failed to load server:', error);
      throw error;
    }
  }
  return app;
}

// Export handler for Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const expressApp = await getApp();
    return expressApp(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

