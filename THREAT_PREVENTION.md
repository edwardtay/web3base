# 🛡️ Threat Prevention System

## Overview

The Threat Prevention System is a comprehensive, multi-layer security solution that analyzes blockchain transactions **before** they are executed. It combines transaction simulation, threat intelligence, behavioral analysis, and attack pattern detection to protect users from malicious transactions.

## Key Features

### 🔍 Multi-Layer Security Analysis

1. **Transaction Simulation (Tenderly)**
   - Simulates transaction execution before signing
   - Detects failures, state changes, and suspicious behavior
   - Identifies unlimited approvals and ownership transfers

2. **Threat Intelligence**
   - Real-time threat database lookups
   - Known malicious address detection
   - Community-reported scams and phishing attempts

3. **Transaction Risk Analysis**
   - AI-powered risk scoring
   - Pattern recognition for common attacks
   - Value and frequency analysis

4. **Behavioral Pattern Learning**
   - Learns normal wallet behavior
   - Detects anomalous transactions
   - Flags unusual patterns

5. **Attack Pattern Detection**
   - Phishing detection
   - Reentrancy attack identification
   - Front-running vulnerability assessment

6. **Contract Validation**
   - Sensitive function call detection
   - Unverified contract warnings
   - Function signature analysis

## Risk Levels

- **Safe** (0-19): No significant threats detected
- **Low** (20-39): Minor concerns, proceed with awareness
- **Medium** (40-59): Notable risks, review carefully
- **High** (60-79): Significant threats, high caution advised
- **Critical** (80-100): Severe threats, transaction blocked

## API Endpoint

### POST `/api/transaction/prevent-threats`

Analyzes a transaction for security threats before execution.

**Request Body:**
```json
{
  "transaction": {
    "from": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "to": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "value": "0.1",
    "data": "0x",
    "chainId": 1
  },
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Response:**
```json
{
  "success": true,
  "allowed": true,
  "riskLevel": "low",
  "riskScore": 25,
  "threats": [
    {
      "type": "frontrun_risk",
      "severity": "low",
      "description": "High-value transaction may be vulnerable to front-running",
      "confidence": 0.5,
      "source": "pattern_detection"
    }
  ],
  "recommendations": [
    "✅ Transaction appears safe, but always verify details",
    "Consider using a lower gas price to reduce front-running risk"
  ],
  "simulationResult": {
    "success": true,
    "gasUsed": "21000",
    "stateChanges": []
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Threat Types

### Critical Threats
- **simulation_failure**: Transaction will fail when executed
- **ownership_change**: Asset ownership will be transferred
- **known_threat**: Address flagged in threat intelligence

### High Threats
- **unlimited_approval**: Unlimited token approval requested
- **high_risk_transaction**: AI detected high-risk patterns
- **potential_phishing**: Possible phishing attempt

### Medium Threats
- **behavioral_anomaly**: Unusual transaction for this wallet
- **sensitive_function**: Calls sensitive contract functions
- **large_transfer**: Large value transfer detected

### Low Threats
- **frontrun_risk**: Vulnerable to front-running
- **unverified_contract**: Interacting with unverified contract

## Integration Examples

### JavaScript/TypeScript
```typescript
import axios from 'axios';

async function checkTransaction(transaction, walletAddress) {
  const response = await axios.post('http://localhost:3000/api/transaction/prevent-threats', {
    transaction,
    walletAddress
  });

  const result = response.data;

  if (!result.allowed) {
    console.error('🛑 Transaction blocked:', result.blockedReasons);
    return false;
  }

  if (result.riskLevel === 'high' || result.riskLevel === 'medium') {
    console.warn('⚠️ High risk transaction:', result.recommendations);
    // Show warning to user
  }

  return true;
}
```

### Web3 Integration
```javascript
// Before sending transaction
const transaction = {
  from: account,
  to: recipientAddress,
  value: web3.utils.toWei('0.1', 'ether'),
  data: contractData
};

// Check with threat prevention
const analysis = await fetch('http://localhost:3000/api/transaction/prevent-threats', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ transaction, walletAddress: account })
});

const result = await analysis.json();

if (result.allowed) {
  // Proceed with transaction
  await web3.eth.sendTransaction(transaction);
} else {
  // Block transaction and show warnings
  alert('Transaction blocked for your safety: ' + result.blockedReasons.join(', '));
}
```

### React Hook
```typescript
import { useState } from 'react';

function useTransactionSafety() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const analyzeTransaction = async (transaction, walletAddress) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/transaction/prevent-threats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction, walletAddress })
      });
      const data = await response.json();
      setResult(data);
      return data;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { analyzeTransaction, isAnalyzing, result };
}
```

## Configuration

### Environment Variables

```env
# Tenderly API (required for transaction simulation)
TENDERLY_API_KEY=your_tenderly_api_key
TENDERLY_ACCOUNT=your_tenderly_account
TENDERLY_PROJECT=your_tenderly_project

# Other security integrations
NANSEN_API_KEY=your_nansen_key
METASLEUTH_LABEL_API_KEY=your_metasleuth_key
PASSPORT_API_KEY=your_passport_key
```

## Testing

Run the test suite:

```bash
# Start the server
npm run dev

# In another terminal, run tests
npx ts-node test-threat-prevention.ts
```

## Frontend Widget

A standalone HTML widget is available at `frontend/threat-prevention-widget.html`. It provides:

- User-friendly transaction input form
- Real-time security analysis
- Visual risk indicators
- Detailed threat breakdowns
- Actionable recommendations

Open `frontend/threat-prevention-widget.html` in a browser to use the widget.

## Security Best Practices

1. **Always analyze before signing**: Never skip the security check
2. **Review all warnings**: Even "allowed" transactions may have risks
3. **Verify addresses**: Double-check recipient addresses
4. **Understand approvals**: Be cautious with token approvals
5. **Check simulation results**: Ensure transaction will succeed
6. **Monitor patterns**: Unusual behavior may indicate compromise

## Fail-Safe Design

The system is designed to **fail closed**:
- If analysis fails, transaction is blocked
- If API is unavailable, transaction is blocked
- If simulation fails, transaction is blocked
- User safety is prioritized over convenience

## Performance

- Average analysis time: 2-5 seconds
- Concurrent analysis support
- Caching for known addresses
- Rate limiting protection

## Future Enhancements

- [ ] Machine learning model training on historical attacks
- [ ] Real-time monitoring dashboard
- [ ] Browser extension integration
- [ ] Mobile app support
- [ ] Multi-chain support expansion
- [ ] Community threat reporting
- [ ] Automated threat intelligence updates

## Support

For issues or questions:
- Check the logs for detailed error messages
- Ensure all API keys are configured
- Verify network connectivity
- Review the test suite for examples

## License

Part of the Web3 Security Agent project.
