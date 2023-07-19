import React, { useState, useEffect } from "react";
import "./TweetInFeed.css";
import { Avatar, Loading, useNotification } from "@web3uikit/core";
import { MessageCircle, Star, Eth, Bin, Calendar } from "@web3uikit/icons";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import UserContractAbi from "../abi/UserContract.json";

const TweetInFeed = (props) => {
  const onlyUser = props.profile;
  let reloadComponent = props.reload;
  const [tweets, setTweets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [friends, setFriends] = useState([]);
  const notification = useNotification();
  const TwitterContractAddress = JSON.parse(
    localStorage.getItem("userContractAddress")
  );

  useEffect(() => {
    loadFriendsList();
  }, []);

  useEffect(() => {
    if (onlyUser) {
      loadMyTweets();
    } else {
      loadAllTweets();
    }
  }, [reloadComponent, friends]);

  async function loadMyTweets() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      TwitterContractAddress,
      UserContractAbi.abi,
      signer
    );
    const data = await contract.getMyTweets();
    const userName = JSON.parse(localStorage.getItem("userName"));
    const userImage = JSON.parse(localStorage.getItem("userImage"));
    const result = await Promise.all(
      data.map(async (tweet) => {
        const unixTime = tweet.timestamp;
        const tweetDate = timeConverter(unixTime);
        // const date = new Date(unixTime * 1000);
        // const tweetDate = date.toLocaleDateString("fr-CH");

        let item = {
          tweeter: tweet.tweeter,
          id: tweet.id,
          tweetText: tweet.tweetText,
          tweetImg: tweet.tweetImg,
          isDeleted: tweet.isDeleted,
          userName: userName,
          userImage: userImage,
          date: tweetDate,
        };

        await fetch(tweet.tweetText)
          .then((response) => {
            return response.text();
          })
          .then((text) => {
            console.log("ipfs: ", text);
            item.tweetText = text;
          })
          .catch(function () {
            console.log("error");
          });
        return item;
      })
    );

    setTweets(result.reverse());
    console.log("loadMyTweets tweets", tweets);
    setIsLoading(false);
  }

  async function loadFriendsList() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(
      TwitterContractAddress,
      UserContractAbi.abi,
      signer
    );
    const data = await contract.getAllFriends();
    const result = await Promise.all(
      data.map(async (friend) => {
        let item = {
          walletAddress: friend.walletAddress,
          contractAddress: friend.contractAddress,
          id: friend.id,
          isDeleted: friend.isDeleted,
        };
        return item;
      })
    );

    setFriends(result);
    console.log("loadFriendsList", friends);
    setIsLoading(false);
  }

  function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
  }

  async function loadAllTweets() {
    // load all tweets, include user self and friends
    // 1. getAllFriends
    // 2. get tweets for each friends
    // 3. sort tweets by timestamp reverse
  
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    let users = [...friends];
    const ownUser = {
      contractAddress: TwitterContractAddress,
      walletAddress: await signer.getAddress(),
      isDeleted: false,
      id: users.length,
    };
    users.push(ownUser);

    let result = new Array();
    for (let i = 0; i < users.length; i++) {
      console.log("user: ", i, users[i]);
      const contract = new ethers.Contract(
        users[i].contractAddress,
        UserContractAbi.abi,
        signer
      );

      const data = await contract.getAllTweets();
      console.log("data: ", data);
      if (data !== null && data.length > 0) {
        const tweetsForUser = await Promise.all(
          data.map(async (tweet) => {
            const unixTime = tweet.timestamp;
            // const date = new Date(unixTime * 1000);
            // const tweetDate = date.toLocaleDateString("fr-CH");
            const tweetDate = timeConverter(unixTime);
            let getUserDetail = await contract.getUser(tweet.tweeter);

            let item = {
              tweeter: tweet.tweeter,
              id: tweet.id,
              tweetText: tweet.tweetText,
              tweetImg: tweet.tweetImg,
              isDeleted: tweet.isDeleted,
              userName: getUserDetail["name"],
              userImage: getUserDetail["profileImg"],
              date: tweetDate,
              timestamp: tweet.timestamp,
            };

            await fetch(tweet.tweetText)
              .then((response) => {
                return response.text();
              })
              .then((text) => {
                item.tweetText = text;
              })
              .catch(function () {
                console.log("error");
              });

            return item;
          })
        );
        // console.log(" tweets i: ", i, tweetsForUser);
        result = result.concat(tweetsForUser);
        console.log(" result i: ", i, result);
      }
    }

    function compare(tweet1, tweet2) {
      if (tweet1.timestamp < tweet2.timestamp) {
        return 1;
      }
      if (tweet1.timestamp > tweet2.timestamp) {
        return -1;
      }
      return 0;
    }

    setTweets(result.sort(compare));
    console.log("loadAllTweets tweets", tweets);
    setIsLoading(false);
  }

  async function deleteTweet(tweetId) {
    setIsLoading(false);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      TwitterContractAddress,
      UserContractAbi.abi,
      signer
    );
    const data = await contract.deleteTweet(tweetId, true);
    // wait for the Ethereum transaction to be mined and confirmed on the blockchain.
    await data.wait();
    notification({
      type: "success",
      title: "Tweet Deleted Successfully",
      position: "topR",
      icon: <Bin />,
    });

    loadMyTweets();
  }

  if (isLoading)
    return (
      <div className="loading">
        <Loading size={60} spinnerColor="#8247e5" />
      </div>
    );

  if (!isLoading && !tweets.length)
    return <h1 className="loading">No Tweet available</h1>;

  return (
    <>
      {tweets.map((tweet, i) => (
        <div className="feedTweet">
          <Avatar isRounded image={tweet.userImage} theme="image" size={60} />
          <div className="completeTweet">
            <div className="who">
              {tweet.userName}
              <div className="accWhen">{tweet.tweeter}</div>
            </div>
            <div className="tweetContent">
              {tweet.tweetText}
              {tweet.tweetImg !== "" && (
                <img src={tweet.tweetImg} className="tweetImg" />
              )}
            </div>
            <div className="interactions">
              <div className="interactionNums">
                <MessageCircle fontSize={20} />0
              </div>
              <div className="interactionNums">
                <Calendar fontSize={20} />
                {tweet.date}
              </div>
              {onlyUser ? (
                <div className="interactionNums">
                  <Bin
                    fontSize={20}
                    color="#FF0000"
                    onClick={() => deleteTweet(tweet.id)}
                  />
                </div>
              ) : (
                <div className="interactionNums">
                  <Eth fontSize={20} />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default TweetInFeed;
