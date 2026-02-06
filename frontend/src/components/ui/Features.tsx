// ============================================
// FEATURES SECTION - PIXEL CONCEPT DESIGN
// High quality icons from Nano Banana Pro
// ============================================

import Link from 'next/link'
import { PixelIcon, PixelIconName } from '@/components/ui/PixelIcon'

export function Features() {
  const features = [
    {
      title: 'Magical Algorithm',
      description: 'Our Love Witch crafted a special potion analyzing 30+ questions across 5 categories.',
      icon: 'wand' as PixelIconName,
      bg: 'bg-[#FFB7B2]', // Pink
      border: 'border-[#FFB7B2]',
      shadow: 'border-b-8 border-r-8 border-[#FF6B9D]' // Darker Pink shadow
    },
    {
      title: 'Values-Based',
      description: 'We match you based on what truly matters: values, lifestyle, personality, and quirks.',
      icon: 'heart_solid' as PixelIconName,
      bg: 'bg-[#89CFF0]', // Blue
      border: 'border-[#89CFF0]',
      shadow: 'border-b-8 border-r-8 border-[#1E3A8A]' // Navy shadow
    },
    {
      title: 'Success Stories',
      description: 'Countless Wizards have found meaningful connections through Wizard Match.',
      icon: 'trophy' as PixelIconName,
      bg: 'bg-[#E1CEF5]', // Purple
      border: 'border-[#E1CEF5]',
      shadow: 'border-b-8 border-r-8 border-[#9B59B6]' // Dark Purple shadow
    },
    {
      title: 'Privacy First',
      description: 'Your information is enchanted with powerful protection. You control what you share.',
      icon: 'lock' as PixelIconName,
      bg: 'bg-[#98FB98]', // Green
      border: 'border-[#98FB98]',
      shadow: 'border-b-8 border-r-8 border-[#2E8B57]' // Dark Green shadow
    },
    {
      title: 'Verified Community',
      description: 'Verified accounts. Our Love Witch ensures authenticity.',
      icon: 'smiley' as PixelIconName,
      bg: 'bg-[#FFD700]', // Yellow
      border: 'border-[#FFD700]',
      shadow: 'border-b-8 border-r-8 border-[#B8860B]' // Dark Gold shadow
    },
    {
      title: 'Instant Results',
      description: 'On February 5th, instantly see your compatibility scores and shared interests!',
      icon: 'star' as PixelIconName,
      bg: 'bg-[#7FFFD4]', // Aquamarine
      border: 'border-[#7FFFD4]',
      shadow: 'border-b-8 border-r-8 border-[#20B2AA]' // Dark Teal shadow
    }
  ]

  return (
    <section className="py-20 px-4 relative bg-[#FFFBEB]">
      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#FFD700 1px, transparent 1px), linear-gradient(90deg, #FFD700 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Badge */}
        <div className="flex justify-center mb-8">
          <div className="bg-[var(--retro-yellow)] border-4 border-[var(--retro-navy)] px-6 py-2 shadow-[4px_4px_0_var(--retro-navy)] flex items-center gap-2 transform -rotate-1">
            <PixelIcon name="star" size={20} className="hidden" /> {/* Fallback if needed */}
            <span className="text-[var(--retro-navy)] font-bold text-xs uppercase tracking-widest font-[family-name:var(--font-press-start)]">
              ⚡ Power-Ups & Features ⚡
            </span>
          </div>
        </div>

        {/* Main Title */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-[var(--retro-navy)] mb-6 leading-tight">
            Why Choose Our <span className="text-[var(--retro-red)]">Love Witch?</span>
          </h2>
          <p className="text-[#4B5563] text-lg font-medium leading-relaxed">
            Wizard Match uses a smart compatibility algorithm. Last year, we matched
            <span className="mx-2 bg-[var(--retro-pink)] text-white px-2 py-0.5 rounded-sm transform rotate-2 inline-block font-bold">
              500+
            </span>
            Wizards!
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`
                relative p-1 bg-white border-2 border-[var(--retro-navy)]
                shadow-[8px_8px_0_var(--retro-navy)]
                hover:translate-y-[-4px] hover:shadow-[12px_12px_0_var(--retro-navy)]
                transition-all duration-300
              `}
            >
              {/* Inner Color Card */}
              <div className={`h-full p-6 ${feature.bg} bg-opacity-40 border-2 border-transparent relative overflow-hidden`}>

                {/* Tiny corner square */}
                <div className="absolute top-2 right-2 w-3 h-3 border border-[var(--retro-navy)] bg-white" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border border-[var(--retro-navy)] bg-white" />

                <div className="mb-6 bg-white w-16 h-16 flex items-center justify-center border-2 border-[var(--retro-navy)] shadow-[4px_4px_0_rgba(0,0,0,0.1)]">
                  <PixelIcon name={feature.icon} size={32} />
                </div>

                <h3 className="font-[family-name:var(--font-press-start)] text-xs text-[var(--retro-navy)] mb-4 uppercase tracking-wider leading-relaxed">
                  {feature.title}
                </h3>

                <p className="font-[family-name:var(--font-vt323)] text-lg text-[var(--retro-navy)] leading-tight opacity-90">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
