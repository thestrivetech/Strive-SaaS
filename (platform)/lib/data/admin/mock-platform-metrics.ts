/**
 * Mock Platform Metrics for Platform Admin Dashboard
 *
 * Comprehensive platform-wide metrics and analytics
 */

export interface PlatformMetrics {
  overview: {
    totalOrganizations: number;
    totalUsers: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
    systemHealth: number;
    databaseSize: string;
    securityAlerts: number;
    superAdminCount: number;
  };
  revenue: {
    trend: Array<{ month: string; revenue: number }>;
    byTier: Record<string, number>;
  };
  growth: {
    userGrowth: Array<{ month: string; users: number }>;
    orgGrowth: Array<{ month: string; organizations: number }>;
  };
  topOrganizations: Array<{
    name: string;
    revenue: number;
    users: number;
    tier: string;
  }>;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
  database: {
    size: string;
    tables: number;
    totalRecords: number;
    dailyGrowth: string;
    backupStatus: string;
    lastBackup: string;
  };
  security: {
    incidents: Array<{
      id: string;
      severity: string;
      description: string;
      timestamp: string;
      resolved: boolean;
    }>;
  };
}

export const MOCK_PLATFORM_METRICS: PlatformMetrics = {
  overview: {
    totalOrganizations: 30,
    totalUsers: 432,
    activeSubscriptions: 24,
    monthlyRevenue: 52850,
    systemHealth: 99.8,
    databaseSize: '4.2 GB',
    securityAlerts: 3,
    superAdminCount: 2,
  },
  revenue: {
    trend: [
      { month: 'Jul 2024', revenue: 38400 },
      { month: 'Aug 2024', revenue: 41200 },
      { month: 'Sep 2024', revenue: 43800 },
      { month: 'Oct 2024', revenue: 46500 },
      { month: 'Nov 2024', revenue: 49200 },
      { month: 'Dec 2024', revenue: 52850 },
    ],
    byTier: {
      FREE: 0,
      CUSTOM: 150,
      STARTER: 4000,
      GROWTH: 15400,
      ELITE: 22000,
      ENTERPRISE: 11300,
    },
  },
  growth: {
    userGrowth: [
      { month: 'Jul 2024', users: 285 },
      { month: 'Aug 2024', users: 312 },
      { month: 'Sep 2024', users: 347 },
      { month: 'Oct 2024', users: 378 },
      { month: 'Nov 2024', users: 405 },
      { month: 'Dec 2024', users: 432 },
    ],
    orgGrowth: [
      { month: 'Jul 2024', organizations: 18 },
      { month: 'Aug 2024', organizations: 21 },
      { month: 'Sep 2024', organizations: 23 },
      { month: 'Oct 2024', organizations: 26 },
      { month: 'Nov 2024', organizations: 28 },
      { month: 'Dec 2024', organizations: 30 },
    ],
  },
  topOrganizations: [
    { name: 'Global Realty Network', revenue: 7500, users: 50, tier: 'ENTERPRISE' },
    { name: 'Prestige Properties International', revenue: 6750, users: 45, tier: 'ENTERPRISE' },
    { name: 'Nexus Property Management', revenue: 5250, users: 35, tier: 'ENTERPRISE' },
    { name: 'Urban Living Realtors', revenue: 4800, users: 32, tier: 'ENTERPRISE' },
    { name: 'Diamond Realty Group', revenue: 4500, users: 30, tier: 'ENTERPRISE' },
    { name: 'Premier Estate Advisors', revenue: 2800, users: 28, tier: 'ELITE' },
    { name: 'Golden Gate Realty', revenue: 2500, users: 25, tier: 'ELITE' },
    { name: 'Acme Real Estate Group', revenue: 2400, users: 24, tier: 'ELITE' },
    { name: 'Lakeside Realty', revenue: 2200, users: 22, tier: 'ELITE' },
    { name: 'Pinnacle Property Partners', revenue: 2000, users: 20, tier: 'ELITE' },
  ],
  recentActivities: [
    {
      id: '1',
      type: 'NEW_ORG',
      description: 'Nexus Property Management signed up (ENTERPRISE tier)',
      timestamp: '2025-01-10T14:30:00Z',
    },
    {
      id: '2',
      type: 'UPGRADE',
      description: 'Venture Property Solutions upgraded from GROWTH to ELITE',
      timestamp: '2025-01-09T11:15:00Z',
    },
    {
      id: '3',
      type: 'NEW_ORG',
      description: 'Eclipse Realty Services signed up (STARTER tier)',
      timestamp: '2025-01-09T09:45:00Z',
    },
    {
      id: '4',
      type: 'PAYMENT',
      description: 'Global Realty Network renewed subscription ($7,500)',
      timestamp: '2025-01-08T16:20:00Z',
    },
    {
      id: '5',
      type: 'NEW_ORG',
      description: 'Pacific Coast Realty signed up (CUSTOM tier)',
      timestamp: '2025-01-07T13:00:00Z',
    },
    {
      id: '6',
      type: 'CANCELLATION',
      description: 'Metro Housing Solutions cancelled subscription',
      timestamp: '2025-01-06T10:30:00Z',
    },
    {
      id: '7',
      type: 'NEW_ORG',
      description: 'Atlantic Properties signed up (GROWTH tier)',
      timestamp: '2025-01-05T15:45:00Z',
    },
    {
      id: '8',
      type: 'PAYMENT_FAILED',
      description: 'Valley Realty Group payment failed (card declined)',
      timestamp: '2025-01-04T08:00:00Z',
    },
  ],
  database: {
    size: '4.2 GB',
    tables: 83,
    totalRecords: 127543,
    dailyGrowth: '12 MB/day',
    backupStatus: 'Healthy',
    lastBackup: '2025-01-08T03:00:00Z',
  },
  security: {
    incidents: [
      {
        id: '1',
        severity: 'CRITICAL',
        description: 'Suspicious login activity from multiple countries',
        timestamp: '2025-01-07T18:30:00Z',
        resolved: true,
      },
      {
        id: '2',
        severity: 'WARNING',
        description: '15 failed login attempts from single IP',
        timestamp: '2025-01-08T10:15:00Z',
        resolved: true,
      },
      {
        id: '3',
        severity: 'INFO',
        description: 'Unusual API usage pattern detected',
        timestamp: '2025-01-08T09:45:00Z',
        resolved: false,
      },
    ],
  },
};

/**
 * Calculate growth percentage
 */
export function calculateGrowth(current: number, previous: number): string {
  const growth = ((current - previous) / previous) * 100;
  return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
}

/**
 * Get revenue statistics
 */
export function getRevenueStats() {
  const current = MOCK_PLATFORM_METRICS.revenue.trend[5].revenue;
  const previous = MOCK_PLATFORM_METRICS.revenue.trend[4].revenue;
  const growth = calculateGrowth(current, previous);

  return {
    current,
    previous,
    growth,
    byTier: MOCK_PLATFORM_METRICS.revenue.byTier,
  };
}

/**
 * Get user growth statistics
 */
export function getUserGrowthStats() {
  const current = MOCK_PLATFORM_METRICS.growth.userGrowth[5].users;
  const previous = MOCK_PLATFORM_METRICS.growth.userGrowth[4].users;
  const growth = calculateGrowth(current, previous);

  return {
    current,
    previous,
    growth,
    trend: MOCK_PLATFORM_METRICS.growth.userGrowth,
  };
}
