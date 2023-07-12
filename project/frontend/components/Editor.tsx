import { ConnectButton } from "@rainbow-me/rainbowkit"
import { ethers } from "ethers"
import Link from "next/link"
import { useState } from "react"
import toast from "react-hot-toast"
import { Web3Storage } from "web3.storage"

import {
  useAccount,
  useContractRead,
  useContractWrite,
  UserRejectedRequestError,
} from "wagmi"
import { contractABI, contractAddress } from "../lib/contract"
import Avatar from "./Avatar"

export default function Editor() {
  const [address, setAddress] = useState("")
  const [message, setMessage] = useState("")
  const [price, setPrice] = useState("")
  useAccount({
    onSuccess(data) {
      if (data && data.address && !address) {
        setAddress(data.address)
      }
    },
  })

  /**
   * Contract hooks
   */
  useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "getPrice",
    {
      onSuccess(data) {
        setPrice(ethers.utils.formatEther(data))
      },
    }
  )

  const { refetch: totalTweetsRefetch } = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "getTotalTweets"
  )

  const { write: newTweet } = useContractWrite(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "newTweet",
    {
      onSuccess(data) {
        totalTweetsRefetch().then((value) => {
          toast.success("Sent tweet!")
          console.log("Tweeted --", data.hash)
          console.log(
            "Retrieved total tweet count --",
            value.data!.toNumber()
          )
        })
      },
      onError(error) {
        if (error instanceof UserRejectedRequestError) {
          toast.error("User rejected transaction")
          console.error("User rejected transaction")
        } else if (error.message.includes("SenderCooldown()")) {
          toast.error("Please wait 1 minute before tweeting again!")
          console.error("SenderCooldown --", error)
        } else {
          toast.error("Transaction failed")
          console.error("Transaction failed --", error)
        }
      },
    }
  )

  /**
   * Submit a new tweet to the contract
   */
  // const sendTweet = () => {
  //   try {
  //     newTweet({
  //       args: [message.toString(), 0, 0],
  //       overrides: { value: ethers.utils.parseEther(price) },
  //     })
  //   } catch (error) {
  //     toast.error("Transaction failed")
  //     console.error("Transaction failed --", error)
  //   }
  // }
  const sendTweet = async() => {
    // upload message to IPFS
    console.log("in sendTweet");
    const web3Client = new Web3Storage({
      token: process.env.NEXT_PUBLIC_WEB3STORAGE_TOKEN ?? '',
    });

    try {
      const fileName = process.env.NEXT_PUBLIC_STORAGE_FILE ?? '';
      const buffer = Buffer.from(message.toString());
      const files = [new File([buffer], fileName)];
      
      console.log("sed sendTweet");
      const cid = await web3Client.put(files);
      
      const url = `https://dweb.link/ipfs/${cid}/${fileName}`;
      console.log(url);

      newTweet({
        args: [cid, 0, 0],
        overrides: { value: ethers.utils.parseEther(price) },
      })

      setMessage("");

    } catch (error) {
      toast.error("Oops! Something went wrong")
      console.error("sendTweet failed --", error)
    }
  }

  return (
    <section className="flex flex-col border-b">
      <div className="mb-2 flex items-center justify-between md:mb-0">
        <div className="flex items-center">
          <Link href="/">
            <a className="mt-4 ml-3 block md:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                fill="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M22 4.01c-1 .49 -1.98 .689 -3 .99c-1.121 -1.265 -2.783 -1.335 -4.38 -.737s-2.643 2.06 -2.62 3.737v1c-3.245 .083 -6.135 -1.395 -8 -4c0 0 -4.182 7.433 4 11c-1.872 1.247 -3.739 2.088 -6 2c3.308 1.803 6.913 2.423 10.034 1.517c3.58 -1.04 6.522 -3.723 7.651 -7.742a13.84 13.84 0 0 0 .497 -3.753c-.002 -.249 1.51 -2.772 1.818 -4.013z"></path>
              </svg>
            </a>
          </Link>
        </div>
        <div className="mt-4 mr-3 block lg:hidden">
          <ConnectButton chainStatus="none" />
        </div>
      </div>

      <div className="mt-2 hidden items-center md:flex">
        <Avatar address={address} />
        {/* <Avatar isRounded image={"../images/cat.png"} theme="image" size={60} /> */}
        <textarea
          rows={5}
          value={message}
          maxLength={280}
          placeholder="What's going on ?"
          onChange={(e) => setMessage(e.target.value)}
          onInput={(e) => {
            ;(e.target as HTMLInputElement).style.height = "auto"
            ;(e.target as HTMLInputElement).style.height =
              (e.target as HTMLInputElement).scrollHeight + "px"
          }}
          className="mr-4 grow resize-none text-xl outline-none"
        />
      </div>
      <div className="ml-3 hidden items-center justify-between md:flex">
        <span className="mb-3 text-sm text-gray-500">Price: {price}Ξ</span>
        <div>
          <span className="text-gray-500">
            {message ? message.length + "/280" : ""}
          </span>
          <button className="button mx-3 mb-3 self-end" onClick={sendTweet}>
            Tweet
          </button>
        </div>
      </div>
    </section>
  )
}
