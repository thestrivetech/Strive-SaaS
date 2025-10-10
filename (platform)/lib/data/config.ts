/**
 * ⚠️ DEPRECATED: Mock Data Infrastructure
 *
 * This directory is NO LONGER USED in production.
 * All queries now use real Prisma database.
 *
 * DO NOT set NEXT_PUBLIC_USE_MOCKS=true in production!
 *
 * This code is kept for reference only and will be
 * removed in v2.0 release.
 *
 * Date Deprecated: 2025-10-10
 */

/**
 * Data Layer Configuration
 *
 * Toggle between mock data and real database
 * Set NEXT_PUBLIC_USE_MOCKS=true in .env.local to use mock data
 */

export const dataConfig = {
  useMocks: process.env.NEXT_PUBLIC_USE_MOCKS === 'true',

  // Mock data options
  mockOptions: {
    // Delay to simulate API latency (ms)
    delay: parseInt(process.env.NEXT_PUBLIC_MOCK_DELAY || '100'),

    // Enable/disable random errors for testing
    randomErrors: process.env.NEXT_PUBLIC_MOCK_ERRORS === 'true',

    // Error rate (0-1)
    errorRate: parseFloat(process.env.NEXT_PUBLIC_MOCK_ERROR_RATE || '0.1'),
  },
} as const;

/**
 * Simulate network delay for mock data
 */
export async function simulateDelay(ms?: number): Promise<void> {
  if (!dataConfig.useMocks) return;

  const delay = ms ?? dataConfig.mockOptions.delay;
  await new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Simulate random errors for testing
 */
export function maybeThrowError(message: string = 'Mock error'): void {
  if (!dataConfig.mockOptions.randomErrors) return;

  if (Math.random() < dataConfig.mockOptions.errorRate) {
    throw new Error(message);
  }
}
