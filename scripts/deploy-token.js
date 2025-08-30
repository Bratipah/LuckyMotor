const { ethers } = require("hardhat")

async function main() {
  const network = await ethers.provider.getNetwork()
  const [deployer] = await ethers.getSigners()
  const hre = require("hardhat")

  console.log("🪙 Deploying LuckyMotors Token Contract on Lisk L2...")
  console.log("Network:", network.name)
  console.log("Chain ID:", network.chainId)
  console.log("Deployer:", deployer.address)
  console.log("Balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH")

  // Get the contract factory
  const LuckyMotorsToken = await ethers.getContractFactory("LuckyMotorsToken")

  // Estimate gas for deployment
  console.log("📊 Estimating gas for token deployment...")
  const deploymentData = LuckyMotorsToken.interface.encodeDeploy([])
  const estimatedGas = await ethers.provider.estimateGas({
    data: deploymentData,
  })

  console.log("⛽ Estimated gas:", estimatedGas.toString())

  // Deploy the contract
  console.log("🔨 Deploying LuckyMotors Token...")
  const token = await LuckyMotorsToken.deploy({
    gasLimit: estimatedGas.mul(120).div(100), // Add 20% buffer
  })

  await token.deployed()

  console.log("✅ LuckyMotors Token deployed to:", token.address)
  console.log("📝 Transaction hash:", token.deployTransaction.hash)
  console.log("⛽ Gas used:", token.deployTransaction.gasLimit?.toString())

  // Wait for confirmations
  console.log("⏳ Waiting for block confirmations...")
  await token.deployTransaction.wait(3)

  // Verify contract on block explorer
  if (network.name === "lisk" || network.name === "liskSepolia") {
    console.log("🔍 Verifying token contract on Lisk Block Explorer...")
    try {
      await hre.run("verify:verify", {
        address: token.address,
        constructorArguments: [],
        network: network.name,
      })
      console.log("✅ Token contract verified successfully!")
    } catch (error) {
      console.log("❌ Token verification failed:", error.message)
    }
  }

  // Display token information
  const name = await token.name()
  const symbol = await token.symbol()
  const decimals = await token.decimals()
  const totalSupply = await token.totalSupply()
  const maxSupply = await token.MAX_SUPPLY()

  console.log("\n🎉 Token Deployment Summary:")
  console.log("=============================")
  console.log("Token Address:", token.address)
  console.log("Token Name:", name)
  console.log("Token Symbol:", symbol)
  console.log("Decimals:", decimals.toString())
  console.log("Initial Supply:", ethers.utils.formatEther(totalSupply), symbol)
  console.log("Max Supply:", ethers.utils.formatEther(maxSupply), symbol)
  console.log("Network:", network.name)
  console.log("Chain ID:", network.chainId)
  console.log(
    "Block Explorer:",
    network.chainId === 1135
      ? `https://blockscout.lisk.com/address/${token.address}`
      : `https://sepolia-blockscout.lisk.com/address/${token.address}`,
  )
  console.log("=============================")

  return token.address
}

main()
  .then((address) => {
    console.log("🎯 Token deployment completed successfully!")
    console.log("📋 Token Address:", address)
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Token deployment failed:", error)
    process.exit(1)
  })
