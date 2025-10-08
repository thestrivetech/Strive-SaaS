'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { PurchasedToolCard } from './PurchasedToolCard';

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon_url?: string | null;
}

interface Purchase {
  id: string;
  tool_id: string;
  purchase_date: Date;
  last_used: Date | null;
  usage_count: number;
  price_at_purchase: number;
  status: string;
  tool: Tool;
}

interface BundlePurchase {
  id: string;
  bundle: {
    id: string;
    name: string;
    tools: Array<{
      tool: Tool;
    }>;
  };
}

interface PurchasedToolsListProps {
  purchases: Purchase[];
  bundlePurchases?: BundlePurchase[];
}

export function PurchasedToolsList({ purchases, bundlePurchases = [] }: PurchasedToolsListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Create a map of tool IDs to their bundle info
  const toolBundleMap = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    bundlePurchases.forEach((bundlePurchase) => {
      bundlePurchase.bundle.tools.forEach((bundleTool) => {
        map.set(bundleTool.tool.id, {
          id: bundlePurchase.bundle.id,
          name: bundlePurchase.bundle.name,
        });
      });
    });
    return map;
  }, [bundlePurchases]);

  // Filter purchases based on search query
  const filteredPurchases = useMemo(() => {
    if (!searchQuery) return purchases;

    const query = searchQuery.toLowerCase();
    return purchases.filter(
      (purchase) =>
        purchase.tool.name.toLowerCase().includes(query) ||
        purchase.tool.description.toLowerCase().includes(query) ||
        purchase.tool.category.toLowerCase().includes(query)
    );
  }, [purchases, searchQuery]);

  // Separate tools into bundle and non-bundle
  const { bundleTools, standaloneTools } = useMemo(() => {
    const bundle: Purchase[] = [];
    const standalone: Purchase[] = [];

    filteredPurchases.forEach((purchase) => {
      if (toolBundleMap.has(purchase.tool_id)) {
        bundle.push(purchase);
      } else {
        standalone.push(purchase);
      }
    });

    return { bundleTools: bundle, standaloneTools: standalone };
  }, [filteredPurchases, toolBundleMap]);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search tools by name, description, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredPurchases.length} of {purchases.length} purchased tools
      </div>

      {/* Standalone Tools */}
      {standaloneTools.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Individual Tools</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {standaloneTools.map((purchase) => (
              <PurchasedToolCard key={purchase.id} purchase={purchase} />
            ))}
          </div>
        </div>
      )}

      {/* Bundle Tools */}
      {bundleTools.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">From Bundles</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bundleTools.map((purchase) => (
              <PurchasedToolCard
                key={purchase.id}
                purchase={purchase}
                fromBundle={toolBundleMap.get(purchase.tool_id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredPurchases.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? 'No tools match your search' : 'No purchased tools found'}
          </p>
        </div>
      )}
    </div>
  );
}
