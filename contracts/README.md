# Web3Base Quest NFT Contract

Simple ERC721 NFT contract for Web3Base Quest Pass on ZetaChain Testnet.

## Setup

1. Install dependencies:
```bash
cd contracts
npm install
```

2. Create `.env` file:
```bash
PRIVATE_KEY=your_private_key_here
ZETACHAIN_TESTNET_RPC=https://zeta-chain-testnet.drpc.org
```

3. Get testnet tokens:
   - Visit [ZetaChain Faucet](https://zetachain.faucetme.pro/)
   - Connect your wallet
   - Request testnet tokens

## Deployment

1. Compile the contract:
```bash
npm run compile
```

2. Deploy to ZetaChain Testnet:
```bash
npm run deploy
```

3. After deployment, set the contract address:
```bash
export WEB3BASE_NFT_CONTRACT=<deployed_contract_address>
```

## Contract Functions

- `questMint(address to)` - Public mint function (anyone can call)
- `mint(address to)` - Owner-only mint function
- `totalSupply()` - Get total number of NFTs minted
- `hasMinted(address)` - Check if address has already minted

## Contract Address

After deployment, update the backend environment variable:
```
WEB3BASE_NFT_CONTRACT=<contract_address>
```

## Verification

To verify the contract on block explorer:
```bash
npm run verify <contract_address>
```

