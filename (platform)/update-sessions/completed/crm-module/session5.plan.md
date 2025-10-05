# Session 5: Deals Pipeline - Backend & Kanban UI

## Session Overview
**Goal:** Implement deals management with pipeline visualization and drag-and-drop functionality.

**Duration:** 4-5 hours
**Complexity:** High (Drag-and-drop complexity)
**Dependencies:** Sessions 1-4

## Objectives

1. ✅ Create deals module backend
2. ✅ Implement pipeline stages management
3. ✅ Build Kanban board with drag-and-drop
4. ✅ Add deal value tracking and forecasting
5. ✅ Implement win/loss recording
6. ✅ Create deal detail view

## Module Structure

```
lib/modules/deals/
├── index.ts
├── schemas.ts
├── queries.ts
├── actions.ts
└── pipeline.ts (pipeline-specific logic)

components/(platform)/crm/deals/
├── pipeline-board.tsx (main Kanban)
├── pipeline-column.tsx
├── deal-card.tsx
├── deal-form-dialog.tsx
├── deal-detail-view.tsx
└── deal-value-chart.tsx
```

## Key Implementation Steps

### 1. Deals Backend Module

**schemas.ts** - Deal validation:
```typescript
export const createDealSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  value: z.number().positive(),
  stage: z.nativeEnum(DealStage).default('LEAD'),
  status: z.nativeEnum(DealStatus).default('ACTIVE'),
  probability: z.number().int().min(0).max(100).default(50),
  expected_close_date: z.coerce.date().optional(),
  lead_id: z.string().uuid().optional(),
  contact_id: z.string().uuid().optional(),
  listing_id: z.string().uuid().optional(),
  organization_id: z.string().uuid(),
  assigned_to_id: z.string().uuid().optional(),
});

export const updateDealStageSchema = z.object({
  id: z.string().uuid(),
  stage: z.nativeEnum(DealStage),
  probability: z.number().int().min(0).max(100),
});

export const closeDealSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['WON', 'LOST']),
  actual_close_date: z.coerce.date(),
  lost_reason: z.string().max(500).optional(),
});
```

**queries.ts** - Pipeline queries:
```typescript
export async function getDealsByStage() {
  return withTenantContext(async () => {
    const stages = ['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSING'];

    const dealsByStage = await Promise.all(
      stages.map(async (stage) => ({
        stage,
        deals: await prisma.deals.findMany({
          where: { stage: stage as DealStage, status: 'ACTIVE' },
          include: {
            assigned_to: { select: { id: true, name: true, avatar_url: true } },
            contact: { select: { id: true, name: true } },
            lead: { select: { id: true, name: true } },
          },
          orderBy: { created_at: 'desc' },
        }),
      }))
    );

    return dealsByStage;
  });
}

export async function getDealMetrics() {
  return withTenantContext(async () => {
    const [totalValue, wonValue, lostValue, activeDeals, wonDeals] = await Promise.all([
      prisma.deals.aggregate({
        where: { status: 'ACTIVE' },
        _sum: { value: true },
      }),
      prisma.deals.aggregate({
        where: { status: 'WON' },
        _sum: { value: true },
      }),
      prisma.deals.aggregate({
        where: { status: 'LOST' },
        _sum: { value: true },
      }),
      prisma.deals.count({ where: { status: 'ACTIVE' } }),
      prisma.deals.count({ where: { status: 'WON' } }),
    ]);

    return {
      pipelineValue: totalValue._sum.value || 0,
      wonValue: wonValue._sum.value || 0,
      lostValue: lostValue._sum.value || 0,
      activeDeals,
      wonDeals,
      winRate: wonDeals / (wonDeals + activeDeals) * 100,
    };
  });
}
```

**actions.ts** - Deal management with stage transitions:
```typescript
export async function updateDealStage(input: UpdateDealStageInput) {
  const session = await requireAuth();

  if (!canAccessCRM(session.user)) {
    throw new Error('Unauthorized');
  }

  const validated = updateDealStageSchema.parse(input);

  return withTenantContext(async () => {
    const deal = await prisma.deals.update({
      where: { id: validated.id },
      data: {
        stage: validated.stage,
        probability: validated.probability,
      },
    });

    // Log activity for stage change
    await prisma.activities.create({
      data: {
        type: 'NOTE',
        title: `Deal moved to ${validated.stage}`,
        description: `Pipeline stage updated to ${validated.stage}`,
        deal_id: validated.id,
        organization_id: session.user.organizationId,
        created_by_id: session.user.id,
      },
    });

    revalidatePath('/crm/deals');
    return deal;
  });
}

export async function closeDeal(input: CloseDealInput) {
  const session = await requireAuth();
  const validated = closeDealSchema.parse(input);

  return withTenantContext(async () => {
    const deal = await prisma.deals.update({
      where: { id: validated.id },
      data: {
        status: validated.status as DealStatus,
        actual_close_date: validated.actual_close_date,
        lost_reason: validated.lost_reason,
        stage: validated.status === 'WON' ? 'CLOSED_WON' : 'CLOSED_LOST',
      },
    });

    // Log close activity
    await prisma.activities.create({
      data: {
        type: 'DEAL',
        title: `Deal ${validated.status === 'WON' ? 'won' : 'lost'}`,
        description: validated.lost_reason || `Deal closed as ${validated.status}`,
        deal_id: validated.id,
        organization_id: session.user.organizationId,
        created_by_id: session.user.id,
      },
    });

    revalidatePath('/crm/deals');
    revalidatePath('/crm/dashboard');
    return deal;
  });
}
```

