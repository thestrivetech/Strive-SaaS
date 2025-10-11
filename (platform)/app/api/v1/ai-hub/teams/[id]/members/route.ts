import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { canManageAIHub } from '@/lib/auth/rbac';
import {
  addTeamMember,
  addTeamMemberSchema,
  type AddTeamMemberInput,
} from '@/lib/modules/ai-hub/teams';

/**
 * POST /api/v1/ai-hub/teams/[id]/members
 * Add a member to a team
 */
export async function POST(
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

    const { id: teamId } = await params;
    const body = await request.json();

    const input: AddTeamMemberInput = {
      teamId,
      ...body,
    };

    // Validate input
    const validated = addTeamMemberSchema.parse(input);

    const member = await addTeamMember(validated);

    return NextResponse.json({ member }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding team member:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add team member' },
      { status: 500 }
    );
  }
}
