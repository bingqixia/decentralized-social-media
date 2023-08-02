import React,{useState,useRef} from "react";
import "./Home.css"; 
import { Avatar,Loading,useNotification } from '@web3uikit/core';
import {Image, Twitter } from '@web3uikit/icons';
import TweetInFeed from "../components/TweetInFeed";
import { ethers } from "ethers";// web3 sotrage
import Web3Modal from 'web3modal';
import { UserImageStr } from "../config";
import TwitterAbi from '../abi/UserContract.json';
import { uploadFileToIPFS, publishRevision, retrieveFileFromIPFS } from "../utils/IPFSUtils";
import * as Name from "w3name";
import { RECORD_NUM_PER_PAGE, UserContractAddressKey } from "../config";
//storage
const Home = () => {

    const inputFile = useRef(null);
    const [selectedImage,setSelectedImage] = useState(null);
    const [tweetText,setTweetText] = useState('');
    const userImage = JSON.parse(localStorage.getItem(UserImageStr));
    const [selectedFile,setSelectedFile] = useState(null);
    const [uploading,setUploading]= useState(false);
    const notification = useNotification();
    const TwitterContractAddress = JSON.parse(localStorage.getItem(UserContractAddressKey));

    async function storeFile (signer, name, signkey) {
        const revision = await Name.resolve(name);
        const lastCid = revision.value;
        const jsonData = await retrieveFileFromIPFS(lastCid);

        const tweeter = await signer.getAddress();

        const id = jsonData.totalAmount;
        const page = Math.ceil((id+1.0)/RECORD_NUM_PER_PAGE)-1;
        const tweets = page === jsonData.page ? jsonData.tweets : [];
        const previous = page === jsonData.page ? jsonData.previous : lastCid;
        let imageCid = null;
        if(selectedImage !== null) {
            try {
                // upload iamge
                imageCid = await uploadFileToIPFS(selectedFile, true);
            } catch (error) {
                console.error(`upload image to ipfs failed! Error -> ${error}`);
                notification({
                    type: "error",
                    message: `Something went wrong. Please refresh and try again. Error ${error}`,
                    title: "Send Tweet Failed",
                    position: "topR",
                });
            }
        }
        
        const tweet = {
            id: id,
            tweeter: tweeter,
            text: tweetText,
            image: imageCid === null ? null : imageCid,
            createTime: Date.now(),
        };
        tweets.push(tweet);
      
        const body = {
            page: page,
            totalAmount: id+1,
            tweets: tweets,
            previous: previous,
        };
      
        try {
            const ipnsValue = await uploadFileToIPFS(body);
            const storedName = await publishRevision(signkey, ipnsValue);
            console.log(`https://name.web3.storage/name/${storedName}/`);
        } catch (error) {
            console.error(`upload metadata to ipfs failed! Error -> ${error}`);
            notification({
                type: "error",
                message: `Something went wrong. Please refresh and try again. Error ${error}`,
                title: "Send Tweet Failed",
                position: "topR",
            });
        }
    }

    const onImageClick = () =>{
        inputFile.current.click();
    }

    const changeHandler = (event) =>{
        const imgFile = event.target.files[0];
        setSelectedImage(URL.createObjectURL(imgFile));
        setSelectedFile(event.target.files[0]);
    }

    async function addTweet(){
        if(tweetText.trim().length < 3){
            notification({
                type: 'warning',
                message:'Minimum 3 characters',
                title: 'Tweet Field required',
                position: 'topR'
            });
            return;
        }
        setUploading(true);
        
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const userContract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer);

        try{
            const signKeyString = await userContract.getSignKey();
            const signKey = new Uint8Array(JSON.parse(signKeyString));
            const name = await Name.from(signKey);
            await storeFile(signer, name, signKey);

            notification({
                type: 'success',
                title: 'Tweet Added Successfully',
                position:'topR'
            });
    
            setSelectedImage(null);
            setTweetText('');
            setSelectedFile(null);
            setUploading(false);
        
        } catch(error){
            notification({
                type: 'error',
                title: 'Send Error',
                message: error.message,
                position:'topR'
            });
            setUploading(false);
        }
    }

    return (
        <>
         <div className="mainContent">
             <div className="profileTweet">
                 <div className="tweetSection">
                     <Avatar isRounded image={userImage} theme="image" size={60} />
                     <textarea value={tweetText} className="textArea" placeholder="What's going on ?" name="tweetTxtArea" onChange={(e)=>setTweetText(e.target.value)}></textarea>
                 </div>
                 <div className="tweetSection">
                     <div className="imgDiv" onClick={onImageClick}>
                         <input type="file" ref={inputFile} onChange={changeHandler} style={{display:"none"}} />
                         { selectedImage ? <img src={selectedImage} width={150} /> : <Image fontSize={25} fill="#ffffff" /> }
                         
                     </div>
                     <div className="tweet" onClick={addTweet}>{uploading ? <Loading /> : 'Tweet'}</div>
                 </div>
             </div>
            <TweetInFeed profile ={false} reload={uploading} />
         </div>
        </>
    );
}


export default Home;