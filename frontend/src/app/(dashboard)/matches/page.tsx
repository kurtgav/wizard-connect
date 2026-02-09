'use client'

import { useState, useEffect } from 'react'
import { PixelIcon, PixelIconName } from '@/components/ui/PixelIcon'
import { apiClient } from '@/lib/api-client'

interface Match {
  id: string
  user_id: string
  matched_user_id: string
  compatibility_score: number
  rank: number
  is_mutual_crush: boolean
  created_at: string
  matched_user?: {
    email: string
    first_name: string
    last_name: string
    avatar_url: string
    bio: string
    year: string
    major: string
  }
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getMatches()
      setMatches(data || [])
      setLoading(false)
    } catch (error) {
      console.error('Failed to load matches:', error)
      setLoading(false)
      alert('Failed to load matches')
    }
  }

  const handleGenerateMatches = async () => {
    try {
      setLoading(true)
      const data = await apiClient.generateMatches()
      setMatches(data || [])
      setLoading(false)
      alert('Matches generated successfully!')
    } catch (error) {
      console.error('Failed to generate matches:', error)
      setLoading(false)
      alert('Failed to generate matches')
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <div className="text-center py-16">
          <div className="inline-block bg-[var(--retro-yellow)] border-4 border-[var(--retro-navy)] px-6 py-3 mb-4 animate-pulse">
            <p className="pixel-font text-lg text-[var(--retro-navy)]">LOADING...</p>
          </div>
          <p className="pixel-font-body text-sm text-gray-600">Finding your Player 2...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="pixel-font text-3xl md:text-5xl font-bold mb-4 text-[var(--retro-navy)] uppercase tracking-tighter">
           Match <span className="text-[var(--retro-red)]">Results</span>
         </h1>
         <div className="inline-block bg-[var(--retro-yellow)] border-2 border-[var(--retro-navy)] px-4 py-1 transform -rotate-2 shadow-[4px_4px_0_var(--retro-navy)]">
           <p className="pixel-font-body font-bold text-[var(--retro-navy)]">
             COMPATIBILITY FOUND
           </p>
         </div>
       </div>

      {/* No Matches State */}
      {matches.length === 0 && (
        <div className="pixel-card text-center py-16">
          <PixelIcon name="chick" size={64} />
          <h2 className="pixel-font text-2xl text-[var(--retro-navy)] mb-4 mt-4">
            No Matches Yet
          </h2>
          <p className="pixel-font-body text-gray-600 mb-6">
            Complete your survey to find compatible partners!
          </p>
          <button
            onClick={handleGenerateMatches}
            className="pixel-btn pixel-btn-primary px-8 py-3"
          >
            <PixelIcon name="star" size={20} className="mr-2" />
            Find Matches
          </button>
        </div>
      )}

      {/* Matches Grid */}
      {matches.length > 0 && (
        <div className="space-y-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="pixel-font text-xl text-[var(--retro-navy)]">
              Your {matches.length} Match{matches.length === 1 ? '' : 'es'}
            </h2>
            <button
              onClick={handleGenerateMatches}
              className="pixel-btn pixel-btn-secondary px-4 py-2 text-xs"
            >
              <PixelIcon name="star" size={16} className="mr-2" />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match, index) => (
              <div key={match.id} className="pixel-card hover:translate-y-[-4px] transition-transform">
                {/* Rank Badge */}
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-[var(--retro-navy)] text-white flex items-center justify-center border-2 border-white pixel-font text-xs">
                  #{index + 1}
                </div>

                {/* Content */}
                <div className="flex flex-col items-center mb-4">
                  <div className="w-20 h-20 bg-[var(--retro-cream)] border-4 border-[var(--retro-navy)] mb-4 flex items-center justify-center text-2xl">
                    <PixelIcon name="smiley" size={40} />
                  </div>

                  <div>
                    <h3 className="pixel-font text-xl text-[var(--retro-navy)] font-bold">
                      {match.matched_user?.first_name} {match.matched_user?.last_name}
                    </h3>
                    <p className="pixel-font-body text-sm text-gray-600">
                      {match.matched_user?.major} • {match.matched_user?.year}
                    </p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="bg-[var(--retro-cream)] border-2 border-[var(--retro-navy)] p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="pixel-font text-xs text-gray-600 mb-1">COMPATIBILITY</div>
                      <div className="flex items-center gap-2">
                        <span className="pixel-font text-3xl font-bold text-[var(--retro-navy)]">
                          {match.compatibility_score}%
                        </span>
                        <PixelIcon name="star" size={20} className="text-[var(--retro-yellow)]" />
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="pixel-font text-xs text-gray-600 mb-1">RANK</div>
                      <div className="flex items-center gap-2">
                        <span className="pixel-font text-2xl font-bold text-[var(--retro-navy)]">
                          {match.rank}
                        </span>
                        {index === 0 && <PixelIcon name="trophy" size={20} className="text-[var(--retro-yellow)]" />}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 mt-3">
                    <div className="pixel-font text-xs text-gray-600 mb-1">STATUS</div>
                    {match.is_mutual_crush && (
                      <div className="flex items-center gap-2">
                        <PixelIcon name="heart_solid" size={20} className="text-[var(--retro-red)]" />
                        <span className="pixel-font-body font-bold text-[var(--retro-red)]">
                          Mutual Crush!
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio Preview */}
                {match.matched_user?.bio && (
                  <div className="pixel-card-sky p-3 mb-4">
                    <div className="flex items-start gap-2 mb-1">
                      <PixelIcon name="bubble" size={16} />
                      <span className="pixel-font text-xs text-gray-600">ABOUT</span>
                    </div>
                    <p className="pixel-font-body text-sm text-gray-700 line-clamp-2">
                      {match.matched_user.bio}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button className="pixel-btn pixel-btn-primary text-xs py-2">
                    <PixelIcon name="envelope" size={18} className="mr-2" />
                    Message
                  </button>
                  <button className="pixel-btn pixel-btn-secondary text-xs py-2">
                    <PixelIcon name="smiley" size={18} className="mr-2" />
                    Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
