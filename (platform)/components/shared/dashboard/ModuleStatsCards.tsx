'use client';

import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCard {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    label?: string;
  };
  color?: 'cyan' | 'purple' | 'green' | 'orange';
}

export interface ModuleStatsCardsProps {
  stats: StatCard[];
  delay?: number;
}

const colorMap = {
  cyan: {
    border: 'neon-border-cyan',
    text: 'text-primary',
    glow: 'rgba(0, 210, 255, 0.2)',
  },
  purple: {
    border: 'neon-border-purple',
    text: 'text-chart-2',
    glow: 'rgba(139, 92, 246, 0.2)',
  },
  green: {
    border: 'neon-border-green',
    text: 'text-chart-3',
    glow: 'rgba(57, 255, 20, 0.2)',
  },
  orange: {
    border: 'neon-border-orange',
    text: 'text-chart-4',
    glow: 'rgba(255, 112, 51, 0.2)',
  },
};

export function ModuleStatsCards({ stats, delay = 0 }: ModuleStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const colors = colorMap[stat.color || 'cyan'];
        const IconComponent = stat.icon;
        const trendIcon = stat.trend?.direction === 'up' ? ArrowUp : ArrowDown;
        const trendColorClass =
          stat.trend?.direction === 'up' ? 'text-chart-3' : 'text-destructive';

        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + index * 0.1 }}
            whileHover={{
              y: -4,
              boxShadow: `0 10px 30px ${colors.glow}`,
            }}
            className={cn(
              'glass-strong rounded-xl p-4 sm:p-6 cursor-pointer transition-all',
              colors.border
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </span>
              <IconComponent className={cn('w-5 h-5', colors.text)} />
            </div>

            {/* Value */}
            <motion.div
              key={String(stat.value)}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.5 }}
              className={cn('text-3xl sm:text-4xl font-bold mb-2', colors.text)}
            >
              {stat.value}
            </motion.div>

            {/* Description */}
            {stat.description && (
              <p className="text-xs text-muted-foreground mb-2">
                {stat.description}
              </p>
            )}

            {/* Trend */}
            {stat.trend && (
              <div className="flex items-center gap-1">
                {trendIcon &&
                  (() => {
                    const TrendIcon = trendIcon;
                    return <TrendIcon className={cn('w-3 h-3', trendColorClass)} />;
                  })()}
                <span className={cn('text-xs font-semibold', trendColorClass)}>
                  {Math.abs(stat.trend.value)}%
                </span>
                {stat.trend.label && (
                  <span className="text-xs text-muted-foreground">
                    {stat.trend.label}
                  </span>
                )}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
