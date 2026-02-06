// ============================================
// PIXEL ICON COMPONENT
// Supports both sprite-based icons and high-end emoji stickers
// ============================================

import React from 'react'

export type PixelIconName =
    // From pixel-icons.png
    | 'target'
    | 'envelope'
    | 'lock'
    | 'bubble'
    | 'cap'
    | 'palette'
    | 'star'
    | 'potion'
    // From pixel-decorations.png
    | 'cloud'
    | 'trophy'
    | 'smiley'
    | 'heart_solid'
    | 'sparkle'
    | 'chick'
    | 'potion_love'
    | 'crystal'

interface PixelIconProps {
    name: PixelIconName
    className?: string
    size?: number
    useSprite?: boolean
}

// Emoji Mapping for "Normal Emoji" stickers
const emojiMap: Record<PixelIconName, string> = {
    target: '🎯',
    envelope: '💌',
    lock: '🔒',
    bubble: '💬',
    cap: '🎓',
    palette: '🎨',
    star: '⭐',
    potion: '🧪',
    cloud: '☁️',
    trophy: '🏆',
    smiley: '😊',
    heart_solid: '❤️',
    sparkle: '✨',
    chick: '🐥',
    potion_love: '🧪',
    crystal: '💎',
}

// Config for each sprite sheet (Legacy fallback)
const SPRITE_CONFIG = {
    icons: {
        src: '/images/pixel-icons.png',
        grid: 3
    },
    decorations: {
        src: '/images/pixel-decorations.png',
        grid: 3
    }
}

const iconMap: Record<PixelIconName, { source: 'icons' | 'decorations', index: number }> = {
    target: { source: 'icons', index: 0 },
    envelope: { source: 'icons', index: 1 },
    lock: { source: 'icons', index: 2 },
    bubble: { source: 'icons', index: 3 },
    cap: { source: 'icons', index: 4 },
    palette: { source: 'icons', index: 5 },
    star: { source: 'icons', index: 6 },
    potion: { source: 'icons', index: 7 },
    cloud: { source: 'decorations', index: 0 },
    trophy: { source: 'decorations', index: 1 },
    smiley: { source: 'decorations', index: 2 },
    heart_solid: { source: 'decorations', index: 3 },
    sparkle: { source: 'decorations', index: 4 },
    chick: { source: 'decorations', index: 5 },
    potion_love: { source: 'decorations', index: 6 },
    crystal: { source: 'decorations', index: 7 },
}

export function PixelIcon({ name, className = "", size = 24, useSprite = false }: PixelIconProps) {
    // If not using sprite, render the high-end emoji sticker
    if (!useSprite) {
        const emoji = emojiMap[name] || '⭐'
        return (
            <div
                className={`relative inline-flex items-center justify-center select-none ${className}`}
                style={{
                    width: size,
                    height: size,
                    fontSize: size * 0.8,
                    filter: `drop-shadow(${size * 0.05}px ${size * 0.05}px 0 #2C3E50)`,
                }}
            >
                <span className="relative z-10 block leading-none" style={{
                    // High-end sticker effect: White border and depth
                    textShadow: `
                        -${size * 0.08}px -${size * 0.08}px 0 #FFF,
                         ${size * 0.08}px -${size * 0.08}px 0 #FFF,
                        -${size * 0.08}px  ${size * 0.08}px 0 #FFF,
                         ${size * 0.08}px  ${size * 0.08}px 0 #FFF,
                         0 -${size * 0.08}px 0 #FFF,
                         0  ${size * 0.08}px 0 #FFF,
                        -${size * 0.08}px 0 0 #FFF,
                         ${size * 0.08}px 0 0 #FFF
                    `,
                }}>
                    {emoji}
                </span>
            </div>
        )
    }

    // Sprite-based rendering (Legacy/Specific Pixel Style)
    const config = iconMap[name] || iconMap['star']
    const sprite = SPRITE_CONFIG[config.source]
    const col = config.index % sprite.grid
    const row = Math.floor(config.index / sprite.grid)
    const step = 100 / (sprite.grid - 1)
    const x = col * step
    const y = row * step

    return (
        <div
            className={`relative inline-block overflow-hidden ${className}`}
            style={{ width: size, height: size }}
        >
            <div
                className="absolute top-0 left-0"
                style={{
                    width: `${sprite.grid * 100}%`,
                    height: `${sprite.grid * 100}%`,
                    backgroundImage: `url('${sprite.src}')`,
                    backgroundSize: `${sprite.grid * 100}% ${sprite.grid * 100}%`,
                    backgroundPosition: `${x}% ${y}%`,
                    imageRendering: 'pixelated'
                }}
            />
        </div>
    )
}

