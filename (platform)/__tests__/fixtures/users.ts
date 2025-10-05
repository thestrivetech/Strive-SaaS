/**
 * User Test Fixtures
 * Predefined user data for consistent testing
 */

import { UserRole, SubscriptionTier } from '@prisma/client';

export const testUsers = {
  admin: {
    email: 'admin@test.com',
    name: 'Test Admin',
    role: UserRole.ADMIN,
    subscriptionTier: SubscriptionTier.ENTERPRISE,
    isActive: true,
  },

  user: {
    email: 'user@test.com',
    name: 'Test User',
    role: UserRole.USER,
    subscriptionTier: SubscriptionTier.STARTER,
    isActive: true,
  },

  manager: {
    email: 'manager@test.com',
    name: 'Test Manager',
    role: UserRole.USER,
    subscriptionTier: SubscriptionTier.GROWTH,
    isActive: true,
  },

  customer: {
    email: 'customer@test.com',
    name: 'Test Customer',
    role: UserRole.USER,
    subscriptionTier: SubscriptionTier.FREE,
    isActive: true,
  },

  inactiveUser: {
    email: 'inactive@test.com',
    name: 'Inactive User',
    role: UserRole.USER,
    subscriptionTier: SubscriptionTier.FREE,
    isActive: false,
  },
};

export const passwordTestCases = {
  valid: [
    'Test123!@#',
    'P@ssw0rd123',
    'SecurePass123!',
    'MyP@ssword2024',
  ],
  invalid: {
    tooShort: 'Pass1!',
    noUppercase: 'password123!',
    noLowercase: 'PASSWORD123!',
    noNumber: 'Password!@#',
    noSpecial: 'Password123',
  },
};

export const emailTestCases = {
  valid: [
    'user@example.com',
    'test.user@company.co.uk',
    'user+tag@domain.com',
    'first.last@sub.domain.com',
  ],
  invalid: [
    'invalid-email',
    '@example.com',
    'user@',
    'user @example.com',
    'user@example',
  ],
};
