// ============================================
// SUPABASE CLIENT - AUTH & DATABASE
// ============================================

import { createClient } from '@supabase/supabase-js'
import { checkSupabaseConfig } from '@/lib/utils/supabase-config-check'
import { CustomStorage } from '@/lib/utils/storage'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Run config check
checkSupabaseConfig()

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your environment variables.')
}

// Custom lock implementation to prevent "Runtime AbortError" in some environments
const noOpLock = async (name: string, acquireTimeout: number, fn: () => Promise<any>) => {
  return await fn()
}

const customStorage = new CustomStorage('supabase');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    lock: noOpLock,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: customStorage as any,
    storageKey: 'sb-wizardconnect-auth-token',
  },
})

// Auth helper functions
export const auth = {
  // Sign up with email
  async signUp(email: string, password: string) {
    return await supabase.auth.signUp({
      email,
      password,
    })
  },

  // Sign in with email
  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    })
  },

  // Sign in with Google OAuth
  async signInWithGoogle() {
    if (typeof window === 'undefined') {
      throw new Error('signInWithGoogle can only be called on the client side')
    }
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback/confirm`,
      },
    })
  },

  // Sign out
  async signOut() {
    return await supabase.auth.signOut()
  },

  // Get current user
  async getUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Get current session
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },
}

// Database helper functions
export const db = {
  // Get user profile
  async getUserProfile(userId: string) {
    return await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
  },

  // Update user profile
  async updateUserProfile(userId: string, data: any) {
    return await supabase
      .from('users')
      .update(data)
      .eq('id', userId)
      .select()
      .single()
  },

  // Get or create user profile
  async getOrCreateUserProfile(userId: string, email: string) {
    // First try to get the user
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (existingUser) {
      return existingUser
    }

    // Create user profile if it doesn't exist
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user profile:', error)
      return null
    }

    return data
  },

  // Get survey responses
  async getSurvey(userId: string) {
    return await supabase
      .from('surveys')
      .select('*')
      .eq('user_id', userId)
      .single()
  },

  // Submit survey
  async submitSurvey(userId: string, data: any) {
    return await supabase
      .from('surveys')
      .upsert({
        user_id: userId,
        ...data,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
  },

  // Realtime subscriptions
  subscribeToMessages(conversationId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, callback)
      .subscribe()
  },

  subscribeToConversations(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('conversations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `or(participant1.eq.${userId},participant2.eq.${userId})`,
      }, callback)
      .subscribe()
  },
}
