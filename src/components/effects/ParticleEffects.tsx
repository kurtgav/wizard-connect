// ============================================
// PIXEL CONCEPT PARTICLE EFFECTS
// Dreamy floating stars, hearts, and pixel decorations
// ============================================

'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  emoji?: string
  color?: string
}

interface ParticleEffectsProps {
  type?: 'stars' | 'hearts' | 'sparkles' | 'mixed'
  density?: number | string
  className?: string
}

export function ParticleEffects({
  type = 'stars',
  density = 20,
  className = ''
}: ParticleEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number | undefined>(undefined)

  // Convert density to number if it's a string
  const particleDensity = typeof density === 'string' ? parseInt(density, 10) : density

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize particles with pixel concept theme
    const particles: Particle[] = []
    const emojiSets = {
      stars: ['⭐', '✦', '✧', '⋆', '✶'],
      hearts: ['💕', '💖', '💗', '💓', '♡'],
      sparkles: ['✨', '⭐', '💫', '🌟', '✧'],
      mixed: ['⭐', '💕', '✨', '🎮', '💫', '♡', '✧', '🏆']
    }

    const emojis = emojiSets[type] || emojiSets.stars

    for (let i = 0; i < particleDensity; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.15,
        size: Math.random() * 10 + 6,
        opacity: Math.random() * 0.4 + 0.2,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      })
    }

    particlesRef.current = particles

    // Animation loop with smooth movement
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        // Update position with gentle floating
        particle.x += particle.vx
        particle.y += particle.vy

        // Add subtle oscillation
        particle.y += Math.sin(Date.now() * 0.001 + particle.x * 0.01) * 0.05

        // Wrap around edges
        if (particle.x < -30) particle.x = canvas.width + 30
        if (particle.x > canvas.width + 30) particle.x = -30
        if (particle.y < -30) particle.y = canvas.height + 30
        if (particle.y > canvas.height + 30) particle.y = -30

        // Draw particle with glow effect
        ctx.save()
        ctx.globalAlpha = particle.opacity

        // Soft glow
        ctx.shadowColor = 'rgba(255, 107, 157, 0.3)'
        ctx.shadowBlur = 8

        ctx.font = `${particle.size}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(particle.emoji || '✧', particle.x, particle.y)
        ctx.restore()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [type, particleDensity])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ opacity: 0.5 }}
    />
  )
}

// Floating Decoration Component - Pixel Concept Style
export function FloatingDecorations() {
  return (
    <>
      {/* Top-left corner - Cute pixel character */}
      <div className="fixed top-12 left-8 text-4xl animate-bounce pointer-events-none" style={{ animationDuration: '2.5s', animationDelay: '0s' }}>
        🐣
      </div>
      <div className="fixed top-28 left-16 text-3xl animate-bounce pointer-events-none" style={{ animationDuration: '3s', animationDelay: '0.5s' }}>
        ✨
      </div>

      {/* Top-right corner - Trophy and stars */}
      <div className="fixed top-10 right-12 text-4xl animate-bounce pointer-events-none" style={{ animationDuration: '2.8s', animationDelay: '1s' }}>
        🏆
      </div>
      <div className="fixed top-28 right-20 text-3xl animate-bounce pointer-events-none" style={{ animationDuration: '2.3s', animationDelay: '1.5s' }}>
        ⭐
      </div>

      {/* Bottom-left corner */}
      <div className="fixed bottom-20 left-10 text-4xl animate-bounce pointer-events-none" style={{ animationDuration: '2.6s', animationDelay: '0.3s' }}>
        🎮
      </div>
      <div className="fixed bottom-36 left-20 text-3xl animate-bounce pointer-events-none" style={{ animationDuration: '2.4s', animationDelay: '0.8s' }}>
        💕
      </div>

      {/* Bottom-right corner */}
      <div className="fixed bottom-16 right-14 text-4xl animate-bounce pointer-events-none" style={{ animationDuration: '2.7s', animationDelay: '0.6s' }}>
        🐤
      </div>
      <div className="fixed bottom-32 right-24 text-3xl animate-bounce pointer-events-none" style={{ animationDuration: '2.2s', animationDelay: '1.2s' }}>
        💫
      </div>

      {/* Mid decorations */}
      <div className="fixed top-1/3 left-4 text-2xl opacity-60 animate-pulse pointer-events-none" style={{ animationDuration: '3s' }}>
        ⋆
      </div>
      <div className="fixed top-2/3 right-6 text-2xl opacity-50 animate-pulse pointer-events-none" style={{ animationDuration: '3.5s' }}>
        ✦
      </div>
    </>
  )
}

// Pixel Character Component
export function PixelCharacter({
  type = 'chick',
  size = 'md',
  className = ''
}: {
  type?: 'chick' | 'wizard' | 'heart'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizeMap = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32'
  }

  const characters = {
    chick: '🐣',
    wizard: '🧙',
    heart: '💕'
  }

  return (
    <div className={`${sizeMap[size]} flex items-center justify-center text-4xl pixel-bounce ${className}`}>
      {characters[type]}
    </div>
  )
}

// Glowing Border Effect Component
export function GlowingBorder({
  children,
  color = '#FF6B9D',
  className = ''
}: {
  children: React.ReactNode
  color?: string
  className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      {/* Animated border glow */}
      <div className="absolute inset-0 rounded animate-pulse" style={{
        background: `linear-gradient(90deg, ${color}, #00D4FF, ${color})`,
        backgroundSize: '200% 100%',
        padding: '3px',
        animation: 'border-glow 3s linear infinite',
      }} />
      <style jsx>{`
        @keyframes border-glow {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
      {children}
    </div>
  )
}

// Pixel Stars Decoration
export function PixelStars({ count = 5, className = '' }: { count?: number; className?: string }) {
  const stars = Array.from({ length: count }, (_, i) => ({
    left: `${(i * 25) % 100}%`,
    top: `${Math.random() * 60 + 10}%`,
    delay: `${i * 0.3}s`,
    size: Math.random() > 0.5 ? '2xl' : 'xl'
  }))

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {stars.map((star, i) => (
        <div
          key={i}
          className={`absolute text-${star.size} opacity-40 animate-pulse`}
          style={{
            left: star.left,
            top: star.top,
            animationDelay: star.delay
          }}
        >
          ✦
        </div>
      ))}
    </div>
  )
}
