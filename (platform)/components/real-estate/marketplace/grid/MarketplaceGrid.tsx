import { getMarketplaceTools, getPurchasedTools } from '@/lib/modules/marketplace';
import { ToolCard } from './ToolCard';
import type { ToolFilters } from '@/lib/modules/marketplace';

interface MarketplaceGridProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function MarketplaceGrid({ searchParams }: MarketplaceGridProps) {
  // Parse filters from search params
  const filters: ToolFilters = {
    category: searchParams.category as any,
    tier: searchParams.tier as any,
    search: searchParams.search as string,
    is_active: true,
    limit: 50,
    offset: 0,
    sort_by: (searchParams.sort_by as any) || 'purchase_count',
    sort_order: (searchParams.sort_order as 'asc' | 'desc') || 'desc',
  };

  // Fetch tools and purchases
  const [tools, purchases] = await Promise.all([
    getMarketplaceTools(filters),
    getPurchasedTools().catch(() => []), // Ignore errors if not authenticated
  ]);

  const purchasedToolIds = new Set(purchases.map((p) => p.tool_id));

  if (tools.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No tools found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tools.map((tool) => (
        <ToolCard
          key={tool.id}
          tool={tool}
          isPurchased={purchasedToolIds.has(tool.id)}
        />
      ))}
    </div>
  );
}
