import {
  connectorsForWallets,
  getDefaultWallets,
  lightTheme,
  RainbowKitProvider,
  wallet,
} from "@rainbow-me/rainbowkit"
import "@rainbow-me/rainbowkit/styles.css"
import { AppProps } from "next/app"
import Head from "next/head"
import Script from "next/script"
import { chain, configureChains, createClient, WagmiConfig } from "wagmi"
import { infuraProvider } from "wagmi/providers/infura"
import { publicProvider } from "wagmi/providers/public"
import { AppProvider } from "../components/AppProvider"
import "../styles/globals.css"
import LoginPage from "../components/LoginPage"
import Profile from "./[address]"
import MyProfile from "../components/MyProfile"
const { chains, provider } = configureChains(
  [
    chain.goerli
  ], // Hardhat must come first due to provider issue, see: https://github.com/tmm/wagmi/discussions/425
  [
    infuraProvider({ infuraId: process.env.REACT_APP_INFURA_ID }),
    publicProvider(),
  ]
)

const { wallets } = getDefaultWallets({
  appName: "DTwitter",
  chains,
})

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: "More",
    wallets: [
      wallet.argent({ chains }),
      wallet.trust({ chains }),
      wallet.ledger({ chains }),
    ],
  },
])

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider
          theme={lightTheme({
            accentColor: "#e73e83",
            accentColorForeground: "white",
            borderRadius: "large",
            fontStack: "system",
          })}
          chains={chains}
          coolMode
        >
          <AppProvider>
            <Component {...pageProps} />
          </AppProvider>
        </RainbowKitProvider>
      </WagmiConfig> */}

    <WagmiConfig client={wagmiClient}>
    <RainbowKitProvider
          theme={lightTheme({
            accentColor: "#e73e83",
            accentColorForeground: "white",
            borderRadius: "large",
            fontStack: "system",
          })}
          chains={chains}
          coolMode
        >
       <LoginPage/>
        </RainbowKitProvider>
      
    </WagmiConfig>
    </>
  )
}
