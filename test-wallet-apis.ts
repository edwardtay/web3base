import * as dotenv from 'dotenv';
dotenv.config();

const TEST_ADDRESS = '0x909dafb395eb281b92b317552e12133098d62881';

async function testMoralis() {
  console.log('\n🔮 Testing Moralis...');
  try {
    const { analyzeWalletSecurity } = await import('./src/integrations/moralis');
    const result = await analyzeWalletSecurity(TEST_ADDRESS);
    console.log('✅ Moralis working!');
    console.log('Security Score:', result.securityScore);
    console.log('Transaction Count:', result.transactionCount);
    console.log('Net Worth:', result.netWorth);
    return true;
  } catch (error: any) {
    console.error('❌ Moralis failed:', error.message);
    return false;
  }
}

async function testBlockscout() {
  console.log('\n🔍 Testing Blockscout...');
  try {
    const { getComprehensiveWalletData } = await import('./src/integrations/blockscout');
    const result = await getComprehensiveWalletData(TEST_ADDRESS);
    console.log('✅ Blockscout working!');
    console.log('Balance:', result.balance);
    console.log('Transaction Count:', result.transactionCount);
    console.log('Token Count:', result.tokenCount);
    console.log('NFT Count:', result.nftCount);
    return true;
  } catch (error: any) {
    console.error('❌ Blockscout failed:', error.message);
    return false;
  }
}

async function testAlchemy() {
  console.log('\n⚡ Testing Alchemy...');
  try {
    const { getComprehensiveWalletMetrics } = await import('./src/integrations/alchemy');
    const result = await getComprehensiveWalletMetrics(TEST_ADDRESS);
    console.log('✅ Alchemy working!');
    console.log('ETH Balance:', result.ethBalance);
    console.log('Transaction Count:', result.transactionCount);
    console.log('Token Count:', result.tokenCount);
    console.log('NFT Count:', result.nftCount);
    console.log('Activity Score:', result.activityScore);
    return true;
  } catch (error: any) {
    console.error('❌ Alchemy failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Testing Wallet API Integrations');
  console.log('Test Address:', TEST_ADDRESS);
  console.log('='.repeat(50));

  const results = await Promise.all([
    testMoralis(),
    testBlockscout(),
    testAlchemy(),
  ]);

  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results:');
  console.log('Moralis:', results[0] ? '✅ PASS' : '❌ FAIL');
  console.log('Blockscout:', results[1] ? '✅ PASS' : '❌ FAIL');
  console.log('Alchemy:', results[2] ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = results.every(r => r);
  console.log('\n' + (allPassed ? '✅ All tests passed!' : '⚠️ Some tests failed'));
  
  process.exit(allPassed ? 0 : 1);
}

runTests();
