import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { redirect } from 'next/navigation';
import { getProvidersWithStatus, getConnectionStats } from '@/lib/modules/connections';
import { ConnectionsSection } from '@/components/settings/connections/connections-section';

export const metadata: Metadata = {
  title: 'Connections | Settings',
  description: 'Connect your social media and third-party accounts',
};

export default async function ConnectionsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const [providers, stats] = await Promise.all([
    getProvidersWithStatus(),
    getConnectionStats(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Connections</h1>
        <p className="text-muted-foreground mt-2">
          Connect your accounts to unlock AI-powered automation and insights.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Connections</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold text-green-600">{stats.connected}</div>
          <div className="text-sm text-muted-foreground">Connected</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold text-gray-600">{stats.disconnected}</div>
          <div className="text-sm text-muted-foreground">Disconnected</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold text-red-600">{stats.error + stats.expired}</div>
          <div className="text-sm text-muted-foreground">Needs Attention</div>
        </div>
      </div>

      <ConnectionsSection providers={providers} />
    </div>
  );
}
