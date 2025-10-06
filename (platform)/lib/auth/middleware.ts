/**
 * Auth Middleware - Re-exports for cleaner imports
 */
export { requireAuth, requireSession, getCurrentUser } from './auth-helpers';
export { canAccessREID, canAccessFeature } from './rbac';
export type { EnhancedUser, UserWithOrganization } from './types';
