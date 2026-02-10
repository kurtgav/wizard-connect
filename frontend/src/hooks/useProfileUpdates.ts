// ============================================
// CUSTOM HOOK - PROFILE REAL-TIME UPDATES
// Listens to profile changes in Supabase and triggers refresh
// ============================================

import { useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ProfileUpdateCallback {
  (userId: string): void | Promise<void>
}

// Global callbacks registry for profile updates
const profileCallbacksRegistry = new Set<ProfileUpdateCallback>()
const globalChannelRef: { current: any } = { current: null }
const isGlobalChannelInitialized = { current: false }

/**
 * Initialize global profile updates channel (shared across all hook instances)
 */
function initializeGlobalChannel() {
  if (isGlobalChannelInitialized.current) return
  
  const supabase = createClient()
  
  const channel = supabase
    .channel('global-profile-updates')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
      },
      (payload: any) => {
        const userId = payload.old?.id || payload.new?.id
        if (userId) {
          console.log('Profile update detected for user:', userId)
          
          // Execute all registered callbacks
          profileCallbacksRegistry.forEach(cb => {
            try {
              cb(userId)
            } catch (error) {
              console.error('Error in profile update callback:', error)
            }
          })
        }
      }
    )
    .subscribe()

  globalChannelRef.current = channel
  isGlobalChannelInitialized.current = true

  return () => {
    if (globalChannelRef.current) {
      supabase.removeChannel(globalChannelRef.current)
      globalChannelRef.current = null
      isGlobalChannelInitialized.current = false
    }
  }
}

/**
 * Hook that subscribes to profile updates in real-time
 * When a user's profile is updated, the callback is invoked
 */
export function useProfileUpdates(callback: ProfileUpdateCallback) {
  const callbackRef = useRef<ProfileUpdateCallback>(callback)
  callbackRef.current = callback

  useEffect(() => {
    // Initialize global channel if not already done
    initializeGlobalChannel()

    // Register callback
    profileCallbacksRegistry.add(callbackRef.current)

    return () => {
      // Unregister callback
      profileCallbacksRegistry.delete(callbackRef.current)
      
      // If no more callbacks, cleanup global channel
      if (profileCallbacksRegistry.size === 0) {
        const cleanup = initializeGlobalChannel()
        if (cleanup) cleanup()
      }
    }
  }, [])

  return globalChannelRef
}

/**
 * Hook that subscribes to specific user profile updates
 * Only triggers callback when the specific user's profile changes
 */
export function useUserProfileUpdates(userId: string | null, callback: (userId: string) => void) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useProfileUpdates((updatedUserId: string) => {
    if (userId && updatedUserId === userId) {
      callbackRef.current(updatedUserId)
    }
  })
}

/**
 * Hook that subscribes to multiple user profile updates
 * Useful for watching multiple users in a list
 */
export function useMultipleProfileUpdates(userIds: string[], callback: (userId: string) => void) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useProfileUpdates((updatedUserId: string) => {
    if (userIds.includes(updatedUserId)) {
      callbackRef.current(updatedUserId)
    }
  })
}
