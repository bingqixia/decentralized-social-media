// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

contract UserContract{
    address public owner;
    uint256 private counter; // represent ID of a tweet
    uint256 private friendCounter; // represent ID of a friend

    constructor(){
        owner = msg.sender;
        counter = 0;
        friendCounter = 0;
    }

    struct Friend{
        address walletAddress;
        address contractAddress;
        uint256 id;
        bool isDeleted;
    }

    struct tweet{
        address tweeter;
        uint256 id;
        string tweetText;
        string tweetImg;
        bool isDeleted;
        uint256 timestamp;
    }

    struct user{
        string name;
        string description;
        string profileImg;
        string profileBanner;
    }

    mapping(uint256 => tweet) Tweets; // id to tweet struct
    mapping(address => user) Users; // address to a user struct
    mapping (uint256 => Friend) Friends; //id to friend struct

    event tweetCreated(
        address tweeter,
        uint256 id,
        string tweetText,
        string tweetImg,
        bool isDeleted,
        uint256 timestamp
    );

    event TweetDeleted(
        uint256 id,
        bool isDeleted
    );

    event friendAdded(
        address walletAddress,
        address contractAddress,
        uint256 id,
        bool isDeleted
    );

    event friendDeleted(
        uint256 id,
        bool isDeleted
    );

    // Method to add a Tweet

    function addTweet(string memory tweetText,string memory tweetImg) public {
        // require(msg.value == (0.01 ether),"Please submit 0.01 ether");
        tweet storage newTweet = Tweets[counter];
        newTweet.tweetText = tweetText;
        newTweet.tweetImg = tweetImg;
        newTweet.tweeter = msg.sender;
        newTweet.id = counter;
        newTweet.isDeleted = false;
        newTweet.timestamp = block.timestamp;
        emit tweetCreated(msg.sender,counter,tweetText,tweetImg,false,block.timestamp);
        counter++;
        // payable(owner).transfer(msg.value);
    }

    // Method to fetch all tweets

    function getAllTweets() public view returns (tweet[] memory){
        tweet[] memory temporary = new tweet[](counter);
        uint countTweets = 0;

        for(uint i=0;i<counter;i++){
            if(Tweets[i].isDeleted == false){
                temporary[countTweets] = Tweets[i];
                countTweets++;
            }
        }
        tweet[] memory result = new tweet[](countTweets);
        for(uint i=0; i<countTweets;i++){
            result[i] = temporary[i];
        }

        return result;
    }


    // Method to get all tweets of a particular user

    function getMyTweets() external view returns (tweet[] memory){
        tweet[] memory temporary = new tweet[](counter);
        uint countMyTweets = 0;

        for(uint i=0;i<counter;i++){
            if(Tweets[i].tweeter == msg.sender && Tweets[i].isDeleted == false){
                temporary[countMyTweets] = Tweets[i];
                countMyTweets++;
            }
        }

        tweet[] memory result = new tweet[](countMyTweets);
        for(uint i=0;i<countMyTweets;i++){
            result[i] = temporary[i];
        }
        return result;
    }

    // Method to get a particulat tweet
    function getTweet(uint256 id) public view returns (string memory,string memory,address){
        require(id < counter,"No such Tweet");
        tweet storage t = Tweets[id];
        require(t.isDeleted == false,"Tweet is deleted");
        return (t.tweetText,t.tweetImg,t.tweeter);
    }

    // Method to delete a Tweet
    function deleteTweet(uint tweetId,bool isDeleted) external {
        require(Tweets[tweetId].tweeter == msg.sender,"You can only delete your own tweet");
        Tweets[tweetId].isDeleted = isDeleted;
        emit TweetDeleted(tweetId,isDeleted);
    }

    // Method to update user details

    function updateUser(string memory newName,string memory newDescription,string memory newProfileImg,string memory newProfileBanner) public{
        user storage userData = Users[msg.sender];
        userData.name = newName;
        userData.description = newDescription;
        userData.profileImg = newProfileImg;
        userData.profileBanner = newProfileBanner;
    }


    // Method to get user detail
    function getUser(address userAddress) public view returns (user memory){
        return Users[userAddress];
    }

    // above is friends manager

        // Method to add a Tweet

    function addFriend(address walletAddress, address contractAddress) public {
        Friend storage newFriend = Friends[friendCounter];
        newFriend.walletAddress = walletAddress;
        newFriend.contractAddress = contractAddress;
        newFriend.id = friendCounter;
        newFriend.isDeleted = false;
        emit friendAdded(walletAddress, contractAddress, friendCounter, false);
        friendCounter++;
    }

    // Method to delete a friend
    function deleteFriend(uint256 friendId, bool isDeleted) external {
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