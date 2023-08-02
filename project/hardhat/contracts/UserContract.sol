// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract UserContract is Ownable {
    uint256 private friendCounter; // represent ID of a friend
    string private tweetsPointer;
    string private signKey;

    constructor(string memory _pointer, string memory _signKey) {
        friendCounter = 0;
        tweetsPointer = _pointer;
        signKey = _signKey;
    }

    struct Friend {
        address walletAddress;
        address contractAddress;
        uint256 id;
        bool isDeleted;
    }

    struct user {
        string name;
        string description;
        string profileImg;
        string profileBanner;
    }

    mapping(address => user) Users; // address to a user struct
    mapping (uint256 => Friend) Friends; //id to friend struct

    event friendAdded (
        address walletAddress,
        address contractAddress,
        uint256 id,
        bool isDeleted
    );

    event friendDeleted(
        uint256 id,
        bool isDeleted
    );

    // Method to get tweets pointer
    function getTweetsPointer() public view returns (string memory){
        return tweetsPointer;
    }

    // Method to get signkey
    function getSignKey() public onlyOwner view returns (string memory) {
        return signKey;
    }

    // Method to update user details

    function updateUser(string memory newName,string memory newDescription,string memory newProfileImg,
    string memory newProfileBanner) public onlyOwner{
        user storage userData = Users[msg.sender];
        userData.name = newName;
        userData.description = newDescription;
        userData.profileImg = newProfileImg;
        userData.profileBanner = newProfileBanner;
    }

    // Method to get user detail
    function getUser(address userAddress) public view returns (user memory) {
        return Users[userAddress];
    }

    // above is friends manager

        // Method to add a Tweet

    function addFriend(address walletAddress, address contractAddress) public onlyOwner {
        Friend storage newFriend = Friends[friendCounter];
        newFriend.walletAddress = walletAddress;
        newFriend.contractAddress = contractAddress;
        newFriend.id = friendCounter;
        newFriend.isDeleted = false;
        emit friendAdded(walletAddress, contractAddress, friendCounter, false);
        friendCounter++;
    }

    // Method to delete a friend
    function deleteFriend(uint256 friendId, bool isDeleted) external onlyOwner{
        Friends[friendId].isDeleted = isDeleted;
        emit friendDeleted(friendId, isDeleted);
    }

    // get all friends
    function getAllFriends() public view returns (Friend[] memory){
        Friend[] memory temporary = new Friend[](friendCounter);
        uint countFriends = 0;

        for(uint i=0; i<friendCounter; i++){
            if(Friends[i].isDeleted == false){
                temporary[countFriends] = Friends[i];
                countFriends++;
            }
        }
        Friend[] memory result = new Friend[](countFriends);
        for(uint i=0; i<countFriends;i++){
            result[i] = temporary[i];
        }

        return result;
    }
}