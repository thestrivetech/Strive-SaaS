// Re-export auth utilities for compatibility
export {
  createSupabaseServerClient,
  getSession,
  getCurrentUser,
  requireAuth,
  requireRole,
  requireOrganization,
  signOut,
  signIn,
  signUp
} from './auth-helpers';

export type { UserRole } from './constants';
export { AUTH_ROUTES } from './constants';
