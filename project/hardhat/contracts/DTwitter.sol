// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract DTwitter is Ownable, Pausable {
    uint256 public price;

    struct Tweet {
        address from;
        uint256 timestamp;
        string message;
        bool deleted;
        uint256 replyID;
        uint256 retweetID;
    }

    uint256 public id = 1; // Use id 0 for top-level tweets
    uint256[] public tweetIDs;
    mapping(uint256 => Tweet) public tweets; // Mapped struct with index, see: https://ethereum.stackexchange.com/a/13168
    mapping(address => uint256) public lastTweetedAt;

    /**
     * @notice Emitted when a new tweet is added to the contract
     * @param id The new tweet's ID
     * @param from The sender's address
     * @param timestamp The block timestamp of the new tweet
     * @param message The message from the tweet's sender
     * @param deleted Flag for marking the tweet as deleted
     * @param replyID The ID of the tweet being replied to, 0 for top-level tweets
     * @param retweetID The ID of the tweet being resent, 0 for top-level tweets
     */
    event NewTweet(
        uint256 indexed id,
        address indexed from,
        uint256 timestamp,
        string message,
        bool deleted,
        uint256 replyID,
        uint256 retweetID
    );

    /**
     * @notice Emitted when an existing tweet is modified by it's author
     * @param id The existing tweet's ID
     * @param from The sender's address
     * @param timestamp The block timestamp of the existing tweet
     * @param message The edited message from the tweet's sender
     * @param deleted Flag for marking the tweet as deleted
     * @param replyID The ID of the tweet being replied to, 0 for top-level tweets
     * @param retweetID The ID of the tweet being resent, 0 for top-level tweets
     */
    event EditTweet(
        uint256 indexed id,
        address indexed from,
        uint256 timestamp,
        string message,
        bool deleted,
        uint256 replyID,
        uint256 retweetID
    );

    /**
     * @notice Emitted when an existing tweet is deleted from the contract
     * @param id The existing tweet's ID
     * @param from The sender's address
     * @param timestamp The block timestamp of the new tweet
     * @param message The message from the tweet's sender
     * @param deleted Flag for marking the tweet as deleted
     * @param replyID The ID of the tweet being replied to, 0 for top-level tweets
     * @param retweetID The ID of the tweet being resent, 0 for top-level tweets
     */
    event DeleteTweet(
        uint256 indexed id,
        address indexed from,
        uint256 timestamp,
        string message,
        bool deleted,
        uint256 replyID,
        uint256 retweetID
    );

    /**
     * @notice Emitted when the contract owner clears all tweets from the contract
     * @param id The ID number of the last valid tweet
     */
    event ClearTweets(uint256 id);

    /// @notice Thrown when the given tweet ID does not exist
    error InvalidID();

    /// @notice Thrown when the contract is sent the incorrect amount of ether
    error InvalidPrice();

    /// @notice Thrown when the sent message is over the allowed character length
    error InvalidMessage();

    /// @notice Thrown when the given tweet has been deleted
    error DeletedTweet();

    /// @notice Thrown when the sender is not authorized to perform an action
    error Unauthorized();

    /// @notice Thrown when the sender is still on a tweet cooldown period
    error SenderCooldown();


    /**
     * @notice Deploys the DTwitter contract with the given setting
     * @param _price The price to send a tweet
     */
    constructor(
        uint256 _price
    ) payable {
        price = _price;
    }

    /**
     * @notice Send a message (tweet) to the contract
     * @param _message The sender's message to post
     * @param _replyID The ID of the tweet being replied to, 0 for top-level tweets
     * @param _retweetID The ID of the tweet being resent, 0 for top-level tweets
     */
    function newTweet(
        string memory _message,
        uint256 _replyID,
        uint256 _retweetID
    ) public onlyOwner payable whenNotPaused {
        if (msg.value < price) revert InvalidPrice();
        if (bytes(_message).length > 280) revert InvalidMessage();
        if (lastTweetedAt[msg.sender] + 1 minutes >= block.timestamp)
            revert SenderCooldown();

        // console.log("%s has tweeted!", msg.sender); // DEBUG
        lastTweetedAt[msg.sender] = block.timestamp;
        tweets[id] = Tweet(
            msg.sender,
            block.timestamp,
            _message,
            false,
            _replyID,
            _retweetID
        );
        tweetIDs.push(id);

        // Alert subscribers to the new tweet transaction
        emit NewTweet(
            id,
            msg.sender,
            block.timestamp,
            _message,
            false,
            _replyID,
            _retweetID
        );
        id++;
    }

    /**
     * @notice Edit an existing tweet's message
     * @param _id The ID of the tweet being edited
     * @param _message The new replacement message for the specified tweet
     */
    function editTweet(uint256 _id, string memory _message)
        public
        onlyOwner
        whenNotPaused
    {
        if (tweets[_id].timestamp == 0) revert InvalidID();
        if (tweets[_id].deleted) revert DeletedTweet();
        if (tweets[_id].from != msg.sender) revert Unauthorized();
        if (bytes(_message).length > 280) revert InvalidMessage();

        tweets[_id].message = _message;
        emit EditTweet(
            _id,
            msg.sender,
            block.timestamp,
            tweets[_id].message,
            tweets[_id].deleted,
            tweets[_id].replyID,
            tweets[_id].retweetID
        );
    }

    /**
     * @notice Delete a tweet from the contract
     * @param _id The ID of the tweet to delete
     */
    function deleteTweet(uint256 _id) public onlyOwner whenNotPaused {
        if (tweets[_id].timestamp == 0) revert InvalidID();
        if (tweets[_id].deleted) revert DeletedTweet();
        if (tweets[_id].from != msg.sender) revert Unauthorized();

        tweets[_id].deleted = true;
        emit DeleteTweet(
            _id,
            msg.sender,
            block.timestamp,
            tweets[_id].message,
            tweets[_id].deleted,
            tweets[_id].replyID,
            tweets[_id].retweetID
        );
    }

    /// @notice In case of emergency, the owner can clear all tweets from the contract
    function clear() public onlyOwner {
        uint256 lastID = id;
        for (uint256 i = 0; i < tweetIDs.length; i++) {
            delete tweets[i];
        }
        delete tweetIDs;
        id = 1;

        emit ClearTweets(lastID);
    }

    /**
     * @notice Get the price of sending a new tweet
     * @return uint256 The current price of sending a tweet
     */
    function getPrice() public view returns (uint256) {
        return price;
    }

    /**
     * @notice Get the contract owner's address
     * @return address The contract owner
     */
    function getOwner() public view returns (address) {
        return owner();
    }

    /**
     * @notice Get the balance of the contract
     * @return uint256 The current address of the contract
     */
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Get all sent tweets from the contract
     * @return Tweet[] An array of all tweets stored on the contract
     */
    function getTweets() public view returns (Tweet[] memory) {
        Tweet[] memory allTweets = new Tweet[](tweetIDs.length);
        for (uint256 i = 0; i < tweetIDs.length; i++) {
            allTweets[i] = tweets[tweetIDs[i]];
        }
        return allTweets;
    }

    /**
     * @notice Get the total number of tweets sent
     * @return uint256 The current total number of tweets
     */
    function getTotalTweets() public view returns (uint256) {
        return tweetIDs.length;
    }

    /**
     * @notice Set the price of sending a tweet
     * @param _price The new price of sending a tweet
     */
    function setPrice(uint256 _price) internal {
        price = _price;
    }
}
