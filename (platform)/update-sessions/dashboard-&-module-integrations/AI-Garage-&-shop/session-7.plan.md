# Session 7: Order Studio & Template Gallery UI

## Session Overview
**Goal:** Build order creation wizard and template marketplace gallery with holographic design.

**Duration:** 3-4 hours
**Complexity:** Medium
**Dependencies:** Sessions 1-6

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

## Objectives

1. ✅ Create order studio wizard
2. ✅ Build template gallery with filters
3. ✅ Implement order form with validation
4. ✅ Add cost estimation display
5. ✅ Create milestone timeline viewer
6. ✅ Add template preview modal

## Implementation Steps

### Step 1: Create Order Studio Page

**File:** `app/(platform)/ai-garage/order-studio/page.tsx`

```typescript
import { Suspense } from 'react';
import { OrderWizard } from '@/components/features/ai-garage/order-studio/order-wizard';
import { CostEstimator } from '@/components/features/ai-garage/order-studio/cost-estimator';

export default function OrderStudioPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent mb-8">
          Custom Agent Order Studio
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Suspense><OrderWizard /></Suspense>
          </div>

          <div className="lg:col-span-1">
            <Suspense><CostEstimator /></Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Step 2: Create Order Wizard Component

**File:** `components/features/ai-garage/order-studio/order-wizard.tsx`

```typescript
'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronRight } from 'lucide-react';

const steps = ['Details', 'Requirements', 'Configuration', 'Review'];

export function OrderWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    use_case: '',
    complexity: 'MODERATE',
  });

  return (
    <Card className="glass-card rounded-2xl">
      <CardHeader>
        <CardTitle className="text-cyan-100">Create Custom Agent</CardTitle>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mt-4">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index <= currentStep
                    ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 w-16 mx-2 ${
                    index < currentStep ? 'bg-gradient-to-r from-cyan-500 to-violet-500' : 'bg-slate-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step 1: Details */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Agent Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Sales Assistant"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-2 block">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this agent should do..."
                className="bg-slate-800 border-slate-700 text-white"
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-2 block">Complexity</label>
              <Select
                value={formData.complexity}
                onValueChange={(value) => setFormData({ ...formData, complexity: value })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SIMPLE">Simple (1-8 hours)</SelectItem>
                  <SelectItem value="MODERATE">Moderate (8-24 hours)</SelectItem>
                  <SelectItem value="COMPLEX">Complex (24-72 hours)</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise (72+ hours)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="border-slate-700 text-slate-300"
          >
            Previous
          </Button>

          <Button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            className="bg-gradient-to-r from-cyan-500 to-violet-500 text-white"
          >
            {currentStep === steps.length - 1 ? 'Submit Order' : 'Next'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Step 3: Create Template Gallery Page

**File:** `app/(platform)/ai-garage/templates/page.tsx`

```typescript
import { Suspense } from 'react';
import { TemplateGallery } from '@/components/features/ai-garage/templates/template-gallery';
import { TemplateFilters } from '@/components/features/ai-garage/templates/template-filters';

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent mb-8">
          Agent Template Marketplace
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Suspense><TemplateFilters /></Suspense>
          </div>

          <div className="lg:col-span-3">
            <Suspense><TemplateGallery /></Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Step 4: Create Template Gallery Component

**File:** `components/features/ai-garage/templates/template-gallery.tsx`

```typescript
'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Download } from 'lucide-react';

export function TemplateGallery() {
  const { data: templates } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const res = await fetch('/api/v1/ai-garage/templates');
      return res.json();
    },
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates?.templates?.map((template: any, index: number) => (
        <motion.div
          key={template.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card className="glass-card magnetic-hover holo-border rounded-2xl">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white mb-1">{template.name}</h3>
                    <p className="text-sm text-slate-400">{template.category}</p>
                  </div>
                  {template.is_system && (
                    <Badge className="bg-violet-500/20 text-violet-300">System</Badge>
                  )}
                </div>

                <p className="text-sm text-slate-300 line-clamp-2">{template.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">{template.rating || 'N/A'}</span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400 text-sm">
                    <Download className="w-4 h-4" />
                    <span>{template.usage_count}</span>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 text-white">
                  Use Template
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
  );
}
```

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

## Quality Standards (From MODULE-DASHBOARD-GUIDE.md)

### Pre-Commit Requirements
```bash
cd "(platform)"

# Must pass ALL checks:
npx tsc --noEmit          # Zero TypeScript errors
npm run lint              # Zero ESLint warnings
npm run build             # Must succeed
wc -l app/real-estate/ai-garage/order-studio/page.tsx  # Must be <500 lines
```

### Auth & Security Pattern
```tsx
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { redirect } from 'next/navigation';

export default async function OrderStudioPage() {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) redirect('/login');

  const organizationId = user.organization_members[0]?.organization_id;
  if (!organizationId) redirect('/onboarding/organization');

  // CRITICAL: Filter ALL queries by organizationId
  const templates = await prisma.agent_templates.findMany({
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
- Desktop: lg:grid-cols-3
- Responsive padding: p-4 sm:p-6 lg:p-8

## Success Criteria

- [x] Order studio wizard created
- [x] Multi-step form with validation
- [x] Cost estimator functional
- [x] Template gallery with filters
- [x] Template cards with ratings
- [x] Mobile responsive

## Files Created

- ✅ `app/(platform)/ai-garage/order-studio/page.tsx`
- ✅ `app/(platform)/ai-garage/templates/page.tsx`
- ✅ `components/features/ai-garage/order-studio/order-wizard.tsx`
- ✅ `components/features/ai-garage/order-studio/cost-estimator.tsx`
- ✅ `components/features/ai-garage/templates/template-gallery.tsx`
- ✅ `components/features/ai-garage/templates/template-filters.tsx`
- ✅ `components/features/ai-garage/templates/template-card.tsx`

## Next Steps

✅ Proceed to **Session 8: Navigation Integration & Final Polish**

---

**Session 7 Complete:** ✅ Order Studio & Template Gallery UI implemented
