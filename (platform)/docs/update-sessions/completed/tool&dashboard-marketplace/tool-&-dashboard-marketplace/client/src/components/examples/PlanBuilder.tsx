import { useState } from 'react';
import PlanBuilder from '../PlanBuilder';
import { marketplaceItems } from '@/data/marketplace-items';

export default function PlanBuilderExample() {
  const [selectedItems, setSelectedItems] = useState(marketplaceItems.slice(0, 3));

  const handleRemove = (id: string) => {
    setSelectedItems(items => items.filter(item => item.id !== id));
  };

  return (
    <div className="p-4 max-w-sm">
      <PlanBuilder selectedItems={selectedItems} onRemove={handleRemove} />
    </div>
  );
}
