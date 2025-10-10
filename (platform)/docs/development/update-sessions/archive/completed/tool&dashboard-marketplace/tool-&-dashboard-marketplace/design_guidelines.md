# Real Estate Tool Marketplace - Design Guidelines

## Design Approach

**Selected Approach:** Modern SaaS Dashboard System
**Justification:** This is a utility-focused productivity tool for real estate professionals requiring efficient tool discovery, comparison, and selection. The design prioritizes clarity, scannability, and professional aesthetics over visual flair.

**Reference Inspiration:** Linear (clean data density), Stripe Dashboard (professional marketplace feel), Notion (organized sidebar navigation)

**Core Principles:**
- Information hierarchy enables quick scanning
- Professional credibility through restrained design
- Efficient task completion (find → evaluate → add to plan)
- Data density without visual clutter

---

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Background: 0 0% 100% (pure white)
- Surface: 220 13% 98% (subtle off-white for cards)
- Border: 220 13% 91% (soft borders)
- Primary: 221 83% 53% (professional blue)
- Primary Hover: 221 83% 48%
- Success: 142 71% 45% (for "Added" states)
- Text Primary: 222 47% 11%
- Text Secondary: 215 16% 47%

**Dark Mode:**
- Background: 222 47% 11% (deep slate)
- Surface: 217 33% 17% (elevated cards)
- Border: 217 33% 24%
- Primary: 217 91% 60% (brighter blue for contrast)
- Primary Hover: 217 91% 55%
- Success: 142 71% 50%
- Text Primary: 210 40% 98%
- Text Secondary: 215 20% 65%

**Tier Colors:**
- Starter (Tier 1): 142 71% 45% (green accent)
- Growth (Tier 2): 221 83% 53% (blue accent)
- Elite (Tier 3): 262 83% 58% (purple accent)
- Custom: 38 92% 50% (amber accent)

### B. Typography

**Font Families:**
- Primary: 'Inter', system-ui, sans-serif
- Monospace: 'JetBrains Mono', monospace (for prices)

**Hierarchy:**
- Page Title: 32px / 600 weight / -0.02em tracking
- Section Headers: 24px / 600 weight
- Card Titles: 18px / 500 weight
- Body Text: 15px / 400 weight
- Prices: 20px / 600 weight / monospace
- Small Text/Labels: 13px / 500 weight
- Badges: 12px / 500 weight / uppercase / 0.05em tracking

### C. Layout System

**Spacing Primitives:**
Core spacing units: 2, 3, 4, 6, 8, 12, 16, 20 (Tailwind units)
- Micro spacing: 2, 3 (gaps, inline elements)
- Standard spacing: 4, 6 (card padding, button spacing)
- Section spacing: 8, 12 (between major sections)
- Page margins: 16, 20 (outer containers)

**Grid System:**
- Container: max-w-screen-2xl with px-6 lg:px-8
- Sidebar: 280px fixed width on desktop, collapsible to 64px icon-only
- Main Content: flex-1 with responsive grid
- Tool Cards Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Plan Builder: 320px fixed width sidebar on right (desktop), bottom sheet (mobile)

### D. Component Library

**Navigation Sidebar (Left):**
- Collapsible vertical sidebar with category tabs
- Category items: icon + label, 12px vertical spacing
- Active state: primary color background with 8px left border accent
- Hover state: subtle surface color background
- Collapse button at bottom, rotates icon when collapsed

**Top Search Bar:**
- Full-width sticky bar with white/surface background, shadow on scroll
- Search input: 44px height, rounded-lg, border, left-aligned icon
- Sort dropdown: right-aligned, subtle appearance
- Mobile: search takes full width, sort becomes icon button

**Tool Cards:**
- Surface background with border, rounded-lg (12px radius)
- Padding: p-6
- Icon: 48px size, primary color tint background, rounded-lg
- Title: 18px semibold, mb-2
- Description: 15px text-secondary, mb-4, line-clamp-2
- Price: monospace, 20px, right-aligned within flex layout
- Tags: flex-wrap gap-2, small badges
- Add Button: full-width, primary color, rounded-md, 40px height
- Hover: lift effect (shadow-lg), subtle border color change
- Added State: success color, checkmark icon, "Added to Plan" text

**Category Tabs:**
- Horizontal scroll on mobile, fixed grid on desktop
- Tab: px-4 py-2, rounded-full when active, border when inactive
- Active: tier-specific color background, white text
- Inactive: transparent, text-secondary, border

**Plan Builder Sidebar (Right):**
- Fixed position on desktop, slide-up sheet on mobile
- Header: "Your Plan" title + item count badge
- Items list: compact rows with icon, title, price, remove button (×)
- Each row: 8px vertical padding, border-bottom
- Footer: total price (large, bold), checkout button (primary, full-width)
- Empty state: centered icon + "No tools selected" text

