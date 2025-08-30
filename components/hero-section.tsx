"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Trophy, Coins, Clock } from "lucide-react"
import { BuyTicketsModal } from "./buy-tickets-modal"
import { CountdownTimer } from "./countdown-timer"

export function HeroSection() {
  const [showBuyModal, setShowBuyModal] = useState(false)

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Background with African-inspired gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-yellow-500/20 to-red-500/20" />
      <div className="absolute inset-0 bg-black/30" />

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400/30 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-orange-500/30 rounded-full blur-xl animate-pulse" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-white space-y-8">
            <div className="space-y-4">
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 px-4 py-2">
                <Zap className="w-4 h-4 mr-2" />
                African E-Mobility Revolution
              </Badge>

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Win the
                <span className="block text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text">
                  African Thunder
                </span>
                E-Motorcycle
              </h1>

              <p className="text-xl text-white/90 leading-relaxed">
                Join Africa's first blockchain lottery for sustainable mobility. Every ticket supports clean
                transportation and gives you a chance to win amazing electric vehicles designed for African roads.
              </p>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/20">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Coins className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="font-semibold">$1 Tickets</p>
                  <p className="text-sm text-white/70">50% LMET Cashback</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/20">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold">$5,000 Prize</p>
                  <p className="text-sm text-white/70">E-Motorcycle</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/20">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="font-semibold">Instant Rewards</p>
                  <p className="text-sm text-white/70">LMET Tokens</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => setShowBuyModal(true)}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Trophy className="w-5 h-5 mr-2" />
                Buy Tickets Now
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg bg-transparent"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Right Column - Jackpot Card */}
          <div className="flex justify-center">
            <Card className="bg-white/95 backdrop-blur-md w-full max-w-md shadow-2xl border-0">
              <CardContent className="p-8 text-center space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-gray-800">Current Jackpot</h3>
                  <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text">
                    $5,000
                  </div>
                  <p className="text-gray-600">African Thunder E-Motorcycle</p>
                </div>

                {/* Prize Image */}
                <div className="relative">
                  <img
                    src="/roam-electric-motorcycle.png"
                    alt="African Thunder E-Motorcycle"
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=200&width=300&text=African+Thunder+E-Motorcycle"
                    }}
                  />
                  <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                    <Zap className="w-3 h-3 mr-1" />
                    Solar Powered
                  </Badge>
                </div>

                {/* Lottery Stats */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-gray-800">1,247</p>
                    <p className="text-sm text-gray-600">Tickets Sold</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-gray-800">$1</p>
                    <p className="text-sm text-gray-600">Per Ticket</p>
                  </div>
                </div>

                {/* Countdown Timer */}
                <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-gray-700">Draw in:</span>
                  </div>
                  <CountdownTimer targetDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)} />
                </div>

                <Button
                  onClick={() => setShowBuyModal(true)}
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Enter Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Buy Tickets Modal */}
      <BuyTicketsModal isOpen={showBuyModal} onClose={() => setShowBuyModal(false)} />
    </section>
  )
}
