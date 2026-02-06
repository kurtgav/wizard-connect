'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Mail, Instagram, Facebook, Github, Flower2, Flower, Wand2, Ghost } from 'lucide-react';
import { motion } from 'framer-motion';

const footerLinks = {
  platform: [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/statistics', label: 'Statistics' },
    { href: '/testimonials', label: 'Testimonials' },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/contact', label: 'Contact' },
  ],
};

const socialLinks = [
  { href: 'https://www.instagram.com/mapuamcl_ssc/', icon: Instagram, label: 'Instagram' },
  { href: 'https://https://www.facebook.com/MapuaMCLSSC', icon: Facebook, label: 'Facebook' },
  { href: 'mailto:ssc@mcl.edu.ph', icon: Mail, label: 'Email' },
];

export default function Footer() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <footer className="relative overflow-hidden bg-[var(--retro-navy)] border-t-[8px] border-[var(--retro-yellow)]">
      {/* Retro Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, var(--retro-yellow) 1px, transparent 1px),
            linear-gradient(to bottom, var(--retro-yellow) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }} />
      </div>

      {/* Floating Pixel Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Pixel Hearts */}
        {isMounted && [...Array(6)].map((_, i) => (
          <motion.div
            key={`footer-heart-${i}`}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 10, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 0.4,
            }}
          >
            <div className="w-4 h-4 bg-[var(--retro-pink)] border-2 border-[var(--retro-yellow)]" />
          </motion.div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">

          {/* 1. BRAND SECTION (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-block group">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[var(--retro-pink)] border-4 border-[var(--retro-yellow)] flex items-center justify-center shadow-[6px_6px_0_0_rgba(0,0,0,0.3)] group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.3)] transition-all">
                  <img src="/images/wizardconnect-logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                </div>
                <div>
                  <h2 className="pixel-font text-2xl text-[var(--retro-yellow)] leading-none mb-1">
                    Wizard<br /><span className="text-white">Match</span>
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-[var(--retro-pink)] opacity-90">
                    <Wand2 className="w-3 h-3" />
                    <span>EST. 2026</span>
                  </div>
                </div>
              </div>
            </Link>

            <p className="font-medium text-white/70 leading-relaxed max-w-sm">
              Finding your perfect match with magical compatibility algorithms.
              Join thousands of wizards finding love and friendship.
            </p>

            <div className="inline-flex items-center gap-2 bg-white/10 border-2 border-[var(--retro-yellow)] px-4 py-2 rounded-sm backdrop-blur-sm">
              <Flower2 className="w-4 h-4 text-[var(--retro-yellow)]" />
              <span className="pixel-font text-[10px] tracking-wide text-white">
                BLOOM WITH LOVE
              </span>
            </div>
          </div>

          {/* 2. LINKS SECTION (Platform - 2 Cols) */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h3 className="pixel-font text-sm text-[var(--retro-pink)] mb-6 flex items-center gap-2">
              <Flower className="w-4 h-4 text-[var(--retro-yellow)]" />
              PLATFORM
            </h3>
            <ul className="space-y-4">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-medium text-white/60 hover:text-[var(--retro-yellow)] hover:pl-2 transition-all flex items-center gap-2 group text-sm"
                  >
                    <span className="opacity-0 group-hover:opacity-100 text-[8px]">▶</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. LINKS SECTION (Legal - 2 Cols) */}
          <div className="lg:col-span-2">
            <h3 className="pixel-font text-sm text-[var(--retro-pink)] mb-6 flex items-center gap-2">
              <Heart className="w-4 h-4 text-[var(--retro-pink)] fill-current" />
              LEGAL
            </h3>
            <ul className="space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-medium text-white/60 hover:text-[var(--retro-yellow)] hover:pl-2 transition-all flex items-center gap-2 group text-sm"
                  >
                    <span className="opacity-0 group-hover:opacity-100 text-[8px]">▶</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. CONNECT SECTION (4 Cols) */}
          <div className="lg:col-span-4">
            <h3 className="pixel-font text-sm text-[var(--retro-pink)] mb-6 flex items-center gap-2">
              <Mail className="w-4 h-4 text-[var(--retro-yellow)]" />
              CONNECT
            </h3>

            <div className="flex gap-4 mb-8">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 border-4 border-[var(--retro-yellow)] bg-white flex items-center justify-center text-[var(--retro-navy)] hover:bg-[var(--retro-pink)] hover:text-white hover:border-white transition-all shadow-[4px_4px_0_0_rgba(0,0,0,0.3)]"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    whileTap={{ scale: 0.95 }}
                    title={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>

            <div className="bg-white/5 border-2 border-[var(--retro-yellow)] p-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-8 h-8 bg-[var(--retro-yellow)] -mr-4 -mt-4 transform rotate-45"></div>
              <p className="pixel-font text-[10px] text-white/50 mb-1">EMAIL SUPPORT</p>
              <a href="mailto:perfectmatch@gmail.com" className="text-sm font-bold text-white group-hover:text-[var(--retro-yellow)] transition-colors">
                ssc@mcl.edu.ph
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 border-t-2 border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-white/40 font-medium">
          <p>© 2026 Wizard Match. All rights reserved.</p>

          <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/5">
            <span>Crafted with</span>
            <Heart className="w-3 h-3 text-[var(--retro-pink)] fill-current animate-pulse" />
            <span>by <span className="text-white">Kurt Gavin</span></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
