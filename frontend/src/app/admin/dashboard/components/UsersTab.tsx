'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, User, MoreVertical, Ban, Eye } from 'lucide-react'
import { ViewProfileModal } from './ViewProfileModal'

export function UsersTab() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching users:', error)
        } else {
            setUsers(data || [])
        }
        setLoading(false)
    }

    const filteredUsers = users.filter((user) =>
        user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 border-2 border-[#1E3A8A] shadow-[4px_4px_0_#1E3A8A]">
                <h2 className="text-xl font-black text-[#1E3A8A] flex items-center gap-2">
                    <User className="text-[#1E3A8A]" />
                    TOTAL USERS JOINED: {users.length}
                </h2>
                <div className="mt-4 md:mt-0 relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border-2 border-[#1E3A8A] font-[family-name:var(--font-vt323)] text-lg placeholder:text-gray-400 focus:outline-none focus:bg-blue-50"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                </div>
            </div>

            {/* Users List */}
            <div className="bg-white border-4 border-[#1E3A8A] shadow-[8px_8px_0_#1E3A8A] overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-[#1E3A8A] font-[family-name:var(--font-press-start)] text-xs animate-pulse">
                        LOADING USERS...
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 font-bold">
                        No users found matching your search.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#1E3A8A] text-white font-[family-name:var(--font-press-start)] text-[10px] uppercase">
                                <tr>
                                    <th className="p-4">User</th>
                                    <th className="p-4">Contact</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-[#1E3A8A]/10">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-blue-50 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-200 border border-[#1E3A8A] overflow-hidden">
                                                    {/* Avatar Fallback */}
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-[#1E3A8A] text-white text-xs font-bold">
                                                            {user.first_name?.[0]}{user.last_name?.[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#1E3A8A]">{user.first_name} {user.last_name}</p>
                                                    <p className="text-xs text-gray-500 font-mono">ID: {user.id.slice(0, 8)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm">
                                                <p className="font-bold text-[#1E3A8A]">{user.email}</p>
                                                <p className="text-xs text-gray-500">@{user.instagram || 'no_ig'}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-[#98FB98] text-[#006400] text-[10px] font-bold border border-[#006400] uppercase">
                                                Active
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => setSelectedUserId(user.id)}
                                                className="bg-white border-2 border-[#1E3A8A] text-[#1E3A8A] px-3 py-1 text-xs font-bold hover:bg-[#1E3A8A] hover:text-white transition-colors shadow-[2px_2px_0_#1E3A8A]"
                                            >
                                                VIEW PROFILE
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ViewProfileModal
                userId={selectedUserId}
                isOpen={!!selectedUserId}
                onClose={() => setSelectedUserId(null)}
            />
        </div>
    )
}
