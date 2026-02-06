// ============================================
// FEATURES SECTION - PIXEL CONCEPT DESIGN
// High quality icons from Nano Banana Pro
// ============================================

import Link from 'next/link'
import { PixelIcon, PixelIconName } from '@/components/ui/PixelIcon'

export function Features() {
  const features: {
    title: string;
    description: string;
    icon: PixelIconName;
    color: string;
    bg: string;
  }[] = [
      {
        title: 'Smart Matching',
        description: 'Our advanced algorithm considers personality, values, and interests.',
        icon: 'target',
        color: '#FF6B9D',
        bg: '#FFF0F5'
      },
      {
        title: 'Crush List',
        description: 'Secretly submit up to 5 crushes. Mutual matches get a boost!',
        icon: 'envelope',
        color: '#00D4FF',
        bg: '#E0F7FA'
      },
      {
        title: 'Privacy First',
        description: 'Your responses are confidential. Only matches see your profile.',
        icon: 'lock',
        color: '#9B59B6',
        bg: '#F3E5F5'
      },
      {
        title: 'Early Messaging',
        description: 'Get exclusive early access to message your matches.',
        icon: 'bubble',
        color: '#FF8E53',
        bg: '#FFF3E0'
      },
      {
        title: 'Mapua Exclusive',
        description: 'Exclusively for Mapua Malayan Colleges Laguna students.',
        icon: 'cap',
        color: '#00D4FF',
        bg: '#E1F5FE'
      },
      {
        title: 'Pixel Perfect UI',
        description: 'Beautiful 8-bit interface optimized for all devices.',
        icon: 'palette',
        color: '#FF6B9D',
        bg: '#FCE4EC'
      }
    ]

  return (
    <section className="py-20 px-4 bg-[#F8FCFF]">
      <div className="pixel-container max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="pixel-font-heading text-3xl md:text-5xl font-bold mb-4 text-[#2C3E50]">
            WHAT WE <span className="text-[#00D4FF]">DO</span>_?
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-[#FF6B9D]"></div>
            <div className="w-2 h-2 bg-[#9B59B6]"></div>
            <div className="w-2 h-2 bg-[#00D4FF]"></div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white border-4 border-[#2C3E50] p-6 shadow-[8px_8px_0_#2C3E50] hover:translate-y-[-4px] transition-all duration-200"
            >
              {/* Background color block */}
              <div
                className="absolute inset-0 opacity-20 transition-opacity group-hover:opacity-30"
                style={{ background: feature.bg }}
              />

              <div className="relative z-10 flex flex-col items-start h-full">
                {/* Pixel Icon Container */}
                <div className="mb-6 relative pixel-bounce p-2 bg-white border-2 border-[#2C3E50] rounded-lg shadow-sm" style={{ animationDelay: `${index * 0.1}s` }}>
                  <PixelIcon name={feature.icon} size={48} />
                </div>

                <h3 className="pixel-font-heading text-lg font-bold mb-3" style={{ color: feature.color }}>
                  {feature.title}
                </h3>

                <p className="pixel-font-body text-sm text-[#34495E] leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative arrow */}
                <div className="mt-auto pt-4 text-[#2C3E50] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  {`->`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
