'use client'

import { useState } from 'react'
import { ParallaxBackground, ScanlineEffect } from '@/components/effects/ParallaxBackground'
import { ParticleEffects } from '@/components/effects/ParticleEffects'
import { PixelIcon, PixelIconName } from '@/components/ui/PixelIcon'

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    instagram: '',
    phone: '',
    contactPreference: 'email' as 'email' | 'phone' | 'instagram',
    visibility: 'matches_only' as 'public' | 'matches_only' | 'private',
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      alert('Profile saved successfully!')
    }, 1500)
  }

  return (
    <main className="min-h-screen relative">
      {/* Premium Background Effects */}
      <ParallaxBackground />
      <ParticleEffects type="hearts" density="8" className="opacity-25" />
      <ScanlineEffect />

      <div className="relative z-10 py-10 px-4" style={{
        background: 'linear-gradient(180deg, rgba(232, 245, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)'
      }}>
        <div className="pixel-container max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="mb-5 flex items-center justify-center gap-6">
              <div className="pixel-bounce">
                <PixelIcon name="smiley" size={48} />
              </div>
              <div className="pixel-float" style={{ animationDelay: '0.3s' }}>
                <PixelIcon name="sparkle" size={32} />
              </div>
              <div className="pixel-bounce" style={{ animationDelay: '0.6s' }}>
                <PixelIcon name="heart_solid" size={48} />
              </div>
            </div>
            <h1 className="pixel-text-shadow-glow gradient-text-animated pixel-font-heading text-3xl md:text-4xl font-bold mb-4 leading-relaxed">
              Your Profile
            </h1>
            <div className="flex items-center justify-center gap-4 mb-5">
              <div className="pixel-divider-pink flex-1 max-w-24" style={{ height: '4px', margin: '0' }}></div>
              <span className="text-xl">🪄</span>
              <div className="pixel-divider-pink flex-1 max-w-24" style={{ height: '4px', margin: '0' }}></div>
            </div>
            <p className="pixel-font-body text-lg" style={{ color: '#34495E' }}>
              Customize your profile that your matches will see ✨
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Avatar Section */}
            <div className="lg:col-span-1">
              <div className="pixel-card hover-lift text-center" style={{
                background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FCFF 100%)'
              }}>
                <div className="pixel-avatar w-28 h-28 mx-auto mb-4 flex items-center justify-center" style={{
                  background: 'linear-gradient(135deg, #FFB8D4 0%, #C5E3FF 100%)'
                }}>
                  <PixelIcon name="smiley" size={80} />
                </div>
                <h3 className="pixel-font-heading font-bold text-sm mb-2" style={{ color: '#00D4FF' }}>
                  Profile Photo
                </h3>
                <p className="pixel-font-body text-xs mb-4" style={{ color: '#7F8C8D' }}>
                  Upload a photo to let your matches see you
                </p>
                <button className="pixel-btn pixel-btn-secondary pixel-ripple w-full text-xs flex items-center justify-center gap-2">
                  <PixelIcon name="palette" size={16} /> Upload Photo
                </button>
              </div>

              {/* Visibility Settings */}
              <div className="pixel-card hover-lift mt-5" style={{
                background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FCFF 100%)'
              }}>
                <div className="flex items-center gap-2 mb-4">
                  <PixelIcon name="lock" size={24} />
                  <h3 className="pixel-font-heading font-bold text-sm" style={{ color: '#FF6B9D' }}>
                    Privacy Settings
                  </h3>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={profile.visibility === 'public'}
                      onChange={(e) => setProfile({ ...profile, visibility: e.target.value as any })}
                      className="pixel-radio"
                    />
                    <span className="pixel-font-body text-xs group-hover:translate-x-1 transition-transform" style={{ color: '#34495E' }}>
                      <strong style={{ color: '#FF6B9D' }}>Public</strong> - Everyone can see
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="visibility"
                      value="matches_only"
                      checked={profile.visibility === 'matches_only'}
                      onChange={(e) => setProfile({ ...profile, visibility: e.target.value as any })}
                      className="pixel-radio"
                    />
                    <span className="pixel-font-body text-xs group-hover:translate-x-1 transition-transform" style={{ color: '#34495E' }}>
                      <strong style={{ color: '#00D4FF' }}>Matches Only</strong> - Recommended
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={profile.visibility === 'private'}
                      onChange={(e) => setProfile({ ...profile, visibility: e.target.value as any })}
                      className="pixel-radio"
                    />
                    <span className="pixel-font-body text-xs group-hover:translate-x-1 transition-transform" style={{ color: '#34495E' }}>
                      <strong style={{ color: '#9B59B6' }}>Private</strong> - No one can see
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <div className="pixel-card hover-lift pixel-shine-effect" style={{
                background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FCFF 100%)'
              }}>
                <div className="flex items-center gap-2 mb-5">
                  <PixelIcon name="sparkle" size={24} />
                  <h2 className="pixel-font-heading text-lg font-bold" style={{ color: '#00D4FF' }}>
                    Edit Profile
                  </h2>
                </div>

                <div className="space-y-5">
                  {/* Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="pixel-font-heading block font-bold text-xs mb-2" style={{ color: '#34495E' }}>First Name</label>
                      <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        className="pixel-input w-full"
                        placeholder="Juan"
                      />
                    </div>
                    <div>
                      <label className="pixel-font-heading block font-bold text-xs mb-2" style={{ color: '#34495E' }}>Last Name</label>
                      <input
                        type="text"
                        value={profile.lastName}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                        className="pixel-input w-full"
                        placeholder="Dela Cruz"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="pixel-font-heading block font-bold text-xs" style={{ color: '#34495E' }}>About Me</label>
                      <PixelIcon name="bubble" size={16} />
                    </div>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      className="pixel-textarea w-full"
                      placeholder="Tell your matches about yourself... (max 500 characters)"
                      maxLength={500}
                      rows={4}
                    />
                    <p className="pixel-font-body text-xs mt-1" style={{ color: '#7F8C8D' }}>
                      {profile.bio.length}/500 characters
                    </p>
                  </div>

                  {/* Contact Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="pixel-font-heading block font-bold text-xs" style={{ color: '#34495E' }}>Instagram Handle</label>
                      <PixelIcon name="palette" size={16} />
                    </div>
                    <input
                      type="text"
                      value={profile.instagram}
                      onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                      className="pixel-input w-full"
                      placeholder="@username"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="pixel-font-heading block font-bold text-xs" style={{ color: '#34495E' }}>Phone Number (optional)</label>
                      <PixelIcon name="bubble" size={16} />
                    </div>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="pixel-input w-full"
                      placeholder="09XX XXX XXXX"
                    />
                  </div>

                  {/* Contact Preference */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="pixel-font-heading block font-bold text-xs" style={{ color: '#34495E' }}>
                        Preferred Contact Method
                      </label>
                      <PixelIcon name="envelope" size={16} />
                    </div>
                    <select
                      value={profile.contactPreference}
                      onChange={(e) => setProfile({ ...profile, contactPreference: e.target.value as any })}
                      className="pixel-select w-full"
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="instagram">Instagram</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="pixel-btn pixel-btn-primary pixel-ripple flex-1 disabled:opacity-50 text-xs flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <>⏳ Saving...</>
                      ) : (
                        SelectedIcon('lock', 'Save Profile')
                      )}
                    </button>
                    <button className="pixel-btn pixel-btn-secondary pixel-ripple text-xs flex items-center justify-center gap-2">
                      <PixelIcon name="sparkle" size={16} /> Preview
                    </button>
                  </div>
                </div>
              </div>

              {/* Tips Card */}
              <div className="pixel-card hover-lift mt-5" style={{
                background: 'linear-gradient(180deg, #E8F5FF 0%, #D4F0FF 100%)'
              }}>
                <div className="flex items-center gap-2 mb-3">
                  <PixelIcon name="star" size={20} />
                  <h3 className="pixel-font-heading font-bold text-sm" style={{ color: '#00D4FF' }}>
                    Profile Tips
                  </h3>
                </div>
                <ul className="space-y-2 pixel-font-body text-xs">
                  <TipItem icon="smiley" text="Use a clear, friendly photo that shows your face" />
                  <TipItem icon="bubble" text="Write a bio that reflects your personality" />
                  <TipItem icon="target" text="Mention your hobbies and interests" />
                  <TipItem icon="heart_solid" text="Keep it positive and welcoming" />
                </ul>
              </div>
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

// Support function for button content
function SelectedIcon(icon: PixelIconName, text: string) {
  return (
    <>
      <PixelIcon name={icon} size={16} /> {text}
    </>
  )
}

// Tip Item Component
function TipItem({ icon, text }: { icon: PixelIconName; text: string }) {
  return (
    <li className="flex items-start gap-2">
      <div className="flex-shrink-0 mt-0.5">
        <PixelIcon name={icon} size={16} />
      </div>
      <span style={{ color: '#34495E' }}>{text}</span>
    </li>
  )
}
