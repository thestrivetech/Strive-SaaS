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
