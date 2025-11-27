import { simulateTransaction } from '../integrations/tenderly';
import { analyzeTransaction } from './transaction-analyzer';
import { checkWalletThreats, getThreatSummary } from './threat-intelligence';
import { detectAnomaly, learnFromTransactions } from './pattern-learner';

export interface ThreatPreventionResult {
  allowed: boolean;
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  threats: ThreatDetection[];
  recommendations: string[];
  simulationResult?: any;
  blockedReasons?: string[];
}

export interface ThreatDetection {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  confidence: number;
  source: string;
}

export interface TransactionRequest {
  from: string;
  to: string;
  value?: string;
  data?: string;
  chainId?: number;
}

/**
 * Comprehensive threat prevention system
 * Analyzes transactions before execution using multiple security layers
 */
export async function preventThreats(
  transaction: TransactionRequest,
  walletAddress: string
): Promise<ThreatPreventionResult> {
  const threats: ThreatDetection[] = [];
  const recommendations: string[] = [];
  let riskScore = 0;
  let simulationResult;

  try {
    // Layer 1: Simulate transaction to detect potential issues
    console.log('🔍 Layer 1: Simulating transaction...');
    simulationResult = await simulateTransaction({
      from: transaction.from,
      to: transaction.to,
      value: transaction.value || '0',
      data: transaction.data || '0x',
      chainId: transaction.chainId || 1
    });

    if (!simulationResult.success) {
      threats.push({
        type: 'simulation_failure',
        severity: 'high',
        description: `Transaction will fail: ${simulationResult.error || 'Unknown error'}`,
        confidence: 0.95,
        source: 'tenderly'
      });
      riskScore += 40;
      recommendations.push('❌ Do not proceed - transaction will fail');
    }

    // Check for suspicious state changes
    if (simulationResult.balanceChanges && simulationResult.balanceChanges.length > 0) {
      const suspiciousChanges = detectSuspiciousStateChanges(simulationResult.balanceChanges);
      threats.push(...suspiciousChanges);
      riskScore += suspiciousChanges.length * 15;
    }

    // Layer 2: Check threat intelligence feeds
    console.log('🔍 Layer 2: Checking threat intelligence...');
    const knownThreats = await checkWalletThreats(transaction.to, [], []);
    
    if (knownThreats.length > 0) {
      for (const threat of knownThreats) {
        threats.push({
          type: 'known_threat',
          severity: threat.severity.toLowerCase() as any,
          description: threat.description,
          confidence: 0.9,
          source: 'threat_intelligence'
        });
        riskScore += threat.severity === 'CRITICAL' ? 50 : threat.severity === 'HIGH' ? 35 : 20;
      }
      recommendations.push('⚠️ Address flagged in threat intelligence database');
    }

    // Layer 3: Analyze transaction patterns
    console.log('🔍 Layer 3: Analyzing transaction patterns...');
    const riskAnalysis = await analyzeTransaction(transaction);
    
    if (riskAnalysis.riskScore > 70) {
      threats.push({
        type: 'high_risk_transaction',
        severity: 'high',
        description: riskAnalysis.explanation,
        confidence: 0.85,
        source: 'transaction_analyzer'
      });
      riskScore += 30;
    }

    recommendations.push(...riskAnalysis.recommendations);

    // Layer 4: Check for behavioral anomalies
    console.log('🔍 Layer 4: Checking behavioral patterns...');
    const anomalies = detectAnomaly(walletAddress, transaction);
    
    if (anomalies.isAnomaly) {
      threats.push({
        type: 'behavioral_anomaly',
        severity: anomalies.confidence > 0.7 ? 'high' : 'medium',
        description: anomalies.explanation,
        confidence: anomalies.confidence,
        source: 'pattern_learner'
      });
      riskScore += anomalies.confidence > 0.7 ? 25 : 15;
      recommendations.push('⚠️ Transaction pattern differs from your normal behavior');
    }

    // Layer 5: Check for common attack patterns
    console.log('🔍 Layer 5: Checking attack patterns...');
    const attackPatterns = detectAttackPatterns(transaction, simulationResult);
    threats.push(...attackPatterns);
    riskScore += attackPatterns.length * 20;

    // Layer 6: Validate contract interactions
    if (transaction.data && transaction.data !== '0x') {
      console.log('🔍 Layer 6: Validating contract interaction...');
      const contractThreats = await validateContractInteraction(transaction);
      threats.push(...contractThreats);
      riskScore += contractThreats.length * 15;
    }

    // Calculate final risk level
    const riskLevel = calculateRiskLevel(riskScore);
    const allowed = shouldAllowTransaction(riskLevel, threats);

    // Generate final recommendations
    if (!allowed) {
      const blockedReasons = threats
        .filter(t => t.severity === 'critical' || t.severity === 'high')
        .map(t => t.description);
      
      return {
        allowed: false,
        riskLevel,
        riskScore,
        threats,
        recommendations: [
          '🛑 TRANSACTION BLOCKED FOR YOUR SAFETY',
          ...blockedReasons,
          ...recommendations
        ],
        simulationResult,
        blockedReasons
      };
    }

    // Add safety recommendations for allowed transactions
    if (riskLevel === 'medium' || riskLevel === 'high') {
      recommendations.unshift('⚠️ Proceed with caution - review all details carefully');
    } else if (riskLevel === 'low') {
      recommendations.unshift('✅ Transaction appears safe, but always verify details');
    } else {
      recommendations.unshift('✅ No significant threats detected');
    }

    return {
      allowed: true,
      riskLevel,
      riskScore,
      threats,
      recommendations,
      simulationResult
    };

  } catch (error) {
    console.error('Error in threat prevention:', error);
    
    // Fail-safe: block transaction if analysis fails
    return {
      allowed: false,
      riskLevel: 'critical',
      riskScore: 100,
      threats: [{
        type: 'analysis_error',
        severity: 'critical',
        description: 'Unable to complete security analysis',
        confidence: 1.0,
        source: 'system'
      }],
      recommendations: [
        '🛑 TRANSACTION BLOCKED',
        'Security analysis failed - do not proceed',
        'Try again or contact support'
      ],
      blockedReasons: ['Security analysis system error']
    };
  }
}

