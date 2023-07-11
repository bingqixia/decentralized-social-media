// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

contract DataTypes {
    uint8 public defaultUint8 = type(uint8).max; // 2^8=256, max: 2^8-1=255
    uint16 public defaultUint16 = type(uint16).max; // max: 2^16-1
    uint256 public defaultUint256 = type(uint256).max; // max: 2^256-1

    int8 public defaultInt8 = type(int8).max; // max: 2^7-1=127, min: -2^7=128

    address public defaultAddress = 0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B;

    string public defaultString = "aswf";

    // Reference data types

    // mapping(key => value)
    mapping(address => uint256) public userBalanceMapping;

    uint256[] public userBalanceArray; // []

    struct UserBalance {
        uint256 balance;
        uint256 updateAt;
    }

    mapping(address => UserBalance) public userBalanceMappingStruct;

    UserBalance[] public userBalanceArrayStruct;

    function setBalance(address _to, uint256 _newBalance) external {
        // local variable
        UserBalance memory userBalance = UserBalance({
            balance: _newBalance,
            updateAt: block.timestamp
        });

        userBalanceMapping[_to] = _newBalance;
        userBalanceArray.push(_newBalance);

        userBalanceMappingStruct[_to] = userBalance;
        userBalanceArrayStruct.push(userBalance);
        
    }

}