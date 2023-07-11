import { ConnectButton } from "@rainbow-me/rainbowkit"

export default function Sidebar(props: { isOwner: boolean }) {
  return (
    <aside className="hidden min-h-screen w-1/4 flex-col lg:flex">
      <div className="mt-3 self-center">
        <ConnectButton chainStatus="none" showBalance={true} />
      </div>
    </aside>
  )
}
