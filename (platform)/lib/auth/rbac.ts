import { UserRole, ROLE_PERMISSIONS } from './constants';
import { getCurrentUser } from './auth-helpers';

/**
 * Global permission types
 * These are feature-level permissions that apply across the platform
 */
export type Permission = keyof typeof ROLE_PERMISSIONS.ADMIN;

/**
 * Enhanced permission type with wildcard support
 * Examples: 'crm:*', 'projects:*', 'admin:*'
 */
export type WildcardPermission = `${string}:*`;

/**
 * Check if user has a specific global permission
 *
 * Supports wildcard permissions (e.g., 'crm:*' grants 'crm:read', 'crm:write', etc.)
 *
 * @param permission - The permission to check
 * @returns Promise<boolean> - true if user has permission
 *
 * @example
 * ```typescript
 * const canRead = await hasPermission('canManageCustomers');
 * // Returns: true if user role allows customer management
 * ```
 */
export async function hasPermission(permission: Permission): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  const rolePermissions = ROLE_PERMISSIONS[user.role as UserRole];

  if (!rolePermissions) {
    return false;
  }

  return rolePermissions[permission] || false;
}

/**
 * Synchronous version of hasPermission for use with user object
 *
 * @param userRole - The user's role
 * @param permission - The permission to check
 * @returns boolean - true if role has permission
 */
export function hasPermissionSync(userRole: UserRole, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole];

  if (!rolePermissions) {
    return false;
  }

  return rolePermissions[permission] || false;
}

/**
 * Require permission or throw error
 *
 * @param permission - Required permission
 * @throws Error if permission not granted
 */
export async function requirePermission(permission: Permission): Promise<void> {
  const hasPerm = await hasPermission(permission);

  if (!hasPerm) {
    throw new Error(`Forbidden: Missing permission ${permission}`);
  }
}

export async function canAccessRoute(route: string): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  const role = user.role as UserRole;

  // Super admin and admin can access everything
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
    return true;
  }

  // Route-specific permissions
  const routePermissions: Record<string, UserRole[]> = {
    '/dashboard': ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'],
    '/crm': ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'],
    '/projects': ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'],
    '/transactions': ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'],
    '/real-estate/dashboard': ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'],
    '/real-estate/workspace': ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'],
    '/real-estate/ai-hub': ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'],
    '/real-estate/reid': ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'],
    '/real-estate/expense-tax': ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'],
    '/real-estate/cms-marketing': ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'],
    '/real-estate/marketplace': ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'],
    '/ai': ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'],
    '/tools': ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'],
    '/settings': ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'],
    '/admin': ['SUPER_ADMIN'],
  };

  // Check if route has specific permissions
  for (const [routePath, allowedRoles] of Object.entries(routePermissions)) {
    if (route.startsWith(routePath)) {
      return allowedRoles.includes(role);
    }
  }

  // Default: allow access to undefined routes (let the page handle specific permissions)
  return true;
}

export function getNavigationItems(role: UserRole) {
  const allItems = [
    {
      title: 'Dashboard',
      href: '/real-estate/dashboard',
      icon: 'LayoutDashboard',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'] as UserRole[],
    },
    {
      title: 'CRM',
      href: '/crm',
      icon: 'Users',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'] as UserRole[],
    },
    {
      title: 'Projects',
      href: '/projects',
      icon: 'FolderKanban',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'] as UserRole[],
    },
    {
      title: 'Workspace',
      href: '/real-estate/workspace/dashboard',
      icon: 'FileText',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'] as UserRole[],
    },
    {
      title: 'AI Hub',
      href: '/real-estate/ai-hub/dashboard',
      icon: 'Bot',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'] as UserRole[],
      badge: 'Coming Soon',
    },
    {
      title: 'Analytics',
      href: '/real-estate/reid/dashboard',
      icon: 'BarChart',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'] as UserRole[],
      badge: 'Coming Soon',
    },
    {
      title: 'Expense & Tax',
      href: '/real-estate/expense-tax/dashboard',
      icon: 'Calculator',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'] as UserRole[],
      badge: 'Coming Soon',
    },
    {
      title: 'ContentPilot-CMS',
      href: '/real-estate/cms-marketing/dashboard',
      icon: 'FileText',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'] as UserRole[],
    },
    {
      title: 'Marketplace',
      href: '/real-estate/marketplace/dashboard',
      icon: 'ShoppingBag',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'] as UserRole[],
      badge: 'Coming Soon',
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: 'Settings',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'] as UserRole[],
    },
    {
      title: 'Org Admin',
      href: '/admin',
      icon: 'Shield',
      roles: ['SUPER_ADMIN', 'ADMIN'] as UserRole[],
    },
    {
      title: 'Platform Admin',
      href: '/platform-admin',
      icon: 'Server',
      roles: ['SUPER_ADMIN'] as UserRole[],
    },
  ];

  return allItems.filter(item => item.roles.includes(role));
}

