import * as dotenv from 'dotenv';
dotenv.config();

const TEST_ADDRESS = '0x909dafb395eb281b92b317552e12133098d62881';

async function testRevoke() {
  console.log('🧪 Testing Revoke.cash Integration');
  console.log('Test Address:', TEST_ADDRESS);
  console.log('='.repeat(50));

  try {
    const { getSecurityRecommendations, getApprovalSummary } = await import('./src/integrations/revoke');
    
    console.log('\n🔐 Getting Security Recommendations...');
    const recommendations = getSecurityRecommendations(TEST_ADDRESS, 1);
    
    console.log('\n✅ Security Recommendations:');
    console.log('Revoke URL:', recommendations.revokeUrl);
    console.log('\nCritical Actions:');
    recommendations.criticalActions.forEach((action, index) => {
      console.log(`\n${index + 1}. [${action.priority}] ${action.icon} ${action.action}`);
      console.log(`   ${action.description}`);
      console.log(`   URL: ${action.url}`);
    });
    
    console.log('\n📚 Educational Links:');
    recommendations.educationalLinks.forEach((link, index) => {
      console.log(`${index + 1}. ${link.title}`);
      console.log(`   ${link.url}`);
    });
    
    console.log('\n📋 Getting Approval Summary...');
    const summary = await getApprovalSummary(TEST_ADDRESS, 1);
    
    console.log('\n✅ Approval Summary:');
    console.log('Address:', summary.address);
    console.log('Chain ID:', summary.chainId);
    console.log('Message:', summary.message);
    console.log('Revoke URL:', summary.revokeUrl);
    console.log('\nRecommendations:');
    summary.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
    
    console.log('\n✅ Revoke.cash integration test passed!');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testRevoke();
