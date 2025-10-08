import { redirect } from 'next/navigation';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { MarketHeatmap } from '@/components/real-estate/reid/maps/MarketHeatmap';

/**
 * REI Analytics Dashboard
 *
 * Real Estate Investment Analytics & Intelligence
 *
 * Features (Session 7):
 * - Interactive market heatmap with Leaflet
 * - Neighborhood insights visualization
 * - Price, inventory, and trend views
 * - Area selection and detail display
 *
 * @protected - Requires authentication and REID access (GROWTH tier+)
 */
export default async function REIAnalyticsDashboardPage() {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const organizationId = user.organization_members[0]?.organization_id;

  if (!organizationId) {
    redirect('/onboarding/organization');
  }

  return (
    <div className="space-y-6 reid-theme">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">REI Intelligence Dashboard</h1>
        <p className="text-slate-400">
          Real Estate Investment Analytics & Market Intelligence
        </p>
      </div>

      {/* Market Heatmap (Session 7) */}
      <MarketHeatmap />
    </div>
  );
}
