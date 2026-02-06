// ============================================
// PIXEL CONCEPT PARALLAX BACKGROUND
// Dreamy Sky with Clouds, City Silhouette, and Vaporwave Sunset
// ============================================

'use client'

import { useEffect, useRef, useState } from 'react'

export function ParallaxBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden -z-10"
      style={{
        background: 'linear-gradient(180deg, #87CEEB 0%, #A8D8F0 25%, #C5E3FF 50%, #E0F0FF 75%, #F0F8FF 100%)',
      }}
    >
      {/* Pixel Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(90deg, #2C3E50 1px, transparent 1px),
            linear-gradient(#2C3E50 1px, transparent 1px)
          `,
          backgroundSize: '8px 8px',
        }}
      />

      {/* Fluffy Pixel Clouds - Layer 1 (Distant) */}
      <div
        className="absolute w-full"
        style={{
          top: '5%',
          transform: `translateX(${scrollY * 0.02}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <PixelCloud className="absolute left-[5%]" size="lg" opacity={0.4} />
        <PixelCloud className="absolute left-[40%]" size="md" opacity={0.35} />
        <PixelCloud className="absolute left-[70%]" size="lg" opacity={0.4} />
      </div>

      {/* Fluffy Pixel Clouds - Layer 2 (Mid) */}
      <div
        className="absolute w-full"
        style={{
          top: '12%',
          transform: `translateX(${-scrollY * 0.03}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <PixelCloud className="absolute left-[15%]" size="xl" opacity={0.6} />
        <PixelCloud className="absolute left-[55%]" size="lg" opacity={0.55} />
        <PixelCloud className="absolute left-[85%]" size="md" opacity={0.5} />
      </div>

      {/* Fluffy Pixel Clouds - Layer 3 (Close) */}
      <div
        className="absolute w-full"
        style={{
          top: '20%',
          transform: `translateX(${scrollY * 0.05}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <PixelCloud className="absolute left-[-5%]" size="xl" opacity={0.8} />
        <PixelCloud className="absolute left-[30%]" size="lg" opacity={0.75} />
        <PixelCloud className="absolute left-[65%]" size="xl" opacity={0.85} />
      </div>

      {/* Sunset/Horizon Gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[40%] pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(255, 184, 212, 0.15) 40%, rgba(255, 142, 83, 0.25) 70%, rgba(255, 107, 157, 0.35) 100%)',
        }}
      />

      {/* City Silhouette */}
      <CitySilhouette />

      {/* Floating Stars */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[8%] left-[20%] text-3xl opacity-40 animate-pulse">✧</div>
        <div className="absolute top-[15%] right-[25%] text-2xl opacity-35 animate-pulse" style={{ animationDelay: '0.5s' }}>✦</div>
        <div className="absolute top-[5%] left-[60%] text-2xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}>✧</div>
        <div className="absolute top-[22%] left-[10%] text-xl opacity-25 animate-pulse" style={{ animationDelay: '1.5s' }}>⋆</div>
        <div className="absolute top-[10%] right-[15%] text-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}>✦</div>
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/6 w-72 h-72 rounded-full opacity-[0.06] pointer-events-none" style={{
        background: 'radial-gradient(circle, #FF6B9D 0%, transparent 70%)',
        filter: 'blur(50px)',
        animation: 'float 10s ease-in-out infinite',
      }} />
      <div className="absolute bottom-1/3 right-1/6 w-80 h-80 rounded-full opacity-[0.05] pointer-events-none" style={{
        background: 'radial-gradient(circle, #00D4FF 0%, transparent 70%)',
        filter: 'blur(50px)',
        animation: 'float 10s ease-in-out infinite 5s',
      }} />

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-25px) scale(1.05); }
        }
      `}</style>
    </div>
  )
}

// Pixel Cloud Component
function PixelCloud({ className = '', size = 'md', opacity = 0.8 }: {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  opacity?: number
}) {
  const sizeClasses = {
    sm: 'w-16 h-8',
    md: 'w-24 h-12',
    lg: 'w-36 h-16',
    xl: 'w-48 h-20'
  }

  return (
    <div className={`${className}`} style={{ opacity }}>
      <svg
        viewBox="0 0 120 50"
        className={sizeClasses[size]}
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Main cloud body - Fluffy pixel style */}
        <rect x="20" y="25" width="80" height="20" fill="#FFFFFF" />
        <rect x="15" y="30" width="10" height="10" fill="#FFFFFF" />
        <rect x="95" y="30" width="10" height="10" fill="#FFFFFF" />

        {/* Top bumps */}
        <rect x="25" y="15" width="25" height="15" fill="#FFFFFF" />
        <rect x="45" y="10" width="30" height="20" fill="#FFFFFF" />
        <rect x="70" y="15" width="25" height="15" fill="#FFFFFF" />

        {/* Extra fluff */}
        <rect x="30" y="20" width="15" height="10" fill="#FFFFFF" />
        <rect x="55" y="5" width="15" height="10" fill="#FFFFFF" />
        <rect x="75" y="20" width="15" height="10" fill="#FFFFFF" />

        {/* Soft shadow/highlight for depth */}
        <rect x="20" y="35" width="80" height="5" fill="#E0F0FF" opacity="0.5" />
        <rect x="45" y="8" width="30" height="3" fill="#F8FCFF" />
      </svg>
    </div>
  )
}

// City Silhouette Component
function CitySilhouette() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[25%] pointer-events-none">
      <svg
        viewBox="0 0 1200 200"
        className="absolute bottom-0 w-full h-full"
        preserveAspectRatio="xMidYMax slice"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Background layer - Further buildings */}
        <g fill="#7B68B0" opacity="0.4">
          <rect x="50" y="120" width="40" height="80" />
          <rect x="100" y="100" width="35" height="100" />
          <rect x="180" y="130" width="30" height="70" />
          <rect x="250" y="110" width="45" height="90" />
          <rect x="350" y="125" width="35" height="75" />
          <rect x="420" y="90" width="50" height="110" />
          <rect x="520" y="115" width="40" height="85" />
          <rect x="600" y="105" width="45" height="95" />
          <rect x="700" y="130" width="35" height="70" />
          <rect x="780" y="100" width="40" height="100" />
          <rect x="870" y="120" width="50" height="80" />
          <rect x="970" y="110" width="35" height="90" />
          <rect x="1050" y="125" width="45" height="75" />
          <rect x="1130" y="105" width="40" height="95" />
        </g>

        {/* Foreground layer - Main city */}
        <g fill="#5B4B8A" opacity="0.6">
          {/* Left section */}
          <rect x="0" y="150" width="60" height="50" />
          <rect x="60" y="130" width="50" height="70" />
          <rect x="110" y="145" width="40" height="55" />
          <rect x="150" y="120" width="60" height="80" />

          {/* Center-left */}
          <rect x="210" y="140" width="45" height="60" />
          <rect x="255" y="110" width="55" height="90" />
          <rect x="310" y="135" width="40" height="65" />
          <rect x="350" y="100" width="70" height="100" />

          {/* Center */}
          <rect x="420" y="125" width="50" height="75" />
          <rect x="470" y="95" width="65" height="105" />
          <rect x="535" y="130" width="45" height="70" />
          <rect x="580" y="110" width="55" height="90" />

          {/* Center-right */}
          <rect x="635" y="140" width="40" height="60" />
          <rect x="675" y="105" width="60" height="95" />
          <rect x="735" y="125" width="50" height="75" />
          <rect x="785" y="95" width="55" height="105" />

          {/* Right section */}
          <rect x="840" y="135" width="45" height="65" />
          <rect x="885" y="115" width="60" height="85" />
          <rect x="945" y="140" width="40" height="60" />
          <rect x="985" y="100" width="70" height="100" />
          <rect x="1055" y="130" width="50" height="70" />
          <rect x="1105" y="145" width="45" height="55" />
          <rect x="1150" y="155" width="50" height="45" />
        </g>

        {/* Ground level gradient */}
        <rect x="0" y="185" width="1200" height="15" fill="url(#groundGradient)" />

        <defs>
          <linearGradient id="groundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9B7BC7" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#C5A3E8" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

// Scanline Effect Component
export function ScanlineEffect() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute inset-0" style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(135, 206, 235, 0.015) 2px)',
        backgroundSize: '100% 3px',
      }} />
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(135,206,235,0.03) 50%, rgba(255,255,255,0.02) 100%)',
      }} />
    </div>
  )
}
