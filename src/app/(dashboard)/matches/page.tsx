'use client'

import { useState } from 'react'
import { ParallaxBackground, ScanlineEffect } from '@/components/effects/ParallaxBackground'
import { ParticleEffects } from '@/components/effects/ParticleEffects'
import { PixelIcon, PixelIconName } from '@/components/ui/PixelIcon'

// Mock data for matches
const mockMatches = [
  {
    id: '1',
    name: 'Maria Santos',
    year: '3rd Year',
    major: 'Computer Science',
    compatibility: 92,
    rank: 1,
    isMutualCrush: true,
    bio: 'Coffee addict, coding enthusiast, and adventure seeker. Looking for someone to explore Laguna with! ☕💻',
    interests: ['Gaming', 'Music', 'Travel', 'Photography'],
    avatar: 'smiley' as PixelIconName,
  },
  {
    id: '2',
    name: 'Jose Reyes',
    year: '3rd Year',
    major: 'Information Technology',
    compatibility: 88,
    rank: 2,
    isMutualCrush: false,
    bio: 'Sports lover and tech geek. I play basketball and love building things with code.',
    interests: ['Sports', 'Technology', 'Gaming', 'Fitness'],
    avatar: 'smiley' as PixelIconName,
  },
  {
    id: '3',
    name: 'Ana Cruz',
    year: '2nd Year',
    major: 'Architecture',
    compatibility: 85,
    rank: 3,
    isMutualCrush: false,
    bio: 'Creative soul with a passion for design. I love sketching, painting, and exploring new places.',
    interests: ['Art', 'Travel', 'Photography', 'Music'],
    avatar: 'smiley' as PixelIconName,
  },
  {
    id: '4',
    name: 'Carlos Mendoza',
    year: '4th Year',
    major: 'Mechanical Engineering',
    compatibility: 82,
    rank: 4,
    isMutualCrush: false,
    bio: 'Future engineer with a love for cars and robotics. Let\'s build something amazing together!',
    interests: ['Technology', 'Gaming', 'Fitness', 'Movies'],
    avatar: 'smiley' as PixelIconName,
  },
  {
    id: '5',
    name: 'Sofia Garcia',
    year: '2nd Year',
    major: 'Business Administration',
    compatibility: 79,
    rank: 5,
    isMutualCrush: false,
    bio: 'Entrepreneur at heart. I love reading business books and planning my next startup idea.',
    interests: ['Reading', 'Writing', 'Travel', 'Music'],
    avatar: 'smiley' as PixelIconName,
  },
]

