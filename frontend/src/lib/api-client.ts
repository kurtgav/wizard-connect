// ============================================
// API CLIENT - BACKEND COMMUNICATION
// ============================================

import type {
  User,
  UserProfile,
  SurveyResponse,
  SurveySubmission,
  MatchWithDetails,
  Crush,
  CrushSubmission,
  ConversationWithDetails,
  Message,
  SendMessageRequest,
  APIResponse,
  PaginatedResponse,
} from '@/types/api'

class APIClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL?: string) {
    this.baseURL = baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

    // Check for production misconfiguration
    if (typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1' &&
      this.baseURL.includes('localhost')) {
      console.error(
        '🚨 API CONFIGURATION ERROR: The frontend is deployed but trying to connect to localhost.\n' +
        'Please set NEXT_PUBLIC_API_URL in your Vercel project settings to your production backend URL.\n' +
        'Current baseURL:', this.baseURL
      )
    }
  }

  // Set authentication token
  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  // Get authentication token
  getToken(): string | null {
    if (this.token) {
      return this.token
    }
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
    return this.token
  }

  // Clear authentication token
  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: response.statusText || 'An error occurred',
        }))
        throw new Error(error.error || error.message || 'Request failed')
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('An unexpected error occurred')
    }
  }

  // GET request
  private async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  // POST request
  private async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // PUT request
  private async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // DELETE request
  private async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // ===================
  // USER ENDPOINTS
  // ===================

  async getProfile(): Promise<User> {
    return this.get<User>('/api/v1/users/me')
  }

  async updateProfile(data: Partial<UserProfile>): Promise<User> {
    return this.put<User>('/api/v1/users/me', data)
  }

  // ===================
  // SURVEY ENDPOINTS
  // ===================

  async getSurvey(): Promise<SurveyResponse> {
    return this.get<SurveyResponse>('/api/v1/surveys')
  }

  async submitSurvey(data: SurveySubmission): Promise<SurveyResponse> {
    return this.post<SurveyResponse>('/api/v1/surveys', data)
  }

  // ===================
  // MATCH ENDPOINTS
  // ===================

  async getMatches(): Promise<MatchWithDetails[]> {
    return this.get<MatchWithDetails[]>('/api/v1/matches')
  }

  async generateMatches(): Promise<MatchWithDetails[]> {
    return this.post<MatchWithDetails[]>('/api/v1/matches/generate')
  }

  // ===================
  // CRUSH ENDPOINTS
  // ===================

  async getCrushes(): Promise<Crush[]> {
    return this.get<Crush[]>('/api/v1/crushes')
  }

  async submitCrushes(data: CrushSubmission): Promise<Crush[]> {
    return this.post<Crush[]>('/api/v1/crushes', data)
  }

  // ===================
  // MESSAGE ENDPOINTS
  // ===================

  async getConversations(): Promise<ConversationWithDetails[]> {
    return this.get<ConversationWithDetails[]>('/api/v1/messages/conversations')
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return this.get<Message[]>(`/api/v1/messages/conversations/${conversationId}`)
  }

  async sendMessage(conversationId: string, data: SendMessageRequest): Promise<Message> {
    return this.post<Message>(`/api/v1/messages/conversations/${conversationId}/messages`, data)
  }

  // ===================
  // HEALTH CHECK
  // ===================

  async healthCheck(): Promise<{ status: string; time: string }> {
    return this.get('/health')
  }
}

// Export singleton instance
export const apiClient = new APIClient()

// Export class for testing
export { APIClient }
