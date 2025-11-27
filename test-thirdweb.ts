import * as dotenv from 'dotenv';
dotenv.config();

const TEST_ADDRESS = '0x909dafb395eb281b92b317552e12133098d62881';

async function testThirdweb() {
  console.log('🧪 Testing Thirdweb Portfolio API');
  console.log('Test Address:', TEST_ADDRESS);
  console.log('='.repeat(50));

  try {
    const { getWalletPortfolio } = await import('./src/integrations/thirdweb');
    const result = await getWalletPortfolio(TEST_ADDRESS);
    
    console.log('\n✅ Thirdweb Portfolio API working!');
    console.log('\n📊 Portfolio Summary:');
    console.log('Total Value:', `$${result.totalValueUSD}`);
    console.log('Token Count:', result.tokenCount);
    console.log('NFT Count:', result.nftCount);
    console.log('Diversity Score:', `${result.diversityScore}/100`);
    
    if (result.chainBreakdown && result.chainBreakdown.length > 0) {
      console.log('\n⛓️ Chain Breakdown:');
      result.chainBreakdown.forEach((chain: any) => {
        console.log(`  Chain ${chain.chainId}: ${chain.tokens.length} tokens ($${chain.totalValueUSD})`);
      });
    }
    
    if (result.topTokens && result.topTokens.length > 0) {
      console.log('\n💎 Top 5 Tokens:');
      result.topTokens.slice(0, 5).forEach((token: any, index: number) => {
        const balance = parseFloat(token.balance) / Math.pow(10, token.decimals);
        console.log(`  ${index + 1}. ${token.symbol}: ${balance.toFixed(4)} ($${parseFloat(token.balanceUSD).toFixed(2)})`);
      });
    }
    
    if (result.tokenTypeBreakdown) {
      console.log('\n📈 Token Type Breakdown:');
      console.log(`  Native: ${result.tokenTypeBreakdown.native.count} tokens ($${result.tokenTypeBreakdown.native.totalValueUSD})`);
      console.log(`  ERC-20: ${result.tokenTypeBreakdown.erc20.count} tokens ($${result.tokenTypeBreakdown.erc20.totalValueUSD})`);
    }
    
    if (result.nftCollections && result.nftCollections.length > 0) {
      console.log('\n🖼️ NFT Collections:', result.nftCollections.length);
      console.log('NFT Type Breakdown:', result.nftTypeBreakdown);
    }
    
    console.log('\n✅ Test passed!');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testThirdweb();
