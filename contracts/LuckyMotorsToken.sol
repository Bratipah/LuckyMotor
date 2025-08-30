// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title LuckyMotors Token (LMT)
 * @dev ERC20 token for the LuckyMotors lottery ecosystem
 * Features:
 * - Burnable tokens for deflationary mechanics
 * - Pausable transfers for emergency stops
 * - Authorized minter system for controlled distribution
 * - Maximum supply cap to prevent inflation
 */
contract LuckyMotorsToken is ERC20, ERC20Burnable, Ownable, Pausable {
    // Maximum supply: 10 million tokens
    uint256 public constant MAX_SUPPLY = 10_000_000 * 10**18;
    
    // Initial supply: 1 million tokens
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10**18;
    
    // Mapping of authorized minters
    mapping(address => bool) public authorizedMinters;
    
    // Events
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event TokensMinted(address indexed to, uint256 amount);
    
    // Custom errors
    error ExceedsMaxSupply();
    error UnauthorizedMinter();
    error ZeroAddress();
    error ZeroAmount();
    
    constructor() ERC20("LuckyMotors Token", "LMT") {
        // Mint initial supply to deployer
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Add an authorized minter
     * @param minter Address to authorize for minting
     */
    function addMinter(address minter) external onlyOwner {
        if (minter == address(0)) revert ZeroAddress();
        authorizedMinters[minter] = true;
        emit MinterAdded(minter);
    }
    
    /**
     * @dev Remove an authorized minter
     * @param minter Address to remove from minting authorization
     */
    function removeMinter(address minter) external onlyOwner {
        if (minter == address(0)) revert ZeroAddress();
        authorizedMinters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    /**
     * @dev Mint tokens to specified address
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external {
        if (!authorizedMinters[msg.sender]) revert UnauthorizedMinter();
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        if (totalSupply() + amount > MAX_SUPPLY) revert ExceedsMaxSupply();
        
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev Pause token transfers
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override transfer function to include pause functionality
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
    
    /**
     * @dev Get remaining mintable supply
     */
    function remainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }
    
    /**
     * @dev Check if address is authorized minter
     */
    function isMinter(address account) external view returns (bool) {
        return authorizedMinters[account];
    }
}
