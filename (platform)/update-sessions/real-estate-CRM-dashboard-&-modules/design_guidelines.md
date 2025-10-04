# Real Estate CRM Dashboard - Design Guidelines

## Design Approach: Enterprise Design System

**Selected System**: Material Design 3 (M3) with Real Estate Industry Customization
**Justification**: Information-dense CRM requiring clarity, hierarchy, and professional aesthetic. M3 provides robust patterns for data tables, cards, and complex interactions while maintaining visual appeal.

**Key Design Principles**:
- Clarity over decoration: Every visual element serves user comprehension
- Hierarchy through elevation and color, not embellishment
- Consistent spacing creates rhythm and reduces cognitive load
- Trust-building through polish and professional restraint

---

## Core Design Elements

### A. Color Palette

**Light Mode**:
- Primary: 220 70% 45% (Professional Navy - confidence, trust)
- Primary Variant: 220 65% 35% (Darker navy for hover states)
- Secondary: 40 75% 55% (Warm Gold - premium, achievement)
- Background: 0 0% 98% (Off-white for reduced eye strain)
- Surface: 0 0% 100% (Pure white cards)
- Surface Variant: 220 15% 95% (Subtle gray for secondary surfaces)
- Error: 0 70% 50% (Clear red for alerts)
- Success: 142 71% 45% (Positive green for confirmations)
- Warning: 38 92% 50% (Amber for caution states)
- Text Primary: 220 20% 20% (Near black, high contrast)
- Text Secondary: 220 15% 45% (Medium gray for metadata)

**Dark Mode**:
- Primary: 220 75% 65% (Lighter navy for contrast)
- Background: 220 15% 12% (Deep navy-tinted dark)
- Surface: 220 12% 16% (Slightly elevated dark)
- Surface Variant: 220 10% 20% (Secondary dark surfaces)
- Text Primary: 0 0% 95% (Off-white)
- Text Secondary: 220 5% 70% (Light gray)

**Status Colors**:
- Hot Lead: 10 85% 55% (Urgent red-orange)
- Warm Lead: 38 92% 50% (Engaged amber)
- Cold Lead: 200 50% 60% (Cool blue)
- Active Listing: 142 71% 45% (Available green)
- Pending: 38 92% 50% (In-progress amber)
- Sold: 220 70% 45% (Completed navy)

### B. Typography

**Font Families**:
- Primary: Inter (system, UI elements, data tables)
- Display: Outfit (headings, dashboard titles)
- Monospace: JetBrains Mono (numerical data, IDs)

**Type Scale**:
- Display Large: 3.5rem/4rem, Outfit SemiBold (dashboard headers)
- Headline: 2rem/2.5rem, Outfit SemiBold (page titles)
- Title Large: 1.375rem/1.75rem, Inter SemiBold (section headers)
- Title Medium: 1rem/1.5rem, Inter Medium (card titles)
- Body Large: 1rem/1.5rem, Inter Regular (primary content)
- Body Medium: 0.875rem/1.25rem, Inter Regular (table data)
- Label Large: 0.875rem/1.25rem, Inter Medium (buttons, badges)
- Label Small: 0.75rem/1rem, Inter Medium (metadata, captions)

### C. Layout System

**Spacing Primitives**: Tailwind units of 1, 2, 4, 6, 8, 12, 16
- Micro spacing (1-2): Icon gaps, badge padding
- Component spacing (4-6): Card padding, form fields
- Section spacing (8-12): Major sections, dashboard widgets
- Page spacing (16): Top-level page margins

**Grid Structure**:
- Dashboard: 12-column responsive grid (gap-6)
- Data Tables: Full-width with internal column definitions
- Card Layouts: 3-column desktop (lg:grid-cols-3), 2-column tablet (md:grid-cols-2), single mobile
- Forms: 2-column desktop for efficiency, single mobile
- Max Container Width: max-w-7xl (centered layouts)

**Elevation System**:
- Level 0: bg-background (page background)
- Level 1: shadow-sm (cards, tables)
- Level 2: shadow-md (hover states, active cards)
- Level 3: shadow-lg (modals, dropdowns, floating action button)
- Level 4: shadow-xl (tooltips, notifications)

### D. Component Library

**Navigation**:
- Sidebar: 280px wide, collapsible to 64px icon-only, sticky positioning
- Top Bar: 64px height, contains breadcrumbs, global search, notifications, profile
- Breadcrumbs: Text secondary color, chevron separators, last item bold
- Quick Create Modal: Cmd+K triggered, centered overlay with blurred backdrop

