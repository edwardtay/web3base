// Vercel serverless function entry point
// This file exports the Express app for Vercel deployment

// Load environment variables first
import * as dotenv from "dotenv";
dotenv.config();

// Import the compiled Express app
import app from "../dist/server.js";

// Export the Express app as a serverless function
export default app;

