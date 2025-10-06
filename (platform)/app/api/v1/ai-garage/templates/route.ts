import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { canAccessAIGarage } from '@/lib/auth/rbac';
import {
  getTemplates,
  getTemplatesCount,
  type TemplateFilters,
} from '@/lib/modules/ai-garage/templates';
import { AgentCategory } from '@prisma/client';

/**
 * GET /api/v1/ai-garage/templates
 *
 * Fetch agent templates with marketplace visibility rules
 *
 * Query Parameters:
 * - category: AgentCategory (optional)
 * - is_public: boolean (optional)
 * - is_system: boolean (optional)
 * - search: string (optional)
 * - tags: string[] (optional, comma-separated)
 * - min_rating: number (optional)
 * - min_usage_count: number (optional)
 * - limit: number (default: 50, max: 100)
 * - offset: number (default: 0)
 * - sort_by: 'created_at' | 'updated_at' | 'usage_count' | 'rating' | 'name' (default: 'usage_count')
 * - sort_order: 'asc' | 'desc' (default: 'desc')
 *
 * Returns:
 * - templates: Array of templates with creator and review data
 * - total: Total count of templates matching filters
 * - pagination: Pagination metadata
 */
export async function GET(req: NextRequest) {
  try {
    // Require authentication
    await requireAuth();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check RBAC permissions
    if (!canAccessAIGarage(user)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions to access AI Garage' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);

    const filters: TemplateFilters = {
      category: searchParams.get('category') as AgentCategory | undefined,
      is_public: searchParams.get('is_public') === 'true' ? true : undefined,
      is_system: searchParams.get('is_system') === 'true' ? true : undefined,
      search: searchParams.get('search') || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
      min_rating: searchParams.get('min_rating')
        ? parseFloat(searchParams.get('min_rating')!)
        : undefined,
      min_usage_count: searchParams.get('min_usage_count')
        ? parseInt(searchParams.get('min_usage_count')!, 10)
        : undefined,
      limit: searchParams.get('limit')
        ? Math.min(parseInt(searchParams.get('limit')!, 10), 100)
        : 50,
      offset: searchParams.get('offset')
        ? parseInt(searchParams.get('offset')!, 10)
        : 0,
      sort_by: (searchParams.get('sort_by') as any) || 'usage_count',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
    };

    // Fetch templates and count
    const [templates, total] = await Promise.all([
      getTemplates(filters),
      getTemplatesCount(filters),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / filters.limit);
    const currentPage = Math.floor(filters.offset / filters.limit) + 1;

    return NextResponse.json({
      success: true,
      data: {
        templates,
        total,
        pagination: {
          page: currentPage,
          limit: filters.limit,
          offset: filters.offset,
          total,
          totalPages,
          hasNext: filters.offset + filters.limit < total,
          hasPrevious: filters.offset > 0,
        },
      },
    });
  } catch (error) {
    console.error('[API] GET /api/v1/ai-garage/templates failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch templates',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/ai-garage/templates
 *
 * Create a new agent template
 *
 * Note: Use Server Action `createTemplate` from '@/lib/modules/ai-garage/templates'
 * This endpoint is for REST API compatibility only
 */
export async function POST(req: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'Use Server Action createTemplate() for template creation',
      hint: "import { createTemplate } from '@/lib/modules/ai-garage/templates'",
    },
    { status: 405 }
  );
}
