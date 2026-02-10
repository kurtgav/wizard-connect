'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  Edit2, Save, X, Mail, Phone, Instagram, Eye, EyeOff,
  Shield, ChevronDown,
  Star, Settings, Camera, Zap,
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
          className="flex w-full items-center justify-between bg-white border-4 border-[var(--retro-navy)] h-12 px-4 shadow-[4px_4px_0_0_rgba(0,0,0,0.1)] focus:outline-none focus:shadow-[4px_4px_0_0_var(--retro-yellow)] transition-all"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {IconComponent && <IconComponent className="w-4 h-4 text-[var(--retro-navy)] flex-shrink-0" />}
            <span className="pixel-font-body text-base text-[var(--retro-navy)] truncate uppercase font-bold">
              {selectedOption?.label || placeholder}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-[var(--retro-navy)] flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scaleY: 0, originY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0 }}
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
                      hover:bg-[var(--retro-yellow)]/10 transition-colors
                      ${option.value === value ? 'bg-[var(--retro-yellow)]/30 border-l-8 border-[var(--retro-navy)]' : 'border-l-8 border-transparent'}
                    `}
                  >
                    {option.icon && <option.icon className="w-4 h-4 text-[var(--retro-navy)]" />}
                    <span className="pixel-font-body text-sm uppercase text-[var(--retro-navy)] font-bold">{option.label}</span>
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--retro-white)] border-4 border-[var(--retro-navy)] shadow-[12px_12px_0_0_var(--retro-navy)] overflow-hidden"
      >
        {/* ENHANCED TITLE BAR */}
        <div className="bg-[var(--retro-navy)] p-3 flex items-center justify-between border-b-4 border-[var(--retro-navy)] relative">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-[var(--retro-yellow)] flex items-center justify-center border-2 border-[var(--retro-navy)]">
              <UserIcon className="w-4 h-4 text-[var(--retro-navy)]" />
            </div>
            <span className="pixel-font text-white text-xs tracking-widest hidden md:inline">WIZARD_OS://SYSTEM_v2.1_PROFILE_MANAGER</span>
            <span className="pixel-font text-white text-xs tracking-widest md:hidden">v2.1_USER</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-black/20 rounded px-2 py-0.5 gap-2 mr-4">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="pixel-font text-[8px] text-white">CORE_SYNC_OK</span>
            </div>
            <button onClick={() => isEditing ? setIsEditing(false) : null} className="w-6 h-6 bg-[var(--retro-white)]/10 flex items-center justify-center border-2 border-white/20 hover:bg-[var(--retro-red)] hover:border-[var(--retro-navy)] transition-colors">
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
                <div className="w-48 h-48 border-4 border-[var(--retro-navy)] bg-[var(--retro-blue)]/10 shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] relative overflow-hidden group">
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
                  {/* Digital overlay effect */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] pointer-events-none" />
                </div>
              </div>

              <div className="w-full space-y-4">
                <div className="p-3 border-2 border-[var(--retro-navy)] bg-[#f9f9f9] text-center shadow-[4px_4px_0_0_rgba(0,0,0,0.05)]">
                  <div className="pixel-font text-[10px] text-gray-400 mb-1 tracking-widest">VISIBILITY_LEVEL</div>
                  <div className="flex items-center justify-center gap-2">
                    <visibility.icon className={`w-4 h-4 ${visibility.color}`} />
                    <span className="pixel-font-body text-base uppercase font-bold text-[var(--retro-navy)]">{visibility.label}</span>
                  </div>
                </div>

                <div className="p-4 border-2 border-[var(--retro-navy)] bg-[#f9f9f9] shadow-[4px_4px_0_0_rgba(0,0,0,0.05)]">
                  <div className="pixel-font text-[10px] text-gray-400 mb-3 border-b border-gray-200 pb-1 uppercase tracking-widest">Identity_Record</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="pixel-font text-[8px] text-gray-400">GENDER</span>
                      <span className="pixel-font-body text-sm font-bold uppercase text-[var(--retro-navy)]">{profile.gender || 'NONE'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="pixel-font text-[8px] text-gray-400">SEEKING</span>
                      <span className="pixel-font-body text-sm font-bold uppercase text-[var(--retro-navy)]">{profile.genderPreference}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-[var(--retro-navy)] text-white p-4 border-b-4 border-black hover:bg-[var(--retro-navy)]/90 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-3 shadow-[6px_6px_0_0_rgba(30,58,138,0.2)]"
                >
                  <Edit2 className="w-4 h-4 text-[var(--retro-yellow)]" />
                  <span className="pixel-font text-sm uppercase font-bold">CONFIGURE_PROFILE</span>
                </button>
              </div>
            </div>

            {/* Right Column: Content */}
            <div className="flex-1 p-8 md:p-12 space-y-8 overflow-y-auto">
              {/* Header */}
              <div className="space-y-4 border-b-4 border-dashed border-gray-100 pb-8">
                <h1 className="pixel-font text-4xl md:text-7xl text-[var(--retro-navy)] uppercase tracking-tighter leading-none">
                  {profile.firstName} <span className="text-[var(--retro-pink)]">{profile.lastName}</span>
                </h1>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-3 px-4 py-2 bg-[var(--retro-blue)]/5 border-2 border-[var(--retro-navy)] shadow-[4px_4px_0_0_rgba(0,0,0,0.1)]">
                    <Book className="w-4 h-4 text-[var(--retro-navy)]" />
                    <span className="pixel-font-body text-xl font-bold text-[var(--retro-navy)]">{profile.major || 'UNDECLARED'}</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2 bg-[var(--retro-yellow)]/10 border-2 border-[var(--retro-navy)] shadow-[4px_4px_0_0_rgba(0,0,0,0.1)]">
                    <Star className="w-4 h-4 text-[var(--retro-navy)]" />
                    <span className="pixel-font-body text-xl font-bold text-[var(--retro-navy)]">{profile.year || 'UNKNOWN_YEAR'}</span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="p-8 border-4 border-[var(--retro-navy)] bg-white relative shadow-[8px_8px_0_0_rgba(30,58,138,0.05)]">
                <div className="absolute -top-4 left-6 px-3 bg-white border-2 border-[var(--retro-navy)] pixel-font text-[10px] text-[var(--retro-navy)] font-bold shadow-[2px_2px_0_0_var(--retro-navy)]">
                  USER_BIOGRAPHY_BUFFER
                </div>
                <p className="pixel-font-body text-2xl md:text-3xl text-[var(--retro-navy)] leading-relaxed italic opacity-95">
                  {profile.bio || "No data stream received from this user's biography."}
                </p>
                <div className="absolute bottom-2 right-2 opacity-10">
                  <Shield className="w-12 h-12 text-[var(--retro-navy)]" />
                </div>
              </div>

              {/* Contact Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 border-2 border-[var(--retro-navy)] bg-[#fdfdfd] flex items-center gap-5 hover:bg-[var(--retro-yellow)]/5 transition-colors group shadow-[4px_4px_0_0_rgba(0,0,0,0.05)]">
                  <div className="w-12 h-12 border-2 border-[var(--retro-navy)] flex items-center justify-center bg-white group-hover:rotate-3 transition-transform">
                    <Mail className="w-6 h-6 text-[var(--retro-navy)]" />
                  </div>
                  <div className="min-w-0">
                    <div className="pixel-font text-[index-8px] opacity-40 uppercase tracking-tighter">Transmission_ID</div>
                    <div className="pixel-font-body text-lg font-bold truncate text-[var(--retro-navy)]">{profile.email}</div>
                  </div>
                </div>

                <div className="p-5 border-2 border-[var(--retro-navy)] bg-[#fdfdfd] flex items-center gap-5 hover:bg-[var(--retro-pink)]/5 transition-colors group shadow-[4px_4px_0_0_rgba(0,0,0,0.05)]">
                  <div className="w-12 h-12 border-2 border-[var(--retro-navy)] flex items-center justify-center bg-white group-hover:-rotate-3 transition-transform">
                    <Instagram className="w-6 h-6 text-[var(--retro-pink)]" />
                  </div>
                  <div className="min-w-0">
                    <div className="pixel-font text-[8px] opacity-40 uppercase tracking-tighter">Social_Interface</div>
                    <div className="pixel-font-body text-lg font-bold truncate text-[var(--retro-navy)]">@{profile.instagram || 'NOT_LINKED'}</div>
                  </div>
                </div>

                <div className="p-5 border-2 border-[var(--retro-navy)] bg-[#fdfdfd] flex items-center gap-5 hover:bg-blue-50 transition-colors group shadow-[4px_4px_0_0_rgba(0,0,0,0.05)]">
                  <div className="w-12 h-12 border-2 border-[var(--retro-navy)] flex items-center justify-center bg-white group-hover:scale-110 transition-transform">
                    <Phone className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="pixel-font text-[8px] opacity-40 uppercase tracking-tighter">Voice_Comm_Link</div>
                    <div className="pixel-font-body text-lg font-bold truncate text-[var(--retro-navy)]">{profile.phone || 'DISCONNECTED'}</div>
                  </div>
                </div>

                <div className="p-5 border-2 border-[var(--retro-navy)] bg-[#fdfdfd] flex items-center gap-5 hover:bg-gray-50 transition-colors group shadow-[4px_4px_0_0_rgba(0,0,0,0.05)]">
                  <div className="w-12 h-12 border-2 border-[var(--retro-navy)] flex items-center justify-center bg-white">
                    <Info className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="pixel-font text-[8px] opacity-40 uppercase tracking-tighter">Comm_Preference</div>
                    <div className="pixel-font-body text-lg font-bold truncate uppercase text-[var(--retro-navy)] font-bold">{profile.contactPreference}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ENHANCED EDIT MODE - PROFESSIONAL & MECHANICAL */
          <div className="flex flex-col lg:flex-row divide-y-4 lg:divide-y-0 lg:divide-x-4 divide-[var(--retro-navy)] bg-[#f8f9fa] min-h-[600px]">
            {/* Left: Avatar Management */}
            <div className="lg:w-80 p-8 flex flex-col items-center gap-8 bg-white">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-56 h-56 border-8 border-[var(--retro-navy)] bg-[var(--retro-blue)]/10 relative overflow-hidden shadow-[8px_8px_0_0_rgba(30,58,138,0.1)]">
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
                      <PixelIcon name="smiley" size={80} className="text-[var(--retro-navy)] opacity-20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[var(--retro-navy)]/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <Camera className="w-10 h-10 text-white" />
                    <span className="text-white pixel-font text-[10px] font-bold">REPLACE_MODULE</span>
                  </div>
                  {/* Mechanical detail corner */}
                  <div className="absolute top-0 right-0 w-8 h-8 bg-[var(--retro-yellow)] border-b-4 border-l-4 border-[var(--retro-navy)] flex items-center justify-center">
                    <Settings className="w-4 h-4 text-[var(--retro-navy)] animate-spin-slow" />
                  </div>
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

              <div className="w-full space-y-6">
                <div className="p-5 border-4 border-[var(--retro-navy)] bg-white shadow-[6px_6px_0_0_var(--retro-navy)]">
                  <div className="pixel-font text-[10px] text-gray-400 mb-4 border-b pb-2 tracking-widest flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Shield className="w-3 h-3" /> PRIVACY_LOCK
                    </span>
                    <span className="text-[var(--retro-yellow)]">LOCKED</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { val: 'public', label: 'PUBLIC_PROFILE', icon: Eye, color: 'text-green-600' },
                      { val: 'matches_only', label: 'MATCHES_ONLY', icon: Shield, color: 'text-blue-600' },
                      { val: 'private', label: 'PRIVATE_MODE', icon: EyeOff, color: 'text-gray-500' }
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => setProfile({ ...profile, visibility: opt.val as "public" | "matches_only" | "private" })}
                        className={`w-full p-3 border-2 flex items-center gap-3 transition-all ${profile.visibility === opt.val ? 'bg-[var(--retro-yellow)]/10 border-[var(--retro-navy)] scale-105 shadow-[4px_4px_0_0_var(--retro-navy)]' : 'bg-white border-gray-100 grayscale opacity-40 hover:opacity-100'}`}
                      >
                        <opt.icon className={`w-4 h-4 ${opt.color}`} />
                        <span className="pixel-font-body text-xs font-bold uppercase text-[var(--retro-navy)]">{opt.label}</span>
                        {profile.visibility === opt.val && <div className="ml-auto w-3 h-3 bg-[var(--retro-navy)]" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Detailed Fields */}
            <div className="flex-1 p-8 md:p-12 space-y-12 overflow-y-auto bg-white">
              <div className="flex items-center gap-6 pb-6 border-b-8 border-gray-50">
                <div className="w-16 h-16 bg-[var(--retro-yellow)] border-4 border-[var(--retro-navy)] flex items-center justify-center shadow-[4px_4px_0_0_black]">
                  <Settings className="w-8 h-8 text-[var(--retro-navy)]" />
                </div>
                <div>
                  <h2 className="pixel-font text-3xl text-[var(--retro-navy)] uppercase tracking-tight">IDENTITY_CONFIGURATION</h2>
                  <p className="pixel-font-body text-base text-gray-400 uppercase tracking-widest">WIZARD_OS://ACCOUNT_MANAGER_E21</p>
                </div>
              </div>

              {/* Form Groups */}
              <div className="space-y-10">
                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="pixel-font text-[10px] text-gray-400 ml-1 font-bold">IDENTITY_ALPHA</label>
                    <div className="flex border-4 border-[var(--retro-navy)] focus-within:ring-4 focus-within:ring-[var(--retro-yellow)]/20 transition-all">
                      <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        className="w-full h-12 px-4 bg-white outline-none pixel-font-body text-xl text-[var(--retro-navy)] font-bold"
                        placeholder="FIRST_NAME"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="pixel-font text-[10px] text-gray-400 ml-1 font-bold">IDENTITY_BETA</label>
                    <div className="flex border-4 border-[var(--retro-navy)] focus-within:ring-4 focus-within:ring-[var(--retro-yellow)]/20 transition-all">
                      <input
                        type="text"
                        value={profile.lastName}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                        className="w-full h-12 px-4 bg-white outline-none pixel-font-body text-xl text-[var(--retro-navy)] font-bold"
                        placeholder="LAST_NAME"
                      />
                    </div>
                  </div>
                </div>

                {/* Academic & Bio */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="pixel-font text-[10px] text-gray-400 ml-1 font-bold">CHRONOLOGY_LEVEL</label>
                    <CustomSelect
                      value={profile.year}
                      onChange={(val) => setProfile({ ...profile, year: val })}
                      options={YEAR_OPTIONS}
                      placeholder="SELECT_YEAR"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="pixel-font text-[10px] text-gray-400 ml-1 font-bold">CORE_SPECIALIZATION_ID</label>
                    <div className="flex border-4 border-[var(--retro-navy)] bg-white focus-within:ring-4 focus-within:ring-[var(--retro-yellow)]/20 transition-all">
                      <input
                        list="majors"
                        type="text"
                        value={profile.major}
                        onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                        className="flex-1 h-12 px-4 outline-none pixel-font-body text-xl text-[var(--retro-navy)] uppercase font-bold bg-transparent"
                        placeholder="SEARCH_MAJORS..."
                      />
                      <div className="w-12 h-12 flex items-center justify-center border-l-4 border-[var(--retro-navy)] bg-[var(--retro-navy)]/5">
                        <Book className="w-5 h-5 text-[var(--retro-navy)] opacity-40" />
                      </div>
                      <datalist id="majors">
                        {MAJOR_OPTIONS.map(m => <option key={m} value={m} />)}
                      </datalist>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="pixel-font text-[10px] text-gray-400 uppercase tracking-widest font-bold">Biographical_Data_Matrix</label>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      <span className="pixel-font text-[8px] text-gray-300">{profile.bio.length}/500_BLOCKS</span>
                    </div>
                  </div>
                  <div className="border-4 border-[var(--retro-navy)] p-1 bg-white focus-within:ring-4 focus-within:ring-[var(--retro-yellow)]/20 transition-all">
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      className="w-full h-40 p-4 resize-none outline-none pixel-font-body text-2xl text-[var(--retro-navy)] leading-relaxed bg-[#f9f9f9]/30"
                      maxLength={500}
                      placeholder="DESCRIBE_YOURSELF_FOR_OTHER_USERS..."
                    />
                  </div>
                </div>

                {/* Social & Contact - THE FIXED ROBUST LAYOUT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-[#f9f9f9] border-8 border-double border-[var(--retro-navy)]/10 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-5">
                    <Zap className="w-24 h-24 text-[var(--retro-navy)]" />
                  </div>

                  <div className="space-y-2 relative z-10">
                    <label className="pixel-font text-[10px] text-gray-400 ml-1 font-bold">SOCIAL_INTERFACE_HANDLE</label>
                    <div className="flex border-4 border-[var(--retro-navy)] bg-white focus-within:ring-8 focus-within:ring-[var(--retro-yellow)]/20 transition-all">
                      <div className="w-14 h-14 flex items-center justify-center bg-[var(--retro-navy)] border-r-4 border-[var(--retro-navy)] flex-shrink-0 shadow-[2px_0_4px_rgba(0,0,0,0.1)]">
                        <Instagram className="w-6 h-6 text-white" />
                      </div>
                      <input
                        type="text"
                        value={profile.instagram}
                        onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                        className="flex-1 h-14 px-5 outline-none pixel-font-body text-2xl text-[var(--retro-navy)] bg-transparent font-bold"
                        placeholder="@USERNAME"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 relative z-10">
                    <label className="pixel-font text-[10px] text-gray-400 ml-1 font-bold">VOICE_COMM_LINK</label>
                    <div className="flex border-4 border-[var(--retro-navy)] bg-white focus-within:ring-8 focus-within:ring-[var(--retro-yellow)]/20 transition-all">
                      <div className="w-14 h-14 flex items-center justify-center bg-blue-600 border-r-4 border-[var(--retro-navy)] flex-shrink-0 shadow-[2px_0_4px_rgba(0,0,0,0.1)]">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <input
                        type="text"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="flex-1 h-14 px-5 outline-none pixel-font-body text-2xl text-[var(--retro-navy)] bg-transparent font-bold"
                        placeholder="PHONE_NUMBER"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-3 pt-4">
                    <label className="pixel-font text-[10px] text-gray-400 ml-1 font-bold uppercase tracking-widest flex items-center gap-2">
                      <Zap className="w-3 h-3 text-[var(--retro-yellow)]" /> PREFERRED_TRANSMISSION_FREQUENCY
                    </label>
                    <div className="flex gap-4">
                      {['email', 'instagram', 'phone'].map((pref) => (
                        <button
                          key={pref}
                          onClick={() => setProfile({ ...profile, contactPreference: pref as 'email' | 'phone' | 'instagram' })}
                          className={`flex-1 h-14 border-4 pixel-font text-[10px] uppercase font-heavy transition-all shadow-[4px_4px_0_0_black] active:translate-x-1 active:translate-y-1 active:shadow-none ${profile.contactPreference === pref ? 'bg-[var(--retro-navy)] text-white border-[var(--retro-navy)]' : 'bg-white border-gray-100 text-gray-300 grayscale'}`}
                        >
                          {pref}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Main Actions */}
                <div className="flex flex-col md:flex-row gap-6 pt-10 border-t-8 border-gray-50">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-[2] bg-[var(--retro-yellow)] text-[var(--retro-navy)] h-20 border-4 border-black shadow-[10px_10px_0_0_black] hover:shadow-[4px_4px_0_0_black] hover:translate-x-1.5 hover:translate-y-1.5 active:shadow-none active:translate-x-4 active:translate-y-4 transition-all flex items-center justify-center gap-6 disabled:opacity-50 group"
                  >
                    {isSaving ? (
                      <div className="pixel-spinner-sm" />
                    ) : (
                      <>
                        <Save className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                        <span className="pixel-font text-2xl uppercase font-heavy">COMMIT_CHANGES_TO_DATABASE</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-white text-gray-400 h-20 border-4 border-gray-100 hover:border-[var(--retro-red)] hover:text-[var(--retro-red)] hover:bg-red-50 transition-all uppercase pixel-font text-lg font-bold shadow-[10px_10px_0_0_rgba(0,0,0,0.05)]"
                  >
                    DISCARD
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* BACKGROUND DECORATIONS */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 bg-[#FFFBEB]">
        <div className="absolute inset-0 opacity-[0.03] bg-[size:20px_20px] bg-[linear-gradient(to_right,#1e3a8a_1px,transparent_1px),linear-gradient(to_bottom,#1e3a8a_1px,transparent_1px)]" />
        <div className="absolute top-1/4 -left-20 w-96 h-96 border-[40px] border-[var(--retro-navy)]/5 rounded-full" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 border-[40px] border-[var(--retro-pink)]/5 rounded-full" />
      </div>

      <style jsx global>{`
        .pixel-spinner-sm {
           width: 32px;
           height: 32px;
           border: 6px solid var(--retro-navy);
           border-top-color: transparent;
           animation: spin 1s linear infinite;
        }
        @keyframes spin {
           to { transform: rotate(360deg); }
        }
        .pixelated {
          image-rendering: pixelated;
        }
        .animate-spin-slow {
           animation: spin 8s linear infinite;
        }
        .font-heavy {
           font-weight: 900;
        }
      `}</style>
    </div>
  )
}
