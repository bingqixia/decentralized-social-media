import { ConnectButton } from "@rainbow-me/rainbowkit"
import Controls from "./Controls"

export default function Sidebar(props: { isOwner: boolean }) {
  return (
    <aside className="hidden min-h-screen w-1/4 flex-col lg:flex">
      <div className="mt-3 self-center">
        <ConnectButton label="Sign in" chainStatus="none" showBalance={true} />
      </div>
      <Controls />
    </aside>
  )
}
