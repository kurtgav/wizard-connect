// ============================================
// SUPABASE CLIENT - BROWSER
// ============================================

import { supabase } from '../supabase'

// Re-export the main supabase client for browser use
export const createClient = () => supabase

// Singleton instance
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient()
  }
  return supabaseInstance
}