export default function MatchesPage() {
  const [selectedMatch, setSelectedMatch] = useState<typeof mockMatches[0] | null>(null)

  return (
    <main className="min-h-screen relative">
      {/* Premium Background Effects */}
      <ParallaxBackground />
      <ParticleEffects type="mixed" density="12" className="opacity-25" />
      <ScanlineEffect />

      <div className="relative z-10 py-10 px-4" style={{
        background: 'linear-gradient(180deg, rgba(232, 245, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)'
      }}>
        <div className="pixel-container">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="mb-5 flex items-center justify-center gap-6">
              <div className="pixel-bounce">
                <PixelIcon name="heart_solid" size={48} />
              </div>
              <div className="pixel-float" style={{ animationDelay: '0.3s' }}>
                <PixelIcon name="sparkle" size={32} />
              </div>
              <div className="pixel-bounce" style={{ animationDelay: '0.6s' }}>
                <PixelIcon name="heart_solid" size={48} />
              </div>
            </div>
            <h1 className="pixel-text-shadow-glow gradient-text-animated pixel-font-heading text-3xl md:text-4xl font-bold mb-4 leading-relaxed">
              Your Matches
            </h1>
            <div className="flex items-center justify-center gap-4 mb-5">
              <div className="pixel-divider-pink flex-1 max-w-24" style={{ height: '4px', margin: '0' }}></div>
              <span className="text-xl">🪄</span>
              <div className="pixel-divider-pink flex-1 max-w-24" style={{ height: '4px', margin: '0' }}></div>
            </div>
            <p className="pixel-font-body text-lg" style={{ color: '#34495E' }}>
              Based on your compatibility, here are your top matches at Mapua! ✨
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Matches Grid */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {mockMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    isSelected={selectedMatch?.id === match.id}
                    onClick={() => setSelectedMatch(match)}
                  />
                ))}
              </div>
            </div>

            {/* Match Details Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                {selectedMatch ? (
                  <div className="pixel-card hover-lift" style={{
                    background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FCFF 100%)'
                  }}>
                    <div className="flex items-center gap-2 mb-4">
                      <PixelIcon name="sparkle" size={24} />
                      <h2 className="pixel-font-heading text-lg font-bold" style={{ color: '#FF6B9D' }}>
                        Match Details
                      </h2>
                    </div>

                    {/* Avatar */}
                    <div className="text-center mb-4">
                      <div className="pixel-bounce">
                        <PixelIcon name={selectedMatch.avatar} size={80} />
                      </div>
                    </div>

                    {/* Name */}
                    <h3 className="pixel-font-heading text-xl font-bold text-center mb-2" style={{ color: '#00D4FF' }}>
                      {selectedMatch.name}
                    </h3>

                    {/* Info */}
                    <div className="space-y-2 mb-4 text-center text-sm">
                      <p className="pixel-font-body flex items-center justify-center gap-2" style={{ color: '#7F8C8D' }}>
                        <PixelIcon name="cap" size={14} /> {selectedMatch.year} {selectedMatch.major}
                      </p>
                      <div className="flex justify-center items-center gap-2">
                        <span className="pixel-font-heading font-bold" style={{ color: '#FF6B9D' }}>
                          {selectedMatch.compatibility}% Compatible
                        </span>
                      </div>
                      {selectedMatch.isMutualCrush && (
                        <div className="pixel-badge mx-auto text-xs flex items-center gap-2">
                          <PixelIcon name="heart_solid" size={12} /> Mutual Crush!
                        </div>
                      )}
                    </div>

                    <div className="pixel-divider my-4" style={{ height: '3px' }}></div>

                    {/* Bio */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="pixel-font-heading font-bold text-xs" style={{ color: '#34495E' }}>About</h4>
                        <PixelIcon name="bubble" size={14} />
                      </div>
                      <p className="pixel-font-body text-xs leading-relaxed" style={{ color: '#34495E' }}>
                        {selectedMatch.bio}
                      </p>
                    </div>

                    {/* Interests */}
                    <div className="mb-5">
                      <h4 className="pixel-font-heading font-bold text-xs mb-2" style={{ color: '#34495E' }}>Interests</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedMatch.interests.map((interest) => (
                          <span key={interest} className="pixel-tag text-xs">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <button className="pixel-btn pixel-btn-primary pixel-ripple w-full text-xs flex items-center justify-center gap-2">
                        <PixelIcon name="bubble" size={16} /> Send Message
                      </button>
                      <button className="pixel-btn pixel-btn-secondary pixel-ripple w-full text-xs flex items-center justify-center gap-2">
                        <PixelIcon name="lock" size={16} /> Contact Info
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pixel-card hover-lift text-center" style={{
                    background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FCFF 100%)'
                  }}>
                    <div className="mb-4 pixel-bounce">
                      <PixelIcon name="smiley" size={60} />
                    </div>
                    <h3 className="pixel-font-heading font-bold text-sm mb-2" style={{ color: '#00D4FF' }}>
                      Select a Match
                    </h3>
                    <p className="pixel-font-body text-xs" style={{ color: '#7F8C8D' }}>
                      Click on a match card to see their full profile
                    </p>
                  </div>
                )}

                {/* Tips Card */}
                <div className="pixel-card hover-lift mt-5" style={{
                  background: 'linear-gradient(180deg, #FFF0F5 0%, #FFE4EC 100%)'
                }}>
                  <div className="flex items-center gap-2 mb-3">
                    <PixelIcon name="star" size={20} />
                    <h3 className="pixel-font-heading font-bold text-sm" style={{ color: '#FF6B9D' }}>
                      Next Steps
                    </h3>
                  </div>
                  <ul className="space-y-2 pixel-font-body text-xs">
                    <li className="flex items-start gap-2">
                      <PixelIcon name="cap" size={14} />
                      <span style={{ color: '#34495E' }}>Read their profile carefully</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <PixelIcon name="bubble" size={14} />
                      <span style={{ color: '#34495E' }}>Send a friendly message</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <PixelIcon name="smiley" size={14} />
                      <span style={{ color: '#34495E' }}>Be respectful and kind</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <PixelIcon name="heart_solid" size={14} />
                      <span style={{ color: '#34495E' }}>Take your time getting to know them</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Cute characters at bottom */}
          <div className="flex justify-center items-center gap-8 mt-8">
            <div className="pixel-bounce opacity-70">
              <PixelIcon name="chick" size={48} />
            </div>
            <div className="pixel-float opacity-60" style={{ animationDelay: '0.2s' }}>
              <PixelIcon name="heart_solid" size={32} />
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

