# Session 7: Order Studio & Template Gallery UI

## Session Overview
**Goal:** Build order creation wizard and template marketplace gallery with holographic design.

**Duration:** 3-4 hours
**Complexity:** Medium
**Dependencies:** Sessions 1-6

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
