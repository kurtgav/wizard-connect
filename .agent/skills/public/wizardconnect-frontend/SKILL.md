---
name: wizardconnect-frontend
description: "Development of pixel-art themed React/Next.js components for the Wizard Connect matchmaking platform. Use when creating new UI components with pixel-art styling, modifying existing React components in frontend/src/components, adding new pages or routes in frontend/src/app, working with Tailwind CSS pixel design system, implementing survey forms or interactive elements."
---

# Wizard Connect Frontend

Pixel-art themed React/Next.js development for university matchmaking platform.

## Quick Start

### Component Structure

```
frontend/src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── ui/                # Reusable UI components
│   ├── features/          # Feature-specific components
│   ├── effects/           # Visual effects (particles, parallax)
│   └── auth/              # Authentication components
├── lib/                   # Utilities and helpers
└── types/                 # TypeScript definitions
```

### Pixel Art Design System

Use these Tailwind classes for pixel styling:

```tsx
<div className="pixel-card bg-retro-cream border-4 border-black shadow-[4px_4px_0_0_#000]">
  <div className="pixel-btn bg-retro-red hover:bg-retro-red-light">
    Button Text
  </div>
</div>
```

Key color palette:
- `bg-retro-cream`: `#FFF8F0` (backgrounds)
- `bg-retro-red`: `#D32F2F` (Mapua red - primary)
- `bg-retro-blue`: `#1976D2` (Mapua blue - secondary)
- `border-black`: `#000000` (pixel borders)

Animations:
- `pixel-bounce`: Bouncing animation
- `pixel-pulse`: Pulsing glow
- `pixel-glow`: Glowing shadow
- `hover-lift`: Hover lift effect

## Creating Components

### UI Component Template

```tsx
'use client'

import { PixelIcon } from '@/components/ui/PixelIcon'

interface ComponentProps {
  title: string
  // Add other props
}

export function ComponentName({ title }: ComponentProps) {
  return (
    <div className="pixel-card bg-retro-cream border-4 border-black shadow-[4px_4px_0_0_#000] p-6">
      <div className="flex items-center gap-3 mb-4">
        <PixelIcon name="star" size={32} />
        <h2 className="text-2xl font-bold font-pixel">{title}</h2>
      </div>
      {/* Component content */}
    </div>
  )
}
```

### Form Component Template

```tsx
'use client'

import { useState } from 'react'

export function FormComponent() {
  const [value, setValue] = useState('')

  return (
    <div className="pixel-card bg-retro-cream border-4 border-black p-6">
      <label className="block font-bold mb-2">Label</label>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pixel-input w-full border-4 border-black bg-white p-3 focus:outline-none"
      />
    </div>
  )
}
```

## Page Routing

### Creating New Pages

Pages follow Next.js App Router conventions:

```tsx
// frontend/src/app/new-page/page.tsx
export default function NewPage() {
  return (
    <main className="min-h-screen bg-retro-cream">
      {/* Page content */}
    </main>
  )
}
```

### Protected Routes

Wrap pages with authentication:

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function ProtectedPage() {
  return (
    <ProtectedRoute>
      <main>
        {/* Authenticated content */}
      </main>
    </ProtectedRoute>
  )
}
```

## Survey Components

Survey questions are defined in `frontend/src/lib/surveyQuestions.ts`. Use the survey form component:

```tsx
import { SurveyForm } from '@/components/features/survey/SurveyForm'
import { surveyQuestions } from '@/lib/surveyQuestions'

export default function SurveyPage() {
  return (
    <SurveyForm questions={surveyQuestions} />
  )
}
```

## Common Patterns

### Pixel Icon Usage

```tsx
import { PixelIcon } from '@/components/ui/PixelIcon'

<PixelIcon name="heart_solid" size={24} className="hover-lift" />
```

Available icons: target, envelope, lock, bubble, cap, palette, star, potion, crystal_empty, cloud, trophy, smiley, heart_solid, sparkle, chick, potion_love, crystal, wand

### Loading States

```tsx
if (loading) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="pixel-bounce">
        <PixelIcon name="crystal" size={48} />
      </div>
    </div>
  )
}
```

### Error States

```tsx
if (error) {
  return (
    <div className="pixel-card bg-retro-cream border-4 border-black p-6">
      <p className="text-red-600 font-bold">Error: {error}</p>
    </div>
  )
}
```

## Styling Guidelines

- Always use pixel-themed classes: `pixel-card`, `pixel-btn`, `pixel-input`
- Font: `font-pixel` for headings, `font-sans` for body text
- Borders: `border-4 border-black` for pixel borders
- Shadows: `shadow-[4px_4px_0_0_#000]` for pixel shadows
- Colors: Use `bg-retro-red`, `bg-retro-blue`, `bg-retro-cream`

## API Integration

Use the API client from `frontend/src/lib/api-client.ts`:

```tsx
import { apiClient } from '@/lib/api-client'

async function fetchMatches() {
  const data = await apiClient.get('/matches')
  return data
}
```

## Supabase Integration

Use server or client Supabase clients:

```tsx
// Server components
import { createClient } from '@/lib/supabase/server'

const supabase = createClient()

// Client components
import { createClient } from '@/lib/supabase/client'

const [supabase] = useState(() => createClient())
```
