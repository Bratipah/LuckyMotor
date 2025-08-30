# LuckyMotors Lottery Smart Contract

## Overview

The LuckyMotors Lottery is a decentralized, transparent, and provably fair lottery system built on Ethereum. It uses Chainlink VRF (Verifiable Random Function) to ensure truly random winner selection, making it impossible for anyone (including the contract owner) to manipulate the results.

## Problem Statement

Traditional lottery operators' transparency issues, financial exclusion of 60%+ unbanked populations, high operational costs (40-60%), currency instability, and regulatory fragmentation.Existing operators like ITHUBA ($800M), Caixa Loterias ($2.8B), digital platforms like Betway (2M+ users), crypto gaming platforms, and mobile money systems (110M+ combined users) all lack blockchain transparency and cross-border accessibility. Detailed compliance costs ranging from $37K-$5.5M minimum capital across 6 target markets, totaling $20.2M over 5 years, with varying tax rates (35-65%), local ownership requirements (51-60%), and uncertain cryptocurrency regulations. LuckyMotors' unique positioning with Chainlink VRF transparency, financial inclusion, sustainable e-mobility prizes, 90% lower costs, and cross-border accessibility addresses gaps no existing competitor will be able solved across 2+ billion people in target regions.


## Solution 
LuckyMotors is a provable fair lottery platform using Chainlink VRF, addressing transparency, financial inclusion, and sustainability challenges in Africa and Latin America acrosss 730M people starting with 6 markets (Kenya, Colombia, Nigeria, Mexico, South Africa, Brazil) with 48M addressable users and $2.4B SAM.With such a target market of a $9B combined lottery market with 5% target market share ($120M SOM) by Year 5, driven by mobile penetration growth, crypto adoption, and financial inclusion needs will be sovled with LuckyMotors. After 5 years LuckyMotors estimates $25.5M over 5 years) with a success metric of 900% CAGR & >95% gross margin leading to impact goals of 1M+ unbanked users onboarded, 10K+ e-motorcycles distributed.

**Go-to-Market Strategy**:

- **Phase 1** (Year 1): Kenya & Colombia, 50K users, $6M revenue
- **Phase 2** (Years 2-3): Add Nigeria & Mexico, 500K users, $60M revenue
- **Phase 3** (Years 4-5): Add South Africa & Brazil, 2M users, $120M revenue



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

- **Standard**: ERC20 with Burnable, Pausable extensions
- **Provable Fairness**: On-chain verification ensures no manipulation of results
- **Gas Optimization**: Configurable gas limits for different network conditions
- **Supply**: 1M initial, 10M max supply
- **Features**: Authorized minting, deflationary burning
- **Access Control**: Owner-managed minter roles
- **Randomness**: Chainlink VRF v2 integration
- **Payment**: Dual system (ETH + LMT tokens)
- **Prizes**: 3-tier distribution (50%, 30%, 15%)
- **House Fee**: 5% of prize pool
- **Batch Operations**: Efficient ticket processing when in max numbers
- **Event Logging**: Off-chain data indexing
- **Prize Distribution**: Automated ETH transfers to winners

# LuckyMotor
