import { PixelIcon, PixelIconName } from '@/components/ui/PixelIcon'

export function HowItWorks() {
  const steps = [
    {
      step: '1',
      title: 'Sign Up with Google',
      description: 'Use your Mapua student email to create your account. Quick and secure authentication.',
      icon: 'lock' as PixelIconName,
      dates: 'Starting Feb 5',
      color: '#FF6B9D'
    },
    {
      step: '2',
      title: 'Complete the Survey',
      description: 'Answer fun questions about your personality, interests, values, and lifestyle. Takes ~15 minutes.',
      icon: 'envelope' as PixelIconName, // Using envelope for survey/letter
      dates: 'Feb 5-10',
      color: '#00D4FF'
    },
    {
      step: '3',
      title: 'Submit Your Crush List',
      description: 'Anonymously list up to 5 people you\'re interested in. Mutual crushes get bonus points!',
      icon: 'heart_solid' as PixelIconName,
      dates: 'Feb 5-10',
      color: '#9B59B6'
    },
    {
      step: '4',
      title: 'Wait for Magic',
      description: 'Our algorithm runs overnight, analyzing compatibility using advanced matching techniques.',
      icon: 'sparkle' as PixelIconName,
      dates: 'Feb 10-11',
      color: '#FF8E53'
    },
    {
      step: '5',
      title: 'Update Your Profile',
      description: 'Add photos, bio, and social links. Start chatting with your matches early!',
      icon: 'palette' as PixelIconName,
      dates: 'Feb 11-13',
      color: '#00D4FF'
    },
    {
      step: '6',
      title: 'Meet Your Matches',
      description: 'On Valentine\'s Day, discover your top 7 most compatible matches at Mapua!',
      icon: 'target' as PixelIconName,
      dates: 'Feb 14',
      color: '#FF6B9D'
    }
  ]

  return (
    <section className="py-16 px-4" style={{
      background: 'linear-gradient(180deg, #FFFFFF 0%, #E8F5FF 50%, #F0F8FF 100%)'
    }}>
      <div className="pixel-container">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-3xl pixel-float">
              <PixelIcon name="star" size={32} />
            </span>
            <h2 className="pixel-text-shadow gradient-text-animated pixel-font-heading text-3xl md:text-5xl font-bold">
              How It Works
            </h2>
            <span className="text-3xl pixel-float" style={{ animationDelay: '0.5s' }}>
              <PixelIcon name="star" size={32} />
            </span>
          </div>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="pixel-divider flex-1 max-w-32" style={{ height: '4px', margin: '0' }}></div>
            <span className="text-xl">▶</span>
            <div className="pixel-divider flex-1 max-w-32" style={{ height: '4px', margin: '0' }}></div>
          </div>
          <p className="pixel-font-body text-lg" style={{ color: '#34495E', maxWidth: '500px', margin: '0 auto' }}>
            Six simple steps to find your perfect match ✨
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Step Number Badge */}
              <div
                className="absolute -top-3 -left-3 w-12 h-12 flex items-center justify-center text-white pixel-border-double z-20 pixel-font-heading text-sm"
                style={{
                  background: `linear-gradient(180deg, ${step.color} 0%, ${step.color}CC 100%)`,
                  boxShadow: `4px 4px 0 #2C3E50, 0 0 15px ${step.color}40`
                }}
              >
                {step.step}
              </div>

              {/* Step Card */}
              <div className="pixel-card h-full pt-6 hover-lift pixel-shine-effect" style={{
                background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FCFF 100%)'
              }}>
                {/* Icon */}
                <div className="mb-4 pixel-bounce" style={{ animationDelay: `${index * 0.15}s` }}>
                  <PixelIcon name={step.icon} size={48} />
                </div>

                {/* Date Badge */}
                <div className="pixel-badge mb-3" style={{ fontSize: '8px' }}>
                  {step.dates}
                </div>

                {/* Title */}
                <h3 className="pixel-font-heading text-sm font-bold mb-2" style={{ color: step.color }}>
                  {step.title}
                </h3>

                {/* Description */}
                <p className="pixel-font-body text-sm leading-relaxed" style={{ color: '#34495E' }}>
                  {step.description}
                </p>

                {/* Arrow indicator for desktop */}
                {index < steps.length - 1 && index !== 2 && (
                  <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-20">
                    <div className="text-2xl" style={{ color: '#5BB5E3' }}>→</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Visualization - Pixel Concept Style */}
        <div className="pixel-card hover-lift" style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F0F8FF 100%)'
        }}>
          <div className="flex items-center justify-center gap-3 mb-6">
            <PixelIcon name="star" size={24} />
            <h3 className="pixel-font-heading text-xl md:text-2xl font-bold" style={{ color: '#FF6B9D' }}>
              Important Dates
            </h3>
            <PixelIcon name="star" size={24} />
          </div>

          <div className="space-y-4">
            {/* Feb 5 */}
            <TimelineRow
              date="Feb 5"
              label="Survey Opens"
              color="#FF6B9D"
              progress={100}
            />

            {/* Feb 10 */}
            <TimelineRow
              date="Feb 10"
              label="Survey Closes (11:59 PM)"
              color="#00D4FF"
              progress={100}
            />

            {/* Feb 11 */}
            <TimelineRow
              date="Feb 11"
              label="Profile Updates & Messaging Begin"
              color="#9B59B6"
              progress={100}
            />

            {/* Feb 14 */}
            <TimelineRow
              date="Feb 14"
              label="Match Reveal!"
              color="#FF6B9D"
              progress={100}
              highlight
              icon="heart_solid"
            />
          </div>

          {/* Decorative bottom bar */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="text-lg opacity-50">⋆</span>
            <div className="pixel-divider flex-1 max-w-64 opacity-40" style={{ height: '3px', margin: '0' }}></div>
            <span className="text-lg opacity-50">⋆</span>
          </div>
        </div>

        {/* Cute pixel characters at bottom */}
        <div className="flex justify-center items-center gap-8 mt-8">
          <div className="pixel-bounce" style={{ animationDelay: '0s' }}>
            <PixelIcon name="chick" size={48} />
          </div>
          <div className="pixel-float" style={{ animationDelay: '0.2s' }}>
            <PixelIcon name="heart_solid" size={32} />
          </div>
          <div className="pixel-bounce" style={{ animationDelay: '0.4s' }}>
            <PixelIcon name="chick" size={40} />
          </div>
        </div>
      </div>
    </section>
  )
}


// Timeline Row Component
function TimelineRow({
  date,
  label,
  color,
  progress,
  highlight = false,
  icon
}: {
  date: string
  label: string
  color: string
  progress: number
  highlight?: boolean
  icon?: PixelIconName
}) {
  return (
    <div className={`flex items-center gap-4 ${highlight ? 'scale-[1.02]' : ''}`}>
      <div className="w-24 md:w-28 text-right flex-shrink-0">
        <span
          className="pixel-font-heading text-xs font-bold"
          style={{ color }}
        >
          {date}
        </span>
      </div>
      <div className="flex-1 h-7 pixel-progress-container">
        <div
          className="pixel-progress-bar h-full"
          style={{
            width: `${progress}%`,
            background: `repeating-linear-gradient(90deg, ${color}, ${color} 6px, ${color}AA 6px, ${color}AA 12px)`
          }}
        />
      </div>
      <div className="flex-1 flex-shrink-0 flex items-center gap-2">
        <span className={`pixel-font-body text-sm ${highlight ? 'font-bold' : ''}`} style={{ color: '#34495E' }}>
          {label}
        </span>
        {icon && <PixelIcon name={icon} size={20} />}
      </div>
    </div>
  )
}
