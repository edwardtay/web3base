#!/bin/bash

# Test Partner Integrations
# This script verifies all partner integrations are properly configured

echo "🔍 Testing WebWatcher Partner Integrations"
echo "=========================================="
echo ""

# Check if compiled files exist
echo "✓ Checking compiled integration files..."
for partner in circle zetachain seedify somnia nodeops; do
  if [ -f "dist/integrations/${partner}.js" ]; then
    echo "  ✓ ${partner}.js compiled"
  else
    echo "  ✗ ${partner}.js missing"
    exit 1
  fi
done
echo ""

# Check if action provider includes integrations
echo "✓ Checking action provider integration..."
if grep -q "getCircleClient" dist/action-providers/unified-action-provider.js; then
  echo "  ✓ Circle integration found"
else
  echo "  ✗ Circle integration missing"
  exit 1
fi

if grep -q "getZetaChainClient" dist/action-providers/unified-action-provider.js; then
  echo "  ✓ ZetaChain integration found"
else
  echo "  ✗ ZetaChain integration missing"
  exit 1
fi

if grep -q "getSeedifyClient" dist/action-providers/unified-action-provider.js; then
  echo "  ✓ Seedify integration found"
else
  echo "  ✗ Seedify integration missing"
  exit 1
fi

if grep -q "getSomniaClient" dist/action-providers/unified-action-provider.js; then
  echo "  ✓ Somnia integration found"
else
  echo "  ✗ Somnia integration missing"
  exit 1
fi

if grep -q "getNodeOpsClient" dist/action-providers/unified-action-provider.js; then
  echo "  ✓ NodeOps integration found"
else
  echo "  ✗ NodeOps integration missing"
  exit 1
fi
echo ""

# Check environment configuration
echo "✓ Checking environment configuration..."
if [ -f ".env.example" ]; then
  if grep -q "CIRCLE_API_KEY" .env.example; then
    echo "  ✓ Circle config documented"
  fi
  if grep -q "ZETACHAIN_NETWORK" .env.example; then
    echo "  ✓ ZetaChain config documented"
  fi
  if grep -q "SEEDIFY_API_KEY" .env.example; then
    echo "  ✓ Seedify config documented"
  fi
  if grep -q "SOMNIA_RPC_URL" .env.example; then
    echo "  ✓ Somnia config documented"
  fi
  if grep -q "NODEOPS_API_KEY" .env.example; then
    echo "  ✓ NodeOps config documented"
  fi
fi
echo ""

# Summary
echo "=========================================="
echo "✅ All partner integrations verified!"
echo ""
echo "Integrated Partners:"
echo "  • Circle - USDC & Payments"
echo "  • ZetaChain - Universal Blockchain"
echo "  • Seedify - Web3 Launchpad"
echo "  • Somnia - Blockchain Infrastructure"
echo "  • NodeOps - Node Infrastructure"
echo ""
echo "Next steps:"
echo "  1. Add API keys to .env file"
echo "  2. Start server: npm run server"
echo "  3. Test via chat interface"
echo ""