/**
 * Platform-wide functions (SUPER_ADMIN only)
 */
export function canAccessPlatformAdmin(role: UserRole): boolean {
  return role === 'SUPER_ADMIN';
}

export function canViewAllOrganizations(role: UserRole): boolean {
  return role === 'SUPER_ADMIN';
}

export function canManagePlatformSettings(role: UserRole): boolean {
  return role === 'SUPER_ADMIN';
}

export function canAssignFreeTier(role: UserRole): boolean {
  return role === 'SUPER_ADMIN';
}

export function canViewPlatformAnalytics(role: UserRole): boolean {
  return role === 'SUPER_ADMIN';
}

export function canManageOrganization(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR';
}

export function canInviteMembers(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR';
}

export function canDeleteMembers(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN';
}

export function canEditProject(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR' || role === 'USER';
}

export function canViewProject(role: UserRole): boolean {
  return true; // All roles can view projects
}

export function canManageCustomer(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR' || role === 'USER';
}

export function canViewCustomer(role: UserRole): boolean {
  return true; // All roles can view customers (CLIENT removed)
}

export function canUsePremiumTools(tier: string, role?: UserRole): boolean {
  // SUPER_ADMIN bypasses tier restrictions
  if (role === 'SUPER_ADMIN') {
    return true;
  }
  return tier !== 'FREE' && tier !== 'STARTER';
}

export function getToolLimit(tier: string, role?: UserRole): number {
  // SUPER_ADMIN has unlimited tools
  if (role === 'SUPER_ADMIN') {
    return Infinity;
  }

  const limits: Record<string, number> = {
    FREE: 0,
    CUSTOM: 0, // Pay per tool
    STARTER: 0,
    GROWTH: 3,
    ELITE: 10,
    ENTERPRISE: Infinity,
  };

  return limits[tier] || 0;
}

/**
 * Check if user can access CRM module
 */
export function canAccessCRM(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR' || role === 'USER';
}

/**
 * Check if user can manage leads (create, edit)
 */
export function canManageLeads(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR' || role === 'USER';
}

/**
 * Check if user can delete leads
 */
export function canDeleteLeads(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR';
}

/**
 * Check if user can manage contacts (create, edit)
 */
export function canManageContacts(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR' || role === 'USER';
}

/**
 * Check if user can delete contacts
 */
export function canDeleteContacts(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR';
}

/**
 * Check if user can manage deals (create, edit)
 */
export function canManageDeals(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR' || role === 'USER';
}

/**
 * Check if user can delete deals
 */
export function canDeleteDeals(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR';
}

/**
 * Check if user can manage listings (create, edit)
 */
export function canManageListings(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR' || role === 'USER';
}

/**
 * Check if user can delete listings
 */
export function canDeleteListings(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR';
}

/**
 * Check if user can access Transactions module
 */
export function canAccessTransactions(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR' || role === 'USER';
}

/**
 * Check if user can manage transaction loops (create, edit)
 */
export function canManageTransactionLoops(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR' || role === 'USER';
}

/**
 * Check if user can delete transaction loops
 */
export function canDeleteTransactionLoops(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR';
}

/**
 * Admin Panel Access Control (Organization-level admin)
 * Both ADMIN and SUPER_ADMIN can access organization admin panel
 */
