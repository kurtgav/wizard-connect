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
    let mounted = true

    // Get initial session
    auth.getSession().then((session) => {
      if (!mounted) return
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user && session.access_token) {
        apiClient.setToken(session.access_token)
        loadUserProfile(session.user.id, session.user.email!)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log('🔄 Auth state change:', event, session?.user?.email)

      setSession(session)
      setUser(session?.user ?? null)

      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (session?.user) {
          // Set token for API client immediately
          if (session.access_token) {
            apiClient.setToken(session.access_token)
          }
          await loadUserProfile(session.user.id, session.user.email!)
        }
      } else if (event === 'SIGNED_OUT') {
        setUserProfile(null)
        apiClient.clearToken()
      }

      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const loadUserProfile = async (userId: string, email: string) => {
    try {
      console.log('Loading user profile for:', userId, email)
      const profile = await apiClient.getProfile()
      setUserProfile(profile)
    } catch (error) {
      console.error('Failed to load profile from API, trying Supabase:', error)
      const profile = await supabaseDB.getOrCreateUserProfile(userId, email)
      if (profile) {
        setUserProfile(profile as UserProfile)
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('Attempting to sign in:', email)
    const { error } = await auth.signIn(email, password)

    if (error) {
      console.error('Sign in error:', error)

      // Add helpful messages for common errors
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please try again.')
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Please check your email and confirm your account.')
      }
      if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
        throw new Error('Network error. Please check your internet connection.')
      }

      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    console.log('Attempting to sign up:', email)
    const { error } = await auth.signUp(email, password)

    if (error) {
      console.error('Sign up error:', error)

      if (error.message.includes('User already registered')) {
        throw new Error('An account with this email already exists. Please sign in.')
      }
      if (error.message.includes('password')) {
        throw new Error('Password must be at least 6 characters.')
      }
      if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
        throw new Error('Network error. Please check your internet connection.')
      }

      throw error
    }
  }

  const signInWithGoogle = async () => {
    console.log('Attempting Google sign-in')
    const { error } = await auth.signInWithGoogle()

    if (error) {
      console.error('Google sign-in error:', error)

      if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
        throw new Error('Network error. Please check your internet connection.')
      }
      if (error.message.includes('popup')) {
        throw new Error('Popup was blocked. Please allow popups for this site.')
      }

      throw error
    }
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
