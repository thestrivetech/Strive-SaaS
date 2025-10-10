# AI Garage Session Plans - Update Checklist

**Purpose:** Track specific changes needed in each session plan file to align with dashboard modernization approach
**Reference:** `DASHBOARD-MODERNIZATION-UPDATE.md` (main guide)
**Date:** 2025-10-08

---

## 🎯 Overview

This checklist documents specific sections/text that need to be added to each AI Garage session plan to ensure alignment with:
1. Dashboard modernization quality standards
2. AI Garage custom holographic theme
3. Platform authentication/security patterns
4. Multi-tenancy requirements

---

## ✅ Session 1: Database Foundation

**File:** `session-1.plan.md`
**Status:** ✅ Complete (October 5, 2025)
**Changes Required:** ✅ None (backend only, no UI)

**Reason:** Session 1 is database-only, no UI components. No alignment needed.

---

## ✅ Session 2: Agent Orders Backend

**File:** `session-2.plan.md`
**Status:** ⬜ Not Started
**Changes Required:** ✅ None (backend only, no UI)

**Reason:** Session 2 is Server Actions and API routes only, no UI components. No alignment needed.

---

## ✅ Session 3: Agent Templates Backend

**File:** `session-3.plan.md`
**Status:** ⬜ Not Started
**Changes Required:** ✅ None (backend only, no UI)

**Reason:** Session 3 is backend logic only, no UI components. No alignment needed.

---

## ✅ Session 4: Visual Tool Builder Backend

**File:** `session-4.plan.md`
**Status:** ⬜ Not Started
**Changes Required:** ✅ None (backend only, no UI)

**Reason:** Session 4 is backend logic only, no UI components. No alignment needed.

---

## 🚨 Session 5: Agent Orders UI Components

**File:** `session-5.plan.md`
**Status:** ⬜ Not Started
**Changes Required:** 🚨 CRITICAL - First UI session

### Required Updates

#### 1. Add Warning Section at Top
**Location:** After session overview, before objectives

**Add This Block:**
```markdown
---

## ⚠️ CRITICAL: CUSTOM THEME REQUIREMENTS

**AI Garage uses a CUSTOM HOLOGRAPHIC THEME - DO NOT apply standard modernization patterns**

### Required Reading BEFORE Starting:
1. **Custom Theme Guide:** `DASHBOARD-MODERNIZATION-UPDATE.md` (this folder)
2. **Design Guidelines:** `AIGarageWorkbench/design_guidelines.md`
3. **Quality Standards:** `(platform)/docs/MODULE-DASHBOARD-GUIDE.md` (Section 8-9 only)

### DO NOT Use:
- ❌ Standard glass morphism (glass, glass-strong classes)
- ❌ Standard neon borders (cyan #00d2ff, purple, green, orange)
- ❌ ModuleHeroSection component
- ❌ EnhancedCard component
- ❌ Patterns from CRM/Workspace/Marketplace dashboards

### DO Use:
- ✅ Holographic glass morphism (custom classes)
- ✅ Aurora gradient system (violet/cyan/emerald)
- ✅ Custom color palette: cyan #00b6d6, violet #a78bfa, emerald #10b981
- ✅ Magnetic hover effects (Framer Motion)
- ✅ Dark mode backgrounds (slate-900/950)
- ✅ Quality standards (TypeScript, ESLint, file size <500 lines)
- ✅ Auth/security patterns from MODULE-DASHBOARD-GUIDE.md

### Reference:
- **Similar Custom Theme:** REID Analytics (`app/real-estate/rei-analytics/dashboard/page.tsx`)
- **Different From:** All other module dashboards (CRM, Workspace, etc.)

---
```

#### 2. Update Dashboard Creation Section

**Find:** Section about creating dashboard page
**Add After Dashboard File Path:**

