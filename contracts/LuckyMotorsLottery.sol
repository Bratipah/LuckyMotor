// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./LuckyMotorsToken.sol";

/**
 * @title LuckyMotorsLottery
 * @dev A decentralized lottery system with token rewards and multiple prize tiers
 * Uses block-based randomness for winner selection on Lisk L2
 * @author LuckyMotors Team
 */
contract LuckyMotorsLottery is Ownable, ReentrancyGuard, Pausable {
    LuckyMotorsToken public immutable lmtToken;
    
    // Lottery Configuration
    uint256 public constant TICKET_PRICE = 0.01 ether;
    uint256 public constant MAX_TICKETS_PER_ROUND = 1000;
    uint256 public constant MIN_TICKETS_FOR_DRAW = 3; // Minimum tickets needed for a draw
    
    // Prize Distribution (in percentage)
    uint256 public constant FIRST_PRIZE_PERCENTAGE = 50;  // 50% of prize pool
    uint256 public constant SECOND_PRIZE_PERCENTAGE = 30; // 30% of prize pool
    uint256 public constant THIRD_PRIZE_PERCENTAGE = 15;  // 15% of prize pool
    
    // Token pricing (1 LMT = 0.001 ETH for ticket purchases)
    uint256 public constant TOKEN_TO_ETH_RATE = 1000; // 1000 LMT = 1 ETH
    
    // Randomness configuration
    uint256 public constant RANDOMNESS_DELAY_BLOCKS = 3; // Wait 3 blocks for randomness
    
    enum LotteryState {
        OPEN,
        CLOSED,
        DRAWING,
        COMPLETED
    }

    struct LotteryRound {
        uint256 roundId;
        uint256 startTime;
        uint256 endTime;
        uint256 prizePool;
        uint256 totalTickets;
        address[] players;
        address firstPrizeWinner;
        address secondPrizeWinner;
        address thirdPrizeWinner;
        uint256 firstPrizeAmount;
        uint256 secondPrizeAmount;
        uint256 thirdPrizeAmount;
        LotteryState state;
        bool prizesDistributed;
        uint256 randomnessRequestBlock;
    }

    struct PlayerStats {
        uint256 totalTicketsBought;
        uint256 totalAmountSpent;
        uint256 totalTokensEarned;
        uint256 totalPrizesWon;
        uint256 roundsParticipated;
    }

    // State Variables
    uint256 public currentRoundId;
    uint256 public totalRounds;
    uint256 public houseFunds;
    mapping(uint256 => LotteryRound) public lotteryRounds;
    mapping(address => PlayerStats) public playerStats;
    mapping(uint256 => mapping(address => uint256)) public playerTicketsPerRound;
    
    // Events
    event RoundStarted(uint256 indexed roundId, uint256 startTime);
    event TicketsPurchased(address indexed player, uint256 indexed roundId, uint256 ticketCount, uint256 totalCost);
    event TicketsPurchasedWithTokens(address indexed player, uint256 indexed roundId, uint256 ticketCount, uint256 tokenCost);
    event TokensRewarded(address indexed player, uint256 amount);
    event RoundClosed(uint256 indexed roundId, uint256 totalTickets, uint256 prizePool);
    event RandomnessRequested(uint256 indexed roundId, uint256 requestBlock);
    event WinnersSelected(uint256 indexed roundId, address firstWinner, address secondWinner, address thirdWinner);
    event PrizesDistributed(uint256 indexed roundId, uint256 firstPrize, uint256 secondPrize, uint256 thirdPrize);
    event HouseFundsWithdrawn(uint256 amount);

    // Custom Errors
    error LotteryNotOpen();
    error LotteryNotClosed();
    error InsufficientPayment();
    error MaxTicketsExceeded();
    error NoTicketsSold();
    error RandomnessNotReady();
    error PrizesAlreadyDistributed();
    error InsufficientTokens();
    error TransferFailed();
    error ZeroTickets();
    error MinTicketsNotReached();

    constructor(address _tokenAddress) {
        lmtToken = LuckyMotorsToken(_tokenAddress);
        _startNewRound();
    }
    
    /**
     * @dev Purchase lottery tickets with ETH for the current round
     * @param ticketCount Number of tickets to purchase
     */
    function buyTickets(uint256 ticketCount) external payable nonReentrant whenNotPaused {
        if (ticketCount == 0) revert ZeroTickets();
        
        LotteryRound storage round = lotteryRounds[currentRoundId];
        if (round.state != LotteryState.OPEN) revert LotteryNotOpen();
        
        uint256 totalCost = TICKET_PRICE * ticketCount;
        if (msg.value < totalCost) revert InsufficientPayment();
        
        if (round.totalTickets + ticketCount > MAX_TICKETS_PER_ROUND) revert MaxTicketsExceeded();
        
        // Add tickets to the current round
        for (uint256 i = 0; i < ticketCount; i++) {
            round.players.push(msg.sender);
        }
        
        round.totalTickets += ticketCount;
        round.prizePool += totalCost;
        
        // Update player stats
        playerTicketsPerRound[currentRoundId][msg.sender] += ticketCount;
        PlayerStats storage stats = playerStats[msg.sender];
        stats.totalTicketsBought += ticketCount;
        stats.totalAmountSpent += totalCost;
        if (playerTicketsPerRound[currentRoundId][msg.sender] == ticketCount) {
            stats.roundsParticipated++;
        }
        
        // Reward tokens (50% of ticket price in token value)
        uint256 tokenReward = (totalCost * 50 * 1000) / (100 * 1 ether) * 1 ether;
        lmtToken.mint(msg.sender, tokenReward);
        stats.totalTokensEarned += tokenReward;
        
        // Refund excess payment
        if (msg.value > totalCost) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - totalCost}("");
            if (!success) revert TransferFailed();
        }
        
        emit TicketsPurchased(msg.sender, currentRoundId, ticketCount, totalCost);
        emit TokensRewarded(msg.sender, tokenReward);
        
        // Auto-end round if max tickets reached
        if (round.totalTickets >= MAX_TICKETS_PER_ROUND) {
            _closeCurrentRound();
        }
    }

    /**
     * @dev Purchase lottery tickets with LMT tokens
     * @param ticketCount Number of tickets to purchase
     */
    function buyTicketsWithTokens(uint256 ticketCount) external nonReentrant whenNotPaused {
        if (ticketCount == 0) revert ZeroTickets();
        
        LotteryRound storage round = lotteryRounds[currentRoundId];
        if (round.state != LotteryState.OPEN) revert LotteryNotOpen();
        
        if (round.totalTickets + ticketCount > MAX_TICKETS_PER_ROUND) revert MaxTicketsExceeded();
        
        uint256 ethCost = TICKET_PRICE * ticketCount;
        uint256 tokenCost = ethCost * TOKEN_TO_ETH_RATE / 1 ether;
        
        if (lmtToken.balanceOf(msg.sender) < tokenCost) revert InsufficientTokens();
        
        // Burn tokens for ticket purchase
        if (!lmtToken.transferFrom(msg.sender, address(this), tokenCost)) {
            revert TokenTransferFailed();
        }
        lmtToken.burn(tokenCost);

        // Add tickets to the current round
        for (uint256 i = 0; i < ticketCount; i++) {
            round.players.push(msg.sender);
        }
        
        round.totalTickets += ticketCount;
        round.prizePool += ethCost;
        
        // Update player stats
        playerTicketsPerRound[currentRoundId][msg.sender] += ticketCount;
        PlayerStats storage stats = playerStats[msg.sender];
        stats.totalTicketsBought += ticketCount;
        stats.totalAmountSpent += ethCost;
        if (playerTicketsPerRound[currentRoundId][msg.sender] == ticketCount) {
            stats.roundsParticipated++;
        }

        emit TicketsPurchasedWithTokens(msg.sender, currentRoundId, ticketCount, tokenCost);
        
        // Auto-end round if max tickets reached
        if (round.totalTickets >= MAX_TICKETS_PER_ROUND) {
            _closeCurrentRound();
        }
    }

    /**
     * @dev Manually end the current lottery round (only owner)
     */
    function closeCurrentRound() external onlyOwner {
        _closeCurrentRound();
    }

    /**
     * @dev Internal function to end the current lottery round
     */
    function _closeCurrentRound() internal {
        LotteryRound storage round = lotteryRounds[currentRoundId];
        
        if (round.state != LotteryState.OPEN) {
            revert LotteryNotOpen();
        }
        
        if (round.totalTickets == 0) {
            revert NoTicketsSold();
        }

        if (round.totalTickets < MIN_TICKETS_FOR_DRAW) {
            revert MinTicketsNotReached();
        }

        round.state = LotteryState.CLOSED;
        round.endTime = block.timestamp;
        round.randomnessRequestBlock = block.number;

        emit RoundClosed(currentRoundId, round.totalTickets, round.prizePool);
        emit RandomnessRequested(currentRoundId, block.number);
    }

    /**
     * @dev Fulfill randomness and select winners (can be called by anyone after delay)
     * @param roundId The round ID to process
     */
    function fulfillRandomness(uint256 roundId) external nonReentrant {
        LotteryRound storage round = lotteryRounds[roundId];
        
        if (round.state != LotteryState.CLOSED) {
            revert LotteryNotClosed();
        }
        
        if (block.number < round.randomnessRequestBlock + RANDOMNESS_DELAY_BLOCKS) {
            revert RandomnessNotReady();
        }
        
        round.state = LotteryState.DRAWING;
        
        // Generate randomness using block properties
        uint256 randomNumber = _generateRandomness(roundId, round.randomnessRequestBlock + RANDOMNESS_DELAY_BLOCKS);
        
        // Select winners
        _selectWinners(roundId, randomNumber);
        
        round.state = LotteryState.COMPLETED;
        
        // Start new round
        _startNewRound();
    }
    
    /**
     * @dev Generate randomness using block properties
     */
    function _generateRandomness(uint256 roundId, uint256 targetBlock) internal view returns (uint256) {
        bytes32 blockHash = blockhash(targetBlock);
        
        // If blockhash is not available (>256 blocks old), use current block properties
        if (blockHash == bytes32(0)) {
            return uint256(keccak256(abi.encodePacked(
                block.timestamp,
                block.difficulty,
                block.coinbase,
                roundId,
                msg.sender
            )));
        }
        
        return uint256(keccak256(abi.encodePacked(
            blockHash,
            block.timestamp,
            roundId
        )));
    }
    
    /**
     * @dev Select winners for a lottery round
     */
    function _selectWinners(uint256 roundId, uint256 randomNumber) internal {
        LotteryRound storage round = lotteryRounds[roundId];
        
        if (round.totalTickets == 0) {
            revert NoTicketsSold();
        }

        // Calculate prize amounts
        uint256 totalPrizePool = round.prizePool;
        uint256 houseFee = (totalPrizePool * 5) / 100;
        uint256 distributablePrizes = totalPrizePool - houseFee;
        
        round.firstPrizeAmount = (distributablePrizes * 50) / 100;
        round.secondPrizeAmount = (distributablePrizes * 30) / 100;
        round.thirdPrizeAmount = (distributablePrizes * 15) / 100;
        
        houseFunds += houseFee;
        
        // Select winners using different parts of the random number
        uint256 firstIndex = randomNumber % round.totalTickets;
        round.firstPrizeWinner = round.players[firstIndex];
        
        if (round.totalTickets > 1) {
            uint256 secondIndex = (randomNumber / round.totalTickets) % round.totalTickets;
            // Ensure different winner
            if (secondIndex == firstIndex && round.totalTickets > 1) {
                secondIndex = (secondIndex + 1) % round.totalTickets;
            }
            round.secondPrizeWinner = round.players[secondIndex];
        }
        
        if (round.totalTickets > 2) {
            uint256 thirdIndex = (randomNumber / (round.totalTickets * round.totalTickets)) % round.totalTickets;
            // Ensure different winner
            while ((thirdIndex == firstIndex || thirdIndex == (randomNumber / round.totalTickets) % round.totalTickets) && round.totalTickets > 2) {
                thirdIndex = (thirdIndex + 1) % round.totalTickets;
            }
            round.thirdPrizeWinner = round.players[thirdIndex];
        }
        
        emit WinnersSelected(roundId, round.firstPrizeWinner, round.secondPrizeWinner, round.thirdPrizeWinner);
        
        // Distribute prizes
        _distributePrizes(roundId);
    }
    
    /**
     * @dev Distribute prizes to winners
     */
    function _distributePrizes(uint256 roundId) internal {
        LotteryRound storage round = lotteryRounds[roundId];
        if (round.prizesDistributed) {
            revert PrizesAlreadyDistributed();
        }

        // Distribute first prize
        if (round.firstPrizeWinner != address(0) && round.firstPrizeAmount > 0) {
            (bool success, ) = payable(round.firstPrizeWinner).call{value: round.firstPrizeAmount}("");
            if (success) {
                playerStats[round.firstPrizeWinner].totalPrizesWon += round.firstPrizeAmount;
            }
        }
        
        // Distribute second prize
        if (round.secondPrizeWinner != address(0) && round.secondPrizeAmount > 0) {
            (bool success, ) = payable(round.secondPrizeWinner).call{value: round.secondPrizeAmount}("");
            if (success) {
                playerStats[round.secondPrizeWinner].totalPrizesWon += round.secondPrizeAmount;
            }
        }
        
        // Distribute third prize
        if (round.thirdPrizeWinner != address(0) && round.thirdPrizeAmount > 0) {
            (bool success, ) = payable(round.thirdPrizeWinner).call{value: round.thirdPrizeAmount}("");
            if (success) {
                playerStats[round.thirdPrizeWinner].totalPrizesWon += round.thirdPrizeAmount;
            }
        }

        round.prizesDistributed = true;
        
        emit PrizesDistributed(roundId, round.firstPrizeAmount, round.secondPrizeAmount, round.thirdPrizeAmount);
    }

    /**
     * @dev Start a new lottery round
     */
    function _startNewRound() internal {
        currentRoundId++;
        totalRounds++;
        
        LotteryRound storage newRound = lotteryRounds[currentRoundId];
        newRound.roundId = currentRoundId;
        newRound.startTime = block.timestamp;
        newRound.state = LotteryState.OPEN;

        emit RoundStarted(currentRoundId, block.timestamp);
    }

    /**
     * @dev Withdraw house funds (only owner)
     */
    function withdrawHouseFunds() external onlyOwner nonReentrant {
        uint256 amount = houseFunds;
        houseFunds = 0;
        
        (bool success, ) = payable(owner()).call{value: amount}("");
        if (!success) {
            revert TransferFailed();
        }
        
        emit HouseFundsWithdrawn(amount);
    }

    /**
     * @dev Emergency pause function
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // View Functions

    /**
     * @dev Get current lottery round information
     */
    function getCurrentRound() external view returns (LotteryRound memory) {
        return lotteryRounds[currentRoundId];
    }

    /**
     * @dev Get lottery round by ID
     */
    function getRound(uint256 roundId) external view returns (LotteryRound memory) {
        return lotteryRounds[roundId];
    }

    /**
     * @dev Get player statistics
     */
    function getPlayerStats(address player) external view returns (PlayerStats memory) {
        return playerStats[player];
    }

    /**
     * @dev Get player's tickets for a specific round
     */
    function getPlayerTicketsForRound(uint256 roundId, address player) external view returns (uint256) {
        return playerTicketsPerRound[roundId][player];
    }

    /**
     * @dev Check if current round is open for ticket purchases
     */
    function isCurrentRoundOpen() external view returns (bool) {
        return lotteryRounds[currentRoundId].state == LotteryState.OPEN;
    }

    /**
     * @dev Get current prize pool
     */
    function getCurrentPrizePool() external view returns (uint256) {
        return lotteryRounds[currentRoundId].prizePool;
    }

    /**
     * @dev Check if randomness can be fulfilled for a round
     */
    function canFulfillRandomness(uint256 roundId) external view returns (bool) {
        LotteryRound storage round = lotteryRounds[roundId];
        return round.state == LotteryState.CLOSED && 
               block.number >= round.randomnessRequestBlock + RANDOMNESS_DELAY_BLOCKS;
    }
}
