// app/features/property-results.tsx
'use client';

import { PropertyMatch } from '@/app/services/rentcast-service';
import PropertyCard from './property-card'; // ✅ Fixed: default import

// ✅ Inline Badge component (shadcn not installed)
const Badge = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${className}`}>
    {children}
  </span>
);

interface PropertyResultsProps {
  properties: PropertyMatch[];
  searchParams?: {
    location?: string;
    maxPrice?: number;
    minBedrooms?: number;
  };
}

export function PropertyResults({ properties, searchParams }: PropertyResultsProps) {
  if (!properties || properties.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 my-6">
      {/* Results Header */}
      <div className="flex items-center justify-between border-b border-gray-700 pb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-100">
            🏡 Found {properties.length} Perfect Matches
          </h3>
          {searchParams && (
            <p className="text-sm text-gray-400 mt-1">
              {searchParams.location && `${searchParams.location}`}
              {searchParams.maxPrice && `, under $${(searchParams.maxPrice / 1000).toFixed(0)}k`}
              {searchParams.minBedrooms && `, ${searchParams.minBedrooms}+ beds`}
            </p>
          )}
        </div>
        <Badge className="bg-green-600 text-white border-green-500">
          Top {properties.length} Picks
        </Badge>
      </div>

      {/* Property Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {properties.map((match, index) => (
          <PropertyCard
            key={match.property.id}
            match={match}
            rank={index + 1}
          />
        ))}
      </div>

      {/* CTA Footer */}
      <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-300 mb-2">
          Want to see more properties or adjust your criteria?
        </p>
        <p className="text-xs text-gray-400">
          Just ask me to search again with different preferences!
        </p>
      </div>
    </div>
  );
}
