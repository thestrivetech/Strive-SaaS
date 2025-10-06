import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import {
  getDashboardWidgets,
  createDashboardWidget,
} from '@/lib/modules/dashboard';
import { canAccessDashboard } from '@/lib/auth/rbac';
import { handleApiError } from '@/lib/api/error-handler';

/**
 * GET /api/v1/dashboard/widgets
 * Retrieve all visible dashboard widgets for the current organization
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

    const widgets = await getDashboardWidgets();

    return NextResponse.json({
      widgets,
      count: widgets.length,
    });
  } catch (error) {
    console.error('[API] GET /api/v1/dashboard/widgets failed:', error);
    return handleApiError(error);
  }
}

/**
 * POST /api/v1/dashboard/widgets
 * Create a new dashboard widget
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
    const widget = await createDashboardWidget(body);

    return NextResponse.json(
      { widget },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] POST /api/v1/dashboard/widgets failed:', error);
    return handleApiError(error);
  }
}
