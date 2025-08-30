"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Coins, Trophy, TrendingUp, Gift, Ticket, Zap, ExternalLink, Wallet, PiggyBank } from "lucide-react"
import { Header } from "@/components/header"
import { BuyTicketsModal } from "@/components/buy-tickets-modal"
import { useAccount } from "wagmi"

export default function Dashboard() {
  const [showBuyModal, setShowBuyModal] = useState(false)
  const { address, isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-lg">
            <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              Please connect your wallet to access your dashboard and view your lottery tickets.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Dashboard</h1>
          <p className="text-gray-600">Track your tickets, tokens, and rewards in the LuckyMotors lottery</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white shadow-sm border">
            <TabsTrigger value="overview" className="text-gray-600 data-[state=active]:bg-gray-50">
              Overview
            </TabsTrigger>
            <TabsTrigger value="tickets" className="text-gray-600 data-[state=active]:bg-gray-50">
              My Tickets
            </TabsTrigger>
            <TabsTrigger value="tokens" className="text-gray-600 data-[state=active]:bg-gray-50">
              LMET Tokens
            </TabsTrigger>
            <TabsTrigger value="staking" className="text-gray-600 data-[state=active]:bg-gray-50">
              Staking
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Active Tickets</CardTitle>
                  <Ticket className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">12</div>
                  <p className="text-xs text-gray-500">+3 from last week</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">LMET Balance</CardTitle>
                  <Coins className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">1,247</div>
                  <p className="text-xs text-gray-500">≈ $12.47 USD</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Spent</CardTitle>
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">$24.00</div>
                  <p className="text-xs text-gray-500">24 tickets purchased</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Rewards Earned</CardTitle>
                  <Gift className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">1,200</div>
                  <p className="text-xs text-gray-500">LMET tokens earned</p>
                </CardContent>
              </Card>
            </div>

            {/* Current Lottery Info */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Current Lottery</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Prize:</span>
                  <span className="text-gray-800 font-semibold">African Thunder E-Motorcycle ($5,000)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Your Tickets:</span>
                  <Badge className="bg-yellow-100 text-yellow-800">12 tickets</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Tickets:</span>
                  <span className="text-gray-800">1,247</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Your Win Chance:</span>
                    <span className="text-gray-800 font-semibold">0.96%</span>
                  </div>
                  <Progress value={0.96} className="h-2" />
                </div>
                <Button
                  onClick={() => setShowBuyModal(true)}
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                >
                  <Ticket className="w-4 h-4 mr-2" />
                  Buy More Tickets
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-800">My Lottery Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Active Tickets */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Active Tickets (12)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {Array.from({ length: 12 }, (_, i) => (
                        <div
                          key={i}
                          className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3 text-center"
                        >
                          <div className="text-sm text-gray-600">Ticket</div>
                          <div className="text-lg font-bold text-gray-800">#{1000 + i}</div>
                          <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-gray-200" />

                  {/* Previous Tickets */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Previous Rounds (12)</h3>
                    <div className="space-y-2">
                      {Array.from({ length: 3 }, (_, i) => (
                        <div
                          key={i}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex justify-between items-center"
                        >
                          <div>
                            <div className="text-gray-800 font-medium">Round #{50 - i}</div>
                            <div className="text-gray-500 text-sm">4 tickets • Ended 2 days ago</div>
                          </div>
                          <Badge variant="outline" className="border-gray-300 text-gray-600">
                            Not Won
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* LMET Tokens Tab */}
          <TabsContent value="tokens" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Token Balance */}
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-800 flex items-center space-x-2">
                    <Coins className="w-5 h-5" />
                    <span>LMET Token Balance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-800 mb-2">1,247</div>
                    <div className="text-gray-500">LMET Tokens</div>
                    <div className="text-lg text-gray-600">≈ $12.47 USD</div>
                  </div>

                  <Separator className="bg-gray-200" />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Earned from tickets:</span>
                      <span className="text-gray-800">1,200 LMET</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Staking rewards:</span>
                      <span className="text-gray-800">47 LMET</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowBuyModal(true)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    <Coins className="w-4 h-4 mr-2" />
                    Use Tokens to Buy Tickets
                  </Button>
                </CardContent>
              </Card>

              {/* Token Utility */}
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-800">Token Utility</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Ticket className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="text-gray-800 font-medium">Buy Tickets</div>
                        <div className="text-gray-500 text-sm">100 LMET = $1 ticket</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <PiggyBank className="w-5 h-5 text-green-500" />
                      <div>
                        <div className="text-gray-800 font-medium">Stake for Rewards</div>
                        <div className="text-gray-500 text-sm">Earn yield on Uniswap</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <div>
                        <div className="text-gray-800 font-medium">Deflationary</div>
                        <div className="text-gray-500 text-sm">Tokens burned when used</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Staking Tab */}
          <TabsContent value="staking" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Uniswap Staking */}
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-800 flex items-center space-x-2">
                    <img src="/placeholder.svg?height=20&width=20&text=UNI" alt="Uniswap" className="w-5 h-5" />
                    <span>Uniswap V3 Pool</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">12.5%</div>
                    <div className="text-gray-500">Current APY</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Your Stake:</span>
                      <span className="text-gray-800">500 LMET</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rewards Earned:</span>
                      <span className="text-gray-800">47 LMET</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pool Share:</span>
                      <span className="text-gray-800">0.05%</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button className="flex-1 bg-transparent" variant="outline">
                      Stake More
                    </Button>
                    <Button className="flex-1 bg-transparent" variant="outline">
                      Unstake
                    </Button>
                  </div>

                  <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Uniswap
                  </Button>
                </CardContent>
              </Card>

              {/* SushiSwap Coming Soon */}
              <Card className="bg-white shadow-sm opacity-60">
                <CardHeader>
                  <CardTitle className="text-gray-800 flex items-center space-x-2">
                    <img src="/placeholder.svg?height=20&width=20&text=SUSHI" alt="SushiSwap" className="w-5 h-5" />
                    <span>SushiSwap Pool</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Coming Soon</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400">---%</div>
                    <div className="text-gray-400">Estimated APY</div>
                  </div>

                  <div className="text-center text-gray-500">
                    <p>Additional staking options coming soon!</p>
                    <p className="text-sm">Get notified when available.</p>
                  </div>

                  <Button className="w-full" disabled>
                    Notify Me
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Staking Info */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-800">Staking Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="text-gray-800 font-semibold">Earn Yield</div>
                    <div className="text-gray-500 text-sm">Provide liquidity and earn trading fees</div>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <div className="text-gray-800 font-semibold">Compound Rewards</div>
                    <div className="text-gray-500 text-sm">Automatically reinvest your earnings</div>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <PiggyBank className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-gray-800 font-semibold">Flexible Terms</div>
                    <div className="text-gray-500 text-sm">Stake and unstake anytime</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Buy Tickets Modal */}
      <BuyTicketsModal isOpen={showBuyModal} onClose={() => setShowBuyModal(false)} />
    </div>
  )
}
