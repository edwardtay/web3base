/**
 * AI Security Analyzer
 * Generates natural language security summaries and proactive recommendations
 */

interface WalletAnalysisData {
  address: string;
  thirdweb?: any;
  alchemy?: any;
  blockscout?: any;
  moralis?: any;
  nansen?: any;
  metasleuth?: any;
  passport?: any;
  revoke?: any;
}

interface SecurityInsight {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  message: string;
  action?: string;
  actionUrl?: string;
}

interface SecuritySummary {
  overallRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  summary: string;
  insights: SecurityInsight[];
  recommendations: string[];
  positives: string[];
}

/**
 * Generate comprehensive AI security summary
 */
export function generateSecuritySummary(data: WalletAnalysisData): SecuritySummary {
  const insights: SecurityInsight[] = [];
  const recommendations: string[] = [];
  const positives: string[] = [];
  
  // Analyze MetaSleuth risk
  if (data.metasleuth && !data.metasleuth.error) {
    const risk = data.metasleuth;
    if (risk.riskLevel === 'CRITICAL' || risk.riskLevel === 'HIGH') {
      insights.push({
        severity: risk.riskLevel === 'CRITICAL' ? 'critical' : 'high',
        title: 'High Risk Activity Detected',
        message: `This wallet has a ${risk.riskLevel} risk score (${risk.riskScore}/100). ${risk.riskFactors.length > 0 ? 'Risk factors: ' + risk.riskFactors.join(', ') : ''}`,
        action: 'Review wallet activity carefully before interacting'
      });
      recommendations.push('🔴 Avoid interacting with this wallet until risks are understood');
    } else if (risk.riskLevel === 'MEDIUM') {
      insights.push({
        severity: 'medium',
        title: 'Moderate Risk Detected',
        message: `This wallet has some risk indicators (score: ${risk.riskScore}/100). Exercise caution when interacting.`,
      });
      recommendations.push('🟡 Proceed with caution and verify all transactions');
    } else {
      positives.push('✅ Low risk score - no major security concerns detected');
    }
  }
  
  // Analyze Gitcoin Passport
  if (data.passport && !data.passport.error) {
    const passport = data.passport;
    if (!passport.isHuman) {
      insights.push({
        severity: 'medium',
        title: 'Identity Not Verified',
        message: `This wallet has no Gitcoin Passport verification (score: ${passport.score}). This may limit access to certain protocols and airdrops.`,
        action: 'Set up Gitcoin Passport',
        actionUrl: 'https://passport.gitcoin.co/'
      });
      recommendations.push('🟡 Consider setting up Gitcoin Passport to improve reputation');
    } else if (passport.trustLevel === 'VERY_HIGH' || passport.trustLevel === 'HIGH') {
      positives.push(`✅ Strong identity verification (${passport.stampCount} stamps, ${passport.trustLevel} trust)`);
    } else if (passport.trustLevel === 'MEDIUM') {
      recommendations.push('🟢 Add more Passport stamps to increase trust level');
    }
  }
  
  // Analyze token approvals
  if (data.revoke && !data.revoke.error && data.revoke.summary) {
    const revoke = data.revoke.summary;
    if (revoke.hasRiskyApprovals) {
      insights.push({
        severity: 'high',
        title: 'Risky Token Approvals Found',
        message: `Found ${revoke.totalApprovals} token approvals, including ${revoke.unlimitedApprovals} unlimited approvals. These could drain your funds if contracts are compromised.`,
        action: 'Revoke unnecessary approvals',
        actionUrl: revoke.revokeUrl
      });
      recommendations.push('🔴 URGENT: Revoke risky token approvals immediately');
    } else if (revoke.totalApprovals > 0) {
      if (revoke.unlimitedApprovals > 0) {
        insights.push({
          severity: 'medium',
          title: 'Unlimited Approvals Detected',
          message: `You have ${revoke.unlimitedApprovals} unlimited token approvals. Consider revoking unused ones.`,
          action: 'Review approvals',
          actionUrl: revoke.revokeUrl
        });
        recommendations.push('🟡 Review and limit unlimited token approvals');
      }
      if (revoke.oldApprovals > 0) {
        recommendations.push(`🟢 Revoke ${revoke.oldApprovals} old approvals you no longer use`);
      }
    } else {
      positives.push('✅ No token approvals - excellent security hygiene');
    }
  }
  
  // Analyze wallet activity
  if (data.alchemy && !data.alchemy.error) {
    const activity = data.alchemy;
    if (activity.transactionCount === 0) {
      insights.push({
        severity: 'info',
        title: 'New or Inactive Wallet',
        message: 'This wallet has no transaction history. Be cautious if this is unexpected.',
      });
    } else if (activity.activityScore > 70) {
      positives.push(`✅ Active wallet with ${activity.transactionCount} transactions`);
    }
  }
  
  // Analyze portfolio
  if (data.thirdweb && !data.thirdweb.error) {
    const portfolio = data.thirdweb;
    const value = parseFloat(portfolio.totalValueUSD || '0');
    
    if (value > 10000) {
      recommendations.push('💡 High-value wallet - consider using a hardware wallet');
    }
    
    if (portfolio.diversityScore < 30 && portfolio.tokenCount > 0) {
      recommendations.push('💡 Low portfolio diversity - consider spreading risk across more assets');
    } else if (portfolio.diversityScore > 70) {
      positives.push('✅ Well-diversified portfolio');
    }
  }
  
  // Analyze Nansen intelligence
  if (data.nansen && !data.nansen.error) {
    const nansen = data.nansen;
    if (nansen.entity) {
      positives.push(`✅ Identified as: ${nansen.entity}`);
    }
    if (nansen.walletType && nansen.walletType !== 'Regular User') {
      insights.push({
        severity: 'info',
        title: 'Special Wallet Type',
        message: `This wallet is identified as: ${nansen.walletType}`,
      });
    }
  }
  
  // Determine overall risk
  const criticalCount = insights.filter(i => i.severity === 'critical').length;
  const highCount = insights.filter(i => i.severity === 'high').length;
  const mediumCount = insights.filter(i => i.severity === 'medium').length;
  
  let overallRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  if (criticalCount > 0) overallRisk = 'CRITICAL';
  else if (highCount > 0) overallRisk = 'HIGH';
  else if (mediumCount > 0) overallRisk = 'MEDIUM';
  else overallRisk = 'LOW';
  
  // Generate natural language summary
  const summary = generateNaturalLanguageSummary(data, overallRisk, insights, positives);
  
  return {
    overallRisk,
    summary,
    insights,
    recommendations,
    positives
  };
}

