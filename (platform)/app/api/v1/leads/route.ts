import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { getLeads, getLeadsCount } from '@/lib/modules/leads';
import { leadFiltersSchema } from '@/lib/modules/leads/schemas';
import { canAccessCRM } from '@/lib/auth/rbac';

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const user = await getCurrentUser();

    if (!user || !canAccessCRM(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const filters = leadFiltersSchema.parse({
      status: searchParams.get('status'),
      source: searchParams.get('source'),
      score: searchParams.get('score'),
      search: searchParams.get('search'),
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    });

    const [leads, total] = await Promise.all([
      getLeads(filters),
      getLeadsCount(filters),
    ]);

    return NextResponse.json({ leads, total, filters });
  } catch (error) {
    console.error('[API] GET /api/v1/leads failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}
