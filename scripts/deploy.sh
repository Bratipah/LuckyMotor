#!/bin/bash

# LuckyMotors Smart Contract Deployment Script
# Usage: ./scripts/deploy.sh [network]
# Example: ./scripts/deploy.sh liskSepolia

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default network
NETWORK=${1:-liskSepolia}

echo -e "${BLUE}🚀 LuckyMotors Smart Contract Deployment${NC}"
echo -e "${BLUE}=======================================${NC}"
echo -e "Network: ${YELLOW}$NETWORK${NC}"
echo -e "Timestamp: ${YELLOW}$(date)${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo -e "${YELLOW}Please copy .env.example to .env and configure your settings${NC}"
    exit 1
fi

# Load environment variables
source .env

# Check if private key is set
if [ -z "$PRIVATE_KEY" ] || [ "$PRIVATE_KEY" = "your_metamask_private_key_here" ]; then
    echo -e "${RED}❌ Error: PRIVATE_KEY not set in .env file${NC}"
    echo -e "${YELLOW}Please set your MetaMask private key in the .env file${NC}"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Compile contracts
echo -e "${YELLOW}🔨 Compiling contracts...${NC}"
npx hardhat compile

# Deploy contracts
echo -e "${YELLOW}🚀 Deploying contracts to $NETWORK...${NC}"
npx hardhat run scripts/deploy-all.js --network $NETWORK

echo -e "${GREEN}✅ Deployment completed!${NC}"
echo -e "${BLUE}Check the output above for contract addresses and block explorer links${NC}"
