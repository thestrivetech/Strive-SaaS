# REID Real Estate Intelligence Dashboard - Design Guidelines

## Design Approach

**Selected Approach:** Design System with Custom Dark Theme
**Justification:** Data-intensive dashboard requiring consistent patterns, clear hierarchy, and optimal readability for complex analytics. The futuristic aesthetic requires custom treatment while maintaining usability.

**Key Design Principles:**
- Information density with breathing room
- Neon accents for focus, not decoration
- Subtle motion to guide attention
- Professional trust meets cutting-edge technology

---

## Core Design Elements

### A. Color Palette

**Dark Mode Foundation:**
- Background Primary: 220 20% 8%
- Background Secondary: 220 18% 12%
- Background Tertiary: 220 16% 16%
- Surface Elevated: 220 18% 14%

**Neon Accent System:**
- Primary Accent (Cyan): 180 95% 55%
- Secondary Accent (Purple): 270 85% 65%
- Success/Growth: 150 75% 50%
- Warning/Alert: 35 90% 60%
- Danger/Decline: 0 85% 55%

**Text Hierarchy:**
- Primary Text: 220 15% 95%
- Secondary Text: 220 12% 70%
- Tertiary/Muted: 220 10% 50%
- Disabled: 220 8% 35%

**Chart Color Palette:**
Use vibrant, distinguishable colors for data visualization:
- Line 1: 180 95% 55%
- Line 2: 270 85% 65%
- Line 3: 150 75% 50%
- Line 4: 35 90% 60%
- Line 5: 310 80% 60%

### B. Typography

**Font Families:**
- Primary: 'Inter', system-ui, sans-serif (via Google Fonts)
- Monospace: 'Fira Code', monospace (for data/metrics)

**Type Scale:**
- Dashboard Title: text-2xl, font-semibold (24px)
- Module Headers: text-xl, font-semibold (20px)
- Section Labels: text-sm, font-medium, uppercase, tracking-wider (12px)
- Body/Data: text-base, font-normal (16px)
- Metrics/Large Numbers: text-3xl to text-5xl, font-bold, font-mono
- Captions/Helper: text-xs, font-normal (11px)

### C. Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 24
- Component padding: p-4 to p-6
- Section spacing: gap-6 to gap-8
- Module margins: m-6 to m-8
- Tight spacing (metrics): gap-2

**Grid Structure:**
- Sidebar: 280px fixed width (collapsed: 64px)
- Main content: flex-1 with max-w-screen-2xl
- Module cards: grid with 1-3 columns based on content type
- Responsive breakpoints: Standard Tailwind (sm, md, lg, xl, 2xl)

### D. Component Library

**Navigation & Layout:**
- **Sidebar:** Dark background (220 20% 8%), icon+label layout, active state with cyan accent border-l-4, hover state subtle glow
- **Top Bar:** Fixed header with glass morphism effect (backdrop-blur-xl, bg-opacity-80), contains search, filters, date picker, export button
- **Module Cards:** Rounded-xl borders (border border-slate-700), shadow-xl, subtle gradient overlays, hover state with cyan glow

**Data Display Components:**
- **Metric Cards:** Large monospace numbers, small label above, percentage change with colored arrow indicators
- **Tables:** Striped rows (even rows darker), sticky headers, sortable columns with arrow icons, hover row highlight with cyan tint
- **Charts:** Dark backgrounds, gridlines at 220 12% 20%, axis labels in muted text, tooltips with glass effect
- **Map Interface:** Full-height container, floating controls with glass effect, cluster markers with neon pulse animation

**Interactive Elements:**
- **Primary Buttons:** Cyan background (180 95% 55%), white text, hover brighten, active scale-95
- **Secondary Buttons:** Outlined (border-cyan-500), hover fill with cyan, text-white
- **Toggle Switches:** Track in dark gray, thumb with cyan accent when active
- **Inputs:** Dark background (220 18% 12%), cyan focus ring, white text, placeholder in muted
- **Dropdowns:** Dark background with subtle border, hover items with cyan tint

**Status & Feedback:**
- **Loading States:** Skeleton screens with subtle shimmer animation in cyan
- **Empty States:** Centered icon + text in muted colors, CTA button to add data
- **Error States:** Red accent with icon, retry button
- **Success Toasts:** Dark background with green accent border-l-4, auto-dismiss

### E. Animations

**Micro-interactions (Subtle):**
- Hover scale on cards: scale-105, duration-200
- Active button press: scale-95, duration-100
- Drawer slide-in: translate-x animation, duration-300
- Data refresh pulse: opacity and scale pulse on metric updates
- Map marker cluster: gentle breathing animation

**Prohibited:**
- No background gradients that move
- No rotating elements (unless part of loading spinner)
- No excessive parallax effects

---

## Module-Specific Treatments

**Heatmap Module:**
- Full-width/full-height map container
- Floating legend with glass effect in top-right
- Color scale from cool (low) to hot (high) using cyan to purple to red gradient
- Zoom controls with neon outline buttons

**ROI Simulator:**
- Two-column layout: inputs left, results right
- Gauge charts with neon arcs (cyan for positive, red for negative)
- Real-time calculation feedback with smooth number transitions
- Result cards with large monospace metrics

**Comparative Trends:**
- Chart fills full card width
- Multiple line colors from palette
- Legend positioned top-right inside chart area
- Responsive: stack to single column on mobile

**School & Amenities Table:**
- Fixed header on scroll
- Star ratings with cyan stars
- Badge components for scores (rounded-full, small text)
- Sortable columns with hover state showing sort icon

---

## Responsive Behavior

**Mobile (< 768px):**
- Sidebar collapses to bottom navigation bar
- Module grid stacks to single column
- Map view becomes primary screen with drawer for filters
- Tables scroll horizontally with sticky first column

**Tablet (768px - 1024px):**
- Sidebar auto-collapses to icon-only
- Two-column module grid
- Reduced padding (p-4 instead of p-6)

**Desktop (> 1024px):**
- Full three-column module grid where applicable
- Expanded sidebar with labels
- Maximum padding and spacing

---

## Images

**Dashboard Header Background:**
- Subtle abstract cityscape or data visualization pattern as header background
- Low opacity (20-30%), dark overlay, serves as texture not distraction
- Position: Behind top bar, full-width, 200-300px height

**Empty State Illustrations:**
- Tech-style line art illustrations for empty modules
- Monochromatic with cyan accent
- Small size (200x200px), centered within empty cards

**Module Icons:**
- Use Heroicons (via CDN) for navigation and UI elements
- Outlined style for inactive, solid style for active states
- Size: 20-24px for sidebar, 16-20px for inline elements

No hero image required - this is a dashboard application focused on data and functionality.