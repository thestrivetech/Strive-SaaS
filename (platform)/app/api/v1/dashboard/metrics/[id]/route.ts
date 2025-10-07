import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import {
  getMetricById,
  updateDashboardMetric,
  deleteDashboardMetric,
} from '@/lib/modules/dashboard';
import { canAccessDashboard } from '@/lib/auth/rbac';
import { handleApiError } from '@/lib/api/error-handler';

/**
 * GET /api/v1/dashboard/metrics/[id]
 * Retrieve a specific dashboard metric by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const user = await getCurrentUser();

    if (!user || !canAccessDashboard(user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const metric = await getMetricById(id);

    return NextResponse.json({ metric });
  } catch (error) {
    const { id } = await params;
    console.error(`[API] GET /api/v1/dashboard/metrics/${id} failed:`, error);
    return handleApiError(error);
  }
}

/**
 * PATCH /api/v1/dashboard/metrics/[id]
 * Update an existing dashboard metric
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const user = await getCurrentUser();

    if (!user || !canAccessDashboard(user)) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const metric = await updateDashboardMetric({ ...body, id });

    return NextResponse.json({ metric });
  } catch (error) {
    const { id } = await params;
    console.error(`[API] PATCH /api/v1/dashboard/metrics/${id} failed:`, error);
    return handleApiError(error);
  }
}

/**
 * DELETE /api/v1/dashboard/metrics/[id]
 * Delete a dashboard metric
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const user = await getCurrentUser();

    if (!user || !canAccessDashboard(user)) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = await params;
    await deleteDashboardMetric(id);

    return NextResponse.json(
      { message: 'Metric deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    const { id } = await params;
    console.error(`[API] DELETE /api/v1/dashboard/metrics/${id} failed:`, error);
    return handleApiError(error);
  }
}
