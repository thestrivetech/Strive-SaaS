import { prisma } from '@/lib/database/prisma';

/**
 * Get active user sessions from database
 */
export async function getActiveSessions(userId: string) {
  const sessions = await prisma.user_sessions.findMany({
    where: {
      user_id: userId,
      end_time: null, // Only active sessions
    },
    orderBy: {
      start_time: 'desc',
    },
    take: 10, // Limit to last 10 sessions
  });

  // Get current session ID from headers/cookies (simplified - would need actual session tracking)
  const currentSessionId = sessions[0]?.session_id;

  return sessions.map((session) => ({
    id: session.id,
    device: session.device || 'Unknown Device',
    browser: session.browser || 'Unknown Browser',
    location: session.city && session.country
      ? `${session.city}, ${session.country}`
      : session.country || 'Unknown Location',
    ipAddress: session.ip_address || 'Unknown IP',
    lastActive: session.start_time,
    current: session.session_id === currentSessionId,
  }));
}

/**
 * Get security audit log from activity_logs
 */
export async function getSecurityLog(userId: string) {
  const logs = await prisma.activity_logs.findMany({
    where: {
      user_id: userId,
      action: {
        in: [
          'password_change',
          'login_success',
          'login_failed',
          '2fa_enabled',
          '2fa_disabled',
          'session_revoked',
          'security_setting_changed',
        ],
      },
    },
    orderBy: {
      created_at: 'desc',
    },
    take: 20, // Last 20 security events
  });

  return logs.map((log) => ({
    id: log.id,
    event: log.action,
    description: getSecurityEventDescription(log.action, log.new_data),
    timestamp: log.created_at,
    ipAddress: log.ip_address || 'Unknown IP',
    device: getUserAgentDevice(log.user_agent),
  }));
}

/**
 * Get 2FA status for user
 * Note: 2FA fields not yet in database schema - returns placeholder
 */
export async function get2FAStatus(userId: string) {
  // TODO: Add two_factor_enabled field to users table
  // const user = await prisma.users.findUnique({
  //   where: { id: userId },
  //   select: { two_factor_enabled: true, two_factor_method: true },
  // });

  return {
    enabled: false,
    method: null,
  };
}

/**
 * Helper: Get human-readable description for security events
 */
function getSecurityEventDescription(action: string, data: any): string {
  const descriptions: Record<string, string> = {
    password_change: 'Password changed successfully',
    login_success: 'Successful login',
    login_failed: 'Failed login attempt (incorrect password)',
    '2fa_enabled': 'Two-factor authentication enabled',
    '2fa_disabled': 'Two-factor authentication disabled',
    session_revoked: 'Session revoked',
    security_setting_changed: 'Security settings updated',
  };

  return descriptions[action] || action;
}

/**
 * Helper: Extract device from user agent string
 */
function getUserAgentDevice(userAgent: string | null): string {
  if (!userAgent) return 'Unknown';

  // Simple device detection
  if (userAgent.includes('iPhone')) return 'iPhone';
  if (userAgent.includes('iPad')) return 'iPad';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('Mac')) return 'MacBook';
  if (userAgent.includes('Windows')) return 'Windows PC';
  if (userAgent.includes('Linux')) return 'Linux PC';

  return 'Unknown Device';
}
