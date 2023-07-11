// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

contract SimpleWallet {
    
    struct UserWallet {
        uint256 balance;
        uint256 lastUpdated;
    }

    mapping(address => UserWallet) userWallets;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    modifier checkBalance(uint256 _amount) {
         // user address
        require(userWallets[msg.sender].balance >= _amount, "User has less deposited");
        // contract address
        require(address(this).balance >= _amount, "Contract doesn't contain enough ETH!");
        _;
    }

    function deposit() external payable {
        require(msg.value > 0, "You must send some ETH");
        userWallets[msg.sender].balance += msg.value;
        userWallets[msg.sender].lastUpdated = block.timestamp;
    }

    function withdraw(uint256 _amount) external checkBalance(_amount) {
        // we need update the user balance first to avoid the re-entrancy vulnerability
        userWallets[msg.sender].balance -= _amount;
        userWallets[msg.sender].lastUpdated = block.timestamp;

        // send value to msg.send i.e. the user
        (bool sent, ) = msg.sender.call{value: _amount}("");
        require(sent, "Failed to send ETH!");
    }

    function getUserWallet(address _user) external view returns (UserWallet memory) {
        return userWallets[_user];
    }

}