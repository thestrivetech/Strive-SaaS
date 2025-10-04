import { Card } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { fetchNeighborhoodInsights } from "@/lib/api";
import type { NeighborhoodInsight } from "@shared/schema";

interface HeatmapModuleProps {
  selectedAreaCode?: string;
}

const zipToCoords: Record<string, [number, number]> = {
  "94110": [37.7599, -122.4148],
  "94123": [37.8025, -122.4351],
  "94107": [37.7786, -122.4056],
  "94115": [37.7919, -122.4364],
};

export function HeatmapModule({ selectedAreaCode }: HeatmapModuleProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [metric, setMetric] = useState<"price" | "dom" | "inventory">("price");

  const { data: insights = [], isLoading, isError } = useQuery({
    queryKey: ["/api/v1/reid/insights", selectedAreaCode],
    queryFn: () => fetchNeighborhoodInsights(selectedAreaCode),
  });

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([37.7749, -122.4194], 11);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && insights.length > 0) {
      const map = mapInstanceRef.current;
      map.eachLayer((layer) => {
        if (layer instanceof L.Circle) {
          map.removeLayer(layer);
        }
      });

      insights.forEach((insight: NeighborhoodInsight) => {
        const coords = zipToCoords[insight.areaCode];
        if (!coords) return;

        const getColor = () => {
          if (metric === "price") {
            const price = insight.metrics.medianPrice;
            return price > 1200000 ? "#ef4444" : price > 900000 ? "#f59e0b" : "#06b6d4";
          } else if (metric === "dom") {
            const dom = insight.metrics.daysOnMarket;
            return dom > 30 ? "#ef4444" : dom > 20 ? "#f59e0b" : "#06b6d4";
          } else {
            const inv = insight.metrics.inventory;
            return inv > 50 ? "#06b6d4" : inv > 30 ? "#f59e0b" : "#ef4444";
          }
        };

        L.circle(coords, {
          color: getColor(),
          fillColor: getColor(),
          fillOpacity: 0.5,
          radius: 800,
        })
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-bold text-sm mb-1">Zip: ${insight.areaCode}</h3>
              <p class="text-xs">Price: $${insight.metrics.medianPrice.toLocaleString()}</p>
              <p class="text-xs">DOM: ${insight.metrics.daysOnMarket} days</p>
              <p class="text-xs">Inventory: ${insight.metrics.inventory}</p>
            </div>
          `)
          .addTo(map);
      });
    }
  }, [insights, metric]);

  if (isLoading) {
    return (
      <Card className="p-6 h-[600px] flex items-center justify-center">
        <div className="text-muted-foreground">Loading map data...</div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-6 h-[600px] flex items-center justify-center">
        <div className="text-destructive">Failed to load map data. Please try again.</div>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card className="p-6 h-[600px] flex items-center justify-center">
        <div className="text-muted-foreground">No data available for selected area</div>
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden h-[600px] relative">
      <div className="absolute top-4 right-4 z-[1000] flex gap-2">
        <Select value={metric} onValueChange={(v) => setMetric(v as any)}>
          <SelectTrigger className="w-40 bg-card/90 backdrop-blur-sm" data-testid="select-metric">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price">Median Price</SelectItem>
            <SelectItem value="dom">Days on Market</SelectItem>
            <SelectItem value="inventory">Inventory</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="absolute top-4 left-4 z-[1000] flex gap-2 bg-card/90 backdrop-blur-sm p-3 rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#06b6d4]" />
          <span className="text-xs">Low</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
          <span className="text-xs">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
          <span className="text-xs">High</span>
        </div>
      </div>

      <div ref={mapRef} className="w-full h-full" data-testid="map-heatmap" />
    </Card>
  );
}