```markdown
### Dashboard Design Requirements

**Theme:** Holographic/Futuristic (Custom - Not Standard Platform)

**Visual Elements:**
- Dark mode with slate-950/slate-900 gradient backgrounds
- Holographic glass cards: `bg-slate-900/70 backdrop-blur-xl`
- Aurora borders: `from-indigo-500/20 to-cyan-500/40`
- Magnetic hover: `hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]`
- Gradient text: `from-cyan-400 to-violet-400 bg-clip-text text-transparent`

**Layout Pattern:**
```tsx
// Hero Section (Custom - NOT ModuleHeroSection)
<section className="bg-gradient-to-br from-violet-900/20 via-cyan-900/20 to-emerald-900/20">
  <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
    AI Garage Dashboard
  </h1>
</section>

// Stats Cards (Holographic Glass)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <div className="
    bg-slate-900/70
    backdrop-blur-xl
    border border-indigo-500/20
    rounded-2xl
    hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]
    transition-all duration-300
  ">
    {/* Stat content */}
  </div>
</div>
```

**Components to Build:**
1. `HolographicCard` - Replaces EnhancedCard
2. `AuroraBackground` - Custom gradient backgrounds
3. `MagneticButton` - Interactive buttons
4. `OrderStatusBadge` - Holographic status indicators
```

#### 3. Add Quality Standards Section

**Location:** Before "Success Criteria" section
**Add:**

```markdown
## Quality Standards (From MODULE-DASHBOARD-GUIDE.md)

### Pre-Commit Requirements
```bash
cd "(platform)"

# Must pass ALL checks:
npx tsc --noEmit          # Zero TypeScript errors
npm run lint              # Zero ESLint warnings
npm run build             # Must succeed
wc -l app/real-estate/ai-garage/dashboard/page.tsx  # Must be <500 lines
```

### Auth & Security Pattern
```tsx
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { redirect } from 'next/navigation';

export default async function AIGarageDashboard() {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) redirect('/login');

  const organizationId = user.organization_members[0]?.organization_id;
  if (!organizationId) redirect('/onboarding/organization');

  // CRITICAL: Filter ALL queries by organizationId
  const orders = await prisma.custom_agent_orders.findMany({
    where: { organizationId }
  });

  // ...
}
```

### Accessibility Requirements
- Proper heading hierarchy (h1 → h2 → h3)
- ARIA labels on interactive elements
- Keyboard navigation functional
- Color contrast AA minimum (4.5:1)
- Focus states visible

### Responsive Design
- Mobile-first: grid-cols-1
- Tablet: md:grid-cols-2
- Desktop: lg:grid-cols-4
- Responsive padding: p-4 sm:p-6 lg:p-8
```

---

## 🚨 Session 6: Agent Templates UI

**File:** `session-6.plan.md`
**Status:** ⬜ Not Started
**Changes Required:** 🚨 CRITICAL - Template gallery UI

### Required Updates

#### 1. Add Same Warning Section as Session 5
**Location:** After session overview
**Content:** Same custom theme warning block from Session 5

#### 2. Add Template Gallery Design Specs

**Find:** Section about template gallery/list
**Add:**

```markdown
### Template Gallery Design (Holographic Theme)

**Layout:**
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`
- Aurora gradient background
- Holographic template cards

**Template Card Pattern:**
```tsx
<motion.div
  whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(6, 182, 212, 0.4)' }}
  transition={{ duration: 0.3 }}
  className="
    bg-slate-900/70
    backdrop-blur-xl
    border-2 border-transparent
    bg-gradient-to-r from-indigo-500/20 to-cyan-500/40
    rounded-2xl
    p-6
  "
>
  {/* Template avatar */}
  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500" />

  {/* Template name with gradient */}
  <h3 className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
    {template.name}
  </h3>

  {/* Category badge with aurora styling */}
  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
    {template.category}
  </span>
</motion.div>
```

