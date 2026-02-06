'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PixelIcon } from '@/components/ui/PixelIcon'
import { X, Mail, Instagram, Phone, Ban, CheckCircle } from 'lucide-react'

interface UserProfileModalProps {
    userId: string | null
    isOpen: boolean
    onClose: () => void
}

export function ViewProfileModal({ userId, isOpen, onClose }: UserProfileModalProps) {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [blockReason, setBlockReason] = useState('')
    const [showBlockForm, setShowBlockForm] = useState(false)

    useEffect(() => {
        if (isOpen && userId) {
            fetchProfile()
        }
    }, [isOpen, userId])

    const fetchProfile = async () => {
        setLoading(true)
        const supabase = createClient()
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) {
            console.error('Error fetching profile:', error)
        } else {
            setProfile(data)
        }
        setLoading(false)
    }

    const handleBlockUser = async () => {
        if (!blockReason.trim()) {
            alert('Please provide a reason for blocking.')
            return
        }

        // In a real world scenario, update a 'status' or 'is_blocked' column
        // Simulating API call
        console.log(`Blocking user ${userId} for reason: ${blockReason}`)
        alert(`User ${profile?.first_name} has been blocked.`)
        setShowBlockForm(false)
        setBlockReason('')
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl border-4 border-[#1E3A8A] shadow-[8px_8px_0_#1E3A8A] relative flex flex-col max-h-[90vh] overflow-hidden">

                {/* Header */}
                <div className="bg-[#1E3A8A] p-4 flex items-center justify-between text-white">
                    <h2 className="font-[family-name:var(--font-press-start)] text-sm flex items-center gap-2">
                        <PixelIcon name="smiley" size={16} className="text-white" />
                        USER PROFILE
                    </h2>
                    <button onClick={onClose} className="hover:text-[#FFD700]">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex items-center justify-center p-12">
                            <span className="font-[family-name:var(--font-press-start)] text-xs animate-pulse">LOADING DATA...</span>
                        </div>
                    ) : profile ? (
                        <div className="flex flex-col gap-6">

                            {/* Profile Header */}
                            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                                <div className="w-32 h-32 bg-gray-200 border-2 border-[#1E3A8A] flex items-center justify-center overflow-hidden">
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <PixelIcon name="smiley" size={64} />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-[#1E3A8A] uppercase">{profile.first_name} {profile.last_name}</h3>
                                    <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                                        <span className="px-2 py-1 bg-[#1E3A8A] text-white text-[10px] font-bold uppercase">Level 1 Wizard</span>
                                        <span className="px-2 py-1 bg-[#FFD700] text-[#1E3A8A] text-[10px] font-bold uppercase">Active</span>
                                    </div>
                                    <p className="mt-4 text-gray-600 font-[family-name:var(--font-vt323)] text-lg leading-tight max-w-md">
                                        {profile.bio || "No bio provided."}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t-2 border-dashed border-[#1E3A8A] my-2" />

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="border-2 border-[#1E3A8A] p-3 flex items-center gap-3">
                                    <Mail className="text-[#1E3A8A]" size={20} />
                                    <div>
                                        <span className="text-[10px] text-gray-500 block">EMAIL</span>
                                        <span className="font-bold text-sm text-[#1E3A8A] block truncate max-w-[200px]" title={profile.email}>{profile.email}</span>
                                    </div>
                                </div>
                                <div className="border-2 border-[#1E3A8A] p-3 flex items-center gap-3">
                                    <Instagram className="text-[#1E3A8A]" size={20} />
                                    <div>
                                        <span className="text-[10px] text-gray-500 block">INSTAGRAM</span>
                                        <span className="font-bold text-sm text-[#1E3A8A] block">@{profile.instagram || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="border-2 border-[#1E3A8A] p-3 flex items-center gap-3">
                                    <Phone className="text-[#1E3A8A]" size={20} />
                                    <div>
                                        <span className="text-[10px] text-gray-500 block">CONTACT PREF</span>
                                        <span className="font-bold text-sm text-[#1E3A8A] block uppercase">{profile.contact_preference}</span>
                                    </div>
                                </div>
                                <div className="border-2 border-[#1E3A8A] p-3 flex items-center gap-3">
                                    <CheckCircle className="text-[#1E3A8A]" size={20} />
                                    <div>
                                        <span className="text-[10px] text-gray-500 block">JOINED</span>
                                        <span className="font-bold text-sm text-[#1E3A8A] block">
                                            {new Date(profile.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Block Action */}
                            {!showBlockForm ? (
                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={() => setShowBlockForm(true)}
                                        className="bg-red-500 text-white font-bold px-4 py-2 text-xs flex items-center gap-2 hover:bg-red-600 transition-colors border-2 border-red-700 shadow-[4px_4px_0_#991B1B]"
                                    >
                                        <Ban size={16} />
                                        BLOCK USER
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-4 bg-red-50 p-4 border-2 border-red-200 animate-in slide-in-from-bottom-2">
                                    <h4 className="text-red-800 font-bold text-sm mb-2 flex items-center gap-2">
                                        <Ban size={16} /> BLOCK ACCOUNT
                                    </h4>
                                    <p className="text-xs text-red-600 mb-3">This action will trigger a review. Please provide proof/reason.</p>
                                    <textarea
                                        value={blockReason}
                                        onChange={(e) => setBlockReason(e.target.value)}
                                        placeholder="Reason for blocking (e.g. harassment, fake profile)..."
                                        className="w-full text-sm p-2 border border-red-300 rounded mb-3 h-20 resize-none focus:outline-none focus:border-red-500"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setShowBlockForm(false)}
                                            className="bg-white text-gray-600 border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50"
                                        >
                                            CANCEL
                                        </button>
                                        <button
                                            onClick={handleBlockUser}
                                            className="bg-red-600 text-white px-3 py-1 text-xs font-bold hover:bg-red-700 shadow-sm"
                                        >
                                            CONFIRM BLOCK
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="text-center p-8 text-red-500 font-bold">User Not Found</div>
                    )}
                </div>
            </div>
        </div>
    )
}
