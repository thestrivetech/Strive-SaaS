// Jest setup file - runs before each test suite
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill for TextEncoder/TextDecoder (needed for some tests)
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// Load test environment variables
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.test') });

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  useParams() {
    return {};
  },
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

// Mock Next.js headers
jest.mock('next/headers', () => ({
  cookies() {
    return {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      has: jest.fn(),
      getAll: jest.fn(),
    };
  },
  headers() {
    return new Map();
  },
}));

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      getUser: jest.fn(),
      refreshSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        download: jest.fn(),
        remove: jest.fn(),
        getPublicUrl: jest.fn(),
      })),
    },
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    })),
  })),
}));

// Mock Prisma client (will be replaced with actual test client in test-helpers)
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn(),
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    organization: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    // Add more models as needed
  },
}));

// Mock @faker-js/faker (ESM module causing issues)
// Tests that need faker should import from test utils instead
jest.mock('@faker-js/faker', () => ({
  faker: {
    internet: {
      email: jest.fn(() => 'test@example.com'),
      url: jest.fn(() => 'https://example.com'),
      userName: jest.fn(() => 'testuser'),
    },
    person: {
      fullName: jest.fn(() => 'Test User'),
      firstName: jest.fn(() => 'Test'),
      lastName: jest.fn(() => 'User'),
    },
    company: {
      name: jest.fn(() => 'Test Company'),
    },
    date: {
      past: jest.fn(() => new Date('2024-01-01')),
      future: jest.fn(() => new Date('2025-12-31')),
      recent: jest.fn(() => new Date()),
    },
    number: {
      int: jest.fn((options?: { min?: number; max?: number }) => {
        const min = options?.min ?? 0;
        const max = options?.max ?? 100;
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }),
    },
    helpers: {
      arrayElement: jest.fn((arr: unknown[]) => arr[0]),
      shuffle: jest.fn((arr: unknown[]) => arr),
    },
    datatype: {
      boolean: jest.fn(() => true),
      uuid: jest.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
    },
    string: {
      uuid: jest.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
      alpha: jest.fn(() => 'abc'),
      alphanumeric: jest.fn(() => 'abc123'),
    },
    lorem: {
      sentence: jest.fn(() => 'Test sentence.'),
      paragraph: jest.fn(() => 'Test paragraph.'),
      words: jest.fn(() => 'test words'),
    },
  },
}));

// Suppress console errors and warnings in tests (optional)
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Warning: useLayoutEffect') ||
        args[0].includes('Not implemented: HTMLFormElement.prototype.requestSubmit'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('componentWillReceiveProps')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Global test cleanup
afterEach(() => {
  jest.clearAllMocks();
});
