import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { canAccessAIHub } from '@/lib/auth/rbac';
import {
  getTeamExecutions,
  teamExecutionFiltersSchema,
  type TeamExecutionFilters,
} from '@/lib/modules/ai-hub/teams';

/**
 * GET /api/v1/ai-hub/teams/[id]/executions
 * Get execution history for a team
 */
export async function GET(
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const filters: Partial<TeamExecutionFilters> = {
      status: searchParams.get('status') as any,
      pattern: searchParams.get('pattern') as any,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };

    // Validate filters
    const validated = teamExecutionFiltersSchema.parse(filters);

    const result = await getTeamExecutions(teamId, user.organizationId, validated);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching team executions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch team executions' },
      { status: 500 }
    );
  }
}
