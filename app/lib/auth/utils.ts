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

export { UserRole, AUTH_ROUTES } from './constants';
