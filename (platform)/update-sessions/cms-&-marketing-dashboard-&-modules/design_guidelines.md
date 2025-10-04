# Content Management & Marketing Dashboard - Design Guidelines

## Design Approach: Design System Foundation

**Selected System:** shadcn/ui + Linear-inspired Aesthetic
**Justification:** This is a utility-focused productivity tool for professional real estate agents requiring efficiency, clarity, and information density. We'll build on shadcn/ui's component architecture while drawing inspiration from Linear's clean, modern interface patterns and Notion's content management UI for intuitive workflows.

**Core Design Principles:**
- Information clarity over decoration
- Progressive disclosure for complex features
- Consistent, predictable interactions
- Professional polish with subtle refinement
- Data-dense layouts with breathing room

---

## Color Palette

### Light Mode
- **Background Primary:** 0 0% 100% (pure white)
- **Background Secondary:** 240 4.8% 95.9% (subtle gray for cards/panels)
- **Background Tertiary:** 240 5.9% 90% (hover states, disabled fields)
- **Text Primary:** 240 10% 3.9% (near-black for body text)
- **Text Secondary:** 240 3.8% 46.1% (muted for labels, metadata)
- **Border Default:** 240 5.9% 90% (subtle panel separation)
- **Border Emphasis:** 240 5% 84.5% (focused states)

### Dark Mode  
- **Background Primary:** 240 10% 3.9% (deep charcoal)
- **Background Secondary:** 240 3.7% 15.9% (elevated surfaces, cards)
- **Background Tertiary:** 240 4.8% 9.5% (input fields, tertiary surfaces)
- **Text Primary:** 0 0% 98% (bright white for readability)
- **Text Secondary:** 240 5% 64.9% (muted labels, timestamps)
- **Border Default:** 240 3.7% 15.9% (subtle separation)
- **Border Emphasis:** 240 5% 26% (hover/focus states)

### Brand & Accent Colors
- **Primary (Real Estate Blue):** 221 83% 53% (trust, professionalism)
- **Primary Muted:** 217 91% 60% (hover states)
- **Success (Campaign Active):** 142 76% 36% (green for active campaigns)
- **Warning (Scheduled):** 38 92% 50% (amber for scheduled items)
- **Destructive (Error/Delete):** 0 84% 60% (red for critical actions)

### Semantic Dashboard Colors
- **Email Metric:** 200 98% 39% (cyan for email analytics)
- **Social Metric:** 280 65% 60% (purple for social performance)
- **Landing Page Metric:** 160 84% 39% (teal for page analytics)
- **Chart Backgrounds:** Use 10% opacity of metric colors on card backgrounds

---

## Typography

**Font Stack:**  
- Primary: Inter (Google Fonts CDN)
- Monospace: JetBrains Mono (for code/API keys)

**Scale & Usage:**
- **Headings (Dashboard):** 
  - H1: 2.25rem (36px), font-weight 600, letter-spacing -0.025em
  - H2: 1.875rem (30px), font-weight 600 (section headers)
  - H3: 1.5rem (24px), font-weight 600 (card titles)
  - H4: 1.25rem (20px), font-weight 500 (subsections)

- **Body Text:**
  - Large: 1rem (16px), font-weight 400 (primary content)
  - Default: 0.875rem (14px), font-weight 400 (table cells, descriptions)
  - Small: 0.75rem (12px), font-weight 400 (metadata, timestamps)

- **Interactive Elements:**
  - Buttons: 0.875rem, font-weight 500
  - Form labels: 0.875rem, font-weight 500
  - Navigation: 0.875rem, font-weight 500

---

## Layout System

**Spacing Primitives:** Use Tailwind units of **2, 3, 4, 6, 8, 12, 16** for consistent rhythm
- Micro spacing: p-2, gap-2 (8px) for tight groupings
- Standard spacing: p-4, gap-4 (16px) for component padding
- Section spacing: p-6, gap-6 (24px) for card interiors
- Major spacing: p-8, mt-8 (32px) for page sections
- Hero spacing: p-12, py-16 (for dashboard headers)

**Grid Patterns:**
- **Dashboard Overview:** 3-column grid on desktop (grid-cols-3), 1-column mobile
- **Campaign Lists:** 2-column on tablet (md:grid-cols-2), full-width mobile
- **Analytics Cards:** 4-column metrics (lg:grid-cols-4), stack mobile
- **Content Editor:** Single column with max-w-5xl center containment
- **Sidebar Layouts:** 280px fixed sidebar + flex-1 main content

**Container Constraints:**
- Page containers: max-w-7xl mx-auto px-4
- Content zones: max-w-5xl for reading comfort
- Wide dashboards: max-w-full with px-8 for data tables

