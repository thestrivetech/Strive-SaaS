import { NextRequest, NextResponse } from 'next/server';
import {
  createOnboardingSession,
  updateOnboardingStep,
  completeOnboarding,
} from '@/lib/modules/onboarding';

/**
 * POST /api/v1/onboarding/session
 *
 * Manage onboarding sessions:
 * - action: 'create' - Create new session
 * - action: 'update' - Update step data
 * - action: 'complete' - Complete onboarding
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ...data } = body;

    // Create new session
    if (action === 'create') {
      const result = await createOnboardingSession({
        userId: data.userId,
      });

      return NextResponse.json(result);
    }

    // Update step
    if (action === 'update') {
      const result = await updateOnboardingStep({
        sessionToken: data.sessionToken,
        step: data.step,
        data: data.data,
      });

      return NextResponse.json(result);
    }

    // Complete onboarding
    if (action === 'complete') {
      const result = await completeOnboarding({
        sessionToken: data.sessionToken,
      });

      return NextResponse.json(result);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid action. Must be: create, update, or complete',
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Onboarding session error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/onboarding/session?token=xxx
 *
 * Get session details by token
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionToken = searchParams.get('token');

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Session token required' },
        { status: 400 }
      );
    }

    const { getSessionByToken } = await import('@/lib/modules/onboarding');
    const session = await getSessionByToken(sessionToken);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    console.error('Get session error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to retrieve session',
      },
      { status: 500 }
    );
  }
}
