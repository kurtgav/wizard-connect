'use client'

import React, { useEffect, useState } from 'react'
import { useCampaign } from '@/contexts/CampaignContext'
import { PixelIcon } from '@/components/ui/PixelIcon'
import { motion, AnimatePresence } from 'framer-motion'

export function CampaignPhaseBanner() {
    const { status, loading } = useCampaign()
    const [timeLeft, setTimeLeft] = useState<string>('')

    useEffect(() => {
        if (!status) return

        const calculateTimeLeft = () => {
            let targetDate: Date | null = null
            let label = ''

            if (status.survey_active) {
                targetDate = new Date(status.survey_close_date)
                label = 'SURVEY CLOSES IN:'
            } else if (status.profile_update_active) {
                targetDate = new Date(status.results_release_date) // Or end of profile update
                label = 'MATCH REVEAL IN:'
            } else if (!status.results_released) {
                targetDate = new Date(status.results_release_date)
                label = 'MATCH REVEAL IN:'
            }

            if (!targetDate) return ''

            const now = new Date()
            const diff = targetDate.getTime() - now.getTime()

            if (diff <= 0) return ''

            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            return `${label} ${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m ${seconds}s`
        }

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft())
        }, 1000)

        return () => clearInterval(timer)
    }, [status])

    if (loading || !status || !timeLeft) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="w-full bg-[#FF6B9D] border-b-4 border-[#2D1B2E] py-2 px-4 flex items-center justify-center gap-4 z-50 sticky top-0 shadow-lg"
            >
                <div className="flex items-center gap-2">
                    <div className="animate-pulse">
                        <PixelIcon name="star" size={16} className="text-white" />
                    </div>
                    <span className="font-['Press_Start_2P'] text-[10px] md:text-xs text-white tracking-wider drop-shadow-md">
                        {timeLeft}
                    </span>
                    <div className="animate-pulse">
                        <PixelIcon name="star" size={16} className="text-white" />
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
