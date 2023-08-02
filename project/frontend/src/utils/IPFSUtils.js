import { Web3Storage } from "web3.storage";
import { Buffer } from "buffer";
import { MetaDataStr, Web3StorageApi } from "../config";
import * as Name from "w3name";

function makeStorageClient() {
    return new Web3Storage({token: Web3StorageApi});
}

const createName = async (signer) => {
    // create ipns
    const name = await Name.create();
    console.log("created new name: ", name.toString());

    // publish the first revision of this name
    const body = {
      page: 0,
      totalAmount: 0,
      tweets: [],
      previous: null,
    };

    const ipnsValue = await uploadFileToIPFS(body);
    console.log('ipnsValue', ipnsValue);
    // bind first revision
    const signingkey = name.key.bytes;
    publishRevision(signingkey, ipnsValue, true);
    return name;
  }

const publishRevision = async (signkey, value, isFirst=false) => {
    const name = await Name.from(signkey);
    console.log("load name: ", name.toString());
    try {
      if(isFirst) {
        console.log("publish first Revision: ", value);
        const revision = await Name.v0(name, value);
        console.log("first Revision: ", revision);
        await Name.publish(revision, name.key);
      } else {
        const revision = await Name.resolve(name);
        const nextRevision = await Name.increment(revision, value);
        await Name.publish(nextRevision, name.key);
      }
    } catch(e) {
      console.log(`${e}`);
    }
    return name;
  }

const uploadFileToIPFS = async (body, isImage=false) => {
    let files = null;

    if(isImage === false) {
        const buffer = Buffer.from(JSON.stringify(body));
        files = [new File([buffer], MetaDataStr)];
    } else {
        files = [body]; 
    }
    
    const client = makeStorageClient();
    const cid = await client.put(files, { wrapWithDirectory: false });
    
    const ipnsValue = `${cid}`;
    return ipnsValue;
}


const retrieveFileFromIPFS = async (cid) => {
    const url = encodeURI(`https://${cid}.ipfs.dweb.link`); 
    
    try {
        // Using the 'fetch' API
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const jsonData = await response.json();
        return jsonData; 
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

export {createName, uploadFileToIPFS, retrieveFileFromIPFS, publishRevision};