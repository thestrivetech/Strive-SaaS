import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { canAccessAIHub } from '@/lib/auth/rbac';
import {
  executeTeam,
  executeTeamSchema,
  type ExecuteTeamInput,
} from '@/lib/modules/ai-hub/teams';

/**
 * POST /api/v1/ai-hub/teams/[id]/execute
 * Execute a team task
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();

    if (!canAccessAIHub(user)) {
      return NextResponse.json(
        { error: 'Unauthorized: AI Hub access required' },
        { status: 403 }
      );
    }

    const { id: teamId } = await params;
    const body = await request.json();

    const input: ExecuteTeamInput = {
      teamId,
      ...body,
    };

    // Validate input
    const validated = executeTeamSchema.parse(input);

    const execution = await executeTeam(validated);

    return NextResponse.json({ execution }, { status: 200 });
  } catch (error: any) {
    console.error('Error executing team:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to execute team' },
      { status: 500 }
    );
  }
}
