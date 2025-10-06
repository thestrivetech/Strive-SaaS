'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Settings, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'

interface DashboardHeaderProps {
  userName?: string
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })
    queryClient.invalidateQueries({ queryKey: ['recent-activities'] })
  }

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back{userName ? `, ${userName.split(' ')[0]}` : ''}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Here&apos;s what&apos;s happening with your organization today
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/customize')}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Customize
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
