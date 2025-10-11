import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { canAccessAIHub } from '@/lib/auth/rbac';
import { getAgents } from '@/lib/modules/ai-hub/agents/queries';
import { createAgent } from '@/lib/modules/ai-hub/agents/actions';
import { agentFiltersSchema } from '@/lib/modules/ai-hub/agents/schemas';

/**
 * GET /api/v1/ai-hub/agents
 * List all agents for the organization
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    if (!canAccessAIHub(user)) {
      return NextResponse.json(
        { error: 'Unauthorized: AI Hub access required (GROWTH tier minimum)' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const filters = agentFiltersSchema.parse({
      status: searchParams.get('status') || undefined,
      provider: searchParams.get('provider') || undefined,
      is_active: searchParams.get('is_active') ? searchParams.get('is_active') === 'true' : undefined,
      search: searchParams.get('search') || undefined,
      capabilities: searchParams.get('capabilities')?.split(',') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
      sortBy: searchParams.get('sortBy') as any || undefined,
      sortOrder: searchParams.get('sortOrder') as any || undefined,
    });

    const agents = await getAgents(user.organizationId, filters);

    return NextResponse.json({
      success: true,
      data: agents,
      count: agents.length,
    });
  } catch (error: any) {
    console.error('[AI Hub Agents API] GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/ai-hub/agents
 * Create a new agent
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    if (!canAccessAIHub(user)) {
      return NextResponse.json(
        { error: 'Unauthorized: AI Hub access required (GROWTH tier minimum)' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const agent = await createAgent({
      ...body,
      organizationId: user.organizationId,
    });

    return NextResponse.json(
      {
        success: true,
        data: agent,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[AI Hub Agents API] POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create agent' },
      { status: 500 }
    );
  }
}
