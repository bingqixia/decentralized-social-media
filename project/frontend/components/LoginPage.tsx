import { ethers } from "ethers"
import React, { useState } from "react"
import toast from "react-hot-toast"
import { ConnectButton } from "@rainbow-me/rainbowkit"

import {
  useConnect,
  useDisconnect,
  useAccount,
  useContractRead,
  useContractWrite,
  UserRejectedRequestError,
} from "wagmi"

import { contractABI, contractAddress } from "../lib/contract"

export default function LoginPage() {
  const [userContractAddress, setUserContractAddress] = useState("")
  const [address, setAddress] = useState("")
  useAccount({
    onSuccess(data) {
      if (data && data.address && !address) {
        setAddress(data.address)
        console.log("data.address: ", address)
      }
    },
  })

  const disconnect = () =>  {
    useDisconnect();
    setAddress("")
    setUserContractAddress("")
  }

  /**
   * Contract hooks
   */

  const { data: retrieveData, refetch: retrieveContractAddress } =
    useContractRead(
      {
        addressOrName: contractAddress,
        contractInterface: contractABI,
      },
      "Retrieve",
      {
        args: [address],
        onSuccess(data) {
          console.log("retrieve response: ", data)
          setUserContractAddress(data.toString())
        },
        watch: true,
      }
    )

  const { write: register } = useContractWrite(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "Register",
    {
      onSuccess() {
        toast.success("Register Successfully!")
      },
      onError(error) {
        if (error instanceof UserRejectedRequestError) {
          toast.error("Cancelled By User")
          console.log("User rejected register transaction")
        } else {
          toast.error("There are some errors occurred, please try again")
          console.error("Register Transaction failed --", error)
        }
      },
    }
  )

  const { write: deregister } = useContractWrite(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "Deregister",
    {
      onSuccess() {
        toast.success("Deregister Successfully!")
      },
      onError(error) {
        if (error instanceof UserRejectedRequestError) {
          toast.error("Cancelled By User")
          console.error("User rejected Deregister transaction")
        } else {
          toast.error("There are some errors occurred, please try again")
          console.error("Deregister Transaction failed --", error)
        }
      },
    }
  )

  /**
   * Register
   * @param string contractAddress
   */
  const userRegister = async (contractAddress: string) => {
    try {
      console.log("[userRegister] contractAddress: ", contractAddress)
      register({
        args: [ethers.utils.getAddress(contractAddress)],
      })
    } catch (error) {
      toast.error("Transaction error")
      console.error("Transaction error --", error)
    }
  }

  /**
   * Deregister
   * @param string contractAddress
   */
  const userDeregister = async (address: string) => {
    try {
      console.log("[userDeregister] address: ", address)
      deregister({
        args: [ethers.utils.getAddress(address)],
      })
    } catch (error) {
      toast.error("Transaction error")
      console.error("Transaction error --", error)
    }
  }

  // Handle user input changes and trigger contract data retrieval
  const handleRetrieveData = async () => {
    try {
      // Call the retrieveData hook when the button is clicked
      await retrieveContractAddress()

      // Retrieve the result from the contract response
      const result = retrieveData ? retrieveData.toString() : ""
      setUserContractAddress(result)
    } catch (error) {
      console.error("Error fetching contract data:", error)
    }
  }

  return (
    <section className="m-3 rounded-xl bg-gray-100 p-3">
      <h3>Welcomde to Web3</h3>

      {address ? (
        <div className="mt-6 flex flex-col">
          <div>User Address : {address}</div>
          <button
            className="button mx-6 mt-3"
            type="button"
            onClick={handleRetrieveData}
          >
            Retrieve Contract Address
          </button>
          {userContractAddress !== "" ? (
            // account registered
            <div>
              <div>User Contract Address : {userContractAddress}</div>
              {userContractAddress !== ethers.constants.AddressZero ? (
                <div className="mt-6 flex flex-col">
                  <button
                    className="button mx-6 mt-3"
                    type="button"
                    onClick={() => userDeregister(address)}
                  >
                    Deregister from DTwitter
                  </button>
                </div>
              ) : (
                <div className="mt-6 flex flex-col">
                  <button
                    className="button mx-6 mt-3"
                    type="button"
                    onClick={() => userRegister(contractAddress)}
                  >
                    Register to DTwitter with Wallet Account
                  </button>
                </div>
              )}
            </div>
          ) : (
            ""
          )}
          <button
            className="button mx-6 mt-3"
            type="button"
            onClick={disconnect}
          >
            Sign out
          </button>
        </div>
      ) : (
        <div>
          <p className="mt-1">Connect your wallet</p>
          <ConnectButton
            label="Sign in"
            chainStatus="none"
            showBalance={true}
          />
        </div>
      )}
    </section>
  )
}
