# Gitcoin Passport Integration

Gitcoin Passport API has been successfully integrated to provide identity verification and reputation scoring for wallet analysis.

## Features

### ✅ Identity Verification
- Human verification status (score threshold: 15+)
- Trust level classification (VERY_HIGH to VERY_LOW)
- Passport score (0-100+)
- Stamp count and verification providers

### 🎯 Trust Levels

Based on score and stamp count:
- **VERY_HIGH**: Score ≥ 50 + 10+ stamps
- **HIGH**: Score ≥ 30 + 5+ stamps  
- **MEDIUM**: Score ≥ 15 + 3+ stamps
- **LOW**: Score ≥ 5 + 1+ stamp
- **VERY_LOW**: Score < 5 or no stamps

### 📋 Stamps (Verification Providers)

Gitcoin Passport uses "stamps" to verify identity across multiple platforms:
- Social media (Twitter, Discord, GitHub)
- Web3 platforms (ENS, Lens, Snapshot)
- Identity providers (BrightID, Proof of Humanity)
- Activity proofs (NFT holder, DAO participant)

## API Configuration

- **API Key**: `PASSPORT_API_KEY`
- **Base URL**: `https://api.passport.xyz`
- **Default Scorer ID**: `1`

## Integration Points

### Backend (`src/integrations/passport.ts`)
- `getPassportScore()` - Get Passport score for address
- `getPassportStamps()` - Get all verification stamps
- `getPassportAnalysis()` - Comprehensive analysis with trust level

### Server Endpoint
- Added to `/api/wallet/analyze` endpoint
- Runs in parallel with other wallet analysis APIs
- Gracefully handles failures (returns VERY_LOW trust if unavailable)

### Frontend Display
- **Location**: Right column, above Security section
- **Shows When**: Score > 0 (has Passport data)
- **Display Elements**:
  - Human verification badge (👤 or 🤖)
  - Trust level with color coding
  - Passport score
  - Stamp count
  - Top 3 verification providers

## Color Coding

```javascript
VERY_HIGH/HIGH: Green (#3fb950) - Highly trusted
MEDIUM: Orange (#f0883e) - Moderately trusted
LOW/VERY_LOW: Gray (#8b949e) - Limited trust
```

## Use Cases

### 🎯 Sybil Resistance
- Identify real humans vs bots
- Prevent multi-account abuse
- Verify unique identity

### 🤝 Trust Building
- Show reputation in DeFi protocols
- Qualify for airdrops/rewards
- Access gated communities

### 🛡️ Security Enhancement
- Additional verification layer
- Complement risk scoring
- Identify legitimate users

## Example Response

```json
{
  "address": "0x...",
  "timestamp": "2025-11-29T...",
  "score": 42.5,
  "status": "DONE",
  "isHuman": true,
  "stampCount": 8,
  "stamps": ["Twitter", "GitHub", "ENS", "Snapshot", ...],
  "trustLevel": "HIGH",
  "verifiedProviders": ["Twitter", "GitHub", "ENS", ...]
}
```

## Benefits

- **Identity Verification**: Proves wallet is controlled by real human
- **Reputation System**: Higher scores indicate more trustworthy users
- **Sybil Protection**: Helps prevent fake accounts and bots
- **Community Access**: Many DAOs/protocols use Passport for gating
- **Enhanced Security**: Additional trust signal beyond on-chain data

## Testing

Run the test file:
```bash
npx tsx test-passport.ts
```

## Display Logic

1. Shows in right column if score > 0
2. Human verification badge based on score ≥ 15
3. Trust level color-coded for quick assessment
4. Lists top 3 verification providers
5. Falls back gracefully if no Passport data
