// Mock data queries for security settings

export async function getActiveSessions(userId: string) {
  // Mock data - in future, this would query sessions table or Supabase auth sessions
  return [
    {
      id: 'session_1',
      device: 'MacBook Pro',
      browser: 'Chrome 120',
      location: 'San Francisco, CA',
      ipAddress: '192.168.1.1',
      lastActive: new Date(),
      current: true,
    },
    {
      id: 'session_2',
      device: 'iPhone 15',
      browser: 'Safari',
      location: 'San Francisco, CA',
      ipAddress: '192.168.1.2',
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      current: false,
    },
    {
      id: 'session_3',
      device: 'iPad',
      browser: 'Safari',
      location: 'Oakland, CA',
      ipAddress: '192.168.1.3',
      lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      current: false,
    },
  ];
}

export async function getSecurityLog(userId: string) {
  // Mock data - in future, this would query audit_logs table
  return [
    {
      id: 'log_1',
      event: 'password_change',
      description: 'Password changed successfully',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
      ipAddress: '192.168.1.1',
      device: 'MacBook Pro',
    },
    {
      id: 'log_2',
      event: 'login_success',
      description: 'Successful login from new device',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      ipAddress: '192.168.1.2',
      device: 'iPhone 15',
    },
    {
      id: 'log_3',
      event: 'login_failed',
      description: 'Failed login attempt (incorrect password)',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      ipAddress: '10.0.0.5',
      device: 'Unknown',
    },
  ];
}

export async function get2FAStatus(userId: string) {
  // Mock data - in future, this would check user's 2FA settings
  return {
    enabled: false,
    method: null,
  };
}
