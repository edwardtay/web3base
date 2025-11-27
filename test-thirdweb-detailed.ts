import * as dotenv from 'dotenv';
dotenv.config();

const TEST_ADDRESS = '0x909dafb395eb281b92b317552e12133098d62881';

async function testThirdwebDetailed() {
  console.log('🧪 Testing Thirdweb Detailed');
  console.log('Test Address:', TEST_ADDRESS);
  console.log('='.repeat(50));

  try {
    const { getWalletTokens, getWalletNFTs } = await import('./src/integrations/thirdweb');
    
    console.log('\n📊 Testing Token Fetch (Chain 1 - Ethereum)...');
    const tokens = await getWalletTokens(TEST_ADDRESS, 1);
    console.log('Tokens returned:', tokens.length);
    
    if (tokens.length > 0) {
      console.log('\n💎 Tokens:');
      tokens.forEach((token: any, index: number) => {
        console.log(`\n${index + 1}. ${token.name} (${token.symbol})`);
        console.log(`   Balance: ${token.balance}`);
        console.log(`   Value USD: $${token.balanceUSD}`);
        console.log(`   Decimals: ${token.decimals}`);
      });
    } else {
      console.log('⚠️ No tokens returned from Thirdweb');
    }
    
    console.log('\n🖼️ Testing NFT Fetch...');
    const nfts = await getWalletNFTs(TEST_ADDRESS, 1);
    console.log('NFTs returned:', nfts.length);
    
    console.log('\n✅ Test complete!');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testThirdwebDetailed();
