// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SimpleTestContract
 * @dev Minimal contract for testing deployment
 */
contract SimpleTestContract {
    address public owner;
    uint256 public value;
    
    constructor() {
        owner = msg.sender;
        value = 0;
    }
    
    function setValue(uint256 _value) external {
        require(msg.sender == owner, "Only owner");
        value = _value;
    }
    
    function getValue() external view returns (uint256) {
        return value;
    }
}
