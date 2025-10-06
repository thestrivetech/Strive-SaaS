'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Activity } from 'lucide-react'
import { MetricStatusBadge } from './metric-status-badge'

interface KPICardProps {
  metric: {
    id: string
    name: string
    value: number
    unit?: string
    change?: number
    status: 'normal' | 'warning' | 'critical'
    icon: string
  }
}

const iconMap = {
  'dollar-sign': DollarSign,
  'users': Users,
  'target': Target,
  'activity': Activity,
}

export function KPICard({ metric }: KPICardProps) {
  const Icon = iconMap[metric.icon as keyof typeof iconMap] || Activity
  const isPositiveChange = (metric.change || 0) >= 0

  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 truncate">
                {metric.name}
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-bold text-gray-900">
                  {metric.value.toLocaleString()}
                </p>
                {metric.unit && (
                  <span className="text-sm text-gray-500">{metric.unit}</span>
                )}
              </div>
            </div>
          </div>
          {metric.status !== 'normal' && (
            <MetricStatusBadge status={metric.status} />
          )}
        </div>

        {metric.change !== undefined && (
          <div
            className={`flex items-center mt-4 text-sm ${
              isPositiveChange ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isPositiveChange ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            <span>
              {Math.abs(metric.change).toFixed(1)}% from last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
