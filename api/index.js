"use strict";
// Vercel serverless function entry point
// This file exports the Express app for Vercel deployment
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("../src/server"));
// Export the Express app as a serverless function
exports.default = server_1.default;
//# sourceMappingURL=index.js.map