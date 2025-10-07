'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, BarChart3, ChevronRight, Phone, Mail, Users } from 'lucide-react';

interface SmartSuggestionsWidgetProps {
  organizationId?: string;
}

interface SmartAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
}

// Mock suggestions - will be replaced with real smart suggestions in Phase 5
const smartActions: SmartAction[] = [
  {
    id: 'follow-up',
    title: 'Schedule Follow-up',
    description: 'With hottest lead: Marcus Rivera',
    icon: Calendar,
    color: 'cyan',
    action: '/real-estate/crm/leads',
    priority: 'high',
  },
  {
    id: 'review-pipeline',
    title: 'Review Pipeline',
    description: '3 deals need attention today',
    icon: FileText,
    color: 'orange',
    action: '/real-estate/crm/deals',
    priority: 'high',
  },
  {
    id: 'generate-report',
    title: 'Generate Report',
    description: 'Weekly performance summary',
    icon: BarChart3,
    color: 'purple',
    action: '/real-estate/analytics',
    priority: 'medium',
  },
  {
    id: 'call-clients',
    title: 'Call Reminder',
    description: '5 clients scheduled for today',
    icon: Phone,
    color: 'green',
    action: '/real-estate/crm/calendar',
    priority: 'medium',
  },
  {
    id: 'send-emails',
    title: 'Email Campaign',
    description: 'Follow-up with 12 leads',
    icon: Mail,
    color: 'blue',
    action: '/real-estate/crm/campaigns',
    priority: 'low',
  },
];

const colorClasses = {
  cyan: {
    bg: 'hover:bg-cyan-500/10',
    border: 'border-cyan-400/30',
    icon: 'bg-cyan-500/20',
    iconColor: 'text-cyan-400',
    text: 'text-cyan-400',
  },
  orange: {
    bg: 'hover:bg-orange-500/10',
    border: 'border-orange-400/30',
    icon: 'bg-orange-500/20',
    iconColor: 'text-orange-400',
    text: 'text-orange-400',
  },
  purple: {
    bg: 'hover:bg-purple-500/10',
    border: 'border-purple-400/30',
    icon: 'bg-purple-500/20',
    iconColor: 'text-purple-400',
    text: 'text-purple-400',
  },
  green: {
    bg: 'hover:bg-green-500/10',
    border: 'border-green-400/30',
    icon: 'bg-green-500/20',
    iconColor: 'text-green-400',
    text: 'text-green-400',
  },
  blue: {
    bg: 'hover:bg-blue-500/10',
    border: 'border-blue-400/30',
    icon: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
    text: 'text-blue-400',
  },
};

export function SmartSuggestionsWidget({ organizationId }: SmartSuggestionsWidgetProps) {
  const handleActionClick = (action: string) => {
    // Will be replaced with actual navigation in Phase 5
    console.log('Navigating to:', action);
  };

  return (
    <div className="glass-strong rounded-2xl p-6 widget-hover h-full neon-border-orange">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
          className="w-2 h-2 rounded-full bg-orange-400"
        />
        Smart Actions
        <span className="ml-auto text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-400">
          {smartActions.filter((a) => a.priority === 'high').length} urgent
        </span>
      </h3>

      {/* Actions List */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
        {smartActions.map((action, index) => {
          const Icon = action.icon;
          const colors = colorClasses[action.color as keyof typeof colorClasses];

          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="ghost"
                onClick={() => handleActionClick(action.action)}
                className={`w-full p-4 rounded-lg glass ${colors.bg} ${colors.border} border transition-all group text-left justify-start h-auto`}
              >
                <div className="flex items-center gap-3 w-full">
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`w-10 h-10 rounded-lg ${colors.icon} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <Icon className={`w-5 h-5 ${colors.iconColor}`} />
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${colors.text}`}>{action.title}</p>
                      {action.priority === 'high' && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {action.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  <ChevronRight
                    className={`w-5 h-5 ${colors.iconColor} group-hover:translate-x-1 transition-transform`}
                  />
                </div>
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Actions completed today:</span>
          <div className="flex items-center gap-2">
            <div className="w-16 bg-white/10 rounded-full h-1.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '60%' }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-green-400 to-cyan-400 rounded-full"
              />
            </div>
            <span className="text-white font-medium">8/12</span>
          </div>
        </div>
      </div>
    </div>
  );
}
