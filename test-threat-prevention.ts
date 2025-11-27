import axios from 'axios';

const API_URL = 'http://localhost:3000';

interface TransactionRequest {
  from: string;
  to: string;
  value?: string;
  data?: string;
  chainId?: number;
}

async function testThreatPrevention() {
  console.log('🛡️ Testing Threat Prevention System\n');

  // Test 1: Safe transaction
  console.log('Test 1: Safe ETH transfer');
  const safeTransaction: TransactionRequest = {
    from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    to: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    value: '0.01',
    chainId: 1
  };

  try {
    const response = await axios.post(`${API_URL}/api/transaction/prevent-threats`, {
      transaction: safeTransaction,
      walletAddress: safeTransaction.from
    });

    console.log('✅ Response:', JSON.stringify(response.data, null, 2));
    console.log(`   Allowed: ${response.data.allowed}`);
    console.log(`   Risk Level: ${response.data.riskLevel}`);
    console.log(`   Risk Score: ${response.data.riskScore}`);
    console.log(`   Threats: ${response.data.threats.length}`);
    console.log('\n');
  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.log('\n');
  }

  // Test 2: High-value transaction
  console.log('Test 2: High-value ETH transfer');
  const highValueTransaction: TransactionRequest = {
    from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    to: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    value: '10',
    chainId: 1
  };

  try {
    const response = await axios.post(`${API_URL}/api/transaction/prevent-threats`, {
      transaction: highValueTransaction,
      walletAddress: highValueTransaction.from
    });

    console.log('✅ Response:', JSON.stringify(response.data, null, 2));
    console.log(`   Allowed: ${response.data.allowed}`);
    console.log(`   Risk Level: ${response.data.riskLevel}`);
    console.log(`   Threats detected: ${response.data.threats.length}`);
    console.log('\n');
  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.log('\n');
  }

  // Test 3: Token approval transaction
  console.log('Test 3: Token approval (potentially risky)');
  const approvalTransaction: TransactionRequest = {
    from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    to: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC contract
    value: '0',
    data: '0x095ea7b3000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    chainId: 1
  };

  try {
    const response = await axios.post(`${API_URL}/api/transaction/prevent-threats`, {
      transaction: approvalTransaction,
      walletAddress: approvalTransaction.from
    });

    console.log('✅ Response:', JSON.stringify(response.data, null, 2));
    console.log(`   Allowed: ${response.data.allowed}`);
    console.log(`   Risk Level: ${response.data.riskLevel}`);
    console.log(`   Threats detected: ${response.data.threats.length}`);
    if (response.data.threats.length > 0) {
      console.log('   Threat types:', response.data.threats.map((t: any) => t.type).join(', '));
    }
    console.log('\n');
  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.log('\n');
  }

  // Test 4: Transaction to known malicious address (simulated)
  console.log('Test 4: Transaction to potentially malicious address');
  const maliciousTransaction: TransactionRequest = {
    from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    to: '0x0000000000000000000000000000000000000000', // Null address
    value: '1',
    chainId: 1
  };

  try {
    const response = await axios.post(`${API_URL}/api/transaction/prevent-threats`, {
      transaction: maliciousTransaction,
      walletAddress: maliciousTransaction.from
    });

    console.log('✅ Response:', JSON.stringify(response.data, null, 2));
    console.log(`   Allowed: ${response.data.allowed}`);
    console.log(`   Risk Level: ${response.data.riskLevel}`);
    console.log(`   Blocked Reasons:`, response.data.blockedReasons);
    console.log('\n');
  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.log('\n');
  }

  // Test 5: Invalid transaction (missing required fields)
  console.log('Test 5: Invalid transaction format');
  try {
    const response = await axios.post(`${API_URL}/api/transaction/prevent-threats`, {
      transaction: { from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' },
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
    });

    console.log('✅ Response:', JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    console.log('✅ Expected error:', error.response?.data?.error);
    console.log('\n');
  }

  console.log('🏁 Threat Prevention Tests Complete');
}

// Run tests
testThreatPrevention().catch(console.error);
