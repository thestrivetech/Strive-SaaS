# Session 3: Leads Module - UI Components & Pages

## Session Overview
**Goal:** Build the complete user interface for leads management including components, pages, and client-side interactions.

**Duration:** 4-5 hours
**Complexity:** High
**Dependencies:** Session 1 (Database), Session 2 (Backend Module)

## Objectives

1. ✅ Port lead components from source dashboard
2. ✅ Convert React/Vite patterns to Next.js App Router
3. ✅ Create leads pages (list, detail, create/edit)
4. ✅ Implement grid and table views
5. ✅ Add filtering, search, and sorting functionality
6. ✅ Implement lead scoring UI
7. ✅ Add real-time updates with server actions
8. ✅ Create responsive mobile-friendly UI

## Prerequisites

- [x] Session 1 & 2 completed
- [x] Leads module backend functional
- [x] shadcn/ui components available
- [x] Understanding of Server/Client Components

## Components to Create

### 1. Lead Card Component (Grid View)

**File:** `components/(platform)/crm/leads/lead-card.tsx`

**Source Reference:** `real-estate-CRM-dashboard-&-modules/client/src/components/crm/leads/lead-card.tsx`

**Key Features:**
- Display lead summary (name, email, phone, company)
- Show lead score badge (Hot/Warm/Cold)
- Display source and status
- Action menu (edit, delete, convert)
- Click to view details
- Avatar with fallback
- Last contact timestamp

```typescript
'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LeadScore } from '@prisma/client';
import { LeadActionsMenu } from './lead-actions-menu';
import { LeadScoreBadge } from './lead-score-badge';
import { formatDistanceToNow } from 'date-fns';

interface LeadCardProps {
  lead: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    company?: string | null;
    score: LeadScore;
    source: string;
    status: string;
    created_at: Date;
    last_contact_at?: Date | null;
    assigned_to?: {
      name: string;
      avatar_url?: string | null;
    } | null;
  };
  onUpdate?: () => void;
}

export function LeadCard({ lead, onUpdate }: LeadCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Avatar>
              <AvatarImage src={lead.assigned_to?.avatar_url || undefined} />
              <AvatarFallback>
                {lead.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{lead.name}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {lead.company || lead.email || 'No company'}
              </p>
            </div>
          </div>
          <LeadActionsMenu lead={lead} onUpdate={onUpdate} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <LeadScoreBadge score={lead.score} />
          <Badge variant="outline" className="text-xs">
            {lead.status.replace('_', ' ')}
          </Badge>
        </div>

        <div className="text-sm space-y-1">
          {lead.email && (
            <p className="text-muted-foreground truncate">{lead.email}</p>
          )}
          {lead.phone && (
            <p className="text-muted-foreground">{lead.phone}</p>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Source: {lead.source}</span>
          <span>
            {lead.last_contact_at
              ? formatDistanceToNow(new Date(lead.last_contact_at), { addSuffix: true })
              : formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 2. Lead Score Badge

**File:** `components/(platform)/crm/leads/lead-score-badge.tsx`

```typescript
'use client';

import { Badge } from '@/components/ui/badge';
import { LeadScore } from '@prisma/client';
import { Flame, ThermometerSun, Snowflake } from 'lucide-react';

interface LeadScoreBadgeProps {
  score: LeadScore;
  showIcon?: boolean;
}

export function LeadScoreBadge({ score, showIcon = true }: LeadScoreBadgeProps) {
  const config = {
    HOT: {
      label: 'Hot',
      className: 'bg-red-500/10 text-red-700 hover:bg-red-500/20',
      icon: Flame,
    },
    WARM: {
      label: 'Warm',
      className: 'bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20',
      icon: ThermometerSun,
    },
    COLD: {
      label: 'Cold',
      className: 'bg-blue-500/10 text-blue-700 hover:bg-blue-500/20',
      icon: Snowflake,
    },
  };

  const scoreConfig = config[score];
  const Icon = scoreConfig.icon;

  return (
    <Badge variant="outline" className={scoreConfig.className}>
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {scoreConfig.label}
    </Badge>
  );
}
```

### 3. Lead Form Dialog

**File:** `components/(platform)/crm/leads/lead-form-dialog.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createLead, updateLead } from '@/lib/modules/leads';
import { createLeadSchema, type CreateLeadInput } from '@/lib/modules/leads/schemas';
import { LeadSource, LeadStatus, LeadScore } from '@prisma/client';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface LeadFormDialogProps {
  mode?: 'create' | 'edit';
  lead?: any;
  organizationId: string;
  trigger?: React.ReactNode;
}

