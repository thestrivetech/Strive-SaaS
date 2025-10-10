import { useState } from 'react';
import CategoryFilter from '../CategoryFilter';

export default function CategoryFilterExample() {
  const categories = ['All', 'Starter', 'Growth', 'Elite', 'Custom', 'Standalone'];
  const [selected, setSelected] = useState('All');

  return (
    <div className="p-4 max-w-xs bg-sidebar rounded-lg">
      <CategoryFilter
        categories={categories}
        selectedCategory={selected}
        onSelectCategory={setSelected}
      />
    </div>
  );
}
