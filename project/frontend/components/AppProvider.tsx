import React, { createContext, useContext, useState } from "react"
import Confetti from "react-confetti"
import { useAccount, useContractEvent, useContractRead } from "wagmi"
import { contractABI, contractAddress } from "../lib/contract"
import { Tweet as TweetType } from "../lib/types"

const AppContext = createContext<{
  tweets: Map<number, TweetType> | undefined
  setTweets: React.Dispatch<
    React.SetStateAction<Map<number, TweetType> | undefined>
  >
}>(undefined!)

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [address, setAddress] = useState("")
  const [tweets, setTweets] = useState<Map<number, TweetType> | undefined>()
  const [confetti, setConfetti] = useState(false)
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
    "getTweets",
    {
      onSuccess(data) {
        if (data) {

          console.log(
            "getTweets",
            data
          )
    
          setTweets((prevState: Map<number, TweetType> | undefined) => {
            let newState = new Map(prevState)
            data.forEach((tweet, id) => {
              // retrieve message from IPFS
            const fileName = process.env.NEXT_PUBLIC_STORAGE_FILE;
            const cid = tweet[2];
            const url = `https://dweb.link/ipfs/${cid}/${fileName}`;
            fetch(url)
              .then((response) => response.text())
              .then((text) => {
                  console.log("fetched ipfs file: ", url, " message: ", text);
                  newState.set(id + 1, {
                    id: id + 1,
                    from: tweet[0],
                    timestamp: new Date(tweet[1] * 1000),
                    message: text,
                    deleted: tweet[3],
                    replyID: tweet[4],
                    retweetID: tweet[5],
                  })
              }).catch(function() {
                  console.log("error");
              });
            })
            return newState
          })
        }
      },
    }
  )

  useContractEvent(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "NewTweet",
    ([id, from, timestamp, message, deleted, replyID, retweetID]) => {
      console.log(
        "NewTweet",
        id.toNumber(),
        from,
        new Date(timestamp * 1000),
        message,
        deleted,
        replyID,
        retweetID
      )

      // retrieve message from IPFS
      const fileName = process.env.NEXT_PUBLIC_STORAGE_FILE;
      const cid = message;
      const url = `https://dweb.link/ipfs/${cid}/${fileName}`;
      fetch(url)
        .then((response) => response.text())
        .then((text) => {
            console.log(text);
            setTweets((prevState) => {
              let newState = new Map(prevState)
              newState.set(id.toNumber(), {
                id: id.toNumber(),
                from: from,
                timestamp: new Date(timestamp * 1000),
                message: text,
                deleted: deleted,
                replyID: replyID,
                retweetID: retweetID,
              })
              return newState
            })
        }).catch(function() {
            console.log("error");
        });
    },
    {
      once: false,
    }
  )

  useContractEvent(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "EditTweet",
    ([id, from, timestamp, message, deleted, replyID, retweetID]) => {
      console.log(
        "EditTweet",
        id.toNumber(),
        from,
        new Date(timestamp * 1000),
        message,
        deleted,
        replyID,
        retweetID
      )

      // retrieve message from IPFS
      const fileName = process.env.NEXT_PUBLIC_STORAGE_FILE;
      const cid = message;
      const url = `https://dweb.link/ipfs/${cid}/${fileName}`;
      fetch(url)
        .then((response) => response.text())
        .then((text) => {
            console.log(text);
            setTweets((prevState) => {
              let newState = new Map(prevState)
              newState.set(id.toNumber(), {
                id: id.toNumber(),
                from: from,
                timestamp: new Date(timestamp * 1000),
                message: message,
                deleted: deleted,
                replyID: replyID,
                retweetID: retweetID,
              })
              return newState
            })
        }).catch(function() {
            console.log("error");
        });

      
    },
    {
      once: false,
    }
  )

  useContractEvent(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "DeleteTweet",
    ([id, from, timestamp, message, deleted, replyID, retweetID]) => {
      console.log(
        "DeleteTweet",
        id.toNumber(),
        from,
        new Date(timestamp * 1000),
        message,
        deleted,
        replyID,
        retweetID
      )

      setTweets((prevState) => {
        let newState = new Map(prevState)
        newState.delete(id.toNumber())
        return newState
      })
    },
    {
      once: false,
    }
  )

  return (
    <AppContext.Provider value={{ tweets, setTweets }}>
      {confetti && (
        <Confetti
          recycle={false}
          onConfettiComplete={() => setConfetti(false)}
        />
      )}
      {children}
    </AppContext.Provider>
  )
}

export const useTweets = () => useContext(AppContext)
