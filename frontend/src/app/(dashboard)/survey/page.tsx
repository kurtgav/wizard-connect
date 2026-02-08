'use client'

import { SurveyForm } from '@/components/features/survey/SurveyForm'
import { useRouter } from 'next/navigation'
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
    <div className="max-w-4xl mx-auto py-8">
      {/* Header Section */}
      <div className="text-center mb-10">
        <h1 className="pixel-font text-3xl md:text-5xl font-bold mb-4 text-[var(--retro-navy)] uppercase tracking-tighter">
          Wizard<span className="text-[var(--retro-red)]">Match</span> Survey
        </h1>
        <div className="inline-block bg-[var(--retro-yellow)] border-2 border-[var(--retro-navy)] px-4 py-1 transform -rotate-2 shadow-[4px_4px_0_0_var(--retro-navy)]">
          <p className="pixel-font-body font-bold text-[var(--retro-navy)]">
            FIND YOUR PLAYER 2
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="pixel-card mb-8">
        <div className="mb-6 flex items-center gap-3 border-b-4 border-[var(--retro-navy)] pb-4">
          <div className="p-2 bg-[var(--retro-red)] border-2 border-[var(--retro-navy)] text-white">
            <PixelIcon name="envelope" size={24} />
          </div>
          <div>
            <h2 className="pixel-font text-xl">Matchmaking Protocol</h2>
            <p className="text-sm font-bold text-gray-500">COMPLETE ALL MISSIONS</p>
          </div>
        </div>

        <SurveyForm onComplete={handleSurveyComplete} />
      </div>

      {/* Info Card - Retro Style */}
      <div className="pixel-card bg-[var(--retro-blue)] text-black">
        <div className="flex items-center gap-3 mb-4">
          <PixelIcon name="star" size={24} />
          <h3 className="pixel-font font-bold text-base text-black underline decoration-4 underline-offset-4 decoration-[var(--retro-navy)]">
            PRO TIPS
          </h3>
        </div>

        <ul className="space-y-3 pixel-font-body text-base">
          <TipItem icon="lock" text="Progress auto-saved. Return before Game Over (Feb 10)." />
          <TipItem icon="bubble" text="Mission Time: ~15-20 minutes." />
          <TipItem icon="target" text="Honesty increases Critical Hit chance (Match %)." />
          <TipItem icon="heart_solid" text="Crush List is optional optional loot." />
        </ul>
      </div>

      {/* Decorative Footer Icons */}
      <div className="flex justify-center items-center gap-8 mt-12 opacity-50 grayscale hover:grayscale-0 transition-all">
        <PixelIcon name="chick" size={32} />
        <PixelIcon name="sparkle" size={24} />
        <PixelIcon name="chick" size={32} />
      </div>
    </div>
  )
}

// Tip Item Component
function TipItem({ icon, text }: { icon: PixelIconName; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-0.5 text-[var(--retro-yellow)] drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
        <PixelIcon name={icon} size={20} />
      </div>
      <span className="font-medium drop-shadow-md">{text}</span>
    </li>
  )
}
