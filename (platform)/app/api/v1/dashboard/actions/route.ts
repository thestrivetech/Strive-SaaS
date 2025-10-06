import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { getQuickActions } from '@/lib/modules/dashboard';
import { canAccessDashboard } from '@/lib/auth/rbac';
import { handleApiError } from '@/lib/api/error-handler';

/**
 * GET /api/v1/dashboard/actions
 * Retrieve quick actions available to the current user
 * Filters based on user's role and subscription tier
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

    const actions = await getQuickActions();

    return NextResponse.json({
      actions,
      count: actions.length,
    });
  } catch (error) {
    console.error('[API] GET /api/v1/dashboard/actions failed:', error);
    return handleApiError(error);
  }
}
