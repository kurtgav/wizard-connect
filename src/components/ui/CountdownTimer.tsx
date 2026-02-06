// ============================================
// COUNTDOWN TIMER - PIXEL CONCEPT DESIGN
// Vaporwave style countdown with cute elements
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { getTimeRemaining } from '@/lib/utils'

interface CountdownTimerProps {
  targetDate: Date | string
  className?: string
}

export function CountdownTimer({ targetDate, className = '' }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(targetDate))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining(targetDate))
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  if (timeRemaining.isExpired) {
    return (
      <div className={`pixel-card text-center ${className}`} style={{
        background: 'linear-gradient(135deg, #00D4FF 0%, #9B59B6 50%, #FF6B9D 100%)'
      }}>
        <div className="text-5xl mb-4 pixel-bounce">🎉</div>
        <h3 className="pixel-text-shadow pixel-font-heading text-2xl font-bold mb-2 text-white">
          ▶ LAUNCHED!
        </h3>
        <p className="pixel-font-body text-base text-white">
          The survey is now open! ✨
        </p>
        <div className="mt-3 flex justify-center gap-2">
          <span className="text-xl">🐣</span>
          <span className="text-xl">💕</span>
          <span className="text-xl">🐤</span>
        </div>
      </div>
    )
  }

  const TimeBlock = ({ value, label, color }: { value: number; label: string; color: string }) => (
    <div
      className="pixel-card p-3 text-center min-w-[85px] hover-lift pixel-shine-effect"
      style={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FCFF 100%)'
      }}
    >
      <div
        className="text-4xl md:text-5xl font-bold mb-1 pixel-font-heading"
        style={{
          color: color,
          textShadow: '2px 2px 0 #2C3E50'
        }}
      >
        {value.toString().padStart(2, '0')}
      </div>
      <div
        className="pixel-font-body text-xs uppercase tracking-wide"
        style={{ color: '#7F8C8D' }}
      >
        {label}
      </div>
      {/* Decorative dot */}
      <div className="mt-1 text-xs opacity-50" style={{ color }}>▪</div>
    </div>
  )

  // Separator component
  const Separator = () => (
    <div className="flex flex-col items-center justify-center text-2xl opacity-60" style={{ color: '#FF6B9D' }}>
      <span className="pixel-pulse">:</span>
    </div>
  )

  return (
    <div className={`${className}`}>
      <div className="flex gap-2 md:gap-3 justify-center items-center flex-wrap">
        <TimeBlock value={timeRemaining.days} label="Days" color="#FF6B9D" />
        <Separator />
        <TimeBlock value={timeRemaining.hours} label="Hours" color="#00D4FF" />
        <Separator />
        <TimeBlock value={timeRemaining.minutes} label="Mins" color="#9B59B6" />
        <Separator />
        <TimeBlock value={timeRemaining.seconds} label="Secs" color="#FF8E53" />
      </div>

      {/* Decorative elements below countdown */}
      <div className="flex justify-center items-center gap-3 mt-4 opacity-50">
        <span className="text-lg">⭐</span>
        <span className="text-xs pixel-font-body" style={{ color: '#7F8C8D' }}>
          Until Survey Opens
        </span>
        <span className="text-lg">⭐</span>
      </div>
    </div>
  )
}