/**
 * Generate natural language summary
 */
function generateNaturalLanguageSummary(
  data: WalletAnalysisData,
  risk: string,
  insights: SecurityInsight[],
  positives: string[]
): string {
  const parts: string[] = [];
  
  // Opening statement based on risk
  if (risk === 'CRITICAL') {
    parts.push('⚠️ **CRITICAL SECURITY ISSUES DETECTED** - Immediate action required.');
  } else if (risk === 'HIGH') {
    parts.push('⚠️ **High-risk factors identified** - Please review carefully.');
  } else if (risk === 'MEDIUM') {
    parts.push('⚡ **Some security concerns found** - Recommended actions below.');
  } else {
    parts.push('✅ **Wallet appears secure** - Good security practices detected.');
  }
  
  // Activity summary
  const txCount = data.alchemy?.transactionCount || data.blockscout?.transactionCount || 0;
  const value = data.thirdweb?.totalValueUSD || '0.00';
  
  if (txCount > 0) {
    parts.push(`This wallet has ${txCount} transactions with a portfolio value of $${value}.`);
  } else {
    parts.push('This is a new or inactive wallet with no transaction history.');
  }
  
  // Key findings
  if (insights.length > 0) {
    const criticalInsights = insights.filter(i => i.severity === 'critical' || i.severity === 'high');
    if (criticalInsights.length > 0) {
      parts.push(`**Key concerns:** ${criticalInsights.map(i => i.title).join(', ')}.`);
    }
  }
  
  // Positive aspects
  if (positives.length > 0 && risk === 'LOW') {
    parts.push(`**Security strengths:** ${positives.slice(0, 2).join(', ')}.`);
  }
  
  return parts.join(' ');
}

/**
 * Generate proactive recommendations based on context
 */
export function generateProactiveRecommendations(data: WalletAnalysisData): string[] {
  const recommendations: string[] = [];
  
  // Check if user should take immediate action
  if (data.revoke?.summary?.hasRiskyApprovals) {
    recommendations.push('🚨 I noticed risky token approvals. Would you like me to guide you through revoking them?');
  }
  
  if (data.passport && !data.passport.isHuman) {
    recommendations.push('💡 Your Gitcoin Passport score is low. Setting up stamps can improve your reputation for airdrops and DAO access.');
  }
  
  if (data.metasleuth?.riskLevel === 'HIGH' || data.metasleuth?.riskLevel === 'CRITICAL') {
    recommendations.push('⚠️ This wallet has high-risk indicators. I recommend avoiding interactions until you understand the risks.');
  }
  
  const value = parseFloat(data.thirdweb?.totalValueUSD || '0');
  if (value > 5000 && data.revoke?.summary?.totalApprovals > 5) {
    recommendations.push('🔒 With $' + value.toFixed(0) + ' in assets, consider reviewing your ' + data.revoke.summary.totalApprovals + ' token approvals monthly.');
  }
  
  return recommendations;
}

export default {
  generateSecuritySummary,
  generateProactiveRecommendations
};
