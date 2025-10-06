import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Hub | Strive Platform',
  description: 'AI-powered tools and automation for real estate professionals',
};

/**
 * AI Hub Layout
 *
 * Layout wrapper for all AI Hub pages
 * Provides consistent navigation and breadcrumbs
 */
export default function AIHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Hub</h2>
          <p className="text-muted-foreground">
            AI-powered tools and automation
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}
