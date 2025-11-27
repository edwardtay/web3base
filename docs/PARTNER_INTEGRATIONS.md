# Partner Integrations

WebWatcher integrates with leading blockchain and infrastructure providers to enhance security monitoring and analysis capabilities.

## Overview

All partner integrations are implemented as SDK clients in `src/integrations/` and exposed as agent actions through the Unified Action Provider.

## Integrated Partners

### 1. Circle - USDC Stablecoin & Payments

**Purpose**: Payment security, wallet verification, USDC balance monitoring

**SDK**: `src/integrations/circle.ts`

**Actions**:
- `circle_get_balance` - Get USDC balance for a wallet address
- `circle_verify_address` - Verify wallet address security and risk level

**Setup**:
```bash
CIRCLE_API_KEY=your_api_key_here
CIRCLE_ENV=sandbox  # or production
```

**Example Usage**:
```
"Check USDC balance for address 0x1234..."
"Verify security of wallet 0x5678..."
```

---

### 2. ZetaChain - Universal Blockchain

**Purpose**: Cross-chain transaction monitoring, message verification

**SDK**: `src/integrations/zetachain.ts`

**Actions**:
- `zetachain_get_cross_chain_tx` - Get cross-chain transaction details
- `zetachain_verify_message` - Verify cross-chain message integrity

**Setup**:
```bash
ZETACHAIN_NETWORK=testnet  # or mainnet
ZETACHAIN_RPC_URL=https://zetachain-athens-evm.blockpi.network/v1/rpc/public
```

**Example Usage**:
```
"Get ZetaChain transaction 0xabc..."
"Verify cross-chain message msg-123"
```

---

### 3. Seedify - Web3 Incubator & Launchpad

**Purpose**: Project security verification, audit status checking

**SDK**: `src/integrations/seedify.ts`

**Actions**:
- `seedify_verify_project` - Verify Web3 project security and audit status

**Setup**:
```bash
SEEDIFY_API_KEY=your_api_key_here  # optional
```

**Example Usage**:
```
"Verify Seedify project project-123"
"Check audit status for project xyz"
```

---

### 4. Somnia - Blockchain Infrastructure

**Purpose**: High-performance blockchain metrics, infrastructure monitoring

**SDK**: `src/integrations/somnia.ts`

**Actions**:
- `somnia_get_metrics` - Get real-time blockchain performance metrics

**Setup**:
```bash
SOMNIA_RPC_URL=https://rpc.somnia.network
SOMNIA_API_KEY=your_api_key_here  # optional
```

**Example Usage**:
```
"Get Somnia blockchain metrics"
"Check Somnia infrastructure status"
```

---

### 5. NodeOps - Node Infrastructure Services

**Purpose**: Node health monitoring, infrastructure metrics

**SDK**: `src/integrations/nodeops.ts`

**Actions**:
- `nodeops_get_node_health` - Get node infrastructure health status

**Setup**:
```bash
NODEOPS_API_KEY=your_api_key_here  # optional
```

**Example Usage**:
```
"Check health of node node-123"
"Monitor NodeOps infrastructure"
```

---

## Architecture

### SDK Structure

Each partner integration follows this pattern:

```typescript
// Client class with configuration
export class PartnerClient {
  constructor(config: PartnerConfig) { }
  
  // API methods
  async getResource(): Promise<ResourceType> { }
}

// Singleton factory
export function getPartnerClient(): PartnerClient { }
```

### Action Provider Integration

Partner actions are added to `UnifiedActionProvider`:

```typescript
@CreateAction({
  name: "partner_action",
  description: "Action description",
  schema: z.object({ /* params */ }),
})
async partnerAction(
  walletProvider: WalletProvider,
  args: { /* params */ },
): Promise<string> {
  const client = getPartnerClient();
  const result = await client.method(args);
  return JSON.stringify(result, null, 2);
}
```

## Error Handling

All integrations include:
- Try-catch error handling
- Logging via `logger` utility
- Graceful fallbacks (mock data for demo when API unavailable)
- Type-safe API responses

## Testing

To test partner integrations:

1. Set up API keys in `.env`
2. Start the server: `npm run server`
3. Use the chat interface or API:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Check USDC balance for 0x1234...", "threadId": "test-123"}'
```

## Adding New Partners

To add a new partner integration:

1. Create SDK client in `src/integrations/partner-name.ts`
2. Export from `src/integrations/index.ts`
3. Add actions to `UnifiedActionProvider`
4. Update `.env.example` with configuration
5. Document in this file and main README

## Security Considerations

- API keys stored in environment variables
- Never log sensitive data
- Rate limiting on API calls
- Input validation on all parameters
- Graceful degradation when services unavailable

## Support

For partner-specific issues:
- Circle: https://developers.circle.com/
- ZetaChain: https://www.zetachain.com/docs/
- Seedify: https://seedify.fund/
- Somnia: https://somnia.network/
- NodeOps: https://nodeops.xyz/
