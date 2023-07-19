import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Sidebar from "./components/Sidebar";
import FriendsList from "./components/FriendsList";
import "./App.css";
import { Button, useNotification, Loading } from "@web3uikit/core";
import { Twitter, Metamask } from "@web3uikit/icons";
import { ethers, utils } from "ethers";
import Web3Modal from "web3modal";
import { AccountManagerContractAddress } from "./config";
import AccountManagerAbi from "./abi/AccountManager.json";
import UserContractAbi from "./abi/UserContract.json";
var toonavatar = require("cartoon-avatar");

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [provider, setProvider] = useState(window.ethereum);
  const notification = useNotification();
  const [loading, setLoadingState] = useState(false);
  const GoerliChainId = 5;
  const [friends, setFriends] = useState([]);

  const alertNotification = (title, message, type) => {
    console.log("alertNotification");
    notification({
      type: type,
      // message: "Change network to Goerli to visit this site",
      message: message,
      title: title,
      // title: "Switch to Goerli Network",
      position: "topR",
    });
  };

  const infoNotification = (accountNum) => {
    console.log("infoNotification");
    notification({
      type: "info",
      message: accountNum,
      title: "Connected to Goerli Account",
      position: "topR",
    });
  };

  useEffect(() => {
    console.log("useEffect");
    if (!provider) {
      window.alert("No Metamask Installed");
      window.location.replace("https://metamask.io");
    }

    connectWallet();

    const handleAccountsChanged = (accounts) => {
      if (provider.chainId === GoerliChainId) {
        infoNotification(accounts[0]);
      }
      // Just to prevent reloading twice for the very first time
      if (JSON.parse(localStorage.getItem("activeAccount")) != null) {
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    };

    const handleChainChanged = (chainId) => {
      if (chainId !== GoerliChainId) {
        //
        alertNotification(
          "Switch to Goerli Network",
          "Change network to Goerli to visit this site",
          "warning"
        );
      }
      window.location.reload();
    };

    const handleDisconnect = () => {};

    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("chainChanged", handleChainChanged);
    provider.on("disconnect", handleDisconnect);
    // eslint-disable-next-line
  }, []);

  async function deployContract(signer) {
    try {
      const contractAbi = UserContractAbi.abi;
      const contractByteCode = UserContractAbi.bytecode;
      console.log("deploy user contract for :", signer.getAddress());
      const factory = new ethers.ContractFactory(
        contractAbi,
        contractByteCode,
        signer
      );
      console.log("contract deploying... ");
      const contract = await factory.deploy();
      await contract.deployed();
      // console.log("contract deployed !", contract.address);
      return contract.address;
    } catch (error) {
      console.log(
        "error when deploy user contract >>>>>>>>>>>>>>>>>>>>>>>>>>>:",
        error
      );
    }
  }

  const connectWallet = async () => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    let provider = new ethers.providers.Web3Provider(connection);
    const getnetwork = await provider.getNetwork();

    if (getnetwork.chainId !== GoerliChainId) {
      alertNotification(
        "Switch to Goerli Network",
        "Change network to Goerli to visit this site",
        "warning"
      );
      try {
        await provider.provider
          .request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: utils.hexValue(GoerliChainId) }],
          })
          .then(() => window.location.reload());
      } catch (switchError) {
        // This error code indicates that the chain has not been added to Metamask
        // So will add Goerli network to their metamask
        if (switchError.code === 4902) {
          try {
            await provider.provider
              .request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: utils.hexValue(GoerliChainId),
                    chainName: "Goerli Testnet",
                    rpcUrls: [
                      "https://goerli.infura.io/v3/ce962a3e5c1b48b5b03844948340ec93",
                    ],
                    blockExplorerUrls: ["https://goerli.etherscan.io"],
                    nativeCurrency: {
                      symbol: "ETH",
                      decimals: 18,
                    },
                  },
                ],
              })
              .then(() => window.location.reload());
          } catch (addError) {
            throw addError;
          }
        }
      }
    } else {
      // It will execute if Goerli chain is connected
      // Here we will verify if user exists or not in our blockchain or else we will update user details in our contract as well as localstorage
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();
      const accountManagerContract = new ethers.Contract(
        AccountManagerContractAddress,
        AccountManagerAbi.abi,
        signer
      );
      let dtwitterAddress = ethers.constants.AddressZero;


      try {
        dtwitterAddress = await accountManagerContract.Retrieve(signerAddress);
        console.log("retrieve: ", dtwitterAddress);
      } catch (error) {
        alertNotification("Retrieve Failed", `Transcation Cancelled by User -> ${error}`, "error");
      }

      if (dtwitterAddress === ethers.constants.AddressZero) {
        setLoadingState(true);
        // this user hasn't registered
        // deploy user contract for this user
        const userContractAddress = await deployContract(signer);
        
        // register to account manager
        if (userContractAddress !== ethers.constants.AddressZero) {
          console.log(
            "deployed success!! userContractAddress --> ",
            userContractAddress
          );
          console.log(
            "start register --> "
          );
          await accountManagerContract.Register(userContractAddress);
          window.localStorage.setItem(
            "userContractAddress",
            JSON.stringify(userContractAddress)
          );

          console.log(
            "end register --> "
          );

          // initial user info for first time user
          const userContract = new ethers.Contract(
            userContractAddress,
            UserContractAbi.abi,
            signer
          );

          let avatar = toonavatar.generate_avatar();
          let defaultBanner =
            "https://cloudfront-us-east-1.images.arcpublishing.com/coindesk/RUU74ZL7GNDTFIM27G2QLC7ETQ.jpg";
          window.localStorage.setItem(
            "activeAccount",
            JSON.stringify(signerAddress)
          );
          window.localStorage.setItem("userName", JSON.stringify(""));
          window.localStorage.setItem("userDescription", JSON.stringify(""));
          window.localStorage.setItem("userImage", JSON.stringify(avatar));
          window.localStorage.setItem(
            "userBanner",
            JSON.stringify(defaultBanner)
          );

          try {
            const transaction = await userContract.updateUser(
              "",
              "",
              avatar,
              defaultBanner
            );
            await transaction.wait();
          } catch (error) {
            console.log("ERROR", error);
            notification({
              type: "warning",
              message: "Get Test ETH from Goerli faucet",
              title: "Require minimum 0.1 ETH",
              position: "topR",
            });
            setLoadingState(false);
            return;
          }
        }
      } else {
        // save contract address
        // setLoadingState(true);
        console.log(
          "retrieve success!! userContractAddress --> ",
          dtwitterAddress
        );
        window.localStorage.setItem(
          "userContractAddress",
          JSON.stringify(dtwitterAddress)
        );
      }

      setProvider(provider);
      setIsAuthenticated(true);
    }
  };

  return (
    <>
      {isAuthenticated ? (
        <div className="page">
        <div className="column sideBar">
            <Sidebar />
          </div>
          <div className="column mainWindow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
          <div className="column rightBar">
            <FriendsList />
          </div>
        </div>
      ) : (
        <div className="centered-div">
          <div>
            <Twitter fill="#ffffff" fontSize={80} className="centered-img" />
            {loading ? (
              <Loading size={50} spinnerColor="green" />
            ) : (
              <Button
                onClick={connectWallet}
                size="xl"
                text="Login with Metamask"
                theme="primary"
                icon={<Metamask />}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default App;
