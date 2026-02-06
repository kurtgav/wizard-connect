// ============================================
// DASHBOARD LAYOUT - PIXEL CONCEPT DESIGN
// Dreamy vaporwave navigation with cute elements
// ============================================

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { PixelIcon, PixelIconName } from '@/components/ui/PixelIcon'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut, user } = useAuth()

  const navItems: { href: string; label: string; icon: PixelIconName }[] = [
    { href: '/survey', label: 'Survey', icon: 'envelope' },
    { href: '/profile', label: 'Profile', icon: 'smiley' },
    { href: '/matches', label: 'Matches', icon: 'heart_solid' },
    { href: '/messages', label: 'Messages', icon: 'bubble' },
  ]

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{
        background: 'linear-gradient(180deg, #E8F5FF 0%, #F0F8FF 50%, #FFFFFF 100%)'
      }}>
        {/* Navigation Bar - Pixel Concept Style */}
        <nav className="sticky top-0 z-50 border-b-4 border-gray-800" style={{
          background: 'linear-gradient(135deg, #FF6B9D 0%, #9B59B6 50%, #00D4FF 100%)'
        }}>
          {/* Scanline effect on nav */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
            backgroundImage: `
              linear-gradient(90deg, #FFFFFF 1px, transparent 1px)
            `,
            backgroundSize: '4px 4px'
          }} />

          <div className="pixel-container relative">
            <div className="flex items-center justify-between py-3">
              {/* Logo */}
              <Link href="/survey" className="flex items-center gap-3 hover:scale-105 transition-transform group">
                <div className="relative w-10 h-10">
                  <Image
                    src="/images/wizardconnect-logo.png"
                    alt="Wizard Connect"
                    fill
                    className="object-contain drop-shadow-[2px_2px_0_rgba(0,0,0,0.2)]"
                  />
                </div>
                <div>
                  <h1 className="pixel-font-heading text-base font-bold text-white pixel-text-shadow">
                    Wizard Connect
                  </h1>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-3">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        pixel-btn px-4 py-2 text-xs transition-all flex items-center gap-2
                        ${isActive
                          ? 'scale-105'
                          : 'opacity-90 hover:opacity-100'
                        }
                      `}
                      style={{
                        background: isActive
                          ? 'linear-gradient(180deg, #FFFFFF 0%, #F0F8FF 100%)'
                          : 'rgba(255,255,255,0.1)',
                        color: isActive ? '#FF6B9D' : '#FFFFFF',
                        borderColor: isActive ? '#2C3E50' : 'transparent',
                        boxShadow: isActive
                          ? '3px 3px 0 #2C3E50'
                          : 'none'
                      }}
                    >
                      <PixelIcon name={item.icon} size={24} />
                      <span className="pixel-font-heading">{item.label}</span>
                    </Link>
                  )
                })}
                {/* Logout Button */}
                <button
                  onClick={handleSignOut}
                  className="pixel-btn px-4 py-2 text-xs flex items-center gap-2 transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(180deg, #FF7B7B 0%, #E54580 100%)',
                    borderTopColor: '#FFB8B8',
                    borderLeftColor: '#FFB8B8',
                    borderRightColor: '#C92A5A',
                    borderBottomColor: '#C92A5A'
                  }}
                >
                  <PixelIcon name="lock" size={20} />
                  <span className="pixel-font-heading text-white">Logout</span>
                </button>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center gap-2">
                <button
                  onClick={handleSignOut}
                  className="pixel-btn px-3 py-2 text-xs"
                  style={{
                    background: 'linear-gradient(180deg, #FFFFFF 0%, #F0F8FF 100%)',
                    color: '#FF6B9D'
                  }}
                >
                  <PixelIcon name="lock" size={20} />
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden pb-3">
              <div className="grid grid-cols-2 gap-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        pixel-btn px-3 py-2 text-xs text-center transition-all flex items-center justify-center gap-2
                      `}
                      style={{
                        background: isActive
                          ? 'linear-gradient(180deg, #FFFFFF 0%, #F0F8FF 100%)'
                          : 'rgba(255,255,255,0.1)',
                        color: isActive ? '#FF6B9D' : '#FFFFFF',
                        borderColor: isActive ? '#2C3E50' : 'rgba(255,255,255,0.3)',
                        boxShadow: isActive
                          ? '2px 2px 0 #2C3E50'
                          : 'none'
                      }}
                    >
                      <PixelIcon name={item.icon} size={20} />
                      <span className="pixel-font-heading text-xs">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Decorative bottom edge */}
          <div className="absolute bottom-0 left-0 right-0 h-1" style={{
            background: 'repeating-linear-gradient(90deg, #2C3E50 0px, #2C3E50 8px, transparent 8px, transparent 16px)'
          }} />
        </nav>

        {/* Main Content */}
        <main className="relative">
          {/* Floating corner decorations */}
          <div className="fixed top-20 left-4 text-2xl opacity-40 pixel-float pointer-events-none z-0">
            <PixelIcon name="star" size={40} />
          </div>
          <div className="fixed top-32 right-4 text-xl opacity-30 pixel-float pointer-events-none z-0" style={{ animationDelay: '1s' }}>
            <PixelIcon name="heart_solid" size={32} />
          </div>
          <div className="fixed bottom-20 left-6 text-2xl opacity-35 pixel-bounce pointer-events-none z-0" style={{ animationDelay: '0.5s' }}>
            <PixelIcon name="envelope" size={48} />
          </div>
          <div className="fixed bottom-32 right-6 text-xl opacity-25 pixel-bounce pointer-events-none z-0" style={{ animationDelay: '1.5s' }}>
            <PixelIcon name="sparkle" size={36} />
          </div>

          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}
