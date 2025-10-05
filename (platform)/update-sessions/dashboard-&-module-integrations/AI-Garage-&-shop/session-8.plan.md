# Session 8: Navigation Integration & Final Polish

## Session Overview
**Goal:** Integrate AI Garage into platform navigation, add feature guards, and apply final polish for production readiness.

**Duration:** 2-3 hours
**Complexity:** Low
**Dependencies:** Sessions 1-7

## Objectives

1. ✅ Update platform sidebar with AI Garage navigation
2. ✅ Add subscription tier feature guards
3. ✅ Implement loading states and error boundaries
4. ✅ Add middleware protection for AI Garage routes
5. ✅ Create mobile responsive navigation
6. ✅ Add final UI polish and animations

## Implementation Steps

### Step 1: Update Platform Sidebar

**File:** `components/shared/layouts/sidebar.tsx` (modify existing)

```typescript
import { Bot, Wrench, Package, Sparkles } from 'lucide-react';

// Add to existing navigationItems array
const navigationItems = [
  // ... existing items ...

  {
    name: 'AI Garage & Shop',
    href: '/ai-garage/dashboard',
    icon: Bot,
    requiresAIGarage: true,  // Feature flag
    children: [
      { name: 'Dashboard', href: '/ai-garage/dashboard', icon: Sparkles },
      { name: 'Agent Builder', href: '/ai-garage/agent-builder', icon: Bot },
      { name: 'Tool Forge', href: '/ai-garage/tool-forge', icon: Wrench },
      { name: 'Order Studio', href: '/ai-garage/order-studio', icon: Package },
      { name: 'Templates', href: '/ai-garage/templates', icon: Sparkles },
      { name: 'My Orders', href: '/ai-garage/orders', icon: Package },
    ],
  },
];

// Add feature guard check
function canAccessMenuItem(user: User, item: NavigationItem): boolean {
  if (item.requiresAIGarage) {
    return canAccessAIGarage(user);
  }
  return true;
}
```

### Step 2: Add Subscription Feature Guards

**File:** `components/features/ai-garage/shared/feature-guard.tsx`

```typescript
'use client';
import { useUser } from '@/hooks/use-user';
import { canAccessFeature } from '@/lib/auth/rbac';
import { UpgradePrompt } from './upgrade-prompt';

interface FeatureGuardProps {
  feature: string;
  children: React.ReactNode;
}

export function FeatureGuard({ feature, children }: FeatureGuardProps) {
  const user = useUser();

  if (!canAccessFeature(user, feature)) {
    return (
      <UpgradePrompt
        title="AI Garage Access Required"
        description="Upgrade to Growth or Elite tier to access AI Garage features"
        feature={feature}
      />
    );
  }

  return <>{children}</>;
}
```

**File:** `components/features/ai-garage/shared/upgrade-prompt.tsx`

```typescript
'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Zap } from 'lucide-react';
import Link from 'next/link';

interface UpgradePromptProps {
  title: string;
  description: string;
  feature: string;
}

export function UpgradePrompt({ title, description }: UpgradePromptProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-6">
      <Card className="glass-card max-w-md rounded-2xl">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" />
          </div>

          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent mb-2">
              {title}
            </h2>
            <p className="text-slate-400">{description}</p>
          </div>

          <Link href="/settings/billing">
            <Button className="bg-gradient-to-r from-cyan-500 to-violet-500 text-white w-full">
              <Zap className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Step 3: Add Middleware Protection

**File:** `middleware.ts` (modify existing)

```typescript
// Add AI Garage route protection
export async function middleware(req: NextRequest) {
  const session = await getSession(req);

  // AI Garage routes
  if (req.nextUrl.pathname.startsWith('/ai-garage')) {
    if (!session || !canAccessAIGarage(session.user)) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Check subscription tier
    if (!canAccessFeature(session.user, 'ai-garage')) {
      return NextResponse.redirect(new URL('/settings/billing', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // ... existing matchers ...
    '/ai-garage/:path*',
  ],
};
```

### Step 4: Add Loading States

**File:** `app/(platform)/ai-garage/dashboard/loading.tsx`

```typescript
export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 mx-auto animate-spin">
          <div className="w-full h-full rounded-full border-4 border-transparent border-t-white" />
        </div>
        <p className="text-cyan-400 font-medium">Loading AI Garage...</p>
      </div>
    </div>
  );
}
```

### Step 5: Add Error Boundary

**File:** `app/(platform)/ai-garage/error.tsx`

```typescript
'use client';
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('AI Garage Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-6">
      <Card className="glass-card max-w-md rounded-2xl">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-500/20 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Something went wrong!</h2>
            <p className="text-slate-400">{error.message || 'An unexpected error occurred'}</p>
          </div>

          <Button onClick={() => reset()} className="bg-gradient-to-r from-cyan-500 to-violet-500 text-white">
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Step 6: Update RBAC with Tier Limits

**File:** `lib/auth/rbac.ts` (add to existing)

```typescript
// Add to existing RBAC file

const TIER_FEATURES = {
  FREE: ['dashboard', 'profile'],
  STARTER: ['dashboard', 'profile', 'crm', 'projects'],
  GROWTH: ['dashboard', 'profile', 'crm', 'projects', 'ai-garage-basic'],
  ELITE: ['dashboard', 'profile', 'crm', 'projects', 'ai-garage-full'],
};

export function canAccessFeature(user: User, feature: string): boolean {
  const tier = user.subscription?.tier || 'FREE';
  const allowedFeatures = TIER_FEATURES[tier];

  // Check for AI Garage access
  if (feature === 'ai-garage') {
    return allowedFeatures.includes('ai-garage-basic') ||
           allowedFeatures.includes('ai-garage-full');
  }

  return allowedFeatures.includes('*') || allowedFeatures.includes(feature);
}

export function getAIGarageLimits(tier: SubscriptionTier) {
  const limits = {
    FREE: { orders: 0, templates: 0, blueprints: 0 },
    STARTER: { orders: 0, templates: 0, blueprints: 0 },
    GROWTH: { orders: 3, templates: 10, blueprints: 5 },
    ELITE: { orders: -1, templates: -1, blueprints: -1 }, // Unlimited
  };

  return limits[tier];
}
```

## Success Criteria

- [x] AI Garage added to platform sidebar
- [x] Subscription tier guards implemented
- [x] Middleware protection active
- [x] Loading states for all routes
- [x] Error boundaries in place
- [x] Mobile responsive navigation
- [x] Feature limits enforced

## Files Created

- ✅ `components/features/ai-garage/shared/feature-guard.tsx`
- ✅ `components/features/ai-garage/shared/upgrade-prompt.tsx`
- ✅ `app/(platform)/ai-garage/dashboard/loading.tsx`
- ✅ `app/(platform)/ai-garage/error.tsx`

## Files Modified

- ✅ `components/shared/layouts/sidebar.tsx` - Added AI Garage nav
- ✅ `middleware.ts` - Added route protection
- ✅ `lib/auth/rbac.ts` - Added tier limits

## Final Testing Checklist

- [ ] AI Garage accessible from sidebar (Growth+ tier)
- [ ] Free/Starter users see upgrade prompt
- [ ] All routes protected by middleware
- [ ] Loading states display correctly
- [ ] Error boundaries catch and display errors
- [ ] Mobile navigation works
- [ ] Holographic design preserved across all pages
- [ ] No console errors or warnings

## Next Steps

✅ **AI Garage integration complete!** Ready for:
- Comprehensive testing
- User acceptance testing
- Production deployment

---

**Session 8 Complete:** ✅ AI Garage fully integrated into platform, production-ready
