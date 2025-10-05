# Session 7: Market Heatmap & Interactive Maps

## Session Overview
**Goal:** Implement interactive market heatmap with Leaflet integration, dark map tiles, and area selection functionality.

**Duration:** 3-4 hours
**Complexity:** High
**Dependencies:** Session 6 (AI module complete)

## Objectives

1. ✅ Install and configure Leaflet for Next.js 15
2. ✅ Create LeafletMap component with dark tiles
3. ✅ Implement MarketHeatmap component
4. ✅ Add area selection and detail display
5. ✅ Create heatmap data visualization layers
6. ✅ Add map controls and filters
7. ✅ Ensure SSR compatibility

## Prerequisites

- [x] Session 6 completed
- [x] Understanding of Leaflet mapping library
- [x] Dark CartoDB tile layer knowledge
- [x] Client-side rendering patterns for maps

## Dependencies to Install

```bash
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

## Implementation Steps

### Step 1: Create Leaflet Map Component

#### File: `components/real-estate/reid/maps/LeafletMap.tsx`
```tsx
'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapData {
  areaCode: string;
  areaName: string;
  lat: number;
  lng: number;
  medianPrice?: number;
  priceChange?: number;
  inventory?: number;
  daysOnMarket?: number;
}

interface LeafletMapProps {
  data: MapData[];
  view: 'price' | 'inventory' | 'trend';
  onAreaSelect: (areaCode: string) => void;
}

export default function LeafletMap({ data, view, onAreaSelect }: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) {
      // Initialize map
      const map = L.map('reid-map', {
        center: [37.7749, -122.4194], // San Francisco
        zoom: 12,
        zoomControl: true,
      });

      // Add dark tile layer (CartoDB Dark Matter)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      mapRef.current = map;
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers based on data and view
    data.forEach(area => {
      if (!area.lat || !area.lng) return;

      const color = getMarkerColor(area, view);
      const icon = createCustomIcon(color);

      const marker = L.marker([area.lat, area.lng], { icon })
        .addTo(mapRef.current!)
        .bindPopup(`
          <div class="reid-map-popup">
            <h3 class="font-semibold text-white">${area.areaName}</h3>
            <p class="text-sm text-slate-300">
              ${view === 'price' ? `Price: $${(area.medianPrice || 0).toLocaleString()}` : ''}
              ${view === 'inventory' ? `Inventory: ${area.inventory || 'N/A'}` : ''}
              ${view === 'trend' ? `Change: ${area.priceChange || 0}%` : ''}
            </p>
          </div>
        `)
        .on('click', () => onAreaSelect(area.areaCode));

      markersRef.current.push(marker);
    });

    return () => {
      // Cleanup
      markersRef.current.forEach(marker => marker.remove());
    };
  }, [data, view, onAreaSelect]);

  return <div id="reid-map" className="w-full h-96 rounded-lg" />;
}

function getMarkerColor(area: MapData, view: string): string {
  if (view === 'price') {
    const price = area.medianPrice || 0;
    if (price > 1500000) return '#ef4444'; // Red (expensive)
    if (price > 1000000) return '#f59e0b'; // Amber
    if (price > 500000) return '#10b981'; // Green
    return '#06b6d4'; // Cyan (affordable)
  }

  if (view === 'inventory') {
    const inventory = area.inventory || 0;
    if (inventory > 100) return '#ef4444'; // High inventory
    if (inventory > 50) return '#f59e0b';
    if (inventory > 20) return '#10b981';
    return '#06b6d4'; // Low inventory
  }

  if (view === 'trend') {
    const change = area.priceChange || 0;
    if (change > 10) return '#ef4444'; // Strong uptrend
    if (change > 5) return '#f59e0b';
    if (change > 0) return '#10b981';
    return '#06b6d4'; // Declining
  }

  return '#06b6d4';
}

function createCustomIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}
```

### Step 2: Create Market Heatmap Component

#### File: `components/real-estate/reid/maps/MarketHeatmap.tsx`
```tsx
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { MapPin, TrendingUp, TrendingDown } from 'lucide-react';
import { REIDCard, REIDCardHeader, REIDCardContent } from '../shared/REIDCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartSkeleton } from '../shared/REIDSkeleton';

