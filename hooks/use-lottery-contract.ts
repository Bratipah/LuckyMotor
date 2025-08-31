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
    "inputs": [
      {
        "internalType": "address",
        "name": "_lmtToken",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "EnforcedPause",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ExpectedPause",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InsufficientPayment",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InsufficientTokens",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidRandomSeed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidRoundId",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "LotteryNotOpen",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MaxTicketsExceeded",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NoTicketsSold",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "PrizesAlreadyDistributed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "RandomSeedAlreadyRevealed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "RandomSeedNotCommitted",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "TokenTransferFailed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "WithdrawalFailed",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "HouseFundsWithdrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "roundId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "endTime",
        "type": "uint256"
      }
    ],
    "name": "LotteryRoundEnded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "roundId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "startTime",
        "type": "uint256"
      }
    ],
    "name": "LotteryRoundStarted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Paused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "roundId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "firstPrizeAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "secondPrizeAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "thirdPrizeAmount",
        "type": "uint256"
      }
    ],
    "name": "PrizesDistributed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "roundId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "commitment",
        "type": "bytes32"
      }
    ],
    "name": "RandomSeedCommitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "roundId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "randomSeed",
        "type": "bytes32"
      }
    ],
    "name": "RandomSeedRevealed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "roundId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "ticketCount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "paidWithTokens",
        "type": "bool"
      }
    ],
    "name": "TicketPurchased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "TokensRewarded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Unpaused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "roundId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "firstPrize",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "secondPrize",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "thirdPrize",
        "type": "address"
      }
    ],
    "name": "WinnersSelected",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "FIRST_PRIZE_PERCENTAGE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "HOUSE_FEE_PERCENTAGE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_TICKETS_PER_ROUND",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "SECOND_PRIZE_PERCENTAGE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "THIRD_PRIZE_PERCENTAGE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "TICKET_PRICE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "TOKEN_REWARD_RATE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "TOKEN_TO_ETH_RATE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "authorizeLotteryAsMinter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "ticketCount",
        "type": "uint256"
      }
    ],
    "name": "buyTickets",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "ticketCount",
        "type": "uint256"
      }
    ],
    "name": "buyTicketsWithTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "commitment",
        "type": "bytes32"
      }
    ],
    "name": "commitRandomSeed",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentRoundId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "endCurrentRound",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "randomSeed",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "salt",
        "type": "bytes32"
      }
    ],
    "name": "generateCommitment",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentPrizePool",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentRound",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "roundId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "startTime",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "endTime",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "prizePool",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalTickets",
            "type": "uint256"
          },
          {
            "internalType": "address[]",
            "name": "players",
            "type": "address[]"
          },
          {
            "internalType": "address",
            "name": "firstPrizeWinner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "secondPrizeWinner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "thirdPrizeWinner",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "firstPrizeAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "secondPrizeAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "thirdPrizeAmount",
            "type": "uint256"
          },
          {
            "internalType": "enum LuckyMotorsLottery.LotteryState",
            "name": "state",
            "type": "uint8"
          },
          {
            "internalType": "bool",
            "name": "prizesDistributed",
            "type": "bool"
          },
          {
            "internalType": "bytes32",
            "name": "randomSeed",
            "type": "bytes32"
          }
        ],
        "internalType": "struct LuckyMotorsLottery.LotteryRound",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentTicketsSold",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "getPlayerRounds",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "getPlayerStats",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "totalTicketsPurchased",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalTokensEarned",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalEthSpent",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalTokensSpent",
            "type": "uint256"
          },
          {
            "internalType": "uint256[]",
            "name": "participatedRounds",
            "type": "uint256[]"
          }
        ],
        "internalType": "struct LuckyMotorsLottery.PlayerStats",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "roundId",
        "type": "uint256"
      }
    ],
    "name": "getPlayerTicketsForRound",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "roundId",
        "type": "uint256"
      }
    ],
    "name": "getRound",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "roundId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "startTime",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "endTime",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "prizePool",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalTickets",
            "type": "uint256"
          },
          {
            "internalType": "address[]",
            "name": "players",
            "type": "address[]"
          },
          {
            "internalType": "address",
            "name": "firstPrizeWinner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "secondPrizeWinner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "thirdPrizeWinner",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "firstPrizeAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "secondPrizeAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "thirdPrizeAmount",
            "type": "uint256"
          },
          {
            "internalType": "enum LuckyMotorsLottery.LotteryState",
            "name": "state",
            "type": "uint8"
          },
          {
            "internalType": "bool",
            "name": "prizesDistributed",
            "type": "bool"
          },
          {
            "internalType": "bytes32",
            "name": "randomSeed",
            "type": "bytes32"
          }
        ],
        "internalType": "struct LuckyMotorsLottery.LotteryRound",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "ticketCount",
        "type": "uint256"
      }
    ],
    "name": "getTokenCostForTickets",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "ticketCount",
        "type": "uint256"
      }
    ],
    "name": "getTokenRewardForTickets",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "houseFunds",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isCurrentRoundOpen",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lmtToken",
    "outputs": [
      {
        "internalType": "contract LuckyMotorsToken",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "lotteryRounds",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "roundId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "startTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "endTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "prizePool",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalTickets",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "firstPrizeWinner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "secondPrizeWinner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "thirdPrizeWinner",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "firstPrizeAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "secondPrizeAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "thirdPrizeAmount",
        "type": "uint256"
      },
      {
        "internalType": "enum LuckyMotorsLottery.LotteryState",
        "name": "state",
        "type": "uint8"
      },
      {
        "internalType": "bool",
        "name": "prizesDistributed",
        "type": "bool"
      },
      {
        "internalType": "bytes32",
        "name": "randomSeed",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "playerStats",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "totalTicketsPurchased",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalTokensEarned",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalEthSpent",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalTokensSpent",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "playerTickets",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "removeLotteryAsMinter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "randomSeed",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "salt",
        "type": "bytes32"
      }
    ],
    "name": "revealRandomSeed",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "roundCommitments",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "roundRevealed",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "ticketsPerPlayerPerRound",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalRoundsCompleted",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalTokensDistributed",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unpause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawHouseFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

const TOKEN_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AccessControlBadConfirmation",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "neededRole",
        "type": "bytes32"
      }
    ],
    "name": "AccessControlUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "allowance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "needed",
        "type": "uint256"
      }
    ],
    "name": "ERC20InsufficientAllowance",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "needed",
        "type": "uint256"
      }
    ],
    "name": "ERC20InsufficientBalance",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "approver",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidApprover",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidReceiver",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidSender",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidSpender",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EnforcedPause",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ExpectedPause",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Paused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "previousAdminRole",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "newAdminRole",
        "type": "bytes32"
      }
    ],
    "name": "RoleAdminChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Unpaused",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "DEFAULT_ADMIN_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MINTER_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "addMinter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "burn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "burnFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      }
    ],
    "name": "getRoleAdmin",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "grantRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "hasRole",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "removeMinter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "callerConfirmation",
        "type": "address"
      }
    ],
    "name": "renounceRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "revokeRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
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
