'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuickAction {
  label: string;
  description?: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'secondary';
}

export interface ModuleQuickActionsProps {
  actions: QuickAction[];
  title?: string;
  description?: string;
}

const variantStyles = {
  default: 'glass-strong neon-border-cyan hover:bg-primary/10',
  outline: 'glass border-2 border-muted hover:border-primary/50',
  secondary: 'glass-subtle neon-border-purple hover:bg-chart-2/10',
};

export function ModuleQuickActions({
  actions,
  title = 'Quick Actions',
  description,
}: ModuleQuickActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-strong rounded-xl p-6"
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {actions.map((action, index) => {
          const IconComponent = action.icon;
          const variant = action.variant || 'default';

          const content = (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{
                scale: 1.02,
                boxShadow: '0 8px 20px rgba(0, 210, 255, 0.15)',
              }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all',
                variantStyles[variant]
              )}
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg glass flex items-center justify-center">
                  <IconComponent className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm mb-0.5">{action.label}</div>
                {action.description && (
                  <p className="text-xs text-muted-foreground truncate">
                    {action.description}
                  </p>
                )}
              </div>
            </motion.div>
          );

          // Render as Link or button based on href
          if (action.href) {
            return (
              <Link key={action.label} href={action.href}>
                {content}
              </Link>
            );
          }

          return (
            <button
              key={action.label}
              onClick={action.onClick}
              type="button"
              className="text-left"
            >
              {content}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
