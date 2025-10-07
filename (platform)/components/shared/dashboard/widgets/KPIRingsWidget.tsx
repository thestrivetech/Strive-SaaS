'use client';

import { motion } from 'framer-motion';

interface KPIRing {
  id: string;
  label: string;
  value: number;
  percentage: number;
  change: string;
  color: string;
  gradient: [string, string];
}

const kpiRings: KPIRing[] = [
  {
    id: 'conversion-rate',
    label: 'Conversion Rate',
    value: 75,
    percentage: 75,
    change: '↑ 8% this week',
    color: '#00D2FF',
    gradient: ['#00D2FF', '#39FF14'],
  },
  {
    id: 'pipeline-health',
    label: 'Pipeline Health',
    value: 85,
    percentage: 85,
    change: 'Excellent',
    color: '#39FF14',
    gradient: ['#39FF14', '#8B5CF6'],
  },
  {
    id: 'agent-productivity',
    label: 'Agent Productivity',
    value: 80,
    percentage: 80,
    change: '↑ 5% vs avg',
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#00D2FF'],
  },
];

function KPIRing({ ring, index }: { ring: KPIRing; index: number }) {
  const circumference = 2 * Math.PI * 50; // radius = 50
  const strokeDashoffset = circumference - (ring.percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.2 }}
      className="text-center"
      data-testid={`kpi-ring-${ring.id}`}
    >
      <div className="relative w-32 h-32 mx-auto mb-3">
        <svg width="128" height="128" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="64"
            cy="64"
            r="50"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <motion.circle
            cx="64"
            cy="64"
            r="50"
            fill="none"
            stroke={`url(#gradient-${ring.id})`}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            strokeLinecap="round"
            animate={{ strokeDashoffset }}
            transition={{ duration: 2, ease: 'easeOut', delay: index * 0.2 }}
          />
          <defs>
            <linearGradient id={`gradient-${ring.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={ring.gradient[0]} />
              <stop offset="100%" stopColor={ring.gradient[1]} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 + index * 0.2 }}
            className="text-2xl font-bold"
            style={{ color: ring.color }}
          >
            {ring.value}%
          </motion.span>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">{ring.label}</div>
      <div className="text-xs text-secondary mt-1">{ring.change}</div>
    </motion.div>
  );
}

interface KPIRingsWidgetProps {
  stats?: any;
}

export function KPIRingsWidget({ stats }: KPIRingsWidgetProps) {
  return (
    <div
      className="glass-strong rounded-2xl p-6 widget-hover h-full neon-border-cyan"
      data-testid="kpi-rings-widget"
    >
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-2 h-2 rounded-full bg-cyan-400"
        />
        Performance Metrics
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {kpiRings.map((ring, index) => (
          <KPIRing key={ring.id} ring={ring} index={index} />
        ))}
      </div>
    </div>
  );
}
