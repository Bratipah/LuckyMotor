"use client"

import { useState, useEffect } from "react"

interface CountdownTimerProps {
  targetDate: Date
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = targetDate.getTime() - now

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className="flex justify-center space-x-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-800">{timeLeft.days}</div>
        <div className="text-xs text-gray-500">DAYS</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-800">{timeLeft.hours}</div>
        <div className="text-xs text-gray-500">HOURS</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-800">{timeLeft.minutes}</div>
        <div className="text-xs text-gray-500">MINS</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-800">{timeLeft.seconds}</div>
        <div className="text-xs text-gray-500">SECS</div>
      </div>
    </div>
  )
}
