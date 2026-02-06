// ============================================
// LANDING PAGE - PIXEL CONCEPT REDESIGN
// Comprehensive flow matching perfectmatch.ai structure
// ============================================

import { Navbar } from '@/components/ui/Navbar'
import { Hero } from '@/components/ui/Hero'
import { Welcome } from '@/components/ui/Welcome'
import { Features } from '@/components/ui/Features'
import { Stats } from '@/components/ui/Stats'
import { HowItWorks } from '@/components/ui/HowItWorks'
import { Team } from '@/components/ui/Team'
import { Footer } from '@/components/ui/Footer'
import { ParallaxBackground, ScanlineEffect } from '@/components/effects/ParallaxBackground'
import { ParticleEffects, FloatingDecorations } from '@/components/effects/ParticleEffects'

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-x-hidden selection:bg-[#FF6B9D] selection:text-white">
      {/* Global Background Effects */}
      <ParallaxBackground />
      <ParticleEffects type="mixed" density="15" className="opacity-40" />
      <ScanlineEffect />
      <FloatingDecorations />

      {/* Sticky Navigation */}
      <Navbar />

      <div className="relative z-10 flex flex-col">
        {/* Hero Section - The Hook */}
        <Hero />

        {/* Welcome Section - The Mission */}
        <Welcome />

        {/* Features - What We Do */}
        <div id="features">
          <Features />
        </div>

        {/* Stats - Social Proof */}
        <div id="stats">
          <Stats />
        </div>

        {/* How It Works - The Process */}
        <div id="how-it-works">
          <HowItWorks />
        </div>

        {/* Team - Trust */}
        <div id="team">
          <Team />
        </div>

        {/* Footer - Navigation & Contacts */}
        <Footer />
      </div>
    </main>
  )
}
