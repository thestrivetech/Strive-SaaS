import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { canAccessAIHub, canManageAIHub } from '@/lib/auth/rbac';
import {
  getTeamById,
  updateTeam,
  deleteTeam,
  updateTeamSchema,
  type UpdateTeamInput,
} from '@/lib/modules/ai-hub/teams';

/**
 * GET /api/v1/ai-hub/teams/[id]
 * Get team details by ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();

    if (!canAccessAIHub(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const team = await getTeamById(id, user.organizationId);

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    return NextResponse.json({ team });
  } catch (error: any) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch team' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/ai-hub/teams/[id]
 * Update team configuration
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();

    if (!canManageAIHub(user)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin permissions required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const input: UpdateTeamInput = {
      id,
      ...body,
      organizationId: user.organizationId,
    };

    // Validate input
    const validated = updateTeamSchema.parse(input);

    const team = await updateTeam(validated);

    return NextResponse.json({ team });
  } catch (error: any) {
    console.error('Error updating team:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update team' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/ai-hub/teams/[id]
 * Delete an agent team
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();

    if (!canManageAIHub(user)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin permissions required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    await deleteTeam(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting team:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete team' },
      { status: 500 }
    );
  }
}