// Dynamically import Leaflet to avoid SSR issues
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => <ChartSkeleton />
});

export function MarketHeatmap() {
  const [mapView, setMapView] = useState<'price' | 'inventory' | 'trend'>('price');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  const { data: insights, isLoading } = useQuery({
    queryKey: ['neighborhood-insights'],
    queryFn: async () => {
      const response = await fetch('/api/v1/reid/insights');
      if (!response.ok) throw new Error('Failed to fetch insights');
      return response.json();
    }
  });

  const mapData = insights?.insights?.map((insight: any) => ({
    areaCode: insight.area_code,
    areaName: insight.area_name,
    lat: insight.latitude,
    lng: insight.longitude,
    medianPrice: Number(insight.median_price),
    priceChange: insight.price_change,
    inventory: insight.inventory,
    daysOnMarket: insight.days_on_market
  })) || [];

  return (
    <REIDCard>
      <REIDCardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Market Heatmap</h3>
          </div>

          <Select value={mapView} onValueChange={(value: any) => setMapView(value)}>
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
  const { data: insight } = useQuery({
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
            insight.price_change > 0 ? 'text-green-400' :
            insight.price_change < 0 ? 'text-red-400' : 'text-cyan-400'
          }`}>
            {insight.price_change > 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : insight.price_change < 0 ? (
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
```

### Step 3: Create Map Styles

#### File: `app/globals.css` (add to existing REID styles)
```css
/* Leaflet Dark Theme Overrides */
.leaflet-container {
  background: var(--reid-background);
}

.leaflet-popup-content-wrapper {
  background: var(--reid-surface);
  color: var(--reid-text-primary);
  border: 1px solid #334155;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

.leaflet-popup-tip {
  background: var(--reid-surface);
  border: 1px solid #334155;
}

.reid-map-popup h3 {
  margin: 0 0 0.5rem 0;
}

.reid-map-popup p {
  margin: 0;
}

.custom-marker {
  transition: all 0.3s ease;
}

.custom-marker:hover {
  transform: scale(1.2);
}
```

### Step 4: Create API Route for Insights

#### File: `app/api/v1/reid/insights/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getNeighborhoodInsights } from '@/lib/modules/reid/insights';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filters = {
      areaCodes: searchParams.get('areaCodes')?.split(','),
      areaType: searchParams.get('areaType') as any,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    };

    const insights = await getNeighborhoodInsights(filters);
    return NextResponse.json({ insights });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}
```

#### File: `app/api/v1/reid/insights/[areaCode]/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getNeighborhoodInsightByAreaCode } from '@/lib/modules/reid/insights';

export async function GET(
  req: NextRequest,
  { params }: { params: { areaCode: string } }
) {
  try {
    const insight = await getNeighborhoodInsightByAreaCode(params.areaCode);
    return NextResponse.json(insight);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Insight not found' },
      { status: 404 }
    );
  }
}
```

## Testing & Validation

### Test 1: Map Rendering
```bash
# Verify Leaflet loads without SSR errors
# Check dark tiles render correctly
# Test marker interactions
```

### Test 2: Data Visualization
```typescript
// Test different map views (price, inventory, trend)
// Verify color coding matches data
// Test area selection functionality
```

## Success Criteria

- [x] Leaflet installed and configured
- [x] Dark CartoDB tiles rendering
- [x] Interactive markers working
- [x] Area selection functional
- [x] Heatmap views (price, inventory, trend)
- [x] SSR compatibility maintained
- [x] Mobile responsive map

## Files Created

- ✅ `components/real-estate/reid/maps/LeafletMap.tsx`
- ✅ `components/real-estate/reid/maps/MarketHeatmap.tsx`
- ✅ `app/api/v1/reid/insights/route.ts`
- ✅ `app/api/v1/reid/insights/[areaCode]/route.ts`

## Files Modified

- ✅ `app/globals.css` - Added Leaflet dark theme styles

## Next Steps

1. ✅ Proceed to **Session 8: Analytics Charts & ROI Simulator**
2. ✅ Interactive maps functional
3. ✅ Ready to build analytics visualizations
4. ✅ Heatmap provides geographic context

---

**Session 7 Complete:** ✅ Market heatmap and interactive maps implemented
