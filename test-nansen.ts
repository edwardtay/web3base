/**
 * Test Nansen API Integration
 */

import { getWalletLabels, getWalletProfile, getWalletIntelligence } from './src/integrations/nansen';

const TEST_ADDRESSES = {
  vitalik: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Vitalik's address
  binance: '0x28C6c06298d514Db089934071355E5743bf21d60', // Binance hot wallet
  regular: '0x909d27c5d48c3f1b0d6c6c4e5c0e5e5e5e5e2881', // Test address
};

async function testNansenIntegration() {
  console.log('🧪 Testing Nansen API Integration\n');

  // Test 1: Get wallet labels
  console.log('📋 Test 1: Get Wallet Labels');
  try {
    const labels = await getWalletLabels(TEST_ADDRESSES.vitalik);
    console.log('✅ Labels:', JSON.stringify(labels, null, 2));
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
  console.log('');

  // Test 2: Get wallet profile
  console.log('👤 Test 2: Get Wallet Profile');
  try {
    const profile = await getWalletProfile(TEST_ADDRESSES.binance);
    console.log('✅ Profile:', JSON.stringify(profile, null, 2));
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
  console.log('');

  // Test 3: Get comprehensive intelligence
  console.log('🧠 Test 3: Get Wallet Intelligence');
  try {
    const intelligence = await getWalletIntelligence(TEST_ADDRESSES.vitalik);
    console.log('✅ Intelligence:', JSON.stringify(intelligence, null, 2));
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
  console.log('');

  console.log('✅ Nansen integration tests complete!');
}

testNansenIntegration().catch(console.error);
