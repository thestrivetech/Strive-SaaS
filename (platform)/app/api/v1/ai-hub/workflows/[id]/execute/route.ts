import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { executeWorkflow } from '@/lib/modules/ai-hub/workflows/actions';
import { canAccessAIHub } from '@/lib/auth/rbac';

/**
 * POST /api/v1/ai-hub/workflows/[id]/execute
 * Execute an automation workflow
 * RBAC: Requires AI Hub access (GROWTH tier minimum)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();

    if (!canAccessAIHub(user)) {
      return NextResponse.json(
        { error: 'Unauthorized: AI Hub requires GROWTH tier or higher' },
        { status: 403 }
      );
    }

    const { input } = await req.json();
    const { id } = await params;

    const execution = await executeWorkflow({
      workflowId: id,
      input,
    });

    return NextResponse.json({ execution });
  } catch (error: any) {
    console.error('[API] POST /api/v1/ai-hub/workflows/[id]/execute failed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to execute workflow' },
      { status: 500 }
    );
  }
}
