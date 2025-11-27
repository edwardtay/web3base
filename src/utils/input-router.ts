/**
 * Intelligent Input Router
 * Detects input type and routes to appropriate handler
 */

import { logger } from "./logger";

export type InputType = 
  | "url" 
  | "wallet_address" 
  | "ens_domain"
  | "transaction_hash"
  | "cve_query"
  | "generic_search";

export interface RoutingDecision {
  type: InputType;
  confidence: number;
  enhancedMessage: string;
  suggestedAction: string;
}

/**
 * Detect input type and route intelligently
 */
export function detectInputType(input: string): RoutingDecision {
  const trimmed = input.trim().toLowerCase();
  
  // ENS Domain Detection (.eth) - Check BEFORE URL to avoid false positives
  const ensPattern = /^[a-zA-Z0-9-]+\.eth$/i;
  if (ensPattern.test(trimmed)) {
    logger.info(`[Router] Detected ENS domain: ${input}`);
    return {
      type: "ens_domain",
      confidence: 0.98,
      enhancedMessage: `Resolve ENS domain ${input} to wallet address and perform comprehensive security audit. Coordinate all security layers: Circle (USDC balance), ZetaChain (cross-chain activity), Seedify (project interactions), Somnia (on-chain behavior), and NodeOps (validator status if applicable).`,
      suggestedAction: "ens_wallet_audit"
    };
  }
  
  // Ethereum Address Detection (0x + 40 hex chars)
  const ethAddressPattern = /^0x[a-fA-F0-9]{40}$/;
  if (ethAddressPattern.test(trimmed)) {
    logger.info(`[Router] Detected Ethereum address: ${input}`);
    return {
      type: "wallet_address",
      confidence: 0.98,
      enhancedMessage: `Perform a comprehensive security audit on wallet ${input}. Coordinate all security layers: Circle (USDC balance), ZetaChain (cross-chain activity), Seedify (project interactions), Somnia (on-chain behavior), and NodeOps (validator status if applicable).`,
      suggestedAction: "comprehensive_wallet_audit"
    };
  }
  
  // URL Detection (after ENS check to avoid .eth domains being treated as URLs)
  // Only treat as URL if it's a simple domain/URL without search keywords
  const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/;
  const urlMatch = input.match(urlPattern);
  
  // Check if this looks like a search query rather than a URL
  const searchKeywords = ['search', 'find', 'look', 'show', 'get', 'what', 'how', 'why', 'when', 'where', 'for', 'in', 'about'];
  const hasSearchKeywords = searchKeywords.some(keyword => trimmed.includes(keyword));
  const hasMultipleWords = trimmed.split(/\s+/).length > 2;
  
  // Only treat as URL if:
  // 1. Matches URL pattern
  // 2. Doesn't have search keywords
  // 3. Is short (likely just a domain)
  // 4. Not an .eth domain
  if (urlMatch && !hasSearchKeywords && !hasMultipleWords && !trimmed.endsWith('.eth')) {
    logger.info(`[Router] Detected URL: ${input}`);
    return {
      type: "url",
      confidence: 0.95,
      enhancedMessage: `Use the scan_website action to scan ${input} for phishing and security risks. This must use A2A coordination with UrlFeatureAgent, UrlScanAgent (urlscan.io API), and PhishingRedFlagAgent.`,
      suggestedAction: "scan_website"
    };
  }
  
  // If it has http:// or https://, it's definitely a URL
  if ((trimmed.startsWith('http://') || trimmed.startsWith('https://')) && !trimmed.endsWith('.eth')) {
    logger.info(`[Router] Detected URL with protocol: ${input}`);
    return {
      type: "url",
      confidence: 0.98,
      enhancedMessage: `Use the scan_website action to scan ${input} for phishing and security risks. This must use A2A coordination with UrlFeatureAgent, UrlScanAgent (urlscan.io API), and PhishingRedFlagAgent.`,
      suggestedAction: "scan_website"
    };
  }
  
  // Transaction Hash Detection (0x + 64 hex chars)
  const txHashPattern = /^0x[a-fA-F0-9]{64}$/;
  if (txHashPattern.test(trimmed)) {
    logger.info(`[Router] Detected transaction hash: ${input}`);
    return {
      type: "transaction_hash",
      confidence: 0.98,
      enhancedMessage: `Analyze transaction ${input} for security risks. Use analyze_transaction action and coordinate with Circle (USDC verification), ZetaChain (cross-chain check), and Somnia (on-chain analysis).`,
      suggestedAction: "analyze_transaction"
    };
  }
  
  // CVE Query Detection
  const cvePattern = /\b(cve|vulnerability|exploit|patch|security advisory)\b/i;
  const cveIdPattern = /CVE-\d{4}-\d+/i;
  if (cvePattern.test(input) || cveIdPattern.test(input)) {
    logger.info(`[Router] Detected CVE query: ${input}`);
    return {
      type: "cve_query",
      confidence: 0.90,
      enhancedMessage: `Search for CVE and vulnerability information: ${input}. Use search_cve action which uses Exa MCP for latest threat intelligence.`,
      suggestedAction: "search_cve"
    };
  }
  
  // Generic Search (default)
  logger.info(`[Router] Detected generic search: ${input}`);
  return {
    type: "generic_search",
    confidence: 0.70,
    enhancedMessage: `Search for information about: ${input}. Use exa_search action for high-quality semantic search results.`,
    suggestedAction: "exa_search"
  };
}

/**
 * Get user-friendly description of what will happen
 */
export function getRoutingDescription(decision: RoutingDecision): string {
  switch (decision.type) {
    case "url":
      return "🔍 **Phishing Scan**: Analyzing URL for security threats using A2A coordination...";
    
    case "wallet_address":
      return "🛡️ **Comprehensive Wallet Audit**: Checking all security layers (Circle, ZetaChain, Seedify, Somnia, NodeOps)...";
    
    case "ens_domain":
      return "🌐 **ENS Security Audit**: Resolving domain and analyzing wallet security...";
    
    case "transaction_hash":
      return "🔎 **Transaction Analysis**: Examining transaction for suspicious patterns...";
    
    case "cve_query":
      return "🔐 **Vulnerability Search**: Searching latest CVE database via Exa MCP...";
    
    case "generic_search":
      return "🔍 **Semantic Search**: Searching for relevant information via Exa MCP...";
    
    default:
      return "🤖 **Processing**: Analyzing your request...";
  }
}

/**
 * Format response based on input type
 */
export function formatResponseForType(type: InputType, response: string): string {
  // Add type-specific formatting or context
  switch (type) {
    case "url":
      return `## 🔍 Website Security Scan\n\n${response}`;
    
    case "wallet_address":
      return `## 🛡️ Wallet Security Audit\n\n${response}`;
    
    case "ens_domain":
      return `## 🌐 ENS Domain Security\n\n${response}`;
    
    case "transaction_hash":
      return `## 🔎 Transaction Security Analysis\n\n${response}`;
    
    case "cve_query":
      return `## 🔐 Vulnerability Intelligence\n\n${response}`;
    
    default:
      return response;
  }
}
