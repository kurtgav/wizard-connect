'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  Edit2, Save, X, Mail, Phone, Instagram, Eye, EyeOff,
  Shield, ChevronDown,
  Star, Settings, Camera,
  Book, Info, User as UserIcon
} from 'lucide-react'
import { LucideIcon } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { PixelIcon } from '@/components/ui/PixelIcon'
import { useAuth } from '@/contexts/AuthContext'
import { useProfileUpdates } from '@/hooks/useProfileUpdates'
import type { User } from '@/types/api'

interface SelectOption {
  value: string
  label: string
  icon: LucideIcon | null
}

const YEAR_OPTIONS: SelectOption[] = [
  { value: 'Freshman (1st Year)', label: 'Freshman', icon: Star },
  { value: 'Sophomore (2nd Year)', label: 'Sophomore', icon: Star },
  { value: 'Junior (3rd Year)', label: 'Junior', icon: Star },
  { value: 'Senior (4th Year)', label: 'Senior', icon: Star },
  { value: 'Super Senior+', label: 'Super Senior+', icon: Star },
  { value: 'Graduate Student', label: 'Graduate', icon: Star },
]

const MAJOR_OPTIONS: string[] = [
  'BSCS', 'BSIT', 'BSIS', 'BSCE', 'BSEE', 'BSME', 'BSA', 'BSBA', 'BSHM', 'BSTM', 'BSPsych', 'BSBio', 'BSN'
]

