'use client'

import { useState, useEffect } from 'react'
import { SurveyForm } from '@/components/features/survey/SurveyForm'
import { useRouter } from 'next/navigation'
import { PixelIcon, PixelIconName } from '@/components/ui/PixelIcon'
import { apiClient } from '@/lib/api-client'
import type { SurveyResponse } from '@/types/api'

export default function SurveyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [existingSurvey, setExistingSurvey] = useState<SurveyResponse | null>(null)
  const [surveyResponses, setSurveyResponses] = useState<Record<string, any>>({})

  useEffect(() => {
    loadSurveyData()
  }, [])

  // Load survey data from API and restore from localStorage if needed
  const loadSurveyData = async () => {
    try {
      setLoading(true)
      const survey = await apiClient.getSurvey()
      setExistingSurvey(survey)

      // Load saved responses from localStorage
      const savedResponses = localStorage.getItem('survey_responses')
      if (savedResponses) {
        try {
          const parsed = JSON.parse(savedResponses)
          setSurveyResponses(parsed)
        } catch (error) {
          console.error('Failed to parse saved survey responses:', error)
        }
      }
      setLoading(false)
    } catch (error) {
      console.error('Failed to load survey:', error)
      setLoading(false)
    }
  }

  // Save responses to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(surveyResponses).length > 0) {
      localStorage.setItem('survey_responses', JSON.stringify(surveyResponses))
    }
  }, [surveyResponses])

  const handleResponseChange = (key: string, value: any) => {
    setSurveyResponses(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSurveyComplete = async (responses: Record<string, any>) => {
    try {
      setLoading(true)

      // Calculate personality type from responses
      const personalityType = responses.personality_result || ''

      // Get interests from multi-select questions
      const interests = Object.entries(responses)
        .filter(([key]) => key.startsWith('interests_') && Array.isArray(responses[key]))
        .flatMap(([key]) => responses[key] as string[])

      // Get values from scale questions
      const values = Object.entries(responses)
        .filter(([key]) => key.startsWith('values_'))
        .map(([key]) => key.replace('values_', '').replace('_', ' '))

      // Calculate lifestyle from responses
      let lifestyle = 'Flexible'
      if (responses.lifestyle_study_habits === 'night_owl') lifestyle = 'Night Owl'
      else if (responses.lifestyle_study_habits === 'early_bird') lifestyle = 'Early Bird'
      else if (responses.lifestyle_study_habits === 'last_minute') lifestyle = 'Last Minute'
      else if (responses.lifestyle_study_habits === 'consistent') lifestyle = 'Consistent'

      const submission = {
        responses,
        personality_type: personalityType,
        interests,
        values,
        lifestyle,
        is_complete: true
      }

      console.log('Submitting survey:', submission)
      const result = await apiClient.submitSurvey(submission)
      console.log('Survey save result:', result)

      // Clear saved responses after successful submission
      localStorage.removeItem('survey_responses')

      // Success message and redirect
      alert('Survey completed successfully! Your responses have been saved.')
      router.push('/profile')
    } catch (error) {
      console.error('Failed to save survey:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      alert(`Failed to save survey: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block bg-[var(--retro-yellow)] border-4 border-[var(--retro-navy)] px-6 py-3 mb-4 animate-pulse">
            <p className="pixel-font text-lg text-[var(--retro-navy)]">LOADING...</p>
          </div>
          <p className="pixel-font-body text-sm text-gray-600">Fetching your wizard profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header Section */}
      <div className="text-center mb-10">
        <h1 className="pixel-font text-3xl md:text-5xl font-bold mb-4 text-[var(--retro-navy)] uppercase tracking-tighter">
          Wizard<span className="text-[var(--retro-red)]">Match</span> Survey
        </h1>
        <div className="inline-block bg-[var(--retro-yellow)] border-2 border-[var(--retro-navy)] px-4 py-1 transform -rotate-2 shadow-[4px_4px_0_var(--retro-navy)]">
          <p className="pixel-font-body font-bold text-[var(--retro-navy)]">
            FIND YOUR PLAYER 2
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="pixel-card mb-8">
        <div className="mb-6 flex items-center gap-3 border-b-4 border-[var(--retro-navy)] pb-4">
          <div className="p-2 bg-[var(--retro-red)] border-2 border-[var(--retro-navy)] text-white">
            <PixelIcon name="envelope" size={24} />
          </div>
          <div>
            <h2 className="pixel-font text-xl">Matchmaking Protocol</h2>
            <p className="text-sm font-bold text-gray-500">
              {existingSurvey?.is_complete ? 'UPDATE PROGRESS' : 'COMPLETE ALL MISSIONS'}
            </p>
          </div>
        </div>

        <SurveyForm
          onComplete={handleSurveyComplete}
          existingResponses={existingSurvey?.responses || {}}
          isComplete={existingSurvey?.is_complete || false}
        />
      </div>

      {/* Info Card - Retro Style */}
      <div className="pixel-card bg-[var(--retro-blue)] text-black">
        <div className="flex items-center gap-3 mb-4">
          <PixelIcon name="star" size={24} />
          <h3 className="pixel-font font-bold text-base text-black underline decoration-4 underline-offset-4 decoration-[var(--retro-navy)]">
            PRO TIPS
          </h3>
        </div>

        <ul className="space-y-3 pixel-font-body text-base">
          <TipItem icon="lock" text="Progress auto-saved to database." />
          <TipItem icon="bubble" text="Mission Time: ~15-20 minutes." />
          <TipItem icon="target" text="Honesty increases Critical Hit chance (Match %)." />
          <TipItem icon="heart_solid" text="Crush List is optional optional loot." />
        </ul>
      </div>

      {/* Decorative Footer Icons */}
      <div className="flex justify-center items-center gap-8 mt-12 opacity-50 grayscale hover:grayscale-0 transition-all">
        <PixelIcon name="chick" size={32} />
        <PixelIcon name="sparkle" size={24} />
        <PixelIcon name="chick" size={32} />
      </div>
    </div>
  )
}

// Tip Item Component
function TipItem({ icon, text }: { icon: PixelIconName; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-0.5 text-[var(--retro-yellow)] drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
        <PixelIcon name={icon} size={20} />
      </div>
      <span className="font-medium drop-shadow-md">{text}</span>
    </li>
  )
}
