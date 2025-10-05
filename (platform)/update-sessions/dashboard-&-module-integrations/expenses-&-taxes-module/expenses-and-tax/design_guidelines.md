# Expense & Tax Dashboard Design Guidelines

## Design Approach: Modern Financial Dashboard System

**Selected Approach:** Design System (shadcn/ui foundation) with inspiration from Linear, Stripe Dashboard, and modern fintech interfaces.

**Rationale:** This is a utility-focused productivity tool requiring clarity, efficiency, and data-dense displays. The design prioritizes scanability, quick actions, and professional aesthetics suitable for financial data.

**Core Principles:**
- Data clarity over decoration
- Consistent, predictable patterns
- Efficient workflows with minimal clicks
- Professional, trustworthy aesthetic for financial data

---

## Color Palette

**Light Mode:**
- Background: 0 0% 100% (white)
- Secondary Background: 240 4.8% 95.9% (cards, sidebar)
- Border: 240 5.9% 90%
- Muted Text: 240 3.8% 46.1%
- Primary Text: 240 10% 3.9%
- Primary Brand: 222 47% 11% (dark slate for trust/professionalism)
- Accent: 142 76% 36% (green for positive financial data, tax savings)
- Destructive: 0 84% 60% (red for warnings, deletions)
- Chart Colors: 217 91% 60% (blue), 142 76% 36% (green), 24 95% 53% (orange), 262 83% 58% (purple)

**Dark Mode:**
- Background: 240 10% 3.9%
- Secondary Background: 240 3.7% 15.9%
- Border: 240 3.7% 15.9%
- Muted Text: 240 5% 64.9%
- Primary Text: 0 0% 98%
- Primary Brand: 217 91% 60% (lighter blue for dark mode)
- Maintain same accent and destructive colors with adjusted luminance

---

## Typography

**Font Family:**
- Primary: Inter (via Google Fonts) for all UI elements
- Monospace: JetBrains Mono for currency amounts, dates, IDs

**Scale:**
- Page Title: text-2xl font-semibold (dashboard header)
- Section Headers: text-lg font-semibold
- Card Titles: text-base font-medium
- Body Text: text-sm
- Labels: text-xs font-medium uppercase tracking-wide text-muted-foreground
- Currency/Numbers: text-sm font-mono tabular-nums (for alignment)
- Small Detail: text-xs text-muted-foreground

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Micro spacing (icon gaps, inline elements): 2
- Component padding: 4, 6
- Card padding: 6, 8
- Section spacing: 12, 16
- Page margins: 8, 12

**Grid Structure:**
- Dashboard uses 12-column grid (grid-cols-12)
- Sidebar: col-span-2 (collapsible to icon-only)
- Main content: col-span-10
- Summary cards: 3-column grid (grid-cols-3) on desktop, stack on mobile
- Expense table: full-width within main area

**Container Widths:**
- Main dashboard: max-w-full with px-8
- Modals: max-w-2xl for forms, max-w-4xl for receipt viewer
- Card max-width: no constraint (use grid)

---

## Component Library

**Navigation & Header:**
- Top bar: h-16 with logo, breadcrumb, dark mode toggle, user menu
- Collapsible sidebar: w-64 expanded, w-16 collapsed with icon-only navigation
- Active state: primary background with rounded corners

**Dashboard Cards:**
- White/dark background with subtle border
- Rounded corners: rounded-lg
- Padding: p-6
- Drop shadow: shadow-sm
- Hover state: subtle border color shift (no elevation change)

**Expense Table:**
- Zebra striping: even rows with muted background
- Row height: h-12 for comfortable scanning
- Sticky header with border-b
- Hover row: slight background highlight
- Cell padding: px-4 py-3
- Action buttons: ghost variant, appear on row hover

**Forms & Modals:**
- Modal backdrop: backdrop-blur-sm with dark overlay
- Form layout: single column, labels above inputs
- Input height: h-10
- Button height: h-10
- Spacing between fields: space-y-4
- Upload zone: dashed border, hover state with primary border

**Charts:**
- Pie chart: 300px diameter on desktop, use same chart color palette
- Line chart: aspect-ratio-[16/9], responsive with zoom controls below
- Legend: horizontal below chart with dot indicators
- Tooltips: white/dark background with shadow-lg, rounded-md

**Buttons:**
- Primary: filled with primary color, white text
- Secondary: outline variant
- Ghost: for table actions and icon buttons
- Destructive: red background for delete actions
- Icon buttons: h-9 w-9 for consistency

**Badges:**
- Category badges: rounded-full px-3 py-1 text-xs with category-specific colors
- Status indicators: h-2 w-2 rounded-full inline dots

**Data Display:**
- Summary metric cards: large number (text-3xl font-bold font-mono), label below (text-sm text-muted-foreground), trend indicator with arrow icon
- Empty states: centered content with icon, heading, and descriptive text
- Loading states: skeleton loaders matching component dimensions

---

## Key Interactions

**Keyboard Shortcuts:**
- Display shortcut hints in tooltips (text-xs text-muted-foreground)
- "N" overlay: subtle toast notification on first use

**Animations:**
- Modal enter/exit: scale and opacity transition (200ms)
- Sidebar collapse: width transition (150ms ease-in-out)
- Table row hover: background transition (100ms)
- Chart tooltips: fade-in (100ms)
- No decorative animations

**Notifications:**
- Toast position: bottom-right
- Success: green accent with check icon
- Error: destructive color with alert icon
- Info: primary color with info icon
- Auto-dismiss: 4 seconds

---

## Visual Hierarchy

**Dashboard Layout Priority:**
1. Summary cards at top (3-column grid)
2. Quick Add button (prominent, top-right of content area)
3. Expense table (largest area, central focus)
4. Charts (2-column grid below table)
5. Tax estimate card (sidebar or bottom-right)

**Density:**
- Comfortable spacing for financial data (avoid cramming)
- Generous padding in cards (p-6 to p-8)
- Tables use compact spacing (py-3) for scanability
- Maintain breathing room around interactive elements

**Responsive Breakpoints:**
- Mobile: Stack all cards, full-width table with horizontal scroll
- Tablet: 2-column summary cards, sidebar collapses to icons
- Desktop: Full 3-column layout with expanded sidebar

This design creates a professional, efficient dashboard that prioritizes data clarity and quick expense management workflows while maintaining visual sophistication appropriate for financial tools.