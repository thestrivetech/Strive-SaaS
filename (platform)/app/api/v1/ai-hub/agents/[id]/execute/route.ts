import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { canAccessAIHub } from '@/lib/auth/rbac';
import { executeAgent } from '@/lib/modules/ai-hub/agents/actions';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * POST /api/v1/ai-hub/agents/[id]/execute
 * Execute an agent with a task
 */
export async function POST(request: NextRequest, context: RouteContext) {
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

    const { task, context: taskContext, maxTokens, temperature } = body;

    if (!task || typeof task !== 'string') {
      return NextResponse.json({ error: 'Task is required' }, { status: 400 });
    }

    const execution = await executeAgent({
      agentId: id,
      task,
      context: taskContext,
      maxTokens,
      temperature,
    });

    return NextResponse.json({
      success: true,
      data: execution,
    });
  } catch (error: any) {
    console.error('[AI Hub Agents API] Execute error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to execute agent' },
      { status: 500 }
    );
  }
}
