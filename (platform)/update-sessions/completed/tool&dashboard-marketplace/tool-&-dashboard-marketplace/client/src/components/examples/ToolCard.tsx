import { useState } from 'react';
import ToolCard from '../ToolCard';
import { marketplaceItems } from '@/data/marketplace-items';

export default function ToolCardExample() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const handleToggle = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const item = marketplaceItems[0];

  return (
    <div className="p-4 max-w-sm">
      <ToolCard
        item={item}
        isSelected={selected.has(item.id)}
        onToggle={handleToggle}
        onViewDetails={(item) => console.log('View details:', item.title)}
      />
    </div>
  );
}
