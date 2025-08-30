"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Coins, Trophy, Settings, User } from "lucide-react"

export function Header() {
  return (
    <header className="bg-gray-900/95 backdrop-blur-md border-b border-gray-700 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold">LuckyMotors</h1>
              <p className="text-sm text-gray-300">African E-Mobility Lottery</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors font-medium">
              Home
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2 font-medium"
            >
              <User className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/admin"
              className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2 font-medium"
            >
              <Settings className="w-4 h-4" />
              <span>Admin</span>
            </Link>
            <Link href="/prizes" className="text-gray-300 hover:text-white transition-colors font-medium">
              Prizes
            </Link>
            <Link href="/winners" className="text-gray-300 hover:text-white transition-colors font-medium">
              Winners
            </Link>
          </nav>

          {/* Connect Button */}
          <div className="flex items-center space-x-4">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
              }) => {
                const ready = mounted && authenticationStatus !== "loading"
                const connected =
                  ready && account && chain && (!authenticationStatus || authenticationStatus === "authenticated")

                return (
                  <div
                    {...(!ready && {
                      "aria-hidden": true,
                      style: {
                        opacity: 0,
                        pointerEvents: "none",
                        userSelect: "none",
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <Button
                            onClick={openConnectModal}
                            className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold px-6 py-2 rounded-lg shadow-lg transition-all duration-300"
                          >
                            Connect Wallet
                          </Button>
                        )
                      }

                      if (chain.unsupported) {
                        return (
                          <Button onClick={openChainModal} className="bg-red-500 hover:bg-red-600 text-white">
                            Wrong network
                          </Button>
                        )
                      }

                      return (
                        <div className="flex items-center space-x-3">
                          <Button
                            onClick={openChainModal}
                            variant="outline"
                            size="sm"
                            className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                          >
                            {chain.hasIcon && (
                              <div
                                style={{
                                  background: chain.iconBackground,
                                  width: 16,
                                  height: 16,
                                  borderRadius: 999,
                                  overflow: "hidden",
                                  marginRight: 4,
                                }}
                              >
                                {chain.iconUrl && (
                                  <img
                                    alt={chain.name ?? "Chain icon"}
                                    src={chain.iconUrl || "/placeholder.svg"}
                                    style={{ width: 16, height: 16 }}
                                  />
                                )}
                              </div>
                            )}
                            {chain.name}
                          </Button>

                          <Button
                            onClick={openAccountModal}
                            className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                            variant="outline"
                          >
                            <Coins className="w-4 h-4 mr-2" />
                            {account.displayName}
                            {account.displayBalance ? ` (${account.displayBalance})` : ""}
                          </Button>
                        </div>
                      )
                    })()}
                  </div>
                )
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </div>
    </header>
  )
}
