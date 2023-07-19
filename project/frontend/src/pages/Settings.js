import React,{useState,useEffect} from "react";
import "./Settings.css"; 
import { Input,Upload,Loading,useNotification } from "@web3uikit/core";
import { ethers } from "ethers";
import Web3Modal from 'web3modal';
import { Web3StorageApi } from "../config";
import TwitterAbi from '../abi/UserContract.json';
import { Web3Storage } from 'web3.storage';


const Settings = () =>{

    const notification = useNotification();
    const userName = JSON.parse(localStorage.getItem('userName'));
    const userDescription = JSON.parse(localStorage.getItem('userDescription'));
    const userImage = JSON.parse(localStorage.getItem('userImage'));
    const userBanner = JSON.parse(localStorage.getItem('userBanner'));
    const TwitterContractAddress = JSON.parse(localStorage.getItem('userContractAddress'));

    const [profileFile,setProfileFile] = useState();
    const [bannerFile,setBannerFile] = useState();
    const [name,setName] = useState(userName);
    const [description,setDescription] = useState(userDescription);
    const [loading,setLoading] = useState(false);
    let profileUploadedUrl = userImage;
    let bannerUploadedUrl = userBanner;

    async function storeFile (selectedFile) {
        const client = new Web3Storage({token: Web3StorageApi});
        const rootCid = await client.put(selectedFile);
        let ipfsUploadedUrl = encodeURI(`https://${rootCid}.ipfs.dweb.link/${selectedFile[0].name}`);
        return ipfsUploadedUrl;
    }


    const bannerHandler = (event) =>{
        if(event !=null){
            setBannerFile(event);
        }
    }

    const profileHandler = (event)=>{
        if(event !=null){
            setProfileFile(event);
        }
    }

    useEffect(()=>{

    },[loading]);

    async function updateProfile(){
        setLoading(true);
        if(profileFile != null){
            let  newProfileUploadedUrl = await storeFile([profileFile]);
            profileUploadedUrl = newProfileUploadedUrl;
        }

        if(bannerFile != null){
            let  newBannerUploadedUrl = await storeFile([bannerFile]);
            bannerUploadedUrl = newBannerUploadedUrl;
        }

        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(TwitterContractAddress,TwitterAbi.abi,signer);
        const transaction = await contract.updateUser(name,description,profileUploadedUrl,bannerUploadedUrl);
        await transaction.wait();

        window.localStorage.setItem('userName',JSON.stringify(name));
        window.localStorage.setItem('userDescription',JSON.stringify(description));
        window.localStorage.setItem('userImage',JSON.stringify(profileUploadedUrl));
        window.localStorage.setItem('userBanner',JSON.stringify(bannerUploadedUrl));

        notification({
            type: 'success',
            title: 'Profile Updated Successfully',
            position: 'topR'
        });

        setLoading(false);
    }

    return (
        <>
        <div className="settingsPage">
            <Input label="Nick Name" name="NameChange" width="100%" labelBgColor="#141d26" onChange={(e)=>setName(e.target.value)} value={userName} />
            <Input label="Description" name="DescriptionChange" width="100%" labelBgColor="#141d26" onChange={(e)=>setDescription(e.target.value)} value={userDescription}/>
            <div className="pfp">Change Profile Image</div>
            <Upload onChange={profileHandler} />
            <div className="pfp">Change Banner Image</div>
            <Upload onChange={bannerHandler} />
            { loading? <div className="save"><Loading /></div> :  <div className="save" onClick={updateProfile}>Save</div> }
           
        </div>

        </>
       
    );
}


export default Settings;