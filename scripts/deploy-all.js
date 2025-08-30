const { ethers } = require("hardhat")

async function main() {
  const network = await ethers.provider.getNetwork()
  const [deployer] = await ethers.getSigners()
  const hre = require("hardhat")

  console.log("🚀 Starting Complete LuckyMotors Deployment on Lisk Sepolia")
  console.log("=========================================================")
  console.log("Network:", network.name)
  console.log("Chain ID:", network.chainId)
  console.log("Deployer Address:", deployer.address)
  console.log("Deployer Balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH")
  console.log("RPC URL:", network.name === "liskSepolia" ? "https://rpc.sepolia-api.lisk.com" : "Unknown")
  console.log("Block Explorer:", "https://sepolia-blockscout.lisk.com")
  console.log("")

  // Step 1: Deploy Token Contract
  console.log("📝 Step 1: Deploying LuckyMotors Token...")
  const LuckyMotorsToken = await ethers.getContractFactory("LuckyMotorsToken")

  const tokenEstimatedGas = await ethers.provider.estimateGas({
    data: LuckyMotorsToken.bytecode,
  })

  console.log("⛽ Token estimated gas:", tokenEstimatedGas.toString())

  const token = await LuckyMotorsToken.deploy({
    gasLimit: tokenEstimatedGas.mul(120).div(100),
  })

  await token.deployed()
  console.log("✅ Token deployed to:", token.address)
  console.log("📝 Token transaction hash:", token.deployTransaction.hash)

  // Wait for confirmations
  console.log("⏳ Waiting for token confirmations...")
  await token.deployTransaction.wait(3)

  // Get token details
  const tokenName = await token.name()
  const tokenSymbol = await token.symbol()
  const tokenDecimals = await token.decimals()
  const tokenTotalSupply = await token.totalSupply()
  const tokenMaxSupply = await token.MAX_SUPPLY()

  console.log("🪙 Token Details:")
  console.log("   Name:", tokenName)
  console.log("   Symbol:", tokenSymbol)
  console.log("   Decimals:", tokenDecimals.toString())
  console.log("   Initial Supply:", ethers.utils.formatEther(tokenTotalSupply))
  console.log("   Max Supply:", ethers.utils.formatEther(tokenMaxSupply))
  console.log("")

  // Step 2: Deploy Lottery Contract
  console.log("📝 Step 2: Deploying LuckyMotors Lottery...")
  const LuckyMotorsLottery = await ethers.getContractFactory("LuckyMotorsLottery")

  const lotteryEstimatedGas = await ethers.provider.estimateGas({
    data: LuckyMotorsLottery.interface.encodeDeploy([token.address]),
  })

  console.log("⛽ Lottery estimated gas:", lotteryEstimatedGas.toString())

  const lottery = await LuckyMotorsLottery.deploy(token.address, {
    gasLimit: lotteryEstimatedGas.mul(120).div(100),
  })

  await lottery.deployed()
  console.log("✅ Lottery deployed to:", lottery.address)
  console.log("📝 Lottery transaction hash:", lottery.deployTransaction.hash)

  // Wait for confirmations
  console.log("⏳ Waiting for lottery confirmations...")
  await lottery.deployTransaction.wait(3)

  // Step 3: Configure Token Permissions
  console.log("📝 Step 3: Configuring token permissions...")
  const addMinterTx = await token.addMinter(lottery.address)
  await addMinterTx.wait(2)
  console.log("✅ Lottery added as authorized minter")

  // Step 4: Verify Contracts
  console.log("📝 Step 4: Verifying contracts on block explorer...")

  try {
    console.log("🔍 Verifying Token contract...")
    await hre.run("verify:verify", {
      address: token.address,
      constructorArguments: [],
    })
    console.log("✅ Token contract verified!")
  } catch (error) {
    console.log("❌ Token verification failed:", error.message)
  }

  try {
    console.log("🔍 Verifying Lottery contract...")
    await hre.run("verify:verify", {
      address: lottery.address,
      constructorArguments: [token.address],
    })
    console.log("✅ Lottery contract verified!")
  } catch (error) {
    console.log("❌ Lottery verification failed:", error.message)
  }

  // Step 5: Test Basic Functionality
  console.log("📝 Step 5: Testing basic functionality...")

  const currentRound = await lottery.getCurrentRound()
  const isOpen = await lottery.isCurrentRoundOpen()
  const ticketPrice = await lottery.TICKET_PRICE()
  const maxTickets = await lottery.MAX_TICKETS_PER_ROUND()
  const minTickets = await lottery.MIN_TICKETS_FOR_DRAW()

  console.log("🎰 Lottery Status:")
  console.log("   Current Round ID:", currentRound.roundId.toString())
  console.log("   Round Open:", isOpen)
  console.log("   Ticket Price:", ethers.utils.formatEther(ticketPrice), "ETH")
  console.log("   Max Tickets:", maxTickets.toString())
  console.log("   Min Tickets for Draw:", minTickets.toString())
  console.log("   Current Prize Pool:", ethers.utils.formatEther(currentRound.prizePool), "ETH")
  console.log("   Tickets Sold:", currentRound.totalTickets.toString())

  // Final Summary
  console.log("")
  console.log("🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!")
  console.log("=====================================")
  console.log("📋 Contract Addresses:")
  console.log("   Token (LMT):", token.address)
  console.log("   Lottery:", lottery.address)
  console.log("")
  console.log("🔗 Block Explorer Links:")
  console.log("   Token:", `https://sepolia-blockscout.lisk.com/address/${token.address}`)
  console.log("   Lottery:", `https://sepolia-blockscout.lisk.com/address/${lottery.address}`)
  console.log("")
  console.log("⚙️ Configuration:")
  console.log("   Network: Lisk Sepolia Testnet")
  console.log("   Chain ID: 4202")
  console.log("   RPC URL: https://rpc.sepolia-api.lisk.com")
  console.log("   Deployer:", deployer.address)
  console.log("   Gas Used: ~", tokenEstimatedGas.add(lotteryEstimatedGas).toString())
  console.log("")
  console.log("📝 Next Steps:")
  console.log("1. Update your frontend with these contract addresses")
  console.log("2. Add Lisk Sepolia network to your wallet")
  console.log("3. Get testnet ETH from a faucet")
  console.log("4. Test buying tickets")
  console.log("5. Test the lottery draw functionality")
  console.log("")
  console.log("🎯 Ready to start your lottery!")

  return {
    token: {
      address: token.address,
      name: tokenName,
      symbol: tokenSymbol,
      decimals: tokenDecimals.toString(),
      initialSupply: ethers.utils.formatEther(tokenTotalSupply),
      maxSupply: ethers.utils.formatEther(tokenMaxSupply),
    },
    lottery: {
      address: lottery.address,
      ticketPrice: ethers.utils.formatEther(ticketPrice),
      maxTickets: maxTickets.toString(),
      minTickets: minTickets.toString(),
      currentRound: currentRound.roundId.toString(),
    },
    network: {
      name: network.name,
      chainId: network.chainId,
      rpcUrl: "https://rpc.sepolia-api.lisk.com",
      explorer: "https://sepolia-blockscout.lisk.com",
    },
  }
}

main()
  .then((result) => {
    console.log("🎊 Deployment data saved!")
    console.log(JSON.stringify(result, null, 2))
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Deployment failed:", error)
    process.exit(1)
  })
