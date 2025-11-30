const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Web3Base Quest NFT to ZetaChain Testnet...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ZETA");

  // Get the contract factory
  const Web3BaseQuestNFT = await ethers.getContractFactory("Web3BaseQuestNFT");

  // Deploy the contract
  console.log("⏳ Deploying contract...");
  const nft = await Web3BaseQuestNFT.deploy("Web3Base Quest", "WEB3Q");
  
  await nft.waitForDeployment();
  const address = await nft.getAddress();

  console.log("✅ Contract deployed to:", address);
  console.log("📋 Contract name:", await nft.name());
  console.log("📋 Contract symbol:", await nft.symbol());
  console.log("\n🎉 Deployment complete!");
  console.log("\n📝 Next steps:");
  console.log("1. Set environment variable: WEB3BASE_NFT_CONTRACT=" + address);
  console.log("2. Verify contract on block explorer");
  console.log("3. Test minting with questMint() function");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

