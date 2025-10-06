'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface ProgressItem {
  id: string
  label: string
  current: number
  target: number
  unit?: string
  color?: string
}

interface ProgressWidgetProps {
  title: string
  items: ProgressItem[]
}

export function ProgressWidget({ title, items }: ProgressWidgetProps) {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {items.map((item) => {
            const percentage = Math.min((item.current / item.target) * 100, 100)
            const isComplete = percentage >= 100

            return (
              <div key={item.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {item.current} / {item.target}
                      {item.unit && ` ${item.unit}`}
                    </span>
                    {isComplete && (
                      <Badge className="bg-green-100 text-green-800">
                        Complete
                      </Badge>
                    )}
                  </div>
                </div>
                <Progress
                  value={percentage}
                  className="h-2"
                  indicatorClassName={item.color || 'bg-blue-600'}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{percentage.toFixed(0)}% complete</span>
                  {!isComplete && (
                    <span>{item.target - item.current} remaining</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
