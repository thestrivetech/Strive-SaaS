export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
  USER: 'USER',
} as const;

export type UserRole = keyof typeof USER_ROLES;

export const SUBSCRIPTION_TIERS = {
  FREE: 'FREE',
  CUSTOM: 'CUSTOM',
  STARTER: 'STARTER',
  GROWTH: 'GROWTH',
  ELITE: 'ELITE',
  ENTERPRISE: 'ENTERPRISE',
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

export const AUTH_ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/login',
  FORGOT_PASSWORD: '/login',
  RESET_PASSWORD: '/login',
} as const;

export const PROTECTED_ROUTES = [
  '/dashboard',
  '/crm',
  '/projects',
  '/ai',
  '/tools',
  '/settings',
] as const;

export const PUBLIC_ROUTES = [
  '/',
  '/login',
] as const;

export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: {
    canViewAllOrganizations: true,
    canManageUsers: true,
    canManageOrganizations: true,
    canManageProjects: true,
    canManageCustomers: true,
    canManageAI: true,
    canManageBilling: true,
    canViewAnalytics: true,
    canManageSettings: true,
  },
  ADMIN: {
    canViewAllOrganizations: false,
    canManageUsers: true,
    canManageOrganizations: true,
    canManageProjects: true,
    canManageCustomers: true,
    canManageAI: true,
    canManageBilling: true,
    canViewAnalytics: true,
    canManageSettings: true,
  },
  MODERATOR: {
    canViewAllOrganizations: false,
    canManageUsers: true,
    canManageOrganizations: false,
    canManageProjects: true,
    canManageCustomers: true,
    canManageAI: true,
    canManageBilling: false,
    canViewAnalytics: true,
    canManageSettings: true,
  },
  USER: {
    canViewAllOrganizations: false,
    canManageUsers: false,
    canManageOrganizations: false,
    canManageProjects: true,
    canManageCustomers: true,
    canManageAI: true,
    canManageBilling: false,
    canViewAnalytics: true,
    canManageSettings: false,
  },
} as const;

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  SESSION_EXPIRED: 'Session expired. Please login again',
  UNAUTHORIZED: 'You do not have permission to access this resource',
  FORBIDDEN: 'Access forbidden',
} as const;