export function canAccessAdminPanel(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

export function canViewPlatformMetrics(role: UserRole): boolean {
  return role === 'ADMIN';
}

export function canManageUsers(role: UserRole): boolean {
  return role === 'ADMIN';
}

export function canManageOrganizations(role: UserRole): boolean {
  return role === 'ADMIN';
}

export function canManageFeatureFlags(role: UserRole): boolean {
  return role === 'ADMIN';
}

export function canManageSystemAlerts(role: UserRole): boolean {
  return role === 'ADMIN';
}

export function canImpersonateUsers(role: UserRole): boolean {
  // Only super admins can impersonate
  return role === 'SUPER_ADMIN';
}

export function canExportData(role: UserRole): boolean {
  return role === 'ADMIN';
}

export function canViewAuditLogs(role: UserRole): boolean {
  return role === 'ADMIN';
}

/**
 * Require admin access or throw
 */
export function requireAdminRole(role: UserRole): void {
  if (!canAccessAdminPanel(role)) {
    throw new Error('Unauthorized: Admin access required');
  }
}

/**
 * REID (Real Estate Intelligence Dashboard) Access Control
 */
export function canAccessREID(user: { globalRole?: UserRole; role?: UserRole; organizationRole?: string }): boolean {
  // Support both globalRole and role fields
  const userRole = user.globalRole || user.role;

  // Must be Employee with Member+ org role
  const isEmployee = ['ADMIN', 'MODERATOR', 'USER'].includes(userRole || '');
  const hasOrgAccess = ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole || '');

  return isEmployee && hasOrgAccess;
}

export function canCreateReports(user: { organizationRole?: string }): boolean {
  return ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole || '');
}

export function canManageAlerts(user: { organizationRole?: string }): boolean {
  return ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole || '');
}

export function canAccessAIFeatures(user: { organizationRole?: string }): boolean {
  // AI features only for Elite tier
  return ['OWNER', 'ADMIN'].includes(user.organizationRole || '');
}

/**
 * Get feature access by subscription tier
 */
export function canAccessFeature(user: { subscriptionTier?: string }, feature: string): boolean {
  const tier = user.subscriptionTier || 'FREE';

  const TIER_FEATURES: Record<string, string[]> = {
    FREE: ['dashboard', 'profile'],
    STARTER: ['dashboard', 'profile', 'crm', 'projects'],
    GROWTH: ['dashboard', 'profile', 'crm', 'projects', 'reid-basic'], // Basic market data
    ELITE: ['dashboard', 'profile', 'crm', 'projects', 'reid', 'reid-full', 'reid-ai'], // Full analytics + AI
    ENTERPRISE: ['*'], // All features
  };

  const allowedFeatures = TIER_FEATURES[tier] || TIER_FEATURES.FREE;
  return allowedFeatures.includes('*') || allowedFeatures.includes(feature);
}

/**
 * Get REID feature limits by subscription tier
 */
export function getREIDLimits(tier: string) {
  const limits: Record<string, { insights: number; alerts: number; reports: number; aiProfiles: number }> = {
    FREE: { insights: 0, alerts: 0, reports: 0, aiProfiles: 0 },
    STARTER: { insights: 0, alerts: 0, reports: 0, aiProfiles: 0 },
    GROWTH: { insights: 50, alerts: 10, reports: 5, aiProfiles: 0 }, // Per month
    ELITE: { insights: -1, alerts: -1, reports: -1, aiProfiles: -1 }, // Unlimited
    ENTERPRISE: { insights: -1, alerts: -1, reports: -1, aiProfiles: -1 }, // Unlimited
  };

  return limits[tier] || limits.FREE;
}

/**
 * AI Garage Access Control
 */
export const AI_GARAGE_PERMISSIONS = {
  AI_GARAGE_ACCESS: 'ai-garage:access',
  ORDERS_VIEW: 'ai-garage:orders:view',
  ORDERS_CREATE: 'ai-garage:orders:create',
  ORDERS_EDIT: 'ai-garage:orders:edit',
  ORDERS_DELETE: 'ai-garage:orders:delete',
  ORDERS_MANAGE: 'ai-garage:orders:manage',
} as const;

/**
 * Check if user can access AI Garage module
 */
export function canAccessAIGarage(user: any): boolean {
  const isEmployee = ['ADMIN', 'MODERATOR', 'USER'].includes(user.globalRole || user.role);
  const hasOrgAccess = ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);

  return isEmployee && hasOrgAccess;
}

/**
 * Check if user can manage AI Garage (create, edit, delete)
 */
export function canManageAIGarage(user: any): boolean {
  const isEmployee = ['ADMIN', 'MODERATOR', 'USER'].includes(user.globalRole || user.role);
  const canManage = ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);

  return isEmployee && canManage;
}

/**
 * Check if user can assign builders
 */
