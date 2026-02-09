// ============================================
// SHARED TYPES - FRONTEND/BACKEND API
// ============================================

// User Types
export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  avatar_url?: string
  bio?: string
  instagram?: string
  phone?: string
  contact_preference: 'email' | 'phone' | 'instagram'
  visibility: 'public' | 'matches_only' | 'private'
  year?: string
  major?: string
  gender?: 'male' | 'female' | 'non-binary' | 'prefer_not_to_say' | 'other'
  gender_preference?: 'male' | 'female' | 'both'
  created_at: string
  updated_at: string
}

export interface UserProfile {
  firstName: string
  lastName: string
  bio: string
  instagram: string
  phone: string
  contactPreference: 'email' | 'phone' | 'instagram'
  visibility: 'public' | 'matches_only' | 'private'
  year?: string
  major?: string
  gender?: 'male' | 'female' | 'non-binary' | 'prefer_not_to_say' | 'other'
  genderPreference?: 'male' | 'female' | 'both'
}

// Survey Types
export interface SurveyResponse {
  id: string
  user_id: string
  responses: Record<string, any>
  personality_type?: string
  interests: string[]
  values: string[]
  lifestyle?: string
  is_complete: boolean
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface SurveySubmission {
  responses: Record<string, any>
  personality_type?: string
  interests: string[]
  values: string[]
  lifestyle?: string
  is_complete?: boolean
}

// Match Types
export interface Match {
  id: string
  user_id: string
  matched_user_id: string
  compatibility_score: number
  rank: number
  is_mutual_crush: boolean
  created_at: string
}

export interface MatchWithDetails extends Match {
  email?: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  bio?: string
  year?: string
  major?: string
}

// Crush Types
export interface Crush {
  id: string
  user_id: string
  crush_email: string
  rank: number
  created_at: string
}

export interface CrushSubmission {
  crushes: Array<{
    email: string
    rank: number
  }>
}

// Message Types
export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

export interface Conversation {
  id: string
  participant1: string
  participant2: string
  last_message?: string
  updated_at: string
  created_at: string
}

export interface ConversationWithDetails extends Conversation {
  other_participant: {
    id: string
    first_name: string
    last_name: string
    avatar_url?: string
    online?: boolean
  }
  unread_count: number
}

export interface ConversationData {
  other_user_id: string
}

// API Response Types
export interface APIResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  has_more: boolean
}

// API Request Types
export interface SendMessageRequest {
  content: string
}

export interface UpdateProfileRequest extends Partial<UserProfile> {}

// Error Types
export interface APIError {
  message: string
  code?: string
  status: number
}

// Auth Types (from Supabase)
export interface AuthUser {
  id: string
  email: string
  email_confirmed_at?: string
  created_at: string
  updated_at: string
}

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  user: AuthUser
}
