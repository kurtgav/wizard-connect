// ============================================
// NAVBAR COMPONENT - PIXEL CONCEPT DESIGN
// Updated with Custom Logo & Pixel Icons
// ============================================

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, User, Gamepad2 } from 'lucide-react'
import { PixelIcon } from '@/components/ui/PixelIcon'

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navLinks = [
        { href: '#features', label: 'Features' },
        { href: '#how-it-works', label: 'How it Works' },
        { href: '#stats', label: 'Stats' },
        { href: '#team', label: 'Team' },
    ]

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                        ? 'py-3 bg-white/90 backdrop-blur-md border-b-2 border-[#2C3E50]'
                        : 'py-5 bg-transparent'
                    }`}
            >
                <div className="pixel-container max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative w-10 h-10 group-hover:scale-110 transition-transform">
                                <Image
                                    src="/images/wizardconnect-logo.png"
                                    alt="Wizard Connect Logo"
                                    fill
                                    className="object-contain drop-shadow-[2px_2px_0_rgba(44,62,80,0.5)]"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="pixel-font-heading font-bold text-lg leading-tight text-[#2C3E50]">
                                    WIZARD
                                </span>
                                <span className="pixel-font-heading font-bold text-sm leading-tight text-[#FF6B9D]">
                                    CONNECT
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className="pixel-font-body font-bold text-sm text-[#2C3E50] hover:text-[#00D4FF] hover:underline decoration-2 underline-offset-4 transition-colors relative group"
                                >
                                    {link.label}
                                    <span className="absolute -top-4 -right-4 opacity-0 group-hover:opacity-100 transition-opacity animate-bounce">
                                        <PixelIcon name="sparkle" size={12} />
                                    </span>
                                </Link>
                            ))}
                        </nav>

                        {/* CTA Buttons */}
                        <div className="hidden md:flex items-center gap-4">
                            <Link href="/login">
                                <button className="flex items-center gap-2 font-bold text-sm text-[#2C3E50] hover:text-[#FF6B9D] transition-colors pixel-font-heading">
                                    <User className="w-4 h-4" />
                                    Login
                                </button>
                            </Link>
                            <Link href="/login">
                                <button className="pixel-btn px-6 py-2 text-xs flex items-center gap-2 hover:scale-105 transition-transform" style={{
                                    background: 'linear-gradient(135deg, #00D4FF 0%, #0099CC 100%)',
                                    color: 'white',
                                    borderColor: '#2C3E50',
                                    boxShadow: '4px 4px 0 #2C3E50'
                                }}>
                                    <Gamepad2 className="w-4 h-4" />
                                    START GAME
                                </button>
                            </Link>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden text-[#2C3E50]"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl pt-24 px-6 md:hidden">
                    <nav className="flex flex-col gap-6 text-center">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="pixel-font-heading text-xl text-[#2C3E50] hover:text-[#FF6B9D]"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="h-px bg-gray-200 my-2" />
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                            <button className="w-full pixel-btn py-4 text-sm bg-[#FF6B9D] text-white border-[#2C3E50] shadow-[4px_4px_0_#2C3E50]">
                                LOGIN
                            </button>
                        </Link>
                    </nav>
                </div>
            )}
        </>
    )
}
