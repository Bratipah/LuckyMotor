# LuckyMotors Lottery Smart Contract

## Overview

The LuckyMotors Lottery is a decentralized, transparent, and provably fair lottery system built on Ethereum. It uses Chainlink VRF (Verifiable Random Function) to ensure truly random winner selection, making it impossible for anyone (including the contract owner) to manipulate the results.

## How It Works

### 1. Lottery Rounds
- Each lottery round allows up to 1,000 tickets to be sold
- Tickets cost 0.01 ETH each
- Players can buy multiple tickets to increase their chances
- Rounds automatically end when max tickets are sold or manually ended by owner

### 2. Prize Structure
The lottery features a three-tier prize system:
- **1st Prize**: 50% of the prize pool
- **2nd Prize**: 30% of the prize pool  
- **3rd Prize**: 15% of the prize pool
- **House Fee**: 5% goes to contract maintenance

### 3. Random Winner Selection
- Uses Chainlink VRF for provably fair randomness
- Three different winners are selected for each prize tier
- Winners are selected from all ticket holders (more tickets = higher chance)
- Results are verifiable on-chain

### 4. Automatic Prize Distribution
- Prizes are automatically distributed to winners
- Winners receive ETH directly to their wallets
- All transactions are transparent and verifiable

## Key Features

### Security
- **ReentrancyGuard**: Prevents reentrancy attacks
- **Pausable**: Emergency pause functionality
- **Access Control**: Owner-only functions for management
- **Input Validation**: Comprehensive checks on all inputs

### Transparency
- All lottery data stored on-chain
- Complete transaction history
- Verifiable random number generation
- Public view functions for all data

### Fairness
- Chainlink VRF ensures true randomness
- No possibility of manipulation
- Equal chances based on ticket ownership
- Automatic execution removes human bias

## Smart Contract Functions

### Public Functions

#### `buyTickets(uint256 ticketCount)`
Purchase lottery tickets for the current round.
- **Parameters**: Number of tickets to buy
- **Payment**: 0.01 ETH per ticket
- **Requirements**: Round must be open, sufficient payment

#### View Functions
- `getCurrentRound()`: Get current lottery round info
- `getRound(uint256 roundId)`: Get specific round info
- `getPlayerTicketsForRound(address, uint256)`: Get player's tickets for a round
- `getCurrentPrizePool()`: Get current prize pool amount
- `isCurrentRoundOpen()`: Check if current round accepts tickets

### Owner Functions

#### `endCurrentRound()`
Manually end the current lottery round and trigger winner selection.

#### `withdrawHouseFunds()`
Withdraw accumulated house fees.

#### `pause()` / `unpause()`
Emergency pause/unpause the contract.

## Technical Implementation

### Smart Contract 
LMT Token deployed in the contact address (0x8387c60314c3a630F1cAed28595ABE162a9C8740)[https://sepolia-blockscout.lisk.com/token/0x8387c60314c3a630F1cAed28595ABE162a9C8740]
Lottery Contract deployed in the contact address (0x1EDe53CceaD3956Ee09f81A98F9635257343E870)[https://sepolia-blockscout.lisk.com/address/0x1EDe53CceaD3956Ee09f81A98F9635257343E870]
