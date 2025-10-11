import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { canManageAIHub } from '@/lib/auth/rbac';
import { testExistingIntegration } from '@/lib/modules/ai-hub/integrations';

/**
 * POST /api/v1/ai-hub/integrations/[id]/test
 * Test integration connection
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();

    if (!canManageAIHub(session)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: AI Hub management permission required',
        },
        { status: 403 }
      );
    }

    const result = await testExistingIntegration(
      params.id,
      session.organizationId
    );

    return NextResponse.json({
      success: result.success,
      message: result.message,
      error: result.error,
    });
  } catch (error: any) {
    console.error('[API] Test integration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to test integration',
      },
      { status: 500 }
    );
  }
}
