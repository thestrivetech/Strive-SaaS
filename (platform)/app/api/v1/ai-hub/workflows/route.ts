import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { getWorkflows } from '@/lib/modules/ai-hub/workflows';
import { workflowFiltersSchema } from '@/lib/modules/ai-hub/workflows/schemas';
import { canAccessAIHub } from '@/lib/auth/rbac';

/**
 * GET /api/v1/ai-hub/workflows
 * Get all automation workflows for the current organization
 * RBAC: Requires AI Hub access (GROWTH tier minimum)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    if (!canAccessAIHub(user)) {
      return NextResponse.json(
        { error: 'Unauthorized: AI Hub requires GROWTH tier or higher' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const filters = workflowFiltersSchema.parse({
      isActive: searchParams.get('isActive') === 'true' ? true : undefined,
      search: searchParams.get('search'),
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    });

    const workflows = await getWorkflows(user.organizationId, filters);

    return NextResponse.json({ workflows });
  } catch (error: any) {
    console.error('[API] GET /api/v1/ai-hub/workflows failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
}
