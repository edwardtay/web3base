# MetaSleuth Integration

MetaSleuth API has been successfully integrated to provide address labels and risk scoring for wallet analysis.

## Features

### 🏷️ Address Labels
- Entity identification
- Category classification
- Tag system for quick identification

### 🛡️ Risk Scoring
- Risk score (0-100)
- Risk level classification (LOW/MEDIUM/HIGH/CRITICAL)
- Detailed risk factors:
  - Mixer interaction detection
  - Sanctioned entity identification
  - Phishing-related activity
  - Scam-related activity
  - Stolen funds detection
  - High-risk counterparties
  - Suspicious activity patterns

## API Keys

Two separate API keys are used:
- **Label API**: `METASLEUTH_LABEL_API_KEY` - For address labels and entity information
- **Risk API**: `METASLEUTH_RISK_API_KEY` - For risk scoring and threat detection

## Integration Points

### Backend (`src/integrations/metasleuth.ts`)
- `getAddressLabels()` - Fetch address labels and entity info
- `getRiskScore()` - Get risk score and factors
- `getComprehensiveAnalysis()` - Combined analysis

### Server Endpoint
- Added to `/api/wallet/analyze` endpoint
- Runs in parallel with other wallet analysis APIs
- Gracefully handles failures

### Frontend Display
- **Priority Display**: MetaSleuth risk analysis shown first if risk score > 0
- **Color-coded Risk Levels**:
  - CRITICAL: Dark red (#da3633)
  - HIGH: Red (#f85149)
  - MEDIUM: Orange (#f0883e)
  - LOW: Green (#3fb950)
- **Risk Factors**: Listed with warning icons
- **Labels**: Displayed as badges
- **Fallback**: Shows Nansen intelligence if MetaSleuth has no data

## Risk Level Determination

```
Score >= 80: CRITICAL
Score >= 60: HIGH
Score >= 30: MEDIUM
Score < 30:  LOW
```

## Error Handling

- Returns safe defaults instead of throwing errors
- Empty labels/risk factors if API fails
- Doesn't break wallet analysis if MetaSleuth is unavailable

## Testing

Run the test file:
```bash
npx tsx test-metasleuth.ts
```

## Display Logic

1. If MetaSleuth has risk data (score > 0), show it prominently
2. If MetaSleuth has no data, fall back to Nansen intelligence
3. Risk analysis box uses red/orange theme for visibility
4. Portfolio and activity data shown below intelligence

## Benefits

- **Real-time Risk Assessment**: Immediate risk scoring for connected wallets
- **Threat Detection**: Identifies sanctioned entities, mixers, phishing, scams
- **Enhanced Security**: Provides additional layer beyond Nansen
- **User Safety**: Clear visual warnings for high-risk addresses
