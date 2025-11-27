/**
 * Test MetaSleuth API Integration
 */

import { getAddressLabels, getRiskScore, getComprehensiveAnalysis } from './src/integrations/metasleuth';

const TEST_ADDRESSES = {
  vitalik: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  tornado: '0x722122dF12D4e14e13Ac3b6895a86e84145b6967', // Tornado Cash
  regular: '0x909d27c5d48c3f1b0d6c6c4e5c0e5e5e5e5e2881',
};

async function testMetaSleuthIntegration() {
  console.log('🧪 Testing MetaSleuth API Integration\n');

  // Test 1: Get address labels
  console.log('🏷️ Test 1: Get Address Labels');
  try {
    const labels = await getAddressLabels(TEST_ADDRESSES.vitalik);
    console.log('✅ Labels:', JSON.stringify(labels, null, 2));
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
  console.log('');

  // Test 2: Get risk score
  console.log('🛡️ Test 2: Get Risk Score');
  try {
    const riskScore = await getRiskScore(TEST_ADDRESSES.tornado);
    console.log('✅ Risk Score:', JSON.stringify(riskScore, null, 2));
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
  console.log('');

  // Test 3: Get comprehensive analysis
  console.log('📊 Test 3: Get Comprehensive Analysis');
  try {
    const analysis = await getComprehensiveAnalysis(TEST_ADDRESSES.regular);
    console.log('✅ Analysis:', JSON.stringify(analysis, null, 2));
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
  console.log('');

  console.log('✅ MetaSleuth integration tests complete!');
}

testMetaSleuthIntegration().catch(console.error);
