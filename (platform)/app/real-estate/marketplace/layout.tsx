import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tool Marketplace | Strive Real Estate',
  description: 'Browse and install tools and dashboards for your real estate business',
};

/**
 * Marketplace Module Layout
 *
 * Provides layout structure for the Tool & Dashboard Marketplace module
 */
export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {/* Breadcrumb navigation can be added here in future */}
      {children}
    </div>
  );
}
