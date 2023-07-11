import { ethers } from "ethers"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import {
  useAccount,
  useContractRead,
  useContractWrite,
  UserRejectedRequestError,
} from "wagmi"
import { contractABI, contractAddress } from "../lib/contract"
import { Tweet as TweetType, TweetProps } from "../lib/types"
import Address from "./Address"
import { useTweets } from "./AppProvider"
import Avatar from "./Avatar"
import EditModal from "./EditModal"
import ReplyModal from "./ReplyModal"

// Need type definitions, see: https://github.com/iamkun/dayjs/issues/297
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime)

export default function Tweet(props: TweetProps) {
  const [address, setAddress] = useState("")
  const [price, setPrice] = useState("")
  const [tweet, setTweet]: [any, any] = useState()
  const [retweet, setRetweet]: [any, any] = useState()
  const [message, setMessage] = useState("")
  const [replyModal, setReplyModal] = useState(false)
  const [editModal, setEditModal] = useState(false)

  const { tweets } = useTweets()
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
          console.debug("Tweeted --", data.hash)
          console.debug(
            "Retrieved total tweet count --",
            value.data!.toNumber()
          )
        })
      },
      onError(error) {
        if (error instanceof UserRejectedRequestError) {
          toast.error("User rejected transaction")
          console.error("User rejected transaction")
        } else {
          toast.error("Transaction failed")
          console.error("Transaction failed --", error)
        }
      },
    }
  )

  const { write: deleteTweet } = useContractWrite(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "deleteTweet",
    {
      onSuccess(data) {
        totalTweetsRefetch().then((value) => {
          toast.success("Deleted tweet!")
          console.debug("Deleted --", data.hash)
          console.debug(
            "Retrieved total tweet count --",
            value.data!.toNumber()
          )
        })
      },
      onError(error) {
        if (error instanceof UserRejectedRequestError) {
          toast.error("User rejected transaction")
          console.error("User rejected transaction")
        } else if (error.message.includes("Unauthorized()")) {
          toast.error("You are not the author!")
          console.error("Unauthorized --", error)
        } else {
          toast.error("Transaction failed")
          console.error("Transaction failed --", error)
        }
      },
    }
  )

  /**
   * Retweet the specified tweet
   * @param {number} id
   */
  const sendRetweet = async (id: number) => {
    try {
      newTweet({
        args: ["", 0, id],
        overrides: { value: ethers.utils.parseEther(price) },
      })
    } catch (error) {
      toast.error("Transaction failed")
      console.error("Transaction failed --", error)
    }
  }

  /**
   * Delete the specified tweet from the contract
   * @param {number} id
   */
  const removeTweet = async (id: number) => {
    try {
      deleteTweet({
        args: [id],
      })
    } catch (error) {
      toast.error("Transaction failed")
      console.error("Transaction failed --", error)
    }
  }

  /**
   * Filter for all replies to a specified tweet
   * @param {number} id
   * @returns {Array}
   */
  const getReplies = (id: number): [number, TweetType][] => {
    if (tweets) {
      let replies = [...tweets.entries()].filter(
        (tweet) => tweet[1].replyID.eq(id) && !tweet[1].deleted
      )
      return replies
    }
    return []
  }

  /*
   * On page load, get the relevant tweet or retweet
   */
  useEffect(() => {
    if (tweets && props.id && tweets.get(props.id)!.retweetID.isZero()) {
      setTweet(tweets.get(props.id))
    } else if (tweets && props.id) {
      const retweetID = tweets.get(props.id)!.retweetID
      setTweet(tweets.get(retweetID.toNumber()))
      setRetweet(tweets.get(props.id))
    }
  }, [tweets, props.id])

  return (
    <>
      {retweet && (
        <div className="ml-2 mt-2 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="inline text-gray-500"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"></path>
            <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"></path>
          </svg>
          <Address
            address={retweet.from}
            styles="ml-2 font-semibold text-gray-500"
            suffix="retweeted"
          />
        </div>
      )}
      {tweet && (
        <div className="flex">
          <div className="flex min-h-fit min-w-fit flex-col">
            <div
              className={
                retweet || tweet.replyID.isZero()
                  ? "pt-3"
                  : "mb-1 h-3 w-0.5 self-center bg-gray-400"
              }
            />
            <Avatar address={tweet.from} />
            {props.replies.length > 0 && (
              <div className="mt-1 h-full w-0.5 self-center bg-gray-400" />
            )}
          </div>
          <div className="grow pt-3 pb-3">
            <Address address={tweet.from} />
            <span
              className="ml-1"
              title={tweet.timestamp.toLocaleString("en-US", {
                timeStyle: "short",
                dateStyle: "long",
              })}
            >
              - {dayjs(tweet.timestamp).fromNow()}
            </span>
            <div>{tweet.message}</div>
          </div>
        </div>
      )}
      <section>
        {props.replies &&
          Array.from(props.replies, ([id]) => {
            const replies = getReplies(id)
            return <Tweet id={id} key={id} replies={replies} />
          })}
      </section>
      {(replyModal || editModal) && (
        <div
          className="fixed inset-0 z-10 bg-gray-500 bg-opacity-50"
          id="replyModal-overlay"
        />
      )}
      {replyModal && (
        <ReplyModal
          id={props.id}
          address={address}
          tweet={tweet}
          modal={replyModal}
          setModal={setReplyModal}
        />
      )}
      {editModal && (
        <EditModal
          id={props.id}
          address={address}
          modal={editModal}
          setModal={setEditModal}
          message={message}
          setMessage={setMessage}
        />
      )}
    </>
  )
}
