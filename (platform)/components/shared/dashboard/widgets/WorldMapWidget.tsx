'use client';

import { motion } from 'framer-motion';
import { MapPin, TrendingUp } from 'lucide-react';

interface WorldMapWidgetProps {
  organizationId?: string;
}

// Mock data for regional distribution - will be replaced with real data in Phase 5
const regionalData = [
  { region: 'West Coast', deals: 45, value: 2850000, growth: '+15%', color: '#00D2FF' },
  { region: 'East Coast', deals: 38, value: 2320000, growth: '+12%', color: '#39FF14' },
  { region: 'Midwest', deals: 28, value: 1540000, growth: '+8%', color: '#8B5CF6' },
  { region: 'South', deals: 32, value: 1890000, growth: '+10%', color: '#FF7033' },
];

export function WorldMapWidget({ organizationId }: WorldMapWidgetProps) {
  const totalDeals = regionalData.reduce((sum, region) => sum + region.deals, 0);
  const totalValue = regionalData.reduce((sum, region) => sum + region.value, 0);

  return (
    <div className="glass-strong rounded-2xl p-6 widget-hover h-full neon-border-cyan">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          className="w-2 h-2 rounded-full bg-cyan-400"
        />
        Geographic Distribution
      </h3>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="glass rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Total Deals</p>
          <p className="text-2xl font-bold text-cyan-400">{totalDeals}</p>
        </div>
        <div className="glass rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Total Value</p>
          <p className="text-2xl font-bold text-green-400">
            ${(totalValue / 1000000).toFixed(1)}M
          </p>
        </div>
      </div>

      {/* US Map Visualization (Simple SVG representation) */}
      <div className="relative mb-6 p-4 glass rounded-lg">
        <div className="text-center text-muted-foreground text-sm mb-2">
          United States Market Distribution
        </div>
        <div className="grid grid-cols-2 gap-3">
          {regionalData.map((region, index) => (
            <motion.div
              key={region.region}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-2"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: region.color }}
              />
              <span className="text-xs text-white">{region.region}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Regional Breakdown */}
      <div className="space-y-3">
        {regionalData.map((region, index) => {
          const percentage = ((region.deals / totalDeals) * 100).toFixed(1);

          return (
            <motion.div
              key={region.region}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="glass rounded-lg p-3 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" style={{ color: region.color }} />
                  <span className="text-sm font-medium">{region.region}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <TrendingUp className="w-3 h-3" />
                  {region.growth}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${region.color}, ${region.color}80)`,
                    }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {region.deals} deals ({percentage}%)
                </span>
                <span className="text-white font-medium">
                  ${(region.value / 1000000).toFixed(2)}M
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Market Insights */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-start gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1 flex-shrink-0" />
          <p className="text-muted-foreground">
            <span className="text-cyan-400 font-medium">West Coast</span> showing strongest
            growth with 45 active deals and +15% increase this quarter.
          </p>
        </div>
      </div>
    </div>
  );
}
