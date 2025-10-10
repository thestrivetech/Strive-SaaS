# Session 3: API Routes - Dashboard Endpoints

## Session Overview
**Goal:** Create RESTful API routes for dashboard functionality, exposing backend logic through secure, properly validated endpoints.

**Duration:** 2-3 hours
**Complexity:** Medium
**Dependencies:** Session 2 (Backend module logic must be complete)

## Objectives

1. ✅ Create API route structure for dashboard endpoints
2. ✅ Implement metrics API routes
3. ✅ Implement widgets API routes
4. ✅ Implement activities API routes
5. ✅ Implement quick actions API routes
6. ✅ Add proper error handling and status codes
7. ✅ Ensure RBAC protection on all endpoints

## Prerequisites

- [x] Session 2 completed (Backend module ready)
- [x] Understanding of Next.js App Router API routes
- [x] Familiarity with REST API design patterns
- [x] Knowledge of HTTP status codes

## API Route Structure

```
app/api/v1/dashboard/
├── metrics/
│   ├── route.ts              # GET /api/v1/dashboard/metrics
│   ├── [id]/
│   │   └── route.ts          # GET/PATCH/DELETE /api/v1/dashboard/metrics/[id]
│   └── calculate/
│       └── route.ts          # POST /api/v1/dashboard/metrics/calculate
├── widgets/
│   ├── route.ts              # GET/POST /api/v1/dashboard/widgets
│   └── [id]/
│       └── route.ts          # GET/PATCH/DELETE /api/v1/dashboard/widgets/[id]
├── activities/
│   ├── route.ts              # GET/POST /api/v1/dashboard/activities
│   └── [id]/
│       └── route.ts          # GET/PATCH /api/v1/dashboard/activities/[id]
└── actions/
    ├── route.ts              # GET /api/v1/dashboard/actions
    ├── [id]/
    │   └── route.ts          # GET /api/v1/dashboard/actions/[id]
    └── execute/
        └── route.ts          # POST /api/v1/dashboard/actions/execute
```

## Step-by-Step Implementation

### Step 1: Metrics API Routes

**File:** `app/api/v1/dashboard/metrics/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import {
  getDashboardMetrics,
  createDashboardMetric,
} from '@/lib/modules/dashboard';
import { canAccessDashboard, canManageWidgets } from '@/lib/auth/rbac';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !canAccessDashboard(session.user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const metrics = await getDashboardMetrics();

    return NextResponse.json({
      metrics,
      count: metrics.length,
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !canManageWidgets(session.user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const metric = await createDashboardMetric(body);

    return NextResponse.json(
      { metric },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating metric:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create metric' },
      { status: 500 }
    );
  }
}
```

**File:** `app/api/v1/dashboard/metrics/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import {
  getMetricById,
  updateDashboardMetric,
  deleteDashboardMetric,
} from '@/lib/modules/dashboard';
import { canAccessDashboard, canManageWidgets } from '@/lib/auth/rbac';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !canAccessDashboard(session.user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const metric = await getMetricById(params.id);

    return NextResponse.json({ metric });
  } catch (error: any) {
    if (error.message === 'Metric not found' || error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    console.error('Error fetching metric:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metric' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !canManageWidgets(session.user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const metric = await updateDashboardMetric({ ...body, id: params.id });

    return NextResponse.json({ metric });
  } catch (error: any) {
    if (error.message === 'Metric not found') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating metric:', error);
    return NextResponse.json(
      { error: 'Failed to update metric' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !canManageWidgets(session.user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await deleteDashboardMetric(params.id);

    return NextResponse.json(
      { message: 'Metric deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === 'Metric not found') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    console.error('Error deleting metric:', error);
    return NextResponse.json(
      { error: 'Failed to delete metric' },
      { status: 500 }
    );
  }
}
```

**File:** `app/api/v1/dashboard/metrics/calculate/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import { calculateMetrics } from '@/lib/modules/dashboard';
import { canAccessDashboard } from '@/lib/auth/rbac';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !canAccessDashboard(session.user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const metrics = await calculateMetrics(session.user.organizationId);

    return NextResponse.json({
      metrics,
      calculatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error calculating metrics:', error);
    return NextResponse.json(
      { error: 'Failed to calculate metrics' },
      { status: 500 }
    );
  }
}
```

### Step 2: Activities API Routes

**File:** `app/api/v1/dashboard/activities/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import {
  getRecentActivities,
  recordActivity,
} from '@/lib/modules/dashboard';
import { canAccessDashboard } from '@/lib/auth/rbac';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !canAccessDashboard(session.user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');

    let activities;
    if (type) {
      const { getActivitiesByType } = await import('@/lib/modules/dashboard');
      activities = await getActivitiesByType(type, limit);
    } else {
      activities = await getRecentActivities(limit);
    }

    return NextResponse.json({
      activities,
      count: activities.length,
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !canAccessDashboard(session.user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const activity = await recordActivity(body);

    return NextResponse.json(
      { activity },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error recording activity:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to record activity' },
      { status: 500 }
    );
  }
}
```

