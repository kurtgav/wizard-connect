'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PixelIcon } from '@/components/ui/PixelIcon'
import { Mail, Phone, Instagram, Shield, Eye, EyeOff, MessageSquare, ChevronLeft } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import type { User } from '@/types/api'

export default function PublicProfilePage() {
    const params = useParams()
    const router = useRouter()
    const [profile, setProfile] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (params.id) {
            fetchProfile(params.id as string)
        }
    }, [params.id])

    const fetchProfile = async (id: string) => {
        try {
            setLoading(true)
            const data = await apiClient.getUserProfileByID(id)
            setProfile(data)
        } catch (err) {
            console.error('Failed to fetch profile:', err)
            setError('User not found or profile is private.')
        } finally {
            setLoading(false)
        }
    }

    const handleMessage = async () => {
        if (!profile) return
        try {
            await apiClient.createConversation(profile.id)
            router.push('/messages')
        } catch (err) {
            console.error('Failed to start conversation:', err)
            alert('Failed to start conversation')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="inline-block bg-[var(--retro-yellow)] border-4 border-[var(--retro-navy)] px-6 py-3 mb-4 animate-pulse">
                        <p className="pixel-font text-lg text-[var(--retro-navy)]">LOADING...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !profile) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 text-center">
                <div className="pixel-card inline-block max-w-md">
                    <PixelIcon name="chick" size={48} className="mx-auto mb-4" />
                    <h2 className="pixel-font text-xl text-[var(--retro-navy)] mb-2">ERROR</h2>
                    <p className="pixel-font-body text-gray-600 mb-6">{error || 'User not found'}</p>
                    <button
                        onClick={() => router.back()}
                        className="pixel-btn pixel-btn-secondary px-6 py-2"
                    >
                        GO BACK
                    </button>
                </div>
            </div>
        )
    }

    const getVisibilityLabel = (val: string) => {
        switch (val) {
            case 'public': return { label: 'Public Server', icon: Eye, color: 'text-green-600', bg: 'bg-green-100' }
            case 'private': return { label: 'Offline Mode', icon: EyeOff, color: 'text-gray-600', bg: 'bg-gray-100' }
            default: return { label: 'Guild Only', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-100' }
        }
    }

    const visibilityInfo = getVisibilityLabel(profile.visibility || 'matches_only')
    const VisIcon = visibilityInfo.icon

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="mb-6 flex items-center gap-2 text-[var(--retro-navy)] hover:text-[var(--retro-red)] transition-colors group"
            >
                <div className="bg-white border-2 border-[var(--retro-navy)] p-1 group-hover:bg-[var(--retro-yellow)] transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </div>
                <span className="pixel-font text-sm uppercase tracking-wider">BACK TO MATCHES</span>
            </button>

            {/* Profile Card */}
            <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500">
                <div className="w-full bg-white border-4 border-[var(--retro-navy)] p-6 md:p-10 relative shadow-[12px_12px_0_0_rgba(30,58,138,0.2)]">

                    {/* Status Badge */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--retro-yellow)] border-l-4 border-b-4 border-[var(--retro-navy)] flex items-center justify-center">
                        <div className="transform -rotate-45 translate-x-1 translate-y-1">
                            <span className="pixel-font text-xs text-[var(--retro-navy)] block text-center">STATUS</span>
                            <span className="pixel-font text-xl text-[var(--retro-navy)] block text-center leading-none">ACTIVE</span>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 mt-2">
                        {/* Left Column */}
                        <div className="flex-shrink-0 flex flex-col gap-4 w-full md:w-auto items-center md:items-start">
                            <div className="w-56 h-56 bg-white border-4 border-[var(--retro-navy)] shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] relative overflow-hidden">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[var(--retro-blue)]">
                                        <PixelIcon name="smiley" size={80} className="text-white" />
                                    </div>
                                )}
                            </div>

                            <div className={`w-56 py-2 px-3 border-2 border-[var(--retro-navy)] flex items-center justify-center gap-2 ${visibilityInfo.bg}`}>
                                <VisIcon className={`w-4 h-4 ${visibilityInfo.color}`} />
                                <span className={`pixel-font text-xs uppercase ${visibilityInfo.color}`}>{visibilityInfo.label}</span>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="flex-1 min-w-0 pt-2 w-full">
                            <h1 className="pixel-font text-4xl md:text-6xl text-[var(--retro-navy)] uppercase leading-[0.9] mb-4 text-center md:text-left">
                                {profile.first_name || 'Anonymous'}<br />
                                {profile.last_name || 'User'}
                            </h1>

                            <div className="flex flex-wrap gap-3 mb-8 justify-center md:justify-start">
                                <div className="bg-[var(--retro-blue)] text-white px-4 py-1 border-2 border-[var(--retro-navy)] shadow-[4px_4px_0_0_var(--retro-navy)]">
                                    <span className="pixel-font text-xs tracking-widest">WIZARD</span>
                                </div>
                                {profile.major && (
                                    <div className="bg-[var(--retro-yellow)] text-[var(--retro-navy)] px-4 py-1 border-2 border-[var(--retro-navy)] shadow-[4px_4px_0_0_var(--retro-navy)]">
                                        <span className="pixel-font text-xs uppercase">{profile.major}</span>
                                    </div>
                                )}
                            </div>

                            <div className="relative border-2 border-[var(--retro-navy)] p-6 mb-8 mt-6">
                                <div className="absolute -top-3 left-4 bg-white px-2 border-2 border-[var(--retro-navy)]">
                                    <span className="pixel-font text-xs text-[var(--retro-navy)] uppercase tracking-wider">BIO</span>
                                </div>
                                <p className="font-[family-name:var(--font-vt323)] text-xl text-[var(--retro-navy)] leading-relaxed">
                                    {profile.bio || "This wizard hasn't shared their lore yet."}
                                </p>
                            </div>

                            {/* Contact Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {profile.instagram && (
                                    <div className="border-2 border-dashed border-[var(--retro-navy)] p-3 flex items-center gap-3">
                                        <div className="w-10 h-10 flex-shrink-0 bg-[var(--retro-pink)] border-2 border-[var(--retro-navy)] flex items-center justify-center">
                                            <Instagram className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="pixel-font text-[10px] text-[var(--retro-navy)] opacity-60 block tracking-wider">INSTAGRAM</span>
                                            <span className="pixel-font-body font-bold text-sm text-[var(--retro-navy)] truncate block">@{profile.instagram}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="border-2 border-dashed border-[var(--retro-navy)] p-3 flex items-center gap-3">
                                    <div className="w-10 h-10 flex-shrink-0 bg-[var(--retro-blue)] border-2 border-[var(--retro-navy)] flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="pixel-font text-[10px] text-[var(--retro-navy)] opacity-60 block tracking-wider">EMAIL</span>
                                        <span className="pixel-font-body font-bold text-sm text-[var(--retro-navy)] truncate block" title={profile.email}>{profile.email}</span>
                                    </div>
                                </div>

                                {profile.year && (
                                    <div className="border-2 border-dashed border-[var(--retro-navy)] p-3 flex items-center gap-3">
                                        <div className="w-10 h-10 flex-shrink-0 bg-[var(--retro-yellow)] border-2 border-[var(--retro-navy)] flex items-center justify-center">
                                            <PixelIcon name="star" size={20} className="text-[var(--retro-navy)]" />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="pixel-font text-[10px] text-[var(--retro-navy)] opacity-60 block tracking-wider">YEAR</span>
                                            <span className="pixel-font-body font-bold text-sm text-[var(--retro-navy)]">{profile.year}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="mt-10 flex gap-4">
                                <button
                                    onClick={handleMessage}
                                    className="pixel-btn pixel-btn-primary flex items-center gap-3 px-8 py-3 w-full md:w-auto justify-center"
                                >
                                    <MessageSquare className="w-5 h-5" />
                                    <span className="pixel-font uppercase text-sm">Send Message</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
