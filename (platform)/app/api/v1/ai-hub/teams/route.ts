import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { canAccessAIHub, canManageAIHub } from '@/lib/auth/rbac';
import {
  getTeams,
  createTeam,
  teamFiltersSchema,
  createTeamSchema,
  type TeamFilters,
  type CreateTeamInput,
} from '@/lib/modules/ai-hub/teams';

/**
 * GET /api/v1/ai-hub/teams
 * List all agent teams for the current organization
 */
export async function GET(request: Request) {
  try {
    const user = await requireAuth();

    if (!canAccessAIHub(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const filters: Partial<TeamFilters> = {
      structure: searchParams.get('structure') as any,
      search: searchParams.get('search') || undefined,
      minMembers: searchParams.get('minMembers') ? parseInt(searchParams.get('minMembers')!) : undefined,
      maxMembers: searchParams.get('maxMembers') ? parseInt(searchParams.get('maxMembers')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
      sortBy: searchParams.get('sortBy') as any,
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    // Validate filters
    const validated = teamFiltersSchema.parse(filters);

    const teams = await getTeams(user.organizationId, validated);

    return NextResponse.json({
      teams,
      total: teams.length,
      limit: validated.limit,
      offset: validated.offset,
    });
  } catch (error: any) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/ai-hub/teams
 * Create a new agent team
 */
export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    if (!canManageAIHub(user)) {
      return NextResponse.json(
        { error: 'Unauthorized: AI Hub management requires GROWTH tier and Admin role' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const input: CreateTeamInput = {
      ...body,
      organizationId: user.organizationId,
    };

    // Validate input
    const validated = createTeamSchema.parse(input);

    const team = await createTeam(validated);

    return NextResponse.json({ team }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create team' },
      { status: 500 }
    );
  }
}
