import * as dotenv from 'dotenv';
dotenv.config();

const TEST_ADDRESS = '0x909dafb395eb281b92b317552e12133098d62881';

async function testAlchemyTokens() {
  console.log('🧪 Testing Alchemy Token Details');
  console.log('Test Address:', TEST_ADDRESS);
  console.log('='.repeat(50));

  try {
    const { getComprehensiveWalletMetrics } = await import('./src/integrations/alchemy');
    const result = await getComprehensiveWalletMetrics(TEST_ADDRESS);
    
    console.log('\n✅ Alchemy Metrics:');
    console.log('ETH Balance:', result.ethBalance);
    console.log('Transaction Count:', result.transactionCount);
    console.log('Token Count:', result.tokenCount);
    console.log('NFT Count:', result.nftCount);
    console.log('Activity Score:', result.activityScore);
    
    if (result.tokens && result.tokens.length > 0) {
      console.log('\n💎 Tokens Found:');
      result.tokens.forEach((token: any, index: number) => {
        console.log(`\n${index + 1}. ${token.metadata?.name || 'Unknown'} (${token.metadata?.symbol || '?'})`);
        console.log(`   Contract: ${token.contractAddress}`);
        console.log(`   Balance: ${token.tokenBalance}`);
        console.log(`   Decimals: ${token.metadata?.decimals || 18}`);
        
        if (token.tokenBalance) {
          const decimals = token.metadata?.decimals || 18;
          const balance = parseInt(token.tokenBalance, 16) / Math.pow(10, decimals);
          console.log(`   Human Readable: ${balance.toFixed(6)}`);
        }
      });
    } else {
      console.log('\n⚠️ No tokens found');
    }
    
    if (result.nfts && result.nfts.length > 0) {
      console.log('\n🖼️ NFTs Found:', result.nfts.length);
    }
    
    console.log('\n✅ Test passed!');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testAlchemyTokens();