**Filtering UI:**
- Aurora gradient for active filters
- Magnetic button interactions
- Holographic dropdown menus
```

#### 3. Add Quality Standards
Same section as Session 5

---

## 🚨 Session 7: Visual Tool Builder UI

**File:** `session-7.plan.md`
**Status:** ⬜ Not Started
**Changes Required:** 🚨 CRITICAL - Most complex UI session

### Required Updates

#### 1. Add Same Warning Section as Session 5
**Location:** After session overview
**Content:** Same custom theme warning block from Session 5

#### 2. Add Canvas Design Specifications

**Find:** Section about canvas/builder UI
**Add:**

```markdown
### Tool Builder Canvas Design (Holographic Theme)

**Canvas Background:**
```tsx
<div className="
  relative w-full h-screen
  bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950
  overflow-hidden
">
  {/* Aurora gradient grid overlay */}
  <div className="
    absolute inset-0
    bg-[linear-gradient(rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.05)_1px,transparent_1px)]
    bg-[size:50px_50px]
  " />

  {/* Canvas content */}
</div>
```

**Component Nodes:**
```tsx
<motion.div
  drag
  dragMomentum={false}
  whileHover={{ scale: 1.05 }}
  className="
    absolute
    bg-slate-900/90
    backdrop-blur-xl
    border border-cyan-500/30
    rounded-xl
    shadow-[0_0_20px_rgba(6,182,212,0.3)]
    p-4
  "
>
  {/* Node content */}
</motion.div>
```

**Connection Lines:**
- Use SVG with aurora gradient stroke
- Animated flow effect
- Magnetic snapping to connection points
- Holographic glow on active connections

**Component Palette:**
```tsx
<aside className="
  w-64
  bg-slate-900/70
  backdrop-blur-xl
  border-r border-indigo-500/20
  p-4
">
  {/* Holographic component cards */}
</aside>
```

**Interactive Features:**
- Magnetic node dragging (snap to grid)
- Aurora gradient for selected nodes
- Holographic connection indicators
- Real-time visual feedback with glow effects
```

#### 3. Add Quality Standards
Same section as Session 5

---

## 🚨 Session 8: Showcase & Review System

**File:** `session-8.plan.md`
**Status:** ⬜ Not Started
**Changes Required:** 🚨 CRITICAL - Showcase gallery UI

### Required Updates

#### 1. Add Same Warning Section as Session 5
**Location:** After session overview
**Content:** Same custom theme warning block from Session 5

#### 2. Add Showcase Gallery Design Specs

**Find:** Section about showcase/gallery
**Add:**

```markdown
### Showcase Gallery Design (Holographic Theme)

**Gallery Layout:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <motion.article
    whileHover={{ y: -8, boxShadow: '0 0 40px rgba(99, 102, 241, 0.4)' }}
    className="
      bg-slate-900/70
      backdrop-blur-xl
      border-2 border-transparent
      bg-gradient-to-br from-indigo-500/20 via-cyan-500/20 to-violet-500/20
      rounded-2xl
      overflow-hidden
    "
  >
    {/* Project showcase card */}
  </motion.article>
</div>
```

**Review System:**
```tsx
// Holographic star rating
<div className="flex gap-1">
  {[1, 2, 3, 4, 5].map((star) => (
    <Star
      key={star}
      className={`
        h-5 w-5 transition-all
        ${filled ? 'fill-cyan-400 text-cyan-400' : 'text-slate-600'}
        ${filled && 'drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]'}
      `}
    />
  ))}
</div>

// Aurora gradient for rating bars
<div className="h-2 rounded-full bg-slate-800 overflow-hidden">
  <div
    className="h-full bg-gradient-to-r from-cyan-500 to-violet-500"
    style={{ width: `${percentage}%` }}
  />
</div>
```

**Filtering & Sorting:**
- Holographic dropdown menus
- Aurora gradient for active filters
- Magnetic button interactions
- Category badges with holographic styling
```

#### 3. Add Quality Standards
Same section as Session 5

---

## 📋 Additional Files to Update

### Design Guidelines Enhancement

**File:** `AIGarageWorkbench/design_guidelines.md`
**Changes Required:** ⚠️ Add quality standards section

**Add New Section (at end):**