export function LeadFormDialog({
  mode = 'create',
  lead,
  organizationId,
  trigger,
}: LeadFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<CreateLeadInput>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: lead || {
      name: '',
      email: '',
      phone: '',
      company: '',
      source: 'WEBSITE' as LeadSource,
      status: 'NEW_LEAD' as LeadStatus,
      score: 'COLD' as LeadScore,
      score_value: 0,
      notes: '',
      tags: [],
      organization_id: organizationId,
    },
  });

  async function onSubmit(data: CreateLeadInput) {
    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        await createLead(data);
        toast({
          title: 'Lead created',
          description: 'The lead has been created successfully.',
        });
      } else {
        await updateLead({ ...data, id: lead.id });
        toast({
          title: 'Lead updated',
          description: 'The lead has been updated successfully.',
        });
      }
      setOpen(false);
      form.reset();
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save lead',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Lead' : 'Edit Lead'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new lead to your CRM'
              : 'Update lead information'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Inc" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="555-1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="WEBSITE">Website</SelectItem>
                        <SelectItem value="REFERRAL">Referral</SelectItem>
                        <SelectItem value="GOOGLE_ADS">Google Ads</SelectItem>
                        <SelectItem value="SOCIAL_MEDIA">Social Media</SelectItem>
                        <SelectItem value="COLD_CALL">Cold Call</SelectItem>
                        <SelectItem value="EMAIL_CAMPAIGN">Email Campaign</SelectItem>
                        <SelectItem value="EVENT">Event</SelectItem>
                        <SelectItem value="PARTNER">Partner</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NEW_LEAD">New Lead</SelectItem>
                        <SelectItem value="IN_CONTACT">In Contact</SelectItem>
                        <SelectItem value="QUALIFIED">Qualified</SelectItem>
                        <SelectItem value="UNQUALIFIED">Unqualified</SelectItem>
                        <SelectItem value="CONVERTED">Converted</SelectItem>
                        <SelectItem value="LOST">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Score</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select score" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="HOT">🔥 Hot</SelectItem>
                        <SelectItem value="WARM">🌡️ Warm</SelectItem>
                        <SelectItem value="COLD">❄️ Cold</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional information about this lead..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? mode === 'create'
                    ? 'Creating...'
                    : 'Updating...'
                  : mode === 'create'
                  ? 'Create Lead'
                  : 'Update Lead'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### 4. Leads List Page

**File:** `app/(platform)/crm/leads/page.tsx`

```typescript
import { Suspense } from 'react';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizations } from '@/lib/modules/organization/queries';
import { getLeads, getLeadsCount, getLeadStats } from '@/lib/modules/leads';
import { LeadCard } from '@/components/(platform)/crm/leads/lead-card';
import { LeadFormDialog } from '@/components/(platform)/crm/leads/lead-form-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { redirect } from 'next/navigation';
import type { LeadFilters } from '@/lib/modules/leads/schemas';
import type { LeadStatus, LeadScore } from '@prisma/client';

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: {
    search?: string;
    status?: LeadStatus;
    score?: LeadScore;
    page?: string;
  };
}) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const userOrgs = await getUserOrganizations(user.id);
  const currentOrg = userOrgs[0];

  if (!currentOrg) {
    redirect('/onboarding/organization');
  }

  const currentPage = parseInt(searchParams.page || '1');
  const pageSize = 25;

  const filters: LeadFilters = {
    search: searchParams.search,
    status: searchParams.status,
    score: searchParams.score,
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground">
            Manage and track all your leads
          </p>
        </div>
        <LeadFormDialog
          mode="create"
          organizationId={currentOrg.organization_id}
        />
      </div>

      <Suspense fallback={<LeadsListSkeleton />}>
        <LeadsListContent
          filters={filters}
          organizationId={currentOrg.organization_id}
          currentPage={currentPage}
          pageSize={pageSize}
        />
      </Suspense>
    </div>
  );
}

async function LeadsListContent({
  filters,
  organizationId,
  currentPage,
  pageSize,
}: {
  filters: LeadFilters;
  organizationId: string;
  currentPage: number;
  pageSize: number;
}) {
  const [leads, stats, totalCount] = await Promise.all([
    getLeads(filters),
    getLeadStats(),
    getLeadsCount(filters),
  ]);

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newLeads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.hotLeads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Qualified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.qualifiedLeads}</div>
          </CardContent>
        </Card>
      </div>

      {/* Leads Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>

      {leads.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No leads found.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first lead to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}

function LeadsListSkeleton() {
  return <div>Loading...</div>;
}
```

## Additional Components to Create

5. **Lead Actions Menu** - `lead-actions-menu.tsx`
6. **Lead Filters** - `lead-filters.tsx`
7. **Lead Search** - `lead-search.tsx`
8. **Lead Table View** - `lead-table.tsx`
9. **Lead Detail Page** - `app/(platform)/crm/leads/[id]/page.tsx`
10. **Lead Activity Timeline** - `lead-activity-timeline.tsx`

## Success Criteria

- [x] All lead components created and functional
- [x] Grid and table views working
- [x] Lead creation/editing dialogs functional
- [x] Filtering and search working
- [x] Real-time updates with server actions
- [x] Responsive on mobile devices
- [x] Loading states implemented
- [x] Error states handled
- [x] Accessible UI (keyboard navigation, screen readers)

## Files Created

- ✅ `components/(platform)/crm/leads/lead-card.tsx`
- ✅ `components/(platform)/crm/leads/lead-score-badge.tsx`
- ✅ `components/(platform)/crm/leads/lead-form-dialog.tsx`
- ✅ `components/(platform)/crm/leads/lead-actions-menu.tsx`
- ✅ `components/(platform)/crm/leads/lead-filters.tsx`
- ✅ `components/(platform)/crm/leads/lead-search.tsx`
- ✅ `components/(platform)/crm/leads/lead-table.tsx`
- ✅ `app/(platform)/crm/leads/page.tsx`
- ✅ `app/(platform)/crm/leads/[id]/page.tsx`

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 4: Contacts Module - Complete Integration**
2. ✅ Leads UI is complete and functional
3. ✅ Can manage leads end-to-end
4. ✅ Ready to build contacts module

---

**Session 3 Complete:** ✅ Leads UI fully implemented with grid/table views
