import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { canManageAIHub } from '@/lib/auth/rbac';
import {
  updateTeamMember,
  removeTeamMember,
  updateTeamMemberSchema,
  type UpdateTeamMemberInput,
} from '@/lib/modules/ai-hub/teams';

/**
 * PATCH /api/v1/ai-hub/teams/[id]/members/[memberId]
 * Update team member role or priority
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const user = await requireAuth();

    if (!canManageAIHub(user)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin permissions required' },
        { status: 403 }
      );
    }

    const { memberId } = await params;
    const body = await request.json();

    const input: UpdateTeamMemberInput = {
      id: memberId,
      ...body,
    };

    // Validate input
    const validated = updateTeamMemberSchema.parse(input);

    const member = await updateTeamMember(validated);

    return NextResponse.json({ member });
  } catch (error: any) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update team member' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/ai-hub/teams/[id]/members/[memberId]
 * Remove a member from a team
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const user = await requireAuth();

    if (!canManageAIHub(user)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin permissions required' },
        { status: 403 }
      );
    }

    const { memberId } = await params;
    await removeTeamMember(memberId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error removing team member:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove team member' },
      { status: 500 }
    );
  }
}