**Tool Details Modal:**
- Overlay: backdrop-blur with 50% opacity dark background
- Dialog: max-w-2xl, centered, rounded-xl, p-8
- Header: Large icon (64px) + title + tier badge
- Content: Full description, larger text (16px), mb-6
- Tags: same style as cards, flex-wrap
- Price: prominent display, 24px monospace
- Actions: flex row with "Add to Plan" primary button + "Close" ghost button

**Badges:**
- Rounded-full, px-3 py-1, 12px uppercase text
- Beta: amber background (38 92% 95%), amber text (38 92% 35%)
- AI-Powered: purple background (262 83% 95%), purple text (262 83% 45%)
- Foundation/Growth/Elite: tier-specific subtle backgrounds
- Integration/Advanced: neutral gray backgrounds

**Buttons:**
- Primary: tier/primary color background, white text, rounded-md, px-4 py-2.5
- Ghost: transparent, text-secondary, hover: surface background
- Outline: border, transparent background, hover: subtle surface
- Icon buttons: 40px square, rounded-md, centered icon

**Inputs:**
- Height: 40px
- Rounded: rounded-md (6px)
- Border: 1px solid border color
- Focus: 2px ring in primary color
- Dark mode: surface background with lighter border

### E. Interactive States

**Hover Effects:**
- Cards: translateY(-2px) + shadow-lg transition
- Buttons: brightness adjustment (95% on hover)
- Sidebar items: surface background fade-in

**Active States:**
- Cards when selected: primary color left border (4px)
- Category tabs: full tier-color background
- Buttons: slight scale(0.98) on click

**Transitions:**
- Default: all 200ms ease-out
- Sidebar collapse: 300ms ease-in-out
- Modal: 250ms ease-out for backdrop and content
- Hover lifts: 150ms ease-out

**Loading States:**
- Skeleton cards: animated gradient shimmer
- Buttons: spinner icon + disabled state
- Search: debounced with loading spinner in input

**Empty States:**
- Centered icon (96px, text-secondary)
- Message text (16px, text-secondary)
- Suggested action button below

---

## Layout Structure

### Desktop (≥1024px):
```
┌─────────────────────────────────────────────────────────┐
│ [Search Bar + Sort] ────────────────────────────────────│
├──────────┬──────────────────────────────────┬───────────┤
│ Sidebar  │   Tool Cards Grid (3 cols)       │   Plan    │
│ (280px)  │   ┌────┐ ┌────┐ ┌────┐          │  Builder  │
│          │   │Card│ │Card│ │Card│          │  (320px)  │
│ Category │   └────┘ └────┘ └────┘          │           │
│ Filters  │   ┌────┐ ┌────┐ ┌────┐          │           │
│          │   │Card│ │Card│ │Card│          │           │
│          │   └────┘ └────┘ └────┘          │           │
└──────────┴──────────────────────────────────┴───────────┘
```

### Tablet (768-1023px):
- Sidebar collapses to icon-only (64px) OR slides out overlay
- Grid: 2 columns
- Plan Builder: bottom-fixed expandable sheet

### Mobile (<768px):
- Hamburger menu for sidebar (full overlay)
- Grid: 1 column
- Plan Builder: floating action button → bottom sheet
- Search: full-width, sort as separate button

---

## Accessibility & Responsiveness

- All interactive elements minimum 40px touch target
- Focus rings: 2px offset, primary color
- Keyboard navigation: Tab through cards, Enter to open modal, Esc to close
- ARIA labels on all icon-only buttons
- Screen reader announcements for plan additions/removals
- Reduced motion media query: disable transforms and complex animations
- Color contrast ratios: minimum 4.5:1 for text
- Dark mode toggle: persistent via localStorage, smooth theme transitions

---

## Visual Enhancements

**Card Depth:**
- Default: shadow-sm (subtle)
- Hover: shadow-lg (pronounced lift)
- Active/Selected: shadow-md + primary border-l-4

**Iconography:**
- Lucide React icon library
- Consistent 24px size for card icons
- 20px for inline/button icons
- Primary color tint for tool icons

**Micro-interactions:**
- Success toast on tool addition (slide-in from top-right)
- Smooth number counter for total price updates
- Checkmark animation when adding to plan

**Professional Polish:**
- Subtle border-radius consistency (6px, 8px, 12px hierarchy)
- Generous whitespace preventing cramped appearance
- Consistent elevation levels (shadows) for z-axis hierarchy
- Smooth theme transitions (200ms) when toggling dark mode