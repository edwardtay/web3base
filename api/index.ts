// Vercel serverless function entry point
// Load environment variables FIRST
require('dotenv').config();

// Set environment for Vercel
process.env.NODE_ENV = 'production';
process.env.SERVE_FRONTEND = 'true';
process.env.VERCEL = '1';

// Import and export the Express app
// Vercel will automatically handle the Express app
const app = require('../dist/server.js').default;

// Export for Vercel
module.exports = app;

