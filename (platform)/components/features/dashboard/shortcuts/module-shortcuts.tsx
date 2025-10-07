'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ModuleShortcutCard } from './module-shortcut-card'
import {
  Users,
  FileText,
  BarChart3,
  Calendar,
  DollarSign,
  Settings,
} from 'lucide-react'

/**
 * ModuleShortcuts Component
 *
 * Quick navigation shortcuts to main platform modules.
 * Provides easy access to CRM, Transactions, Analytics, etc.
 *
 * Features:
 * - Hardcoded module list (Real Estate industry)
 * - Icon and color theming
 * - Responsive grid layout
 * - Accessible navigation
 *
 * Security:
 * - Navigation only (no data access)
 * - Module access validated by middleware/RBAC
 * - No user-specific filtering (shows all available modules)
 *
 * Future Enhancement:
 * - Could fetch module list from API based on user permissions
 * - Could dynamically hide modules based on subscription tier
 */
const modules = [
  {
    id: 'crm',
    name: 'CRM',
    description: 'Manage contacts and deals',
    icon: Users,
    href: '/real-estate/crm',
    color: 'blue',
  },
  {
    id: 'workspace',
    name: 'Workspace',
    description: 'Track property transactions',
    icon: FileText,
    href: '/real-estate/workspace',
    color: 'green',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'View reports and insights',
    icon: BarChart3,
    href: '/real-estate/rei-analytics',
    color: 'purple',
  },
  {
    id: 'tasks',
    name: 'Tasks',
    description: 'Manage your tasks',
    icon: Calendar,
    href: '/real-estate/tasks',
    color: 'orange',
  },
  {
    id: 'billing',
    name: 'Billing',
    description: 'View invoices and payments',
    icon: DollarSign,
    href: '/real-estate/billing',
    color: 'indigo',
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Configure your workspace',
    icon: Settings,
    href: '/settings',
    color: 'gray',
  },
]

export function ModuleShortcuts() {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Quick Access
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {modules.map((module) => (
            <ModuleShortcutCard key={module.id} module={module} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
