'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { LucideIcon, ChevronRight } from 'lucide-react'

/**
 * ModuleShortcutCard Component
 *
 * Single module shortcut card with icon and description.
 * Navigates to module when clicked.
 *
 * Props:
 * - module: Module object with name, description, icon, href, color
 *
 * Features:
 * - Icon with color theming
 * - Hover effect
 * - Chevron indicator
 * - Accessible button (keyboard navigation)
 * - Truncated description for long text
 *
 * Security:
 * - Navigation only (no data access)
 * - Module access validated by middleware
 */
interface ModuleShortcutCardProps {
  module: {
    id: string
    name: string
    description: string
    icon: LucideIcon
    href: string
    color: string
  }
}

const colorMap: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  orange: 'bg-orange-100 text-orange-600',
  indigo: 'bg-indigo-100 text-indigo-600',
  gray: 'bg-gray-100 text-gray-600',
}

export function ModuleShortcutCard({ module }: ModuleShortcutCardProps) {
  const router = useRouter()
  const Icon = module.icon
  const colorClass = colorMap[module.color] || colorMap.blue

  return (
    <button
      onClick={() => router.push(module.href)}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left w-full"
      aria-label={`Navigate to ${module.name}`}
    >
      <div className={`p-2 rounded-lg ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{module.name}</p>
        <p className="text-xs text-gray-600 truncate">{module.description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
    </button>
  )
}