---

## Component Library

### Navigation & Structure
- **Top Navigation Bar:** Fixed header with logo, search, notifications, user menu; 64px height; backdrop-blur-md with border-b
- **Sidebar Navigation:** Collapsible 280px sidebar with icon+label items; active state with subtle background fill; smooth transitions
- **Breadcrumbs:** Secondary navigation with chevron separators; muted text with interactive last crumb

### Data Display
- **Stats Cards:** Metric value (text-3xl font-bold) + label (text-sm text-muted) + trend indicator (↑/↓ with percentage change in success/destructive colors); subtle border with hover:shadow-md
- **Data Tables:** Striped rows (alternate row backgrounds); sticky headers with sort icons; row actions on hover; loading skeletons; responsive: stack on mobile
- **Charts:** Use Recharts library with semantic colors; 400px height minimum; axis labels in muted text; tooltips with metric details; grid lines at 20% opacity

### Campaign Management
- **Campaign Cards:** Thumbnail preview (aspect-square) + campaign title + status badge + metrics row (sends/opens/clicks); hover state with elevated shadow
- **Status Badges:** Pill-shaped with dot indicator; Draft (gray), Scheduled (amber), Active (green), Completed (blue), Paused (orange)
- **Calendar Scheduler:** Month view with date cells showing campaign count; drag-drop visual feedback; conflict warnings in destructive color; timezone selector in header

### Content Creation
- **Rich Text Editor:** Toolbar with format buttons (bold, italic, link, lists); floating menu on text selection; image upload dropzone; 600px min-height; border-2 focus state
- **Block Library Panel:** Scrollable sidebar with block previews (120x80px thumbnails); search filter; category tabs (Layout, Content, Real Estate)
- **Media Library Grid:** Masonry grid of uploaded assets; checkbox select; tag filters as chips; upload button prominent in top-right; lightbox preview

### Forms & Inputs
- **Form Fields:** Label above input (font-medium text-sm); helper text below (text-xs text-muted); error states with destructive border + message; disabled with opacity-60
- **File Uploader:** Dashed border dropzone; drag-over state with primary border; progress bar for uploads; thumbnail previews in grid below
- **Date Pickers:** Calendar dropdown from input; range selection with visual connectors; quick presets (Today, This Week, This Month)

### Analytics Components
- **Performance Charts:** Line charts for trends (email opens over time); bar charts for comparisons (platform engagement); donut charts for distribution (traffic sources)
- **Metric Comparison Tables:** Side-by-side campaign performance; color-coded cells (green >5%, red <-5%); sparklines in cells showing 7-day trend
- **Funnel Visualizations:** Vertical stage progression with conversion rates; width proportional to volume; tooltips showing exact numbers

### Mobile Optimization
- **Bottom Navigation:** Fixed 64px bottom bar with 4-5 icons; active state with primary color fill; labels below icons
- **Off-Canvas Editor:** Slide-in from right; full-height; close button top-left; save/publish actions in sticky footer
- **Compact Campaign List:** Single column cards with thumbnail-left layout; swipe actions for quick edit/delete

---

## Images & Visual Assets

**Icon Strategy:** Use Lucide React (via shadcn/ui) exclusively for all icons - consistent stroke-width of 2; size-4 (16px) for inline icons, size-5 (20px) for buttons, size-6 (24px) for headers

**Photographic Assets:**
- **Dashboard Hero (If Applicable):** No hero image - dashboards prioritize data visibility
- **Campaign Thumbnails:** 16:9 aspect ratio placeholders; use subtle gradient overlays (primary color at 10% opacity) on empty states
- **Agent Profile Photos:** Circular avatars; 40px in navigation, 80px in cards, 120px in detailed views
- **Property Listings (Real Estate Blocks):** 4:3 aspect ratio; contain multiple images in carousel format; overlay property price in bottom-left with frosted glass background

**Placeholder Content:**
- Sample campaign images: Use Unsplash API for real estate photography
- Chart data: Realistic metrics (open rates 20-35%, CTR 2-5%, social engagement 3-8%)
- Agent names: Diverse, professional names with varied geographic markets

---

**Animation Philosophy:** Minimal and purposeful
- Page transitions: Fade-in content (200ms)
- Micro-interactions: Scale buttons on press (95%), subtle shadow elevation on card hover
- Data loading: Skeleton screens with pulse animation; chart data animates in on mount (400ms ease-out)
- Drag-and-drop: Smooth transform with 150ms transition; drop zones pulse with primary color at mount

This design system creates a professional, data-rich environment where real estate agents can efficiently manage marketing campaigns while maintaining visual clarity and modern polish.