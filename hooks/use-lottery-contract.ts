"use client"

import { useState, useEffect } from "react"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { parseEther } from "viem"

const LOTTERY_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_LOTTERY_ADDRESS ||
  "0x1EDe53CceaD3956Ee09f81A98F9635257343E870") as `0x${string}`
const TOKEN_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_TOKEN_ADDRESS ||
  "0x19BeF5c0D78015891e83DD0541c9Fa324A6c9A07") as `0x${string}`

const LOTTERY_ABI = [
  {
    name: "buyTicketsWithETH",
    type: "function",
    inputs: [{ name: "quantity", type: "uint256" }],
    outputs: [],
    stateMutability: "payable",
  },
  {
    name: "buyTicketsWithTokens",
    type: "function",
    inputs: [{ name: "quantity", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "ticketPriceETH",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "ticketPriceTokens",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "currentRound",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "getUserTickets",
    type: "function",
    inputs: [
      { name: "user", type: "address" },
      { name: "round", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
  },
  {
    name: "getTotalTicketsSold",
    type: "function",
    inputs: [{ name: "round", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "endRound",
    type: "function",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "startNewRound",
    type: "function",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const

const TOKEN_ABI = [
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "approve",
    type: "function",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    name: "allowance",
    type: "function",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "totalSupply",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const

export function useLotteryContract() {
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { writeContract, data: hash, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const { data: contractTicketPriceETH } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: LOTTERY_ABI,
    functionName: "ticketPriceETH",
  })

  const { data: contractTicketPriceTokens } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: LOTTERY_ABI,
    functionName: "ticketPriceTokens",
  })

  const { data: contractCurrentRound } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: LOTTERY_ABI,
    functionName: "currentRound",
  })

  const { data: userTickets } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: LOTTERY_ABI,
    functionName: "getUserTickets",
    args: address && contractCurrentRound ? [address, contractCurrentRound] : undefined,
  })

  const { data: totalTicketsSold } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: LOTTERY_ABI,
    functionName: "getTotalTicketsSold",
    args: contractCurrentRound ? [contractCurrentRound] : undefined,
  })

  const buyTicketsWithETH = async (quantity: number) => {
    if (!address) {
      setError("Please connect your wallet")
      return
    }

    if (!contractTicketPriceETH) {
      setError("Unable to fetch ticket price")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const totalCost = BigInt(contractTicketPriceETH) * BigInt(quantity)

      await writeContract({
        address: LOTTERY_CONTRACT_ADDRESS,
        abi: LOTTERY_ABI,
        functionName: "buyTicketsWithETH",
        args: [BigInt(quantity)],
        value: totalCost,
      })
    } catch (err: any) {
      setError(err.message || "Transaction failed")
      console.error("Buy tickets error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const buyTicketsWithTokens = async (quantity: number) => {
    if (!address) {
      setError("Please connect your wallet")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      await writeContract({
        address: LOTTERY_CONTRACT_ADDRESS,
        abi: LOTTERY_ABI,
        functionName: "buyTicketsWithTokens",
        args: [BigInt(quantity)],
      })
    } catch (err: any) {
      setError(err.message || "Transaction failed")
      console.error("Buy tickets with tokens error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const endRound = async () => {
    if (!address) {
      setError("Please connect your wallet")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      await writeContract({
        address: LOTTERY_CONTRACT_ADDRESS,
        abi: LOTTERY_ABI,
        functionName: "endRound",
        args: [],
      })
    } catch (err: any) {
      setError(err.message || "Transaction failed")
      console.error("End round error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const startNewRound = async () => {
    if (!address) {
      setError("Please connect your wallet")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      await writeContract({
        address: LOTTERY_CONTRACT_ADDRESS,
        abi: LOTTERY_ABI,
        functionName: "startNewRound",
        args: [],
      })
    } catch (err: any) {
      setError(err.message || "Transaction failed")
      console.error("Start new round error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const getUserTicketCount = () => {
    if (!userTickets) return 0
    return Array.isArray(userTickets) ? userTickets.length : 0
  }

  const calculateWinChance = (userTicketCount: number) => {
    const totalSold = totalTicketsSold ? Number(totalTicketsSold) : 0
    if (totalSold === 0) return 0
    return (userTicketCount / totalSold) * 100
  }

  const getTicketNumbers = () => {
    if (!userTickets || !Array.isArray(userTickets)) return []
    return userTickets.map((ticket: any) => Number(ticket))
  }

  const getLotteryStats = () => ({
    currentRound: contractCurrentRound ? Number(contractCurrentRound) : 52,
    totalTicketsSold: totalTicketsSold ? Number(totalTicketsSold) : 0,
    prizePool: "$5,000", // This would come from contract in full implementation
    timeRemaining: "4d 12h 30m", // This would be calculated from contract data
    winner: null,
    isActive: true,
  })

  const getUserStats = () => ({
    totalTicketsPurchased: 24, // This would come from contract events
    totalSpent: "$24.00", // This would be calculated from user's transaction history
    tokensEarned: 1200, // This would come from token contract
    activeTickets: getUserTicketCount(),
    winChance: calculateWinChance(getUserTicketCount()),
  })

  // Mock transaction history
  const getTransactionHistory = () => [
    {
      id: "1",
      type: "ticket_purchase",
      amount: 5,
      cost: "$5.00",
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      status: "confirmed",
      hash: "0x1234...5678",
    },
    {
      id: "2",
      type: "token_reward",
      amount: 250,
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      status: "confirmed",
      hash: "0x1234...5678",
    },
    {
      id: "3",
      type: "ticket_purchase",
      amount: 2,
      cost: "$2.00",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      status: "confirmed",
      hash: "0x9876...5432",
    },
  ]

  useEffect(() => {
    if (isConfirmed) {
      setIsLoading(false)
      setError(null)
      // Refresh data or show success message
    }
  }, [isConfirmed])

  return {
    // Contract interaction functions
    buyTicketsWithETH,
    buyTicketsWithTokens,
    endRound,
    startNewRound,

    // Contract data - using actual values where available
    ticketPriceETH: contractTicketPriceETH ? (Number(contractTicketPriceETH) / 1e18).toString() : "0.0005",
    ticketPriceTokens: contractTicketPriceTokens ? Number(contractTicketPriceTokens).toString() : "100",
    currentRound: contractCurrentRound ? Number(contractCurrentRound) : 52,
    totalTicketsSold: totalTicketsSold ? Number(totalTicketsSold) : 0,

    // User data
    userTickets: getTicketNumbers(),
    userTicketCount: getUserTicketCount(),

    // Utility functions
    calculateWinChance,
    getLotteryStats,
    getUserStats,
    getTransactionHistory,

    // State
    isLoading: isLoading || isPending || isConfirming,
    error,
    isConfirmed,

    // Contract address for external use
    contractAddress: LOTTERY_CONTRACT_ADDRESS,
    tokenAddress: TOKEN_CONTRACT_ADDRESS,
  }
}

export function useTokenContract() {
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { writeContract, data: hash, isPending } = useWriteContract()

  const { data: tokenBalance } = useReadContract({
    address: TOKEN_CONTRACT_ADDRESS,
    abi: TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  })

  const { data: totalSupply } = useReadContract({
    address: TOKEN_CONTRACT_ADDRESS,
    abi: TOKEN_ABI,
    functionName: "totalSupply",
  })

  const approveTokens = async (spender: string, amount: string) => {
    if (!address) {
      setError("Please connect your wallet")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      await writeContract({
        address: TOKEN_CONTRACT_ADDRESS,
        abi: TOKEN_ABI,
        functionName: "approve",
        args: [spender as `0x${string}`, parseEther(amount)],
      })
    } catch (err: any) {
      setError(err.message || "Approval failed")
    } finally {
      setIsLoading(false)
    }
  }

  const getTokenAllowance = async (owner: string, spender: string) => {
    // This would use useReadContract in a real implementation
    return "0"
  }

  return {
    tokenBalance: tokenBalance ? (Number(tokenBalance) / 1e18).toString() : "0",
    tokenSymbol: "LMET",
    tokenDecimals: 18,
    totalSupply: totalSupply ? (Number(totalSupply) / 1e18).toString() : "1000000",
    approveTokens,
    getTokenAllowance,
    isLoading: isLoading || isPending,
    error,
  }
}

// Hook for staking operations
export function useStakingContract() {
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock staking data
  const stakedAmount = "500"
  const rewardsEarned = "47"
  const apy = 12.5
  const poolShare = 0.05

  const stake = async (amount: string) => {
    if (!address) {
      setError("Please connect your wallet")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Mock staking - replace with actual contract call
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (err: any) {
      setError(err.message || "Staking failed")
    } finally {
      setIsLoading(false)
    }
  }

  const unstake = async (amount: string) => {
    if (!address) {
      setError("Please connect your wallet")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Mock unstaking - replace with actual contract call
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (err: any) {
      setError(err.message || "Unstaking failed")
    } finally {
      setIsLoading(false)
    }
  }

  const claimRewards = async () => {
    if (!address) {
      setError("Please connect your wallet")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Mock claiming - replace with actual contract call
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (err: any) {
      setError(err.message || "Claiming failed")
    } finally {
      setIsLoading(false)
    }
  }

  return {
    stakedAmount,
    rewardsEarned,
    apy,
    poolShare,
    stake,
    unstake,
    claimRewards,
    isLoading,
    error,
  }
}
