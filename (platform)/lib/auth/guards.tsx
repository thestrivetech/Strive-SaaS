/**
 * Authentication & Authorization Guard Components
 *
 * Server Component-based guards for declarative route protection.
 * Use these in layout.tsx files to enforce auth/RBAC at the layout level.
 *
 * @example
 * ```typescript
 * // app/crm/layout.tsx
 * import { RequireAuth, RequirePermission } from '@/lib/auth/guards';
 *
 * export default function CRMLayout({ children }) {
 *   return (
 *     <RequireAuth>
 *       <RequirePermission permission="crm:read">
 *         {children}
 *       </RequirePermission>
 *     </RequireAuth>
 *   );
 * }
 * ```
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from './auth-helpers';
import { hasPermission } from './rbac';
import { hasOrgPermission, type OrgPermission } from './org-rbac';
import { AUTH_ROUTES, type UserRole } from './constants';
import type { ReactNode } from 'react';

/**
 * Props for guard components
 */
interface GuardProps {
  children: ReactNode;
}

interface RequireRoleProps extends GuardProps {
  role: UserRole;
  fallbackUrl?: string;
}

interface RequirePermissionProps extends GuardProps {
  permission: string; // Global permission (e.g., 'crm:read')
  fallbackUrl?: string;
}

interface RequireOrgPermissionProps extends GuardProps {
  permission: OrgPermission;
  fallbackUrl?: string;
}

/**
 * Require user to be authenticated
 *
 * Redirects to login if user is not authenticated.
 * Use this as the outermost guard in protected layouts.
 *
 * @example
 * ```typescript
 * export default function DashboardLayout({ children }) {
 *   return (
 *     <RequireAuth>
 *       {children}
 *     </RequireAuth>
 *   );
 * }
 * ```
 */
export async function RequireAuth({ children }: GuardProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(AUTH_ROUTES.LOGIN);
  }

  return <>{children}</>;
}

/**
 * Require user to have a specific global role
 *
 * Redirects to fallback (or /dashboard) if user doesn't have the required role.
 * ADMIN role bypasses this check (can access everything).
 *
 * @example
 * ```typescript
 * export default function AdminLayout({ children }) {
 *   return (
 *     <RequireAuth>
 *       <RequireRole role="ADMIN">
 *         {children}
 *       </RequireRole>
 *     </RequireAuth>
 *   );
 * }
 * ```
 */
export async function RequireRole({
  role,
  fallbackUrl = '/dashboard',
  children,
}: RequireRoleProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(AUTH_ROUTES.LOGIN);
  }

  // ADMIN can access everything
  if (user.role === 'ADMIN') {
    return <>{children}</>;
  }

  // Check specific role
  if (user.role !== role) {
    redirect(fallbackUrl);
  }

  return <>{children}</>;
}

/**
 * Require user to have a specific global permission
 *
 * Checks RBAC permissions from constants.ROLE_PERMISSIONS.
 * Redirects to fallback if user doesn't have permission.
 *
 * @example
 * ```typescript
 * export default function CRMLayout({ children }) {
 *   return (
 *     <RequireAuth>
 *       <RequirePermission permission="crm:read">
 *         {children}
 *       </RequirePermission>
 *     </RequireAuth>
 *   );
 * }
 * ```
 */
export async function RequirePermission({
  permission,
  fallbackUrl = '/dashboard',
  children,
}: RequirePermissionProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(AUTH_ROUTES.LOGIN);
  }

  const hasPerm = await hasPermission(permission as never);

  if (!hasPerm) {
    redirect(fallbackUrl);
  }

  return <>{children}</>;
}

/**
 * Require user to have a specific organization permission
 *
 * Checks organization-level RBAC (dual-role system).
 * Requires user to be in an organization.
 *
 * @example
 * ```typescript
 * export default function OrgSettingsLayout({ children }) {
 *   return (
 *     <RequireAuth>
 *       <RequireOrgPermission permission="settings:edit">
 *         {children}
 *       </RequireOrgPermission>
 *     </RequireAuth>
 *   );
 * }
 * ```
 */
export async function RequireOrgPermission({
  permission,
  fallbackUrl = '/dashboard',
  children,
}: RequireOrgPermissionProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(AUTH_ROUTES.LOGIN);
  }

  // Check if user is in an organization
  const orgMembership = user.organizationMembers?.[0];

  if (!orgMembership) {
    redirect('/onboarding/organization');
  }

  // Check org permission
  const hasPerm = hasOrgPermission(
    user.role as UserRole,
    orgMembership.role,
    permission
  );

  if (!hasPerm) {
    redirect(fallbackUrl);
  }

  return <>{children}</>;
}

/**
 * Require user to be in an organization
 *
 * Redirects to organization onboarding if user is not in any organization.
 *
 * @example
 * ```typescript
 * export default function OrgRequiredLayout({ children }) {
 *   return (
 *     <RequireAuth>
 *       <RequireOrganization>
 *         {children}
 *       </RequireOrganization>
 *     </RequireAuth>
 *   );
 * }
 * ```
 */
export async function RequireOrganization({ children }: GuardProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(AUTH_ROUTES.LOGIN);
  }

  if (!user.organizationMembers || user.organizationMembers.length === 0) {
    redirect('/onboarding/organization');
  }

  return <>{children}</>;
}

/**
 * Require specific subscription tier or higher
 *
 * Redirects to upgrade page if user's tier is below required.
 * Use this to gate premium features.
 *
 * @example
 * ```typescript
 * export default function PremiumToolsLayout({ children }) {
 *   return (
 *     <RequireAuth>
 *       <RequireTier tier="TIER_2">
 *         {children}
 *       </RequireTier>
 *     </RequireAuth>
 *   );
 * }
 * ```
 */
export async function RequireTier({
  tier,
  fallbackUrl = '/settings/billing',
  children,
}: {
  tier: 'FREE' | 'TIER_1' | 'TIER_2' | 'TIER_3';
  fallbackUrl?: string;
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(AUTH_ROUTES.LOGIN);
  }

  const tierOrder = {
    FREE: 0,
    TIER_1: 1,
    TIER_2: 2,
    TIER_3: 3,
  };

  const userTierLevel = tierOrder[user.subscriptionTier as keyof typeof tierOrder] || 0;
  const requiredTierLevel = tierOrder[tier];

  if (userTierLevel < requiredTierLevel) {
    redirect(fallbackUrl);
  }

  return <>{children}</>;
}

/**
 * Compose multiple guards together
 *
 * Utility for applying multiple guards in sequence.
 * Executes from left to right (outer to inner).
 *
 * @example
 * ```typescript
 * export default function ComplexLayout({ children }) {
 *   return compose(
 *     <RequireAuth>
 *       <RequireRole role="EMPLOYEE">
 *         <RequireOrgPermission permission="settings:edit">
 *           {children}
 *         </RequireOrgPermission>
 *       </RequireRole>
 *     </RequireAuth>
 *   );
 * }
 * ```
 */
export function compose(...guards: ReactNode[]) {
  return guards.reduceRight(
    (children, guard) => guard,
    null
  );
}
