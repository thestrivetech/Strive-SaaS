import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessAIHub } from '@/lib/auth/rbac';
import { reviewTemplate, reviewTemplateSchema } from '@/lib/modules/ai-hub/templates';

/**
 * GET /api/v1/ai-hub/templates/[id]/reviews
 * Get template reviews
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

    // In a full implementation, fetch reviews from a separate reviews table
    // For now, return template stats
    return NextResponse.json({
      success: true,
      data: {
        message: 'Reviews feature coming soon',
        templateId: params.id,
      },
    });
  } catch (error: any) {
    console.error('[API] Get reviews error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch reviews',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/ai-hub/templates/[id]/reviews
 * Submit template review
 */
export async function POST(
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

    const body = await request.json();

    // Validate input
    const input = reviewTemplateSchema.parse({
      templateId: params.id,
      rating: body.rating,
      comment: body.comment,
      organizationId: session.organizationId,
      userId: session.id,
    });

    const result = await reviewTemplate(input);

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: 'Review submitted successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API] Submit review error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to submit review',
      },
      { status: error.message.includes('Unauthorized') ? 403 : 400 }
    );
  }
}
