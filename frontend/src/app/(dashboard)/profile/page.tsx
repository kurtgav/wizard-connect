'use client'

import { useState, useRef, useEffect } from 'react'
import { PixelIcon, PixelIconName } from '@/components/ui/PixelIcon'
import { Edit2, Save, X, Mail, Phone, Instagram, Eye, EyeOff, Shield, Check, Heart, User as LucideUser, ChevronDown } from 'lucide-react'
import { LucideIcon } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import type { User, UserProfile } from '@/types/api'

interface SelectOption {
  value: string
  label: string
  icon: LucideIcon | null
}

export default function ProfilePage() {
  const CustomSelect = ({ value, onChange, options }: { value: string, onChange: (val: string) => void, options: SelectOption[] }) => {
    const isOpen = selectOpenStates[value] || false
    const setIsOpen = (open: boolean) => setSelectOpenStates(prev => ({ ...prev, [value]: open }))

    const selectedOption = options.find(opt => opt.value === value)
    const IconComponent = selectedOption?.icon

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="pixel-input w-full flex items-center justify-between bg-white"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {IconComponent && <IconComponent className="w-5 h-5 text-[var(--retro-navy)] flex-shrink-0" />}
            <span className="pixel-font-body text-sm text-[var(--retro-navy)] truncate">
              {selectedOption?.label || 'Select...'}
            </span>
          </div>
          {value && <Check className="w-5 h-5 text-[var(--retro-pink)] flex-shrink-0 ml-2" strokeWidth={3} />}
          <ChevronDown className={`w-5 h-5 text-[var(--retro-navy)] flex-shrink-0 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border-2 border-[var(--retro-navy)] rounded-lg shadow-[4px_4px_0_rgba(0,0,0,0.2)] overflow-hidden animate-in slide-in-from-top-2 duration-200">
            <div className="max-h-64 overflow-y-auto">
              {options.map((option) => {
                const OptIcon = option.icon
                const isSelected = option.value === value

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value)
                      setIsOpen(false)
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 text-left
                      transition-all duration-150
                      ${isSelected
                        ? 'bg-[var(--retro-yellow)] border-l-4 border-[var(--retro-navy)]'
                        : 'hover:bg-[var(--retro-blue)]/10 border-l-4 border-transparent'
                      }
                    `}
                  >
                    {OptIcon && <OptIcon className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-[var(--retro-navy)]' : 'text-[var(--retro-navy)] opacity-70'}`} />}
                    <span className={`pixel-font-body text-sm flex-1 truncate ${isSelected ? 'text-[var(--retro-navy)] font-bold' : 'text-[var(--retro-navy)]'}`}>
                      {option.label}
                    </span>
                    {isSelected && (
                      <Check className="w-5 h-5 text-[var(--retro-navy)] flex-shrink-0 animate-in zoom-in-95 duration-200" strokeWidth={3} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  const [selectOpenStates, setSelectOpenStates] = useState<Record<string, boolean>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    instagram: '',
    phone: '',
    email: '',
    contactPreference: 'email' as 'email' | 'phone' | 'instagram',
    visibility: 'matches_only' as 'public' | 'matches_only' | 'private',
    gender: '' as 'male' | 'female' | 'non-binary' | 'prefer_not_to_say' | 'other' | '',
    genderPreference: 'both' as 'male' | 'female' | 'both',
    avatarUrl: '',
  })
  const [loading, setLoading] = useState(true)

  // Start in view mode (false), switch to true to edit
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load user profile on mount
  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      const user = await apiClient.getProfile()
      setProfile({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        bio: user.bio || '',
        instagram: user.instagram || '',
        phone: user.phone || '',
        email: user.email || '',
        contactPreference: user.contact_preference || 'email',
        visibility: user.visibility || 'matches_only',
        gender: user.gender || '',
        genderPreference: user.gender_preference || 'both',
        avatarUrl: user.avatar_url || '',
      })
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      const updateData: UserProfile = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio,
        instagram: profile.instagram,
        phone: profile.phone,
        contactPreference: profile.contactPreference,
        visibility: profile.visibility,
        gender: profile.gender || undefined,
        genderPreference: profile.genderPreference,
      }

      await apiClient.updateProfile(updateData)
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Failed to save profile:', error)
      alert('Failed to save profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setProfile(prev => ({ ...prev, avatarUrl: url }))
    }
  }

  const getVisibilityLabel = (val: string) => {
    switch (val) {
      case 'public': return { label: 'Public Server', icon: Eye, color: 'text-green-600', bg: 'bg-green-100' }
      case 'private': return { label: 'Offline Mode', icon: EyeOff, color: 'text-gray-600', bg: 'bg-gray-100' }
      default: return { label: 'Guild Only', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-100' }
    }
  }

  const visibilityInfo = getVisibilityLabel(profile.visibility)
  const VisIcon = visibilityInfo.icon

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block bg-[var(--retro-yellow)] border-4 border-[var(--retro-navy)] px-6 py-3 mb-4 animate-pulse">
            <p className="pixel-font text-lg text-[var(--retro-navy)]">LOADING...</p>
          </div>
          <p className="pixel-font-body text-sm text-gray-600">Fetching your character sheet...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="pixel-font text-3xl md:text-5xl font-bold mb-4 text-[var(--retro-navy)] uppercase tracking-tighter">
          Player <span className="text-[var(--retro-red)]">Profile</span>
        </h1>
        <div className="inline-block bg-[var(--retro-white)] border-2 border-[var(--retro-navy)] px-4 py-1 shadow-[4px_4px_0_0_var(--retro-navy)]">
          <p className="pixel-font-body font-bold text-[var(--retro-navy)]">
            {isEditing ? 'CUSTOMIZE YOUR AVATAR' : 'CHARACTER SHEET'}
          </p>
        </div>
      </div>

      {!isEditing ? (
        // ============================
        // VIEW MODE: ENHANCED PREVIEW CARD
        // ============================
        <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500">
          <div className="w-full bg-white border-4 border-[var(--retro-navy)] p-6 md:p-10 relative shadow-[12px_12px_0_0_rgba(30,58,138,0.2)]">

            {/* Level Badge - Top Right */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--retro-yellow)] border-l-4 border-b-4 border-[var(--retro-navy)] flex items-center justify-center">
              <div className="transform -rotate-45 translate-x-1 translate-y-1">
                <span className="pixel-font text-xs text-[var(--retro-navy)] block text-center">LVL.</span>
                <span className="pixel-font text-2xl text-[var(--retro-navy)] block text-center leading-none">1</span>
              </div>
              <div className="absolute top-2 right-2">
                <PixelIcon name="sparkle" size={8} className="text-[var(--retro-navy)] opacity-50" />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 mt-2">
              {/* LEFT COLUMN: Avatar & Status */}
              <div className="flex-shrink-0 flex flex-col gap-4 w-full md:w-auto items-center md:items-start">
                {/* Avatar Frame */}
                <div className="w-56 h-56 bg-[var(--retro-blue)] border-4 border-[var(--retro-navy)] shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] relative overflow-hidden bg-white">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[var(--retro-blue)]">
                      <PixelIcon name="smiley" size={80} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className={`w-56 py-2 px-3 border-2 border-[var(--retro-navy)] flex items-center justify-center gap-2 ${visibilityInfo.bg}`}>
                  <VisIcon className={`w-4 h-4 ${visibilityInfo.color}`} />
                  <span className={`pixel-font text-xs uppercase ${visibilityInfo.color}`}>{visibilityInfo.label}</span>
                </div>
              </div>

              {/* RIGHT COLUMN: Info */}
              <div className="flex-1 min-w-0 pt-2 w-full">
                {/* Name */}
                <h1 className="pixel-font text-4xl md:text-6xl text-[var(--retro-navy)] uppercase leading-[0.9] mb-4 text-center md:text-left">
                  {profile.firstName}
                  <br />
                  {profile.lastName}
                </h1>

                {/* Tags */}
                <div className="flex flex-wrap gap-3 mb-8 justify-center md:justify-start">
                  <div className="bg-[var(--retro-blue)] text-white px-4 py-1 border-2 border-[var(--retro-navy)] shadow-[4px_4px_0_0_var(--retro-navy)]">
                    <span className="pixel-font text-xs tracking-widest">WIZARD CLASS</span>
                  </div>
                  <div className="bg-[var(--retro-blue)] text-white px-4 py-1 border-2 border-[var(--retro-navy)] shadow-[4px_4px_0_0_var(--retro-navy)]">
                    <span className="pixel-font text-xs tracking-widest">ACTIVE</span>
                  </div>
                </div>

                {/* Bio */}
                <div className="relative border-2 border-[var(--retro-navy)] p-6 mb-8 mt-6">
                  <div className="absolute -top-3 left-4 bg-white px-2 border-2 border-[var(--retro-navy)]">
                    <span className="pixel-font text-xs text-[var(--retro-navy)] uppercase tracking-wider">
                      BIO / LORE
                    </span>
                  </div>
                  <p className="font-[family-name:var(--font-vt323)] text-xl text-[var(--retro-navy)] leading-relaxed">
                    {profile.bio || "No bio set."}
                  </p>
                </div>

                 {/* Stats Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {/* Email */}
                   <div className="border-2 border-dashed border-[var(--retro-navy)] p-3 flex items-center gap-3">
                     <div className="w-12 h-12 flex-shrink-0 bg-[var(--retro-yellow)] border-2 border-[var(--retro-navy)] flex items-center justify-center">
                       <Mail className="w-6 h-6 text-[var(--retro-navy)]" />
                     </div>
                     <div className="min-w-0 overflow-hidden">
                       <span className="pixel-font text-[10px] text-[var(--retro-navy)] opacity-60 block mb-0.5 tracking-wider">EMAIL SCROLL</span>
                       <span className="pixel-font-body font-bold text-sm text-[var(--retro-navy)] truncate block" title={profile.email}>{profile.email}</span>
                     </div>
                   </div>

                   {/* Instagram */}
                   <div className="border-2 border-dashed border-[var(--retro-navy)] p-3 flex items-center gap-3">
                     <div className="w-12 h-12 flex-shrink-0 bg-[var(--retro-pink)] border-2 border-[var(--retro-navy)] flex items-center justify-center">
                       <Instagram className="w-6 h-6 text-white" />
                     </div>
                     <div className="min-w-0">
                       <span className="pixel-font text-[10px] text-[var(--retro-navy)] opacity-60 block mb-0.5 tracking-wider">INSTAGRAM</span>
                       <span className="pixel-font-body font-bold text-sm text-[var(--retro-navy)]">@{profile.instagram || '-'}</span>
                     </div>
                   </div>

                   {/* Preferred Contact */}
                   <div className="border-2 border-dashed border-[var(--retro-navy)] p-3 flex items-center gap-3">
                     <div className="w-12 h-12 flex-shrink-0 bg-[var(--retro-blue)] border-2 border-[var(--retro-navy)] flex items-center justify-center">
                       <Phone className="w-6 h-6 text-white" />
                     </div>
                     <div className="min-w-0">
                       <span className="pixel-font text-[10px] text-[var(--retro-navy)] opacity-60 block mb-0.5 tracking-wider">PREFERRED CONTACT</span>
                       <span className="pixel-font-body font-bold text-sm text-[var(--retro-navy)] uppercase">{profile.contactPreference}</span>
                     </div>
                   </div>

                    {/* Gender */}
                    <div className="border-2 border-dashed border-[var(--retro-navy)] p-3 flex items-center gap-3">
                      <div className="w-12 h-12 flex-shrink-0 bg-[var(--retro-pink)] border-2 border-[var(--retro-navy)] flex items-center justify-center">
                        <PixelIcon name="smiley" size={24} className="text-white" />
                      </div>
                      <div className="min-w-0">
                        <span className="pixel-font text-[10px] text-[var(--retro-navy)] opacity-60 block mb-0.5 tracking-wider">GENDER</span>
                        <span className="pixel-font-body font-bold text-sm text-[var(--retro-navy)] capitalize">{profile.gender || 'Not set'}</span>
                      </div>
                    </div>

                    {/* Looking For */}
                    <div className="border-2 border-dashed border-[var(--retro-navy)] p-3 flex items-center gap-3 md:col-span-2">
                      <div className="w-12 h-12 flex-shrink-0 bg-[var(--retro-yellow)] border-2 border-[var(--retro-navy)] flex items-center justify-center">
                        <PixelIcon name="heart_solid" size={24} className="text-[var(--retro-navy)]" />
                      </div>
                      <div className="min-w-0">
                        <span className="pixel-font text-[10px] text-[var(--retro-navy)] opacity-60 block mb-0.5 tracking-wider">LOOKING FOR</span>
                        <span className="pixel-font-body font-bold text-sm text-[var(--retro-navy)] capitalize">{profile.genderPreference === 'both' ? 'Anyone' : profile.genderPreference}</span>
                      </div>
                    </div>
                 </div>

                {/* Edit Button */}
                <div className="flex justify-end mt-8">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-[var(--retro-yellow)] text-[var(--retro-navy)] border-2 border-[var(--retro-navy)] shadow-[4px_4px_0_0_var(--retro-navy)] px-6 py-3 flex items-center gap-3 hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_var(--retro-navy)] transition-all active:translate-y-[0px] active:shadow-[2px_2px_0_0_var(--retro-navy)] w-full md:w-auto justify-center"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="pixel-font text-sm uppercase">EDIT PROFILE</span>
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      ) : (
        // ============================
        // EDIT MODE: FORM LAYOUT
        // ============================
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-right-8 duration-500">
          {/* ... Keep the Avatar/Settings Left Column ... */}
          <div className="lg:col-span-1 space-y-8">
            {/* Avatar Picker */}
            <div className="pixel-card text-center">
              <div className="w-32 h-32 mx-auto mb-6 bg-[var(--retro-blue)] border-4 border-[var(--retro-navy)] flex items-center justify-center relative shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] overflow-hidden bg-white">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <PixelIcon name="smiley" size={64} className="text-white w-full h-full p-4 bg-[var(--retro-blue)]" />
                )}
                <div className="absolute -bottom-2 -right-2 bg-[var(--retro-yellow)] border-2 border-[var(--retro-navy)] p-1 z-10">
                  <PixelIcon name="palette" size={16} />
                </div>
              </div>
              <h3 className="pixel-font text-sm mb-2 text-[var(--retro-navy)]">Profile Photo</h3>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="pixel-btn pixel-btn-secondary w-full text-xs"
              >
                Upload New
              </button>
            </div>

            {/* Visibility Settings - NOW EDITABLE */}
            <div className="pixel-card bg-[var(--retro-pink)] text-[var(--retro-navy)]">
              <div className="flex items-center gap-2 mb-4 border-b-2 border-[var(--retro-navy)] pb-2">
                <PixelIcon name="lock" size={20} />
                <h3 className="pixel-font text-sm">Privacy Level</h3>
              </div>
              <div className="space-y-3">
                {[
                  { val: 'public', label: 'Public Server', desc: 'Everyone can see', icon: Eye },
                  { val: 'matches_only', label: 'Guild Only', desc: 'Matches only', icon: Shield },
                  { val: 'private', label: 'Offline Mode', desc: 'Hidden', icon: EyeOff }
                ].map((option) => {
                  const IconComponent = option.icon
                  const isSelected = profile.visibility === option.val
                  return (
                    <label
                      key={option.val}
                      className={`
                        relative flex items-start gap-4 cursor-pointer group
                        p-4 border-2 rounded-lg transition-all duration-200
                        ${isSelected
                          ? 'bg-[var(--retro-yellow)] border-[var(--retro-navy)] shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]'
                          : 'bg-white border-[var(--retro-navy)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.1)] hover:border-[var(--retro-navy)]'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => setProfile({ ...profile, visibility: option.val as any })}
                        className="hidden"
                      />
                      
                      {isSelected ? (
                        <div className="flex-shrink-0 w-8 h-8 bg-[var(--retro-navy)] border-2 border-[var(--retro-navy)] flex items-center justify-center rounded-full shadow-lg animate-in zoom-in-95 duration-200">
                          <Check className="w-5 h-5 text-white" strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-8 h-8 bg-white border-2 border-[var(--retro-navy)] flex items-center justify-center rounded-full group-hover:bg-[var(--retro-blue)] group-hover:border-[var(--retro-navy)] transition-colors">
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`pixel-font text-xs font-bold ${isSelected ? 'text-[var(--retro-navy)]' : 'text-[var(--retro-navy)]'}`}>
                            {option.label}
                          </span>
                          {isSelected && (
                            <span className="px-2 py-0.5 bg-[var(--retro-navy)] text-[var(--retro-yellow)] text-[10px] pixel-font font-bold rounded-full animate-in fade-in duration-200">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <span className={`pixel-font-body text-xs block ${isSelected ? 'opacity-100' : 'opacity-80'}`}>
                          {option.desc}
                        </span>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Inputs */}
          <div className="lg:col-span-2">
            <div className="pixel-card h-full">
              <div className="flex items-center justify-between mb-6 border-b-4 border-[var(--retro-navy)] pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[var(--retro-yellow)] border-2 border-[var(--retro-navy)]">
                    <PixelIcon name="sparkle" size={20} />
                  </div>
                  <h2 className="pixel-font text-lg text-[var(--retro-navy)]">Edit Stats</h2>
                </div>
                <button onClick={() => setIsEditing(false)} className="text-[var(--retro-navy)] hover:text-[var(--retro-red)]">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="pixel-font text-xs mb-2 block text-[var(--retro-navy)]">First Name</label>
                    <input type="text" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} className="pixel-input w-full" />
                  </div>
                  <div>
                    <label className="pixel-font text-xs mb-2 block text-[var(--retro-navy)]">Last Name</label>
                    <input type="text" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} className="pixel-input w-full" />
                  </div>
                </div>

                <div>
                  <label className="pixel-font text-xs mb-2 block text-[var(--retro-navy)]">Bio</label>
                  <textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} className="pixel-input w-full h-32 resize-none" maxLength={500} />
                </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="pixel-font text-xs mb-2 block text-[var(--retro-navy)]">Instagram</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-[var(--text-secondary)]">@</span>
                        <input type="text" value={profile.instagram} onChange={(e) => setProfile({ ...profile, instagram: e.target.value })} className="pixel-input w-full pl-8" />
                      </div>
                    </div>
                    <div>
                      <label className="pixel-font text-xs mb-2 block text-[var(--retro-navy)]">Contact Preference</label>
                      <CustomSelect
                        value={profile.contactPreference}
                        onChange={(val) => setProfile({ ...profile, contactPreference: val as any })}
                        options={[
                          { value: 'email', label: 'Email', icon: Mail },
                          { value: 'phone', label: 'Phone', icon: Phone },
                          { value: 'instagram', label: 'Instagram', icon: Instagram },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="pixel-font text-xs mb-2 block text-[var(--retro-navy)]">Gender</label>
                      <CustomSelect
                        value={profile.gender}
                        onChange={(val) => setProfile({ ...profile, gender: val as any })}
                        options={[
                          { value: '', label: 'Select gender', icon: null },
                          { value: 'male', label: 'Male', icon: null },
                          { value: 'female', label: 'Female', icon: null },
                          { value: 'non-binary', label: 'Non-binary', icon: null },
                          { value: 'prefer_not_to_say', label: 'Prefer not to say', icon: null },
                          { value: 'other', label: 'Other', icon: null },
                        ]}
                      />
                    </div>
                    <div>
                      <label className="pixel-font text-xs mb-2 block text-[var(--retro-navy)]">Looking for</label>
                      <CustomSelect
                        value={profile.genderPreference}
                        onChange={(val) => setProfile({ ...profile, genderPreference: val as any })}
                        options={[
                          { value: 'both', label: 'Anyone', icon: Heart },
                          { value: 'male', label: 'Male', icon: LucideUser },
                          { value: 'female', label: 'Female', icon: LucideUser },
                        ]}
                      />
                    </div>
                  </div>

                <div className="flex gap-4 pt-6 mt-8 border-t-2 border-dashed border-[var(--retro-navy)]">
                  <button onClick={handleSave} disabled={isSaving} className="pixel-btn w-full py-4 bg-[var(--retro-yellow)] text-[var(--retro-navy)]">
                    {isSaving ? <span className="animate-pulse">SAVING...</span> : <><Save className="w-4 h-4 mr-2 inline" /> SAVE CHANGES</>}
                  </button>
                  <button onClick={() => setIsEditing(false)} className="pixel-btn pixel-btn-secondary w-full py-4 text-[var(--retro-navy)]">
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
