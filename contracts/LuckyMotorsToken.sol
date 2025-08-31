// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts@5.0.0/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts@5.0.0/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts@5.0.0/access/Ownable.sol";
import "@openzeppelin/contracts@5.0.0/utils/Pausable.sol";
import "@openzeppelin/contracts@5.0.0/access/AccessControl.sol";



contract LuckyMotorsToken is ERC20, ERC20Burnable, Ownable, Pausable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    constructor() 
        ERC20("LuckyMotorsToken", "LMT") 
        Ownable(msg.sender)
    {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    // Function to add a minter
    function addMinter(address account) public onlyOwner {
        _grantRole(MINTER_ROLE, account);
    }

    // Function to remove a minter
    function removeMinter(address account) public onlyOwner {
        _revokeRole(MINTER_ROLE, account);
    }

     // Mint function that checks for minter role
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }


    function _update(address from, address to, uint256 value)
        internal
        override
        whenNotPaused
    {
        super._update(from, to, value);
    }
}