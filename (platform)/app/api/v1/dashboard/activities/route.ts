import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import {
  getRecentActivities,
  getActivitiesByType,
  recordActivity,
} from '@/lib/modules/dashboard';
import { canAccessDashboard } from '@/lib/auth/rbac';
import { handleApiError } from '@/lib/api/error-handler';

/**
 * GET /api/v1/dashboard/activities
 * Retrieve recent activities for the current organization
 * Query params: limit (default: 20), type (optional filter)
 */
export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const user = await getCurrentUser();

    if (!user || !canAccessDashboard(user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');

    let activities;
    if (type) {
      activities = await getActivitiesByType(type, limit);
    } else {
      activities = await getRecentActivities(limit);
    }

    return NextResponse.json({
      activities,
      count: activities.length,
    });
  } catch (error) {
    console.error('[API] GET /api/v1/dashboard/activities failed:', error);
    return handleApiError(error);
  }
}

/**
 * POST /api/v1/dashboard/activities
 * Record a new activity
 */
export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const user = await getCurrentUser();

    if (!user || !canAccessDashboard(user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const activity = await recordActivity(body);

    return NextResponse.json(
      { activity },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] POST /api/v1/dashboard/activities failed:', error);
    return handleApiError(error);
  }
}
