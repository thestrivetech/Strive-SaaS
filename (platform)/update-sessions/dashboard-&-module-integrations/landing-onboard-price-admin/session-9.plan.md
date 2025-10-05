# Session 9: Feature Flags & System Alerts UI

## Session Overview
**Goal:** Build complete feature flag management and system alerts UI with create/edit forms, enable/disable toggles, and targeting controls.

**Duration:** 3-4 hours
**Complexity:** Medium-High
**Dependencies:** Sessions 1-8

## Objectives

1. ✅ Create feature flags management page
2. ✅ Create system alerts management page
3. ✅ Build feature flag create/edit form
4. ✅ Build system alert create/edit form
5. ✅ Implement enable/disable toggles
6. ✅ Add targeting controls (tiers, orgs, users)
7. ✅ Add rollout percentage slider
8. ✅ Integrate with backend (Session 2)

## Prerequisites

- [x] Admin backend complete (Session 2)
- [x] Admin dashboard UI complete (Session 7)
- [x] shadcn/ui Form components
- [x] TanStack Query installed

## Page Structure

```
Feature Flags Page:
- List of all flags
- Enable/Disable toggle
- Environment filter (dev/staging/prod)
- Create/Edit flag dialog
- Targeting: Tiers, Orgs, Users
- Rollout percentage

System Alerts Page:
- List of active/archived alerts
- Alert level indicators (info/warning/error/success)
- Create/Edit alert dialog
- Targeting: Roles, Tiers, Orgs
- Scheduling (start/end dates)
```

## Component Structure

```
app/(admin)/admin/
├── feature-flags/page.tsx    # Feature flags management
├── alerts/page.tsx            # System alerts management

components/features/admin/
├── feature-flag-form.tsx      # Flag create/edit form
├── feature-flag-card.tsx      # Flag display card
├── system-alert-form.tsx      # Alert create/edit form
├── system-alert-card.tsx      # Alert display card
├── targeting-controls.tsx     # Tier/Org/User targeting
└── rollout-slider.tsx         # Percentage slider
```

## Implementation Steps

### Step 1: Create Feature Flags Page

**File:** `app/(admin)/admin/feature-flags/page.tsx`

```tsx
'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Flag, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { FeatureFlagForm } from '@/components/features/admin/feature-flag-form';

export default function FeatureFlagsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<any>(null);

  // Fetch feature flags
  const { data: flags, isLoading } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      const response = await fetch('/api/v1/admin/feature-flags');
      if (!response.ok) throw new Error('Failed to fetch flags');
      return response.json();
    },
  });

  // Toggle flag mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
      const response = await fetch('/api/v1/admin/feature-flags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isEnabled }),
      });
      if (!response.ok) throw new Error('Failed to update flag');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      toast({
        title: 'Feature flag updated',
        description: 'The flag has been successfully updated.',
      });
    },
  });

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feature Flags</h1>
          <p className="text-muted-foreground">
            Control feature rollouts and A/B testing
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Flag
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Feature Flag</DialogTitle>
            </DialogHeader>
            <FeatureFlagForm
              onSuccess={() => {
                setIsCreateOpen(false);
                queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Flags Grid */}
      <div className="grid gap-4">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          flags?.map((flag: any) => (
            <Card key={flag.id} className="hover-elevate">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Flag className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{flag.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {flag.description || 'No description'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge variant={flag.environment === 'PRODUCTION' ? 'default' : 'secondary'}>
                      {flag.environment}
                    </Badge>
                    <Switch
                      checked={flag.isEnabled}
                      onCheckedChange={(checked) =>
                        toggleMutation.mutate({ id: flag.id, isEnabled: checked })
                      }
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Rollout</p>
                    <p className="font-medium">{flag.rolloutPercent}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Target Tiers</p>
                    <p className="font-medium">
                      {flag.targetTiers.length > 0
                        ? flag.targetTiers.join(', ')
                        : 'All'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium">
                      {new Date(flag.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Updated</p>
                    <p className="font-medium">
                      {new Date(flag.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingFlag(flag)}
                  >
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      {editingFlag && (
        <Dialog open={!!editingFlag} onOpenChange={() => setEditingFlag(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Feature Flag</DialogTitle>
            </DialogHeader>
            <FeatureFlagForm
              initialData={editingFlag}
              onSuccess={() => {
                setEditingFlag(null);
                queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
```

### Step 2: Create Feature Flag Form

**File:** `components/features/admin/feature-flag-form.tsx`

```tsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const flagSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-z0-9_-]+$/),
  description: z.string().max(500).optional(),
  isEnabled: z.boolean().default(false),
  rolloutPercent: z.number().min(0).max(100).default(0),
  environment: z.enum(['DEVELOPMENT', 'STAGING', 'PRODUCTION']),
  category: z.string().max(50).optional(),
});

type FlagFormData = z.infer<typeof flagSchema>;

interface FeatureFlagFormProps {
  initialData?: Partial<FlagFormData>;
  onSuccess: () => void;
}

export function FeatureFlagForm({ initialData, onSuccess }: FeatureFlagFormProps) {
  const form = useForm<FlagFormData>({
    resolver: zodResolver(flagSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      isEnabled: initialData?.isEnabled || false,
      rolloutPercent: initialData?.rolloutPercent || 0,
      environment: initialData?.environment || 'PRODUCTION',
      category: initialData?.category || '',
    },
  });

  const onSubmit = async (data: FlagFormData) => {
    const endpoint = initialData
      ? '/api/v1/admin/feature-flags'
      : '/api/v1/admin/feature-flags';

    const response = await fetch(endpoint, {
      method: initialData ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      onSuccess();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Flag Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Flag Name *</FormLabel>
              <FormControl>
                <Input placeholder="new-feature-rollout" {...field} />
              </FormControl>
              <FormDescription>
                Lowercase with hyphens or underscores only
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what this flag controls..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Environment */}
        <FormField
          control={form.control}
          name="environment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Environment *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="DEVELOPMENT">Development</SelectItem>
                  <SelectItem value="STAGING">Staging</SelectItem>
                  <SelectItem value="PRODUCTION">Production</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Rollout Percentage */}
        <FormField
          control={form.control}
          name="rolloutPercent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rollout Percentage: {field.value}%</FormLabel>
              <FormControl>
                <Slider
                  min={0}
                  max={100}
                  step={5}
                  value={[field.value]}
                  onValueChange={(values) => field.onChange(values[0])}
                />
              </FormControl>
              <FormDescription>
                Percentage of users who will see this feature
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}
        <div className="flex justify-end gap-2">
          <Button type="submit">
            {initialData ? 'Update Flag' : 'Create Flag'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

### Step 3: Create System Alerts Page

**File:** `app/(admin)/admin/alerts/page.tsx`

```tsx
'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Bell, Plus, AlertCircle, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { SystemAlertForm } from '@/components/features/admin/system-alert-form';

const ALERT_ICONS = {
  INFO: Info,
  WARNING: AlertTriangle,
  ERROR: AlertCircle,
  SUCCESS: CheckCircle,
};

const ALERT_COLORS = {
  INFO: 'text-blue-500',
  WARNING: 'text-orange-500',
  ERROR: 'text-red-500',
  SUCCESS: 'text-green-500',
};

