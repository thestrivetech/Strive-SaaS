# AI Garage & Workbench - Design Guidelines

## Design Approach

**Selected Approach:** Custom Reference-Based with Futuristic/Sci-Fi Aesthetic

**Justification:** This platform requires a distinct, immersive identity that communicates advanced AI capabilities and custom tool creation. The holographic, aurora-inspired visual language sets it apart from standard SaaS tools while maintaining professional credibility.

**Key Design Principles:**
- Holographic glass morphism with aurora effects
- Magnetic, fluid interactions that respond to user input
- 3D-style visual depth through layering and shadows
- Real-time visual feedback for all interactions
- Sophisticated color gradients suggesting AI/technological advancement

---

## Core Design Elements

### A. Color Palette

**Dark Mode Foundation (Primary):**
- Background Base: slate-950 to slate-900 gradients
- Surface Primary: slate-900/70 with backdrop-blur-xl
- Surface Secondary: indigo-900/40 layered effects

**Accent Colors:**
- Primary Cyan: 186 100% 47% (borders, highlights, active states)
- Secondary Violet: 243 75% 59% (gradients, secondary actions)
- Tertiary Emerald: 160 84% 39% (success, active indicators)
- Purple Gradient: From violet-900 to indigo-900 (cards, panels)

**Aurora Gradient System:**
- Multi-stop gradients: violet-900/20 → cyan-900/20 → emerald-900/20
- Animated gradient shifts for background surfaces
- Holographic borders: rgba(99, 102, 241, 0.2) to rgba(6, 182, 212, 0.4)

**Functional Colors:**
- Success: green-500 with pulse animation
- Warning: amber-500
- Danger: red-500
- Neutral: slate-400 for secondary text

### B. Typography

**Font Families:**
- Primary: Inter or System UI stack for interface elements
- Monospace: JetBrains Mono for code/technical displays

**Type Scale:**
- Hero Headlines: text-5xl to text-6xl, font-bold
- Section Headers: text-3xl to text-4xl, font-semibold
- Card Titles: text-xl, font-semibold
- Body Text: text-base, font-normal
- Captions: text-sm, text-slate-400

**Special Typography:**
- Gradient text for hero elements: bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent

### C. Layout System

**Spacing Primitives:**
- Primary units: 4, 8, 12, 16, 24, 32 (p-4, m-8, gap-12, space-y-16, py-24, px-32)
- Card padding: p-6 to p-8
- Section spacing: py-12 to py-24
- Grid gaps: gap-4 to gap-8

**Container Strategy:**
- Max-width: max-w-7xl for main content
- Responsive breakpoints: Standard Tailwind (sm, md, lg, xl, 2xl)
- Full-bleed sections for dashboard and canvas areas

**Grid Systems:**
- Dashboard cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Template gallery: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4
- Feature grids: grid-cols-1 lg:grid-cols-2 gap-8

### D. Component Library

**Glass Morphism Cards:**
- backdrop-blur-xl with bg-gradient-to-br from-slate-900/70 to-indigo-900/40
- Borders: border border-cyan-400/30
- Shadows: shadow-2xl shadow-cyan-500/20
- Hover: hover:scale-105 hover:shadow-[0_0_40px_rgba(6,182,212,0.4)]

**Interactive Elements:**
- Magnetic hover effects with translateY(-8px) and scale(1.02)
- Active states: active:scale-95 with reduced shadow
- Drag-and-drop: cursor-grab active:cursor-grabbing with rotate-3

**Status Indicators:**
- Circular avatars with gradient borders (p-1 wrapper technique)
- Pulse animations for active states: animate-pulse
- Progress bars with animated scanning effects

**Navigation:**
- Floating navigation with glass morphism
- Active state: border-b-2 border-cyan-400

**Forms & Inputs:**
- Dark backgrounds: bg-slate-900/50
- Cyan focus rings: focus:ring-2 focus:ring-cyan-400
- Placeholder: text-slate-500

**Buttons:**
- Primary: bg-gradient-to-r from-cyan-500 to-violet-500 with hover brightness
- Secondary: border border-cyan-400/50 with backdrop-blur-md
- Ghost: hover:bg-slate-800/50

**Data Visualization:**
- Radar charts with glowing vertices and drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]
- Progress circles with gradient strokes
- Timeline with animated milestone markers

**Modals & Overlays:**
- Full-screen overlays: bg-slate-950/95 backdrop-blur-2xl
- Panel slides: Framer Motion slide-in from right/bottom
- Z-index layering: z-50 for modals, z-40 for overlays

### E. Animations

**Core Animation Library:**
- Gradient flow: 15s ease infinite background-position animation
- Holographic border scan: 3s ease-in-out infinite
- Magnetic hover: 0.3s cubic-bezier(0.4, 0, 0.2, 1)
- Card entrance: Staggered delays (150ms increments) with fade-in and translateY
- Progress scanning: Absolute positioned gradient moving across containers

**Interaction Animations:**
- Hover elevations: duration-300 to duration-500
- Click feedback: duration-150 with scale transforms
- Page transitions: Framer Motion fade and slide combinations
- Loading states: Pulse and scanning beam effects

**Performance Notes:**
- Use transform and opacity for animations (GPU-accelerated)
- will-change: transform for frequently animated elements
- Reduce motion for accessibility: prefers-reduced-motion support

---

## Special Considerations

**3D Visual Depth:**
- Layer cards with varying backdrop-blur intensities
- Multiple shadow layers for depth perception
- Parallax scrolling on dashboard sections (subtle)

**Real-time Updates:**
- WebSocket-driven progress indicators with smooth transitions
- Optimistic UI updates for immediate feedback
- Skeleton loaders with shimmer effects during data fetching

**Responsive Adaptations:**
- Mobile: Single column, reduced blur effects, simplified animations
- Tablet: Two-column grids, moderate visual effects
- Desktop: Full visual treatment with all effects enabled

**Accessibility:**
- Maintain WCAG AA contrast ratios despite dark theme
- Focus indicators with cyan rings visible on all interactive elements
- Reduced motion variants for all animations
- Semantic HTML with proper ARIA labels