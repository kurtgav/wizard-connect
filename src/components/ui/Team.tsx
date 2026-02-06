// ============================================
// TEAM COMPONENT - PIXEL CONCEPT DESIGN
// Meet the Cupids behind the magic
// ============================================

import Image from 'next/image'

export function Team() {
    const members = [
        {
            name: 'Kurt Gavin',
            role: 'Founder & Developer',
            program: 'BS Computer Science',
            image: '/images/kurt-founder.jpg',
            isSprite: true,
            color: '#00D4FF'
        },
        {
            name: 'Nicole Franchezka',
            role: 'SSC - President',
            program: 'BS Psychology',
            image: '/images/nicole-pres.jpg',
            isSprite: true,
            color: '#FF6B9D'
        },
        {
            name: 'Adrian Gabriel',
            role: 'Admin & Developer',
            program: 'BS Computer Science',
            image: '/images/adrian-developer.jpg',
            isSprite: true,
            color: '#9B59B6'
        }
    ]

    return (
        <section id="team" className="py-20 px-4 bg-[#F0F8FF] relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white to-transparent opacity-50"></div>

            <div className="pixel-container max-w-5xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-block px-4 py-2 border-4 border-[#2C3E50] bg-white mb-4 shadow-[4px_4px_0_#2C3E50]">
                        <span className="pixel-font-heading font-bold text-[#2C3E50]">THE CREATORS</span>
                    </div>
                    <h2 className="pixel-font-heading text-3xl md:text-5xl font-bold mb-4 text-[#2C3E50]">
                        MEET THE <span className="text-[#FF6B9D]">CUPIDS</span>
                    </h2>
                </div>

                {/* Tree Connection Line (Desktop) */}
                <div className="hidden md:block w-px h-12 bg-[#2C3E50] mx-auto mb-0"></div>
                <div className="hidden md:block w-2/3 h-px bg-[#2C3E50] mx-auto mb-12 relative">
                    <div className="absolute left-0 top-0 w-px h-8 bg-[#2C3E50] transform translate-y-0"></div>
                    <div className="absolute right-0 top-0 w-px h-8 bg-[#2C3E50] transform translate-y-0"></div>
                    <div className="absolute left-1/2 top-0 w-px h-8 bg-[#2C3E50] transform -translate-x-1/2"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                    {members.map((member, index) => (
                        <div key={index} className="relative group">
                            {/* Card */}
                            <div
                                className="bg-white border-4 border-[#2C3E50] p-6 text-center shadow-[8px_8px_0_#2C3E50] transition-transform hover:-translate-y-2 relative z-10"
                            >
                                {/* Avatar Box with Image */}
                                <div
                                    className="w-32 h-32 mx-auto mb-4 border-4 border-[#2C3E50] overflow-hidden bg-gray-100 relative"
                                    style={{ background: `${member.color}10` }}
                                >
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        fill
                                        className={`object-cover ${member.isSprite ? 'object-right' : 'grayscale group-hover:grayscale-0 transition-all duration-300'}`}
                                    // For the robot sprite, we cheat by using object-position if strictly needed, or just show the full sprite image if it looks okay
                                    // The generated sprite has 3 chars. We can try to frame just the robot or show the "Squad".
                                    // For simplicity and resilience, we'll show the image as is.
                                    />
                                </div>

                                <h3 className="pixel-font-heading font-bold text-lg mb-1" style={{ color: member.color }}>
                                    {member.name}
                                </h3>
                                <p className="pixel-font-body font-bold text-xs text-[#2C3E50] uppercase mb-2">
                                    {member.role}
                                </p>
                                <div className="w-full h-px bg-[#2C3E50]/20 my-3"></div>
                                <p className="pixel-font-body text-xs text-gray-500">
                                    {member.program}
                                </p>
                            </div>

                            {/* Decorative 'Connectors' for mobile/responsive feel */}
                            <div className="absolute -top-12 left-1/2 w-px h-12 bg-[#2C3E50] md:hidden"></div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
