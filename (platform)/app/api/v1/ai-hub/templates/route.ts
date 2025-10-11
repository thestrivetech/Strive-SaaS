import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { canManageAIHub, canAccessAIHub } from '@/lib/auth/rbac';
import {
  getTemplates,
  getPublicTemplates,
  createTemplate,
  createTemplateSchema,
  templateFiltersSchema,
} from '@/lib/modules/ai-hub/templates';

/**
 * GET /api/v1/ai-hub/templates
 * List templates with filtering
 */
export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const publicOnly = searchParams.get('public') === 'true';

    const filters = {
      category: searchParams.get('category') || undefined,
      difficulty: searchParams.get('difficulty') || undefined,
      is_featured: searchParams.get('is_featured')
        ? searchParams.get('is_featured') === 'true'
        : undefined,
      is_public: searchParams.get('is_public')
        ? searchParams.get('is_public') === 'true'
        : undefined,
      minRating: searchParams.get('minRating')
        ? parseFloat(searchParams.get('minRating')!)
        : undefined,
      tags: searchParams.get('tags')?.split(',') || undefined,
      search: searchParams.get('search') || undefined,
    };

    // Validate filters
    const validatedFilters = templateFiltersSchema.parse(filters);

    // Get public templates or organization templates
    const templates = publicOnly
      ? await getPublicTemplates(validatedFilters)
      : await getTemplates(session.organizationId, validatedFilters);

    return NextResponse.json({
      success: true,
      data: templates,
      count: templates.length,
    });
  } catch (error: any) {
    console.error('[API] Get templates error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch templates',
      },
      { status: error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

/**
 * POST /api/v1/ai-hub/templates
 * Create new template
 */
export async function POST(request: NextRequest) {
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
    const input = createTemplateSchema.parse({
      ...body,
      organizationId: session.organizationId,
    });

    const template = await createTemplate(input);

    return NextResponse.json(
      {
        success: true,
        data: template,
        message: 'Template created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API] Create template error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create template',
      },
      { status: error.message.includes('Unauthorized') ? 403 : 400 }
    );
  }
}
