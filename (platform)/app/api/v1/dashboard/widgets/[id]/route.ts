import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import {
  getWidgetById,
  updateDashboardWidget,
  deleteDashboardWidget,
} from '@/lib/modules/dashboard';
import { canAccessDashboard } from '@/lib/auth/rbac';
import { handleApiError } from '@/lib/api/error-handler';

/**
 * GET /api/v1/dashboard/widgets/[id]
 * Retrieve a specific dashboard widget by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    const widget = await getWidgetById(params.id);

    return NextResponse.json({ widget });
  } catch (error) {
    console.error(`[API] GET /api/v1/dashboard/widgets/${params?.id} failed:`, error);
    return handleApiError(error);
  }
}

/**
 * PATCH /api/v1/dashboard/widgets/[id]
 * Update an existing dashboard widget
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    const body = await req.json();
    const widget = await updateDashboardWidget({ ...body, id: params.id });

    return NextResponse.json({ widget });
  } catch (error) {
    console.error(`[API] PATCH /api/v1/dashboard/widgets/${params?.id} failed:`, error);
    return handleApiError(error);
  }
}

/**
 * DELETE /api/v1/dashboard/widgets/[id]
 * Delete a dashboard widget
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    await deleteDashboardWidget(params.id);

    return NextResponse.json(
      { message: 'Widget deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error(`[API] DELETE /api/v1/dashboard/widgets/${params?.id} failed:`, error);
    return handleApiError(error);
  }
}
