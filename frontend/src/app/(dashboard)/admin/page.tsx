'use client'

import { useState, useEffect } from 'react'
import { PixelIcon, PixelIconName } from '@/components/ui/PixelIcon'
import { apiClient } from '@/lib/api-client'

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  avatar_url: string
  bio: string
  instagram: string
  phone: string
  contact_preference: string
  visibility: string
  year: string
  major: string
  gender: string
  gender_preference: string
  created_at: string
  updated_at: string
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      setUsers(data.users || [])
      setLoading(false)
    } catch (error) {
      console.error('Failed to load users:', error)
      setLoading(false)
      alert('Failed to load users')
    }
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(filter.toLowerCase()) ||
    user.first_name.toLowerCase().includes(filter.toLowerCase()) ||
    user.last_name.toLowerCase().includes(filter.toLowerCase())
  )

  const stats = {
    total: users.length,
    public: users.filter(u => u.visibility === 'public').length,
    matchesOnly: users.filter(u => u.visibility === 'matches_only').length,
    private: users.filter(u => u.visibility === 'private').length,
    withGender: users.filter(u => u.gender && u.gender !== '').length,
    withPreference: users.filter(u => u.gender_preference && u.gender_preference !== '').length,
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete user')
      }

      alert('User deleted successfully')
      setSelectedUser(null)
      loadUsers()
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert('Failed to delete user')
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="pixel-font text-3xl md:text-5xl font-bold mb-4 text-[var(--retro-navy)] uppercase tracking-tighter">
           Admin <span className="text-[var(--retro-red)]">Panel</span>
         </h1>
         <div className="inline-block bg-[var(--retro-yellow)] border-2 border-[var(--retro-navy)] px-4 py-1 transform -rotate-2 shadow-[4px_4px_0_var(--retro-navy)]">
           <p className="pixel-font-body font-bold text-[var(--retro-navy)]">
             USER MANAGEMENT
           </p>
         </div>
       </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="pixel-card bg-[var(--retro-blue)] text-white">
          <div className="text-center">
            <p className="pixel-font text-xs opacity-80 mb-1">TOTAL USERS</p>
            <p className="pixel-font text-3xl font-bold">{stats.total}</p>
          </div>
        </div>
        <div className="pixel-card bg-[var(--retro-pink)] text-white">
          <div className="text-center">
            <p className="pixel-font text-xs opacity-80 mb-1">PUBLIC</p>
            <p className="pixel-font text-3xl font-bold">{stats.public}</p>
          </div>
        </div>
        <div className="pixel-card bg-[var(--retro-navy)] text-white">
          <div className="text-center">
            <p className="pixel-font text-xs opacity-80 mb-1">MATCHES ONLY</p>
            <p className="pixel-font text-3xl font-bold">{stats.matchesOnly}</p>
          </div>
        </div>
        <div className="pixel-card bg-[var(--retro-yellow)] text-[var(--retro-navy)]">
          <div className="text-center">
            <p className="pixel-font text-xs opacity-80 mb-1">PRIVATE</p>
            <p className="pixel-font text-3xl font-bold">{stats.private}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="pixel-card mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="pixel-input-with-icon">
              <PixelIcon name="target" size={20} />
              <input
                type="text"
                placeholder="Search users..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block bg-[var(--retro-yellow)] border-4 border-[var(--retro-navy)] px-6 py-3 mb-4 animate-pulse">
            <p className="pixel-font text-lg text-[var(--retro-navy)]">LOADING...</p>
          </div>
          <p className="pixel-font-body text-sm text-gray-600">Fetching users...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`pixel-card cursor-pointer hover:translate-y-[-4px] transition-transform ${
                selectedUser?.id === user.id ? 'ring-4 ring-[var(--retro-yellow)]' : ''
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[var(--retro-cream)] border-2 border-[var(--retro-navy)] flex items-center justify-center text-xl">
                    <PixelIcon name="smiley" size={20} />
                  </div>
                  <div>
                    <h3 className="pixel-font text-lg font-bold text-[var(--retro-navy)]">
                      {user.first_name} {user.last_name}
                    </h3>
                    <p className="pixel-font-body text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className={`text-xs pixel-font px-2 py-1 ${
                  user.visibility === 'public' ? 'bg-green-500 text-white' :
                  user.visibility === 'private' ? 'bg-red-500 text-white' :
                  'bg-[var(--retro-blue)] text-white'
                }`}>
                  {user.visibility.replace('_', ' ')}
                </div>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="pixel-card-sky p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <PixelIcon name="crystal" size={16} />
                    <span className="pixel-font text-xs text-gray-600">YEAR</span>
                  </div>
                  <p className="pixel-font-body font-bold text-[var(--retro-navy)]">{user.year || 'Not set'}</p>
                </div>
                <div className="pixel-card-sky p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <PixelIcon name="star" size={16} />
                    <span className="pixel-font text-xs text-gray-600">MAJOR</span>
                  </div>
                  <p className="pixel-font-body font-bold text-[var(--retro-navy)] truncate">{user.major || 'Not set'}</p>
                </div>
              </div>

              {/* Gender & Looking For */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="pixel-card-sky p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <PixelIcon name="smiley" size={16} />
                    <span className="pixel-font text-xs text-gray-600">GENDER</span>
                  </div>
                  <p className="pixel-font-body font-bold text-[var(--retro-navy)] capitalize">
                    {user.gender || 'Not set'}
                  </p>
                </div>
                <div className="pixel-card-sky p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <PixelIcon name="heart_solid" size={16} />
                    <span className="pixel-font text-xs text-gray-600">LOOKING FOR</span>
                  </div>
                  <p className="pixel-font-body font-bold text-[var(--retro-navy)] capitalize">
                    {user.gender_preference === 'both' ? 'Anyone' : user.gender_preference || 'Not set'}
                  </p>
                </div>
              </div>

              {/* Bio */}
              {user.bio && (
                <div className="pixel-card-sky p-3 mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <PixelIcon name="bubble" size={16} />
                    <span className="pixel-font text-xs text-gray-600">BIO</span>
                  </div>
                  <p className="pixel-font-body text-sm text-gray-700 truncate">
                    {user.bio}
                  </p>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-3 mb-4">
                {user.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <PixelIcon name="envelope" size={16} />
                    <span className="text-gray-600">{user.phone}</span>
                  </div>
                )}
                {user.instagram && (
                  <div className="flex items-center gap-3 text-sm">
                    <PixelIcon name="heart_solid" size={16} />
                    <span className="text-gray-600">@{user.instagram}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button className="pixel-btn pixel-btn-primary text-xs py-2">
                  View Matches
                </button>
                <button className="pixel-btn pixel-btn-secondary text-xs py-2">
                  Edit Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="pixel-card bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-[var(--retro-navy)]">
              <h2 className="pixel-font text-2xl text-[var(--retro-navy)]">
                {selectedUser.first_name} {selectedUser.last_name}
              </h2>
                <button
                  onClick={() => handleDeleteUser(selectedUser!.id)}
                  className="pixel-btn pixel-btn-danger px-4 py-2 flex-1"
                >
                  <PixelIcon name="crystal_empty" size={18} className="mr-2" />
                  Delete User
                </button>
            </div>

            <div className="space-y-4">
              {/* Full Contact Info */}
              <div className="pixel-card-sky p-4">
                <h3 className="pixel-font text-sm font-bold mb-3 text-[var(--retro-navy)]">CONTACT INFORMATION</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="pixel-font text-xs block mb-1 text-gray-600">Email</label>
                    <p className="pixel-font-body font-bold">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="pixel-font text-xs block mb-1 text-gray-600">Phone</label>
                    <p className="pixel-font-body">{selectedUser.phone || 'Not set'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="pixel-font text-xs block mb-1 text-gray-600">Instagram</label>
                    <p className="pixel-font-body">{selectedUser.instagram ? '@' + selectedUser.instagram : 'Not set'}</p>
                  </div>
                </div>
              </div>

              {/* Academic Info */}
              <div className="pixel-card-sky p-4">
                <h3 className="pixel-font text-sm font-bold mb-3 text-[var(--retro-navy)]">ACADEMIC INFO</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="pixel-font text-xs block mb-1 text-gray-600">Year</label>
                    <p className="pixel-font-body font-bold">{selectedUser.year || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="pixel-font text-xs block mb-1 text-gray-600">Major</label>
                    <p className="pixel-font-body font-bold truncate">{selectedUser.major || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="pixel-font text-xs block mb-1 text-gray-600">Gender</label>
                    <p className="pixel-font-body font-bold capitalize">{selectedUser.gender || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="pixel-font text-xs block mb-1 text-gray-600">Looking For</label>
                    <p className="pixel-font-body font-bold capitalize">
                      {selectedUser.gender_preference === 'both' ? 'Anyone' : selectedUser.gender_preference || 'Not set'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {selectedUser.bio && (
                <div className="pixel-card-sky p-4">
                  <h3 className="pixel-font text-sm font-bold mb-3 text-[var(--retro-navy)]">BIO</h3>
                  <p className="pixel-font-body text-gray-700">{selectedUser.bio}</p>
                </div>
              )}

              {/* Account Status */}
              <div className="pixel-card-sky p-4">
                <h3 className="pixel-font text-sm font-bold mb-3 text-[var(--retro-navy)]">ACCOUNT STATUS</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="pixel-font text-xs text-gray-600">Visibility</span>
                    <span className={`pixel-badge text-xs ${
                      selectedUser.visibility === 'public' ? 'bg-green-500 text-white' :
                      selectedUser.visibility === 'private' ? 'bg-red-500 text-white' :
                      'bg-[var(--retro-blue)] text-white'
                    }`}>
                      {selectedUser.visibility.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="pixel-font text-xs text-gray-600">Contact Preference</span>
                    <span className="pixel-font-body font-bold capitalize">
                      {selectedUser.contact_preference}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="pixel-font text-xs text-gray-600">Created</span>
                    <span className="pixel-font-body text-xs text-gray-600">
                      {new Date(selectedUser.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="pixel-font text-xs text-gray-600">Last Updated</span>
                    <span className="pixel-font-body text-xs text-gray-600">
                      {new Date(selectedUser.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <button
                  onClick={() => window.location.href = `mailto:${selectedUser.email}`}
                  className="pixel-btn pixel-btn-primary py-3"
                >
                  <PixelIcon name="envelope" size={18} className="mr-2" />
                  Contact User
                </button>
                <button
                  className="pixel-btn pixel-btn-secondary py-3"
                >
                  <PixelIcon name="crystal_empty" size={18} className="mr-2" />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
