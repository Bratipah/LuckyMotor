// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./LuckyMotorsEnsureToken.sol";

contract LuckyMotorsEnsureLottery is ReentrancyGuard, Pausable, Ownable {
    using Counters for Counters.Counter;
    
    LuckyMotorsEnsureToken public lmetToken;
    
    struct Ticket {
        address player;
        uint256 ticketNumber;
        uint256 purchaseTime;
        bool isActive;
    }
    
    struct Prize {
        string name;
        string description;
        uint256 value; // in USD
        string imageUrl;
        bool isActive;
    }
    
    struct LotteryRound {
        uint256 roundId;
        uint256 startTime;
        uint256 endTime;
        uint256 ticketPrice; // in USD (with 18 decimals)
        uint256 totalTickets;
        uint256 prizePool;
        address winner;
        bool isActive;
        bool isCompleted;
    }
    
    Counters.Counter private _ticketIds;
    Counters.Counter private _roundIds;
    
    mapping(uint256 => Ticket) public tickets;
    mapping(uint256 => LotteryRound) public lotteryRounds;
    mapping(address => uint256[]) public playerTickets;
    mapping(address => uint256) public playerStats;
    mapping(uint256 => Prize) public prizes;
    
    uint256 public currentRoundId;
    uint256 public ethToUsdRate = 2000 * 10**18; // $2000 per ETH (adjustable)
    uint256 public constant TICKET_PRICE_USD = 1 * 10**18; // $1 USD
    uint256 public constant TOKEN_REWARD_PERCENTAGE = 50; // 50% cashback
    
    event TicketPurchased(address indexed player, uint256 ticketId, uint256 roundId, string paymentMethod);
    event TokensRewarded(address indexed player, uint256 amount);
    event LotteryRoundStarted(uint256 roundId, uint256 startTime, uint256 endTime);
    event LotteryRoundEnded(uint256 roundId, address winner, uint256 prizeAmount);
    event EthRateUpdated(uint256 newRate);
    
    constructor(address _lmetToken) {
        lmetToken = LuckyMotorsEnsureToken(_lmetToken);
        _startNewRound();
        _initializePrizes();
    }
    
    function _initializePrizes() private {
        prizes[1] = Prize({
            name: "African Thunder E-Motorcycle",
            description: "Solar-powered electric motorcycle designed for African roads",
            value: 5000 * 10**18, // $5000
            imageUrl: "/african-e-motorcycle.png",
            isActive: true
        });
        
        prizes[2] = Prize({
            name: "Ubuntu Electric Scooter",
            description: "Eco-friendly urban mobility solution",
            value: 2000 * 10**18, // $2000
            imageUrl: "/ubuntu-e-scooter.png",
            isActive: true
        });
        
        prizes[3] = Prize({
            name: "Savanna E-Bike",
            description: "All-terrain electric bicycle for African adventures",
            value: 1000 * 10**18, // $1000
            imageUrl: "/savanna-e-bike.png",
            isActive: true
        });
    }
    
    function buyTicketWithETH(uint256 quantity) external payable nonReentrant whenNotPaused {
        require(quantity > 0 && quantity <= 10, "Invalid ticket quantity");
        
        uint256 totalCostUSD = TICKET_PRICE_USD * quantity;
        uint256 totalCostETH = (totalCostUSD * 10**18) / ethToUsdRate;
        
        require(msg.value >= totalCostETH, "Insufficient ETH sent");
        
        _processPurchase(msg.sender, quantity, "ETH");
        
        // Refund excess ETH
        if (msg.value > totalCostETH) {
            payable(msg.sender).transfer(msg.value - totalCostETH);
        }
    }
    
    function buyTicketWithTokens(uint256 quantity) external nonReentrant whenNotPaused {
        require(quantity > 0 && quantity <= 10, "Invalid ticket quantity");
        
        uint256 totalCostUSD = TICKET_PRICE_USD * quantity;
        uint256 totalCostTokens = lmetToken.getTokensForUSD(totalCostUSD / 10**18);
        
        require(lmetToken.balanceOf(msg.sender) >= totalCostTokens, "Insufficient LMET tokens");
        
        // Burn tokens (deflationary mechanism)
        lmetToken.burnFrom(msg.sender, totalCostTokens);
        
        _processPurchase(msg.sender, quantity, "LMET");
    }
    
    function _processPurchase(address player, uint256 quantity, string memory paymentMethod) private {
        LotteryRound storage currentRound = lotteryRounds[currentRoundId];
        require(currentRound.isActive, "No active lottery round");
        require(block.timestamp < currentRound.endTime, "Lottery round has ended");
        
        for (uint256 i = 0; i < quantity; i++) {
            _ticketIds.increment();
            uint256 ticketId = _ticketIds.current();
            
            tickets[ticketId] = Ticket({
                player: player,
                ticketNumber: ticketId,
                purchaseTime: block.timestamp,
                isActive: true
            });
            
            playerTickets[player].push(ticketId);
            currentRound.totalTickets++;
            
            emit TicketPurchased(player, ticketId, currentRoundId, paymentMethod);
        }
        
        // Award LMET tokens (50% cashback)
        uint256 rewardAmount = lmetToken.getTokensForUSD((TICKET_PRICE_USD * quantity * TOKEN_REWARD_PERCENTAGE) / (100 * 10**18));
        lmetToken.mint(player, rewardAmount);
        
        playerStats[player] += quantity;
        currentRound.prizePool += TICKET_PRICE_USD * quantity;
        
        emit TokensRewarded(player, rewardAmount);
    }
    
    function _startNewRound() private {
        _roundIds.increment();
        uint256 newRoundId = _roundIds.current();
        
        lotteryRounds[newRoundId] = LotteryRound({
            roundId: newRoundId,
            startTime: block.timestamp,
            endTime: block.timestamp + 7 days, // 1 week lottery
            ticketPrice: TICKET_PRICE_USD,
            totalTickets: 0,
            prizePool: 0,
            winner: address(0),
            isActive: true,
            isCompleted: false
        });
        
        currentRoundId = newRoundId;
        emit LotteryRoundStarted(newRoundId, block.timestamp, block.timestamp + 7 days);
    }
    
    function endCurrentRound() external onlyOwner {
        LotteryRound storage currentRound = lotteryRounds[currentRoundId];
        require(currentRound.isActive, "No active round");
        require(block.timestamp >= currentRound.endTime || currentRound.totalTickets >= 1000, "Round not ready to end");
        
        currentRound.isActive = false;
        currentRound.isCompleted = true;
        
        if (currentRound.totalTickets > 0) {
            // Simple random winner selection (in production, use Chainlink VRF)
            uint256 winningTicket = (uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, currentRound.totalTickets))) % currentRound.totalTickets) + 1;
            address winner = tickets[winningTicket].player;
            currentRound.winner = winner;
            
            emit LotteryRoundEnded(currentRoundId, winner, currentRound.prizePool);
        }
        
        _startNewRound();
    }
    
    function updateEthRate(uint256 newRate) external onlyOwner {
        ethToUsdRate = newRate;
        emit EthRateUpdated(newRate);
    }
    
    function getTicketPriceInETH() public view returns (uint256) {
        return (TICKET_PRICE_USD * 10**18) / ethToUsdRate;
    }
    
    function getTicketPriceInTokens() public view returns (uint256) {
        return lmetToken.getTokensForUSD(TICKET_PRICE_USD / 10**18);
    }
    
    function getCurrentRound() external view returns (LotteryRound memory) {
        return lotteryRounds[currentRoundId];
    }
    
    function getPlayerTickets(address player) external view returns (uint256[] memory) {
        return playerTickets[player];
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function withdrawFunds() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