/**
 * Detect suspicious state changes from simulation
 */
function detectSuspiciousStateChanges(stateChanges: any[]): ThreatDetection[] {
  const threats: ThreatDetection[] = [];

  for (const change of stateChanges) {
    // Check for token approvals
    if (change.type === 'approval' && change.value === 'unlimited') {
      threats.push({
        type: 'unlimited_approval',
        severity: 'high',
        description: 'Transaction requests unlimited token approval',
        confidence: 0.95,
        source: 'simulation'
      });
    }

    // Check for ownership transfers
    if (change.type === 'ownership_transfer') {
      threats.push({
        type: 'ownership_change',
        severity: 'critical',
        description: 'Transaction will transfer ownership of assets',
        confidence: 0.98,
        source: 'simulation'
      });
    }

    // Check for large value transfers
    if (change.type === 'balance_change' && parseFloat(change.value) > 1000) {
      threats.push({
        type: 'large_transfer',
        severity: 'medium',
        description: `Large value transfer detected: ${change.value}`,
        confidence: 0.9,
        source: 'simulation'
      });
    }
  }

  return threats;
}

/**
 * Detect common attack patterns
 */
function detectAttackPatterns(
  transaction: TransactionRequest,
  simulationResult: any
): ThreatDetection[] {
  const threats: ThreatDetection[] = [];

  // Check for phishing patterns
  if (transaction.data && transaction.data.includes('transferFrom')) {
    threats.push({
      type: 'potential_phishing',
      severity: 'high',
      description: 'Transaction may be attempting to transfer your tokens',
      confidence: 0.75,
      source: 'pattern_detection'
    });
  }

  // Check for reentrancy patterns
  if (simulationResult?.calls && simulationResult.calls.length > 10) {
    threats.push({
      type: 'potential_reentrancy',
      severity: 'medium',
      description: 'Multiple nested calls detected - possible reentrancy',
      confidence: 0.65,
      source: 'pattern_detection'
    });
  }

  // Check for front-running vulnerability
  if (transaction.value && parseFloat(transaction.value) > 0.1) {
    threats.push({
      type: 'frontrun_risk',
      severity: 'low',
      description: 'High-value transaction may be vulnerable to front-running',
      confidence: 0.5,
      source: 'pattern_detection'
    });
  }

  return threats;
}

/**
 * Validate contract interaction safety
 */
async function validateContractInteraction(
  transaction: TransactionRequest
): Promise<ThreatDetection[]> {
  const threats: ThreatDetection[] = [];

  // Check for unverified contracts
  // This would integrate with block explorers to check verification status
  
  // Check for suspicious function signatures
  const functionSig = transaction.data?.slice(0, 10);
  const suspiciousFunctions = [
    '0xa9059cbb', // transfer
    '0x23b872dd', // transferFrom
    '0x095ea7b3', // approve
  ];

  if (functionSig && suspiciousFunctions.includes(functionSig)) {
    threats.push({
      type: 'sensitive_function',
      severity: 'medium',
      description: 'Transaction calls sensitive token function',
      confidence: 0.8,
      source: 'contract_validation'
    });
  }

  return threats;
}

/**
 * Calculate risk level from score
 */
function calculateRiskLevel(score: number): 'safe' | 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  if (score >= 20) return 'low';
  return 'safe';
}

/**
 * Determine if transaction should be allowed
 */
function shouldAllowTransaction(
  riskLevel: string,
  threats: ThreatDetection[]
): boolean {
  // Block critical risk transactions
  if (riskLevel === 'critical') return false;

  // Block if any critical threats detected
  const hasCriticalThreat = threats.some(t => t.severity === 'critical');
  if (hasCriticalThreat) return false;

  // Block if multiple high severity threats
  const highThreats = threats.filter(t => t.severity === 'high');
  if (highThreats.length >= 2) return false;

  // Allow with warnings for other cases
  return true;
}

/**
 * Monitor wallet for real-time threats
 */
export async function monitorWalletThreats(
  walletAddress: string,
  callback: (threat: ThreatDetection) => void
): Promise<void> {
  // This would set up real-time monitoring
  console.log(`🛡️ Starting threat monitoring for ${walletAddress}`);
  
  // Monitor pending transactions
  // Monitor token approvals
  // Monitor suspicious contract interactions
  // Alert on threat intelligence updates
}
