import { PixelIcon, PixelIconName } from '@/components/ui/PixelIcon'

export function HowItWorks() {
  const steps = [
    {
      step: '1',
      title: 'Sign Up with Google',
      description: 'Use your Mapua student email to create your account. Quick and secure authentication.',
      icon: 'lock' as PixelIconName,
      dates: 'Starting Feb 5',
      color: '#FF6B9D', // Pink
      bg: 'bg-[#FFF0F5]'
    },
    {
      step: '2',
      title: 'Complete the Survey',
      description: 'Answer fun questions about your personality, interests, values, and lifestyle. Takes ~15 minutes.',
      icon: 'envelope' as PixelIconName,
      dates: 'Feb 5-10',
      color: '#00D4FF', // Blue
      bg: 'bg-[#E1F5FE]'
    },
    {
      step: '3',
      title: 'Submit Your Crush List',
      description: 'Anonymously list up to 5 people you\'re interested in. Mutual crushes get bonus points!',
      icon: 'heart_solid' as PixelIconName,
      dates: 'Feb 5-10',
      color: '#9B59B6', // Purple
      bg: 'bg-[#F3E5F5]'
    },
    {
      step: '4',
      title: 'Wait for Magic',
      description: 'Our algorithm runs overnight, analyzing compatibility using advanced matching techniques.',
      icon: 'sparkle' as PixelIconName,
      dates: 'Feb 10-11',
      color: '#FF8E53', // Orange
      bg: 'bg-[#FFF3E0]'
    },
    {
      step: '5',
      title: 'Update Your Profile',
      description: 'Add photos, bio, and social links. Start chatting with your matches early!',
      icon: 'palette' as PixelIconName,
      dates: 'Feb 11-13',
      color: '#00D4FF', // Blue
      bg: 'bg-[#E1F5FE]'
    },
    {
      step: '6',
      title: 'Meet Your Matches',
      description: 'On Valentine\'s Day, discover your top 7 most compatible matches at Mapua!',
      icon: 'target' as PixelIconName,
      dates: 'Feb 14',
      color: '#FF6B9D', // Pink
      bg: 'bg-[#FFF0F5]'
    }
  ]

  return (
    <section className="py-20 px-4 bg-[#FFFBEB] relative">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#2C3E50 1px, transparent 1px), linear-gradient(90deg, #2C3E50 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <PixelIcon name="star" size={32} className="animate-bounce" />
            <h2 className="text-4xl md:text-5xl font-black text-[var(--retro-navy)] drop-shadow-md">
              How It Works
            </h2>
            <PixelIcon name="star" size={32} className="animate-bounce delay-100" />
          </div>

          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-20 h-1 bg-[var(--retro-navy)]" />
            <div className="w-2 h-2 rotate-45 bg-[var(--retro-yellow)] border-2 border-[var(--retro-navy)]" />
            <div className="w-20 h-1 bg-[var(--retro-navy)]" />
          </div>

          <p className="font-[family-name:var(--font-vt323)] text-2xl text-gray-600">
            Six simple steps to find your perfect match ✨
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Card Container */}
              <div className="bg-white border-4 border-[var(--retro-navy)] shadow-[8px_8px_0_var(--retro-navy)] p-6 h-full relative hover:translate-y-[-4px] hover:shadow-[12px_12px_0_var(--retro-navy)] transition-all duration-300">

                {/* Number Badge (Top Left) - Hanging off the corner style */}
                <div
                  className="absolute -top-4 -left-4 w-10 h-10 flex items-center justify-center font-[family-name:var(--font-press-start)] text-white text-sm border-4 border-[var(--retro-navy)] shadow-[4px_4px_0_rgba(0,0,0,0.2)]"
                  style={{ backgroundColor: step.color }}
                >
                  {step.step}
                </div>

                {/* Tiny corner squares decoration */}
                <div className="absolute top-2 right-2 w-3 h-3 border border-[var(--retro-navy)] bg-white" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border border-[var(--retro-navy)] bg-white" />


                <div className="mt-4 flex flex-col items-start h-full">
                  {/* Icon */}
                  <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    <PixelIcon name={step.icon} size={48} />
                  </div>

                  {/* Date Pill */}
                  <div className="bg-[#4A90E2] border-2 border-[var(--retro-navy)] text-white px-3 py-1 mb-4 font-[family-name:var(--font-press-start)] text-[10px] shadow-[2px_2px_0_var(--retro-navy)]">
                    {step.dates}
                  </div>

                  {/* Title */}
                  <h3 className="font-[family-name:var(--font-press-start)] text-sm font-bold text-[var(--retro-navy)] mb-3 leading-relaxed" style={{ color: step.color }}>
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="font-[family-name:var(--font-vt323)] text-xl text-gray-600 leading-tight">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Helper removed as timeline is removed