**Cards & Containers**:
- Standard Card: rounded-lg, shadow-sm, p-6, bg-surface
- Stat Card: Larger number display (text-3xl), secondary label below, trend indicator (arrow + percentage)
- Deal Card (Kanban): Compact p-4, property image thumbnail top, price prominent, drag handle subtle
- Contact Card: Profile photo left (w-12 h-12 rounded-full), info right, last contact date text-sm text-secondary

**Data Display**:
- Table: Striped rows (even:bg-surface-variant), hover:bg-primary/5, sticky header, sortable columns with arrow icons
- List Items: py-4 px-6, border-b dividers, hover:bg-surface-variant
- Timeline: Vertical line left (border-l-2), dot markers (w-3 h-3 rounded-full), entries pl-6
- Property Grid: Aspect ratio 4:3 images, overlay gradient bottom for text, hover lift effect (hover:-translate-y-1)

**Forms & Inputs**:
- Text Input: h-10, rounded-md, border-2 border-surface-variant, focus:border-primary, px-3
- Select/Dropdown: Same as input, chevron-down icon right
- Checkbox/Radio: w-5 h-5, rounded (checkbox) or rounded-full (radio), accent-primary
- Multi-step Forms: Progress dots top, 8 steps max, current step primary color
- Validation: Error text-sm text-error below field, success border-success

**Buttons**:
- Primary: bg-primary text-white h-10 px-6 rounded-md font-medium shadow-sm hover:bg-primary-variant
- Secondary: variant="outline" border-2 border-primary text-primary hover:bg-primary/5
- Ghost: variant="ghost" text-primary hover:bg-primary/10
- Icon Only: w-10 h-10 rounded-md center icon
- Floating Action: Fixed bottom-right, w-14 h-14 rounded-full bg-secondary text-white shadow-xl

**Badges & Labels**:
- Status Badge: px-2.5 py-0.5 rounded-full text-xs font-medium (hot: bg-error/10 text-error)
- Lead Score: Circular badge w-8 h-8 rounded-full text-sm font-bold centered
- Count Badge: Notification dots, min-w-5 h-5 rounded-full bg-error text-white text-xs

**Charts & Visualizations**:
- KPI Numbers: text-4xl font-bold primary color, trend below text-sm with up/down arrow
- Bar Charts: rounded-t bars, gap-2, max-height viewport-based
- Line Charts: Smooth curves, gradient fill below line (opacity-20), data points on hover
- Funnel: Trapezoid shapes, width proportional to percentage, conversion rate labels

**Modals & Overlays**:
- Modal: max-w-2xl centered, rounded-lg shadow-xl, backdrop blur-sm bg-black/50
- Dropdown Menu: rounded-md shadow-lg, py-1, items px-4 py-2 hover:bg-surface-variant
- Toast Notifications: Fixed top-right, slide-in animation, auto-dismiss 5s, max 3 stacked
- Tooltips: rounded px-2 py-1 text-sm bg-gray-900 text-white shadow-lg, arrow pointer

**Kanban Board**:
- Swim Lane: min-w-80, bg-surface-variant rounded-lg p-4
- Lane Header: Sticky top-0, bg-surface-variant, count badge, add button
- Card Spacing: gap-3 between cards, min-height for empty states
- Drag Indicators: Subtle dashed border on dragover, smooth transition on drop

### E. Animations & Interactions

**Minimal Animation Philosophy**: Purposeful motion only
- Page Transitions: None (instant navigation for productivity)
- Hover States: 150ms ease-in-out color/shadow changes
- Drag & Drop: Opacity 0.5 on drag start, smooth position interpolation
- Loading States: Skeleton screens (pulse animation) for initial load, spinner for actions
- Success Feedback: Checkmark icon scale-in (300ms), green flash border (500ms fade)

**Interactive Feedback**:
- Click: Subtle scale-down (scale-95) on active state
- Delete: Slide-out + fade (300ms) before removal
- Expand/Collapse: Max-height transition (200ms ease-out)
- Notifications: Slide-in from right (300ms), pause on hover

---

## Images

**Dashboard Header**: None - focus on data density
**Empty States**: Illustration placeholders (simple line art, 200x200px, centered in empty tables/lists)
**Property Cards**: 4:3 aspect ratio thumbnails, object-cover, rounded-t-lg, lazy loaded
**Agent Profiles**: Circular avatars (w-10 h-10 to w-24 h-24 depending on context), initials fallback
**Listing Detail**: Lightbox gallery, primary image 16:9 hero (max-h-96), thumbnails below (gap-2, w-20 h-20)

**No large hero images** - this is a utility dashboard prioritizing information density and quick task completion.