import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { canManageUsers } from '@/lib/auth/rbac';
import { suspendUser } from '@/lib/modules/admin';
import { z } from 'zod';

const suspendSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().min(1).max(500),
  suspendUntil: z.coerce.date().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !canManageUsers(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = suspendSchema.parse(body);

    const result = await suspendUser(validated);

    return NextResponse.json({
      success: true,
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
        is_active: result.is_active,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Suspend user API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to suspend user' },
      { status: 500 }
    );
  }
}
