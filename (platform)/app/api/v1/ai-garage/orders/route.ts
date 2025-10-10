import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getOrders, getOrdersCount } from '@/lib/modules/ai-garage/orders';
import { canAccessAIGarage } from '@/lib/auth/rbac';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !canAccessAIGarage(user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const filters = {
      status: searchParams.get('status'),
      complexity: searchParams.get('complexity'),
      search: searchParams.get('search'),
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };

    const [orders, total] = await Promise.all([
      getOrders(filters),
      getOrdersCount(filters),
    ]);

    return NextResponse.json({ orders, total, filters });
  } catch (error) {
    console.error('[API] GET /api/v1/ai-garage/orders failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