### 2. Pipeline Kanban Board

**pipeline-board.tsx** - Main Kanban component with DnD:
```typescript
'use client';

import { useState } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { PipelineColumn } from './pipeline-column';
import { DealCard } from './deal-card';
import { updateDealStage } from '@/lib/modules/deals';
import { useToast } from '@/hooks/use-toast';
import type { DealStage } from '@prisma/client';

interface PipelineBoardProps {
  dealsByStage: Array<{
    stage: string;
    deals: any[];
  }>;
}

export function PipelineBoard({ dealsByStage }: PipelineBoardProps) {
  const [activeDeal, setActiveDeal] = useState<any>(null);
  const { toast } = useToast();

  const stages = [
    { id: 'LEAD', title: 'Lead', probability: 10 },
    { id: 'QUALIFIED', title: 'Qualified', probability: 25 },
    { id: 'PROPOSAL', title: 'Proposal', probability: 50 },
    { id: 'NEGOTIATION', title: 'Negotiation', probability: 75 },
    { id: 'CLOSING', title: 'Closing', probability: 90 },
  ];

  async function handleDragEnd(event: any) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setActiveDeal(null);
      return;
    }

    const dealId = active.id;
    const newStage = over.id as DealStage;
    const stageConfig = stages.find((s) => s.id === newStage);

    try {
      await updateDealStage({
        id: dealId,
        stage: newStage,
        probability: stageConfig?.probability || 50,
      });

      toast({
        title: 'Deal updated',
        description: `Deal moved to ${stageConfig?.title}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update deal stage',
        variant: 'destructive',
      });
    }

    setActiveDeal(null);
  }

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={(event) => {
        const deal = dealsByStage
          .flatMap((stage) => stage.deals)
          .find((d) => d.id === event.active.id);
        setActiveDeal(deal);
      }}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageDeals = dealsByStage.find((s) => s.stage === stage.id)?.deals || [];
          const stageValue = stageDeals.reduce((sum, deal) => sum + Number(deal.value), 0);

          return (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              deals={stageDeals}
              totalValue={stageValue}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeDeal && <DealCard deal={activeDeal} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}
```

**pipeline-column.tsx** - Droppable column:
```typescript
'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DealCard } from './deal-card';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

export function PipelineColumn({ stage, deals, totalValue }: any) {
  const { setNodeRef } = useDroppable({ id: stage.id });

  return (
    <div className="flex-shrink-0 w-80">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{stage.title}</h3>
            <span className="text-xs text-muted-foreground">
              {deals.length} deals
            </span>
          </div>
          <p className="text-sm font-medium text-green-600">
            {formatCurrency(totalValue)}
          </p>
        </CardHeader>
        <CardContent>
          <div ref={setNodeRef} className="space-y-2 min-h-[400px]">
            <SortableContext
              items={deals.map((d: any) => d.id)}
              strategy={verticalListSortingStrategy}
            >
              {deals.map((deal: any) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </SortableContext>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**deal-card.tsx** - Draggable deal card:
```typescript
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency } from '@/lib/utils';

export function DealCard({ deal, isDragging = false }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: deal.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-sm line-clamp-2">{deal.title}</h4>
          {deal.assigned_to && (
            <Avatar className="h-6 w-6">
              <AvatarImage src={deal.assigned_to.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {deal.assigned_to.name.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-green-600">
            {formatCurrency(deal.value)}
          </p>
          <span className="text-xs text-muted-foreground">
            {deal.probability}%
          </span>
        </div>

        {deal.contact && (
          <p className="text-xs text-muted-foreground truncate">
            {deal.contact.name}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

### 3. Deals Page

**app/(platform)/crm/deals/page.tsx** - Pipeline view:
```typescript
import { Suspense } from 'react';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { getDealsByStage, getDealMetrics } from '@/lib/modules/deals';
import { PipelineBoard } from '@/components/(platform)/crm/deals/pipeline-board';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DealsPage() {
  await requireAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Deals Pipeline</h1>
        <p className="text-muted-foreground">
          Manage your sales pipeline
        </p>
      </div>

      <Suspense fallback={<div>Loading pipeline...</div>}>
        <PipelineContent />
      </Suspense>
    </div>
  );
}

async function PipelineContent() {
  const [dealsByStage, metrics] = await Promise.all([
    getDealsByStage(),
    getDealMetrics(),
  ]);

  return (
    <>
      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(metrics.pipelineValue / 1000000).toFixed(1)}M
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeDeals}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Won Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${(metrics.wonValue / 1000000).toFixed(1)}M
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.winRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Board */}
      <PipelineBoard dealsByStage={dealsByStage} />
    </>
  );
}
```

## Dependencies

Install required packages for drag-and-drop:
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

## Success Criteria

- [x] Deals module backend complete
- [x] Pipeline Kanban board functional
- [x] Drag-and-drop working smoothly
- [x] Deal metrics calculated correctly
- [x] Win/loss recording implemented
- [x] Multi-tenancy enforced
- [x] Responsive UI

## Files Created

- ✅ `lib/modules/deals/*` (4 files)
- ✅ `components/(platform)/crm/deals/*` (6+ files)
- ✅ `app/(platform)/crm/deals/page.tsx`
- ✅ `app/(platform)/crm/deals/[id]/page.tsx`

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 6: Listings Module - Real Estate Features**
2. ✅ Deals pipeline complete and functional
3. ✅ Ready to add real estate listings

---

**Session 5 Complete:** ✅ Deals pipeline with Kanban board implemented
