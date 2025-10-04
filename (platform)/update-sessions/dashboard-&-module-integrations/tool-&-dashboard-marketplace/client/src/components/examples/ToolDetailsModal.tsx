import { useState } from 'react';
import ToolDetailsModal from '../ToolDetailsModal';
import { Button } from '@/components/ui/button';
import { marketplaceItems } from '@/data/marketplace-items';

export default function ToolDetailsModalExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const item = marketplaceItems[0];

  return (
    <div className="p-4">
      <Button onClick={() => setIsOpen(true)}>Open Tool Details</Button>
      <ToolDetailsModal
        item={item}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isSelected={isSelected}
        onToggle={() => setIsSelected(!isSelected)}
      />
    </div>
  );
}
