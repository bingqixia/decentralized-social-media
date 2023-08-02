// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

contract AccountManager {
    mapping (address => address) users;

    address owner;

    constructor() {
        owner = msg.sender;
    }

    event UserRegister(address indexed user, address _contractAddress);

    event UserDeregister(address indexed user);

    modifier isContract(address _addr) {
        uint32 _size;
        assembly {
            _size := extcodesize(_addr)
        }
        require(_size > 0, "Need a contract address");
        _;
    }

    /**
     * 
     * @param _address user wallet address
     */
    function Register(address _address) public isContract(_address) {
        users[msg.sender] = _address;
        emit UserRegister(msg.sender, _address);
    }

    /**
     * 
     * @param _address pass user wallet address to retrieve user contract address
     */
    function Retrieve(address _address) public view returns (address) {
        address userContract = users[_address];
        return userContract;
    }

    /**
     * 
     *  deregister account for user
     */
    function Deregister() public {
        delete users[msg.sender];
        emit UserDeregister(msg.sender);
    }
}