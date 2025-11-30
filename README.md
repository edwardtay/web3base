# 🔒 Web3Base - AI Security Agent for Web3

**Web3Base** is an AI-powered security assistant for Web3 that provides wallet analysis, ENS resolution, and conversational security assistance using Coinbase AgentKit and LangChain.

## 🎯 What Web3Base Does

### Core Features
- **AI Chat Assistant**: Ask security questions and get intelligent responses powered by GPT-4
- **ENS Resolution**: Resolve .eth domain names to wallet addresses
- **Wallet Analysis**: Comprehensive security analysis using 8 blockchain data providers
- **Quest Verification**: Verify protocol interactions across Circle, ZetaChain, Somnia, Seedify, and NodeOps
- **NFT Rewards**: Mint achievement NFTs on ZetaChain testnet for completing quests

### Technology Stack
- **Coinbase AgentKit**: Framework for building AI agents with blockchain capabilities
- **LangChain**: AI orchestration and conversation management
- **OpenAI GPT-4**: Natural language understanding and generation
- **Express.js**: Backend API server with security middleware
- **Performance**: Response caching, request deduplication, request ID tracking
- **Multi-Chain**: Ethereum, Base, Polygon, BSC, ZetaChain support

## 🎯 Features

### Core Capabilities

1. **Wallet Analysis**
   - Multi-chain wallet security analysis
   - Token balance and NFT holdings
   - Transaction history analysis
   - Token approval security checks
   - Risk scoring and threat detection

2. **Quest System**
   - Verify interactions with partner protocols
   - Track progress across 5 different chains/protocols
   - Award achievement passes for completing quests
   - Mint NFTs on ZetaChain testnet

3. **ENS Resolution**
   - Resolve .eth domain names to addresses
   - Cached for fast repeated lookups
   - Integrated with wallet analysis

4. **Multi-Provider Integration**
   - Moralis: Wallet security and transaction data
   - Alchemy: Token balances and NFT holdings
   - Blockscout: Blockchain explorer data
   - Thirdweb: Wallet portfolio tracking
   - Revoke.cash: Token approval security
   - Nansen: Wallet intelligence (when available)
   - MetaSleuth: Address risk scoring (when available)
   - Gitcoin Passport: Identity verification (when available)

5. **Performance Optimizations** ⚡
   - **Response Caching**: 10-100x faster repeated queries
   - **Request Deduplication**: Prevents duplicate processing
   - **Request ID Tracking**: Complete request tracing for debugging
   - See [PERFORMANCE_IMPROVEMENTS.md](docs/PERFORMANCE_IMPROVEMENTS.md) for details

## 🚀 Getting Started

### Prerequisites

