// ============================================
// FOOTER COMPONENT - PIXEL CONCEPT DESIGN
// Updated with Custom Logo & Premium Polish & Nano Banana Pro Assets
// ============================================

import Image from 'next/image'
import { PixelIcon } from '@/components/ui/PixelIcon'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative py-12 px-4 text-center overflow-hidden" style={{
      background: 'linear-gradient(180deg, #2C3E50 0%, #1A2530 50%, #151C22 100%)',
      color: '#FFFFFF'
    }}>
      {/* Pixel pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(90deg, #FFFFFF 1px, transparent 1px),
          linear-gradient(#FFFFFF 1px, transparent 1px)
        `,
        backgroundSize: '6px 6px'
      }} />

      {/* Stars in the background - Replaced with PixelIcon sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[15%] opacity-40 animate-pulse">
          <PixelIcon name="sparkle" size={24} />
        </div>
        <div className="absolute top-[20%] right-[20%] opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }}>
          <PixelIcon name="star" size={16} />
        </div>
        <div className="absolute top-[15%] left-[45%] opacity-35 animate-pulse" style={{ animationDelay: '1s' }}>
          <PixelIcon name="sparkle" size={20} />
        </div>
        <div className="absolute type-[8%] right-[35%] opacity-25 animate-pulse" style={{ animationDelay: '1.5s' }}>
          <PixelIcon name="star" size={12} />
        </div>
        <div className="absolute top-[25%] left-[70%] opacity-30 animate-pulse" style={{ animationDelay: '2s' }}>
          <PixelIcon name="sparkle" size={24} />
        </div>
      </div>

      <div className="pixel-container relative z-10 max-w-4xl mx-auto">
        {/* Main Footer Card */}
        <div className="pixel-card mb-8" style={{
          background: 'linear-gradient(180deg, #34495E 0%, #2C3E50 100%)',
          border: '4px solid #FF6B9D'
        }}>
          {/* Logo Section */}
          <div className="mb-6 flex flex-col items-center">
            <div className="relative w-16 h-16 mb-2 hover:scale-110 transition-transform duration-300">
              <Image
                src="/images/wizardconnect-logo.png"
                alt="Wizard Connect Logo"
                fill
                className="object-contain drop-shadow-[0_0_15px_rgba(255,107,157,0.5)]"
              />
            </div>
            <div className="flex items-center justify-center gap-3 mb-3">
              <h3 className="pixel-text-shadow-glow pixel-font-heading text-xl md:text-2xl font-bold" style={{ color: '#FF6B9D' }}>
                Wizard Connect
              </h3>
            </div>

            <div className="flex items-center justify-center gap-4 w-full">
              <div className="pixel-divider-pink flex-1 max-w-24 opacity-60" style={{ height: '3px', margin: '0' }}></div>
              <PixelIcon name="heart_solid" size={20} className="animate-pulse" />
              <div className="pixel-divider-pink flex-1 max-w-24 opacity-60" style={{ height: '3px', margin: '0' }}></div>
            </div>
          </div>

          <p className="pixel-font-body text-sm mb-6 max-w-lg mx-auto" style={{ color: '#B0C4DE' }}>
            Mapua Malayan Colleges Laguna's Official Valentine's Day Matchmaking Platform. <br />
            Start your love story with a pixel-perfect match.
          </p>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <FooterLink icon={<PixelIcon name="cap" size={16} />} label="About" />
            <FooterLink icon={<PixelIcon name="bubble" size={16} />} label="FAQ" />
            <FooterLink icon={<PixelIcon name="envelope" size={16} />} label="Contact" />
            <FooterLink icon={<PixelIcon name="lock" size={16} />} label="Privacy" />
            <FooterLink icon={<PixelIcon name="target" size={16} />} label="Terms" />
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-4 mb-2">
            <SocialLink platform="facebook" />
            <SocialLink platform="instagram" />
            <SocialLink platform="github" />
          </div>
        </div>

        {/* Divider with pixel decorations */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <PixelIcon name="chick" size={32} className="pixel-bounce opacity-80" />
          <div className="pixel-divider opacity-30 flex-1 max-w-48" style={{ height: '4px', margin: '0', background: '#FF6B9D' }}></div>
          <PixelIcon name="heart_solid" size={24} className="opacity-80" />
          <div className="pixel-divider opacity-30 flex-1 max-w-48" style={{ height: '4px', margin: '0', background: '#FF6B9D' }}></div>
          <PixelIcon name="chick" size={32} className="pixel-bounce opacity-80 scale-x-[-1]" />
        </div>

        {/* Copyright */}
        <div className="text-sm" style={{ color: '#7F8C8D' }}>
          <p className="pixel-font-body mb-2 flex items-center justify-center gap-2">
            Made with <PixelIcon name="heart_solid" size={12} /> for Mapua Cardinals
          </p>
          <p className="pixel-font-body text-xs opacity-70">
            © {currentYear} Wizard Connect. All rights reserved.
          </p>
        </div>
      </div>

      {/* City silhouette at bottom - Keeping SVG for crisp pixel edges on all screens */}
      <FooterCitySilhouette />
    </footer>
  )
}

