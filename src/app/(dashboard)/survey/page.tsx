'use client'

import { SurveyForm } from '@/components/features/survey/SurveyForm'
import { useRouter } from 'next/navigation'
import { ParallaxBackground, ScanlineEffect } from '@/components/effects/ParallaxBackground'
import { ParticleEffects } from '@/components/effects/ParticleEffects'
import { PixelIcon, PixelIconName } from '@/components/ui/PixelIcon'

export default function SurveyPage() {
  const router = useRouter()

  const handleSurveyComplete = (responses: Record<string, any>) => {
    // In production, this would save to Supabase
    console.log('Survey completed:', responses)

    // Show success message and redirect
    alert('Survey completed successfully! You can now update your profile.')
    router.push('/profile')
  }

  return (
    <main className="min-h-screen relative">
      {/* Premium Background Effects */}
      <ParallaxBackground />
      <ParticleEffects type="sparkles" density="8" className="opacity-25" />
      <ScanlineEffect />

      <div className="relative z-10 py-10 px-4" style={{
        background: 'linear-gradient(180deg, rgba(232, 245, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)'
      }}>
        <div className="pixel-container">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="mb-5 flex items-center justify-center gap-6">
              <div className="pixel-bounce">
                <PixelIcon name="envelope" size={48} />
              </div>
              <div className="pixel-float" style={{ animationDelay: '0.3s' }}>
                <PixelIcon name="sparkle" size={32} />
              </div>
              <div className="pixel-bounce" style={{ animationDelay: '0.6s' }}>
                <PixelIcon name="heart_solid" size={48} />
              </div>
            </div>

            <h1 className="pixel-text-shadow-glow gradient-text-animated pixel-font-heading text-3xl md:text-4xl font-bold mb-4 leading-relaxed">
              Wizard Connect Survey
            </h1>

            <div className="flex items-center justify-center gap-4 mb-5">
              <div className="pixel-divider-pink flex-1 max-w-24" style={{ height: '4px', margin: '0' }}></div>
              <span className="text-xl">🪄</span>
              <div className="pixel-divider-pink flex-1 max-w-24" style={{ height: '4px', margin: '0' }}></div>
            </div>

            <p className="pixel-font-body text-lg max-w-2xl mx-auto" style={{ color: '#34495E' }}>
              Help us find your perfect match by answering these questions about yourself.
              Your responses will be used to calculate compatibility with other Mapua students.
            </p>
          </div>

          {/* Survey Form */}
          <SurveyForm onComplete={handleSurveyComplete} />

          {/* Info Card - Pixel Concept Style */}
          <div className="mt-10 pixel-card hover-lift max-w-3xl mx-auto" style={{
            background: 'linear-gradient(180deg, #E8F5FF 0%, #D4F0FF 100%)'
          }}>
            <div className="flex items-center gap-3 mb-4">
              <PixelIcon name="star" size={24} />
              <h3 className="pixel-font-heading font-bold text-base" style={{ color: '#00D4FF' }}>
                Tips for Completing the Survey
              </h3>
            </div>

            <ul className="space-y-3 pixel-font-body text-sm">
              <TipItem icon="lock" text="Your progress is saved automatically. You can come back anytime before Feb 10." />
              <TipItem icon="bubble" text="The survey takes about 15-20 minutes to complete." />
              <TipItem icon="target" text="Be honest - our algorithm works best with genuine responses." />
              <TipItem icon="heart_solid" text="The crush list is optional but highly recommended!" />
              <TipItem icon="lock" text="All responses are confidential and only used for matching." />
            </ul>

            {/* Decorative bottom */}
            <div className="mt-5 flex items-center justify-center gap-2 opacity-50">
              <span className="text-sm">⋆</span>
              <div className="pixel-divider flex-1 max-w-32" style={{ height: '2px', margin: '0' }}></div>
              <span className="text-sm">⋆</span>
            </div>
          </div>

          {/* Cute characters at bottom */}
          <div className="flex justify-center items-center gap-8 mt-8">
            <div className="pixel-bounce opacity-70">
              <PixelIcon name="chick" size={48} />
            </div>
            <div className="pixel-float opacity-60" style={{ animationDelay: '0.2s' }}>
              <PixelIcon name="sparkle" size={32} />
            </div>
            <div className="pixel-bounce opacity-70" style={{ animationDelay: '0.4s' }}>
              <PixelIcon name="chick" size={40} />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

// Tip Item Component
function TipItem({ icon, text }: { icon: PixelIconName; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-0.5">
        <PixelIcon name={icon} size={20} />
      </div>
      <span style={{ color: '#34495E' }}>{text}</span>
    </li>
  )
}