// Match Card Component
function MatchCard({
  match,
  isSelected,
  onClick
}: {
  match: typeof mockMatches[0]
  isSelected: boolean
  onClick: () => void
}) {
  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return '#22C55E'
    if (score >= 60) return '#EAB308'
    return '#EF4444'
  }

  return (
    <div
      className={`pixel-card hover-lift pixel-shine-effect group cursor-pointer relative ${isSelected ? 'ring-2 ring-offset-2' : ''
        }`}
      onClick={onClick}
      style={{
        animationDelay: `${match.rank * 0.1}s`,
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FCFF 100%)',
        ...(isSelected ? { ringColor: '#FF6B9D' } : {})
      }}
    >
      {/* Rank Badge */}
      <div
        className="absolute -top-3 -right-3 w-10 h-10 flex items-center justify-center text-white font-bold pixel-border-double z-10 pixel-font-heading text-xs"
        style={{
          background: match.rank <= 3
            ? 'linear-gradient(180deg, #FFD700 0%, #F59E0B 100%)'
            : 'linear-gradient(180deg, #9B59B6 0%, #7B68B0 100%)'
        }}
      >
        #{match.rank}
      </div>

      {/* Mutual Crush Badge */}
      {match.isMutualCrush && (
        <div className="absolute -top-3 -left-3 pixel-badge pixel-pulse text-xs z-10 flex items-center gap-1">
          <PixelIcon name="heart_solid" size={10} /> Mutual!
        </div>
      )}

      {/* Avatar */}
      <div className="text-center mb-3 pt-2">
        <div className="pixel-bounce" style={{ animationDelay: `${match.rank * 0.1}s` }}>
          <PixelIcon name={match.avatar} size={60} />
        </div>
      </div>

      {/* Name & Info */}
      <h3 className="pixel-font-heading text-sm font-bold mb-1 text-center" style={{ color: '#00D4FF' }}>
        {match.name}
      </h3>
      <p className="pixel-font-body text-xs text-center mb-3" style={{ color: '#7F8C8D' }}>
        {match.year} • {match.major}
      </p>

      {/* Compatibility Score */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <div className="relative w-16 h-16">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="#E5E7EB"
              strokeWidth="6"
              fill="none"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke={getCompatibilityColor(match.compatibility)}
              strokeWidth="6"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 28}`}
              strokeDashoffset={`${2 * Math.PI * 28 * (1 - match.compatibility / 100)}`}
              strokeLinecap="square"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="pixel-font-heading text-lg font-bold" style={{ color: '#FF6B9D' }}>
              {match.compatibility}%
            </span>
          </div>
        </div>
        <div className="text-left">
          <div className="pixel-font-heading font-bold text-xs" style={{ color: '#34495E' }}>Compatibility</div>
          <div className="pixel-font-body text-xs" style={{ color: '#7F8C8D' }}>
            {match.compatibility >= 80 ? 'Excellent!' : match.compatibility >= 60 ? 'Great!' : 'Good!'}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button className="pixel-btn pixel-btn-primary pixel-ripple flex-1 text-xs py-2 flex items-center justify-center gap-1">
          <PixelIcon name="smiley" size={12} /> View
        </button>
        <button className="pixel-btn pixel-btn-secondary pixel-ripple flex-1 text-xs py-2 flex items-center justify-center gap-1">
          <PixelIcon name="bubble" size={12} /> Chat
        </button>
      </div>
    </div>
  )
}
