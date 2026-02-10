'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    Mail, Instagram, Shield, Eye, EyeOff, MessageSquare,
    ChevronLeft, Book, Star, User as UserIcon
} from 'lucide-react'
import Image from 'next/image'
import { apiClient } from '@/lib/api-client'
import { PixelIcon } from '@/components/ui/PixelIcon'
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
            <div className="flex flex-col items-center justify-center min-h-[70vh]">
                <div className="pixel-spinner mb-4" />
                <p className="pixel-font text-[var(--retro-navy)] animate-pulse uppercase">Accessing records...</p>
            </div>
        )
    }

    if (error || !profile) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 text-center">
                <div className="pixel-card inline-block max-w-md bg-white border-4 border-[var(--retro-navy)] p-8 shadow-[8px_8px_0_0_var(--retro-navy)]">
                    <PixelIcon name="chick" size={48} className="mx-auto mb-4" />
                    <h2 className="pixel-font text-xl text-[var(--retro-navy)] mb-2 uppercase">DATA_MISSING</h2>
                    <p className="pixel-font-body text-gray-600 mb-6">{error || '404: USER_NOT_FOUND'}</p>
                    <button
                        onClick={() => router.back()}
                        className="pixel-btn pixel-btn-secondary px-8 py-3"
                    >
                        GO BACK
                    </button>
                </div>
            </div>
        )
    }

    const getVisibilityInfo = (val: string) => {
        switch (val) {
            case 'public': return { label: 'PUBLIC_PROFILE', icon: Eye, color: 'text-green-500' }
            case 'private': return { label: 'HIDDEN_MODE', icon: EyeOff, color: 'text-gray-500' }
            default: return { label: 'MATCHES_ONLY', icon: Shield, color: 'text-blue-500' }
        }
    }

    const visibility = getVisibilityInfo(profile.visibility || 'matches_only')

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            {/* Back Button */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => router.back()}
                className="mb-6 flex items-center gap-3 text-[var(--retro-navy)] hover:text-[var(--retro-red)] transition-colors group"
            >
                <div className="bg-white border-2 border-[var(--retro-navy)] p-2 shadow-[2px_2px_0_0_var(--retro-navy)] group-hover:bg-[var(--retro-yellow)] transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </div>
                <span className="pixel-font text-xs uppercase tracking-wider">EXIT_TO_BROWSER</span>
            </motion.button>

            {/* Profile Window */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border-4 border-[var(--retro-navy)] shadow-[12px_12px_0_0_var(--retro-navy)] overflow-hidden"
            >
                {/* Title Bar */}
                <div className="bg-[var(--retro-navy)] p-3 flex items-center justify-between border-b-4 border-[var(--retro-navy)]">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-[var(--retro-yellow)] flex items-center justify-center border-2 border-[var(--retro-navy)]">
                            <UserIcon className="w-4 h-4 text-[var(--retro-navy)]" />
                        </div>
                        <span className="pixel-font text-white text-xs tracking-widest uppercase truncate max-w-[200px] md:max-w-none">
                            SYSTEM://PROFILE_RECORD_{profile.first_name?.toUpperCase()}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row divide-y-4 lg:divide-y-0 lg:divide-x-4 divide-[var(--retro-navy)] min-h-[500px]">

                    {/* Left Column */}
                    <div className="lg:w-80 flex-shrink-0 p-8 flex flex-col items-center bg-[#fdfdfd]">
                        <div className="relative mb-6">
                            <div className="w-48 h-48 border-4 border-[var(--retro-navy)] bg-white shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] relative overflow-hidden">
                                {profile.avatar_url ? (
                                    <Image
                                        src={profile.avatar_url}
                                        alt="Avatar"
                                        fill
                                        unoptimized
                                        className="object-cover pixelated"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[var(--retro-blue)]/10">
                                        <PixelIcon name="smiley" size={80} className="text-[var(--retro-navy)] opacity-40" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="w-full space-y-4">
                            <div className="p-3 border-2 border-[var(--retro-navy)] bg-[#f9f9f9] text-center">
                                <div className="pixel-font text-[10px] text-gray-500 mb-1 tracking-widest">PROFILE VISIBILITY</div>
                                <div className="flex items-center justify-center gap-2">
                                    <visibility.icon className={`w-4 h-4 ${visibility.color}`} />
                                    <span className="pixel-font-body text-base uppercase font-bold text-[var(--retro-navy)]">{visibility.label}</span>
                                </div>
                            </div>

                            <div className="p-3 border-2 border-[var(--retro-navy)] bg-[#f9f9f9]">
                                <div className="pixel-font text-[10px] text-gray-400 mb-2 uppercase">PERSONAL INFO</div>
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center text-[var(--retro-navy)]">
                                        <span className="pixel-font text-[8px] opacity-60">GENDER</span>
                                        <span className="pixel-font-body text-xs font-bold uppercase">{profile.gender || 'UNDEFINED'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[var(--retro-navy)]">
                                        <span className="pixel-font text-[8px] opacity-60">SEEKING</span>
                                        <span className="pixel-font-body text-xs font-bold uppercase">{profile.gender_preference || 'ANYONE'}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleMessage}
                                className="w-full bg-[var(--retro-navy)] text-white p-4 border-b-4 border-black active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-3"
                            >
                                <MessageSquare className="w-5 h-5 text-[var(--retro-yellow)]" />
                                <span className="pixel-font text-sm uppercase">SEND MESSAGE</span>
                            </button>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex-1 p-8 md:p-12 space-y-10 group bg-white overflow-y-auto">
                        <div className="space-y-4">
                            <h1 className="pixel-font text-4xl md:text-6xl text-[var(--retro-navy)] leading-[1.1] uppercase tracking-tighter">
                                {profile.first_name} <span className="text-[var(--retro-pink)]">{profile.last_name}</span>
                            </h1>
                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2 px-3 py-1 border-2 border-[var(--retro-navy)] bg-[var(--retro-blue)]/5">
                                    <Book className="w-4 h-4 text-[var(--retro-navy)]" />
                                    <span className="pixel-font-body text-lg font-bold uppercase">{profile.major || 'UNDECLARED'}</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 border-2 border-[var(--retro-navy)] bg-[var(--retro-yellow)]/10">
                                    <Star className="w-4 h-4 text-[var(--retro-navy)]" />
                                    <span className="pixel-font-body text-lg font-bold uppercase">{profile.year || 'UNKNOWN_LEVEL'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative p-6 border-4 border-[var(--retro-navy)] bg-white shadow-[8px_8px_0_0_var(--retro-blue)] transition-all">
                            <div className="absolute -top-3 left-4 px-2 bg-white pixel-font text-[10px] text-[var(--retro-navy)] font-bold">
                                BIOGRAPHY
                            </div>
                            <p className="pixel-font-body text-xl md:text-2xl text-[var(--retro-navy)] leading-relaxed italic opacity-90">
                                {profile.bio || "No biography provided."}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border-2 border-[var(--retro-navy)] bg-[#f9f9f9] flex items-center gap-4">
                                <div className="w-10 h-10 border-2 border-[var(--retro-navy)] flex items-center justify-center bg-white">
                                    <Mail className="w-5 h-5 text-[var(--retro-navy)] opacity-40" />
                                </div>
                                <div className="min-w-0">
                                    <div className="pixel-font text-[8px] opacity-40">EMAIL</div>
                                    <div className="pixel-font-body text-sm font-bold truncate">{profile.email}</div>
                                </div>
                            </div>

                            {profile.instagram && (
                                <div className="p-4 border-2 border-[var(--retro-navy)] bg-[#f9f9f9] flex items-center gap-4">
                                    <div className="w-10 h-10 border-2 border-[var(--retro-navy)] flex items-center justify-center bg-white">
                                        <Instagram className="w-5 h-5 text-[var(--retro-pink)] opacity-40" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="pixel-font text-[8px] opacity-40">INSTAGRAM</div>
                                        <div className="pixel-font-body text-sm font-bold truncate">@{profile.instagram}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-6 border-t-2 border-dashed border-[var(--retro-navy)]/30 text-center opacity-40">
                            <span className="pixel-font text-[8px] uppercase tracking-widest">End of Records</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            <style jsx global>{`
                .pixelated {
                    image-rendering: pixelated;
                }
            `}</style>
        </div>
    )
}
