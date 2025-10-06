import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent } from '@/lib/modules/onboarding/payment';
import { paymentIntentSchema } from '@/lib/modules/onboarding/schemas';

/**
 * POST /api/v1/onboarding/payment-intent
 *
 * Create Stripe payment intent for onboarding
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const { sessionToken, tier, billingCycle } = paymentIntentSchema.parse(body);

    // Create payment intent
    const result = await createPaymentIntent(tier, billingCycle, sessionToken);

    if (!result) {
      return NextResponse.json({
        success: true,
        requiresPayment: false,
        message: 'Selected tier does not require payment',
      });
    }

    return NextResponse.json({
      success: true,
      requiresPayment: true,
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
    });
  } catch (error: any) {
    console.error('Payment intent creation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create payment intent',
      },
      { status: 400 }
    );
  }
}
