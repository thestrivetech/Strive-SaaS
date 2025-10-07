'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Users, Zap, Calculator, Building, Bot } from 'lucide-react'

/**
 * QuickActionButton Component
 *
 * Single quick action button with icon and color.
 * Displays as a clickable card in the quick actions grid.
 *
 * Props:
 * - action: Action object with name, icon, color
 * - onClick: Click handler
 * - isLoading: Loading state (disables button)
 *
 * Features:
 * - Icon mapping (Lucide icons)
 * - Color theming
 * - Hover effects
 * - Loading state
 * - Accessible with ARIA
 *
 * Security:
 * - Pure presentation component
 * - onClick validation happens in parent
 * - No data access
 */
interface QuickActionButtonProps {
  action: {
    id: string
    name: string
    icon: string
    color: string
  }
  onClick: () => void
  isLoading?: boolean
}

const iconMap: Record<string, typeof Plus> = {
  plus: Plus,
  'file-text': FileText,
  users: Users,
  zap: Zap,
  calculator: Calculator,
  building: Building,
  bot: Bot,
}

const colorMap: Record<string, string> = {
  blue: 'bg-blue-500 hover:bg-blue-600 text-white',
  green: 'bg-green-500 hover:bg-green-600 text-white',
  purple: 'bg-purple-500 hover:bg-purple-600 text-white',
  orange: 'bg-orange-500 hover:bg-orange-600 text-white',
  indigo: 'bg-indigo-500 hover:bg-indigo-600 text-white',
  gray: 'bg-gray-500 hover:bg-gray-600 text-white',
}

export function QuickActionButton({
  action,
  onClick,
  isLoading,
}: QuickActionButtonProps) {
  const Icon = iconMap[action.icon] || Plus
  const colorClass = colorMap[action.color] || colorMap.blue

  return (
    <Button
      variant="outline"
      className={`h-20 flex flex-col items-center justify-center gap-2 p-4 transition-all ${colorClass}`}
      onClick={onClick}
      disabled={isLoading}
      aria-label={action.name}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs font-medium text-center leading-tight">
        {action.name}
      </span>
    </Button>
  )
}
