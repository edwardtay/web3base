/**
 * Test Gitcoin Passport API Integration
 */

import { getPassportScore, getPassportStamps, getPassportAnalysis } from './src/integrations/passport';

const TEST_ADDRESSES = {
  vitalik: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  regular: '0x909d27c5d48c3f1b0d6c6c4e5c0e5e5e5e5e2881',
};

async function testPassportIntegration() {
  console.log('🧪 Testing Gitcoin Passport API Integration\n');

  // Test 1: Get Passport score
  console.log('🎯 Test 1: Get Passport Score');
  try {
    const score = await getPassportScore(TEST_ADDRESSES.vitalik);
    console.log('✅ Score:', JSON.stringify(score, null, 2));
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
  console.log('');

  // Test 2: Get Passport stamps
  console.log('📋 Test 2: Get Passport Stamps');
  try {
    const stamps = await getPassportStamps(TEST_ADDRESSES.vitalik);
    console.log('✅ Stamps:', stamps.length, 'stamps found');
    if (stamps.length > 0) {
      console.log('First 3 stamps:', stamps.slice(0, 3).map(s => s.provider));
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
  console.log('');

  // Test 3: Get comprehensive analysis
  console.log('📊 Test 3: Get Comprehensive Analysis');
  try {
    const analysis = await getPassportAnalysis(TEST_ADDRESSES.regular);
    console.log('✅ Analysis:', JSON.stringify(analysis, null, 2));
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
  console.log('');

  console.log('✅ Passport integration tests complete!');
}

testPassportIntegration().catch(console.error);
