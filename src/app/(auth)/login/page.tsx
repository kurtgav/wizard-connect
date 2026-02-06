// ============================================
// LOGIN PAGE - PIXEL CONCEPT DESIGN
// Dreamy vaporwave Google OAuth login
// ============================================

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ParallaxBackground, ScanlineEffect } from '@/components/effects/ParallaxBackground'
import { ParticleEffects } from '@/components/effects/ParticleEffects'
import { PixelIcon } from '@/components/ui/PixelIcon'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect logic would go here
  }, [router])

  const handleGoogleLogin = async () => {
    console.log('Google login clicked')
    alert('Authentication will be implemented after Supabase setup!')
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4 relative overflow-hidden bg-[#E0F7FA]">
      {/* Background Effects */}
      <ParallaxBackground />
      <ParticleEffects type="sparkles" density="12" className="opacity-30" />
      <ScanlineEffect />

      {/* Cityscape Background Layer (Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 h-[40vh] w-full z-0 opacity-60 pointer-events-none">
        <Image
          src="/images/hero-city.png"
          alt="City Background"
          fill
          className="object-cover object-bottom"
        />
      </div>

      {/* Floating decorations - Emojis Replaced with PixelIcon */}
      <div className="absolute top-12 left-8 pixel-bounce pointer-events-none opacity-70">
        <PixelIcon name="star" size={32} />
      </div>
      <div className="absolute top-24 right-16 pixel-float pointer-events-none opacity-60" style={{ animationDelay: '0.5s' }}>
        <PixelIcon name="sparkle" size={24} />
      </div>

      <div className="pixel-container max-w-md mx-auto relative z-10 w-full">
        <div className="pixel-card shadow-[12px_12px_0_rgba(44,62,80,0.2)]" style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FCFF 50%, #F0F8FF 100%)',
          border: '4px solid #2C3E50'
        }}>
          {/* Wizard Avatar from Sprite */}
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 overflow-hidden relative border-4 border-[#2C3E50] bg-[#E0F7FA] rounded-xl shadow-inner animate-bounce-slow">
              {/* Show only the Wizard (Left 1/3 of the sprite) */}
              <div className="absolute top-0 left-0 w-[300%] h-full">
                <Image
                  src="/images/team-avatars.png"
                  alt="Wizard Avatar"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          <h1 className="pixel-text-shadow-glow gradient-text-animated pixel-font-heading text-2xl font-bold mb-2 text-center">
            Player Login
          </h1>
          <p className="text-center pixel-font-body text-sm mb-6 text-[#2C3E50]/70">
            Mapua Student Portal Access
          </p>

          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="pixel-divider-pink flex-1 max-w-16" style={{ height: '3px', margin: '0' }}></div>
            <PixelIcon name="trophy" size={24} className="animate-pulse" />
            <div className="pixel-divider-pink flex-1 max-w-16" style={{ height: '3px', margin: '0' }}></div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              className="w-full pixel-btn pixel-btn-primary pixel-glow text-center py-4 hover:translate-y-[-2px] transition-transform"
            >
              <span className="flex items-center justify-center gap-3 pixel-font-heading text-xs">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </span>
            </button>
          </div>

          <div className="mt-8 text-center bg-[#F8F9FA] p-4 border-2 border-[#2C3E50] rounded-lg">
            <p className="pixel-font-body text-[10px] text-[#2C3E50] mb-2 uppercase tracking-widest font-bold">
              Mission Status
            </p>
            <div className="flex items-center justify-between text-xs px-2">
              <span className="text-[#00D4FF]">SURVEY ONLINE</span>
              <div className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="pixel-font-body text-xs hover:underline decoration-2 underline-offset-4" style={{ color: '#2C3E50' }}>
            ← Return to Main Menu
          </a>
        </div>
      </div>
    </div>
  )
}
