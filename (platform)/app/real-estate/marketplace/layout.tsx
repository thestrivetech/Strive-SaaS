import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tool Marketplace | Strive Real Estate',
  description: 'Browse and install tools and dashboards for your real estate business',
};

/**
 * Marketplace Module Layout
 *
 * Provides layout structure for the Tool & Dashboard Marketplace module
 * with header and content area
 */
export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <h1 className="text-4xl font-bold text-gray-900">Tool Marketplace</h1>
            <p className="mt-2 text-lg text-gray-600">Build your perfect toolkit</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
