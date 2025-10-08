import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Building2,
  DollarSign,
  AlertTriangle,
  Activity,
  Database,
  Shield,
  TrendingUp,
} from 'lucide-react';

/**
 * Platform Admin Dashboard
 *
 * SUPER_ADMIN only dashboard for platform-wide monitoring
 * - All organizations overview
 * - Platform metrics and analytics
 * - System health monitoring
 * - User management
 *
 * Access: Available ONLY through user profile dropdown (Shield icon)
 */
export default async function PlatformAdminDashboard() {
  // TODO: Implement real platform metrics queries
  // These are placeholder values for demonstration

  const stats = [
    {
      title: 'Total Organizations',
      value: '247',
      change: '+12% from last month',
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Users',
      value: '1,842',
      change: '+23% from last month',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Monthly Revenue',
      value: '$127,500',
      change: '+18% from last month',
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Active Subscriptions',
      value: '189',
      change: '76% subscription rate',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'System Health',
      value: '99.8%',
      change: 'All systems operational',
      icon: Activity,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: 'Database Size',
      value: '4.2 GB',
      change: '12% growth this month',
      icon: Database,
      color: 'text-orange-600',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Security Alerts',
      value: '3',
      change: '2 resolved, 1 active',
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'SUPER_ADMIN Accounts',
      value: '2',
      change: 'Platform administrators',
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Platform Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="glass hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="glass-strong">
        <CardHeader>
          <CardTitle>Platform Management</CardTitle>
          <CardDescription>
            Quick access to platform-wide administration tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
              <Building2 className="h-5 w-5 text-blue-600 mb-2" />
              <h3 className="font-semibold mb-1">Manage Organizations</h3>
              <p className="text-sm text-muted-foreground">
                View, edit, and manage all organizations
              </p>
            </div>
            <div className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
              <Users className="h-5 w-5 text-green-600 mb-2" />
              <h3 className="font-semibold mb-1">User Management</h3>
              <p className="text-sm text-muted-foreground">
                Platform-wide user administration
              </p>
            </div>
            <div className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
              <DollarSign className="h-5 w-5 text-emerald-600 mb-2" />
              <h3 className="font-semibold mb-1">Billing & Subscriptions</h3>
              <p className="text-sm text-muted-foreground">
                Manage subscriptions and pricing
              </p>
            </div>
            <div className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
              <Activity className="h-5 w-5 text-cyan-600 mb-2" />
              <h3 className="font-semibold mb-1">System Monitoring</h3>
              <p className="text-sm text-muted-foreground">
                Performance and uptime monitoring
              </p>
            </div>
            <div className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mb-2" />
              <h3 className="font-semibold mb-1">Security Center</h3>
              <p className="text-sm text-muted-foreground">
                Security alerts and audit logs
              </p>
            </div>
            <div className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
              <Database className="h-5 w-5 text-orange-600 mb-2" />
              <h3 className="font-semibold mb-1">Database Management</h3>
              <p className="text-sm text-muted-foreground">
                Database health and backups
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access Notice */}
      <Card className="glass border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-primary">SUPER_ADMIN Access</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-0.5">Note</Badge>
            <p className="text-sm text-muted-foreground">
              This dashboard is only accessible to SUPER_ADMIN users (limited to 2 accounts) through
              the user profile dropdown menu. It provides platform-wide administration capabilities
              across all organizations.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-0.5">Security</Badge>
            <p className="text-sm text-muted-foreground">
              All actions performed in this dashboard are logged for security and compliance purposes.
              SUPER_ADMIN access should only be used for platform-level administration tasks.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
