import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import {
  markActivityAsRead,
  archiveActivity,
} from '@/lib/modules/dashboard';
import { canAccessDashboard } from '@/lib/auth/rbac';
import { handleApiError } from '@/lib/api/error-handler';

/**
 * PATCH /api/v1/dashboard/activities/[id]
 * Update an activity (mark as read or archive)
 * Body: { action: 'mark_read' | 'archive' }
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
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Missing required field: action' },
        { status: 400 }
      );
    }

    let activity;
    if (action === 'mark_read') {
      activity = await markActivityAsRead(params.id);
    } else if (action === 'archive') {
      activity = await archiveActivity(params.id);
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be "mark_read" or "archive"' },
        { status: 400 }
      );
    }

    return NextResponse.json({ activity });
  } catch (error) {
    console.error(`[API] PATCH /api/v1/dashboard/activities/${params?.id} failed:`, error);
    return handleApiError(error);
  }
}