export function canAssignBuilders(user: any): boolean {
  return user.globalRole === 'ADMIN' || user.organizationRole === 'OWNER';
}

/**
 * Get AI Garage feature limits by subscription tier
 */
export function getAIGarageLimits(tier: string) {
  const limits: Record<string, { orders: number; templates: number; blueprints: number }> = {
    FREE: { orders: 0, templates: 0, blueprints: 0 },
    STARTER: { orders: 0, templates: 0, blueprints: 0 },
    GROWTH: { orders: 3, templates: 10, blueprints: 5 }, // Per month
    ELITE: { orders: -1, templates: -1, blueprints: -1 }, // Unlimited
    ENTERPRISE: { orders: -1, templates: -1, blueprints: -1 }, // Unlimited
  };

  return limits[tier] || limits.FREE;
}

/**
 * Expense & Tax Module Access Control
 */
export function canAccessExpenses(role: UserRole): boolean {
  // All authenticated users can access expenses
  return ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'].includes(role);
}

export function canCreateExpenses(role: UserRole): boolean {
  // All authenticated users can create expenses
  return ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'].includes(role);
}

export function canReviewExpenses(role: UserRole): boolean {
  // Only admins can review/approve expenses
  return ['SUPER_ADMIN', 'ADMIN'].includes(role);
}

export function canDeleteExpenses(role: UserRole): boolean {
  // Admins and moderators can delete expenses
  return ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(role);
}

export function canManageExpenseCategories(role: UserRole): boolean {
  // Only admins can manage expense categories
  return ['SUPER_ADMIN', 'ADMIN'].includes(role);
}

export function canGenerateExpenseReports(role: UserRole): boolean {
  // All authenticated users can generate reports
  return ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'].includes(role);
}

/**
 * Get expense feature limits by subscription tier
 */
export function getExpenseLimits(tier: string) {
  const limits: Record<string, { expenses: number; receipts: number; reports: number }> = {
    FREE: { expenses: 0, receipts: 0, reports: 0 },
    STARTER: { expenses: 0, receipts: 0, reports: 0 },
    GROWTH: { expenses: 500, receipts: 500, reports: 5 }, // Per month
    ELITE: { expenses: -1, receipts: -1, reports: -1 }, // Unlimited
    ENTERPRISE: { expenses: -1, receipts: -1, reports: -1 }, // Unlimited
  };

  return limits[tier] || limits.FREE;
}
/**
 * Dashboard Module Permissions
 */
export function canAccessDashboard(user: { role?: UserRole }): boolean {
  // All authenticated users can access basic dashboard
  return true;
}

export function canCustomizeDashboard(user: { organizationRole?: string }): boolean {
  return ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole || '');
}

export function canViewOrganizationMetrics(user: { organizationRole?: string }): boolean {
  return ['OWNER', 'ADMIN'].includes(user.organizationRole || '');
}

export function canManageWidgets(user: { organizationRole?: string }): boolean {
  return ['OWNER', 'ADMIN'].includes(user.organizationRole || '');
}

/**
 * Content Management (CMS) Permissions
 */
export function canAccessContent(user: { globalRole?: UserRole; role?: UserRole; organizationRole?: string }): boolean {
  // Support both globalRole and role fields
  const userRole = user.globalRole || user.role;

  // Must be Employee with Member+ org role
  const isEmployee = ['ADMIN', 'MODERATOR', 'USER'].includes(userRole || '');
  const hasOrgAccess = ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole || '');

  return isEmployee && hasOrgAccess;
}

export function canCreateContent(user: { organizationRole?: string }): boolean {
  return ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole || '');
}

export function canPublishContent(user: { organizationRole?: string }): boolean {
  // Only owners and admins can publish
  return ['OWNER', 'ADMIN'].includes(user.organizationRole || '');
}

export function canDeleteContent(user: { organizationRole?: string }): boolean {
  return ['OWNER', 'ADMIN'].includes(user.organizationRole || '');
}

/**
 * Get content feature limits by subscription tier
 */
export function getContentLimits(tier: string) {
  const limits: Record<string, { content: number; media: number; campaigns: number }> = {
    FREE: { content: 0, media: 0, campaigns: 0 },
    STARTER: { content: 0, media: 0, campaigns: 0 }, // No content features
    GROWTH: { content: 100, media: 500, campaigns: 5 }, // Per month
    ELITE: { content: -1, media: -1, campaigns: -1 }, // Unlimited
    ENTERPRISE: { content: -1, media: -1, campaigns: -1 }, // Unlimited
  };

  return limits[tier] || limits.FREE;
}

