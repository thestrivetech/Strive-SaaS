# Strive Tech SaaS Design Guidelines

## Design Approach
**System-Based with Modern SaaS Inspiration**

Drawing from Linear's minimalist precision, Stripe's dashboard clarity, and Material Design's structured patterns. This creates a professional, trustworthy SaaS experience optimized for productivity and data comprehension.

**Key Principles:**
- Clarity over decoration
- Consistent spatial rhythm
- Data-first hierarchy
- Progressive disclosure

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Primary: 240 100% 27% (Deep indigo for CTAs, active states)
- Background: 0 0% 100% (Pure white)
- Surface: 240 20% 97% (Subtle gray for cards)
- Border: 240 10% 88% (Soft dividers)
- Text Primary: 240 10% 10%
- Text Secondary: 240 5% 45%
- Success: 142 76% 36%
- Warning: 38 92% 50%
- Error: 0 72% 51%

**Dark Mode:**
- Primary: 240 100% 65% (Brighter indigo)
- Background: 240 10% 8% (Deep charcoal)
- Surface: 240 8% 12% (Elevated panels)
- Border: 240 8% 20% (Subtle divisions)
- Text Primary: 240 5% 96%
- Text Secondary: 240 5% 65%

### B. Typography

**Fonts:** Inter (primary), JetBrains Mono (code/numbers)

**Scale:**
- Display: text-4xl font-bold (onboarding headers)
- H1: text-3xl font-semibold (page titles)
- H2: text-2xl font-semibold (section headers)
- H3: text-xl font-medium (card titles)
- Body: text-base font-normal
- Small: text-sm (secondary info)
- Tiny: text-xs (metadata, labels)

### C. Layout System

**Spacing Units:** Tailwind 2, 4, 6, 8, 12, 16, 24 (p-2, m-4, gap-6, etc.)

**Container Strategy:**
- Dashboard: max-w-screen-2xl mx-auto px-6
- Onboarding: max-w-2xl mx-auto
- Pricing: max-w-7xl mx-auto
- Forms: max-w-md within containers

**Grid Patterns:**
- Stats Cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6
- Pricing Tiers: grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4
- Data Tables: Full width with horizontal scroll on mobile

### D. Component Library

**Onboarding Wizard:**
- Stepper: Horizontal progress bar with 4 numbered circles, active state in primary color, completed with checkmarks
- Step Cards: White/surface background, rounded-lg, shadow-sm, p-8
- Navigation: Back (outline), Next/Complete (primary solid), disabled states
- Form Fields: Floating labels, focus ring in primary, error states with red border + text below

**Pricing Page:**
- Tier Cards: border-2, rounded-xl, p-6, hover:shadow-lg transition
- Featured Tier (Growth): border-primary-500, relative with "Most Popular" badge top-right
- Price Display: text-4xl font-bold with /month in text-sm text-secondary
- Feature List: Checkmark icons (green), space-y-3, text-sm
- CTA Buttons: Full-width, primary for featured tier, outline for others

**Admin Dashboard:**
- Sidebar: Fixed left, w-64, surface background, nav items with hover:bg-surface-lighter, active:border-l-4 border-primary
- Top Bar: h-16, border-b, contains breadcrumbs + user menu
- Stat Cards: rounded-lg, p-6, border, with large number (text-3xl), label (text-sm), trend indicator (↑ in green/red)
- Data Tables: Striped rows (even:bg-surface), sticky header, hover:bg-surface-darker, sortable columns with icons
- Charts: Rounded containers, p-4, with chart.js/recharts, primary color scheme

**Form Elements:**
- Input: h-10, rounded-md, border, px-3, focus:ring-2 focus:ring-primary
- Select: Same as input with chevron icon
- Checkbox/Radio: Accent-primary, scale-110 for better click targets
- Button Primary: bg-primary text-white h-10 px-6 rounded-md hover:bg-primary-dark
- Button Outline: border-2 border-primary text-primary bg-transparent

### E. Interactions

**Animations (Minimal):**
- Page transitions: fade-in 150ms
- Card hover: transform scale-[1.02] 200ms
- Button states: bg color 150ms
- Loading spinners: rotate animation for async operations
- NO scroll-triggered animations

**Feedback:**
- Loading: Skeleton screens for data tables, spinner for buttons
- Success: Green toast top-right, 3s auto-dismiss
- Errors: Red toast + inline field errors
- Empty States: Centered icon + text + CTA

## Page-Specific Guidelines

### Pricing Page
- Hero: py-16, centered headline "Simple, Transparent Pricing", subheading about no hidden fees
- Tier Grid: 5 columns on xl, 3 on lg, 2 on md, 1 on sm
- Comparison Table: Below tier cards, features as rows, tiers as columns, checkmarks/dashes
- FAQ Accordion: After pricing, 6-8 common questions
- Footer CTA: "Still have questions? Contact sales" with button

### Onboarding Flow
- Progress persistent top, current step highlighted
- Single form per step, 3-5 fields max
- Validation on blur, submit disabled until valid
- Payment step: Stripe Elements embedded, matches design system colors
- Success: Full-screen confetti animation (brief), then redirect to dashboard

### Admin Dashboard
- Overview: 4 stat cards + 2 charts (subscription distribution pie, revenue line graph)
- Organizations Table: Name, Tier badge, Users count, Status badge, Actions dropdown
- Users Table: Avatar + Name, Email, Role badge, Org link, Last active
- Subscriptions: Tier, Status (colored badges), MRR, Actions
- Analytics: Date range picker, multiple chart types, export CSV button

## Accessibility
- All forms: proper labels, ARIA attributes, keyboard navigation
- Color contrast: WCAG AA minimum (4.5:1 for text)
- Focus indicators: Visible 2px ring on all interactive elements
- Dark mode: Consistent across all pages, toggle in top bar

## Images
**Not Required** - This is a utility-focused SaaS admin interface where data visualization and functional clarity take priority over decorative imagery. All visual communication handled through icons, charts, and UI components.