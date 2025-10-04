import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';

/**
 * Health Check Endpoint
 *
 * Returns application health status including:
 * - Database connectivity
 * - Environment configuration
 * - System timestamp
 *
 * @returns 200 OK if healthy, 500 if unhealthy
 *
 * Usage:
 * - Uptime monitoring: curl https://app.strivetech.ai/api/health
 * - Deployment verification: Check after each deploy
 * - Load balancer health checks: Configure to poll this endpoint
 *
 * @example
 * ```bash
 * curl https://app.strivetech.ai/api/health
 * # Response (healthy):
 * {
 *   "status": "healthy",
 *   "timestamp": "2025-01-04T12:00:00.000Z",
 *   "environment": "production",
 *   "checks": {
 *     "database": "connected",
 *     "environment": "valid"
 *   }
 * }
 * ```
 */
export async function GET() {
  const checks: Record<string, string> = {};
  const errors: string[] = [];

  try {
    // Check 1: Database connectivity
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = 'connected';
    } catch (dbError) {
      checks.database = 'disconnected';
      errors.push(
        `Database connection failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`
      );
    }

    // Check 2: Required environment variables
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
    ];

    const missingEnvVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingEnvVars.length === 0) {
      checks.environment = 'valid';
    } else {
      checks.environment = 'invalid';
      errors.push(`Missing environment variables: ${missingEnvVars.join(', ')}`);
    }

    // Check 3: Optional services (non-blocking)
    const optionalEnvVars = ['OPENROUTER_API_KEY', 'GROQ_API_KEY'];
    const missingOptional = optionalEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingOptional.length > 0) {
      checks.optional_services = 'partial';
      // Not an error, just informational
    } else {
      checks.optional_services = 'available';
    }

    // Determine overall health status
    const isHealthy = errors.length === 0;

    if (isHealthy) {
      return NextResponse.json(
        {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'unknown',
          checks,
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'no-store, must-revalidate',
            'Content-Type': 'application/json',
          },
        }
      );
    } else {
      return NextResponse.json(
        {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'unknown',
          checks,
          errors,
        },
        {
          status: 500,
          headers: {
            'Cache-Control': 'no-store, must-revalidate',
            'Content-Type': 'application/json',
          },
        }
      );
    }
  } catch (error) {
    // Catch-all for unexpected errors
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'unknown',
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error during health check',
        checks,
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

/**
 * HEAD method for lightweight health checks
 * Returns only status code (200 or 500) without body
 *
 * Useful for load balancers that only need status code
 */
export async function HEAD() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}
