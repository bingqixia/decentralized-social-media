import React, { useState, useEffect } from "react";
import "./Settings.css";
import { Loading, useNotification } from "@web3uikit/core";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { Link } from "react-router-dom";
import { AccountManagerContractAddress } from "../config";
import AccountManagerAbi from "../abi/AccountManager.json";

const Settings = () => {
  const notification = useNotification();

  const [loading, setLoading] = useState(false);

  useEffect(() => {}, [loading]);

  async function deregister() {
    setLoading(true);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const signerAddress = await signer.getAddress();
    const accountManagerContract = new ethers.Contract(
      AccountManagerContractAddress,
      AccountManagerAbi.abi,
      signer
    );
    console.log(`deregister ${signerAddress} start`);
    await accountManagerContract.Deregister(signerAddress);
    console.log("deregister successfully");

    notification({
      type: "success",
      title: "Deregister Successfully",
      position: "topR",
    });

    setLoading(false);
  }

  return (
    <>
      <div className="settingsPage">
        {loading ? (
          <div className="save">
            <Loading />
          </div>
        ) : (
          <Link className="no-underline" to="/editprofile">
            <div className="save">Edit Profile</div>
          </Link>
        )}
        {loading ? (
          <div className="save">
            <Loading />
          </div>
        ) : (
          <div className="save" onClick={deregister}>
            Deregister
          </div>
        )}
      </div>
    </>
  );
};

export default Settings;
