// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

abstract contract Car {
    
    string public name;
    
    // virtual: the child contract can override this function for his needs
    function drive() public virtual pure returns (string memory) {
        return "Drive Normal";
    }

}

contract SportsCar is Car {

    constructor() {
        name = "Sports Car";
    }

    function drive() public override pure returns (string memory) {
        return "Drive Fast";
    }

}

contract StandardCar is Car {

    constructor() {
        name = "Standard Car";
    }
}