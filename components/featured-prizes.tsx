"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, Battery, Leaf, MapPin } from "lucide-react"

const prizes = [
  {
    id: 1,
    name: "African Thunder E-Motorcycle",
    description: "Solar-powered electric motorcycle designed for African roads with all-terrain capabilities",
    value: "$5,000",
    image: "/uber-electric-motorbike.png",
    features: ["Solar Charging", "150km Range", "All-Terrain", "GPS Navigation"],
    availability: "Main Prize",
    color: "from-orange-500 to-red-500",
  },
  {
    id: 2,
    name: "Ubuntu Electric Scooter",
    description: "Eco-friendly urban mobility solution perfect for city commuting",
    value: "$2,000",
    image: "/uber-electric-motorbike.png",
    features: ["Fast Charging", "80km Range", "Lightweight", "App Control"],
    availability: "Secondary Prize",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 3,
    name: "Savanna E-Bike",
    description: "All-terrain electric bicycle built for African adventures and daily commutes",
    value: "$1,000",
    image: "/uber-electric-motorbike.png",
    features: ["Pedal Assist", "100km Range", "Rugged Design", "LED Lights"],
    availability: "Weekly Prize",
    color: "from-green-500 to-emerald-500",
  },
]

export function FeaturedPrizes() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">African E-Mobility Prizes</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Win sustainable transportation solutions designed specifically for African roads and communities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {prizes.map((prize, index) => (
            <Card
              key={prize.id}
              className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 group overflow-hidden"
            >
              <div className="relative">
                <img
                  src={prize.image || "/placeholder.svg"}
                  alt={prize.name}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `/placeholder.svg?height=300&width=400&text=${encodeURIComponent(prize.name)}`
                  }}
                />
                <div className="absolute top-4 left-4">
                  <Badge className={`bg-gradient-to-r ${prize.color} text-white border-0`}>{prize.availability}</Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-black/50 text-white border-0">
                    <Zap className="w-3 h-3 mr-1" />
                    Electric
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{prize.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{prize.description}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold bg-gradient-to-r ${prize.color} bg-clip-text text-transparent`}>
                    {prize.value}
                  </span>
                  <div className="flex items-center space-x-1 text-green-600">
                    <Leaf className="w-4 h-4" />
                    <span className="text-sm font-medium">Eco-Friendly</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-800 text-sm">Key Features:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {prize.features.map((feature, i) => (
                      <div key={i} className="flex items-center space-x-2 text-sm text-gray-600">
                        {feature.includes("Range") && <Battery className="w-3 h-3 text-green-500" />}
                        {feature.includes("Solar") && <Zap className="w-3 h-3 text-yellow-500" />}
                        {feature.includes("GPS") && <MapPin className="w-3 h-3 text-blue-500" />}
                        {!feature.includes("Range") && !feature.includes("Solar") && !feature.includes("GPS") && (
                          <div className="w-3 h-3 bg-gray-400 rounded-full" />
                        )}
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  className={`w-full bg-gradient-to-r ${prize.color} hover:opacity-90 text-white font-semibold transition-all duration-300 transform group-hover:scale-105`}
                >
                  Enter to Win
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-white rounded-2xl p-8 max-w-4xl mx-auto shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Supporting African E-Mobility</h3>
            <p className="text-gray-600 leading-relaxed">
              Every ticket purchased supports the development of sustainable transportation solutions across Africa. Our
              prizes are specifically designed to handle African road conditions, climate, and infrastructure needs.
              Join us in revolutionizing mobility across the continent while having a chance to win amazing prizes!
            </p>
            <div className="flex justify-center items-center space-x-8 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">50+</div>
                <div className="text-gray-500 text-sm">African Cities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">1000+</div>
                <div className="text-gray-500 text-sm">Happy Winners</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">100%</div>
                <div className="text-gray-500 text-sm">Sustainable</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
