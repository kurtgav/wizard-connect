'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Navbar } from '@/components/ui/Navbar'
import { CampaignPhaseBanner } from '@/components/campaign/CampaignPhaseBanner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-[var(--retro-cream)]">
        <CampaignPhaseBanner />
        {/* Global Navbar handles all navigation state */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 relative pt-24 px-4 pb-12 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}
