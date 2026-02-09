'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PixelIcon } from '@/components/ui/PixelIcon'
import { Navbar } from '@/components/ui/Navbar'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

// Tab Components
import { UsersTab } from './components/UsersTab'
import { AnalyticsTab } from './components/AnalyticsTab'
import { AIMatchesTab } from './components/AIMatchesTab'
import { ManualMatchesTab } from './components/ManualMatchesTab'

interface Campaign {
  id: string
  name: string
  survey_open_date: string
  survey_close_date: string
  profile_update_start_date: string
  profile_update_end_date: string
  results_release_date: string
  is_active: boolean
  total_participants: number
  total_matches_generated: number
}

interface Stats {
  totalUsers: number
  activeSurvey: number
  completedSurvey: number
  totalMatches: number
}

const ALLOWED_EMAILS = [
  'kurtgavin.design@gmail.com',
  'nicolemaaba@gmail.com',
  'Agpfrancisco1@gmail.com'
]

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('campaigns')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeSurvey: 0,
    completedSurvey: 0,
    totalMatches: 0,
  })

  useEffect(() => {
    const checkAccessAndFetch = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      if (!user.email || !ALLOWED_EMAILS.includes(user.email)) {
        console.warn('Unauthorized access attempt:', user.email)
        router.push('/')
        return
      }

      // User is authorized, fetch data
      await fetchDashboardData(supabase)
    }

    checkAccessAndFetch()
  }, [router])

  const fetchDashboardData = async (supabase: any) => {
    try {
      const [campaignsResult, usersResult, surveysResult, matchesResult] = await Promise.all([
        supabase.from('campaigns').select('*').order('created_at', { ascending: false }),
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('surveys').select('id', { count: 'exact', head: true }).eq('is_complete', true),
        supabase.from('matches').select('id', { count: 'exact', head: true }),
      ])

      if (campaignsResult.data) {
        setCampaigns(campaignsResult.data)
      }

      setStats({
        totalUsers: usersResult.count || 0,
        completedSurvey: surveysResult.count || 0,
        totalMatches: matchesResult.count || 0,
        activeSurvey: (campaignsResult.data || []).filter((c: any) => c.is_active).length,
      })
    } catch (error) {
      console.error('Dashboard fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'campaigns', label: 'CAMPAIGNS', icon: 'trophy' },
    { id: 'ai_matches', label: 'AI MATCHES', icon: 'potion' },
    { id: 'manual_match', label: 'MANUAL MATCH', icon: 'heart_solid' },
    { id: 'analytics', label: 'ANALYTICS', icon: 'crystal' },
    { id: 'users', label: 'TOTAL USERS', icon: 'cap' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFBEB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#1E3A8A] animate-spin" />
          <p className="font-[family-name:var(--font-press-start)] text-[10px] text-[#1E3A8A]">VERIFYING ACCESS...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#FFFBEB] p-4 md:p-8 relative overflow-hidden">
      <Navbar />
      {/* Background Grid */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#E5E7EB 1px, transparent 1px), linear-gradient(90deg, #E5E7EB 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-[#1E3A8A] mb-2 flex items-center gap-3">
            <PixelIcon name="star" size={32} />
            ADMIN DASHBOARD
          </h1>
          <p className="text-gray-600 font-[family-name:var(--font-vt323)] text-xl">Wizard Connect Management Portal</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-3 mb-8 border-b-4 border-[#1E3A8A] pb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 flex items-center gap-2 border-2 border-[#1E3A8A] font-bold text-xs md:text-sm uppercase shadow-[2px_2px_0_#1E3A8A] transition-all
                ${activeTab === tab.id
                  ? 'bg-[#1E3A8A] text-white translate-y-[2px] shadow-none'
                  : 'bg-white text-[#1E3A8A] hover:-translate-y-1 hover:bg-blue-50'}
              `}
            >
              <PixelIcon name={tab.icon as any} size={16} className={activeTab === tab.id ? 'text-white' : 'text-[#1E3A8A]'} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">

          {activeTab === 'campaigns' && (
            <div className="space-y-8">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon="cap" title="Total Users" value={stats.totalUsers} />
                <StatCard icon="star" title="Active Campaigns" value={stats.activeSurvey} />
                <StatCard icon="potion" title="Completed Surveys" value={stats.completedSurvey} />
                <StatCard icon="heart_solid" title="Total Matches" value={stats.totalMatches} />
              </div>

              {/* Campaigns List */}
              <div className="bg-white border-4 border-[#1E3A8A] shadow-[8px_8px_0_#1E3A8A] p-8 relative">
                <div className="absolute top-2 right-2 w-3 h-3 bg-[#1E3A8A]" />
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                  <h2 className="text-2xl font-bold text-[#1E3A8A] flex items-center gap-3">
                    <PixelIcon name="trophy" size={24} />
                    CAMPAIGNS
                  </h2>
                  <button className="bg-[#FFD700] border-4 border-[#1E3A8A] px-6 py-3 font-[family-name:var(--font-press-start)] text-xs text-[#1E3A8A] shadow-[4px_4px_0_#1E3A8A] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#1E3A8A] transition-all flex items-center gap-2">
                    <span>+ NEW CAMPAIGN</span>
                  </button>
                </div>

                {campaigns.length === 0 ? (
                  <div className="text-center py-20 bg-gray-50 border-2 border-dashed border-[#1E3A8A]/30 rounded-lg">
                    <div className="mb-4 inline-block opacity-50">
                      <PixelIcon name="crystal_empty" size={64} />
                    </div>
                    <p className="text-[#1E3A8A] font-medium">No campaigns found. Create one to get started!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {campaigns.map((campaign) => (
                      <CampaignCard key={campaign.id} campaign={campaign} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'ai_matches' && <AIMatchesTab />}
          {activeTab === 'manual_match' && <ManualMatchesTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'users' && <UsersTab />}

        </div>
      </div>
    </main>
  )
}

function StatCard({ icon, title, value }: { icon: string, title: string, value: number }) {
  return (
    <div className="bg-white border-4 border-[#1E3A8A] shadow-[8px_8px_0_#1E3A8A] p-6 relative h-32 flex flex-col justify-between hover:-translate-y-1 transition-transform">
      <div className="absolute top-2 right-2 w-3 h-3 bg-[#1E3A8A]" />
      <div className="flex items-center gap-3">
        <PixelIcon name={icon as any} size={24} />
        <h3 className="font-bold text-[#1E3A8A] text-sm font-[family-name:var(--font-press-start)] tracking-tighter">{title}</h3>
      </div>
      <p className="text-3xl font-black text-[#1E3A8A] font-[family-name:var(--font-vt323)] self-end mt-auto">{value}</p>
    </div>
  )
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="bg-white border-4 border-[#1E3A8A] p-6 hover:bg-blue-50 transition-colors relative group">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-3 h-3 bg-[#1E3A8A]" />
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-[#1E3A8A]">{campaign.name}</h3>
            <span className={`px-2 py-1 text-[10px] uppercase font-bold border-2 border-[#1E3A8A] ${campaign.is_active ? 'bg-[#98FB98] text-[#1E3A8A]' : 'bg-gray-200 text-gray-600'}`}>
              {campaign.is_active ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm font-[family-name:var(--font-vt323)] text-[#1E3A8A]">
            <div>
              <span className="block opacity-60 text-xs">SURVEY PERIOD</span>
              <span className="text-lg font-bold">{formatDate(campaign.survey_open_date)} - {formatDate(campaign.survey_close_date)}</span>
            </div>
            <div>
              <span className="block opacity-60 text-xs">PARTICIPANTS</span>
              <span className="text-lg font-bold">{campaign.total_participants}</span>
            </div>
            <div>
              <span className="block opacity-60 text-xs">MATCHES</span>
              <span className="text-lg font-bold">{campaign.total_matches_generated}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-center">
          <button className="pixel-btn bg-white border-2 border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white text-xs px-4 py-2 shadow-[2px_2px_0_#1E3A8A]">
            MANAGE
          </button>
          <button className="pixel-btn bg-[#FF6B9D] border-2 border-[#1E3A8A] text-white hover:bg-[#ff85a1] text-xs px-4 py-2 shadow-[2px_2px_0_#1E3A8A]">
            VIEW REPORT
          </button>
        </div>
      </div>
    </div>
  )
}
