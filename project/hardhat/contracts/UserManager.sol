// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

contract UserManager {
    mapping (address => address) users;

    address owner;

    constructor() {
        owner = msg.sender;
    }

    event UserRegister(
        address _contractAddress
    );

    modifier isContract(address _addr) {
        uint32 _size;
        assembly {
            _size := extcodesize(_addr)
        }
        require(_size > 0, "Need a contract address");
        _;
    }

    function Register(address _address) public isContract(_address) {
        users[msg.sender] = _address;
    }

    function Retrieve() public view returns (address) {
        // if not exist, it will return address: 0x0000000000000000000000000000000000000000
        return users[msg.sender];
    }
}