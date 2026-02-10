'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
    Menu, X, Home, BarChart2, Info, Heart, FileText,
    MessageCircle, Gift, User, LayoutDashboard, LogOut, Loader2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PixelIcon } from '@/components/ui/PixelIcon'

export function Navbar() {
    const pathname = usePathname()
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkUser = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            if (user) {
                const adminRole = user.user_metadata?.role === 'admin' || user.user_metadata?.is_admin === true
                setIsAdmin(adminRole)
            }
            setLoading(false)
        }
        checkUser()
    }, [])

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    const publicLinks = [
        { href: '/', label: 'HOME', icon: Home },
        { href: '/#stats', label: 'STATS', icon: BarChart2 },
        { href: '/#how-it-works', label: 'ABOUT', icon: Info },
        { href: '/stories', label: 'STORIES', icon: Heart },
    ]

    const protectedLinks = [
        { href: '/survey', label: 'FORM', icon: FileText },
        { href: '/matches', label: 'MATCHES', icon: Heart },
        { href: '/messages', label: 'MESSAGES', icon: MessageCircle },
        { href: '/profile', label: 'PROFILE', icon: User },
    ]

    const navLinks = user ? [...publicLinks, ...protectedLinks] : publicLinks

    // Desktop Nav Items (Admin is handled separately or appended)
    const desktopLinks = isAdmin
        ? [...navLinks.slice(0, navLinks.length - 1), { href: '/admin/dashboard', label: 'ADMIN PANEL', icon: LayoutDashboard }, navLinks[navLinks.length - 1]]
        : navLinks

    const [activeLink, setActiveLink] = useState('/')

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const current = window.location.pathname + window.location.hash
            setActiveLink(current === '/' ? '/' : current)
        }
    }, [pathname])

    const handleLinkClick = (href: string) => {
        setActiveLink(href)
    }

    // Helper to determine active state (Replacing original isActive with simple check against state)
    const isActive = (path: string) => {
        // Exact match for hash links / path
        if (path === activeLink) return true
        // Handle root case if activeLink is empty (unlikely with logic above but good safety)
        if (path === '/' && activeLink === '/') return true
        // Handle sub-routes like /stories matching activeLink /stories
        if (path !== '/' && !path.includes('#') && activeLink.startsWith(path)) return true

        return false
    }

    if (loading) {
        return null // or a small spinner if needed
    }

    // Only render full navbar if logged in (per user request context), 
    // but we can fall back to a simple one or the old one if not. 
    // For now, let's assuming this specific navbar is for the authenticated experience.
    // If not logged in, we might want to show the 'Login' button version.
    // However, the prompt specifically asks for "this" navbar.

    return (
        <>
            {/* Desktop Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--retro-cream)] border-b-4 border-[var(--retro-navy)] h-20">
                <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">

                    {/* Logo (Top Left) */}
                    <Link href="/" className="flex items-center gap-3 shrink-0 mr-4">
                        <div className="relative w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
                            <img
                                src="/images/wizardconnect-logo.png"
                                alt="Wizard Connect"
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    // Fallback if image fails
                                    e.currentTarget.style.display = 'none';
                                    const parent = e.currentTarget.parentElement;
                                    if (parent && !parent.querySelector('.logo-fallback')) {
                                        const span = document.createElement('span');
                                        span.className = 'pixel-font text-[var(--retro-navy)] font-black text-xl logo-fallback';
                                        span.innerText = 'W';
                                        parent.appendChild(span);
                                    }
                                }}
                            />
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden xl:flex items-center gap-2 flex-1 justify-center">
                        {desktopLinks.map((link) => {
                            const active = isActive(link.href)
                            // "Form" and "Admin" might have special colors if desired, 
                            // but usually "Active" style controls it.
                            return (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    onClick={() => handleLinkClick(link.href)}
                                    className={`
                                        font-black text-sm px-4 py-2 transition-all transform
                                        ${active
                                            ? 'bg-[#A9BAAB] text-[var(--retro-navy)] border-2 border-[var(--retro-navy)] shadow-[4px_4px_0_var(--retro-navy)] -translate-y-1'
                                            : 'text-[var(--retro-navy)] hover:text-[var(--retro-blue)] hover:translate-y-[-2px]'
                                        }
                                    `}
                                >
                                    {link.label}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Right Side: Profile / Mobile Toggle */}
                    <div className="flex items-center gap-4">
                        {/* Desktop Logout Button */}
                        {user ? (
                            <button onClick={handleSignOut} className="hidden md:block">
                                <div className="w-12 h-12 bg-white border-2 border-[var(--retro-navy)] shadow-[4px_4px_0_var(--retro-navy)] flex items-center justify-center hover:translate-y-[-2px] transition-transform cursor-pointer">
                                    <LogOut className="text-[var(--retro-navy)] w-6 h-6" />
                                </div>
                            </button>
                        ) : (
                            <Link href="/login" className="hidden md:block pixel-btn py-2 px-4 text-xs">
                                LOGIN
                            </Link>
                        )}

                        {/* Mobile Toggle Button */}
                        <button
                            className="xl:hidden w-12 h-12 bg-white border-2 border-[var(--retro-navy)] shadow-[4px_4px_0_var(--retro-navy)] flex items-center justify-center active:translate-y-[2px] active:shadow-none transition-all"
                            onClick={() => setIsOpen(true)}
                        >
                            <Menu className="w-8 h-8 text-[var(--retro-navy)]" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-[60] bg-[var(--retro-cream)] flex flex-col">
                    {/* Mobile Header with Close Button */}
                    <div className="h-20 flex items-center justify-end px-4 border-b-4 border-[var(--retro-navy)] bg-[var(--retro-cream)]">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-12 h-12 bg-white border-2 border-[var(--retro-navy)] shadow-[4px_4px_0_var(--retro-navy)] flex items-center justify-center active:translate-y-[2px] active:shadow-none transition-all"
                        >
                            <X className="w-8 h-8 text-[var(--retro-red)]" />
                        </button>
                    </div>

                    {/* Scrollable Links Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[url('/images/grid-bg.png')]">
                        {navLinks.map((link) => {
                            const active = isActive(link.href)
                            return (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`
                                        w-full flex items-center justify-between p-4 border-2 border-[var(--retro-navy)] shadow-[4px_4px_0_var(--retro-navy)] transition-transform active:scale-[0.98]
                                        ${active ? 'bg-[var(--retro-pink)]' : 'bg-white'}
                                    `}
                                >
                                    <div className="flex items-center gap-4">
                                        <link.icon className={`w-6 h-6 ${active ? 'text-[var(--retro-navy)]' : 'text-[var(--retro-blue)]'}`} />
                                        <span className="font-bold text-[var(--retro-navy)] text-lg tracking-wide">{link.label}</span>
                                    </div>
                                    {active && <div className="w-3 h-3 bg-[var(--retro-yellow)] border border-[var(--retro-navy)]" />}
                                </Link>
                            )
                        })}

                        {/* Admin Link for Mobile */}
                        {isAdmin && (
                            <Link
                                href="/admin/dashboard"
                                onClick={() => setIsOpen(false)}
                                className={`
                                    w-full flex items-center justify-between p-4 border-2 border-[var(--retro-navy)] shadow-[4px_4px_0_var(--retro-navy)] bg-white transition-transform active:scale-[0.98]
                                `}
                            >
                                <div className="flex items-center gap-4">
                                    <LayoutDashboard className="w-6 h-6 text-[var(--retro-navy)]" />
                                    <span className="font-bold text-[var(--retro-navy)] text-lg tracking-wide">ADMIN PANEL</span>
                                </div>
                            </Link>
                        )}
                    </div>

                    {/* Safe Area / Disconnect Button */}
                    <div className="p-6 border-t-4 border-[var(--retro-navy)] bg-[var(--retro-cream)]">
                        {user ? (
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center justify-center gap-3 p-4 bg-[var(--retro-navy)] border-2 border-[var(--retro-navy)] shadow-[4px_4px_0_var(--retro-red)] text-white font-bold hover:bg-[#152c6b] transition-colors"
                            >
                                <LogOut className="w-5 h-5 text-[var(--retro-yellow)]" />
                                DISCONNECT
                            </button>
                        ) : (
                            <Link href="/login" onClick={() => setIsOpen(false)}>
                                <button className="w-full flex items-center justify-center gap-3 p-4 bg-[var(--retro-navy)] border-2 border-[var(--retro-navy)] shadow-[4px_4px_0_var(--retro-yellow)] text-white font-bold">
                                    LOGIN
                                </button>
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* Spacer for Fixed Header */}
            <div className="h-20" />
        </>
    )
}
