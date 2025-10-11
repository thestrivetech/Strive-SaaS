import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { canAccessAIHub } from '@/lib/auth/rbac';
import { getAgentExecutions } from '@/lib/modules/ai-hub/agents/queries';
import { executionFiltersSchema } from '@/lib/modules/ai-hub/agents/schemas';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/v1/ai-hub/agents/[id]/executions
 * Get execution history for an agent
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth();

    if (!canAccessAIHub(user)) {
      return NextResponse.json(
        { error: 'Unauthorized: AI Hub access required (GROWTH tier minimum)' },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const filters = executionFiltersSchema.parse({
      status: searchParams.get('status') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    });

    const executions = await getAgentExecutions(id, user.organizationId, filters);

    return NextResponse.json({
      success: true,
      data: executions,
      count: executions.length,
    });
  } catch (error: any) {
    console.error('[AI Hub Agents API] GET executions error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch executions' },
      { status: 500 }
    );
  }
}