```markdown
---

## Quality Standards & Platform Integration

### Alignment with Platform Standards

While AI Garage maintains a custom holographic theme, it MUST follow platform quality standards:

#### 1. Code Quality
- **TypeScript:** Zero errors required
- **ESLint:** Zero warnings in new code
- **File Size:** <500 lines per file (hard limit)
- **Build:** Must succeed without errors

#### 2. Authentication & Security
```tsx
// REQUIRED in ALL AI Garage pages
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';

export default async function Page() {
  await requireAuth();
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const orgId = user.organization_members[0]?.organization_id;
  if (!orgId) redirect('/onboarding/organization');

  // CRITICAL: Filter by organizationId
  const data = await prisma.model.findMany({
    where: { organizationId: orgId }
  });
}
```

#### 3. Multi-Tenancy
- **ALWAYS filter queries** by organizationId
- **Test tenant isolation:** Users cannot see other orgs' data
- **RLS policies:** Enabled on all tables (from Session 1)

#### 4. Accessibility (WCAG AA)
- **Heading hierarchy:** h1 → h2 → h3 (semantic)
- **ARIA labels:** All interactive elements
- **Keyboard navigation:** Full support
- **Color contrast:** 4.5:1 minimum
- **Focus states:** Visible on all focusable elements

#### 5. Responsive Design
- **Mobile-first:** Design for mobile, enhance for desktop
- **Breakpoints:** sm: 640px, md: 768px, lg: 1024px, xl: 1280px
- **Test viewports:** 375px (mobile), 768px (tablet), 1440px (desktop)
- **Touch targets:** Minimum 44x44px for all interactive elements

#### 6. Performance
- **Server Components:** Default pattern (reduce client JS)
- **Code splitting:** Dynamic imports for heavy components
- **Image optimization:** Use next/image for all images
- **Bundle size:** Monitor with `npm run build`

#### 7. Mock Data Patterns (Development)
```tsx
// Mark clearly as mock data
// Mock data for demonstration - replace with real queries
const MOCK_ORDERS = [
  { id: '1', title: 'Sales Assistant', status: 'IN_PROGRESS' },
  // ...
];

// Plan transition to real data
// TODO: Replace with actual Prisma query when backend ready
```

### Reference Documentation
- **Complete Quality Guide:** `(platform)/docs/MODULE-DASHBOARD-GUIDE.md`
- **Platform Standards:** `(platform)/CLAUDE.md`
- **Custom Theme Alignment:** `DASHBOARD-MODERNIZATION-UPDATE.md`
```

---

## 🎯 Summary Checklist

### Files Requiring Updates

- [ ] **session-5.plan.md** - Add custom theme warning + quality standards
- [ ] **session-6.plan.md** - Add custom theme warning + template gallery specs
- [ ] **session-7.plan.md** - Add custom theme warning + canvas design specs
- [ ] **session-8.plan.md** - Add custom theme warning + showcase gallery specs
- [ ] **AIGarageWorkbench/design_guidelines.md** - Add quality standards section

### Update Priorities

**Priority 1 (Critical):**
- [ ] Session 5: First UI session, sets pattern for others

**Priority 2 (High):**
- [ ] Design guidelines: Foundation for all UI work

**Priority 3 (Medium):**
- [ ] Sessions 6-8: Follow Session 5 pattern

---

## 🔗 Quick Reference

### Documents to Read Before Updating
1. `DASHBOARD-MODERNIZATION-UPDATE.md` - Main alignment guide
2. `AIGarageWorkbench/design_guidelines.md` - Holographic theme specs
3. `(platform)/docs/MODULE-DASHBOARD-GUIDE.md` - Quality standards (Section 8-9)

### Key Principles
1. ✅ **DO** apply quality standards (TypeScript, ESLint, accessibility, security)
2. ❌ **DO NOT** apply standard modernization patterns (glass/neon)
3. ✅ **DO** use holographic theme consistently
4. ✅ **DO** reference REID Analytics as custom theme example

---

**Last Updated:** 2025-10-08
**Status:** Ready for implementation
**Next Action:** Update session-5.plan.md first (foundation for other UI sessions)
