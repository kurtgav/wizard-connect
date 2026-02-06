'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PixelIcon } from '@/components/ui/PixelIcon'
import { Search, User, Heart } from 'lucide-react'
import { ViewProfileModal } from './ViewProfileModal'

export function AIMatchesTab() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

    // Data State
    const [males, setMales] = useState<any[]>([])
    const [females, setFemales] = useState<any[]>([])
    const [matchesMap, setMatchesMap] = useState<Record<string, any>>({})

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const supabase = createClient()
        setLoading(true)

        // Parallel Fetch
        const [usersRes, surveysRes, matchesRes] = await Promise.all([
            supabase.from('users').select('*'),
            supabase.from('surveys').select('user_id, responses'),
            supabase.from('matches').select('*')
        ])

        if (usersRes.error) console.error(usersRes.error)

        // Process Gender
        const userGenderMap: Record<string, string> = {}
        surveysRes.data?.forEach((survey: any) => {
            if (survey.responses?.gender) {
                userGenderMap[survey.user_id] = survey.responses.gender
            }
        })

        // Process Matches
        const matchMap: Record<string, any> = {}
        matchesRes.data?.forEach((match: any) => {
            matchMap[match.user_id] = match
            matchMap[match.matched_user_id] = match // bidirectional lookup
        })
        setMatchesMap(matchMap)

        // Split Users
        const maleList: any[] = []
        const femaleList: any[] = [] // Includes non-binary/others for simplicity in 2-col layout or add 3rd col

        usersRes.data?.forEach((user: any) => {
            const gender = userGenderMap[user.id]
            const userWithMatch = { ...user, match: matchMap[user.id] }

            if (gender === 'male') {
                maleList.push(userWithMatch)
            } else {
                // Group females and others together for now as per "male and female separate list" request usually implies binary split visually
                // or I can put others in female list or filter them out? 
                // I'll put them in the "female/non-binary" column or just create a separate one if needed.
                // For now, let's assume binary-ish split or "Others" goes to Female side visually to balance? 
                // Actually, let's just use 2 lists: "Wizards (Male)" and "Witches & Others"
                femaleList.push(userWithMatch)
            }
        })

        setMales(maleList)
        setFemales(femaleList)
        setUsers(usersRes.data || [])
        setLoading(false)
    }

    const filterUser = (user: any) => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return (
            user.first_name?.toLowerCase().includes(q) ||
            user.last_name?.toLowerCase().includes(q) ||
            user.email?.toLowerCase().includes(q)
        )
    }

    const renderUserCard = (user: any) => {
        const isMatched = !!user.match
        return (
            <div
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                className={`p-4 border-2 border-[#1E3A8A] cursor-pointer transition-all hover:-translate-y-1 shadow-[2px_2px_0_#1E3A8A] flex items-center justify-between ${isMatched ? 'bg-[#FFF0F5] border-pink-400' : 'bg-white hover:bg-blue-50'}`}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 border border-[#1E3A8A] flex items-center justify-center overflow-hidden bg-gray-100">
                        {user.avatar_url ? (
                            <img src={user.avatar_url} className="w-full h-full object-cover" />
                        ) : (
                            <PixelIcon name="smiley" size={24} />
                        )}
                    </div>
                    <div>
                        <p className="font-bold text-[#1E3A8A] text-sm">{user.first_name} {user.last_name}</p>
                        <p className="text-[10px] text-gray-500 truncate w-32">{user.email}</p>
                    </div>
                </div>
                {isMatched && (
                    <div className="text-pink-500">
                        <Heart size={16} fill="currentColor" />
                    </div>
                )}
            </div>
        )
    }

    if (loading) return <div className="p-12 text-center animate-pulse font-[family-name:var(--font-press-start)] text-xs text-[#1E3A8A]">LOADING MATCH DATA...</div>

    return (
        <div className="space-y-6">
            {/* Search */}
            <div className="flex justify-between items-center bg-white p-4 border-2 border-[#1E3A8A] shadow-[4px_4px_0_#1E3A8A]">
                <h2 className="text-lg font-black text-[#1E3A8A] flex items-center gap-2">
                    <PixelIcon name="potion" size={24} />
                    AI MATCH RESULTS
                </h2>
                <div className="relative w-64">
                    <input
                        type="text"
                        placeholder="Search profiles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border-2 border-[#1E3A8A] font-[family-name:var(--font-vt323)] text-lg placeholder:text-gray-400 focus:outline-none focus:bg-blue-50"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Males Column */}
                <div className="space-y-4">
                    <div className="bg-[#E0F2FE] p-3 border-2 border-[#1E3A8A] text-center font-bold text-[#1E3A8A] shadow-[4px_4px_0_#1E3A8A]">
                        MALE PROFILES ({males.length})
                    </div>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                        {males.filter(filterUser).map(renderUserCard)}
                    </div>
                </div>

                {/* Females Column */}
                <div className="space-y-4">
                    <div className="bg-[#FCE7F3] p-3 border-2 border-[#1E3A8A] text-center font-bold text-[#1E3A8A] shadow-[4px_4px_0_#1E3A8A]">
                        FEMALE PROFILES ({females.length})
                    </div>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
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
