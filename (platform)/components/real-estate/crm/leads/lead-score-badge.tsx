'use client';

import { Badge } from '@/components/ui/badge';
import { Flame, ThermometerSun, Snowflake } from 'lucide-react';
import type { leads } from '@prisma/client';

interface LeadScoreBadgeProps {
  score: leads['score'];
  showIcon?: boolean;
  className?: string;
}

const SCORE_CONFIG = {
  HOT: {
    label: 'Hot',
    className: 'bg-red-500/10 text-red-700 border-red-200 hover:bg-red-500/20',
    icon: Flame,
  },
  WARM: {
    label: 'Warm',
    className: 'bg-yellow-500/10 text-yellow-700 border-yellow-200 hover:bg-yellow-500/20',
    icon: ThermometerSun,
  },
  COLD: {
    label: 'Cold',
    className: 'bg-blue-500/10 text-blue-700 border-blue-200 hover:bg-blue-500/20',
    icon: Snowflake,
  },
} as const;

export function LeadScoreBadge({ score, showIcon = true, className }: LeadScoreBadgeProps) {
  const config = SCORE_CONFIG[score];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.className} ${className || ''}`}>
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {config.label}
    </Badge>
  );
}
