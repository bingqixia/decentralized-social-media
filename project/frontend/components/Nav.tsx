import Link from "next/link"
import { useState } from "react"
import { useAccount } from "wagmi"

export default function Nav() {
  const [address, setAddress] = useState("")
  useAccount({
    onSuccess(data) {
      if (data && data.address && !address) {
        setAddress(data.address)
      }
    },
  })

  return (
    <nav className="hidden min-h-screen w-1/2 flex-col md:flex lg:w-1/4">
      <Link href="/">
        <a className="no-link flex items-center rounded-full p-2 text-xl font-medium transition duration-200 hover:bg-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="ml-2 mr-4 inline"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <polyline points="5 12 3 12 12 3 21 12 19 12"></polyline>
            <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7"></path>
            <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6"></path>
          </svg>
          <span>Home</span>
        </a>
      </Link>

      <Link href="/">
        <a className="no-link mt-4 flex cursor-not-allowed items-center rounded-full p-2 text-xl font-medium text-gray-400 transition duration-200 hover:bg-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="ml-2 mr-4 inline"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <circle cx="12" cy="7" r="4"></circle>
            <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"></path>
          </svg>
          <span>Profile</span>
        </a>
      </Link>
    </nav>
  )
}
