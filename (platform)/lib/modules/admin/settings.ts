'use server';

import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { canManageSystemSettings } from '@/lib/auth/rbac';

/**
 * Platform Settings Interface
 * TODO: Persist to database via platform_settings table (to be created)
 */
export interface PlatformSettings {
  general: {
    platform_name: string;
    support_email: string;
    primary_domain: string;
    maintenance_mode: boolean;
    allow_signups: boolean;
  };
  email: {
    from_name: string;
    from_email: string;
    smtp_host: string;
    smtp_port: number;
    smtp_secure: boolean;
  };
  security: {
    require_2fa: boolean;
    session_timeout: number;
    max_login_attempts: number;
    password_min_length: number;
    enforce_strong_passwords: boolean;
  };
  limits: {
    max_users_per_org: number;
    max_projects_per_org: number;
    max_file_size_mb: number;
    api_rate_limit_per_minute: number;
  };
  features: {
    enable_ai_assistant: boolean;
    enable_marketplace: boolean;
    enable_analytics: boolean;
    enable_webhooks: boolean;
    enable_api_access: boolean;
  };
  billing: {
    stripe_publishable_key: string;
    trial_period_days: number;
    grace_period_days: number;
    allow_downgrades: boolean;
  };
}

/**
 * Default platform settings
 * TODO: Load from database when platform_settings table exists
 */
const DEFAULT_SETTINGS: PlatformSettings = {
  general: {
    platform_name: 'Strive Platform',
    support_email: 'support@strivetech.ai',
    primary_domain: 'app.strivetech.ai',
    maintenance_mode: false,
    allow_signups: true,
  },
  email: {
    from_name: 'Strive Platform',
    from_email: 'noreply@strivetech.ai',
    smtp_host: '',
    smtp_port: 587,
    smtp_secure: true,
  },
  security: {
    require_2fa: false,
    session_timeout: 24, // hours
    max_login_attempts: 5,
    password_min_length: 8,
    enforce_strong_passwords: true,
  },
  limits: {
    max_users_per_org: 100,
    max_projects_per_org: 50,
    max_file_size_mb: 100,
    api_rate_limit_per_minute: 60,
  },
  features: {
    enable_ai_assistant: true,
    enable_marketplace: true,
    enable_analytics: true,
    enable_webhooks: true,
    enable_api_access: true,
  },
  billing: {
    stripe_publishable_key: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    trial_period_days: 14,
    grace_period_days: 3,
    allow_downgrades: true,
  },
};

/**
 * Get platform settings
 */
export async function getPlatformSettings(): Promise<PlatformSettings> {
  const user = await getCurrentUser();

  if (!user || !canManageSystemSettings(user.role)) {
    throw new Error('Unauthorized');
  }

  // TODO: Load from database when platform_settings table exists
  // For now, return defaults (can be extended to use env vars)
  return DEFAULT_SETTINGS;
}

/**
 * Get settings categories for UI
 */
export function getSettingsCategories() {
  return [
    {
      key: 'general',
      label: 'General Settings',
      description: 'Basic platform configuration',
    },
    {
      key: 'email',
      label: 'Email Configuration',
      description: 'SMTP and email settings',
    },
    {
      key: 'security',
      label: 'Security Settings',
      description: 'Authentication and security policies',
    },
    {
      key: 'limits',
      label: 'Rate Limits & Quotas',
      description: 'Usage limits and rate limiting',
    },
    {
      key: 'features',
      label: 'Feature Flags',
      description: 'Enable or disable platform features',
    },
    {
      key: 'billing',
      label: 'Billing Configuration',
      description: 'Payment and subscription settings',
    },
  ];
}

/**
 * Update platform settings
 * TODO: Persist to database when platform_settings table exists
 */
export async function updatePlatformSettings(
  settings: Partial<PlatformSettings>
): Promise<PlatformSettings> {
  const user = await getCurrentUser();

  if (!user || !canManageSystemSettings(user.role)) {
    throw new Error('Unauthorized');
  }

  // TODO: Implement database persistence
  // For now, this would require environment variable updates
  // or a new platform_settings table

  // Merge with defaults
  const updated = {
    ...DEFAULT_SETTINGS,
    ...settings,
  };

  return updated;
}
