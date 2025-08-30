const { ethers } = require("hardhat")

async function main() {
  const network = await ethers.provider.getNetwork()
  const hre = require("hardhat")

  console.log("Deploying LuckyMotors Lottery Contract on Lisk L2...")
  console.log("Network:", network.name)
  console.log("Chain ID:", network.chainId)

  // Lisk L2 Chainlink VRF Configuration
  let VRF_COORDINATOR_V2, GAS_LANE, SUBSCRIPTION_ID, CALLBACK_GAS_LIMIT

  if (network.chainId === 4202) {
    // Lisk Sepolia Testnet
    console.log("Configuring for Lisk Sepolia Testnet...")
    VRF_COORDINATOR_V2 = "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625" // Using Ethereum Sepolia VRF for now
    GAS_LANE = "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c"
    SUBSCRIPTION_ID = process.env.VRF_SUBSCRIPTION_ID || 1
    CALLBACK_GAS_LIMIT = 500000
  } else if (network.chainId === 1135) {
    // Lisk Mainnet
    console.log("Configuring for Lisk Mainnet...")
    VRF_COORDINATOR_V2 = "0x271682DEB8C4E0901D1a1550aD2e64D568E69909" // Ethereum Mainnet VRF
    GAS_LANE = "0x8af398995b04c28e9951adb9721ef74c74f93e6a478f39e7e0777be13527e7ef"
    SUBSCRIPTION_ID = process.env.VRF_SUBSCRIPTION_ID || 1
    CALLBACK_GAS_LIMIT = 500000
  } else {
    // Fallback configuration
    console.log("Using fallback VRF configuration...")
    VRF_COORDINATOR_V2 = "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625"
    GAS_LANE = "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c"
    SUBSCRIPTION_ID = process.env.VRF_SUBSCRIPTION_ID || 1
    CALLBACK_GAS_LIMIT = 500000
  }

  console.log("VRF Coordinator:", VRF_COORDINATOR_V2)
  console.log("Gas Lane:", GAS_LANE)
  console.log("Subscription ID:", SUBSCRIPTION_ID)

  // Get the contract factory
  const LuckyMotorsLottery = await ethers.getContractFactory("LuckyMotorsLottery")

  // Deploy the contract with gas estimation
  console.log("Estimating gas for deployment...")
  const deploymentData = LuckyMotorsLottery.interface.encodeDeploy([
    SUBSCRIPTION_ID,
    VRF_COORDINATOR_V2,
    GAS_LANE,
    CALLBACK_GAS_LIMIT
  ])

  const estimatedGas = await ethers.provider.estimateGas({
    data: deploymentData
  })

  console.log("Estimated gas:", estimatedGas.toString())

  // Deploy the contract
  console.log("Deploying contract...")
  const lottery = await LuckyMotorsLottery.deploy(
    SUBSCRIPTION_ID,
    VRF_COORDINATOR_V2,
    GAS_LANE,
    CALLBACK_GAS_LIMIT,
    {
      gasLimit: estimatedGas.mul(120).div(100) // Add 20% buffer
    }
  )

  await lottery.deployed()

  console.log("✅ LuckyMotors Lottery deployed to:", lottery.address)
  console.log("📝 Transaction hash:", lottery.deployTransaction.hash)
  console.log("⛽ Gas used:", lottery.deployTransaction.gasLimit?.toString())

  // Wait for confirmations
  console.log("⏳ Waiting for block confirmations...")
  await lottery.deployTransaction.wait(3)

  // Verify contract on block explorer
  if (network.name === "lisk" || network.name === "liskSepolia") {
    console.log("🔍 Verifying contract on Lisk Block Explorer...")
    try {
      await hre.run("verify:verify", {
        address: lottery.address,
        constructorArguments: [SUBSCRIPTION_ID, VRF_COORDINATOR_V2, GAS_LANE, CALLBACK_GAS_LIMIT],
        network: network.name
      })
      console.log("✅ Contract verified successfully!")
    } catch (error) {
      console.log("❌ Verification failed:", error.message)
    }
  }

  // Display deployment summary
  console.log("\n🎉 Deployment Summary:")
  console.log("========================")
  console.log("Contract Address:", lottery.address)
  console.log("Network:", network.name)
  console.log("Chain ID:", network.chainId)
  console.log("Block Explorer:", network.chainId === 1135 ? 
    `https://blockscout.lisk.com/address/${lottery.address}` : 
    `https://sepolia-blockscout.lisk.com/address/${lottery.address}`)
  console.log("Ticket Price: 0.01 ETH")
  console.log("Max Tickets per Round: 1,000")
  console.log("House Fee: 5%")
  console.log("========================")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error)
    process.exit(1)
  })
