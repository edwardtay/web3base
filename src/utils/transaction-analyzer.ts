/**
 * Transaction Pre-Analysis
 * Analyzes transactions before they're signed to detect risks
 */

import axios from 'axios';

interface TransactionData {
  from: string;
  to: string;
  value?: string;
  data?: string;
  chainId?: number;
}

interface TransactionRisk {
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  riskScore: number;
  warnings: string[];
  recommendations: string[];
  explanation: string;
  shouldProceed: boolean;
}

/**
 * Analyze transaction before signing
 */
export async function analyzeTransaction(tx: TransactionData): Promise<TransactionRisk> {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let riskScore = 0;
  
  // Check if sending to known risky address
  const toAddress = tx.to?.toLowerCase();
  if (toAddress) {
    // Check against known scam addresses (simplified - would use real database)
    const knownScams = [
      '0x0000000000000000000000000000000000000000', // Burn address
    ];
    
    if (knownScams.includes(toAddress)) {
      warnings.push('⚠️ Sending to known burn/scam address');
      riskScore += 50;
    }
    
    // Check if contract
    if (tx.data && tx.data !== '0x') {
      warnings.push('📜 Interacting with smart contract');
      riskScore += 10;
      
      // Analyze function signature
      const functionSig = tx.data.slice(0, 10);
      const riskyFunctions = [
        '0xa9059cbb', // transfer
        '0x095ea7b3', // approve
        '0x23b872dd', // transferFrom
      ];
      
      if (riskyFunctions.includes(functionSig)) {
        warnings.push('🔐 Token approval or transfer detected');
        riskScore += 15;
        recommendations.push('Verify the contract address and amount carefully');
      }
    }
  }
  
  // Check transaction value
  if (tx.value) {
    const valueInEth = parseInt(tx.value, 16) / 1e18;
    if (valueInEth > 1) {
      warnings.push(`💰 Large transaction: ${valueInEth.toFixed(4)} ETH`);
      riskScore += 20;
      recommendations.push('Double-check the recipient address');
    }
  }
  
  // Determine risk level
  let riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  if (riskScore >= 70) riskLevel = 'CRITICAL';
  else if (riskScore >= 50) riskLevel = 'HIGH';
  else if (riskScore >= 25) riskLevel = 'MEDIUM';
  else riskLevel = 'LOW';
  
  // Generate explanation
  let explanation = '';
  if (riskLevel === 'CRITICAL') {
    explanation = '🚨 CRITICAL RISK: This transaction has multiple red flags. Do not proceed unless you are absolutely certain.';
  } else if (riskLevel === 'HIGH') {
    explanation = '⚠️ HIGH RISK: This transaction shows concerning patterns. Verify all details carefully before proceeding.';
  } else if (riskLevel === 'MEDIUM') {
    explanation = '⚡ MODERATE RISK: This transaction requires attention. Review the warnings and proceed with caution.';
  } else {
    explanation = '✅ LOW RISK: This transaction appears safe, but always verify the recipient address.';
  }
  
  return {
    riskLevel,
    riskScore,
    warnings,
    recommendations,
    explanation,
    shouldProceed: riskLevel !== 'CRITICAL'
  };
}

/**
 * Explain transaction in plain English
 */
export function explainTransaction(tx: TransactionData): string {
  const parts: string[] = [];
  
  // From/To
  const fromShort = tx.from.slice(0, 6) + '...' + tx.from.slice(-4);
  const toShort = tx.to ? tx.to.slice(0, 6) + '...' + tx.to.slice(-4) : 'Contract Creation';
  
  parts.push(`**From:** ${fromShort}`);
  parts.push(`**To:** ${toShort}`);
  
  // Value
  if (tx.value && tx.value !== '0x0') {
    const valueInEth = parseInt(tx.value, 16) / 1e18;
    parts.push(`**Amount:** ${valueInEth.toFixed(6)} ETH`);
  }
  
  // Data/Function
  if (tx.data && tx.data !== '0x') {
    const functionSig = tx.data.slice(0, 10);
    const functionNames: { [key: string]: string } = {
      '0xa9059cbb': 'Transfer tokens',
      '0x095ea7b3': 'Approve token spending',
      '0x23b872dd': 'Transfer tokens from another address',
      '0x': 'Simple ETH transfer'
    };
    
    const functionName = functionNames[functionSig] || 'Unknown contract interaction';
    parts.push(`**Action:** ${functionName}`);
  } else {
    parts.push(`**Action:** Simple ETH transfer`);
  }
  
  return parts.join('\n');
}

export default {
  analyzeTransaction,
  explainTransaction
};
