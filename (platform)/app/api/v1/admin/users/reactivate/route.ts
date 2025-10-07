import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { canManageUsers } from '@/lib/auth/rbac';
import { reactivateUser } from '@/lib/modules/admin';
import { z } from 'zod';

const reactivateSchema = z.object({
  userId: z.string().uuid(),
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
    const validated = reactivateSchema.parse(body);

    const reactivatedUser = await reactivateUser(validated.userId);

    return NextResponse.json({
      success: true,
      user: {
        id: reactivatedUser.id,
        name: reactivatedUser.name,
        email: reactivatedUser.email,
        is_active: reactivatedUser.is_active,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Reactivate user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reactivate user' },
      { status: 500 }
    );
  }
}
