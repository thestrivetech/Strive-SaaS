import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { canManageAIHub } from '@/lib/auth/rbac';
import {
  getIntegrationById,
  updateIntegration,
  deleteIntegration,
  updateIntegrationSchema,
} from '@/lib/modules/ai-hub/integrations';

/**
 * GET /api/v1/ai-hub/integrations/[id]
 * Get integration by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();

    const integration = await getIntegrationById(
      params.id,
      session.organizationId
    );

    if (!integration) {
      return NextResponse.json(
        {
          success: false,
          error: 'Integration not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: integration,
    });
  } catch (error: any) {
    console.error('[API] Get integration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch integration',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/ai-hub/integrations/[id]
 * Update integration
 */
export async function PATCH(
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

    const body = await request.json();

    // Validate input
    const input = updateIntegrationSchema.parse(body);

    const integration = await updateIntegration(
      params.id,
      session.organizationId,
      input
    );

    return NextResponse.json({
      success: true,
      data: integration,
      message: 'Integration updated successfully',
    });
  } catch (error: any) {
    console.error('[API] Update integration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update integration',
      },
      { status: error.message.includes('Unauthorized') ? 403 : 400 }
    );
  }
}

/**
 * DELETE /api/v1/ai-hub/integrations/[id]
 * Delete integration
 */
export async function DELETE(
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

    await deleteIntegration(params.id, session.organizationId);

    return NextResponse.json({
      success: true,
      message: 'Integration deleted successfully',
    });
  } catch (error: any) {
    console.error('[API] Delete integration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete integration',
      },
      { status: error.message.includes('Unauthorized') ? 403 : 400 }
    );
  }
}
