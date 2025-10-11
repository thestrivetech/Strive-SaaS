import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { canManageAIHub } from '@/lib/auth/rbac';
import {
  getIntegrations,
  createIntegration,
  createIntegrationSchema,
  integrationFiltersSchema,
} from '@/lib/modules/ai-hub/integrations';

/**
 * GET /api/v1/ai-hub/integrations
 * List integrations with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      provider: searchParams.get('provider') || undefined,
      status: searchParams.get('status') || undefined,
      is_active: searchParams.get('is_active')
        ? searchParams.get('is_active') === 'true'
        : undefined,
      search: searchParams.get('search') || undefined,
    };

    // Validate filters
    const validatedFilters = integrationFiltersSchema.parse(filters);

    const integrations = await getIntegrations(
      session.organizationId,
      validatedFilters
    );

    return NextResponse.json({
      success: true,
      data: integrations,
      count: integrations.length,
    });
  } catch (error: any) {
    console.error('[API] Get integrations error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch integrations',
      },
      { status: error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

/**
 * POST /api/v1/ai-hub/integrations
 * Create new integration
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
    const input = createIntegrationSchema.parse({
      ...body,
      organizationId: session.organizationId,
    });

    const integration = await createIntegration(input);

    return NextResponse.json(
      {
        success: true,
        data: integration,
        message: 'Integration created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API] Create integration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create integration',
      },
      { status: error.message.includes('Unauthorized') ? 403 : 400 }
    );
  }
}
