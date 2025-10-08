/**
 * Mock Platform Settings for Admin Dashboard
 *
 * Platform configuration settings organized by category
 * - General, Email, Security, Limits
 * - Read-only in mock mode (local state updates only)
 */

export interface PlatformSettings {
  general: {
    platform_name: string;
    support_email: string;
    primary_domain: string;
    maintenance_mode: boolean;
    allow_signups: boolean;
    default_tier: string;
  };
  email: {
    smtp_host: string;
    smtp_port: number;
    smtp_secure: boolean;
    from_email: string;
    from_name: string;
    reply_to: string;
  };
  security: {
    max_login_attempts: number;
    lockout_duration: number; // minutes
    session_timeout: number; // seconds
    require_2fa_for_admins: boolean;
    require_2fa_for_all: boolean;
    password_min_length: number;
    password_require_uppercase: boolean;
    password_require_lowercase: boolean;
    password_require_numbers: boolean;
    password_require_symbols: boolean;
    allowed_ip_ranges: string[];
  };
  limits: {
    max_orgs_per_user: number;
    max_users_per_org_free: number;
    max_users_per_org_custom: number;
    max_users_per_org_starter: number;
    max_users_per_org_growth: number;
    max_users_per_org_elite: number;
    max_users_per_org_enterprise: number;
    max_file_upload_size: number; // MB
    max_api_requests_per_minute: number;
    max_storage_per_org_gb: Record<string, number>;
  };
  features: {
    enable_ai_assistant: boolean;
    enable_marketplace: boolean;
    enable_analytics: boolean;
    enable_webhooks: boolean;
    enable_api_access: boolean;
    enable_white_label: boolean;
  };
  billing: {
    stripe_enabled: boolean;
    trial_period_days: number;
    grace_period_days: number;
    dunning_enabled: boolean;
    invoice_prefix: string;
    tax_rates_enabled: boolean;
  };
}

export const MOCK_PLATFORM_SETTINGS: PlatformSettings = {
  general: {
    platform_name: 'Strive Tech SaaS Platform',
    support_email: 'support@strivetech.ai',
    primary_domain: 'app.strivetech.ai',
    maintenance_mode: false,
    allow_signups: true,
    default_tier: 'FREE',
  },
  email: {
    smtp_host: 'smtp.sendgrid.net',
    smtp_port: 587,
    smtp_secure: true,
    from_email: 'noreply@strivetech.ai',
    from_name: 'Strive Tech',
    reply_to: 'support@strivetech.ai',
  },
  security: {
    max_login_attempts: 5,
    lockout_duration: 30, // 30 minutes
    session_timeout: 3600, // 1 hour
    require_2fa_for_admins: true,
    require_2fa_for_all: false,
    password_min_length: 8,
    password_require_uppercase: true,
    password_require_lowercase: true,
    password_require_numbers: true,
    password_require_symbols: false,
    allowed_ip_ranges: [
      '0.0.0.0/0', // All IPs allowed (default)
    ],
  },
  limits: {
    max_orgs_per_user: 3,
    max_users_per_org_free: 1,
    max_users_per_org_custom: 1,
    max_users_per_org_starter: 5,
    max_users_per_org_growth: 25,
    max_users_per_org_elite: 100,
    max_users_per_org_enterprise: -1, // unlimited
    max_file_upload_size: 100, // 100 MB
    max_api_requests_per_minute: 1000,
    max_storage_per_org_gb: {
      FREE: 1,
      CUSTOM: 2,
      STARTER: 10,
      GROWTH: 50,
      ELITE: 250,
      ENTERPRISE: -1, // unlimited
    },
  },
  features: {
    enable_ai_assistant: true,
    enable_marketplace: true,
    enable_analytics: true,
    enable_webhooks: true,
    enable_api_access: true,
    enable_white_label: false,
  },
  billing: {
    stripe_enabled: true,
    trial_period_days: 14,
    grace_period_days: 7,
    dunning_enabled: true,
    invoice_prefix: 'STRIVE',
    tax_rates_enabled: false,
  },
};

/**
 * Validate settings before saving (mock validation)
 */
export function validateSettings(settings: Partial<PlatformSettings>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // General validation
  if (settings.general) {
    if (!settings.general.platform_name || settings.general.platform_name.length < 3) {
      errors.push('Platform name must be at least 3 characters');
    }
    if (!settings.general.support_email || !settings.general.support_email.includes('@')) {
      errors.push('Invalid support email address');
    }
  }

  // Email validation
  if (settings.email) {
    if (settings.email.smtp_port && (settings.email.smtp_port < 1 || settings.email.smtp_port > 65535)) {
      errors.push('SMTP port must be between 1 and 65535');
    }
    if (!settings.email.from_email || !settings.email.from_email.includes('@')) {
      errors.push('Invalid from email address');
    }
  }

  // Security validation
  if (settings.security) {
    if (settings.security.password_min_length && settings.security.password_min_length < 6) {
      errors.push('Password minimum length must be at least 6 characters');
    }
    if (settings.security.max_login_attempts && settings.security.max_login_attempts < 1) {
      errors.push('Max login attempts must be at least 1');
    }
  }

  // Limits validation
  if (settings.limits) {
    if (settings.limits.max_orgs_per_user && settings.limits.max_orgs_per_user < 1) {
      errors.push('Max organizations per user must be at least 1');
    }
    if (settings.limits.max_file_upload_size && settings.limits.max_file_upload_size < 1) {
      errors.push('Max file upload size must be at least 1 MB');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get settings by category
 */
export function getSettingsByCategory(category: keyof PlatformSettings): any {
  return MOCK_PLATFORM_SETTINGS[category];
}

/**
 * Get all settings categories
 */
export function getSettingsCategories(): Array<{
  key: keyof PlatformSettings;
  label: string;
  description: string;
}> {
  return [
    {
      key: 'general',
      label: 'General',
      description: 'Platform name, domain, and basic configuration',
    },
    {
      key: 'email',
      label: 'Email',
      description: 'SMTP settings and email configuration',
    },
    {
      key: 'security',
      label: 'Security',
      description: 'Authentication, passwords, and security policies',
    },
    {
      key: 'limits',
      label: 'Limits',
      description: 'User limits, storage quotas, and rate limiting',
    },
    {
      key: 'features',
      label: 'Features',
      description: 'Enable or disable platform features',
    },
    {
      key: 'billing',
      label: 'Billing',
      description: 'Payment processing and subscription settings',
    },
  ];
}