// Footer Link Component
function FooterLink({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <a
      href="#"
      className="pixel-tag pixel-font-heading text-[10px] py-2 px-4 transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_rgba(0,0,0,0.2)] flex items-center gap-2"
      style={{
        background: '#2C3E50',
        color: '#FFFFFF',
        border: '2px solid #5BB5E3'
      }}
    >
      {icon} {label}
    </a>
  )
}

// Social Link Component - Keeping SVGs as they are standard brand icons (not emojis)
function SocialLink({ platform }: { platform: 'facebook' | 'instagram' | 'github' }) {
  const icons = {
    facebook: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.954 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    instagram: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    github: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.952-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    )
  }

  return (
    <a
      href="#"
      className="pixel-border-thin p-3 hover:scale-110 transition-transform bg-white/10 hover:bg-white/20 text-white"
    >
      {icons[platform]}
    </a>
  )
}

function FooterCitySilhouette() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none opacity-20">
      <svg
        viewBox="0 0 1200 60"
        className="absolute bottom-0 w-full h-full"
        preserveAspectRatio="xMidYMax slice"
        style={{ imageRendering: 'pixelated' }}
      >
        <g fill="#5B4B8A">
          <rect x="0" y="40" width="50" height="20" />
          <rect x="50" y="30" width="40" height="30" />
          <rect x="90" y="35" width="35" height="25" />
          <rect x="125" y="25" width="50" height="35" />
          <rect x="175" y="38" width="40" height="22" />
          <rect x="215" y="28" width="45" height="32" />
          <rect x="260" y="35" width="35" height="25" />
          <rect x="295" y="22" width="55" height="38" />
          <rect x="350" y="32" width="40" height="28" />
          <rect x="390" y="25" width="50" height="35" />
          <rect x="440" y="38" width="35" height="22" />
          <rect x="475" y="30" width="45" height="30" />
          <rect x="520" y="35" width="40" height="25" />
          <rect x="560" y="28" width="50" height="32" />
          <rect x="610" y="38" width="35" height="22" />
          <rect x="645" y="22" width="55" height="38" />
          <rect x="700" y="32" width="40" height="28" />
          <rect x="740" y="28" width="45" height="32" />
          <rect x="785" y="35" width="35" height="25" />
          <rect x="820" y="25" width="50" height="35" />
          <rect x="870" y="38" width="40" height="22" />
          <rect x="910" y="30" width="45" height="30" />
          <rect x="955" y="35" width="35" height="25" />
          <rect x="990" y="22" width="55" height="38" />
          <rect x="1045" y="32" width="40" height="28" />
          <rect x="1085" y="28" width="45" height="32" />
          <rect x="1130" y="38" width="70" height="22" />
        </g>
      </svg>
    </div>
  )
}