export default function ProfilePage() {
  const { userProfile: contextProfile, loading: authLoading } = useAuth()
  const [selectOpenStates, setSelectOpenStates] = useState<Record<string, boolean>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    instagram: '',
    phone: '',
    email: '',
    year: '',
    major: '',
    contactPreference: 'email' as 'email' | 'phone' | 'instagram',
    visibility: 'matches_only' as 'public' | 'matches_only' | 'private',
    gender: '' as 'male' | 'female' | 'non-binary' | 'prefer_not_to_say' | 'other' | '',
    genderPreference: 'both' as 'male' | 'female' | 'both',
    avatarUrl: '',
  })

  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Sync state with context
  useEffect(() => {
    if (contextProfile) {
      setProfile({
        firstName: contextProfile.first_name || '',
        lastName: contextProfile.last_name || '',
        bio: contextProfile.bio || '',
        instagram: contextProfile.instagram || '',
        phone: contextProfile.phone || '',
        email: contextProfile.email || '',
        year: contextProfile.year || '',
        major: contextProfile.major || '',
        contactPreference: contextProfile.contact_preference || 'email',
        visibility: contextProfile.visibility || 'matches_only',
        gender: contextProfile.gender || '',
        genderPreference: contextProfile.gender_preference || 'both',
        avatarUrl: contextProfile.avatar_url || '',
      })
      setLoading(false)
    } else if (!authLoading) {
      fetchUserProfile()
    }
  }, [contextProfile, authLoading])

  useProfileUpdates(async () => {
    const user = await apiClient.getProfile()
    setProfile({
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      bio: user.bio || '',
      instagram: user.instagram || '',
      phone: user.phone || '',
      email: user.email || '',
      year: user.year || '',
      major: user.major || '',
      contactPreference: user.contact_preference || 'email',
      visibility: user.visibility || 'matches_only',
      gender: user.gender || '',
      genderPreference: user.gender_preference || 'both',
      avatarUrl: user.avatar_url || '',
    })
  })

  const fetchUserProfile = async () => {
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
        year: user.year || '',
        major: user.major || '',
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
      let finalAvatarUrl = profile.avatarUrl

      if (selectedFile) {
        try {
          const { createClient } = await import('@/lib/supabase/client')
          const supabase = createClient()
          const fileExt = selectedFile.name.split('.').pop()
          const fileName = `${Math.random()}.${fileExt}`
          const filePath = `${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, selectedFile)

          if (uploadError) throw uploadError

          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath)

          finalAvatarUrl = publicUrl
          setProfile(prev => ({ ...prev, avatarUrl: publicUrl }))
        } catch (uploadErr) {
          console.error('Image upload failed:', uploadErr)
          alert('Failed to upload profile picture.')
          setIsSaving(false)
          return
        }
      }

      const updateData: Partial<User> = {
        first_name: profile.firstName,
        last_name: profile.lastName,
        bio: profile.bio,
        instagram: profile.instagram,
        phone: profile.phone,
        year: profile.year,
        major: profile.major,
        avatar_url: finalAvatarUrl,
        contact_preference: profile.contactPreference,
        visibility: profile.visibility,
        gender: profile.gender || undefined,
        gender_preference: profile.genderPreference,
      }

      await apiClient.updateProfile(updateData)
      setSelectedFile(null)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save profile:', error)
      alert('Failed to save profile.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setProfile(prev => ({ ...prev, avatarUrl: url }))
    }
  }

  const getVisibilityInfo = (val: string) => {
    switch (val) {
      case 'public': return { label: 'PUBLIC_PROFILE', icon: Eye, color: 'text-green-500', bg: 'bg-green-500/10' }
      case 'private': return { label: 'HIDDEN_MODE', icon: EyeOff, color: 'text-gray-500', bg: 'bg-gray-500/10' }
      default: return { label: 'MATCHES_ONLY', icon: Shield, color: 'text-blue-500', bg: 'bg-blue-500/10' }
    }
  }

  const CustomSelect = ({ value, onChange, options, placeholder = 'Select...' }: { value: string, onChange: (val: string) => void, options: SelectOption[], placeholder?: string }) => {
    const isOpen = selectOpenStates[placeholder] || false
    const setIsOpen = (open: boolean) => setSelectOpenStates(prev => ({ ...prev, [placeholder]: open }))
    const selectedOption = options.find(opt => opt.value === value)
    const IconComponent = selectedOption?.icon

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="pixel-input w-full flex items-center justify-between bg-white text-left h-12"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {IconComponent && <IconComponent className="w-4 h-4 text-[var(--retro-navy)] flex-shrink-0" />}
            <span className="pixel-font-body text-base text-[var(--retro-navy)] truncate uppercase">
              {selectedOption?.label || placeholder}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-[var(--retro-navy)] flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-2 bg-white border-4 border-[var(--retro-navy)] shadow-[8px_8px_0_rgba(0,0,0,0.2)] overflow-hidden"
            >
              <div className="max-h-60 overflow-y-auto custom-scrollbar">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value)
                      setIsOpen(false)
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 text-left
                      hover:bg-[var(--retro-blue)]/20 transition-colors
                      ${option.value === value ? 'bg-[var(--retro-yellow)]/30 border-l-4 border-[var(--retro-navy)]' : 'border-l-4 border-transparent'}
                    `}
                  >
                    {option.icon && <option.icon className="w-4 h-4 text-[var(--retro-navy)]" />}
                    <span className="pixel-font-body text-sm uppercase text-[var(--retro-navy)]">{option.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="pixel-spinner mb-4" />
      <p className="pixel-font text-[var(--retro-navy)] animate-pulse uppercase">Restoring profile data...</p>
    </div>
  )

  const visibility = getVisibilityInfo(profile.visibility)

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[var(--retro-white)] border-4 border-[var(--retro-navy)] shadow-[12px_12px_0_0_var(--retro-navy)] overflow-hidden"
      >
        {/* Simplified Title Bar */}
        <div className="bg-[var(--retro-navy)] p-3 flex items-center justify-between border-b-4 border-[var(--retro-navy)] relative">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-[var(--retro-yellow)] flex items-center justify-center border-2 border-[var(--retro-navy)]">
              <UserIcon className="w-4 h-4 text-[var(--retro-navy)]" />
            </div>
            <span className="pixel-font text-white text-xs tracking-widest hidden md:inline">SYSTEM://USER_PROFILE_MANAGER</span>
            <span className="pixel-font text-white text-xs tracking-widest md:hidden">USER_PROFILE</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => isEditing ? setIsEditing(false) : null} className="w-6 h-6 bg-[var(--retro-red)] flex items-center justify-center border-2 border-[var(--retro-navy)] hover:bg-red-400 transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="p-1 bg-[var(--retro-yellow)] h-1 w-full" />

        {!isEditing ? (
          /* VIEW MODE - CLEAN & PROFESSIONAL */
          <div className="flex flex-col lg:flex-row divide-y-4 lg:divide-y-0 lg:divide-x-4 divide-[var(--retro-navy)] bg-white min-h-[500px]">

            {/* Left Column: Avatar & Basic Info */}
            <div className="lg:w-80 flex-shrink-0 p-8 flex flex-col items-center bg-[#fdfdfd]">
              <div className="relative mb-6">
                <div className="w-48 h-48 border-4 border-[var(--retro-navy)] bg-[var(--retro-blue)]/10 shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] relative overflow-hidden">
                  {profile.avatarUrl ? (
                    <Image
                      src={profile.avatarUrl}
                      alt="Profile Avatar"
                      fill
                      unoptimized
                      className="object-cover pixelated"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PixelIcon name="smiley" size={80} className="text-[var(--retro-navy)] opacity-30 p-10" />
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full space-y-4">
                <div className="p-3 border-2 border-[var(--retro-navy)] bg-[#f9f9f9] text-center">
                  <div className="pixel-font text-[10px] text-gray-500 mb-1">VISIBILITY_LEVEL</div>
                  <div className="flex items-center justify-center gap-2">
                    <visibility.icon className={`w-4 h-4 ${visibility.color}`} />
                    <span className="pixel-font-body text-base uppercase font-bold text-[var(--retro-navy)]">{visibility.label}</span>
                  </div>
                </div>

                <div className="p-3 border-2 border-[var(--retro-navy)] bg-[#f9f9f9]">
                  <div className="pixel-font text-[10px] text-gray-500 mb-2">IDENTIFICATION</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="pixel-font text-[8px] opacity-60">GENDER</span>
                      <span className="pixel-font-body text-xs font-bold uppercase">{profile.gender || 'NONE'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="pixel-font text-[8px] opacity-60">SEEKING</span>
                      <span className="pixel-font-body text-xs font-bold uppercase">{profile.genderPreference}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-[var(--retro-navy)] text-white p-4 border-b-4 border-black active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-3"
                >
                  <Edit2 className="w-4 h-4 text-[var(--retro-yellow)]" />
                  <span className="pixel-font text-sm uppercase">EDIT_PROFILE</span>
                </button>
              </div>
            </div>

            {/* Right Column: Content */}
            <div className="flex-1 p-8 md:p-12 space-y-8 overflow-y-auto">
              {/* Header */}
              <div className="space-y-2">
                <h1 className="pixel-font text-4xl md:text-6xl text-[var(--retro-navy)] uppercase tracking-tighter">
                  {profile.firstName} <span className="text-[var(--retro-pink)]">{profile.lastName}</span>
                </h1>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-[var(--retro-blue)]/10 border-2 border-[var(--retro-navy)] pixel-font text-[10px] text-[var(--retro-navy)]">
                    {profile.major || 'UNDECLARED'}
                  </span>
                  <span className="px-3 py-1 bg-[var(--retro-yellow)]/20 border-2 border-[var(--retro-navy)] pixel-font text-[10px] text-[var(--retro-navy)]">
                    {profile.year || 'UNKNOWN_YEAR'}
                  </span>
                </div>
              </div>

              {/* Bio */}
              <div className="p-6 border-4 border-[var(--retro-navy)] bg-white relative">
                <div className="absolute -top-3 left-4 px-2 bg-white pixel-font text-[10px] text-[var(--retro-navy)] font-bold">
                  BIOGRAPHY
                </div>
                <p className="pixel-font-body text-lg md:text-xl text-[var(--retro-navy)] leading-relaxed italic opacity-90">
                  {profile.bio || "No biography provided."}
                </p>
              </div>

              {/* Contact Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border-2 border-[var(--retro-navy)] bg-[#f9f9f9] flex items-center gap-4">
                  <div className="w-10 h-10 border-2 border-[var(--retro-navy)] flex items-center justify-center bg-white">
                    <Mail className="w-5 h-5 text-[var(--retro-navy)]" />
                  </div>
                  <div className="min-w-0">
                    <div className="pixel-font text-[8px] opacity-40">EMAIL</div>
                    <div className="pixel-font-body text-sm font-bold truncate">{profile.email}</div>
                  </div>
                </div>

                <div className="p-4 border-2 border-[var(--retro-navy)] bg-[#f9f9f9] flex items-center gap-4">
                  <div className="w-10 h-10 border-2 border-[var(--retro-navy)] flex items-center justify-center bg-white">
                    <Instagram className="w-5 h-5 text-[var(--retro-pink)]" />
                  </div>
                  <div className="min-w-0">
                    <div className="pixel-font text-[8px] opacity-40">INSTAGRAM</div>
                    <div className="pixel-font-body text-sm font-bold truncate">@{profile.instagram || 'NOT_SET'}</div>
                  </div>
                </div>

                <div className="p-4 border-2 border-[var(--retro-navy)] bg-[#f9f9f9] flex items-center gap-4">
                  <div className="w-10 h-10 border-2 border-[var(--retro-navy)] flex items-center justify-center bg-white">
                    <Phone className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="pixel-font text-[8px] opacity-40">PHONE</div>
                    <div className="pixel-font-body text-sm font-bold truncate">{profile.phone || 'NOT_SET'}</div>
                  </div>
                </div>

                <div className="p-4 border-2 border-[var(--retro-navy)] bg-[#f9f9f9] flex items-center gap-4">
                  <div className="w-10 h-10 border-2 border-[var(--retro-navy)] flex items-center justify-center bg-white">
                    <Info className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="pixel-font text-[8px] opacity-40">PREFERENCE</div>
                    <div className="pixel-font-body text-sm font-bold truncate uppercase">{profile.contactPreference}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ENHANCED EDIT MODE - PROFESSIONAL & ORGANIZED */
          <div className="flex flex-col lg:flex-row divide-y-4 lg:divide-y-0 lg:divide-x-4 divide-[var(--retro-navy)] bg-[#f5f5f5] min-h-[600px]">
            {/* Left: Avatar Management */}
            <div className="lg:w-80 p-8 flex flex-col items-center gap-6 bg-white">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-48 h-48 border-4 border-[var(--retro-navy)] bg-[var(--retro-blue)]/10 relative overflow-hidden">
                  {profile.avatarUrl ? (
                    <Image
                      src={profile.avatarUrl}
                      alt="Preview"
                      fill
                      unoptimized
                      className="object-cover pixelated"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-12">
                      <PixelIcon name="smiley" size={60} className="text-[var(--retro-navy)] opacity-20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <Camera className="w-8 h-8 text-white" />
                    <span className="text-white pixel-font text-[8px]">CHANGE_IMAGE</span>
                  </div>
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

              <div className="w-full space-y-4">
                <div className="p-4 border-4 border-[var(--retro-navy)] bg-white shadow-[4px_4px_0_0_var(--retro-navy)]">
                  <div className="pixel-font text-[10px] text-gray-400 mb-4 border-b pb-2 tracking-widest flex items-center gap-2">
                    <Shield className="w-3 h-3" /> PRIVACY_SETTINGS
                  </div>
                  <div className="space-y-2">
                    {[
                      { val: 'public', label: 'PUBLIC_PROFILE', icon: Eye, color: 'text-green-600' },
                      { val: 'matches_only', label: 'MATCHES_ONLY', icon: Shield, color: 'text-blue-600' },
                      { val: 'private', label: 'PRIVATE_MODE', icon: EyeOff, color: 'text-gray-500' }
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => setProfile({ ...profile, visibility: opt.val as "public" | "matches_only" | "private" })}
                        className={`w-full p-2 border-2 flex items-center gap-3 transition-all ${profile.visibility === opt.val ? 'bg-[var(--retro-yellow)]/20 border-[var(--retro-navy)]' : 'bg-white border-transparent grayscale opacity-50'}`}
                      >
                        <opt.icon className={`w-3 h-3 ${opt.color}`} />
                        <span className="pixel-font text-[8px] font-bold">{opt.label}</span>
                        {profile.visibility === opt.val && <div className="ml-auto w-2 h-2 bg-[var(--retro-navy)] rounded-full" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Detailed Fields */}
            <div className="flex-1 p-8 md:p-12 space-y-10 overflow-y-auto bg-white">
              <div className="flex items-center gap-4 pb-4 border-b-4 border-[var(--retro-navy)]/10">
                <div className="w-12 h-12 bg-[var(--retro-yellow)] border-4 border-[var(--retro-navy)] flex items-center justify-center">
                  <Settings className="w-6 h-6 text-[var(--retro-navy)]" />
                </div>
                <div>
                  <h2 className="pixel-font text-2xl text-[var(--retro-navy)] uppercase">ACCOUNT_CONFIGURATION</h2>
                  <p className="pixel-font text-[8px] text-gray-400 uppercase tracking-widest">v2.0_PROFILE_EDITOR_STABLE</p>
                </div>
              </div>

              {/* Form Groups */}
              <div className="space-y-8">
                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="pixel-font text-[10px] text-gray-400 ml-1">FIRST_NAME_ALPHA</label>
                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      className="pixel-input w-full h-12 pl-4 bg-white focus:bg-[var(--retro-yellow)]/5 transition-colors"
                      placeholder="ENTER_FIRST_NAME"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="pixel-font text-[10px] text-gray-400 ml-1">LAST_NAME_BETA</label>
                    <input
                      type="text"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      className="pixel-input w-full h-12 pl-4 focus:bg-[var(--retro-yellow)]/5 transition-colors"
                      placeholder="ENTER_LAST_NAME"
                    />
                  </div>
                </div>

                {/* Academic & Bio */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="pixel-font text-[10px] text-gray-400 ml-1">ACADEMIC_LEVEL</label>
                    <CustomSelect
                      value={profile.year}
                      onChange={(val) => setProfile({ ...profile, year: val })}
                      options={YEAR_OPTIONS}
                      placeholder="CHOOSE_LEVEL"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="pixel-font text-[10px] text-gray-400 ml-1">CORE_MAJOR_ID</label>
                    <div className="relative">
                      <input
                        list="majors"
                        type="text"
                        value={profile.major}
                        onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                        className="pixel-input w-full h-12 pl-4 uppercase"
                        placeholder="SEARCH_MAJORS..."
                      />
                      <datalist id="majors">
                        {MAJOR_OPTIONS.map(m => <option key={m} value={m} />)}
                      </datalist>
                      <Book className="absolute right-3 top-3.5 w-5 h-5 text-[var(--retro-navy)] opacity-20" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="pixel-font text-[10px] text-gray-400 uppercase tracking-widest">BIOGRAPHICAL_DATA_BUFFER</label>
                    <span className="pixel-font text-[8px] text-gray-400">{profile.bio.length}/500_CHARS</span>
                  </div>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="pixel-input w-full h-32 p-4 resize-none leading-relaxed"
                    maxLength={500}
                    placeholder="DESCRIBE_YOURSELF_FOR_OTHER_USERS..."
                  />
                </div>

                {/* Social & Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-[#f9f9f9] border-4 border-dashed border-[var(--retro-navy)]/10">
                  <div className="space-y-2">
                    <label className="pixel-font text-[10px] text-gray-400 ml-1">SOCIAL_HUB_HANDLE</label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 w-12 h-12 flex items-center justify-center border-r-2 border-[var(--retro-navy)]/20">
                        <Instagram className="w-5 h-5 text-[var(--retro-pink)]" />
                      </div>
                      <input
                        type="text"
                        value={profile.instagram}
                        onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                        className="pixel-input w-full h-12 pl-14"
                        placeholder="@USERNAME"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="pixel-font text-[10px] text-gray-400 ml-1">VOICE_COMMS_LINK</label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 w-12 h-12 flex items-center justify-center border-r-2 border-[var(--retro-navy)]/20">
                        <Phone className="w-5 h-5 text-blue-500" />
                      </div>
                      <input
                        type="text"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="pixel-input w-full h-12 pl-14"
                        placeholder="PHONE_NUMBER"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="pixel-font text-[10px] text-gray-400 ml-1">PREFERRED_TRANSMISSION_METHOD</label>
                    <div className="flex gap-2">
                      {['email', 'instagram', 'phone'].map((pref) => (
                        <button
                          key={pref}
                          onClick={() => setProfile({ ...profile, contactPreference: pref as 'email' | 'phone' | 'instagram' })}
                          className={`flex-1 h-12 border-2 pixel-font text-[10px] uppercase font-bold transition-all ${profile.contactPreference === pref ? 'bg-[var(--retro-navy)] text-white border-[var(--retro-navy)]' : 'bg-white border-[var(--retro-navy)]/20 text-gray-400'}`}
                        >
                          {pref}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col md:flex-row gap-4 pt-6">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-[2] bg-[var(--retro-yellow)] text-[var(--retro-navy)] h-16 border-4 border-black shadow-[8px_8px_0_0_black] hover:shadow-[2px_2px_0_0_black] hover:translate-x-1 hover:translate-y-1 active:shadow-none active:translate-x-2 active:translate-y-2 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <div className="pixel-spinner-sm" />
                    ) : (
                      <>
                        <Save className="w-6 h-6" />
                        <span className="pixel-font text-lg uppercase font-bold">SAVE_ALL_CHANGES</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-white text-gray-400 h-16 border-4 border-gray-200 hover:border-[var(--retro-red)] hover:text-[var(--retro-red)] transition-all uppercase pixel-font text-sm font-bold"
                  >
                    DISCARD
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-5">
        <div className="absolute top-10 right-10 w-96 h-96 border-8 border-[var(--retro-navy)] rotate-12" />
        <div className="absolute bottom-20 left-10 w-64 h-64 border-8 border-[var(--retro-pink)] -rotate-12" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(var(--retro-navy)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
      </div>

      <style jsx global>{`
        .pixel-spinner-sm {
           width: 24px;
           height: 24px;
           border: 4px solid var(--retro-navy);
           border-top-color: transparent;
           animation: spin 1s linear infinite;
        }
        @keyframes spin {
           to { transform: rotate(360deg); }
        }
        .pixelated {
          image-rendering: pixelated;
        }
        .pixel-input:focus {
          outline: none;
          border-color: var(--retro-navy);
          box-shadow: 4px 4px 0 0 var(--retro-navy);
        }
      `}</style>
    </div>
  )
}
