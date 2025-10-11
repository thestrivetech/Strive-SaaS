import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { canManageAIHub } from '@/lib/auth/rbac';
import { useTemplate, useTemplateSchema } from '@/lib/modules/ai-hub/templates';

/**
 * POST /api/v1/ai-hub/templates/[id]/use
 * Instantiate template as workflow
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

    const body = await request.json();

    // Validate input
    const input = useTemplateSchema.parse({
      templateId: params.id,
      name: body.name,
      description: body.description,
      variables: body.variables || {},
      organizationId: session.organizationId,
      creatorId: session.id,
    });

    const workflow = await useTemplate(input);

    return NextResponse.json(
      {
        success: true,
        data: workflow,
        message: 'Workflow created from template successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API] Use template error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create workflow from template',
      },
      { status: error.message.includes('Unauthorized') ? 403 : 400 }
    );
  }
}
