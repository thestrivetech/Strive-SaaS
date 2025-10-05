# Session 9: Analytics, Activity Feed & Compliance - PLAN

**Date:** TBD
**Status:** ⏸️ Ready to Execute
**Duration:** ~2.5-3 hours
**Dependencies:** All previous sessions completed
**Parallel Safe:** No (requires all data models)

---

## 🎯 Session Objectives

Build analytics dashboard, real-time activity feed, compliance tracking, and comprehensive audit system.

**What We're Building:**
- ✅ Analytics dashboard with metrics
- ✅ Real-time activity feed
- ✅ Compliance alerts and tracking
- ✅ Audit log viewer
- ✅ Search and filtering

---

## 📋 Task Breakdown

### Phase 1: Analytics Module (45 minutes)

**Create `lib/modules/analytics/queries.ts`:**
```typescript
'use server';

import { requireAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';

export async function getTransactionAnalytics(params: {
  startDate?: Date;
  endDate?: Date;
}) {
  const session = await requireAuth();
  const orgId = session.user.organizationId!;

  const where = {
    organizationId: orgId,
    ...(params.startDate && params.endDate && {
      createdAt: {
        gte: params.startDate,
        lte: params.endDate,
      },
    }),
  };

  const [
    totalLoops,
    activeLoops,
    closedLoops,
    avgClosingTime,
    totalValue,
    documentStats,
    taskStats,
    signatureStats,
  ] = await Promise.all([
    prisma.transactionLoop.count({ where }),
    prisma.transactionLoop.count({
      where: { ...where, status: { in: ['ACTIVE', 'UNDER_CONTRACT', 'CLOSING'] } },
    }),
    prisma.transactionLoop.count({
      where: { ...where, status: 'CLOSED' },
    }),
    prisma.transactionLoop.aggregate({
      where: { ...where, status: 'CLOSED', actualClosing: { not: null } },
      _avg: {
        // Calculate days between created and closed
        // This requires custom SQL or computed field
      },
    }),
    prisma.transactionLoop.aggregate({
      where,
      _sum: { listingPrice: true },
    }),
    prisma.document.groupBy({
      by: ['status'],
      where: { loop: where },
      _count: true,
    }),
    prisma.task.groupBy({
      by: ['status'],
      where: { loop: where },
      _count: true,
    }),
    prisma.signatureRequest.groupBy({
      by: ['status'],
      where: { loop: where },
      _count: true,
    }),
  ]);

  return {
    overview: {
      totalLoops,
      activeLoops,
      closedLoops,
      avgClosingDays: 45, // Placeholder
      totalValue: totalValue._sum.listingPrice?.toNumber() || 0,
    },
    documents: documentStats,
    tasks: taskStats,
    signatures: signatureStats,
  };
}

export async function getLoopVelocity(params: { months: number }) {
  const session = await requireAuth();

  // Get loops created per month
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - params.months);

  const loops = await prisma.transactionLoop.findMany({
    where: {
      organizationId: session.user.organizationId!,
      createdAt: { gte: startDate },
    },
    select: {
      createdAt: true,
      status: true,
    },
  });

  // Group by month
  const byMonth = loops.reduce((acc, loop) => {
    const month = loop.createdAt.toISOString().slice(0, 7); // YYYY-MM
    if (!acc[month]) acc[month] = 0;
    acc[month]++;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(byMonth).map(([month, count]) => ({
    month,
    count,
  }));
}
```

---

### Phase 2: Activity Feed (40 minutes)

**Create `lib/modules/activity/queries.ts`:**
```typescript
'use server';

import { requireAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';

export async function getActivityFeed(params: {
  loopId?: string;
  limit?: number;
}) {
  const session = await requireAuth();

  const activities = await prisma.transactionAuditLog.findMany({
    where: {
      organizationId: session.user.organizationId!,
      ...(params.loopId && { entityType: 'loop', entityId: params.loopId }),
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { timestamp: 'desc' },
    take: params.limit || 50,
  });

  return activities.map(activity => ({
    id: activity.id,
    action: activity.action,
    entityType: activity.entityType,
    entityId: activity.entityId,
    user: activity.user,
    timestamp: activity.timestamp,
    description: formatActivityDescription(activity),
  }));
}

function formatActivityDescription(activity: any): string {
  const userName = activity.user.name || activity.user.email;

  switch (activity.action) {
    case 'created':
      return `${userName} created ${activity.entityType} ${activity.entityId}`;
    case 'updated':
      return `${userName} updated ${activity.entityType}`;
    case 'deleted':
      return `${userName} deleted ${activity.entityType}`;
    case 'signed':
      return `${userName} signed document`;
    default:
      return `${userName} performed ${activity.action} on ${activity.entityType}`;
  }
}
```

