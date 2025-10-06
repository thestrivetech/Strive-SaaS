import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import {
  getDashboardMetrics,
  createDashboardMetric,
} from '@/lib/modules/dashboard';
import { canAccessDashboard } from '@/lib/auth/rbac';
import { handleApiError } from '@/lib/api/error-handler';

/**
 * GET /api/v1/dashboard/metrics
 * Retrieve all dashboard metrics for the current organization
 */
export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const user = await getCurrentUser();

    if (!user || !canAccessDashboard(user)) {
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
    console.error('[API] GET /api/v1/dashboard/metrics failed:', error);
    return handleApiError(error);
  }
}

/**
 * POST /api/v1/dashboard/metrics
 * Create a new dashboard metric
 */
export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const user = await getCurrentUser();

    if (!user || !canAccessDashboard(user)) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const metric = await createDashboardMetric(body);

    return NextResponse.json(
      { metric },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] POST /api/v1/dashboard/metrics failed:', error);
    return handleApiError(error);
  }
}
