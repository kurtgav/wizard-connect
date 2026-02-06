'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import { PixelIcon } from '@/components/ui/PixelIcon'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, X, Send, Gamepad2, Heart, MessageSquare } from 'lucide-react'

// Types
type Story = {
    id: string
    display_name: string | null
    program: string | null
    title: string
    content: string
    created_at: string
}

export default function StoriesPage() {
    const [stories, setStories] = useState<Story[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [user, setUser] = useState<any>(null)

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        program: '',
        title: '',
        content: ''
    })

    useEffect(() => {
        fetchStories()
        checkUser()
    }, [])

    const checkUser = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        if (user) {
            const adminRole = user.user_metadata?.role === 'admin' || user.user_metadata?.is_admin === true
            setIsAdmin(adminRole)
        }
    }

    const fetchStories = async () => {
        const supabase = createClient()
        // Fetch approved stories
        const { data, error } = await supabase
            .from('stories')
            .select('*')
            .eq('is_approved', true) // Only approved
            .order('created_at', { ascending: false })

        if (data) setStories(data)
        setLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setIsSubmitting(true)
        const supabase = createClient()

        const { error } = await supabase.from('stories').insert({
            user_id: user.id,
            display_name: formData.name || 'Anonymous',
            program: formData.program,
            title: formData.title,
            content: formData.content,
            is_anonymous: !formData.name,
            is_approved: true // Auto-approve for now
        })

        setIsSubmitting(false)

        if (!error) {
            setIsModalOpen(false)
            setFormData({ name: '', program: '', title: '', content: '' })
            fetchStories() // Refresh list
        } else {
            alert('Failed to submit story: ' + error.message)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    return (
        <main className="min-h-screen bg-[var(--retro-cream)] relative overflow-x-hidden flex flex-col">
            <Navbar />

            <div className="flex-1">
                {/* Stats Section with Yellow Background */}
                <section className="pt-32 pb-16 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-[#FFD700] p-4 md:p-6 border-4 border-[#1E3A8A] shadow-[8px_8px_0_#1E3A8A] relative">
                            {/* Decorative Corners */}
                            <div className="absolute top-2 left-2 w-4 h-4 bg-[#FFA500] border border-[#1E3A8A]" />
                            <div className="absolute bottom-2 right-2 w-4 h-4 bg-[#98FB98] border border-[#1E3A8A]" />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                {/* Stat 1 */}
                                <div className="bg-white border-4 border-[#1E3A8A] p-6 lg:p-8 text-center shadow-[4px_4px_0_rgba(0,0,0,0.1)]">
                                    <h3 className="pixel-font text-3xl md:text-5xl text-[#FFB7B2] mb-2 tracking-tight drop-shadow-sm">98%</h3>
                                    <p className="font-[family-name:var(--font-press-start)] text-[10px] uppercase tracking-widest text-[#1E3A8A]">Satisfaction</p>
                                </div>
                                {/* Stat 2 */}
                                <div className="bg-white border-4 border-[#1E3A8A] p-6 lg:p-8 text-center shadow-[4px_4px_0_rgba(0,0,0,0.1)]">
                                    <h3 className="pixel-font text-3xl md:text-5xl text-[#89CFF0] mb-2 tracking-tight drop-shadow-sm">500+</h3>
                                    <p className="font-[family-name:var(--font-press-start)] text-[10px] uppercase tracking-widest text-[#1E3A8A]">Matches Made</p>
                                </div>
                                {/* Stat 3 */}
                                <div className="bg-white border-4 border-[#1E3A8A] p-6 lg:p-8 text-center shadow-[4px_4px_0_rgba(0,0,0,0.1)]">
                                    <h3 className="pixel-font text-3xl md:text-5xl text-[#E1CEF5] mb-2 tracking-tight drop-shadow-sm">50+</h3>
                                    <p className="font-[family-name:var(--font-press-start)] text-[10px] uppercase tracking-widest text-[#1E3A8A]">Success Stories</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-[#1E3A8A] animate-spin mb-4" />
                        <p className="font-[family-name:var(--font-press-start)] text-[10px] text-[#1E3A8A]">LOADING TALES...</p>
                    </div>
                )}


                {/* Stories Grid (If there are stories) */}
                {!loading && stories.length > 0 && (
                    <section className="max-w-6xl mx-auto px-4 pb-20">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {stories.map(story => (
                                <div key={story.id} className="relative bg-white border-4 border-[#1E3A8A] p-6 shadow-[8px_8px_0_#1E3A8A] hover:translate-y-[-2px] transition-transform">
                                    <div className="float-right text-[#FFD700]">
                                        <div className="flex gap-1">
                                            <PixelIcon name="star" size={12} />
                                            <PixelIcon name="star" size={12} />
                                            <PixelIcon name="star" size={12} />
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-[#1E3A8A] mb-2 font-[family-name:var(--font-vt323)] text-xl">
                                        {story.title}
                                    </h4>
                                    <p className="text-[#4B5563] text-sm mb-4 leading-relaxed font-medium">
                                        "{story.content}"
                                    </p>
                                    <div className="flex items-center gap-2 border-t-2 border-gray-100 pt-3">
                                        <div className="w-8 h-8 bg-[#E1F5FE] rounded-full border-2 border-[#1E3A8A] flex items-center justify-center">
                                            <PixelIcon name="smiley" size={16} />
                                        </div>
                                        <div>
                                            <p className="font-[family-name:var(--font-press-start)] text-[8px] text-[#1E3A8A]">{story.display_name}</p>
                                            <p className="text-[10px] text-gray-500 font-bold">{story.program}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {!loading && stories.length === 0 && (
                    <div className="text-center py-10">
                        {/* No stories yet message can go here if distinct from loading */}
                    </div>
                )}

                {/* Share Your Tale CTA Section */}
                <section className="pb-32 px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-[#E0B0FF] p-8 md:p-12 border-4 border-[#1E3A8A] shadow-[8px_8px_0_#1E3A8A] relative overflow-hidden text-center">
                            {/* Grid Background */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none"
                                style={{
                                    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                                    backgroundSize: '20px 20px'
                                }}>
                            </div>

                            {/* Pixel Corners */}
                            <div className="absolute top-0 left-0 w-8 h-8 bg-[#FFA500] border-r-4 border-b-4 border-[#1E3A8A]" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 bg-[#FFD700] border-r-4 border-t-4 border-[#1E3A8A]" />
                            <div className="absolute top-0 right-0 w-8 h-8 bg-[#FF69B4] border-l-4 border-b-4 border-[#1E3A8A]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }} /> {/* Heart-ish shape placeholder? No just square */}
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#98FB98] border-l-4 border-t-4 border-[#1E3A8A]" />

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="mb-4 text-[#FFD700] drop-shadow-[2px_2px_0_#1E3A8A]">
                                    <Gamepad2 size={48} strokeWidth={2.5} />
                                </div>

                                <h2 className="font-[family-name:var(--font-press-start)] text-lg md:text-xl text-white mb-2 tracking-wide drop-shadow-[2px_2px_0_#0000000]">
                                    ▶ SHARE YOUR TALE! ◀
                                </h2>

                                <p className="text-white font-[family-name:var(--font-vt323)] text-xl md:text-2xl mb-8 max-w-md drop-shadow-md">
                                    Did you find love or friendship through Wizard Match? We want to hear about it!
                                </p>

                                <button
                                    onClick={() => user ? setIsModalOpen(true) : alert("Please login to share your story!")}
                                    className="bg-white text-[#1E3A8A] border-4 border-[#1E3A8A] px-6 py-3 font-[family-name:var(--font-press-start)] text-[10px] md:text-xs hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0_rgba(0,0,0,0.2)] transition-all flex items-center gap-3"
                                >
                                    <MessageSquare size={14} />
                                    <span>SUBMIT YOUR STORY</span>
                                    <Heart size={14} className="text-[#FF69B4] fill-current" />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <Footer />

            {/* Submission Modal - Notebook Style */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#1E3A8A]/80 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-[#FFFBEB] border-4 border-[#1E3A8A] shadow-[12px_12px_0_rgba(0,0,0,0.5)] z-10 overflow-hidden"
                        >
                            {/* Blue Header Bar */}
                            {/* Notebook Grid Background */}
                            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                                style={{
                                    backgroundImage: `linear-gradient(#b0b0b0 1px, transparent 1px), linear-gradient(90deg, #b0b0b0 1px, transparent 1px)`,
                                    backgroundSize: '20px 20px',
                                    marginTop: '40px'
                                }}
                            ></div>

                            <div className="absolute top-0 right-0 p-2 z-20">
                                <button onClick={() => setIsModalOpen(false)} className="text-[#1E3A8A] hover:bg-red-100 p-1 rounded">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 relative z-10">
                                <div className="flex items-center gap-2 mb-6">
                                    <PixelIcon name="bubble" size={24} className="text-red-500" />
                                    <h2 className="font-[family-name:var(--font-press-start)] text-sm text-[#1E3A8A] uppercase">
                                        SHARE YOUR STORY
                                    </h2>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-[#1E3A8A] uppercase mb-2">
                                            YOUR NAME (OR ANONYMOUS) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Enter your name"
                                            className="w-full p-3 border-2 border-[#1E3A8A] font-[family-name:var(--font-vt323)] text-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-[#1E3A8A] uppercase mb-2">
                                            PROGRAM
                                        </label>
                                        <input
                                            type="text"
                                            name="program"
                                            value={formData.program}
                                            onChange={handleInputChange}
                                            placeholder="Your program"
                                            className="w-full p-3 border-2 border-[#1E3A8A] font-[family-name:var(--font-vt323)] text-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-[#1E3A8A] uppercase mb-2">
                                            STORY TITLE <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Matched on values!"
                                            required
                                            className="w-full p-3 border-2 border-[#1E3A8A] font-[family-name:var(--font-vt323)] text-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-[family-name:var(--font-press-start)] text-[8px] text-[#1E3A8A] uppercase mb-2">
                                            YOUR STORY <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            name="content"
                                            value={formData.content}
                                            onChange={handleInputChange}
                                            placeholder="Tell us about your Wizard Match experience..."
                                            required
                                            rows={4}
                                            className="w-full p-3 border-2 border-[#1E3A8A] font-[family-name:var(--font-vt323)] text-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD700] resize-none"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="bg-[#FFD700] border-2 border-[#1E3A8A] flex-1 py-3 font-[family-name:var(--font-press-start)] text-[10px] text-[#1E3A8A] hover:bg-[#ffed4a] shadow-[4px_4px_0_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none transition-all"
                                        >
                                            {isSubmitting ? (
                                                <Loader2 className="animate-spin w-4 h-4 mx-auto" />
                                            ) : 'SUBMIT STORY'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="bg-white border-2 border-[#1E3A8A] flex-1 py-3 font-[family-name:var(--font-press-start)] text-[10px] text-[#1E3A8A] hover:bg-gray-50 shadow-[4px_4px_0_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none transition-all"
                                        >
                                            CANCEL
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    )
}
