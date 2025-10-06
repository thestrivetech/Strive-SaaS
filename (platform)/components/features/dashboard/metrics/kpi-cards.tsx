'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { KPICard } from './kpi-card'
import { Skeleton } from '@/components/ui/skeleton'

interface Metric {
  id: string
  name: string
  value: number
  unit?: string
  change?: number
  status: 'normal' | 'warning' | 'critical'
  icon: string
  category: string
}

export function KPICards() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/v1/dashboard/metrics/calculate', {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to fetch metrics')
      return response.json()
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Failed to load metrics. Please try again.</p>
      </div>
    )
  }

  const metrics = data?.metrics || []

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.slice(0, 4).map((metric: Metric) => (
        <KPICard key={metric.id} metric={metric} />
      ))}
    </div>
  )
}
