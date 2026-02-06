// ============================================
// SURVEY FORM COMPONENT - PIXEL CONCEPT DESIGN
// Dreamy vaporwave survey interface
// ============================================

'use client'

import { useState } from 'react'
import { surveyQuestions, calculateProgress } from '@/lib/surveyQuestions'
import { storage } from '@/lib/utils'

interface SurveyFormProps {
  onComplete?: (responses: Record<string, any>) => void
}

export function SurveyForm({ onComplete }: SurveyFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState<Record<string, any>>(() => {
    // Load saved responses from localStorage
    if (typeof window !== 'undefined') {
      return storage.get<Record<string, any>>('survey_responses', {})
    }
    return {}
  })
  const [isSaving, setIsSaving] = useState(false)

  const currentQuestion = surveyQuestions[currentStep]
  const progress = calculateProgress(Object.keys(responses).length)
  const canGoBack = currentStep > 0
  const canGoForward = responses[currentQuestion?.id] !== undefined || !currentQuestion?.required

  const saveResponse = (questionId: string, value: any) => {
    const newResponses = { ...responses, [questionId]: value }
    setResponses(newResponses)

    // Save to localStorage
    storage.set('survey_responses', newResponses)
  }

  const handleNext = () => {
    if (currentStep < surveyQuestions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Survey complete
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    setIsSaving(true)

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      storage.remove('survey_responses')
      onComplete?.(responses)
    }, 1500)
  }

  const renderQuestionInput = () => {
    switch (currentQuestion.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => {
              const checked = responses[currentQuestion.id] === option.value
              return (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 cursor-pointer group pixel-border-thin p-3 transition-all ${checked
                      ? 'bg-blue-50 border-blue-300 transform scale-[1.01]'
                      : 'bg-white hover:bg-gray-50'
                    }`}
                  style={{
                    boxShadow: checked ? '2px 2px 0 #00D4FF' : 'none'
                  }}
                >
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={option.value}
                    checked={checked}
                    onChange={(e) => saveResponse(currentQuestion.id, e.target.value)}
                    className="pixel-radio"
                  />
                  <span className={`flex-1 pixel-font-body text-sm ${checked ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
                    {option.label}
                  </span>
                </label>
              )
            })}
          </div>
        )

      case 'multi_select':
        const selectedValues = responses[currentQuestion.id] || []
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => {
              const checked = selectedValues.includes(option.value)
              return (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 cursor-pointer group pixel-border-thin p-3 transition-all ${checked
                      ? 'bg-blue-50 border-blue-300 transform scale-[1.01]'
                      : 'bg-white hover:bg-gray-50'
                    }`}
                  style={{
                    boxShadow: checked ? '2px 2px 0 #00D4FF' : 'none'
                  }}
                >
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={checked}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...selectedValues, option.value]
                        : selectedValues.filter((v: any) => v !== option.value)
                      saveResponse(currentQuestion.id, newValues)
                    }}
                    className="pixel-checkbox"
                  />
                  <span className={`flex-1 pixel-font-body text-sm ${checked ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
                    {option.label}
                  </span>
                </label>
              )
            })}
          </div>
        )

      case 'scale':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => {
              const checked = responses[currentQuestion.id] === option.value
              return (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 cursor-pointer group pixel-border-thin p-3 transition-all ${checked
                      ? 'bg-blue-50 border-blue-300 transform scale-[1.01]'
                      : 'bg-white hover:bg-gray-50'
                    }`}
                  style={{
                    boxShadow: checked ? '2px 2px 0 #00D4FF' : 'none'
                  }}
                >
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={option.value}
                    checked={checked}
                    onChange={(e) => saveResponse(currentQuestion.id, parseInt(e.target.value))}
                    className="pixel-radio"
                  />
                  <span className={`flex-1 pixel-font-body text-sm ${checked ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
                    {option.label}
                  </span>
                </label>
              )
            })}
          </div>
        )

      case 'crush_list':
        const crushes = responses[currentQuestion.id] || []
        return (
          <div className="space-y-4">
            <div className="pixel-card-sky p-3 text-xs mb-4" style={{ background: '#F0F8FF' }}>
              <p className="pixel-font-body text-gray-600">
                💕 Enter the Mapua email addresses of up to 5 people you're interested in.
                If they also list you, you'll both get a <strong style={{ color: '#FF6B9D' }}>compatibility bonus</strong>!
              </p>
            </div>
            {[0, 1, 2, 3, 4].map((index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-xl pixel-bounce" style={{ animationDelay: `${index * 0.1}s` }}>
                  {['❤️', '🧡', '💛', '💚', '💙'][index]}
                </span>
                <input
                  type="email"
                  placeholder={`Crush ${index + 1} email (optional)`}
                  value={crushes[index] || ''}
                  onChange={(e) => {
                    const newCrushes = [...crushes]
                    newCrushes[index] = e.target.value
                    saveResponse(currentQuestion.id, newCrushes.filter(c => c.trim()))
                  }}
                  className="pixel-input w-full"
                />
              </div>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  if (!currentQuestion) {
    return null
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="pixel-font-heading text-xs font-bold" style={{ color: '#FF6B9D' }}>
            Question {currentStep + 1} of {surveyQuestions.length}
          </span>
          <span className="pixel-badge text-xs" style={{ background: '#00D4FF' }}>
            {progress}% Complete
          </span>
        </div>
        <div className="pixel-progress-container h-4 bg-gray-100 rounded-none border-2 border-gray-800">
          <div
            className="pixel-progress-bar h-full transition-all duration-300 ease-out"
            style={{
              width: `${progress}%`,
              background: `repeating-linear-gradient(45deg, #FF6B9D, #FF6B9D 10px, #FF8E53 10px, #FF8E53 20px)`
            }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="pixel-card hover-lift" style={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFEFF 100%)',
        border: '4px solid #2C3E50',
        boxShadow: '8px 8px 0 #8BE0FF'
      }}>
        {/* Category Badge */}
        <div className="mb-4">
          <span className="pixel-tag text-xs" style={{
            background: 'linear-gradient(180deg, #E8F5FF 0%, #D4F0FF 100%)',
            color: '#1976D2'
          }}>
            {currentQuestion.category}
          </span>
        </div>

        {/* Question */}
        <h2 className="pixel-font-heading text-xl font-bold mb-3" style={{ color: '#2C3E50' }}>
          {currentQuestion.text}
        </h2>

        {currentQuestion.required && (
          <p className="pixel-font-body text-xs text-red-500 mb-6 flex items-center gap-1">
            <span>*</span> Required
          </p>
        )}

        {/* Input */}
        <div className="mb-8">
          {renderQuestionInput()}
        </div>

        {/* Navigation */}
        <div className="flex gap-4 justify-between pt-4 border-t-2 border-gray-100">
          <button
            onClick={handleBack}
            disabled={!canGoBack}
            className="pixel-btn pixel-btn-secondary disabled:opacity-50 disabled:cursor-not-allowed text-xs"
          >
            ← Back
          </button>

          <button
            onClick={handleNext}
            disabled={!canGoForward || isSaving}
            className="pixel-btn pixel-btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-xs px-6"
            style={{ minWidth: '120px' }}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">⏳ Saving...</span>
            ) : currentStep === surveyQuestions.length - 1 ? (
              <span className="flex items-center gap-2">✓ Submit Survey</span>
            ) : (
              <span className="flex items-center gap-2">Next →</span>
            )}
          </button>
        </div>
      </div>

      {/* Question Navigation */}
      <div className="mt-8 pixel-card" style={{ background: '#F8F9FA' }}>
        <h3 className="pixel-font-heading text-xs font-bold mb-3" style={{ color: '#2C3E50' }}>
          Quick Navigation
        </h3>
        <div className="flex flex-wrap gap-2">
          {surveyQuestions.map((question, index) => {
            const isCompleted = responses[question.id] !== undefined
            const isCurrent = currentStep === index

            return (
              <button
                key={question.id}
                onClick={() => setCurrentStep(index)}
                className={`w-8 h-8 flex items-center justify-center border-2 font-bold text-xs transition-all pixel-font-heading ${isCurrent
                    ? 'bg-pink-500 text-white border-pink-700 transform scale-110 shadow-md'
                    : isCompleted
                      ? 'bg-blue-100 border-blue-400 text-blue-800'
                      : 'bg-white border-gray-300 text-gray-400 hover:border-gray-400'
                  }`}
                style={isCurrent ? { boxShadow: '2px 2px 0 #C2185B' } : {}}
              >
                {index + 1}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
