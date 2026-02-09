'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export default function AuthCallbackConfirm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get auth state from URL parameters if present
        const access_token = searchParams.get('access_token')
        const refresh_token = searchParams.get('refresh_token')

        if (access_token && refresh_token) {
          // Store tokens in localStorage to prevent Chrome state deletion
          localStorage.setItem('sb-access-token', access_token)
          localStorage.setItem('sb-refresh-token', refresh_token)

          // Verify session is active
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )

          await supabase.auth.setSession({
            access_token,
            refresh_token,
          })
        }

        // Get redirect target
        const redirectUrl = sessionStorage.getItem('auth_redirect_after') || '/survey'

        // Clear session storage
        sessionStorage.removeItem('auth_session_id')
        sessionStorage.removeItem('auth_redirect_after')

        // Redirect after small delay to ensure state is preserved
        setTimeout(() => {
          router.push(redirectUrl)
        }, 500)
      } catch (error) {
        console.error('Auth callback error:', error)
        setTimeout(() => {
          router.push('/login')
        }, 1000)
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Setting up your account...</h2>
        <p className="text-gray-600">Please wait while we complete your sign-in.</p>
        <p className="text-sm text-gray-500 mt-4">This page will redirect automatically.</p>
      </div>
    </div>
  )
}
