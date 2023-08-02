import React, { useState, useEffect } from "react";
import "./TweetInFeed.css";
import { Avatar, Loading, useNotification } from "@web3uikit/core";
import { MessageCircle, Star, Eth, Bin, Calendar } from "@web3uikit/icons";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import UserContractAbi from "../abi/UserContract.json";
import {
  UserContractAddressKey,
  UserNameStr,
  UserImageStr,
  RECORD_NUM_PER_PAGE,
} from "../config";
import * as Name from "w3name";
import {
  retrieveFileFromIPFS,
  uploadFileToIPFS,
  publishRevision,
} from "../utils/IPFSUtils";

const TweetInFeed = (props) => {
  const onlyUser = props.profile;
  let reloadComponent = props.reload;
  const activeAccount = JSON.parse(localStorage.getItem('activeAccount'));
  const [tweets, setTweets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [friends, setFriends] = useState([]);
  const notification = useNotification();
  const TwitterContractAddress = JSON.parse(
    localStorage.getItem(UserContractAddressKey)
  );

  useEffect(() => {
    loadFriendsList();
  }, []);

  useEffect(() => {
    loadAllTweets(onlyUser);
  }, [reloadComponent, friends]);

  // sort by create time, bigger first
  function compareByCreateTime(tweet1, tweet2) {
    if (tweet1.createTime < tweet2.createTime) {
      return -1;
    }
    if (tweet1.createTime > tweet2.createTime) {
      return 1;
    }
    return 0;
  }

  async function loadTweetsForUser(contract) {
    const tweetsPointer = await contract.getTweetsPointer();
    const name = Name.parse(tweetsPointer);

    const revision = await Name.resolve(name);
    // retrive all tweets of this user
    let currentCid = revision.value;
    let jsonData = null;
    let userTweets = [];

    while (currentCid !== null) {
      jsonData = await retrieveFileFromIPFS(currentCid);
      if (jsonData.tweets.length > 0) userTweets.push(...jsonData.tweets);
      currentCid = jsonData.previous;
    }
    // sort by create time, bigger first
    userTweets.sort(compareByCreateTime);
    return userTweets;
  }

  async function loadFriendsList() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    // console.log("TwitterContractAddress: ", TwitterContractAddress);
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

  function timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time =
      date + " " + month + " " + year + " " + hour + ":" + min + ":" + sec;
    return time;
  }

  async function loadAllTweets(onlyOwnUser = false) {
    // load all tweets, include user self and friends
    // 1. getAllFriends
    // 2. get tweet pointer of each friends and this user
    // 3. sort tweets by timestamp reverse
    setIsLoading(true);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    let users = onlyOwnUser ? [] : [...friends];

    const ownUser = {
      contractAddress: TwitterContractAddress,
      walletAddress: await signer.getAddress(),
      isDeleted: false,
      id: users.length,
    };
    users.push(ownUser);

    let allTweets = [];
    for (let i = 0; i < users.length; i++) {
      console.log("user: ", i, users[i]);
      const contract = new ethers.Contract(
        users[i].contractAddress,
        UserContractAbi.abi,
        signer
      );
      const userTweets = await loadTweetsForUser(contract);

      if (userTweets !== null && userTweets.length > 0) {
        const tweetsForUser = await Promise.all(
          userTweets.map(async (tweet) => {
            const unixTime = tweet.createTime / 1000;
            const tweetDate = timeConverter(unixTime);
            let userDetail = await contract.getUser(tweet.tweeter);
            let item = {
              tweeter: tweet.tweeter,
              id: tweet.id,
              tweetText: tweet.text,
              tweetImg:
                tweet.image === null
                  ? null
                  : encodeURI(`https://${tweet.image}.ipfs.dweb.link`),
              userName: userDetail["name"],
              userImage: userDetail["profileImg"],
              date: tweetDate,
              timestamp: tweet.createTime,
            };
            return item;
          })
        );
        allTweets.push(...tweetsForUser);
        // console.log(" allTweets i: ", i, allTweets);
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

    setTweets(allTweets.sort(compare));
    setIsLoading(false);
  }

  async function deleteTweet(tweetId) {
    setIsLoading(true);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      TwitterContractAddress,
      UserContractAbi.abi,
      signer
    );
    const signKeyString = await contract.getSignKey();
    const signKey = new Uint8Array(JSON.parse(signKeyString));
    const name = await Name.from(signKey);
    const deleteIdNum = Number(tweetId);
    console.log("[deleteTweet] deleteId: ", deleteIdNum);

    const revision = await Name.resolve(name);
    const lastCid = revision.value;
    // console.log("Resolved last cid:", revision.value);

    const deletePage = Math.ceil((deleteIdNum + 1.0) / RECORD_NUM_PER_PAGE) - 1;
    // console.log("deletePage", deletePage);

    const latestTweet = await retrieveFileFromIPFS(lastCid);
    let jsonData = latestTweet;
    let currentPage = latestTweet.page;

    let currentPrevious = latestTweet.previous;
    let currentCid = currentPrevious;
    let body = null;

    if (currentPage === 0 && jsonData.tweets.length === 1) {
      body = {
        page: 0,
        totalAmount: 0,
        tweets: [],
        previous: null,
      };

      // console.log('lastPrevious', currentPrevious);
      currentPrevious = await uploadFileToIPFS(body);
    } else {
      let allTweets = [];
      // console.log("latestTweet page: ", currentPage);

      if (currentPage > deletePage) {
        allTweets.push(...latestTweet.tweets);
        while (currentPage !== deletePage) {
          // the data is deletePage when end loop
          jsonData = await retrieveFileFromIPFS(currentCid);
          currentPage = jsonData.page;
          currentPrevious = jsonData.previous;
          currentCid = currentPrevious;

          if (currentPage === deletePage) {
            break;
          }

          allTweets.push(...jsonData.tweets);
        }
        // console.log('lastPrevious', currentPrevious);
      }

      // delete tweet
      const tweets = jsonData.tweets;
      // console.log('delete page tweets', tweets);
      let newTweets = [];
      for (let i = 0; i < tweets.length; i++) {
        if (tweets[i].id !== deleteIdNum) {
          newTweets.push(tweets[i]);
        }
      }
      // console.log("newTweets", newTweets);
      allTweets.push(...newTweets);

      // // sort all tweets by create time
      allTweets.sort(compareByCreateTime);

      // console.log("allTweets: ", allTweets);
      // // //follow is reindex tweet id
      // // // start id: previous pages have startId tweets in total
      let startId = RECORD_NUM_PER_PAGE * currentPage;
      const totalAmount = startId + allTweets.length;
      const endPage = Math.ceil(totalAmount / RECORD_NUM_PER_PAGE) - 1;
      // console.log("totalAmount: ", totalAmount);
      // console.log("endPage: ", endPage);
      // console.log("currentPage: ", currentPage);

      // update id for each page, if currentPage > endPage, only set name points to previous
      if (currentPage <= endPage) {
        let tweetIdx = 0;
        for (let page = currentPage; page <= endPage; page++) {
          let tmp = [];
          for (; startId < (page + 1) * RECORD_NUM_PER_PAGE; startId++) {
            if (tweetIdx === allTweets.length) break;
            let newTweet = allTweets[tweetIdx];
            // console.log("startId: ", startId);
            newTweet.id = startId;
            // console.log("newTweet: ", newTweet);
            tmp.push(newTweet);
            tweetIdx++;
          }

          body = {
            page: page,
            totalAmount: startId,
            tweets: tmp,
            previous: currentPrevious,
          };

          // console.log('lastPrevious', currentPrevious);
          currentPrevious = await uploadFileToIPFS(body);
        }
      }
    }

    // console.log('currentPrevious', currentPrevious);

    try {
      const nameValue = await publishRevision(signKey, currentPrevious);
      console.log(`nameValue: https://name.web3.storage/name/${nameValue}/`);
    } catch (error) {
      alert(`Oops! Something went wrong when publishRevishon. Error ${error}`);
    }

    notification({
      type: "success",
      title: "Tweet Deleted Successfully",
      position: "topR",
      icon: <Bin />,
    });
    setIsLoading(false);
    loadAllTweets();
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
        <div key={i} className="feedTweet">
          <Avatar isRounded image={tweet.userImage} theme="image" size={60} />
          <div className="completeTweet">
            <div className="who">
              {tweet.userName}
              <div className="accWhen">{tweet.tweeter}</div>
            </div>
            <div className="tweetContent">
              {tweet.tweetText}
              {tweet.tweetImg !== null && (
                <img src={tweet.tweetImg} className="tweetImg" />
              )}
            </div>
            <div className="interactions">
              <div className="interactionDate">
                <Calendar fontSize={15} />
                {tweet.date}
              </div>
              {activeAccount === tweet.tweeter ? (
                <div className="interactionDelete">
                  <Bin
                    fontSize={20}
                    color="#FF0000"
                    onClick={() => deleteTweet(tweet.id)}
                  />
                </div>
              ) : (
                <div className="interactionNums" />
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default TweetInFeed;
