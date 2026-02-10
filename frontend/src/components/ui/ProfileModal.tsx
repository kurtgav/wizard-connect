'use client'

import { useEffect, useState } from 'react'
import { X, Mail, Instagram, MessageSquare, Eye, EyeOff, Shield } from 'lucide-react'
import { PixelIcon } from './PixelIcon'
import { apiClient } from '@/lib/api-client'
import { useRouter } from 'next/navigation'
import type { User } from '@/types/api'
import { useUserProfileUpdates } from '@/hooks/useProfileUpdates'

interface ProfileModalProps {
  userId: string | null
  onClose: () => void
}

export function ProfileModal({ userId, onClose }: ProfileModalProps) {
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      fetchProfile(userId)
    }
  }, [userId])

  // Subscribe to profile updates for real-time avatar refresh
  useUserProfileUpdates(userId, () => {
    if (userId) {
      fetchProfile(userId)
    }
  })

  const fetchProfile = async (id: string) => {
    try {
      setLoading(true)
      const data = await apiClient.getUserProfileByID(id)
      setProfile(data)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!profile) return
    try {
      await apiClient.createConversation(profile.id)
      onClose()
      window.location.href = '/messages'
    } catch (error) {
      console.error('Failed to start conversation:', error)
    }
  }

  const getVisibilityLabel = (val: string) => {
    switch (val) {
      case 'public': return { label: 'Public', icon: Eye, color: 'text-green-600', bg: 'bg-green-100' }
      case 'private': return { label: 'Private', icon: EyeOff, color: 'text-gray-600', bg: 'bg-gray-100' }
      default: return { label: 'Matches Only', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-100' }
    }
  }

  if (!userId) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white border-4 border-[var(--retro-navy)] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[12px_12px_0_0_rgba(0,0,0,0.3)] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-10 h-10 bg-[var(--retro-red)] border-2 border-[var(--retro-navy)] flex items-center justify-center hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_var(--retro-navy)] transition-all z-10"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="pixel-font text-lg text-[var(--retro-navy)]">LOADING...</p>
            </div>
          </div>
        ) : profile ? (
          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-white border-4 border-[var(--retro-navy)] shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] relative overflow-hidden">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[var(--retro-blue)]">
                      <PixelIcon name="smiley" size={64} className="text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Name and Info */}
              <div className="flex-1">
                <h2 className="pixel-font text-3xl md:text-4xl text-[var(--retro-navy)] uppercase leading-[0.9] mb-3">
                  {profile.first_name || 'Anonymous'} {profile.last_name || 'User'}
                </h2>

                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.major && (
                    <div className="bg-[var(--retro-yellow)] text-[var(--retro-navy)] px-3 py-1 border-2 border-[var(--retro-navy)] shadow-[2px_2px_0_0_var(--retro-navy)]">
                      <span className="pixel-font text-xs uppercase">{profile.major}</span>
                    </div>
                  )}
                  {profile.year && (
                    <div className="bg-[var(--retro-blue)] text-white px-3 py-1 border-2 border-[var(--retro-navy)]">
                      <span className="pixel-font text-xs">{profile.year}</span>
                    </div>
                  )}
                </div>

                {profile.visibility && (
                  <div className={`inline-flex items-center gap-2 px-3 py-1 border-2 border-[var(--retro-navy)] ${getVisibilityLabel(profile.visibility).bg}`}>
                    {(() => {
                      const VisIcon = getVisibilityLabel(profile.visibility).icon
                      return <VisIcon className={`w-4 h-4 ${getVisibilityLabel(profile.visibility).color}`} />
                    })()}
                    <span className={`pixel-font text-xs uppercase ${getVisibilityLabel(profile.visibility).color}`}>
                      {getVisibilityLabel(profile.visibility).label}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="relative border-2 border-[var(--retro-navy)] p-4 mb-6">
                <div className="absolute -top-2.5 left-4 bg-white px-2 border-2 border-[var(--retro-navy)]">
                  <span className="pixel-font text-xs text-[var(--retro-navy)] uppercase tracking-wider">BIO</span>
                </div>
                <p className="font-[family-name:var(--font-vt323)] text-lg text-[var(--retro-navy)] leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="border-2 border-dashed border-[var(--retro-navy)] p-3 flex items-center gap-3">
                <div className="w-10 h-10 flex-shrink-0 bg-[var(--retro-blue)] border-2 border-[var(--retro-navy)] flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <span className="pixel-font text-[10px] text-[var(--retro-navy)] opacity-60 block tracking-wider">EMAIL</span>
                  <span className="pixel-font-body font-bold text-sm text-[var(--retro-navy)] truncate block" title={profile.email}>
                    {profile.email}
                  </span>
                </div>
              </div>

              {profile.instagram && (
                <div className="border-2 border-dashed border-[var(--retro-navy)] p-3 flex items-center gap-3">
                  <div className="w-10 h-10 flex-shrink-0 bg-[var(--retro-pink)] border-2 border-[var(--retro-navy)] flex items-center justify-center">
                    <Instagram className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <span className="pixel-font text-[10px] text-[var(--retro-navy)] opacity-60 block tracking-wider">INSTAGRAM</span>
                    <span className="pixel-font-body font-bold text-sm text-[var(--retro-navy)] truncate block">
                      @{profile.instagram}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSendMessage}
                className="pixel-btn pixel-btn-primary flex items-center justify-center gap-2 px-6 py-2 flex-1"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="pixel-font uppercase text-sm">Send Message</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <PixelIcon name="chick" size={48} className="mx-auto mb-4" />
              <p className="pixel-font text-sm text-[var(--retro-navy)]">Profile not found</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
