const { ethers } = require("hardhat")

async function main() {
  const network = await ethers.provider.getNetwork()
  const hre = require("hardhat")

  console.log("🎰 Deploying LuckyMotors Lottery Contract on Lisk L2...")
  console.log("Network:", network.name)
  console.log("Chain ID:", network.chainId)

  // Token address from previous deployment
  const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000"

  if (TOKEN_ADDRESS === "0x0000000000000000000000000000000000000000") {
    console.error("❌ Please set TOKEN_ADDRESS environment variable")
    process.exit(1)
  }

  console.log("🪙 Using Token Address:", TOKEN_ADDRESS)

  // Get the contract factory
  const LuckyMotorsLottery = await ethers.getContractFactory("LuckyMotorsLottery")

  // Deploy the contract with gas estimation
  console.log("📊 Estimating gas for lottery deployment...")
  const deploymentData = LuckyMotorsLottery.interface.encodeDeploy([TOKEN_ADDRESS])

  const estimatedGas = await ethers.provider.estimateGas({
    data: deploymentData,
  })

  console.log("⛽ Estimated gas:", estimatedGas.toString())

  // Deploy the contract
  console.log("🔨 Deploying LuckyMotors Lottery...")
  const lottery = await LuckyMotorsLottery.deploy(TOKEN_ADDRESS, {
    gasLimit: estimatedGas.mul(120).div(100), // Add 20% buffer
  })

  await lottery.deployed()

  console.log("✅ LuckyMotors Lottery deployed to:", lottery.address)
  console.log("📝 Transaction hash:", lottery.deployTransaction.hash)
  console.log("⛽ Gas used:", lottery.deployTransaction.gasLimit?.toString())

  // Wait for confirmations
  console.log("⏳ Waiting for block confirmations...")
  await lottery.deployTransaction.wait(3)

  // Add lottery as authorized minter for token
  console.log("🔐 Adding lottery as authorized minter...")
  const tokenContract = await ethers.getContractAt("LuckyMotorsToken", TOKEN_ADDRESS)
  const addMinterTx = await tokenContract.addMinter(lottery.address)
  await addMinterTx.wait(2)
  console.log("✅ Lottery added as authorized minter!")

  // Verify contract on block explorer
  if (network.name === "lisk" || network.name === "liskSepolia") {
    console.log("🔍 Verifying lottery contract on Lisk Block Explorer...")
    try {
      await hre.run("verify:verify", {
        address: lottery.address,
        constructorArguments: [TOKEN_ADDRESS],
        network: network.name,
      })
      console.log("✅ Lottery contract verified successfully!")
    } catch (error) {
      console.log("❌ Lottery verification failed:", error.message)
    }
  }

  // Display deployment summary
  console.log("\n🎉 Lottery Deployment Summary:")
  console.log("================================")
  console.log("Lottery Address:", lottery.address)
  console.log("Token Address:", TOKEN_ADDRESS)
  console.log("Network:", network.name)
  console.log("Chain ID:", network.chainId)
  console.log(
    "Block Explorer:",
    network.chainId === 1135
      ? `https://blockscout.lisk.com/address/${lottery.address}`
      : `https://sepolia-blockscout.lisk.com/address/${lottery.address}`,
  )
  console.log("Ticket Price: 0.01 ETH")
  console.log("Max Tickets per Round: 1,000")
  console.log("Min Tickets for Draw: 3")
  console.log("House Fee: 5%")
  console.log("Token Reward Rate: 50%")
  console.log("Randomness Delay: 3 blocks")
  console.log("================================")

  return { lottery: lottery.address, token: TOKEN_ADDRESS }
}

main()
  .then((addresses) => {
    console.log("🎯 Lottery deployment completed successfully!")
    console.log("📋 Contract Addresses:")
    console.log("   Token:", addresses.token)
    console.log("   Lottery:", addresses.lottery)
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Lottery deployment failed:", error)
    process.exit(1)
  })