- Node.js v22+ ([Download](https://nodejs.org/en/download/))
- [CDP API Key](https://portal.cdp.coinbase.com/access/api)
- [CDP Wallet Secret](https://portal.cdp.coinbase.com/products/wallet-api)
- [OpenAI API Key](https://platform.openai.com/docs/quickstart#create-and-export-an-api-key)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/edwardtay/web3base.git
cd web3base
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
CDP_API_KEY_ID=your_cdp_api_key_id_here
CDP_API_KEY_SECRET=your_cdp_api_key_secret_here
CDP_WALLET_SECRET=your_cdp_wallet_secret_here
OPENAI_API_KEY=your_openai_api_key_here
NETWORK_ID=base-sepolia
```

### Running the Agent

#### Web Server Mode (Recommended)
Start the web server with a user-friendly interface:
```bash
npm run server
# or
./start-server.sh
```

Then open your browser to: **http://localhost:3000**

#### CLI Mode (Development)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

#### Build
```bash
npm run build
```

## 📚 Documentation

- **[SECURITY.md](SECURITY.md)** - Security implementation guide and best practices
- **[PARTNER_INTEGRATIONS.md](docs/PARTNER_INTEGRATIONS.md)** - Partner SDK integrations and usage guide
- **[PERFORMANCE_IMPROVEMENTS.md](docs/PERFORMANCE_IMPROVEMENTS.md)** - Caching, deduplication, and request tracking
- **[Private Docs](private/docs/)** - Internal documentation, deployment guides, and improvements

## 📖 Usage

### Modes of Operation

#### 1. Chat Mode (Interactive)
Interactive security analysis mode where you can:
- Analyze specific transactions
- Check address security
- Monitor wallet status
- Get security summaries

```bash
npm start
# Select option 1: chat
```

Example commands:
- `"Analyze transaction 0x1234..."`
- `"Check address 0xabcd... for security risks"`
- `"Get security summary"`
- `"Monitor my wallet balance"`

#### 2. Monitor Mode (Continuous)
Automated continuous security monitoring:
- Periodic security checks
- Automated threat detection
- Real-time alerts
- Security analytics

```bash
npm start
# Select option 2: monitor
```

### Security Actions

The agent provides the following security-focused actions:

#### `monitor_transaction`
Monitor a specific transaction for suspicious patterns:
```typescript
{
  transactionHash: "0x...",
  address?: "0x..." // optional
}
```

#### `analyze_address`
Analyze a blockchain address for security risks:
```typescript
{
  address: "0x...",
  lookbackDays?: 7 // optional, default 7
}
```

#### `monitor_wallet_balance`
Monitor the agent's wallet balance for anomalies:
```typescript
{
  threshold?: 0.01 // optional, default 0.01 ETH
}
```

#### `get_security_summary`
Get comprehensive security summary:
```typescript
{}
```

## 🏗️ Architecture

```
web3base/
├── src/
│   ├── action-providers/
│   │   └── security.ts          # Custom security action provider
│   ├── utils/
│   │   ├── logger.ts            # Logging utility
│   │   └── security-analytics.ts # Security analytics module
│   └── index.ts                 # Main agent entry point
├── package.json
├── tsconfig.json
└── README.md
```

### Key Components

1. **SecurityActionProvider**: Custom action provider with security-focused tools
2. **SecurityAnalytics**: Event tracking and analytics module
3. **Logger**: Structured logging utility
4. **Main Agent**: LangChain-based agent with security-focused system prompt

## 🔒 Security Features

### Wallet Analysis

- **Multi-Provider Data**: Aggregates data from 8 blockchain providers
- **Token Approvals**: Security analysis via Revoke.cash
- **Transaction History**: Comprehensive transaction analysis
- **Balance Tracking**: Token and NFT holdings across chains
- **Risk Assessment**: Identifies potential security concerns

### Quest Verification

- **Circle**: Verify USDC holdings on Ethereum, Polygon, or Base
- **ZetaChain**: Check for transactions on mainnet or testnet
- **Somnia**: Verify activity on Somnia network
- **Seedify**: Check SFUND token holdings on BSC
- **NodeOps**: Verify NODE token holdings or validator activity

## 📊 API Endpoints

### Wallet Analysis
```bash
POST /api/wallet/analyze
```
Analyze wallet security using 8 blockchain data providers.

### ENS Resolution
```bash
POST /api/resolve-ens
```
Resolve .eth domain names to wallet addresses.

### Quest Verification
```bash
POST /api/quest/verify
```
Verify protocol interactions and award achievement passes.

### NFT Minting
```bash
POST /api/quest/mint-nft
```
Mint achievement NFT on ZetaChain testnet (requires 3+ quests completed).

### Performance Monitoring
```bash
GET /api/cache/stats
POST /api/cache/clear
```
Monitor and manage response cache.

## 🛠️ Development

### Project Structure

- **Modular Design**: Separate action providers, utilities, and core agent
- **Type Safety**: Full TypeScript with strict mode
- **Error Handling**: Comprehensive error handling and logging
- **Extensible**: Easy to add new security actions

### Adding New Security Actions

1. Extend `SecurityActionProvider` in `src/action-providers/security.ts`
2. Use `@CreateAction` decorator
3. Define schema with Zod
4. Implement action logic

Example:
```typescript
@CreateAction({
  name: "my_security_action",
  description: "Description of the action",
  schema: z.object({
    param: z.string(),
  }),
})
async mySecurityAction(
  walletProvider: WalletProvider,
  args: z.infer<typeof MySchema>,
): Promise<string> {
  // Implementation
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `CDP_API_KEY_ID` | CDP API Key ID | Yes | - |
| `CDP_API_KEY_SECRET` | CDP API Key Secret | Yes | - |
| `CDP_WALLET_SECRET` | CDP Wallet Secret | Yes | - |
| `OPENAI_API_KEY` | OpenAI API Key | Yes | - |
| `NETWORK_ID` | Network to use | No | `base-sepolia` |
| `MONITORING_INTERVAL_SECONDS` | Monitoring interval | No | `30` |
| `LOG_LEVEL` | Logging level | No | `info` |

### Supported Networks

- `base-sepolia` (default)
- `base-mainnet`
- `ethereum-sepolia`
- `ethereum-mainnet`

## 📝 Examples

### Example 1: Analyze a Transaction

```
[VeriSense] > Analyze transaction 0x1234567890abcdef1234567890abcdef12345678

Agent: Analyzing transaction...
Risk Level: MEDIUM
Risks Detected:
- High gas usage detected
Recommendation: Monitor closely
```

### Example 2: Check Address Security

```
[VeriSense] > Check address 0xabcdef1234567890abcdef1234567890abcdef12

Agent: Analyzing address...
Risk Level: LOW
Address appears normal
Balance: 0.5 ETH
```

### Example 3: Security Summary

```
[VeriSense] > summary

=== Security Analytics Summary ===
{
  "totalEvents": 15,
  "bySeverity": {
    "low": 10,
    "medium": 4,
    "high": 1
  },
  "averageRiskScore": 18.5
}
```

## 🤝 Contributing

This project follows a modular and extensible architecture. When contributing:

1. Follow the existing code structure
2. Add comprehensive error handling
3. Include logging for security events
4. Update documentation
5. Test thoroughly

## 📄 License

Apache-2.0

## 🔗 Integrated Data Sources

Web3Base aggregates security data from multiple blockchain providers:

- **Moralis**: Wallet security analysis and transaction history
- **Blockscout**: Blockchain explorer data and address verification
- **Alchemy**: Token balances and NFT holdings
- **Thirdweb**: Wallet portfolio and asset tracking
- **Revoke.cash**: Token approval security and recommendations
- **Nansen**: Wallet intelligence and labeling
- **MetaSleuth**: Address risk scoring and analysis
- **Gitcoin Passport**: Identity verification and trust scores

### Example Workflows

**Wallet Security Analysis**:
```
Enter wallet address or ENS name → Click "Analyze"
→ Fetches data from all 8 providers in parallel
→ Displays comprehensive security report
→ Shows token approvals, risk scores, and recommendations
```

**AI Security Assistant**:
```
Ask: "What are the latest Ethereum security vulnerabilities?"
→ Uses Exa MCP to search for recent CVEs and threats
→ GPT-4 analyzes and summarizes findings
→ Returns actionable security insights
```

## 🙏 Acknowledgments

- Built with [Coinbase AgentKit](https://github.com/coinbase/agentkit)
- Powered by LangChain and OpenAI
- Designed for the "Calling for All Agents SF" hackathon

## 🔗 Resources

- [AgentKit Documentation](https://docs.cdp.coinbase.com/agent-kit)
- [CDP API Documentation](https://docs.cdp.coinbase.com/)
- [LangChain Documentation](https://js.langchain.com/)

## 🐛 Troubleshooting

### Common Issues

1. **Missing API Keys**: Ensure all required environment variables are set
2. **Network Issues**: Check network connectivity and RPC endpoints
3. **Wallet Errors**: Verify CDP wallet secret is correct
4. **Rate Limits**: Monitor API rate limits for OpenAI and CDP

### Debug Mode

Enable debug logging:
```bash
LOG_LEVEL=debug npm start
```

## 📧 Support

For issues and questions, please open an issue on the repository.

---

**Built for cybersecurity and blockchain security monitoring** 🔒

