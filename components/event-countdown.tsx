"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface EventCountdownProps {
  eventDate: string
  eventTitle?: string
  size?: "sm" | "md" | "lg"
  showTitle?: boolean
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function EventCountdown({ 
  eventDate, 
  eventTitle, 
  size = "md", 
  showTitle = false 
}: EventCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const eventTime = new Date(eventDate).getTime()
      const difference = eventTime - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({ days, hours, minutes, seconds })
        setIsExpired(false)
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        setIsExpired(true)
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [eventDate])

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }

  const cardSizeClasses = {
    sm: "p-2",
    md: "p-4",
    lg: "p-6"
  }

  const numberSizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl"
  }

  if (isExpired) {
    return (
      <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 transform perspective-1000 hover:rotate-y-2 bg-gradient-to-br from-red-500/10 to-orange-500/10 dark:from-red-900/20 dark:to-orange-900/20 backdrop-blur-sm border-red-200/50 dark:border-red-700/50">
        <CardContent className={`${cardSizeClasses[size]} text-center`}>
          {showTitle && eventTitle && (
            <h3 className={`font-bold text-slate-700 dark:text-slate-300 mb-2 ${sizeClasses[size]}`}>
              {eventTitle}
            </h3>
          )}
          <div className="text-red-600 dark:text-red-400 font-bold">
            Event Started
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 transform perspective-1000 hover:rotate-y-2 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/20 dark:to-purple-900/20 backdrop-blur-sm border-indigo-200/50 dark:border-indigo-700/50">
      <CardContent className={`${cardSizeClasses[size]} text-center`}>
        {showTitle && eventTitle && (
          <h3 className={`font-bold text-slate-700 dark:text-slate-300 mb-4 ${sizeClasses[size]}`}>
            {eventTitle}
          </h3>
        )}
        
        <div className="grid grid-cols-4 gap-2 md:gap-4">
          <div className="transform hover:scale-110 transition-transform duration-300">
            <div className={`${numberSizeClasses[size]} font-bold bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
              {timeLeft.days.toString().padStart(2, '0')}
            </div>
            <div className={`${sizeClasses[size]} text-slate-600 dark:text-slate-400 font-medium`}>
              Days
            </div>
          </div>
          
          <div className="transform hover:scale-110 transition-transform duration-300">
            <div className={`${numberSizeClasses[size]} font-bold bg-gradient-to-br from-emerald-600 to-teal-600 bg-clip-text text-transparent`}>
              {timeLeft.hours.toString().padStart(2, '0')}
            </div>
            <div className={`${sizeClasses[size]} text-slate-600 dark:text-slate-400 font-medium`}>
              Hours
            </div>
          </div>
          
          <div className="transform hover:scale-110 transition-transform duration-300">
            <div className={`${numberSizeClasses[size]} font-bold bg-gradient-to-br from-amber-600 to-orange-600 bg-clip-text text-transparent`}>
              {timeLeft.minutes.toString().padStart(2, '0')}
            </div>
            <div className={`${sizeClasses[size]} text-slate-600 dark:text-slate-400 font-medium`}>
              Min
            </div>
          </div>
          
          <div className="transform hover:scale-110 transition-transform duration-300">
            <div className={`${numberSizeClasses[size]} font-bold bg-gradient-to-br from-pink-600 to-rose-600 bg-clip-text text-transparent`}>
              {timeLeft.seconds.toString().padStart(2, '0')}
            </div>
            <div className={`${sizeClasses[size]} text-slate-600 dark:text-slate-400 font-medium`}>
              Sec
            </div>
          </div>
        </div>
        
        <div className={`mt-3 text-slate-600 dark:text-slate-400 font-medium ${sizeClasses[size]}`}>
          until event starts
        </div>
      </CardContent>
    </Card>
  )
}
