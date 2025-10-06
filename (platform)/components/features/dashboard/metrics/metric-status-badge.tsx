import React from 'react'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, AlertTriangle } from 'lucide-react'

interface MetricStatusBadgeProps {
  status: 'normal' | 'warning' | 'critical'
}

export function MetricStatusBadge({ status }: MetricStatusBadgeProps) {
  if (status === 'normal') return null

  const config = {
    warning: {
      icon: AlertTriangle,
      label: 'Attention',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    critical: {
      icon: AlertCircle,
      label: 'Critical',
      className: 'bg-red-100 text-red-800 border-red-200',
    },
  }

  const { icon: Icon, label, className } = config[status]

  return (
    <Badge variant="outline" className={`${className} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      <span className="text-xs">{label}</span>
    </Badge>
  )
}