/**
 * ContentPilot-CMS Module Access Control
 */
export function canAccessContentPilot(user: {
  globalRole?: UserRole;
  role?: UserRole;
  organizationRole?: string;
  subscriptionTier?: string
}): boolean {
  // Support both globalRole and role fields
  const userRole = user.globalRole || user.role;

  // Check subscription tier (GROWTH+ required)
  const tier = user.subscriptionTier || 'FREE';
  const hasRequiredTier = ['GROWTH', 'ELITE', 'ENTERPRISE'].includes(tier);

  // SUPER_ADMIN bypasses tier restrictions
  if (userRole === 'SUPER_ADMIN') {
    return true;
  }

  if (!hasRequiredTier) {
    return false;
  }

  // Must be Employee with Member+ org role
  const isEmployee = ['ADMIN', 'MODERATOR', 'USER'].includes(userRole || '');
  const hasOrgAccess = ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole || '');

  return isEmployee && hasOrgAccess;
}

/**
 * Campaign Management Permissions
 */
export function canManageCampaigns(user: { globalRole?: UserRole; role?: UserRole; organizationRole?: string; subscriptionTier?: string }): boolean {
  // Support both globalRole and role fields
  const userRole = user.globalRole || user.role;

  // Check subscription tier (GROWTH+ required)
  const tier = user.subscriptionTier || 'FREE';
  const hasRequiredTier = ['GROWTH', 'ELITE', 'ENTERPRISE'].includes(tier);

  if (!hasRequiredTier) {
    return false;
  }

  // Must be Employee with Member+ org role
  const isEmployee = ['ADMIN', 'MODERATOR', 'USER'].includes(userRole || '');
  const hasOrgAccess = ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole || '');

  return isEmployee && hasOrgAccess;
}

export function canScheduleCampaigns(user: { organizationRole?: string }): boolean {
  // All campaign managers can schedule
  return ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole || '');
}

export function canSendEmails(user: { organizationRole?: string }): boolean {
  // Only owners and admins can send emails
  return ['OWNER', 'ADMIN'].includes(user.organizationRole || '');
}

export function canPublishSocial(user: { organizationRole?: string }): boolean {
  // Only owners and admins can publish to social
  return ['OWNER', 'ADMIN'].includes(user.organizationRole || '');
}

/**
 * Tool Marketplace Access Control
 */
export const MARKETPLACE_PERMISSIONS = {
  MARKETPLACE_ACCESS: 'marketplace:access',
  TOOLS_VIEW: 'marketplace:tools:view',
  TOOLS_PURCHASE: 'marketplace:tools:purchase',
  TOOLS_REVIEW: 'marketplace:tools:review',
  BUNDLES_VIEW: 'marketplace:bundles:view',
  BUNDLES_PURCHASE: 'marketplace:bundles:purchase',
} as const;

/**
 * Check if user can access marketplace module
 */
export function canAccessMarketplace(role: UserRole): boolean {
  // All authenticated users can access marketplace
  return ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'].includes(role);
}

/**
 * Check if user can purchase tools/bundles
 */
export function canPurchaseTools(role: UserRole): boolean {
  // Only org owners and admins can purchase
  return ['SUPER_ADMIN', 'ADMIN'].includes(role);
}

/**
 * Check if user can review tools
 */
export function canReviewTools(role: UserRole): boolean {
  // All authenticated users can review purchased tools
  return ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'].includes(role);
}

/**
 * Get marketplace limits based on subscription tier
 */
export function getMarketplaceLimits(tier: string) {
  const limits: Record<string, { tools: number; bundles: number }> = {
    FREE: { tools: 0, bundles: 0 },
    CUSTOM: { tools: -1, bundles: -1 }, // Pay-per-use, unlimited purchases
    STARTER: { tools: 0, bundles: 0 },
    GROWTH: { tools: 10, bundles: 1 }, // Per organization
    ELITE: { tools: -1, bundles: -1 }, // Unlimited
    ENTERPRISE: { tools: -1, bundles: -1 }, // Unlimited
  };

  return limits[tier] || limits.FREE;
}
