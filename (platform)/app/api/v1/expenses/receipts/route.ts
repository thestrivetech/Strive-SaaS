import { NextRequest, NextResponse } from 'next/server';
import { uploadReceipt } from '@/lib/modules/expense-tax/receipts/actions';

/**
 * Receipt Upload API Routes
 *
 * POST /api/v1/expenses/receipts - Upload receipt file
 *
 * SECURITY:
 * - Authentication required
 * - Multi-tenancy enforced
 * - File validation (type, size)
 * - Supabase Storage integration
 */

/**
 * POST /api/v1/expenses/receipts
 *
 * Upload receipt file for expense
 *
 * FormData fields:
 * - expenseId: string (UUID)
 * - file: File (image or PDF, max 10MB)
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const result = await uploadReceipt(formData);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('POST /api/v1/expenses/receipts error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload receipt' },
      { status: 500 }
    );
  }
}
