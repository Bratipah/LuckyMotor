"use client"

import { useState, useEffect } from "react"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { parseEther } from "viem"

const LOTTERY_CONTRACT_ADDRESS = "0x1EDe53CceaD3956Ee09f81A98F9635257343E870"
const TOKEN_CONTRACT_ADDRESS = "0x19BeF5c0D78015891e83DD0541c9Fa324A6c9A07"

// Mock ABI - replace with actual contract ABI
const LOTTERY_ABI = [
  {
    name: "buyTickets",
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
    name: "ticketPrice",
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
] as const

export function useLotteryContract() {
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock data - replace with actual contract reads
  const ticketPriceETH = "0.0005" // Mock price in ETH
  const ticketPriceTokens = "100" // Mock price in tokens
  const currentRound = 52
  const totalTicketsSold = 1247

  const { writeContract, data: hash, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Read contract data
  const { data: contractTicketPrice } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: LOTTERY_ABI,
    functionName: "ticketPrice",
  })

  const { data: userTickets } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: LOTTERY_ABI,
    functionName: "getUserTickets",
    args: address ? [address, BigInt(currentRound)] : undefined,
  })

  const buyTicketsWithETH = async (quantity: number) => {
    if (!address) {
      setError("Please connect your wallet")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const totalCost = parseEther((Number.parseFloat(ticketPriceETH) * quantity).toString())

      await writeContract({
        address: LOTTERY_CONTRACT_ADDRESS,
        abi: LOTTERY_ABI,
        functionName: "buyTickets",
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

  const getUserTicketCount = () => {
    if (!userTickets) return 0
    return Array.isArray(userTickets) ? userTickets.length : 0
  }

  const calculateWinChance = (userTicketCount: number) => {
    if (totalTicketsSold === 0) return 0
    return (userTicketCount / totalTicketsSold) * 100
  }

  const getTicketNumbers = () => {
    if (!userTickets || !Array.isArray(userTickets)) return []
    return userTickets.map((ticket: any) => Number(ticket))
  }

  // Mock lottery stats
  const getLotteryStats = () => ({
    currentRound,
    totalTicketsSold,
    prizePool: "$5,000",
    timeRemaining: "4d 12h 30m",
    winner: null,
    isActive: true,
  })

  // Mock user stats
  const getUserStats = () => ({
    totalTicketsPurchased: 24,
    totalSpent: "$24.00",
    tokensEarned: 1200,
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

    // Contract data
    ticketPriceETH,
    ticketPriceTokens,
    currentRound,
    totalTicketsSold,

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

// Hook for token operations
export function useTokenContract() {
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock token data
  const tokenBalance = "1247"
  const tokenSymbol = "LMET"
  const tokenDecimals = 18

  const { writeContract, data: hash, isPending } = useWriteContract()

  const approveTokens = async (spender: string, amount: string) => {
    if (!address) {
      setError("Please connect your wallet")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Mock approval - replace with actual token contract call
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (err: any) {
      setError(err.message || "Approval failed")
    } finally {
      setIsLoading(false)
    }
  }

  const getTokenAllowance = async (owner: string, spender: string) => {
    // Mock allowance check
    return "0"
  }

  return {
    tokenBalance,
    tokenSymbol,
    tokenDecimals,
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
