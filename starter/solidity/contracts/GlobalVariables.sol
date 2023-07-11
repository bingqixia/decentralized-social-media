// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

contract GlobalVariables {

    address public sender;
    uint256 public value;

    function blockVariables() public view returns (uint256, uint256) {
        return (block.timestamp, block.number);
    }

    function msgVariables() public payable {
        sender = msg.sender;
        value = msg.value;
    }

    function requireStatement() public view returns (bool) {
        // check if the condition is true, if not stop to run and return error
        require(msg.sender == sender, "This can only be called by the sender of msgVariables");
        return true;
    }

    function thisVariable() public view returns (address) {
        // the address that this contract is deployed
       return address(this);
    }

}