'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PixelIcon } from '@/components/ui/PixelIcon'

export default function CampaignManager() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [campaign, setCampaign] = useState({
    name: '',
    survey_open_date: '2026-02-05T00:00',
    survey_close_date: '2026-02-10T23:59',
    profile_update_start_date: '2026-02-11T00:00',
    profile_update_end_date: '2026-02-13T23:59',
    results_release_date: '2026-02-14T07:00',
    is_active: true,
    algorithm_version: '2.0',
    config: {
      weights: {
        demographics: 0.10,
        personality: 0.30,
        values: 0.25,
        lifestyle: 0.20,
        interests: 0.15,
      },
      num_matches: 7,
      mutual_crush_bonus: 0.20,
      one_way_crush_bonus: 0.10,
      minimum_compatibility_score: 30,
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaign),
      })

      if (response.ok) {
        router.push('/admin/dashboard')
      } else {
        alert('Failed to create campaign')
      }
    } catch (err) {
      alert('Error creating campaign')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-retro-cream p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="pixel-btn bg-retro-blue hover:bg-retro-blue-light text-white px-4 py-2 mb-4"
          >
            ← BACK TO DASHBOARD
          </button>
          <h1 className="text-4xl font-bold font-pixel mb-2">
            <PixelIcon name="trophy" size={32} className="inline-block mr-2" />
            CREATE NEW CAMPAIGN
          </h1>
          <p className="text-lg text-gray-600">Configure matching parameters and schedule</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="pixel-card bg-white border-4 border-black shadow-[4px_4px_0_0_#000] p-6">
            <h2 className="text-2xl font-bold font-pixel mb-4 flex items-center gap-2">
              <PixelIcon name="star" size={24} />
              CAMPAIGN DETAILS
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block font-bold mb-2">Campaign Name</label>
                <input
                  type="text"
                  value={campaign.name}
                  onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
                  required
                  className="pixel-input w-full border-4 border-black bg-white p-3 focus:outline-none"
                  placeholder="e.g., Valentine's 2026 Matching"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={campaign.is_active}
                  onChange={(e) => setCampaign({ ...campaign, is_active: e.target.checked })}
                  className="w-5 h-5"
                />
                <label htmlFor="isActive" className="font-bold">
                  Campaign is Active
                </label>
              </div>
            </div>
          </div>

          <div className="pixel-card bg-white border-4 border-black shadow-[4px_4px_0_0_#000] p-6">
            <h2 className="text-2xl font-bold font-pixel mb-4 flex items-center gap-2">
              <PixelIcon name="target" size={24} />
              TIMELINE
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold mb-2">Survey Opens</label>
                <input
                  type="datetime-local"
                  value={campaign.survey_open_date}
                  onChange={(e) => setCampaign({ ...campaign, survey_open_date: e.target.value })}
                  required
                  className="pixel-input w-full border-4 border-black bg-white p-3 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Survey Closes</label>
                <input
                  type="datetime-local"
                  value={campaign.survey_close_date}
                  onChange={(e) => setCampaign({ ...campaign, survey_close_date: e.target.value })}
                  required
                  className="pixel-input w-full border-4 border-black bg-white p-3 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Profile Update Start</label>
                <input
                  type="datetime-local"
                  value={campaign.profile_update_start_date}
                  onChange={(e) => setCampaign({ ...campaign, profile_update_start_date: e.target.value })}
                  required
                  className="pixel-input w-full border-4 border-black bg-white p-3 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Profile Update End</label>
                <input
                  type="datetime-local"
                  value={campaign.profile_update_end_date}
                  onChange={(e) => setCampaign({ ...campaign, profile_update_end_date: e.target.value })}
                  required
                  className="pixel-input w-full border-4 border-black bg-white p-3 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold mb-2">Results Release Date</label>
                <input
                  type="datetime-local"
                  value={campaign.results_release_date}
                  onChange={(e) => setCampaign({ ...campaign, results_release_date: e.target.value })}
                  required
                  className="pixel-input w-full border-4 border-black bg-white p-3 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pixel-card bg-white border-4 border-black shadow-[4px_4px_0_0_#000] p-6">
            <h2 className="text-2xl font-bold font-pixel mb-4 flex items-center gap-2">
              <PixelIcon name="potion" size={24} />
              ALGORITHM CONFIGURATION
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold mb-2">Algorithm Version</label>
                <input
                  type="text"
                  value={campaign.algorithm_version}
                  onChange={(e) => setCampaign({ ...campaign, algorithm_version: e.target.value })}
                  required
                  className="pixel-input w-full border-4 border-black bg-white p-3 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Number of Matches per User</label>
                <input
                  type="number"
                  value={campaign.config.num_matches}
                  onChange={(e) => setCampaign({
                    ...campaign,
                    config: { ...campaign.config, num_matches: parseInt(e.target.value) }
                  })}
                  min="1"
                  max="10"
                  required
                  className="pixel-input w-full border-4 border-black bg-white p-3 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Minimum Compatibility Score</label>
                <input
                  type="number"
                  value={campaign.config.minimum_compatibility_score}
                  onChange={(e) => setCampaign({
                    ...campaign,
                    config: { ...campaign.config, minimum_compatibility_score: parseInt(e.target.value) }
                  })}
                  min="0"
                  max="100"
                  required
                  className="pixel-input w-full border-4 border-black bg-white p-3 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Mutual Crush Bonus</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={campaign.config.mutual_crush_bonus}
                    onChange={(e) => setCampaign({
                      ...campaign,
                      config: { ...campaign.config, mutual_crush_bonus: parseFloat(e.target.value) }
                    })}
                    min="0"
                    max="1"
                    step="0.01"
                    required
                    className="pixel-input flex-1 border-4 border-black bg-white p-3 focus:outline-none"
                  />
                  <span className="font-bold">%</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-bold mb-3">Category Weights</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {Object.entries(campaign.config.weights).map(([key, value]) => (
                  <div key={key}>
                    <label className="block font-bold mb-2 capitalize text-sm">{key}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => setCampaign({
                          ...campaign,
                          config: {
                            ...campaign.config,
                            weights: {
                              ...campaign.config.weights,
                              [key]: parseFloat(e.target.value)
                            }
                          }
                        })}
                        min="0"
                        max="1"
                        step="0.01"
                        required
                        className="pixel-input flex-1 border-4 border-black bg-white p-2 text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 pixel-btn bg-retro-red hover:bg-retro-red-light text-white px-6 py-4 font-bold text-lg disabled:opacity-70"
            >
              {loading ? 'CREATING...' : 'CREATE CAMPAIGN'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/dashboard')}
              className="pixel-btn bg-gray-500 hover:bg-gray-600 text-white px-6 py-4 font-bold"
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
