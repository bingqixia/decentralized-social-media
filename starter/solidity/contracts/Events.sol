// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

contract Events {
    
    event Deposited(address indexed caller, uint256 value);

    function deposit() public payable {
        emit Deposited(msg.sender, msg.value);
    }
}