'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthError, Session } from '@supabase/supabase-js'
import { auth, db as supabaseDB } from '@/lib/supabase'
import { apiClient } from '@/lib/api-client'
import type { User as UserProfile } from '@/types/api'

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    auth.getSession().then((session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id, session.user.email!)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user.id, session.user.email!)
        // Set token for API client
        session.access_token && apiClient.setToken(session.access_token)
      } else if (event === 'SIGNED_OUT') {
        setUserProfile(null)
        apiClient.clearToken()
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string, email: string) => {
    try {
      // Try to get from API first
      const profile = await apiClient.getProfile()
      setUserProfile(profile)
    } catch (error) {
      // If API fails, try to get/create via Supabase
      const profile = await supabaseDB.getOrCreateUserProfile(userId, email)
      if (profile) {
        setUserProfile(profile as UserProfile)
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await auth.signIn(email, password)
    if (error) throw error
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await auth.signUp(email, password)
    if (error) throw error
  }

  const signInWithGoogle = async () => {
    const { error } = await auth.signInWithGoogle()
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await auth.signOut()
    if (error) throw error
    setUserProfile(null)
    apiClient.clearToken()
  }

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('Not authenticated')

    try {
      const updated = await apiClient.updateProfile(data)
      setUserProfile(updated)
    } catch (error) {
      // Fallback to Supabase
      const { data: profile } = await supabaseDB.updateUserProfile(user.id, data)
      if (profile) {
        setUserProfile(profile as UserProfile)
      } else {
        throw error
      }
    }
  }

  const value = {
    user,
    userProfile,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