export default function SystemAlertsPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Fetch alerts
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['system-alerts'],
    queryFn: async () => {
      const response = await fetch('/api/v1/admin/alerts');
      if (!response.ok) throw new Error('Failed to fetch alerts');
      return response.json();
    },
  });

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Alerts</h1>
          <p className="text-muted-foreground">
            Manage platform-wide notifications and announcements
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create System Alert</DialogTitle>
            </DialogHeader>
            <SystemAlertForm
              onSuccess={() => {
                setIsCreateOpen(false);
                queryClient.invalidateQueries({ queryKey: ['system-alerts'] });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerts Grid */}
      <div className="grid gap-4">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          alerts?.map((alert: any) => {
            const Icon = ALERT_ICONS[alert.level as keyof typeof ALERT_ICONS];
            const iconColor = ALERT_COLORS[alert.level as keyof typeof ALERT_COLORS];

            return (
              <Card key={alert.id} className="hover-elevate">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`rounded-lg bg-muted p-2 ${iconColor}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{alert.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                      <Badge variant={alert.isActive ? 'default' : 'secondary'}>
                        {alert.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">{alert.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Starts</p>
                      <p className="font-medium">
                        {new Date(alert.startsAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Ends</p>
                      <p className="font-medium">
                        {alert.endsAt
                          ? new Date(alert.endsAt).toLocaleDateString()
                          : 'No end date'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Views</p>
                      <p className="font-medium">{alert.viewCount}</p>
                    </div>
                  </div>

                  {alert.isGlobal && (
                    <div className="mt-4">
                      <Badge variant="secondary">Global Alert</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
```

### Step 4: Create System Alert Form

**File:** `components/features/admin/system-alert-form.tsx`

```tsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const alertSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  level: z.enum(['INFO', 'WARNING', 'ERROR', 'SUCCESS']),
  category: z.enum(['SYSTEM', 'MAINTENANCE', 'FEATURE', 'SECURITY', 'BILLING', 'MARKETING']),
  isGlobal: z.boolean().default(false),
  isDismissible: z.boolean().default(true),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
});

type AlertFormData = z.infer<typeof alertSchema>;

interface SystemAlertFormProps {
  onSuccess: () => void;
}

export function SystemAlertForm({ onSuccess }: SystemAlertFormProps) {
  const form = useForm<AlertFormData>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      title: '',
      message: '',
      level: 'INFO',
      category: 'SYSTEM',
      isGlobal: false,
      isDismissible: true,
    },
  });

  const onSubmit = async (data: AlertFormData) => {
    const response = await fetch('/api/v1/admin/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      onSuccess();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input placeholder="System maintenance scheduled" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Message */}
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the alert..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* Level */}
          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Level *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="INFO">Info</SelectItem>
                    <SelectItem value="WARNING">Warning</SelectItem>
                    <SelectItem value="ERROR">Error</SelectItem>
                    <SelectItem value="SUCCESS">Success</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SYSTEM">System</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    <SelectItem value="FEATURE">Feature</SelectItem>
                    <SelectItem value="SECURITY">Security</SelectItem>
                    <SelectItem value="BILLING">Billing</SelectItem>
                    <SelectItem value="MARKETING">Marketing</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Switches */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="isGlobal"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <FormLabel>Global Alert</FormLabel>
                  <FormDescription>
                    Show to all users regardless of targeting
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isDismissible"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <FormLabel>Dismissible</FormLabel>
                  <FormDescription>
                    Allow users to dismiss this alert
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit">Create Alert</Button>
        </div>
      </form>
    </Form>
  );
}
```

### Step 5: Create API Routes

**File:** `app/api/v1/admin/feature-flags/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { canManageFeatureFlags } from '@/lib/auth/rbac';
import {
  getAllFeatureFlags,
  createFeatureFlag,
  updateFeatureFlag,
} from '@/lib/modules/admin';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!canManageFeatureFlags(session.user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const flags = await getAllFeatureFlags();
    return NextResponse.json(flags);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!canManageFeatureFlags(session.user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const flag = await createFeatureFlag(body);
    return NextResponse.json(flag);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!canManageFeatureFlags(session.user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const flag = await updateFeatureFlag(body);
    return NextResponse.json(flag);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**File:** `app/api/v1/admin/alerts/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { canManageSystemAlerts } from '@/lib/auth/rbac';
import {
  getActiveSystemAlerts,
  createSystemAlert,
  updateSystemAlert,
} from '@/lib/modules/admin';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!canManageSystemAlerts(session.user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const alerts = await getActiveSystemAlerts();
    return NextResponse.json(alerts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!canManageSystemAlerts(session.user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const alert = await createSystemAlert(body);
    return NextResponse.json(alert);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

## Success Criteria

**MANDATORY - All must pass:**
- [ ] Feature flags page created (`app/(admin)/admin/feature-flags/page.tsx`)
- [ ] System alerts page created (`app/(admin)/admin/alerts/page.tsx`)
- [ ] Flag create/edit form functional
- [ ] Alert create/edit form functional
- [ ] Enable/disable toggles work
- [ ] Rollout percentage slider functional
- [ ] Alert level icons display correctly
- [ ] API routes integrated
- [ ] RBAC enforced
- [ ] No console errors

**Quality Checks:**
- [ ] Form validation with Zod
- [ ] Loading states shown
- [ ] Success toasts on actions
- [ ] Error handling
- [ ] Accessibility: keyboard nav, ARIA

## Files Created/Modified

```
✅ app/(admin)/admin/feature-flags/page.tsx
✅ app/(admin)/admin/alerts/page.tsx
✅ app/api/v1/admin/feature-flags/route.ts
✅ app/api/v1/admin/alerts/route.ts
✅ components/features/admin/feature-flag-form.tsx
✅ components/features/admin/system-alert-form.tsx
```

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 10: Admin API Routes & Webhooks**
2. ✅ Feature flags and alerts UI complete
3. ✅ Ready to finalize admin API infrastructure

---

**Session 9 Complete:** ✅ Feature flags and system alerts management UI implemented
