import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'

/**
 * EmptyState Component
 *
 * Displays an empty state message when no data is available.
 * Provides optional call-to-action for users to add data.
 *
 * Props:
 * - title: Main message to display
 * - description: Additional context (optional)
 * - actionLabel: Text for the action button (optional)
 * - onAction: Callback when action button is clicked (optional)
 *
 * Features:
 * - Clean, centered design
 * - Optional action button with icon
 * - Accessible with proper ARIA attributes
 * - Responsive layout
 */
interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6">
        <div className="text-center space-y-4 max-w-md">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <PlusCircle className="h-8 w-8 text-gray-400" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

          {/* Description */}
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}

          {/* Action Button */}
          {actionLabel && onAction && (
            <div className="pt-4">
              <Button
                onClick={onAction}
                className="gap-2"
                aria-label={actionLabel}
              >
                <PlusCircle className="h-4 w-4" />
                {actionLabel}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
