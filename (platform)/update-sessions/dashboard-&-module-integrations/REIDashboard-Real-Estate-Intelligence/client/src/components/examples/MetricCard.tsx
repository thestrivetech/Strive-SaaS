import { MetricCard } from '../MetricCard';
import { Home, Clock, Package } from 'lucide-react';

export default function MetricCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
      <MetricCard 
        title="Median Price" 
        value={450000} 
        change={5.2}
        format="currency"
        icon={<Home className="h-8 w-8" />}
      />
      <MetricCard 
        title="Days on Market" 
        value={32} 
        change={-12}
        format="days"
        icon={<Clock className="h-8 w-8" />}
      />
      <MetricCard 
        title="Inventory" 
        value={245} 
        change={8.5}
        icon={<Package className="h-8 w-8" />}
      />
    </div>
  );
}
