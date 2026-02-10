'use client'

import { useState, useEffect } from 'react'
import { PixelIcon } from '@/components/ui/PixelIcon'
import { apiClient } from '@/lib/api-client'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Heart, X, MessageCircle, User, Info, RefreshCcw, Sparkles } from 'lucide-react'
import { MatchWithDetails } from '@/types/api'

export default function MatchesPage() {
  const router = useRouter()
  const [matches, setMatches] = useState<MatchWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<'left' | 'right' | null>(null)

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
    }
  }

  const handleGenerateMatches = async () => {
    try {
      setLoading(true)
      const data = await apiClient.generateMatches()
      setMatches(data || [])
      setCurrentIndex(0)
      setLoading(false)
    } catch (error) {
      console.error('Failed to generate matches:', error)
      setLoading(false)
      alert('Failed to generate matches')
    }
  }

  const handleSwipe = (dir: 'left' | 'right') => {
    setDirection(dir)
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1)
      setDirection(null)
    }, 200)
  }

  const handleMessage = async (matchedUserId: string) => {
    try {
      await apiClient.createConversation(matchedUserId)
      router.push('/messages')
    } catch (error) {
      console.error('Failed to create conversation:', error)
      alert('Failed to start conversation')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFBEB]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="pixel-font text-[10px] text-[#1E3A8A]">CASTING SPELLS...</p>
        </div>
      </div>
    )
  }

  const currentMatch = matches[currentIndex]

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col p-4 md:p-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="pixel-font text-xl text-[#1E3A8A] tracking-tighter">DISCOVERY</h1>
        <button
          onClick={handleGenerateMatches}
          className="p-2 bg-white border-2 border-[#1E3A8A] shadow-[2px_2px_0_#1E3A8A] active:translate-y-[2px] active:shadow-none transition-all"
        >
          <RefreshCcw size={16} className="text-[#1E3A8A]" />
        </button>
      </div>

      {/* Match Queue (Bumble Style) */}
      <div className="mb-8">
        <h2 className="pixel-font text-[8px] text-gray-500 mb-4 uppercase tracking-widest">Your Match Queue</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {matches.map((match, idx) => (
            <div
              key={match.id}
              onClick={() => setCurrentIndex(idx)}
              className={`flex-shrink-0 cursor-pointer transition-all ${idx === currentIndex ? 'scale-110' : 'opacity-60 grayscale hover:grayscale-0'}`}
            >
              <div className={`w-14 h-14 rounded-full border-2 ${match.is_mutual_crush ? 'border-[#FFD700] ring-2 ring-[#FFD700]/20' : 'border-[#1E3A8A]'} overflow-hidden bg-white shadow-md relative`}>
                {match.matched_user?.avatar_url ? (
                  <img src={match.matched_user.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <User size={24} className="text-gray-400" />
                  </div>
                )}
                {match.is_mutual_crush && (
                  <div className="absolute bottom-0 right-0 bg-[#FFD700] p-0.5 rounded-full border border-white">
                    <Sparkles size={8} className="text-[#1E3A8A]" />
                  </div>
                )}
              </div>
            </div>
          ))}
          {matches.length === 0 && (
            <div className="w-full text-center py-4 border-2 border-dashed border-gray-300 rounded-xl">
              <p className="text-[10px] font-bold text-gray-400">NO PENDING MATCHES</p>
            </div>
          )}
        </div>
      </div>

      {/* Card Deck */}
      <div className="flex-1 relative perspective-1000">
        <AnimatePresence mode="wait">
          {currentMatch ? (
            <SwipeCard
              key={currentMatch.id}
              match={currentMatch}
              onSwipeLeft={() => handleSwipe('left')}
              onSwipeRight={() => handleSwipe('right')}
              onMessage={() => handleMessage(currentMatch.matched_user_id)}
              onViewProfile={() => router.push(`/profile/${currentMatch.matched_user_id}`)}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full h-[500px] flex flex-col items-center justify-center bg-white border-4 border-[#1E3A8A] shadow-[8px_8px_0_#1E3A8A] p-8 text-center"
            >
              <PixelIcon name="crystal_empty" size={64} className="mb-6 opacity-20" />
              <h3 className="pixel-font text-lg text-[#1E3A8A] mb-4">END OF THE LINE</h3>
              <p className="font-[family-name:var(--font-vt323)] text-xl text-gray-500 mb-8">
                You've seen all your current matches. Refresh to find more wizards!
              </p>
              <button
                onClick={handleGenerateMatches}
                className="pixel-btn bg-[#FFD700] border-4 border-[#1E3A8A] px-8 py-3 font-bold text-[#1E3A8A] shadow-[4px_4px_0_#1E3A8A]"
              >
                REFRESH DISCOVERY
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function SwipeCard({ match, onSwipeLeft, onSwipeRight, onMessage, onViewProfile }: any) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0])
  const likeOpacity = useTransform(x, [50, 150], [0, 1])
  const nopeOpacity = useTransform(x, [-150, -50], [1, 0])

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) onSwipeRight()
    else if (info.offset.x < -100) onSwipeLeft()
  }

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
      initial={{ scale: 0.9, y: 20, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ x: x.get() < 0 ? -500 : 500, opacity: 0, transition: { duration: 0.2 } }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    >
      <div className="w-full h-full bg-white border-4 border-[#1E3A8A] shadow-[8px_8px_0_#1E3A8A] overflow-hidden flex flex-col relative">
        {/* Swipe Indicators */}
        <motion.div style={{ opacity: likeOpacity }} className="absolute top-8 left-8 border-4 border-green-500 px-4 py-2 rounded-lg rotate-[-20deg] z-20 pointer-events-none">
          <p className="text-green-500 font-black text-2xl uppercase">MAGIC</p>
        </motion.div>
        <motion.div style={{ opacity: nopeOpacity }} className="absolute top-8 right-8 border-4 border-red-500 px-4 py-2 rounded-lg rotate-[20deg] z-20 pointer-events-none">
          <p className="text-red-500 font-black text-2xl uppercase">NEXT</p>
        </motion.div>

        {/* Photos / Avatar */}
        <div className="h-2/3 bg-gray-100 flex items-center justify-center relative overflow-hidden group">
          {match.matched_user?.avatar_url ? (
            <img src={match.matched_user.avatar_url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          ) : (
            <PixelIcon name="smiley" size={120} className="opacity-20" />
          )}

          {/* Mutual Crush Badge */}
          {match.is_mutual_crush && (
            <div className="absolute top-4 left-4 bg-[#FFD700] border-2 border-[#1E3A8A] px-3 py-1 flex items-center gap-2 shadow-[2px_2px_0_#1E3A8A] animate-bounce">
              <Heart size={14} fill="#1E3A8A" className="text-[#1E3A8A]" />
              <span className="pixel-font text-[8px] font-black text-[#1E3A8A]">MUTUAL MAGIC!</span>
            </div>
          )}

          {/* Compatibility Overlay */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border-2 border-[#1E3A8A] p-2 flex items-center gap-2 shadow-[2px_2px_0_1E3A8A]">
            <Sparkles size={16} className="text-[#FFD700]" />
            <span className="font-black text-[#1E3A8A] text-xl font-[family-name:var(--font-vt323)]">{match.compatibility_score}%</span>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-2xl font-black text-[#1E3A8A] flex items-center gap-2 uppercase tracking-tighter">
                {match.matched_user?.first_name}, {match.matched_user?.age || 20}
              </h3>
              <p className="text-sm font-bold text-gray-500 font-[family-name:var(--font-vt323)] tracking-wide">
                {match.matched_user?.major} • {match.matched_user?.year}
              </p>
            </div>
          </div>

          <p className="text-gray-600 text-sm line-clamp-3 mb-auto font-[family-name:var(--font-inter)] leading-relaxed italic">
            "{match.matched_user?.bio || "No bio yet... but trust the magic!"}"
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <button
              onClick={onSwipeLeft}
              className="w-14 h-14 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-red-500 hover:text-red-500 hover:scale-110 transition-all shadow-md group"
            >
              <X size={28} className="translate-y-[1px]" />
            </button>
            <button
              onClick={onMessage}
              className="w-16 h-16 rounded-full bg-[#1E3A8A] flex items-center justify-center text-white hover:scale-110 transition-all shadow-xl hover:shadow-[#1E3A8A]/30 group"
            >
              <MessageCircle size={32} />
            </button>
            <button
              onClick={onViewProfile}
              className="w-14 h-14 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#1E3A8A] hover:text-[#1E3A8A] hover:scale-110 transition-all shadow-md group"
            >
              <Info size={28} />
            </button>
            <button
              onClick={onSwipeRight}
              className="w-14 h-14 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-green-500 hover:text-green-500 hover:scale-110 transition-all shadow-md group"
            >
              <Heart size={28} className="translate-y-[1px]" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

