// ============================================
// SUPABASE CLIENT - SERVER
// ============================================

import { supabase } from '../supabase'

// Server-side supabase client
// Note: In Next.js App Router with Supabase, we use the same client
// The auth state is managed via cookies and tokens
export const createServerClient = () => {
  return supabase
}
