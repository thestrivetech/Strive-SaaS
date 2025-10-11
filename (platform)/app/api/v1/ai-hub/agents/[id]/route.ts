import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { canAccessAIHub, canManageAIHub } from '@/lib/auth/rbac';
import { getAgentById } from '@/lib/modules/ai-hub/agents/queries';
import { updateAgent, deleteAgent } from '@/lib/modules/ai-hub/agents/actions';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/v1/ai-hub/agents/[id]
 * Get a single agent by ID
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

    const agent = await getAgentById(id, user.organizationId);

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: agent,
    });
  } catch (error: any) {
    console.error('[AI Hub Agents API] GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch agent' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/ai-hub/agents/[id]
 * Update an agent
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth();

    if (!canAccessAIHub(user)) {
      return NextResponse.json(
        { error: 'Unauthorized: AI Hub access required (GROWTH tier minimum)' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    const agent = await updateAgent({
      ...body,
      id,
    });

    return NextResponse.json({
      success: true,
      data: agent,
    });
  } catch (error: any) {
    console.error('[AI Hub Agents API] PATCH error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update agent' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/ai-hub/agents/[id]
 * Delete an agent
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth();

    if (!canManageAIHub(user)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin permissions required' },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    await deleteAgent(id);

    return NextResponse.json({
      success: true,
      message: 'Agent deleted successfully',
    });
  } catch (error: any) {
    console.error('[AI Hub Agents API] DELETE error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete agent' },
      { status: 500 }
    );
  }
}