---

### Phase 3: Compliance Tracking (35 minutes)

**Create `lib/modules/compliance/checker.ts`:**
```typescript
'use server';

import { requireAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';

interface ComplianceAlert {
  id: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  loopId: string;
  type: string;
}

export async function checkLoopCompliance(loopId: string): Promise<ComplianceAlert[]> {
  const session = await requireAuth();

  const loop = await prisma.transactionLoop.findFirst({
    where: {
      id: loopId,
      organizationId: session.user.organizationId!,
    },
    include: {
      documents: true,
      parties: true,
      signatures: true,
      tasks: true,
    },
  });

  if (!loop) throw new Error('Loop not found');

  const alerts: ComplianceAlert[] = [];

  // Check 1: Required parties
  const hasListingAgent = loop.parties.some(p => p.role === 'LISTING_AGENT');
  if (!hasListingAgent && loop.transactionType === 'PURCHASE_AGREEMENT') {
    alerts.push({
      id: `${loopId}-no-listing-agent`,
      severity: 'warning',
      message: 'No listing agent assigned',
      loopId,
      type: 'missing_party',
    });
  }

  // Check 2: Required documents
  const hasContract = loop.documents.some(d => d.category === 'contract');
  if (!hasContract) {
    alerts.push({
      id: `${loopId}-no-contract`,
      severity: 'error',
      message: 'Missing purchase contract',
      loopId,
      type: 'missing_document',
    });
  }

  // Check 3: Expiring signatures
  const pendingSignatures = loop.signatures.filter(s => s.status === 'PENDING');
  pendingSignatures.forEach(sig => {
    if (sig.expiresAt && sig.expiresAt < new Date()) {
      alerts.push({
        id: `${sig.id}-expired`,
        severity: 'error',
        message: `Signature request expired: ${sig.title}`,
        loopId,
        type: 'expired_signature',
      });
    }
  });

  // Check 4: Overdue tasks
  const overdueTasks = loop.tasks.filter(
    t => t.dueDate && t.dueDate < new Date() && t.status !== 'COMPLETED'
  );
  if (overdueTasks.length > 0) {
    alerts.push({
      id: `${loopId}-overdue-tasks`,
      severity: 'warning',
      message: `${overdueTasks.length} overdue tasks`,
      loopId,
      type: 'overdue_tasks',
    });
  }

  return alerts;
}

export async function getOrganizationCompliance() {
  const session = await requireAuth();

  const loops = await prisma.transactionLoop.findMany({
    where: {
      organizationId: session.user.organizationId!,
      status: { notIn: ['CLOSED', 'CANCELLED', 'ARCHIVED'] },
    },
  });

  const allAlerts = await Promise.all(
    loops.map(loop => checkLoopCompliance(loop.id))
  );

  return allAlerts.flat();
}
```

---

## 📊 Files to Create

```
lib/modules/analytics/
├── queries.ts          # ✅ Analytics queries
├── charts.ts           # ✅ Chart data formatters
└── index.ts            # ✅ Public API

lib/modules/activity/
├── queries.ts          # ✅ Activity feed
├── formatters.ts       # ✅ Activity descriptions
└── index.ts            # ✅ Public API

lib/modules/compliance/
├── checker.ts          # ✅ Compliance checks
├── alerts.ts           # ✅ Alert definitions
└── index.ts            # ✅ Public API

app/(protected)/transactions/analytics/
└── page.tsx            # ✅ Analytics dashboard

components/transactions/
├── activity-feed.tsx          # ✅ Activity list
├── compliance-alerts.tsx      # ✅ Alert panel
├── analytics-charts.tsx       # ✅ Charts
└── audit-log-viewer.tsx       # ✅ Audit viewer
```

**Total:** 13 files

---

## 🎯 Success Criteria

- [ ] Analytics dashboard with metrics
- [ ] Real-time activity feed
- [ ] Compliance alerts generated
- [ ] Audit log searchable
- [ ] Charts render correctly
- [ ] Performance optimized (< 500ms queries)

---

**Last Updated:** 2025-10-04
**Status:** ⏸️ Ready to Execute
**Priority:** 🟡 MEDIUM
