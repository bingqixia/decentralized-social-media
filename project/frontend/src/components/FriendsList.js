import React, { useState, useEffect, useContext } from "react";
import "./FriendsList.css";
import { Avatar, Loading, useNotification } from "@web3uikit/core";
import { Input } from "@web3uikit/core";
import { AccountManagerContractAddress, UserContractAddressKey } from "../config";
import AccountManagerAbi from "../abi/AccountManager.json";
import { Bin } from "@web3uikit/icons";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import UserContractAbi from "../abi/UserContract.json";

const FriendsList = () => {
  const notification = useNotification();
  const [friends, setFriends] = useState([]);
//   const { friends, setFriends } = useContext(FriendsContext)
  const [isLoading, setIsLoading] = useState(true);
  const [adding, setIsAdding] = useState(false);
  const [newFriendAddress, setNewFriendAddress] = useState(
    ethers.constants.AddressZero
  );

  const TwitterContractAddress = JSON.parse(
    localStorage.getItem(UserContractAddressKey)
  );

  const handleReloadPage = () => {
    window.location.reload();
  };

  useEffect(() => {
    loadFriendsList();
  }, []);

  async function retrieveContractAddress(signer, friendAddress) {
    const accountManagerContract = new ethers.Contract(
      AccountManagerContractAddress,
      AccountManagerAbi.abi,
      signer
    );
    let contractAddress = ethers.constants.AddressZero;
    try {
      contractAddress = await accountManagerContract.Retrieve(friendAddress);
      return contractAddress;
    } catch (error) {
      notification(
        "Retrieve Failed",
        `Transcation Cancelled by User -> ${error}`,
        "error"
      );
    }
  }

  async function addFriend() {
    if (!ethers.utils.isAddress(newFriendAddress)) {
      notification({
        type: "error",
        message: "Please Input an Ethereum Address!",
        title: "Address Invalid",
        position: "topR",
      });
      setIsAdding(false);
      return;
    }
    setIsAdding(true);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      TwitterContractAddress,
      UserContractAbi.abi,
      signer
    );

    const friendContract = await retrieveContractAddress(
      signer,
      newFriendAddress
    );
    console.log("retrieve friend contract: ", friendContract);
    if (friendContract === ethers.constants.AddressZero) {
      notification({
        type: "error",
        title: "Friend doesn't register!",
        position: "topR",
      });
      setIsLoading(false);
      return;
    }
    try {
      const transaction = await contract.addFriend(
        newFriendAddress,
        friendContract
      );
      await transaction.wait();
      notification({
        type: "success",
        title: "Friend Added Successfully",
        position: "topR",
      });
      setIsAdding(false);
    } catch (error) {
      notification({
        type: "error",
        title: "Transaction Error",
        message: error.message,
        position: "topR",
      });
      setIsAdding(false);
    }
    // loadFriendsList();
    handleReloadPage();
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

        const friendContract = new ethers.Contract(
          friend.contractAddress,
          UserContractAbi.abi,
          signer
        );

        let userDetail = await friendContract.getUser(friend.walletAddress);
        let item = {
          walletAddress: friend.walletAddress,
          contractAddress: friend.contractAddress,
          id: friend.id,
          isDeleted: friend.isDeleted,
          userName: userDetail["name"],
          userImage: userDetail["profileImg"],
        };
        return item;
      })
    );

    setFriends(result);
    console.log("loadFriendsList friends", friends);
    setIsLoading(false);
  }

  async function deletefriends(friendId) {
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
    const data = await contract.deleteFriend(friendId, true);
    // wait for the Ethereum transaction to be mined and confirmed on the blockchain.
    await data.wait();
    notification({
      type: "success",
      title: "Friends Deleted Successfully",
      position: "topR",
      icon: <Bin />,
    });
    handleReloadPage();
    // loadFriendsList();
    
  }

  if (isLoading)
    return (
      <div className="loading">
        <Loading size={60} spinnerColor="#8247e5" />
      </div>
    );

  return (
    <>
      <div className="rightbarContent">
        <div className="friends">
          <div className="addfriends">
            <h3>Add Friend</h3>
            <Input
              label="Address"
              name="NameChange"
              width="100%"
              labelBgColor="#141d26"
              onChange={(e) => setNewFriendAddress(e.target.value)}
              value={newFriendAddress}
            />
            {adding ? (
              <div className="save">
                <Loading />
              </div>
            ) : (
              <div className="save" onClick={addFriend}>
                Add Friend
              </div>
            )}
          </div>

          <div>
            <h3>Friends List</h3>
          </div>
          {!friends || friends.length === 0 ? (
            <h1 className="loading">No Following Friends</h1>
          ) : (
            friends.map((e) => {
              return (
                <div className="friend-item" key={e.id}>
                  <Avatar
                    isRounded
                    image={e.userImage}
                    theme="image"
                    size={60}
                  />
                  <div className="friend-info">
                    <div className="who">{e.userName}</div>
                    <div className="accWhen">{e.walletAddress}</div>
                  </div>
                  <div className="interactionNums">
                    <Bin
                      fontSize={20}
                      color="#FF0000"
                      onClick={() => deletefriends(e.id)}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default FriendsList;
