import React,{useState,useRef} from "react";
import "./Home.css"; 
import { Avatar,Loading,useNotification } from '@web3uikit/core';
import {Image, Twitter } from '@web3uikit/icons';
import TweetInFeed from "../components/TweetInFeed";
import { ethers } from "ethers";// web3 sotrage
import Web3Modal from 'web3modal';
import { Web3StorageApi, MessageFileName } from "../config";
import TwitterAbi from '../abi/UserContract.json';
import { Web3Storage } from 'web3.storage';
import { Buffer } from "buffer";

//storage
const Home = () =>{

    const inputFile = useRef(null);
    const [selectedImage,setSelectedImage] = useState();
    const [tweetText,setTweetText] = useState('');
    const userImage = JSON.parse(localStorage.getItem('userImage'));
    const [selectedFile,setSelectedFile] = useState();
    const [uploading,setUploading]= useState(false);
    let imageIpfsUrl = '';
    let textIpfsUrl = '';
    const notification = useNotification();
    const TwitterContractAddress = JSON.parse(localStorage.getItem('userContractAddress'));

    async function storeFile () {
        try {
            const buffer = Buffer.from(tweetText);
            let files = null;
            if(selectedImage) {
                files = [new File([buffer], MessageFileName), selectedFile];
                const client = new Web3Storage({token: Web3StorageApi});
                const rootCid = await client.put(files);
                imageIpfsUrl = encodeURI(`https://${rootCid}.ipfs.dweb.link/${selectedFile.name}`);  // storage end
                textIpfsUrl = encodeURI(`https://${rootCid}.ipfs.dweb.link/${MessageFileName}`);  // storage end
                console.log("storeFile => ", "imageUrl: ", imageIpfsUrl, ", messageUrl: ", textIpfsUrl)
            } else {
                files = [new File([buffer], MessageFileName)];
                const client = new Web3Storage({token: Web3StorageApi});
                const rootCid = await client.put(files);
                textIpfsUrl = encodeURI(`https://${rootCid}.ipfs.dweb.link/${MessageFileName}`);  // storage end
                console.log("storeFile => ", "imageUrl: ", imageIpfsUrl, ", messageUrl: ", textIpfsUrl)
            }
           
        } catch (error) {
            console.error(`upload tweet to ipfs failed! Error -> ${error}`);
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
        if(tweetText.trim().length < 5){
            notification({
                type: 'warning',
                message:'Minimum 5 characters',
                title: 'Tweet Field required',
                position: 'topR'
            });
            return;
        }
        setUploading(true);
        await storeFile();
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(TwitterContractAddress,TwitterAbi.abi,signer);
       
        try{
            const transaction = await contract.addTweet(textIpfsUrl,imageIpfsUrl);
            await transaction.wait();
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
                title: 'Transaction Error',
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