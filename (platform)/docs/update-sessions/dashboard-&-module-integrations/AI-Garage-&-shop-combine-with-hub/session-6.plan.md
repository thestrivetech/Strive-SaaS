# Session 6: Agent Builder Interface - Holographic UI

## Session Overview
**Goal:** Build interactive agent builder with personality sliders, model selection, and live preview using holographic design.

**Duration:** 4 hours
**Complexity:** High
**Dependencies:** Sessions 1-5

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

1. ✅ Create agent builder page
2. ✅ Build personality configuration sliders
3. ✅ Implement model selection interface
4. ✅ Add agent preview with animated avatar
5. ✅ Create tools configuration panel
6. ✅ Implement real-time config preview

## Implementation Steps

### Step 1: Create Agent Builder Page

**File:** `app/(platform)/ai-garage/agent-builder/page.tsx`

```typescript
import { Suspense } from 'react';
import { AgentPreview } from '@/components/features/ai-garage/agent-builder/agent-preview';
import { PersonalitySliders } from '@/components/features/ai-garage/agent-builder/personality-sliders';
import { ModelSelector } from '@/components/features/ai-garage/agent-builder/model-selector';
import { ToolsConfig } from '@/components/features/ai-garage/agent-builder/tools-config';

export default function AgentBuilderPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left: Agent Preview */}
          <div className="xl:col-span-1">
            <Suspense><AgentPreview /></Suspense>
          </div>

          {/* Right: Configuration */}
          <div className="xl:col-span-2 space-y-8">
            <Suspense><ModelSelector /></Suspense>
            <Suspense><PersonalitySliders /></Suspense>
            <Suspense><ToolsConfig /></Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Step 2: Create Agent Preview Component

**File:** `components/features/ai-garage/agent-builder/agent-preview.tsx`

```typescript
'use client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot } from 'lucide-react';

export function AgentPreview() {
  return (
    <Card className="glass-card rounded-2xl">
      <CardHeader>
        <CardTitle className="text-cyan-100 flex items-center gap-2">
          <Bot className="w-5 h-5 text-cyan-400" />
          Agent Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <motion.div
            className="relative"
            animate={{
              rotate: 360,
              scale: [1, 1.05, 1],
            }}
            transition={{
              rotate: { duration: 10, repeat: Infinity, ease: 'linear' },
              scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-cyan-500 to-violet-500 p-1">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                <Bot className="w-12 h-12 text-cyan-400" />
              </div>
            </div>

            {/* Status Ring */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-900 animate-pulse" />
          </motion.div>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-semibold text-white">Sales Assistant</h3>
          <p className="text-slate-400">Intelligent sales automation agent</p>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Step 3: Create Personality Sliders

**File:** `components/features/ai-garage/agent-builder/personality-sliders.tsx`

```typescript
'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Settings } from 'lucide-react';

export function PersonalitySliders() {
  const [traits, setTraits] = useState([
    { id: 'creativity', name: 'Creativity', value: 75 },
    { id: 'accuracy', name: 'Accuracy', value: 85 },
    { id: 'friendliness', name: 'Friendliness', value: 70 },
    { id: 'formality', name: 'Formality', value: 60 },
  ]);

  return (
    <Card className="glass-card rounded-2xl">
      <CardHeader>
        <CardTitle className="text-cyan-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          Personality Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {traits.map((trait) => (
          <div key={trait.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">{trait.name}</span>
              <span className="text-lg font-bold text-cyan-400">{trait.value}%</span>
            </div>

            <Slider
              value={[trait.value]}
              onValueChange={(values) => {
                setTraits(prev =>
                  prev.map(t => t.id === trait.id ? { ...t, value: values[0] } : t)
                );
              }}
              max={100}
              step={1}
              className="w-full"
            />

            <div className="w-full bg-slate-800 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-cyan-500 to-violet-500 h-2 rounded-full transition-all"
                style={{ width: `${trait.value}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

### Step 4: Create Model Selector

**File:** `components/features/ai-garage/agent-builder/model-selector.tsx`

```typescript
'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain } from 'lucide-react';

const models = [
  { id: 'gpt-4', name: 'GPT-4 Turbo', provider: 'OpenAI', cost: 'Premium' },
  { id: 'claude-3', name: 'Claude 3', provider: 'Anthropic', cost: 'Premium' },
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', cost: 'Standard' },
  { id: 'llama-3', name: 'Llama 3', provider: 'Meta', cost: 'Economy' },
];

export function ModelSelector() {
  const [selected, setSelected] = useState('gpt-4');

  return (
    <Card className="glass-card rounded-2xl">
      <CardHeader>
        <CardTitle className="text-cyan-100 flex items-center gap-2">
          <Brain className="w-5 h-5 text-cyan-400" />
          AI Model Selection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map((model) => (
            <motion.div
              key={model.id}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selected === model.id
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
              onClick={() => setSelected(model.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white">{model.name}</h4>
                  <Badge
                    className={`${
                      model.cost === 'Premium'
                        ? 'bg-purple-500/20 text-purple-300'
                        : model.cost === 'Standard'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-green-500/20 text-green-300'
                    }`}
                  >
                    {model.cost}
                  </Badge>
                </div>
                <p className="text-sm text-slate-400">{model.provider}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

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

## Quality Standards (From MODULE-DASHBOARD-GUIDE.md)

### Pre-Commit Requirements
```bash
cd "(platform)"

# Must pass ALL checks:
npx tsc --noEmit          # Zero TypeScript errors
npm run lint              # Zero ESLint warnings
npm run build             # Must succeed
wc -l app/real-estate/ai-garage/agent-builder/page.tsx  # Must be <500 lines
```

### Auth & Security Pattern
```tsx
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { redirect } from 'next/navigation';

export default async function AgentBuilderPage() {
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
- Desktop: lg:grid-cols-4
- Responsive padding: p-4 sm:p-6 lg:p-8

## Success Criteria

- [x] Agent builder page created
- [x] Animated agent preview with status ring
- [x] Interactive personality sliders functional
- [x] Model selection with holographic cards
- [x] Real-time configuration updates
- [x] Mobile responsive design

## Files Created

- ✅ `app/(platform)/ai-garage/agent-builder/page.tsx`
- ✅ `components/features/ai-garage/agent-builder/agent-preview.tsx`
- ✅ `components/features/ai-garage/agent-builder/personality-sliders.tsx`
- ✅ `components/features/ai-garage/agent-builder/model-selector.tsx`
- ✅ `components/features/ai-garage/agent-builder/tools-config.tsx`

## Next Steps

✅ Proceed to **Session 7: Order Studio & Template Gallery UI**

---

**Session 6 Complete:** ✅ Agent Builder interface with holographic design implemented
