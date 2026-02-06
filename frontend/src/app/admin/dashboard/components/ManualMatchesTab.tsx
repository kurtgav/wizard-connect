'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PixelIcon } from '@/components/ui/PixelIcon'
import { Search, User, Heart, X, Check } from 'lucide-react'
import { ViewProfileModal } from './ViewProfileModal'

export function ManualMatchesTab() {
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState<any[]>([])
    const [males, setMales] = useState<any[]>([])
    const [females, setFemales] = useState<any[]>([])

    // Selection State
    const [slot1, setSlot1] = useState<any>(null)
    const [slot2, setSlot2] = useState<any>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        const supabase = createClient()

        // Fetch users, matches, AND surveys (for gender)
        const [usersRes, matchesRes, surveysRes] = await Promise.all([
            supabase.from('users').select('*'),
            supabase.from('matches').select('user_id, matched_user_id'),
            supabase.from('surveys').select('user_id, responses')
        ])

        if (usersRes.error) {
            console.error(usersRes.error)
            setLoading(false)
            return
        }

        // Filter out already matched users
        const matchedIds = new Set<string>()
        matchesRes.data?.forEach((m: any) => {
            matchedIds.add(m.user_id)
            matchedIds.add(m.matched_user_id)
        })

        const unmatched = usersRes.data?.filter((u: any) => !matchedIds.has(u.id)) || []

        // Process Gender Mapping
        const genderMap: Record<string, string> = {}
        surveysRes.data?.forEach((s: any) => {
            if (s.responses?.gender) {
                genderMap[s.user_id] = s.responses.gender
            }
        })

        // Split into Male / Female (Others -> Female list for UI balance or 3rd list... sticking to 2 for simplicity)
        const m: any[] = []
        const f: any[] = []

        unmatched.forEach((u: any) => {
            const g = genderMap[u.id]
            if (g === 'male') m.push(u)
            else f.push(u) // includes female, non-binary, etc.
        })

        setMales(m)
        setFemales(f)
        setUsers(unmatched)
        setLoading(false)
    }

    const handleSelectUser = (user: any) => {
        if (slot1?.id === user.id || slot2?.id === user.id) return

        // Auto-fill logic
        if (!slot1) setSlot1(user)
        else if (!slot2) setSlot2(user)
        else {
            // If both full, replace the one that matches the gender of the new user? 
            // Or just replace slot 2 (target).
            // Let's replace slot 2.
            setSlot2(user)
        }
    }

    const handleMatch = async () => {
        if (!slot1 || !slot2) return

        const confirm = window.confirm(`Confirm match between ${slot1.first_name} and ${slot2.first_name}?`)
        if (!confirm) return

        // Simulate API call
        // In real implementation: await supabase.from('matches').insert({ user_id: slot1.id, matched_user_id: slot2.id, ... })
        console.log(`Matched ${slot1.id} with ${slot2.id}`)

        alert(`Successfully matched ${slot1.first_name} and ${slot2.first_name}!`)

        // Valid match -> remove from lists
        setMales(prev => prev.filter(u => u.id !== slot1.id && u.id !== slot2.id))
        setFemales(prev => prev.filter(u => u.id !== slot1.id && u.id !== slot2.id))
        setSlot1(null)
        setSlot2(null)
    }

    const renderUserCard = (user: any) => (
        <div
            key={user.id}
            onClick={() => handleSelectUser(user)}
            className={`p-3 border-2 border-[#1E3A8A] bg-white hover:bg-yellow-50 cursor-pointer flex items-center gap-3 transition-colors shadow-sm ${slot1?.id === user.id || slot2?.id === user.id ? 'opacity-50 bg-gray-100 cursor-not-allowed' : ''
                }`}
        >
            <div className="w-10 h-10 bg-gray-200 border border-[#1E3A8A] flex-shrink-0 flex items-center justify-center overflow-hidden">
                {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : <User size={16} />}
            </div>
            <div className="min-w-0 flex-1">
                <p className="font-bold text-[#1E3A8A] text-sm truncate">{user.first_name} {user.last_name}</p>
                <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); setSelectedUserId(user.id); }}
                className="p-1 hover:bg-gray-200 rounded text-[#1E3A8A]"
            >
                <Search size={14} />
            </button>
        </div>
    )

    const filterUser = (u: any) => {
        const q = searchQuery.toLowerCase()
        return !q || u.first_name?.toLowerCase().includes(q) || u.last_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    }

    if (loading) return <div className="p-12 text-center animate-pulse font-[family-name:var(--font-press-start)] text-xs text-[#1E3A8A]">LOADING MATCH POOL...</div>

    return (
        <div className="space-y-8">
            {/* Match Box */}
            <div className="bg-[#FFF0F5] border-4 border-[#1E3A8A] p-6 shadow-[8px_8px_0_#1E3A8A] flex flex-col items-center gap-6 relative">
                <div className="absolute top-2 left-2 px-2 py-1 bg-[#1E3A8A] text-white text-[10px] uppercase font-bold">MANUAL OVERRIDE MODE</div>

                <h2 className="font-[family-name:var(--font-press-start)] text-[#1E3A8A] text-2xl mb-4 mt-6">MATCHING CHAMBER</h2>

                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 w-full justify-center">
                    {/* Slot 1 */}
                    <div className="relative group">
                        <div className={`w-40 h-56 md:w-56 md:h-72 border-4 ${slot1 ? 'border-solid border-[#1E3A8A] bg-white' : 'border-dashed border-[#1E3A8A] bg-white/50'} flex flex-col items-center justify-center relative shadow-lg transition-all`}>
                            {slot1 ? (
                                <>
                                    <button onClick={() => setSlot1(null)} className="absolute -top-3 -right-3 bg-red-500 text-white p-2 border-2 border-[#1E3A8A] hover:scale-110 shadow-md z-10"><X size={16} /></button>
                                    <div className="w-24 h-24 bg-gray-200 border-4 border-[#1E3A8A] mb-4 overflow-hidden rounded-full">
                                        {slot1.avatar_url ? <img src={slot1.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-[#1E3A8A] text-white"><User size={32} /></div>}
                                    </div>
                                    <p className="font-black text-[#1E3A8A] text-lg text-center px-2 uppercase">{slot1.first_name}</p>
                                    <p className="font-[family-name:var(--font-vt323)] text-[#1E3A8A] text-sm">Level 1 Wizard</p>
                                </>
                            ) : (
                                <div className="text-center opacity-40">
                                    <User size={48} className="mx-auto mb-2" />
                                    <span className="font-bold text-xs uppercase block">Select First Wizard</span>
                                </div>
                            )}
                        </div>
                        {slot1 && <div className="absolute -bottom-4 left-0 right-0 text-center"><span className="bg-[#1E3A8A] text-white px-3 py-1 text-xs font-bold shadow-md">PLAYER 1</span></div>}
                    </div>

                    <div className="relative">
                        <Heart className={`w-16 h-16 ${slot1 && slot2 ? 'text-red-500 animate-pulse drop-shadow-md' : 'text-gray-300'}`} fill="currentColor" />
                        {slot1 && slot2 && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-bold text-xs">99%</div>
                        )}
                    </div>

                    {/* Slot 2 */}
                    <div className="relative group">
                        <div className={`w-40 h-56 md:w-56 md:h-72 border-4 ${slot2 ? 'border-solid border-[#1E3A8A] bg-white' : 'border-dashed border-[#1E3A8A] bg-white/50'} flex flex-col items-center justify-center relative shadow-lg transition-all`}>
                            {slot2 ? (
                                <>
                                    <button onClick={() => setSlot2(null)} className="absolute -top-3 -right-3 bg-red-500 text-white p-2 border-2 border-[#1E3A8A] hover:scale-110 shadow-md z-10"><X size={16} /></button>
                                    <div className="w-24 h-24 bg-gray-200 border-4 border-[#1E3A8A] mb-4 overflow-hidden rounded-full">
                                        {slot2.avatar_url ? <img src={slot2.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-[#FF6B9D] text-white"><User size={32} /></div>}
                                    </div>
                                    <p className="font-black text-[#1E3A8A] text-lg text-center px-2 uppercase">{slot2.first_name}</p>
                                    <p className="font-[family-name:var(--font-vt323)] text-[#1E3A8A] text-sm">Level 1 Witch</p>
                                </>
                            ) : (
                                <div className="text-center opacity-40">
                                    <User size={48} className="mx-auto mb-2" />
                                    <span className="font-bold text-xs uppercase block">Select Second Wizard</span>
                                </div>
                            )}
                        </div>
                        {slot2 && <div className="absolute -bottom-4 left-0 right-0 text-center"><span className="bg-[#FF6B9D] text-white px-3 py-1 text-xs font-bold shadow-md">PLAYER 2</span></div>}
                    </div>
                </div>

                <button
                    disabled={!slot1 || !slot2}
                    onClick={handleMatch}
                    className="mt-8 pixel-btn bg-[#FFD700] text-[#1E3A8A] border-4 border-[#1E3A8A] px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-[6px_6px_0_#1E3A8A] active:shadow-none active:translate-y-[6px] transition-all font-black text-xl flex items-center gap-3 hover:-translate-y-1 hover:shadow-[8px_8px_0_#1E3A8A]"
                >
                    <Check size={24} />
                    CONFIRM MATCH
                </button>
            </div>

            {/* Pools Header */}
            <div className="flex items-center justify-between border-b-4 border-[#1E3A8A] pb-4">
                <h3 className="text-2xl font-black text-[#1E3A8A]">CANDIDATE POOL</h3>
                <div className="relative w-64">
                    <input
                        type="text"
                        placeholder="Search candidates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border-2 border-[#1E3A8A] font-[family-name:var(--font-vt323)] text-lg placeholder:text-gray-400 focus:outline-none focus:bg-blue-50"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                </div>
            </div>

            {/* Pools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Males Column */}
                <div>
                    <div className="bg-[#E0F2FE] p-3 border-2 border-[#1E3A8A] text-center font-bold text-[#1E3A8A] shadow-[4px_4px_0_#1E3A8A] mb-4">
                        WIZARDS ({males.length})
                    </div>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 pb-2">
                        {males.filter(filterUser).map(renderUserCard)}
                    </div>
                </div>

                {/* Females Column */}
                <div>
                    <div className="bg-[#FCE7F3] p-3 border-2 border-[#1E3A8A] text-center font-bold text-[#1E3A8A] shadow-[4px_4px_0_#1E3A8A] mb-4">
                        WITCHES & OTHERS ({females.length})
                    </div>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 pb-2">
                        {females.filter(filterUser).map(renderUserCard)}
                    </div>
                </div>
            </div>

            <ViewProfileModal
                userId={selectedUserId}
                isOpen={!!selectedUserId}
                onClose={() => setSelectedUserId(null)}
            />
        </div>
    )
}
