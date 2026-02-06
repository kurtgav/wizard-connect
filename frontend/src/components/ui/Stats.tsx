import Image from 'next/image'
import { PixelIcon, PixelIconName } from '@/components/ui/PixelIcon'

export function Stats() {
    const stats = [
        {
            label: 'SUCCESS RATE',
            value: '98%',
            color: 'text-[#FF6B9D]',
            bg: 'bg-[#FFF0F5]',
            icon: 'target' as PixelIconName,
            borderColor: 'border-[#FF6B9D]'
        },
        {
            label: 'ACTIVE WIZARDS',
            value: '780+',
            color: 'text-[#00D4FF]',
            bg: 'bg-[#E0F7FA]',
            icon: 'cap' as PixelIconName,
            borderColor: 'border-[#00D4FF]'
        },
        {
            label: 'DAILY MATCHES',
            value: '60+',
            color: 'text-[#9B59B6]',
            bg: 'bg-[#F3E5F5]',
            icon: 'potion' as PixelIconName,
            borderColor: 'border-[#9B59B6]'
        },
        {
            label: 'MESSAGES SENT',
            value: '2M+',
            color: 'text-[#2ECC71]',
            bg: 'bg-[#E8F5E9]',
            icon: 'bubble' as PixelIconName,
            borderColor: 'border-[#2ECC71]'
        }
    ]

    return (
        <section id="stats" className="py-20 px-4 bg-white relative overflow-hidden">
            {/* Background Grid */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(#2C3E50 1px, transparent 1px), linear-gradient(90deg, #2C3E50 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-16">

                {/* Left: Text & Data */}
                <div className="flex-1 text-center lg:text-left w-full">
                    <h2 className="text-4xl md:text-6xl font-black text-[var(--retro-navy)] mb-6 leading-none tracking-tight">
                        LEVEL UP YOUR <br />
                        <span className="text-[#9B59B6]">DATING LIFE</span>
                    </h2>
                    <p className="font-[family-name:var(--font-vt323)] text-xl md:text-2xl text-gray-600 mb-12 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                        Join the leaderboard of love. Our stats don't lie—Mapua students are finding their player 2 every day.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="relative bg-white border-4 border-[var(--retro-navy)] p-6 shadow-[8px_8px_0_var(--retro-navy)] hover:translate-y-[-4px] transition-all duration-300 group"
                            >
                                {/* Tiny corner squares */}
                                <div className="absolute top-2 right-2 w-3 h-3 border border-[var(--retro-navy)] bg-white z-10" />
                                <div className="absolute bottom-2 left-2 w-3 h-3 border border-[var(--retro-navy)] bg-white z-10" />

                                {/* Inner Content */}
                                <div className={`flex flex-col items-start h-full relative overflow-hidden ${stat.bg} bg-opacity-30 p-4 -m-2`}>
                                    <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                                        <PixelIcon name={stat.icon} size={40} />
                                    </div>
                                    <div className={`font-[family-name:var(--font-press-start)] text-2xl md:text-3xl mb-2 ${stat.color}`}>
                                        {stat.value}
                                    </div>
                                    <div className="font-[family-name:var(--font-press-start)] text-[10px] md:text-xs text-[var(--retro-navy)] uppercase tracking-widest">
                                        {stat.label}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Giant Gameboy Illustration */}
                <div className="flex-1 relative w-full flex justify-center items-center">
                    <div className="relative w-full max-w-[500px] aspect-[4/3] bg-[#C0C0C0] border-4 border-[var(--retro-navy)] shadow-[12px_12px_0_var(--retro-navy)] p-2">
                        {/* Winamp Window Style Header */}
                        <div className="bg-[var(--retro-navy)] h-8 mb-2 flex items-center justify-between px-2">
                            <span className="font-[family-name:var(--font-press-start)] text-[10px] text-white">WINAMP.EXE</span>
                            <div className="flex gap-1">
                                <div className="w-3 h-3 bg-white border border-gray-400"></div>
                                <div className="w-3 h-3 bg-white border border-gray-400"></div>
                            </div>
                        </div>

                        {/* Content Area for GIF */}
                        <div className="relative w-full h-full min-h-[300px] border-4 border-gray-400 bg-black overflow-hidden flex items-center justify-center">
                            <Image
                                src="/images/music.gif"
                                alt="Retro Winamp Stats"
                                width={400}
                                height={300}
                                className="object-cover w-full h-full opacity-90"
                            />
                            {/* Scanlines overlay */}
                            <div className="absolute inset-0 bg-[url('/images/scanlines.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
