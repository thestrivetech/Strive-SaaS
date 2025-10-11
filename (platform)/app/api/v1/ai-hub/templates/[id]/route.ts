import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { canManageAIHub, canAccessAIHub } from '@/lib/auth/rbac';
import {
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  updateTemplateSchema,
} from '@/lib/modules/ai-hub/templates';

/**
 * GET /api/v1/ai-hub/templates/[id]
 * Get template by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();

    if (!canAccessAIHub(session)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: AI Hub access requires GROWTH tier or higher',
        },
        { status: 403 }
      );
    }

    const template = await getTemplateById(
      params.id,
      session.organizationId
    );

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          error: 'Template not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: template,
    });
  } catch (error: any) {
    console.error('[API] Get template error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch template',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/ai-hub/templates/[id]
 * Update template
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
    const input = updateTemplateSchema.parse(body);

    const template = await updateTemplate(
      params.id,
      session.organizationId,
      input
    );

    return NextResponse.json({
      success: true,
      data: template,
      message: 'Template updated successfully',
    });
  } catch (error: any) {
    console.error('[API] Update template error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update template',
      },
      { status: error.message.includes('Unauthorized') ? 403 : 400 }
    );
  }
}

/**
 * DELETE /api/v1/ai-hub/templates/[id]
 * Delete template
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

    await deleteTemplate(params.id, session.organizationId);

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error: any) {
    console.error('[API] Delete template error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete template',
      },
      { status: error.message.includes('Unauthorized') ? 403 : 400 }
    );
  }
}
