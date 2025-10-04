/**
 * Test Utility Functions
 * Additional helpers for testing, database operations, and assertions
 */

/**
 * Check if we're in a test environment
 */
export function isTestEnvironment(): boolean {
  return process.env.NODE_ENV === 'test';
}

/**
 * Get test database URL
 * Falls back to main DATABASE_URL if TEST_DATABASE_URL not set
 */
export function getTestDatabaseUrl(): string {
  return process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || '';
}

/**
 * Generate a unique test ID
 * Useful for creating unique emails, slugs, etc.
 */
export function generateTestId(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Generate a unique test email
 */
export function generateTestEmail(username: string = 'user'): string {
  return `${username}-${Date.now()}@test.example.com`;
}

/**
 * Clean up environment for testing
 * Removes any test pollution from environment variables
 */
export function cleanTestEnv(): void {
  // Clean up any test-specific env vars that shouldn't persist
  delete process.env.TEST_USER_ID;
  delete process.env.TEST_ORG_ID;
}

/**
 * Set up test environment variables
 */
export function setupTestEnv(vars: Record<string, string>): void {
  Object.entries(vars).forEach(([key, value]) => {
    process.env[key] = value;
  });
}

/**
 * Mock console methods to suppress logs during tests
 * Returns cleanup function to restore original methods
 */
export function suppressConsoleLogs(): () => void {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();

  return () => {
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
  };
}

/**
 * Capture console output during test execution
 * Returns array of logged messages
 */
export function captureConsole(): {
  logs: string[];
  warnings: string[];
  errors: string[];
  restore: () => void;
} {
  const logs: string[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  console.log = (...args: any[]) => logs.push(args.join(' '));
  console.warn = (...args: any[]) => warnings.push(args.join(' '));
  console.error = (...args: any[]) => errors.push(args.join(' '));

  return {
    logs,
    warnings,
    errors,
    restore: () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    },
  };
}

/**
 * Retry a function until it succeeds or times out
 * Useful for testing async operations with retries
 */
export async function retryUntilSuccess<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    timeout?: number;
  } = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts || 3;
  const delayMs = options.delayMs || 100;
  const timeout = options.timeout || 5000;
  const startTime = Date.now();

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Timeout after ${timeout}ms`);
    }

    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error('Failed after maximum attempts');
}

/**
 * Create a snapshot name for snapshot testing
 * Combines test suite and test name into a consistent format
 */
export function createSnapshotName(suiteName: string, testName: string): string {
  return `${suiteName}__${testName}`.replace(/\s+/g, '_').toLowerCase();
}

/**
 * Assert that two objects are deeply equal
 * Ignores specified properties (useful for timestamps, IDs, etc.)
 */
export function assertDeepEqualExcept<T extends Record<string, any>>(
  actual: T,
  expected: T,
  ignoreKeys: string[]
): void {
  const cleanActual = { ...actual };
  const cleanExpected = { ...expected };

  ignoreKeys.forEach((key) => {
    delete cleanActual[key];
    delete cleanExpected[key];
  });

  expect(cleanActual).toEqual(cleanExpected);
}

/**
 * Assert that a value is within a range
 */
export function assertInRange(
  value: number,
  min: number,
  max: number,
  message?: string
): void {
  expect(value).toBeGreaterThanOrEqual(min);
  expect(value).toBeLessThanOrEqual(max);

  if (message) {
    expect(true).toBe(true); // Just for the message
  }
}

/**
 * Assert that a timestamp is recent (within last N milliseconds)
 */
export function assertRecentTimestamp(
  timestamp: Date | string,
  withinMs: number = 5000
): void {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  expect(diff).toBeGreaterThanOrEqual(0);
  expect(diff).toBeLessThan(withinMs);
}

/**
 * Measure execution time of a function
 * Returns { result, durationMs }
 */
export async function measureExecutionTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; durationMs: number }> {
  const startTime = performance.now();
  const result = await fn();
  const endTime = performance.now();

  return {
    result,
    durationMs: endTime - startTime,
  };
}

/**
 * Assert that a function executes within a time limit
 */
export async function assertExecutesWithin<T>(
  fn: () => Promise<T>,
  maxMs: number
): Promise<T> {
  const { result, durationMs } = await measureExecutionTime(fn);

  expect(durationMs).toBeLessThan(maxMs);

  return result;
}
