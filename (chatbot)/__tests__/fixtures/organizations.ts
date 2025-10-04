/**
 * Organization Test Fixtures
 * Predefined organization data for consistent testing
 */

import { SubscriptionStatus } from '@prisma/client';

export const testOrganizations = {
  activeTrial: {
    name: 'Acme Corporation',
    slug: 'acme-corp',
    description: 'Test organization on trial',
    subscriptionStatus: SubscriptionStatus.TRIAL,
    billingEmail: 'billing@acme.test',
  },

  activeSubscription: {
    name: 'Tech Innovations Inc',
    slug: 'tech-innovations',
    description: 'Test organization with active subscription',
    subscriptionStatus: SubscriptionStatus.ACTIVE,
    billingEmail: 'billing@techinnovations.test',
  },

  canceledSubscription: {
    name: 'Sunset LLC',
    slug: 'sunset-llc',
    description: 'Test organization with canceled subscription',
    subscriptionStatus: SubscriptionStatus.CANCELLED,
    billingEmail: 'billing@sunset.test',
  },

  pastDueSubscription: {
    name: 'Late Payers Co',
    slug: 'late-payers',
    description: 'Test organization with past due subscription',
    subscriptionStatus: SubscriptionStatus.PAST_DUE,
    billingEmail: 'billing@latepayers.test',
  },

  smallStartup: {
    name: 'Small Startup',
    slug: 'small-startup',
    description: 'A small startup organization',
    subscriptionStatus: SubscriptionStatus.TRIAL,
    billingEmail: 'billing@smallstartup.test',
  },

  enterpriseOrg: {
    name: 'Enterprise Corp',
    slug: 'enterprise-corp',
    description: 'Large enterprise organization',
    subscriptionStatus: SubscriptionStatus.ACTIVE,
    billingEmail: 'billing@enterprise.test',
  },
};

export const organizationSettings = {
  default: {
    theme: 'light',
    timezone: 'America/New_York',
    language: 'en',
    notifications: {
      email: true,
      inApp: true,
      push: false,
    },
  },

  custom: {
    theme: 'dark',
    timezone: 'America/Los_Angeles',
    language: 'en',
    notifications: {
      email: false,
      inApp: true,
      push: true,
    },
    features: {
      aiAssistant: true,
      advancedAnalytics: true,
      customBranding: true,
    },
  },
};
