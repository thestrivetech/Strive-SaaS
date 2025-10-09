'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import {
  Users,
  UserPlus,
  DollarSign,
  FileText,
  Building,
  Upload,
  Receipt,
  MessageSquare,
  Sparkles,
  ShoppingBag,
  ShoppingCart,
  Plus,
  Clock,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface QuickAction {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  action?: () => void;
  modules: string[];
}

interface RecentAction {
  id: string;
  name: string;
  timestamp: number;
}

/**
 * QuickAddDialog Component
 *
 * Context-aware quick action dialog that shows relevant options
 * based on the current module/location
 *
 * Features:
 * - Module detection from URL
 * - Context-aware action filtering
 * - Recent actions tracking (localStorage)
 * - Keyboard shortcut support (Cmd+Shift+N)
 */
export function QuickAddDialog({ open, onOpenChange }: QuickAddDialogProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [recentActions, setRecentActions] = useState<RecentAction[]>([]);

  // Load recent actions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('quickAddRecent');
    if (stored) {
      try {
        setRecentActions(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recent actions:', e);
      }
    }
  }, []);

  // Detect current module from pathname
  const getCurrentModule = (): string => {
    if (pathname.includes('/crm')) return 'crm';
    if (pathname.includes('/workspace')) return 'workspace';
    if (pathname.includes('/expense-tax')) return 'expense-tax';
    if (pathname.includes('/ai-hub')) return 'ai-hub';
    if (pathname.includes('/marketplace')) return 'marketplace';
    return 'default';
  };

  const currentModule = getCurrentModule();

  // Define all quick actions with their modules
  const allActions: QuickAction[] = [
    {
      id: 'new-contact',
      name: 'New Contact',
      description: 'Add a new contact to CRM',
      icon: Users,
      href: '/real-estate/crm/contacts?new=true',
      modules: ['crm', 'default'],
    },
    {
      id: 'new-lead',
      name: 'New Lead',
      description: 'Create a new lead',
      icon: UserPlus,
      href: '/real-estate/crm/leads?new=true',
      modules: ['crm', 'default'],
    },
    {
      id: 'new-deal',
      name: 'New Deal',
      description: 'Start a new deal',
      icon: DollarSign,
      href: '/real-estate/crm/deals?new=true',
      modules: ['crm', 'default'],
    },
    {
      id: 'new-transaction',
      name: 'New Transaction',
      description: 'Create a transaction loop',
      icon: FileText,
      href: '/real-estate/workspace/workspace-dashboard?new=true',
      modules: ['workspace', 'default'],
    },
    {
      id: 'new-listing',
      name: 'New Listing',
      description: 'Add a property listing',
      icon: Building,
      href: '/real-estate/workspace/listings?new=true',
      modules: ['workspace', 'default'],
    },
    {
      id: 'upload-document',
      name: 'Upload Document',
      description: 'Upload transaction document',
      icon: Upload,
      modules: ['workspace'],
      action: () => {
        toast({
          title: 'Document Upload',
          description: 'Document upload feature coming soon',
        });
      },
    },
    {
      id: 'new-expense',
      name: 'New Expense',
      description: 'Record an expense',
      icon: Receipt,
      href: '/real-estate/expense-tax/expenses?new=true',
      modules: ['expense-tax', 'default'],
    },
    {
      id: 'upload-receipt',
      name: 'Upload Receipt',
      description: 'Upload expense receipt',
      icon: Upload,
      modules: ['expense-tax'],
      action: () => {
        toast({
          title: 'Receipt Upload',
          description: 'Receipt upload feature coming soon',
        });
      },
    },
    {
      id: 'new-conversation',
      name: 'New Conversation',
      description: 'Start AI conversation',
      icon: MessageSquare,
      href: '/real-estate/ai-hub/ai-hub-dashboard?new=true',
      modules: ['ai-hub', 'default'],
    },
    {
      id: 'new-automation',
      name: 'New Automation',
      description: 'Create AI automation',
      icon: Sparkles,
      modules: ['ai-hub'],
      action: () => {
        toast({
          title: 'AI Automation',
          description: 'Automation builder coming soon',
        });
      },
    },
    {
      id: 'browse-tools',
      name: 'Browse Tools',
      description: 'Explore marketplace tools',
      icon: ShoppingBag,
      href: '/real-estate/marketplace/dashboard',
      modules: ['marketplace', 'default'],
    },
    {
      id: 'view-cart',
      name: 'View Cart',
      description: 'Check your cart',
      icon: ShoppingCart,
      modules: ['marketplace'],
      action: () => {
        toast({
          title: 'Shopping Cart',
          description: 'Cart feature coming soon',
        });
      },
    },
  ];

  // Filter actions by current module
  const filteredActions = allActions.filter((action) =>
    action.modules.includes(currentModule)
  );

  // Get module display name
  const getModuleName = (): string => {
    const moduleNames: Record<string, string> = {
      crm: 'CRM',
      workspace: 'Workspace',
      'expense-tax': 'Expense & Tax',
      'ai-hub': 'AI Hub',
      marketplace: 'Marketplace',
      default: 'All Modules',
    };
    return moduleNames[currentModule] || 'Dashboard';
  };

  // Handle action execution
  const handleActionClick = (action: QuickAction) => {
    // Track in recent actions
    const newRecent: RecentAction = {
      id: action.id,
      name: action.name,
      timestamp: Date.now(),
    };

    const updatedRecent = [newRecent, ...recentActions.filter((r) => r.id !== action.id)].slice(
      0,
      3
    );

    setRecentActions(updatedRecent);
    localStorage.setItem('quickAddRecent', JSON.stringify(updatedRecent));

    // Execute action
    if (action.href) {
      router.push(action.href);
      toast({
        title: 'Navigation',
        description: `Opening ${action.name}`,
      });
    } else if (action.action) {
      action.action();
    }

    // Close dialog
    onOpenChange(false);
  };

  // Get recent actions data
  const getRecentActionsData = (): QuickAction[] => {
    return recentActions
      .map((recent) => allActions.find((action) => action.id === recent.id))
      .filter((action): action is QuickAction => action !== undefined)
      .slice(0, 3);
  };

  const recentActionsData = getRecentActionsData();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl glass-strong neon-border-cyan">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Plus className="w-6 h-6 text-primary" />
            Quick Add
          </DialogTitle>
          <DialogDescription>
            Create new items in <span className="text-primary font-medium">{getModuleName()}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recent Actions */}
          {recentActionsData.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {recentActionsData.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.id}
                      variant="outline"
                      className="h-auto py-3 justify-start hover:bg-primary/10 hover:border-primary transition-all"
                      onClick={() => handleActionClick(action)}
                    >
                      <Icon className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                      <span className="text-sm truncate">{action.name}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available Actions */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Available Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => handleActionClick(action)}
                    className={cn(
                      'p-4 rounded-lg border border-border bg-card hover:bg-primary/5 hover:border-primary transition-all text-left group',
                      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground mb-1">{action.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Keyboard Shortcut Hint */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Tip: Use <kbd className="px-2 py-1 rounded bg-muted text-muted-foreground">⌘⇧N</kbd>{' '}
              to open Quick Add anytime
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
