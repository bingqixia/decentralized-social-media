// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

contract Modifiers {
    
    address public owner;
    uint256 public importantValue;

    modifier onlyOwner {
        // before function code
        require(msg.sender == owner, "Caller is not owner.");
        _; // execute the function
        // add after the function code
    }

    modifier max100(uint256 _value) {
        require(_value <= 100, "Max value is 100.");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setImportantValue(uint256 _newValue) public onlyOwner max100(_newValue) {
        importantValue = _newValue;
    }





}