/**
 * Mock System Alerts for Admin Dashboard
 *
 * System alerts for monitoring and notifications
 */

export interface MockAlert {
  id: string;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  category: 'SYSTEM' | 'SECURITY' | 'BILLING' | 'PERFORMANCE' | 'USER';
  created_at: string;
  resolved: boolean;
  resolved_at?: string;
}

export const MOCK_ALERTS: MockAlert[] = [
  {
    id: '1',
    title: 'Database Connection Spike',
    message: 'Database connection pool reached 85% capacity at 14:23 UTC',
    severity: 'WARNING',
    category: 'PERFORMANCE',
    created_at: '2025-01-08T14:23:00Z',
    resolved: true,
    resolved_at: '2025-01-08T14:45:00Z',
  },
  {
    id: '2',
    title: 'Failed Login Attempts',
    message: '15 failed login attempts from IP 192.168.1.100 in last 5 minutes',
    severity: 'WARNING',
    category: 'SECURITY',
    created_at: '2025-01-08T10:15:00Z',
    resolved: true,
    resolved_at: '2025-01-08T10:30:00Z',
  },
  {
    id: '3',
    title: 'API Rate Limit Exceeded',
    message: 'Organization "Prestige Properties" exceeded API rate limit (1000 req/min)',
    severity: 'INFO',
    category: 'SYSTEM',
    created_at: '2025-01-08T09:45:00Z',
    resolved: false,
  },
  {
    id: '4',
    title: 'Payment Processing Delay',
    message: 'Stripe webhook processing delayed by 5 minutes',
    severity: 'WARNING',
    category: 'BILLING',
    created_at: '2025-01-08T08:30:00Z',
    resolved: true,
    resolved_at: '2025-01-08T08:40:00Z',
  },
  {
    id: '5',
    title: 'Storage Capacity Warning',
    message: 'Supabase storage bucket reached 75% capacity (3.2 GB / 4.2 GB)',
    severity: 'INFO',
    category: 'SYSTEM',
    created_at: '2025-01-08T07:00:00Z',
    resolved: false,
  },
  {
    id: '6',
    title: 'Subscription Expiring Soon',
    message: '12 organizations have subscriptions expiring in next 7 days',
    severity: 'INFO',
    category: 'BILLING',
    created_at: '2025-01-08T06:00:00Z',
    resolved: false,
  },
  {
    id: '7',
    title: 'High Error Rate Detected',
    message: 'Error rate increased to 2.5% (normally 0.5%) for /api/v1/transactions',
    severity: 'ERROR',
    category: 'PERFORMANCE',
    created_at: '2025-01-07T20:15:00Z',
    resolved: true,
    resolved_at: '2025-01-07T21:00:00Z',
  },
  {
    id: '8',
    title: 'Suspicious Activity',
    message: 'User account "john@example.com" accessed from 3 different countries in 1 hour',
    severity: 'CRITICAL',
    category: 'SECURITY',
    created_at: '2025-01-07T18:30:00Z',
    resolved: true,
    resolved_at: '2025-01-07T19:00:00Z',
  },
  {
    id: '9',
    title: 'Bulk User Creation',
    message: 'Organization "Global Realty" created 25 users in last 10 minutes',
    severity: 'INFO',
    category: 'USER',
    created_at: '2025-01-07T16:45:00Z',
    resolved: false,
  },
  {
    id: '10',
    title: 'Email Delivery Failure',
    message: 'Failed to send 5 notification emails due to SMTP timeout',
    severity: 'WARNING',
    category: 'SYSTEM',
    created_at: '2025-01-07T15:20:00Z',
    resolved: true,
    resolved_at: '2025-01-07T15:30:00Z',
  },
  {
    id: '11',
    title: 'Database Backup Completed',
    message: 'Daily database backup completed successfully (4.2 GB)',
    severity: 'INFO',
    category: 'SYSTEM',
    created_at: '2025-01-07T03:00:00Z',
    resolved: true,
    resolved_at: '2025-01-07T03:15:00Z',
  },
  {
    id: '12',
    title: 'Payment Failed',
    message: 'Subscription renewal failed for "Valley Realty Group" - card declined',
    severity: 'ERROR',
    category: 'BILLING',
    created_at: '2025-01-06T12:00:00Z',
    resolved: false,
  },
];

/**
 * Get alert statistics
 */
export function getAlertStats() {
  const total = MOCK_ALERTS.length;
  const resolved = MOCK_ALERTS.filter((alert) => alert.resolved).length;
  const active = total - resolved;

  const bySeverity = {
    INFO: MOCK_ALERTS.filter((alert) => alert.severity === 'INFO').length,
    WARNING: MOCK_ALERTS.filter((alert) => alert.severity === 'WARNING').length,
    ERROR: MOCK_ALERTS.filter((alert) => alert.severity === 'ERROR').length,
    CRITICAL: MOCK_ALERTS.filter((alert) => alert.severity === 'CRITICAL').length,
  };

  const byCategory = {
    SYSTEM: MOCK_ALERTS.filter((alert) => alert.category === 'SYSTEM').length,
    SECURITY: MOCK_ALERTS.filter((alert) => alert.category === 'SECURITY').length,
    BILLING: MOCK_ALERTS.filter((alert) => alert.category === 'BILLING').length,
    PERFORMANCE: MOCK_ALERTS.filter((alert) => alert.category === 'PERFORMANCE').length,
    USER: MOCK_ALERTS.filter((alert) => alert.category === 'USER').length,
  };

  return {
    total,
    resolved,
    active,
    bySeverity,
    byCategory,
  };
}

/**
 * Get recent alerts (last 24 hours)
 */
export function getRecentAlerts(limit: number = 5): MockAlert[] {
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

  return MOCK_ALERTS
    .filter((alert) => new Date(alert.created_at) >= twentyFourHoursAgo)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}
