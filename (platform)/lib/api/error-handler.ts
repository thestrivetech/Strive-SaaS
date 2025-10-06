import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * Centralized API error handler
 * Converts various error types into consistent API responses
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  // Zod validation error
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation error',
        details: error.errors,
      },
      { status: 400 }
    );
  }

  // Prisma errors
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const prismaError = error as { code: string; meta?: any };

    // Unique constraint violation
    if (prismaError.code === 'P2002') {
      return NextResponse.json(
        { error: 'Resource already exists' },
        { status: 409 }
      );
    }

    // Record not found
    if (prismaError.code === 'P2025') {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    // Foreign key constraint failed
    if (prismaError.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid reference - related resource not found' },
        { status: 400 }
      );
    }
  }

  // Custom error messages
  if (error instanceof Error) {
    // Authorization errors
    if (error.message === 'Unauthorized' || error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Permission errors
    if (error.message === 'Forbidden' || error.message.includes('Insufficient permissions')) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    // Not found errors
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    // Bad request errors
    if (error.message.includes('Invalid') || error.message.includes('invalid')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
  }

  // Default error
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

/**
 * Error response helper for specific status codes
 */
export const ApiError = {
  unauthorized: (message = 'Unauthorized') =>
    NextResponse.json({ error: message }, { status: 401 }),

  forbidden: (message = 'Forbidden') =>
    NextResponse.json({ error: message }, { status: 403 }),

  notFound: (message = 'Resource not found') =>
    NextResponse.json({ error: message }, { status: 404 }),

  badRequest: (message = 'Bad request', details?: any) =>
    NextResponse.json({ error: message, details }, { status: 400 }),

  conflict: (message = 'Resource already exists') =>
    NextResponse.json({ error: message }, { status: 409 }),

  internal: (message = 'Internal server error') =>
    NextResponse.json({ error: message }, { status: 500 }),
};
