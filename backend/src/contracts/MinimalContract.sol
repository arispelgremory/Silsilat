// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MinimalContract {
    uint256 public value;
    
    constructor() {
        value = 42;
    }
    
    function setValue(uint256 _value) public {
        value = _value;
    }
}
