"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Coins, CreditCard, Zap, Trophy, Plus, Minus } from "lucide-react"
import { useLotteryContract, useTokenContract } from "@/hooks/use-lottery-contract"
import { useAccount } from "wagmi"

interface BuyTicketsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BuyTicketsModal({ isOpen, onClose }: BuyTicketsModalProps) {
  const [ticketCount, setTicketCount] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("eth")

  const { address } = useAccount()
  const { buyTicketsWithETH, buyTicketsWithTokens, ticketPriceETH, ticketPriceTokens, isLoading, error } =
    useLotteryContract()
  const { tokenBalance, approveTokens } = useTokenContract()

  const totalCostETH = Number(ticketPriceETH) * ticketCount
  const totalCostTokens = Number(ticketPriceTokens) * ticketCount
  const lmetReward = totalCostETH * 50 // 50 LMET per $1 spent (assuming $1 = ticketPriceETH)

  const handleBuyTickets = async () => {
    if (!address) {
      return
    }

    try {
      if (paymentMethod === "eth") {
        await buyTicketsWithETH(ticketCount)
      } else {
        // First approve tokens if needed
        await approveTokens(address, totalCostTokens.toString())
        await buyTicketsWithTokens(ticketCount)
      }

      if (!error) {
        onClose()
      }
    } catch (err) {
      console.error("Purchase failed:", err)
    }
  }

  const incrementTickets = () => {
    if (ticketCount < 10) setTicketCount(ticketCount + 1)
  }

  const decrementTickets = () => {
    if (ticketCount > 1) setTicketCount(ticketCount - 1)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span>Buy Lottery Tickets</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Ticket Counter */}
          <div className="space-y-3">
            <Label className="text-gray-700 font-medium">Number of Tickets</Label>
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={decrementTickets}
                disabled={ticketCount <= 1}
                className="w-10 h-10 rounded-full bg-transparent"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <div className="text-3xl font-bold text-gray-800 min-w-[60px] text-center">{ticketCount}</div>
              <Button
                variant="outline"
                size="sm"
                onClick={incrementTickets}
                disabled={ticketCount >= 10}
                className="w-10 h-10 rounded-full"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-500 text-center">Maximum 10 tickets per purchase</p>
          </div>

          {/* Payment Method Tabs */}
          <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="eth" className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4" />
                <span>ETH</span>
              </TabsTrigger>
              <TabsTrigger value="lmet" className="flex items-center space-x-2">
                <Coins className="w-4 h-4" />
                <span>LMET</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="eth" className="space-y-4">
              <Card className="bg-gray-50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tickets:</span>
                    <span className="font-semibold text-gray-800">{ticketCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Price per ticket:</span>
                    <span className="font-semibold text-gray-800">{ticketPriceETH} ETH</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold text-gray-800">Total:</span>
                    <span className="font-bold text-gray-800">{totalCostETH.toFixed(4)} ETH</span>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-800">Reward Bonus</span>
                </div>
                <p className="text-sm text-green-700">
                  You'll receive <strong>{lmetReward.toFixed(0)} LMET tokens</strong> as a reward!
                </p>
              </div>
            </TabsContent>

            <TabsContent value="lmet" className="space-y-4">
              <Card className="bg-purple-50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tickets:</span>
                    <span className="font-semibold text-gray-800">{ticketCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">LMET per ticket:</span>
                    <span className="font-semibold text-gray-800">{ticketPriceTokens} LMET</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Your balance:</span>
                    <span className="font-semibold text-gray-800">{Number(tokenBalance).toFixed(0)} LMET</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold text-gray-800">Total Cost:</span>
                    <span className="font-bold text-gray-800">{totalCostTokens} LMET</span>
                  </div>
                </CardContent>
              </Card>

              {Number(tokenBalance) < totalCostTokens && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">
                    Insufficient LMET balance. You need {totalCostTokens - Number(tokenBalance)} more LMET tokens.
                  </p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Coins className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-800">Token Discount</span>
                </div>
                <p className="text-sm text-blue-700">
                  Using LMET tokens gives you the same ticket value with your earned rewards!
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Prize Info */}
          <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Trophy className="w-5 h-5 text-orange-500" />
                <span className="font-semibold text-gray-800">Current Prize</span>
              </div>
              <p className="text-gray-700 font-medium">African Thunder E-Motorcycle</p>
              <p className="text-sm text-gray-600">Value: $5,000</p>
            </CardContent>
          </Card>

          {/* Buy Button */}
          <Button
            onClick={handleBuyTickets}
            disabled={isLoading || !address || (paymentMethod === "lmet" && Number(tokenBalance) < totalCostTokens)}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 text-lg"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Trophy className="w-5 h-5 mr-2" />
                Buy {ticketCount} Ticket{ticketCount > 1 ? "s" : ""}
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            By purchasing tickets, you agree to the lottery terms and conditions.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
