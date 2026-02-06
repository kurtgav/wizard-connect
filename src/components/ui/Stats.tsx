// ============================================
// STATS COMPONENT - PIXEL CONCEPT DESIGN
// Retro Gameboy Dashboard with Pixel Icons
// ============================================

import Image from 'next/image'
import { PixelIcon, PixelIconName } from '@/components/ui/PixelIcon'

export function Stats() {
    const stats: { label: string; value: string; color: string; icon: PixelIconName }[] = [
        { label: 'Success Rate', value: '98%', color: '#FF6B9D', icon: 'heart' as any }, // We used 'potion' elsewhere, let's use 'potion' here effectively
        { label: 'Active Wizards', value: '780+', color: '#00D4FF', icon: 'cap' },
        { label: 'Daily Matches', value: '60+', color: '#9B59B6', icon: 'potion' },
        { label: 'Messages Sent', value: '2M+', color: '#2ECC71', icon: 'bubble' }
    ]
    // Note: 'heart' isn't in PixelIconName yet, I used 'target', 'envelope', 'lock', 'bubble', 'cap', 'palette', 'star', 'potion'.
    // I will use 'star' or 'target' for Success Rate. 'target' implies accuracy.

    const refinedStats: { label: string; value: string; color: string; icon: PixelIconName }[] = [
        { label: 'Success Rate', value: '98%', color: '#FF6B9D', icon: 'target' },
        { label: 'Active Wizards', value: '780+', color: '#00D4FF', icon: 'cap' },
        { label: 'Daily Matches', value: '60+', color: '#9B59B6', icon: 'potion' },
        { label: 'Messages Sent', value: '2M+', color: '#2ECC71', icon: 'bubble' }
    ]

    return (
        <section id="stats" className="py-20 px-4 bg-white relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'linear-gradient(#2C3E50 1px, transparent 1px), linear-gradient(90deg, #2C3E50 1px, transparent 1px)',
                backgroundSize: '20px 20px'
            }} />

            <div className="pixel-container max-w-6xl mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-12">

                {/* Left: Text & Data */}
                <div className="flex-1 text-center lg:text-left">
                    <h2 className="pixel-font-heading text-3xl md:text-5xl font-bold mb-6 text-[#2C3E50]">
                        LEVEL UP YOUR <br />
                        <span className="text-[#9B59B6]">DATING LIFE</span>
                    </h2>
                    <p className="pixel-font-body text-lg text-gray-600 mb-8 max-w-md mx-auto lg:mx-0">
                        Join the leaderboard of love. Our stats don't lie—Mapua students are finding their player 2 every day.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        {refinedStats.map((stat, index) => (
                            <div key={index} className="bg-[#F8F9FA] border-2 border-[#2C3E50] p-4 shadow-[4px_4px_0_#2C3E50] transform hover:-translate-y-1 transition-transform flex flex-col items-center lg:items-start group">
                                <div className="mb-2 transition-transform group-hover:scale-110">
                                    <PixelIcon name={stat.icon} size={32} />
                                </div>
                                <div className="pixel-font-heading text-2xl font-bold mb-1" style={{ color: stat.color }}>
                                    {stat.value}
                                </div>
                                <div className="pixel-font-body text-xs text-[#2C3E50] uppercase">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Giant Gameboy Illustration */}
                <div className="flex-1 relative w-full flex justify-center">
                    <div className="relative w-[300px] h-[500px] md:w-[350px] md:h-[580px] animate-float">
                        <Image
                            src="/images/retro-gameboy.png"
                            alt="Retro Gameboy Stats"
                            fill
                            className="object-contain drop-shadow-xl"
                        />
                        {/* Overlay Content on Gameboy Screen */}
                        <div className="absolute top-[18%] left-[13%] right-[13%] h-[24%] flex flex-col items-center justify-center text-center">
                            <div className="font-mono text-[#0F380F] font-bold text-lg animate-pulse">
                                POINT UP!
                            </div>
                            <div className="flex mt-2 gap-2">
                                <PixelIcon name="star" size={16} className="opacity-60" />
                                <PixelIcon name="star" size={16} className="opacity-60" />
                                <PixelIcon name="star" size={16} className="opacity-60" />
                            </div>
                            <div className="font-mono text-[#0F380F] text-xs mt-2">
                                HIGH SCORE: 99999
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
}
