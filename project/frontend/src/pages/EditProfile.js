import React,{useState,useEffect} from "react";
import "./Settings.css"; 
import { Input,Upload,Loading,useNotification } from "@web3uikit/core";
import { ethers } from "ethers";
import Web3Modal from 'web3modal';
import TwitterAbi from '../abi/UserContract.json';
import { uploadFileToIPFS } from "../utils/IPFSUtils";
import { UserDescriptionStr, UserImageStr, UserBannerStr, UserNameStr, UserContractAddressKey } from "../config";
const EditProfile = () =>{

    const notification = useNotification();
    const userName = JSON.parse(localStorage.getItem(UserNameStr));
    const userDescription = JSON.parse(localStorage.getItem(UserDescriptionStr));
    const userImage = JSON.parse(localStorage.getItem(UserImageStr));
    const userBanner = JSON.parse(localStorage.getItem(UserBannerStr));
    const TwitterContractAddress = JSON.parse(localStorage.getItem(UserContractAddressKey));

    const [profileFile,setProfileFile] = useState();
    const [bannerFile,setBannerFile] = useState();
    const [name,setName] = useState(userName);
    const [description,setDescription] = useState(userDescription);
    const [loading,setLoading] = useState(false);
    let profileUploadedUrl = userImage;
    let bannerUploadedUrl = userBanner;

    // async function storeFile (selectedFile) {
    //     const client = new Web3Storage({token: Web3StorageApi});
    //     const rootCid = await client.put(selectedFile);
    //     let ipfsUploadedUrl = encodeURI(`https://${rootCid}.ipfs.dweb.link/${selectedFile[0].name}`);
    //     return ipfsUploadedUrl;
    // }


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
            let  cid = await uploadFileToIPFS(profileFile, true);
            const newProfileUploadedUrl = encodeURI(`https://${cid}.ipfs.dweb.link`);
            profileUploadedUrl = newProfileUploadedUrl;
        }

        if(bannerFile != null){
            let cid = await uploadFileToIPFS(bannerFile, true);
            const newBannerUploadedUrl = encodeURI(`https://${cid}.ipfs.dweb.link`);
            bannerUploadedUrl = newBannerUploadedUrl;
        }

        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(TwitterContractAddress,TwitterAbi.abi,signer);
        const transaction = await contract.updateUser(name,description,profileUploadedUrl,bannerUploadedUrl);
        await transaction.wait();

        window.localStorage.setItem(UserNameStr,JSON.stringify(name));
        window.localStorage.setItem(UserDescriptionStr,JSON.stringify(description));
        window.localStorage.setItem(UserImageStr,JSON.stringify(profileUploadedUrl));
        window.localStorage.setItem(UserBannerStr,JSON.stringify(bannerUploadedUrl));

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


export default EditProfile;