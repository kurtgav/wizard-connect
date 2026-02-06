import Image from 'next/image'

export type PixelIconName =
    | 'target'
    | 'envelope'
    | 'lock'
    | 'bubble'
    | 'cap'
    | 'palette'
    | 'star'
    | 'potion'
    | 'crystal_empty'
    | 'cloud'
    | 'trophy'
    | 'smiley'
    | 'heart_solid'
    | 'sparkle'
    | 'chick'
    | 'potion_love'
    | 'crystal'
    | 'wand'

interface PixelIconProps {
    name: PixelIconName
    className?: string
    size?: number
}

// Map names to their specific filenames in /images/stickers/
// Fallbacks for missing assets are mapped to existing similar ones
const stickerMap: Record<PixelIconName, string> = {
    target: 'target.png',
    envelope: 'envelope.png',
    lock: 'lock.png',
    bubble: 'bubble.png',
    cap: 'cap.png',
    palette: 'palette.png',
    star: 'star.png',
    potion: 'potion.png',
    crystal_empty: 'crystal_empty.png',
    cloud: 'cloud.png',
    trophy: 'trophy.png',
    smiley: 'smiley.png',
    heart_solid: 'heart_solid.png',

    // Temporarily mapping missing assets to existing similar ones
    sparkle: 'star.png',        // Fallback to star
    chick: 'smiley.png',        // Fallback to smiley
    potion_love: 'potion.png',  // Fallback to potion
    crystal: 'crystal_empty.png', // Fallback to empty crystal
    wand: 'star.png',           // Fallback to star
}

export function PixelIcon({ name, className = "", size = 24 }: PixelIconProps) {
    const fileName = stickerMap[name] || 'star.png'

    return (
        <span
            className={`relative inline-block select-none ${className} hover-lift`}
            style={{
                width: size,
                height: size,
                filter: 'drop-shadow(2px 2px 0 var(--retro-navy))'
            }}
        >
            <Image
                src={`/images/stickers/${fileName}`}
                alt={name}
                fill
                className="object-contain pixelated"
                sizes={`${size}px`}
                priority={size > 40} // Prioritize larger icons (likely LCP)
            />
        </span>
    )
}
