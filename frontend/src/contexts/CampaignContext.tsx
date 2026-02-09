'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'

export interface CampaignStatus {
    campaign_id: string
    campaign_name: string
    survey_active: boolean
    profile_update_active: boolean
    messaging_active: boolean
    results_released: boolean
    survey_close_date: string
    results_release_date: string
    server_time: string
}

interface CampaignContextType {
    status: CampaignStatus | null
    loading: boolean
    error: string | null
    refreshStatus: () => Promise<void>
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined)

export function CampaignProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<CampaignStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchStatus = async () => {
        try {
            setLoading(true)
            // We'll use the apiClient method we're about to add or use fetch directly for now
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/campaigns/status`)
            if (!response.ok) {
                throw new Error('Failed to fetch campaign status')
            }
            const data = await response.json()
            setStatus(data)
            setError(null)
        } catch (err: any) {
            console.error('Campaign status error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStatus()
        // Refresh every 5 minutes
        const interval = setInterval(fetchStatus, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [])

    return (
        <CampaignContext.Provider value={{ status, loading, error, refreshStatus: fetchStatus }}>
            {children}
        </CampaignContext.Provider>
    )
}

export function useCampaign() {
    const context = useContext(CampaignContext)
    if (context === undefined) {
        throw new Error('useCampaign must be used within a CampaignProvider')
    }
    return context
}
