"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Settings,
  Users,
  Trophy,
  Coins,
  AlertCircle,
  Play,
  Pause,
  RefreshCw,
  DollarSign,
  Ticket,
  Crown,
} from "lucide-react"
import { Header } from "@/components/header"
import { useAccount } from "wagmi"

export default function AdminDashboard() {
  const [ethRate, setEthRate] = useState("2000")
  const [isLoading, setIsLoading] = useState(false)
  const { address, isConnected } = useAccount()

  // Mock admin check - in production, implement proper role-based access
  const isAdmin = true // Replace with actual admin check

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-lg">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Access Required</h2>
            <p className="text-gray-600 mb-6">Please connect your wallet to access the admin dashboard.</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-lg">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">You don't have admin privileges to access this dashboard.</p>
          </div>
        </div>
      </div>
    )
  }

  const handleUpdateEthRate = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const handleEndRound = async () => {
    setIsLoading(true)
    // Simulate ending current round
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center space-x-2">
            <Crown className="w-8 h-8 text-yellow-500" />
            <span>Admin Dashboard</span>
          </h1>
          <p className="text-gray-600">Manage the LuckyMotors lottery system</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white shadow-sm border">
            <TabsTrigger value="overview" className="text-gray-600 data-[state=active]:bg-gray-50">
              Overview
            </TabsTrigger>
            <TabsTrigger value="lottery" className="text-gray-600 data-[state=active]:bg-gray-50">
              Lottery Management
            </TabsTrigger>
            <TabsTrigger value="tokens" className="text-gray-600 data-[state=active]:bg-gray-50">
              Token Management
            </TabsTrigger>
            <TabsTrigger value="users" className="text-gray-600 data-[state=active]:bg-gray-50">
              Users
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-gray-600 data-[state=active]:bg-gray-50">
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">$12,450</div>
                  <p className="text-xs text-gray-500">+15.2% from last month</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Active Players</CardTitle>
                  <Users className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">1,247</div>
                  <p className="text-xs text-gray-500">+8.1% from last week</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Tickets Sold</CardTitle>
                  <Ticket className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">12,450</div>
                  <p className="text-xs text-gray-500">Current round: 1,247</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">LMET Circulating</CardTitle>
                  <Coins className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">847K</div>
                  <p className="text-xs text-gray-500">Max supply: 1M</p>
                </CardContent>
              </Card>
            </div>

            {/* Current Lottery Status */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Current Lottery Round</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-gray-600">Round ID</Label>
                    <div className="text-2xl font-bold text-gray-800">#52</div>
                  </div>
                  <div>
                    <Label className="text-gray-600">Prize Pool</Label>
                    <div className="text-2xl font-bold text-gray-800">$5,000</div>
                  </div>
                  <div>
                    <Label className="text-gray-600">Status</Label>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </div>

                <Separator className="bg-gray-200" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Tickets Sold</Label>
                    <div className="text-xl font-semibold text-gray-800">1,247</div>
                  </div>
                  <div>
                    <Label className="text-gray-600">Time Remaining</Label>
                    <div className="text-xl font-semibold text-gray-800">4d 12h 30m</div>
                  </div>
                </div>

                {/* Prize Image */}
                <div className="mt-4">
                  <img
                    src="/electric-motorcycle.png"
                    alt="African Thunder E-Motorcycle"
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=200&width=400&text=African+Thunder+E-Motorcycle"
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-800">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: "Ticket purchased", user: "0x1234...5678", amount: "5 tickets", time: "2 min ago" },
                    { action: "LMET tokens minted", user: "System", amount: "250 LMET", time: "2 min ago" },
                    { action: "Ticket purchased", user: "0x9876...5432", amount: "2 tickets", time: "5 min ago" },
                    { action: "Staking reward", user: "0x1111...2222", amount: "12 LMET", time: "8 min ago" },
                    { action: "Ticket purchased", user: "0x3333...4444", amount: "1 ticket", time: "12 min ago" },
                  ].map((activity, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-gray-800 font-medium">{activity.action}</div>
                        <div className="text-gray-500 text-sm">{activity.user}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-800">{activity.amount}</div>
                        <div className="text-gray-500 text-sm">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lottery Management Tab */}
          <TabsContent value="lottery" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Round Controls */}
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-800">Round Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-600">Current Round</Label>
                    <div className="text-2xl font-bold text-gray-800">#52</div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-600">Status</Label>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>

                  <Separator className="bg-gray-200" />

                  <div className="space-y-3">
                    <Button
                      onClick={handleEndRound}
                      disabled={isLoading}
                      className="w-full bg-red-500 hover:bg-red-600"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Ending Round...
                        </>
                      ) : (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          End Current Round
                        </>
                      )}
                    </Button>

                    <Button className="w-full bg-transparent" variant="outline">
                      <Play className="w-4 h-4 mr-2" />
                      Start New Round
                    </Button>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-gray-600">
                      Ending a round will trigger winner selection and prize distribution.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Prize Management */}
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-800">Prize Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-600">Current Prize</Label>
                    <div className="text-lg font-semibold text-gray-800">African Thunder E-Motorcycle</div>
                    <div className="text-gray-500">Value: $5,000</div>
                  </div>

                  {/* Prize Image */}
                  <div className="mt-4">
                    <img
                      src="/electric-motorcycle.png"
                      alt="African Thunder E-Motorcycle"
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=128&width=300&text=African+Thunder+E-Motorcycle"
                      }}
                    />
                  </div>

                  <Separator className="bg-gray-200" />

                  <div className="space-y-3">
                    <Button className="w-full bg-transparent" variant="outline">
                      <Trophy className="w-4 h-4 mr-2" />
                      Update Prize
                    </Button>

                    <Button className="w-full bg-transparent" variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Prize Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Round History */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-800">Recent Rounds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      round: 51,
                      winner: "0x1234...5678",
                      prize: "Ubuntu E-Scooter",
                      tickets: 892,
                      ended: "2 days ago",
                    },
                    { round: 50, winner: "0x9876...5432", prize: "Savanna E-Bike", tickets: 1156, ended: "1 week ago" },
                    {
                      round: 49,
                      winner: "0x1111...2222",
                      prize: "African Thunder E-Motorcycle",
                      tickets: 1340,
                      ended: "2 weeks ago",
                    },
                  ].map((round, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-gray-800 font-semibold">Round #{round.round}</div>
                          <div className="text-gray-500 text-sm">{round.prize}</div>
                        </div>
                        <Badge variant="outline" className="border-gray-300 text-gray-600">
                          Completed
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Winner</div>
                          <div className="text-gray-800">{round.winner}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Tickets</div>
                          <div className="text-gray-800">{round.tickets}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Ended</div>
                          <div className="text-gray-800">{round.ended}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Token Management Tab */}
          <TabsContent value="tokens" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Token Stats */}
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-800">LMET Token Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-600">Total Supply</Label>
                      <div className="text-xl font-bold text-gray-800">1,000,000</div>
                    </div>
                    <div>
                      <Label className="text-gray-600">Circulating</Label>
                      <div className="text-xl font-bold text-gray-800">847,230</div>
                    </div>
                    <div>
                      <Label className="text-gray-600">Burned</Label>
                      <div className="text-xl font-bold text-gray-800">45,680</div>
                    </div>
                    <div>
                      <Label className="text-gray-600">Staked</Label>
                      <div className="text-xl font-bold text-gray-800">107,090</div>
                    </div>
                  </div>

                  <Separator className="bg-gray-200" />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Minted Today:</span>
                      <span className="text-gray-800">2,450 LMET</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Burned Today:</span>
                      <span className="text-gray-800">1,890 LMET</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Net Change:</span>
                      <span className="text-green-600">+560 LMET</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Token Controls */}
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-800">Token Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mint-amount" className="text-gray-600">
                      Mint Tokens
                    </Label>
                    <div className="flex space-x-2">
                      <Input
                        id="mint-amount"
                        placeholder="Amount to mint"
                        className="bg-white border-gray-300 text-gray-800"
                      />
                      <Button>Mint</Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-600">Contract Actions</Label>
                    <div className="space-y-2">
                      <Button className="w-full bg-transparent" variant="outline">
                        <Pause className="w-4 h-4 mr-2" />
                        Pause Contract
                      </Button>
                      <Button className="w-full bg-transparent" variant="outline">
                        <Settings className="w-4 h-4 mr-2" />
                        Update Roles
                      </Button>
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-gray-600">
                      Token operations require admin privileges and cannot be undone.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-800">User Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">1,247</div>
                    <div className="text-gray-500">Total Users</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">892</div>
                    <div className="text-gray-500">Active This Week</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">156</div>
                    <div className="text-gray-500">New This Week</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">$9.8</div>
                    <div className="text-gray-500">Avg. Spent</div>
                  </div>
                </div>

                {/* Top Users */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-800">Top Players</h3>
                  {[
                    { address: "0x1234...5678", tickets: 45, spent: "$45.00", tokens: "2,250" },
                    { address: "0x9876...5432", tickets: 38, spent: "$38.00", tokens: "1,900" },
                    { address: "0x1111...2222", tickets: 32, spent: "$32.00", tokens: "1,600" },
                    { address: "0x3333...4444", tickets: 28, spent: "$28.00", tokens: "1,400" },
                    { address: "0x5555...6666", tickets: 25, spent: "$25.00", tokens: "1,250" },
                  ].map((user, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                          {i + 1}
                        </div>
                        <div>
                          <div className="text-gray-800 font-medium">{user.address}</div>
                          <div className="text-gray-500 text-sm">{user.tickets} tickets purchased</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-800">{user.spent}</div>
                        <div className="text-gray-500 text-sm">{user.tokens} LMET</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ETH Rate Settings */}
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-800">ETH/USD Rate</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="eth-rate" className="text-gray-600">
                      Current Rate (USD per ETH)
                    </Label>
                    <Input
                      id="eth-rate"
                      value={ethRate}
                      onChange={(e) => setEthRate(e.target.value)}
                      className="bg-white border-gray-300 text-gray-800"
                    />
                  </div>

                  <div className="text-sm text-gray-500">
                    <p>Current ticket price: {(1 / Number.parseFloat(ethRate)).toFixed(6)} ETH</p>
                    <p>Last updated: 2 hours ago</p>
                  </div>

                  <Button onClick={handleUpdateEthRate} disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Update Rate
                      </>
                    )}
                  </Button>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-gray-600">
                      Rate changes affect new ticket purchases immediately.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* System Settings */}
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-800">System Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Contract Status</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Max Tickets per Purchase</span>
                      <span className="text-gray-800">10</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Token Reward Rate</span>
                      <span className="text-gray-800">50%</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Round Duration</span>
                      <span className="text-gray-800">7 days</span>
                    </div>
                  </div>

                  <Separator className="bg-gray-200" />

                  <div className="space-y-2">
                    <Button className="w-full bg-transparent" variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Advanced Settings
                    </Button>

                    <Button className="w-full bg-red-500 hover:bg-red-600">
                      <Pause className="w-4 h-4 mr-2" />
                      Emergency Pause
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
