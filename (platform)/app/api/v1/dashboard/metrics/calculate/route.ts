import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';
import { calculateMetrics } from '@/lib/modules/dashboard';
import { canAccessDashboard } from '@/lib/auth/rbac';
import { handleApiError } from '@/lib/api/error-handler';

/**
 * POST /api/v1/dashboard/metrics/calculate
 * Calculate and update all dashboard metrics for the current organization
 */
export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const user = await getCurrentUser();

    if (!user || !canAccessDashboard(user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const organizationId = getUserOrganizationId(user);
    const metrics = await calculateMetrics(organizationId);

    return NextResponse.json({
      metrics,
      calculatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] POST /api/v1/dashboard/metrics/calculate failed:', error);
    return handleApiError(error);
  }
}
