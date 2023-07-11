// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

contract Founctions {
    
    // storage variable
    string public someText;

    function memoryFunction() public {
        // memory variable
        string memory newText = "Memory";
        someText = newText;
    }

    constructor() {
        // initial at deploy
        someText = "Constructor";
        publicFunction();
    }

    // visibility

    // seen from outside and inside the contract & also from inherited contracts
    function publicFunction() public {
        someText = "Public";
    }

    // only visible from inside the contract & also from inherited contracts
    function _internalFunction() internal {
        someText = "Internal";
    }

    // only visible from inside the contract
    function _privateFunction() private {
        someText = "Private";
    }

    // seen from outside the contract
    function externalFunction() external {
        someText = "External";
    }

    // Return values

    function returnFunction() public view returns (string memory) {
        return someText;
    }

    // important modifiers
    // view: dont change the state of blockchain, i.e. dont write
    // pure: dont change the state of blockchain & dont read out the storage of the contract

    function pureFunction() public pure returns (uint256) {
        return 10+5;
    }

    function writeFunction() public {
        someText = "Write";
    }

    // send some ether with this function
    function payableFunction() public payable {
        someText = "Payable";
    }
    
    function ifFunction(uint256 _input) public pure returns (bool) {
        if(_input == 10) {
            return true;
        } else {
            return false;
        }
    }

    function forFunction(uint256 _loops) public pure returns (uint256) {
        uint256 numberOfIt = 0;
        for(uint256 i = 0; i < _loops; i ++) {
            numberOfIt ++;
        }
        return numberOfIt;
    }


}