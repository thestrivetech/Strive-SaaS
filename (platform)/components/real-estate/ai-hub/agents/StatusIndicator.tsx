'use client';

import { cn } from '@/lib/utils';
import type { AgentStatus } from '@prisma/client';

interface StatusIndicatorProps {
  status: AgentStatus;
  className?: string;
  showLabel?: boolean;
}

export function StatusIndicator({ status, className, showLabel = false }: StatusIndicatorProps) {
  const statusConfig = {
    IDLE: {
      color: 'bg-green-500',
      label: 'Idle',
      ring: 'ring-green-500/20',
    },
    BUSY: {
      color: 'bg-yellow-500 animate-pulse',
      label: 'Busy',
      ring: 'ring-yellow-500/20',
    },
    OFFLINE: {
      color: 'bg-gray-500',
      label: 'Offline',
      ring: 'ring-gray-500/20',
    },
    ERROR: {
      color: 'bg-red-500',
      label: 'Error',
      ring: 'ring-red-500/20',
    },
  };

  const config = statusConfig[status];

  if (showLabel) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className={cn('w-2 h-2 rounded-full ring-2', config.color, config.ring)} />
        <span className="text-sm text-slate-400">{config.label}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-4 h-4 rounded-full border-2 border-slate-900 ring-2',
        config.color,
        config.ring,
        className
      )}
      title={config.label}
    />
  );
}
