// ============================================
// LOGIN PAGE - HIGH-FIDELITY PIXEL UI
// Concept: Neo-Retro Cyber Terminal
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { auth } from '@/lib/supabase'
import { debugAuthState } from '@/lib/utils/auth-debug'

export default function LoginPage() {
  const router = useRouter()
  const [isHovering, setIsHovering] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    // Run debug check on mount
    debugAuthState()

    // Check if user is already logged in
    const checkSession = async () => {
      console.log('Checking existing session...')
      const session = await auth.getSession()
      console.log('Existing session:', session)
      if (session) {
        router.push('/survey')
      }
    }
    checkSession()
  }, [router])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    console.log('Attempting to', isSignUp ? 'sign up' : 'sign in', 'with email:', email)

    try {
      let result
      if (isSignUp) {
        // Sign up
        result = await auth.signUp(email, password)
        console.log('Sign up result:', result)
        if (result.error) {
          console.error('Sign up error:', result.error)
          setError(result.error.message)
          setIsLoading(false)
          return
        }
        alert('Account created! You can now sign in.')
        setIsSignUp(false)
      } else {
        // Sign in
        result = await auth.signIn(email, password)
        console.log('Sign in result:', result)
        if (result.error) {
          console.error('Sign in error:', result.error)
          setError(result.error.message)
          setIsLoading(false)
          return
        }
        // Success - wait a moment for session to be set, then redirect
        await new Promise(resolve => setTimeout(resolve, 500))
        console.log('Login successful, redirecting to /survey')
        router.push('/survey')
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      setError(err.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setError('')
    setIsLoading(true)

    console.log('Attempting Google sign-in')

    try {
      // Store session ID to preserve auth state across redirects
      // This prevents Chrome from deleting state for intermediate websites
      const sessionId = crypto.randomUUID()
      sessionStorage.setItem('auth_session_id', sessionId)
      sessionStorage.setItem('auth_redirect_after', '/survey')

      // Use the correct redirect URL based on the current environment
      const redirectURL = `${window.location.origin}/auth/callback/confirm`
      console.log('Google Auth Redirect URL:', redirectURL)

      const { error } = await auth.signInWithGoogle()

      if (error) {
        console.error('Google sign-in error:', error)
        setError(error.message)
        setIsLoading(false)
      }
      // Note: Redirect will happen via Supabase OAuth flow
    } catch (err: any) {
      console.error('Google auth error:', err)
      setError(err.message || 'Google sign-in failed')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#0F0F1A]">

      {/* 1. Immersive Background Layer */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/bg.gif"
          alt="Cyber City Background"
          fill
          className="object-cover opacity-40 grayscale-[30%] scale-105"
          priority
          unoptimized
        />
        {/* Cinematic Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F1A] via-[#0F0F1A]/60 to-transparent" />
      </div>

      {/* 2. Main Login Card - High-End Pixel Art (Long Form) */}
      <div className="relative z-10 w-full max-w-md mx-4 perspective-1000">

        {/* Floating Container */}
        <div
          className="relative transition-transform duration-500 ease-out hover:-translate-y-2 group"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Neon Glow Backlight */}
          <div className="absolute -inset-[3px] bg-gradient-to-b from-[#00FFFF] via-[#FF00FF] to-[#00FFFF] rounded-sm opacity-30 blur-lg group-hover:opacity-60 group-hover:blur-xl transition-all duration-500 animate-pulse" />

          {/* Main Chassis */}
          <div className="relative bg-[#0F0518] border-2 border-[#2D1B2E] shadow-[0_0_0_4px_#000000,0_30px_60px_rgba(0,0,0,0.8)] flex flex-col min-h-[600px]">

            {/* A. Retro OS Header Bar */}
            <div className="h-12 bg-[#2D1B2E] flex items-center justify-between px-4 border-b-4 border-[#000]">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-[#FF5F57] shadow-[inset_1px_1px_0_rgba(255,255,255,0.4)] border border-black/20" />
                <div className="w-3 h-3 bg-[#FFBD2E] shadow-[inset_1px_1px_0_rgba(255,255,255,0.4)] border border-black/20" />
                <div className="w-3 h-3 bg-[#28C840] shadow-[inset_1px_1px_0_rgba(255,255,255,0.4)] border border-black/20" />
                <div className="h-6 w-[2px] bg-[#4A3B55] mx-2" />
                <span className="font-['Press_Start_2P'] text-[10px] text-[#FF0000] tracking-widest drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]">
                  WIZARD_OS.SYS
                </span>
              </div>
              <div className="flex gap-1 opacity-50">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-1 h-4 bg-[#4A3B55]" />
                ))}
              </div>
            </div>

            {/* B. Main Terminal Content */}
            <div className="flex-1 p-6 md:p-8 flex flex-col relative overflow-hidden">

              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#1A0B2E] via-[#0F0518] to-[#0F0518] pointer-events-none" />

              {/* B1. Holographic Logo */}
              <div className="relative z-10 flex flex-col items-center mt-4 mb-6">
                <div className="relative w-24 h-24 md:w-32 md:h-32 mb-4 group-hover:scale-105 transition-transform duration-500">
                  <div className="absolute inset-0 bg-[#FF0000] blur-[40px] opacity-20 animate-pulse" />
                  <Image
                    src="/images/wizardconnect-logo.png"
                    alt="Wizard Connect"
                    fill
                    className="object-contain drop-shadow-[4px_4px_0_rgba(0,0,0,0.8)]"
                    priority
                  />
                </div>
                <h1 className="font-['Press_Start_2P'] text-lg text-center text-white mb-2 leading-relaxed" style={{ textShadow: '3px 3px 0 #2D1B2E' }}>
                  {isSignUp ? 'NEW PLAYER' : 'PLAYER'}<br /><span className="text-[#FF6B9D]">{isSignUp ? 'SIGN UP' : 'LOGIN'}</span>
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-[#28C840] animate-ping" />
                  <span className="font-mono text-xs text-[#28C840]">Secure Channel Active</span>
                </div>
              </div>

              {/* B1. Google OAuth Button (Primary) */}
              <button
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="relative z-10 w-full focus:outline-none transform transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mb-4"
              >
                <div className="relative bg-[#4285F4] h-14 rounded-full border-4 border-[#2D1B2E] flex items-center justify-center gap-3 overflow-hidden shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)]">
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-[#2D1B2E] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  <span className="font-['Press_Start_2P'] text-sm text-white tracking-wider">
                    {isLoading ? 'LOADING...' : 'CONTINUE WITH GOOGLE'}
                  </span>
                </div>
              </button>

              {/* Divider */}
              <div className="relative z-10 flex items-center gap-4 mb-4">
                <div className="flex-1 h-px bg-[#2D1B2E]" />
                <span className="font-mono text-xs text-[#4A3B55]">OR</span>
                <div className="flex-1 h-px bg-[#2D1B2E]" />
              </div>

              {/* B2. Email/Password Form */}
              <form onSubmit={handleEmailAuth} className="relative z-10 space-y-4 mb-4">
                <div>
                  <label className="font-mono text-xs text-[#00FFFF] mb-2 block">&gt; EMAIL_ADDRESS</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-black/60 border-2 border-[#2D1B2E] rounded px-4 py-3 font-mono text-sm text-white focus:border-[#FF6B9D] focus:outline-none transition-colors"
                    placeholder="Enter your email"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="font-mono text-xs text-[#00FFFF] mb-2 block">&gt; PASSWORD</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-black/60 border-2 border-[#2D1B2E] rounded px-4 py-3 font-mono text-sm text-white focus:border-[#FF6B9D] focus:outline-none transition-colors"
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <div className="bg-[#FF0000]/20 border border-[#FF0000] rounded px-3 py-2 font-mono text-xs text-[#FF6B6B]">
                    ⚠ {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative group focus:outline-none transform transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-[#2D1B2E] rounded-full translate-y-1.5" />
                  <div className="relative bg-[#FF4D6D] h-14 rounded-full border-4 border-[#2D1B2E] flex items-center justify-center gap-3 overflow-hidden shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)]">
                    <div className="absolute top-2 left-6 w-8 h-3 bg-white/90 rounded-full rotate-[-15deg] opacity-80" />
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-[#2D1B2E] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5 text-[#2D1B2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    )}
                    <span className="font-['Press_Start_2P'] text-sm text-[#2D1B2E] tracking-wider">
                      {isLoading ? 'LOADING...' : isSignUp ? 'CREATE ACCOUNT' : 'LOGIN'}
                    </span>
                  </div>
                </button>
              </form>

              {/* Toggle Sign In/Sign Up */}
              <div className="relative z-10 text-center mt-2">
                <button
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setError('') }}
                  className="font-mono text-xs text-[#00FFFF] hover:text-[#FF6B9D] transition-colors"
                  disabled={isLoading}
                >
                  {isSignUp ? 'Already have an account? LOGIN' : 'New player? CREATE ACCOUNT'}
                </button>
              </div>

              {/* Debug Toggle */}
              <div className="relative z-10 text-center mt-4">
                <button
                  type="button"
                  onClick={() => { setShowDebug(!showDebug); debugAuthState() }}
                  className="font-mono text-[9px] text-[#4A5568] hover:text-[#FF6B9D] transition-colors"
                >
                  {showDebug ? 'HIDE DEBUG' : 'SHOW DEBUG INFO'}
                </button>

                {showDebug && (
                  <div className="mt-2 p-2 bg-black/80 border border-[#4A5568] rounded text-left font-mono text-[9px] text-[#28C840] overflow-auto max-h-32">
                    <p>Open browser console (F12) for detailed debug info</p>
                    <p className="mt-1 text-[#FF6B6B]">Check these if login fails:</p>
                    <ul className="list-disc ml-4 text-[#4A5568]">
                      <li>Browser console for errors</li>
                      <li>Network tab for failed requests</li>
                      <li>Cookie settings - enable cookies</li>
                      <li>Private/incognito mode may block auth</li>
                      <li>Ad blockers may interfere</li>
                    </ul>
                  </div>
                )}
              </div>

            </div>

            {/* C. Footer Status Bar */}
            <div className="h-8 bg-[#0F0518] border-t-2 border-[#2D1B2E] flex items-center justify-between px-4">
              <span className="font-mono text-[9px] text-[#4A5568]">MEMORY: 64KB OK</span>
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-[#FF00FF] animate-pulse" />
                <div className="w-2 h-2 bg-[#00FFFF] animate-pulse delay-75" />
              </div>
            </div>

          </div>
        </div>

        {/* Floor Shadow Reflection */}
        <div className="mx-auto w-[80%] h-8 bg-black/50 blur-xl rounded-[100%] mt-8 transform scale-y-50" />
      </div>

    </div>
  )
}
