// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./LuckyMotorsToken.sol";

/**
 * @title LuckyMotorsLottery
 * @dev A decentralized lottery system with token rewards and multiple prize tiers
 * @author LuckyMotors Team
 */
contract LuckyMotorsLottery is VRFConsumerBaseV2, ConfirmedOwner, ReentrancyGuard, Pausable {
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    LuckyMotorsToken public immutable lmtToken;
    
    // Chainlink VRF Configuration
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    // Lottery Configuration
    uint256 public constant TICKET_PRICE = 0.01 ether;
    uint256 public constant MAX_TICKETS_PER_ROUND = 1000;
    uint256 public constant HOUSE_FEE_PERCENTAGE = 5; // 5% house fee
    uint256 public constant TOKEN_REWARD_RATE = 50; // 50% of ticket price in tokens (0.005 ETH worth)
    
    // Prize Distribution (in percentage)
    uint256 public constant FIRST_PRIZE_PERCENTAGE = 50;  // 50% of prize pool
    uint256 public constant SECOND_PRIZE_PERCENTAGE = 30; // 30% of prize pool
    uint256 public constant THIRD_PRIZE_PERCENTAGE = 15;  // 15% of prize pool
    
    // Token pricing (1 LMT = 0.001 ETH for ticket purchases)
    uint256 public constant TOKEN_TO_ETH_RATE = 1000; // 1000 LMT = 1 ETH
    
    enum LotteryState {
        OPEN,
        CALCULATING,
        CLOSED
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
    }

    struct PlayerStats {
        uint256 totalTicketsPurchased;
        uint256 totalTokensEarned;
        uint256 totalEthSpent;
        uint256 totalTokensSpent;
        uint256[] participatedRounds;
    }

    // State Variables
    uint256 public currentRoundId;
    mapping(uint256 => LotteryRound) public lotteryRounds;
    mapping(uint256 => uint256) private vrfRequestToRoundId;
    mapping(address => uint256[]) public playerTickets; // player => roundIds
    mapping(uint256 => mapping(address => uint256)) public ticketsPerPlayerPerRound;
    mapping(address => PlayerStats) public playerStats;
    
    uint256 public houseFunds;
    uint256 public totalRoundsCompleted;
    uint256 public totalTokensDistributed;

    // Events
    event LotteryRoundStarted(uint256 indexed roundId, uint256 startTime);
    event TicketPurchased(uint256 indexed roundId, address indexed player, uint256 ticketCount, bool paidWithTokens);
    event TokensRewarded(address indexed player, uint256 amount);
    event LotteryRoundEnded(uint256 indexed roundId, uint256 endTime);
    event WinnersSelected(
        uint256 indexed roundId,
        address indexed firstPrize,
        address indexed secondPrize,
        address thirdPrize
    );
    event PrizesDistributed(
        uint256 indexed roundId,
        uint256 firstPrizeAmount,
        uint256 secondPrizeAmount,
        uint256 thirdPrizeAmount
    );
    event HouseFundsWithdrawn(uint256 amount);

    // Custom Errors
    error LotteryNotOpen();
    error InsufficientPayment();
    error InsufficientTokens();
    error MaxTicketsExceeded();
    error NoTicketsSold();
    error PrizesAlreadyDistributed();
    error WithdrawalFailed();
    error InvalidRoundId();
    error TokenTransferFailed();

    constructor(
        uint64 subscriptionId,
        address vrfCoordinatorV2,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        address _lmtToken
    ) VRFConsumerBaseV2(vrfCoordinatorV2) ConfirmedOwner(msg.sender) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        lmtToken = LuckyMotorsToken(_lmtToken);
        
        // Start the first lottery round
        _startNewRound();
    }

    /**
     * @dev Purchase lottery tickets with ETH for the current round
     * @param ticketCount Number of tickets to purchase
     */
    function buyTickets(uint256 ticketCount) external payable nonReentrant whenNotPaused {
        LotteryRound storage currentRound = lotteryRounds[currentRoundId];
        
        if (currentRound.state != LotteryState.OPEN) {
            revert LotteryNotOpen();
        }
        
        uint256 totalCost = TICKET_PRICE * ticketCount;
        if (msg.value < totalCost) {
            revert InsufficientPayment();
        }
        
        if (currentRound.totalTickets + ticketCount > MAX_TICKETS_PER_ROUND) {
            revert MaxTicketsExceeded();
        }

        _processPurchase(ticketCount, totalCost, false);

        // Refund excess payment
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }

        // Reward tokens (50% of ticket price in token value)
        uint256 tokenReward = (totalCost * TOKEN_REWARD_RATE * TOKEN_TO_ETH_RATE) / (100 * 1 ether) * 1 ether;
        lmtToken.mint(msg.sender, tokenReward);
        
        // Update player stats
        playerStats[msg.sender].totalTokensEarned += tokenReward;
        playerStats[msg.sender].totalEthSpent += totalCost;
        totalTokensDistributed += tokenReward;

        emit TokensRewarded(msg.sender, tokenReward);
        emit TicketPurchased(currentRoundId, msg.sender, ticketCount, false);
    }

    /**
     * @dev Purchase lottery tickets with LMT tokens
     * @param ticketCount Number of tickets to purchase
     */
    function buyTicketsWithTokens(uint256 ticketCount) external nonReentrant whenNotPaused {
        LotteryRound storage currentRound = lotteryRounds[currentRoundId];
        
        if (currentRound.state != LotteryState.OPEN) {
            revert LotteryNotOpen();
        }
        
        if (currentRound.totalTickets + ticketCount > MAX_TICKETS_PER_ROUND) {
            revert MaxTicketsExceeded();
        }

        uint256 totalCost = TICKET_PRICE * ticketCount;
        uint256 tokenCost = totalCost * TOKEN_TO_ETH_RATE; // Convert ETH cost to token amount
        
        if (lmtToken.balanceOf(msg.sender) < tokenCost) {
            revert InsufficientTokens();
        }

        // Burn tokens for ticket purchase
        if (!lmtToken.transferFrom(msg.sender, address(this), tokenCost)) {
            revert TokenTransferFailed();
        }
        lmtToken.burn(tokenCost);

        _processPurchase(ticketCount, totalCost, true);

        // Update player stats
        playerStats[msg.sender].totalTokensSpent += tokenCost;

        emit TicketPurchased(currentRoundId, msg.sender, ticketCount, true);
    }

    /**
     * @dev Internal function to process ticket purchase
     */
    function _processPurchase(uint256 ticketCount, uint256 totalCost, bool paidWithTokens) internal {
        LotteryRound storage currentRound = lotteryRounds[currentRoundId];

        // Add tickets to the current round
        for (uint256 i = 0; i < ticketCount; i++) {
            currentRound.players.push(msg.sender);
        }
        
        currentRound.totalTickets += ticketCount;
        currentRound.prizePool += totalCost;
        ticketsPerPlayerPerRound[currentRoundId][msg.sender] += ticketCount;
        
        // Update player stats
        PlayerStats storage stats = playerStats[msg.sender];
        stats.totalTicketsPurchased += ticketCount;
        
        // Add round to player's participated rounds if first time
        bool alreadyParticipated = false;
        for (uint256 i = 0; i < stats.participatedRounds.length; i++) {
            if (stats.participatedRounds[i] == currentRoundId) {
                alreadyParticipated = true;
                break;
            }
        }
        if (!alreadyParticipated) {
            stats.participatedRounds.push(currentRoundId);
            playerTickets[msg.sender].push(currentRoundId);
        }

        // Auto-end round if max tickets reached
        if (currentRound.totalTickets >= MAX_TICKETS_PER_ROUND) {
            _endCurrentRound();
        }
    }

    /**
     * @dev Manually end the current lottery round (only owner)
     */
    function endCurrentRound() external onlyOwner {
        _endCurrentRound();
    }

    /**
     * @dev Internal function to end the current lottery round
     */
    function _endCurrentRound() internal {
        LotteryRound storage currentRound = lotteryRounds[currentRoundId];
        
        if (currentRound.state != LotteryState.OPEN) {
            revert LotteryNotOpen();
        }
        
        if (currentRound.totalTickets == 0) {
            revert NoTicketsSold();
        }

        currentRound.state = LotteryState.CALCULATING;
        currentRound.endTime = block.timestamp;

        // Request random number from Chainlink VRF
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        
        vrfRequestToRoundId[requestId] = currentRoundId;
        
        emit LotteryRoundEnded(currentRoundId, block.timestamp);
    }

    /**
     * @dev Callback function used by VRF Coordinator
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        uint256 roundId = vrfRequestToRoundId[requestId];
        LotteryRound storage round = lotteryRounds[roundId];
        
        if (round.totalTickets == 0) return;

        uint256 randomNumber = randomWords[0];
        
        // Select winners based on random number
        _selectWinners(roundId, randomNumber);
        
        // Distribute prizes
        _distributePrizes(roundId);
        
        // Start new round
        _startNewRound();
    }

    /**
     * @dev Select winners for a lottery round
     */
    function _selectWinners(uint256 roundId, uint256 randomNumber) internal {
        LotteryRound storage round = lotteryRounds[roundId];
        
        // Generate three different random indices for winners
        uint256 firstIndex = randomNumber % round.totalTickets;
        uint256 secondIndex = (randomNumber / round.totalTickets) % round.totalTickets;
        uint256 thirdIndex = (randomNumber / (round.totalTickets * round.totalTickets)) % round.totalTickets;
        
        // Ensure different winners (if possible)
        if (round.totalTickets > 1 && secondIndex == firstIndex) {
            secondIndex = (secondIndex + 1) % round.totalTickets;
        }
        if (round.totalTickets > 2 && (thirdIndex == firstIndex || thirdIndex == secondIndex)) {
            thirdIndex = (thirdIndex + 1) % round.totalTickets;
            if (thirdIndex == firstIndex || thirdIndex == secondIndex) {
                thirdIndex = (thirdIndex + 1) % round.totalTickets;
            }
        }

        round.firstPrizeWinner = round.players[firstIndex];
        round.secondPrizeWinner = round.players[secondIndex];
        round.thirdPrizeWinner = round.players[thirdIndex];

        emit WinnersSelected(
            roundId,
            round.firstPrizeWinner,
            round.secondPrizeWinner,
            round.thirdPrizeWinner
        );
    }

    /**
     * @dev Distribute prizes to winners
     */
    function _distributePrizes(uint256 roundId) internal {
        LotteryRound storage round = lotteryRounds[roundId];
        
        if (round.prizesDistributed) {
            revert PrizesAlreadyDistributed();
        }

        // Calculate house fee
        uint256 houseFee = (round.prizePool * HOUSE_FEE_PERCENTAGE) / 100;
        uint256 totalPrizePool = round.prizePool - houseFee;
        houseFunds += houseFee;

        // Calculate prize amounts
        round.firstPrizeAmount = (totalPrizePool * FIRST_PRIZE_PERCENTAGE) / 100;
        round.secondPrizeAmount = (totalPrizePool * SECOND_PRIZE_PERCENTAGE) / 100;
        round.thirdPrizeAmount = (totalPrizePool * THIRD_PRIZE_PERCENTAGE) / 100;

        // Distribute prizes
        if (round.firstPrizeAmount > 0) {
            payable(round.firstPrizeWinner).transfer(round.firstPrizeAmount);
        }
        if (round.secondPrizeAmount > 0) {
            payable(round.secondPrizeWinner).transfer(round.secondPrizeAmount);
        }
        if (round.thirdPrizeAmount > 0) {
            payable(round.thirdPrizeWinner).transfer(round.thirdPrizeAmount);
        }

        round.prizesDistributed = true;
        round.state = LotteryState.CLOSED;
        totalRoundsCompleted++;

        emit PrizesDistributed(
            roundId,
            round.firstPrizeAmount,
            round.secondPrizeAmount,
            round.thirdPrizeAmount
        );
    }

    /**
     * @dev Start a new lottery round
     */
    function _startNewRound() internal {
        currentRoundId++;
        LotteryRound storage newRound = lotteryRounds[currentRoundId];
        
        newRound.roundId = currentRoundId;
        newRound.startTime = block.timestamp;
        newRound.state = LotteryState.OPEN;

        emit LotteryRoundStarted(currentRoundId, block.timestamp);
    }

    /**
     * @dev Withdraw house funds (only owner)
     */
    function withdrawHouseFunds() external onlyOwner nonReentrant {
        uint256 amount = houseFunds;
        houseFunds = 0;
        
        (bool success, ) = payable(owner()).call{value: amount}("");
        if (!success) {
            revert WithdrawalFailed();
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
        if (roundId == 0 || roundId > currentRoundId) {
            revert InvalidRoundId();
        }
        return lotteryRounds[roundId];
    }

    /**
     * @dev Get player's tickets for a specific round
     */
    function getPlayerTicketsForRound(address player, uint256 roundId) external view returns (uint256) {
        return ticketsPerPlayerPerRound[roundId][player];
    }

    /**
     * @dev Get all rounds a player participated in
     */
    function getPlayerRounds(address player) external view returns (uint256[] memory) {
        return playerTickets[player];
    }

    /**
     * @dev Get player statistics
     */
    function getPlayerStats(address player) external view returns (PlayerStats memory) {
        return playerStats[player];
    }

    /**
     * @dev Get current prize pool
     */
    function getCurrentPrizePool() external view returns (uint256) {
        return lotteryRounds[currentRoundId].prizePool;
    }

    /**
     * @dev Get total tickets sold in current round
     */
    function getCurrentTicketsSold() external view returns (uint256) {
        return lotteryRounds[currentRoundId].totalTickets;
    }

    /**
     * @dev Check if current round is open for ticket purchases
     */
    function isCurrentRoundOpen() external view returns (bool) {
        return lotteryRounds[currentRoundId].state == LotteryState.OPEN;
    }

    /**
     * @dev Get token cost for tickets
     */
    function getTokenCostForTickets(uint256 ticketCount) external pure returns (uint256) {
        return TICKET_PRICE * ticketCount * TOKEN_TO_ETH_RATE;
    }

    /**
     * @dev Get token reward for tickets
     */
    function getTokenRewardForTickets(uint256 ticketCount) external pure returns (uint256) {
        uint256 totalCost = TICKET_PRICE * ticketCount;
        return (totalCost * TOKEN_REWARD_RATE * TOKEN_TO_ETH_RATE) / (100 * 1 ether) * 1 ether;
    }
}