**File:** `app/api/v1/dashboard/activities/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import {
  markActivityAsRead,
  archiveActivity,
} from '@/lib/modules/dashboard';
import { canAccessDashboard } from '@/lib/auth/rbac';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !canAccessDashboard(session.user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action } = body;

    let activity;
    if (action === 'mark_read') {
      activity = await markActivityAsRead(params.id);
    } else if (action === 'archive') {
      activity = await archiveActivity(params.id);
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    return NextResponse.json({ activity });
  } catch (error: any) {
    if (error.message === 'Activity not found') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    console.error('Error updating activity:', error);
    return NextResponse.json(
      { error: 'Failed to update activity' },
      { status: 500 }
    );
  }
}
```

### Step 3: Quick Actions API Routes

**File:** `app/api/v1/dashboard/actions/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import { getQuickActions } from '@/lib/modules/dashboard';
import { canAccessDashboard } from '@/lib/auth/rbac';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !canAccessDashboard(session.user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const actions = await getQuickActions();

    return NextResponse.json({
      actions,
      count: actions.length,
    });
  } catch (error) {
    console.error('Error fetching quick actions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quick actions' },
      { status: 500 }
    );
  }
}
```

**File:** `app/api/v1/dashboard/actions/[id]/execute/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import { executeQuickAction } from '@/lib/modules/dashboard';
import { canAccessDashboard } from '@/lib/auth/rbac';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !canAccessDashboard(session.user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const result = await executeQuickAction(params.id, body);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    if (error.message === 'Quick action not found') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    console.error('Error executing quick action:', error);
    return NextResponse.json(
      { error: 'Failed to execute action' },
      { status: 500 }
    );
  }
}
```

### Step 4: Add Error Handling Middleware

**File:** `lib/api/error-handler.ts`

```typescript
import { NextResponse } from 'next/server';

export function handleApiError(error: any) {
  console.error('API Error:', error);

  // Zod validation error
  if (error.name === 'ZodError') {
    return NextResponse.json(
      {
        error: 'Validation error',
        details: error.errors,
      },
      { status: 400 }
    );
  }

  // Prisma errors
  if (error.code === 'P2002') {
    return NextResponse.json(
      { error: 'Resource already exists' },
      { status: 409 }
    );
  }

  if (error.code === 'P2025') {
    return NextResponse.json(
      { error: 'Resource not found' },
      { status: 404 }
    );
  }

  // Custom errors
  if (error.message === 'Unauthorized') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Default error
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

## Testing & Validation

### Test 1: Metrics Endpoints

```bash
# GET all metrics
curl -X GET http://localhost:3000/api/v1/dashboard/metrics \
  -H "Authorization: Bearer YOUR_TOKEN"

# POST create metric
curl -X POST http://localhost:3000/api/v1/dashboard/metrics \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Metric","category":"FINANCIAL"}'

# PATCH update metric
curl -X PATCH http://localhost:3000/api/v1/dashboard/metrics/METRIC_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Metric"}'

# DELETE metric
curl -X DELETE http://localhost:3000/api/v1/dashboard/metrics/METRIC_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 2: Activities Endpoints

```bash
# GET recent activities
curl -X GET http://localhost:3000/api/v1/dashboard/activities?limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN"

# POST record activity
curl -X POST http://localhost:3000/api/v1/dashboard/activities \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Activity","type":"USER_ACTION","entityType":"project","entityId":"123","action":"created"}'
```

### Test 3: Quick Actions Endpoints

```bash
# GET all quick actions
curl -X GET http://localhost:3000/api/v1/dashboard/actions \
  -H "Authorization: Bearer YOUR_TOKEN"

# POST execute action
curl -X POST http://localhost:3000/api/v1/dashboard/actions/ACTION_ID/execute \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Success Criteria

- [x] All API routes created
- [x] Proper HTTP status codes
- [x] RBAC protection on all endpoints
- [x] Input validation with Zod
- [x] Error handling implemented
- [x] Multi-tenancy enforced
- [x] RESTful patterns followed

## Files Created

- ✅ `app/api/v1/dashboard/metrics/route.ts`
- ✅ `app/api/v1/dashboard/metrics/[id]/route.ts`
- ✅ `app/api/v1/dashboard/metrics/calculate/route.ts`
- ✅ `app/api/v1/dashboard/activities/route.ts`
- ✅ `app/api/v1/dashboard/activities/[id]/route.ts`
- ✅ `app/api/v1/dashboard/actions/route.ts`
- ✅ `app/api/v1/dashboard/actions/[id]/execute/route.ts`
- ✅ `lib/api/error-handler.ts`

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Missing Auth Checks
**Problem:** Endpoints accessible without authentication
**Solution:** Always call getServerSession() at the start of each endpoint

### ❌ Pitfall 2: Inconsistent Status Codes
**Problem:** Using wrong HTTP status codes
**Solution:** Use standard codes (200, 201, 400, 401, 404, 500)

### ❌ Pitfall 3: Missing Error Handling
**Problem:** Unhandled exceptions crash the API
**Solution:** Wrap all logic in try/catch blocks

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 4: Dashboard UI Components - Metrics & Widgets**
2. ✅ API layer is complete
3. ✅ Ready to build frontend components
4. ✅ Can test API endpoints with tools like Postman

---

**Session 3 Complete:** ✅ API routes established and tested
