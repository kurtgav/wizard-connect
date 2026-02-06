import Image from 'next/image'
import { PixelIcon } from '@/components/ui/PixelIcon'

export function Welcome() {
    return (
        <section className="py-20 px-4 bg-[#E6E6FA] relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-10 left-10 opacity-20 pixel-float">
                <PixelIcon name="cloud" size={80} />
            </div>
            <div className="absolute bottom-10 right-10 opacity-20 pixel-float" style={{ animationDelay: '1s' }}>
                <PixelIcon name="cloud" size={100} />
            </div>
            <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-pink-300 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-blue-300 rounded-full blur-3xl opacity-30"></div>

            <div className="pixel-container max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

                {/* Left: Introduction Text */}
                <div className="text-left">
                    <div className="inline-block px-3 py-1 bg-[#FF6B9D] border-2 border-[#2C3E50] text-white pixel-font-heading text-xs mb-4 shadow-[4px_4px_0_#2C3E50]">
                        EST. 2026
                    </div>
                    <h2 className="pixel-font-heading text-4xl md:text-6xl font-bold mb-6 text-[#2C3E50] leading-tight">
                        WELCOME TO <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B9D] to-[#9B59B6]">
                            WIZARD CONNECT
                        </span>
                    </h2>
                    <p className="pixel-font-body text-lg text-[#2C3E50] leading-relaxed mb-8">
                        Are you tired of endless swiping?
                        <br /><br />
                        We bring the <strong className="bg-[#FFF0F5] px-1">magic back to dating</strong> at Mapua.
                        Using our advanced algorithm (and a little bit of pixel dust),
                        we calculate compatibility based on what truly matters:
                        your values, personality, and interests.
                    </p>
                    <div className="flex gap-4">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 border-2 border-[#2C3E50] rounded-full bg-gray-200" style={{ background: `hsl(${i * 60}, 70%, 80%)` }} />
                            ))}
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="pixel-font-heading font-bold text-sm text-[#2C3E50]">500+ Students</span>
                            <span className="pixel-font-body text-xs text-gray-500">Joined the waitlist</span>
                        </div>
                    </div>
                </div>

                {/* Right: Retro Window UI with Generated Image */}
                <div className="pixel-card bg-white p-0 overflow-hidden shadow-[12px_12px_0_rgba(44,62,80,0.2)] border-4 border-[#2C3E50] transform rotate-1 hover:rotate-0 transition-transform duration-300">
                    {/* Window Header */}
                    <div className="bg-[#2C3E50] p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-white pixel-font-heading text-xs flex items-center gap-2">
                                <PixelIcon name="heart_solid" size={14} /> connection.exe
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-3 h-3 bg-[#FF5F57] border border-black/20 rounded-sm"></div>
                            <div className="w-3 h-3 bg-[#FFBD2E] border border-black/20 rounded-sm"></div>
                            <div className="w-3 h-3 bg-[#28C840] border border-black/20 rounded-sm"></div>
                        </div>
                    </div>

                    {/* Window Content */}
                    <div className="bg-[#FAFAFA] relative w-full aspect-square">
                        <div className="absolute inset-0 p-4">
                            <div className="relative w-full h-full border-2 border-dashed border-[#2C3E50] bg-[#E8F5FF] overflow-hidden">
                                {/* The Generated Asset */}
                                <Image
                                    src="/images/welcome-computer.png"
                                    alt="Pixel Art Character at Computer"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>

                        {/* Overlay Terminal Text */}
                        <div className="absolute bottom-6 left-6 right-6 bg-[#2C3E50]/90 backdrop-blur-sm text-[#00FF00] font-mono text-xs p-3 rounded border-2 border-white/20 shadow-lg">
                            <p className="mb-1">{`> Initializing matchmaking protocol...`}</p>
                            <p className="mb-1">{`> Scanning Mapua database...`}</p>
                            <p className="mb-1 text-pink-300 flex items-center gap-2">
                                {`> MATCH FOUND! `} <PixelIcon name="heart_solid" size={12} />
                            </p>
                            <p className="animate-pulse">{`> Ready to pair. _`}</p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
}
