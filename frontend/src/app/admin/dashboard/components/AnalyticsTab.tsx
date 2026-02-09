'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PixelIcon } from '@/components/ui/PixelIcon'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts'

export function AnalyticsTab() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAnalytics()
    }, [])

    const fetchAnalytics = async () => {
        const supabase = createClient()

        // Fetch all completed surveys with responses
        const { data: surveys, error } = await supabase
            .from('surveys')
            .select('responses')
            .eq('is_complete', true)

        if (error) {
            console.error('Error fetching analytics:', error)
            setLoading(false)
            return
        }

        // Process Data
        const genderCounts: Record<string, number> = { male: 0, female: 0, other: 0 }
        const yearCounts: Record<string, number> = {}
        const introExtroCounts: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }

        surveys?.forEach((survey: any) => {
            const resp = survey.responses || {}

            // Gender
            const g = resp['gender']
            if (g === 'male') genderCounts.male++
            else if (g === 'female') genderCounts.female++
            else genderCounts.other++

            // Year Level
            const y = resp['year']
            if (y) {
                yearCounts[y] = (yearCounts[y] || 0) + 1
            }

            // Personality (Introvert scale: 1=Strongly Disagree (Extro), 5=Strongly Agree (Intro))
            const p = resp['personality_introvert']
            if (p) {
                introExtroCounts[String(p)] = (introExtroCounts[String(p)] || 0) + 1
            }
        })

        // Format for Recharts
        const genderData = [
            { name: 'Male', value: genderCounts.male, color: '#3B82F6' },
            { name: 'Female', value: genderCounts.female, color: '#EC4899' },
            { name: 'Other', value: genderCounts.other, color: '#8B5CF6' },
        ].filter(d => d.value > 0)

        const yearData = Object.keys(yearCounts).map(key => ({
            name: key.replace('_', ' ').toUpperCase(),
            value: yearCounts[key],
        }))

        const personalityData = Object.keys(introExtroCounts).map(key => ({
            name: key, // 1 to 5
            value: introExtroCounts[key],
        }))

        setData({ genderData, yearData, personalityData, total: surveys?.length || 0 })
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="p-12 text-center text-[#1E3A8A] font-[family-name:var(--font-press-start)] text-xs animate-pulse">
                ANALYZING WIZARD DATA...
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-white border-4 border-[#1E3A8A] p-6 shadow-[8px_8px_0_#1E3A8A]">
                <h2 className="text-2xl font-black text-[#1E3A8A] mb-2 flex items-center gap-3">
                    <PixelIcon name="crystal" size={32} />
                    WIZARD POPULATION ANALYTICS
                </h2>
                <p className="font-[family-name:var(--font-vt323)] text-xl text-gray-600">
                    Real-time data from {data?.total || 0} completed surveys.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Gender Distribution */}
                <div className="bg-white border-4 border-[#1E3A8A] p-6 shadow-[8px_8px_0_#1E3A8A]">
                    <h3 className="font-bold text-[#1E3A8A] mb-4 font-[family-name:var(--font-press-start)] text-xs">GENDER RATIO</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.genderData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.genderData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#1E3A8A" strokeWidth={2} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ border: '2px solid #1E3A8A', borderRadius: '0px', padding: '10px' }}
                                    itemStyle={{ fontFamily: 'var(--font-vt323)', fontSize: '1.2rem', color: '#1E3A8A' }}
                                />
                                <Legend iconType="square" formatter={(val) => <span className="font-bold text-[#1E3A8A] font-mono text-xs">{val}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Year Level Distribution */}
                <div className="bg-white border-4 border-[#1E3A8A] p-6 shadow-[8px_8px_0_#1E3A8A]">
                    <h3 className="font-bold text-[#1E3A8A] mb-4 font-[family-name:var(--font-press-start)] text-xs">YEAR LEVEL</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.yearData}>
                                <XAxis dataKey="name" fontSize={10} tick={{ fill: '#1E3A8A' }} interval={0} angle={-45} textAnchor="end" height={60} />
                                <YAxis tick={{ fill: '#1E3A8A' }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(30, 58, 138, 0.1)' }}
                                    contentStyle={{ border: '2px solid #1E3A8A', padding: '10px' }}
                                    itemStyle={{ fontFamily: 'var(--font-vt323)', fontSize: '1.2rem', color: '#1E3A8A' }}
                                />
                                <Bar dataKey="value" fill="#FFD700" stroke="#1E3A8A" strokeWidth={2} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}
