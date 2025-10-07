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
    const widget = await getWidgetById(id);

    return NextResponse.json({ widget });
  } catch (error) {
    const { id } = await params;
    console.error(`[API] GET /api/v1/dashboard/widgets/${id} failed:`, error);
    return handleApiError(error);
  }
}

/**
 * PATCH /api/v1/dashboard/widgets/[id]
 * Update an existing dashboard widget
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
    const widget = await updateDashboardWidget({ ...body, id });

    return NextResponse.json({ widget });
  } catch (error) {
    const { id } = await params;
    console.error(`[API] PATCH /api/v1/dashboard/widgets/${id} failed:`, error);
    return handleApiError(error);
  }
}

/**
 * DELETE /api/v1/dashboard/widgets/[id]
 * Delete a dashboard widget
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
    await deleteDashboardWidget(id);

    return NextResponse.json(
      { message: 'Widget deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    const { id } = await params;
    console.error(`[API] DELETE /api/v1/dashboard/widgets/${id} failed:`, error);
    return handleApiError(error);
  }
}
