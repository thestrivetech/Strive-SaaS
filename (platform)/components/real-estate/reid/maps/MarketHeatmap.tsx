'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { MapPin, TrendingUp, TrendingDown } from 'lucide-react';
import { REIDCard, REIDCardHeader, REIDCardContent } from '../shared/REIDCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartSkeleton } from '../shared/REIDSkeleton';

// Type definitions for neighborhood insights
interface NeighborhoodInsight {
  area_code: string;
  area_name: string;
  latitude: number | null;
  longitude: number | null;
  median_price: string | number | null;
  price_change: number | null;
  inventory: number | null;
  days_on_market: number | null;
}

interface InsightsResponse {
  insights: NeighborhoodInsight[];
}

// Dynamically import Leaflet to avoid SSR issues
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => <ChartSkeleton />
});

export function MarketHeatmap() {
  const [mapView, setMapView] = useState<'price' | 'inventory' | 'trend'>('price');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  const { data: insights, isLoading } = useQuery<InsightsResponse>({
    queryKey: ['neighborhood-insights'],
    queryFn: async () => {
      const response = await fetch('/api/v1/reid/insights');
      if (!response.ok) throw new Error('Failed to fetch insights');
      return response.json();
    }
  });

  const mapData = insights?.insights?.map((insight) => ({
    areaCode: insight.area_code,
    areaName: insight.area_name,
    lat: insight.latitude || 0,
    lng: insight.longitude || 0,
    medianPrice: Number(insight.median_price) || 0,
    priceChange: insight.price_change || 0,
    inventory: insight.inventory || 0,
    daysOnMarket: insight.days_on_market || 0
  })) || [];

  return (
    <REIDCard>
      <REIDCardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Market Heatmap</h3>
          </div>

          <Select value={mapView} onValueChange={(value) => setMapView(value as typeof mapView)}>
            <SelectTrigger className="w-48 bg-slate-800 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="price">Median Price</SelectItem>
              <SelectItem value="inventory">Inventory Levels</SelectItem>
              <SelectItem value="trend">Price Trends</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </REIDCardHeader>

      <REIDCardContent className="p-0">
        <div className="h-96 reid-map">
          {isLoading ? (
            <div className="h-full bg-slate-800 rounded-lg animate-pulse flex items-center justify-center">
              <span className="text-slate-400">Loading map data...</span>
            </div>
          ) : (
            <LeafletMap
              data={mapData}
              view={mapView}
              onAreaSelect={setSelectedArea}
            />
          )}
        </div>

        {selectedArea && (
          <div className="p-4 border-t border-slate-600">
            <SelectedAreaInfo areaCode={selectedArea} />
          </div>
        )}
      </REIDCardContent>
    </REIDCard>
  );
}

function SelectedAreaInfo({ areaCode }: { areaCode: string }) {
  const { data: insight } = useQuery<NeighborhoodInsight>({
    queryKey: ['neighborhood-insight', areaCode],
    queryFn: async () => {
      const response = await fetch(`/api/v1/reid/insights/${areaCode}`);
      if (!response.ok) throw new Error('Failed to fetch insight');
      return response.json();
    }
  });

  if (!insight) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white">{insight.area_name}</h3>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="reid-metric-value text-2xl">
            {insight.median_price ? `$${(Number(insight.median_price) / 1000).toFixed(0)}K` : 'N/A'}
          </div>
          <div className="text-sm text-slate-400">Median Price</div>
        </div>

        <div className="text-center">
          <div className="reid-metric-value text-2xl">{insight.days_on_market || 'N/A'}</div>
          <div className="text-sm text-slate-400">Days on Market</div>
        </div>

        <div className="text-center">
          <div className={`reid-metric-value text-2xl flex items-center justify-center gap-1 ${
            (insight.price_change || 0) > 0 ? 'text-green-400' :
            (insight.price_change || 0) < 0 ? 'text-red-400' : 'text-cyan-400'
          }`}>
            {(insight.price_change || 0) > 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (insight.price_change || 0) < 0 ? (
              <TrendingDown className="w-4 h-4" />
            ) : null}
            {insight.price_change ? `${insight.price_change.toFixed(1)}%` : 'N/A'}
          </div>
          <div className="text-sm text-slate-400">Price Change</div>
        </div>
      </div>
    </div>
  );
}
