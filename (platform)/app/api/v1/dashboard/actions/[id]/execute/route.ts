import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { executeQuickAction } from '@/lib/modules/dashboard';
import { canAccessDashboard } from '@/lib/auth/rbac';
import { handleApiError } from '@/lib/api/error-handler';

/**
 * POST /api/v1/dashboard/actions/[id]/execute
 * Execute a quick action
 * Body: action-specific parameters (optional)
 */
export async function POST(
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

    // executeQuickAction only needs the ID (body is ignored as per implementation)
    const result = await executeQuickAction(id);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    const { id } = await params;
    console.error(`[API] POST /api/v1/dashboard/actions/${id}/execute failed:`, error);
    return handleApiError(error);
  }
}
