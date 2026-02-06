// ============================================
// HERO SECTION - PIXEL CONCEPT HIGH END
// Recreating the reference style with CSS Art & Assets
// ============================================

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { PixelIcon } from '@/components/ui/PixelIcon'
import { motion } from 'framer-motion'

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#E6F3FF]">

      {/* 1. Dynamic Background Layers */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#E6F3FF] via-[#E6F3FF] to-[#FFD1DC]" />

      {/* City Skyline Background Layer */}
      <div className="absolute inset-0 z-5 pointer-events-none opacity-40">
        <Image
          src="/images/hero-bg-pixel.png"
          alt="Pixel City Skyline"
          fill
          className="object-cover object-center translate-y-20 grayscale brightness-110"
          priority
        />
      </div>

      {/* 2. Pixel Decorations Layer - Sticker Bomb Effect */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Large Decorative Stickers */}
        <motion.div
          className="absolute top-[15%] left-[5%] rotate-[-15deg]"
          animate={{ y: [0, -15, 0], rotate: [-15, -10, -15] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <PixelIcon name="star" size={120} className="opacity-20 translate-x-10" />
        </motion.div>

        <motion.div
          className="absolute top-[20%] right-[10%] rotate-[20deg]"
          animate={{ y: [0, -20, 0], rotate: [20, 25, 20] }}
          transition={{ duration: 6, repeat: Infinity, delay: 1, ease: "easeInOut" }}
        >
          <PixelIcon name="heart_solid" size={100} className="opacity-15 -translate-x-10" />
        </motion.div>

        <motion.div
          className="absolute bottom-[25%] left-[15%] rotate-[-5deg]"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 0.5, ease: "easeInOut" }}
        >
          <PixelIcon name="trophy" size={60} className="opacity-10 translate-y-10" />
        </motion.div>

        {/* Small scattered "stickers" */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{ opacity: 0.2, scale: 1 }}
            animate={{
              opacity: [0.2, 0.4, 0.2],
              y: [0, -12, 0],
            }}
            transition={{
              duration: 3 + (i % 4),
              repeat: Infinity,
              delay: i * 0.4
            }}
            style={{
              top: `${(i * 7 + 10) % 90}%`,
              left: `${(i * 13 + 5) % 95}%`,
              rotate: `${(i * 15) % 60 - 30}deg`
            }}
          >
            <PixelIcon
              name={i % 3 === 0 ? 'sparkle' : i % 3 === 1 ? 'heart_solid' : 'star'}
              size={20 + (i % 3) * 12}
              className="text-white/40 filter drop-shadow-[2px_2px_0_rgba(0,0,0,0.1)]"
            />
          </motion.div>
        ))}
      </div>

      {/* 3. Main Content Wrapper */}
      <div className="relative z-30 flex flex-col items-center max-w-7xl w-full px-4">

        {/* Title Container */}
        <div className="relative flex flex-col items-center md:items-start md:flex-row md:justify-center w-full gap-4 md:gap-12 mb-12">

          {/* Trophy Decoration (Left) */}
          <motion.div
            className="hidden lg:flex items-center justify-center self-center"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <PixelIcon name="trophy" size={80} />
          </motion.div>

          {/* Heading with 3D Pixel Style */}
          <div className="text-center md:text-left">
            <h1 className="font-['Press_Start_2P',_monospace] text-4xl sm:text-6xl md:text-8xl flex flex-col gap-2 tracking-tighter">
              {/* WIZARD */}
              <span className="relative text-white drop-shadow-[6px_6px_0_#2e5c8e] [text-shadow:_-2px_-2px_0_#2e5c8e,_2px_-2px_0_#2e5c8e,_-2px_2px_0_#2e5c8e,_2px_2px_0_#2e5c8e]">
                WIZARD
              </span>
              {/* CONNECT */}
              <span className="relative text-white drop-shadow-[6px_6px_0_#2e5c8e] [text-shadow:_-2px_-2px_0_#2e5c8e,_2px_-2px_0_#2e5c8e,_-2px_2px_0_#2e5c8e,_2px_2px_0_#2e5c8e]">
                CONNECT
              </span>
            </h1>
          </div>

          {/* Pitch Deck Text (Right) */}
          <div className="md:self-start mt-4 md:mt-12 text-center md:text-left max-w-[200px] font-['VT323',_monospace]">
            <p className="text-[#2e5c8e] text-lg font-bold uppercase tracking-wider mb-2">PITCH DECK DESIGN</p>
            <p className="text-[#2e5c8e]/70 text-base leading-tight">
              Lorem ipsum dolor sit amet, animal graecis pro no, dico adhuc.
            </p>
          </div>
        </div>

        {/* Start Button - Green Pill Style */}
        <div className="relative z-40">
          <Link href="/login">
            <motion.button
              className="px-16 py-4 rounded-full bg-[#9FF99F] border-4 border-[#1a4a1a] shadow-[0_8px_0_#1a4a1a] text-[#1a4a1a] font-['Press_Start_2P',_monospace] text-xl md:text-2xl uppercase tracking-widest relative group transition-all"
              whileHover={{ y: -2, boxShadow: "0 10px 0 #1a4a1a" }}
              whileTap={{ y: 6, boxShadow: "0 2px 0 #1a4a1a" }}
            >
              <span className="relative z-10">START</span>
              {/* Gloss effect */}
              <div className="absolute top-1 left-4 right-4 h-1/3 bg-white/40 rounded-full pointer-events-none" />
            </motion.button>
          </Link>
        </div>
      </div>

      {/* 4. Foreground Scene - Characters & Speech Bubbles */}
      <div className="absolute bottom-0 left-0 right-0 h-[30vh] md:h-[40vh] z-20 pointer-events-none overflow-hidden">

        {/* Ground Line */}
        <div className="absolute bottom-0 w-full h-8 bg-[#2C3E50]/20 border-t-4 border-[#2C3E50]/10" />

        <div className="absolute bottom-6 w-full max-w-6xl mx-auto left-1/2 -translate-x-1/2 flex justify-between items-end px-12 md:px-24">

          {/* Left Character (Girl) */}
          <div className="relative group">
            {/* Speech Bubble */}
            <motion.div
              className="absolute -top-24 left-0 bg-white border-2 border-[#2C3E50] p-3 rounded-xl shadow-[4px_4px_0_rgba(0,0,0,0.1)] flex items-center justify-center min-w-[60px]"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
            >
              <PixelIcon name="smiley" size={32} />
              <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white border-b-2 border-r-2 border-[#2C3E50] transform rotate-45" />
            </motion.div>

            <div className="w-24 h-24 md:w-32 md:h-32 relative">
              <Image
                src="/images/sticker-girl.png"
                alt="Girl Character"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Right Character (Boy) */}
          <div className="relative group">
            {/* Speech Bubble */}
            <motion.div
              className="absolute -top-24 right-0 bg-white border-2 border-[#2C3E50] p-3 rounded-xl shadow-[4px_4px_0_rgba(0,0,0,0.1)] flex items-center justify-center min-w-[60px]"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.5, type: "spring", stiffness: 260, damping: 20 }}
            >
              <PixelIcon name="heart_solid" size={32} />
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b-2 border-r-2 border-[#2C3E50] transform rotate-45" />
            </motion.div>

            <div className="w-24 h-24 md:w-32 md:h-32 relative">
              <Image
                src="/images/sticker-boy.png"
                alt="Boy Character"
                fill
                className="object-contain"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Decorative Hearts in top corners */}
      <div className="absolute top-10 right-10 flex gap-2 z-30">
        <PixelIcon name="heart_solid" size={24} className="animate-pulse" />
        <PixelIcon name="heart_solid" size={24} className="animate-pulse opacity-80" />
        <PixelIcon name="heart_solid" size={24} className="animate-pulse opacity-60" />
      </div>

    </section>
  )
}

