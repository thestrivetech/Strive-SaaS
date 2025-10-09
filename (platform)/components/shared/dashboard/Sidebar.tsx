'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  FileText,
  TrendingUp,
  DollarSign,
  Bot,
  Calculator,
  Megaphone,
  ShoppingBag,
  ChevronDown,
  Plus,
  Calendar,
  Settings,
  X,
  Building,
  MapPin,
  School,
  AlertTriangle,
  BarChart3,
  Sparkles,
  FileEdit,
  Receipt,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { QuickAddDialog } from './QuickAddDialog';
import { MiniCalendar } from './MiniCalendar';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  id: string;
  title: string;
  icon: any;
  href?: string;
  badge?: string;
  children?: NavItem[];
}

/**
 * Sidebar Component - Main navigation with collapsible menus, favorites dock, and glass morphism design
 */
export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const toggleItem = (itemId: string) => {
    setOpenItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const navigationItems: NavItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: Home,
      href: '/real-estate/user-dashboard',
    },
    {
      id: 'crm',
      title: 'CRM',
      icon: Users,
      children: [
        {
          id: 'crm-dashboard',
          title: 'Dashboard',
          icon: Home,
          href: '/real-estate/crm/crm-dashboard',
        },
        {
          id: 'leads',
          title: 'Leads',
          icon: Users,
          href: '/real-estate/crm/leads',
        },
        {
          id: 'contacts',
          title: 'Contacts',
          icon: Users,
          href: '/real-estate/crm/contacts',
        },
        {
          id: 'deals',
          title: 'Deals',
          icon: DollarSign,
          href: '/real-estate/crm/deals',
        },
        {
          id: 'calendar',
          title: 'Calendar',
          icon: Calendar,
          href: '/real-estate/crm/calendar',
        },
        {
          id: 'crm-analytics',
          title: 'Analytics',
          icon: BarChart3,
          href: '/real-estate/crm/analytics',
        },
      ],
    },
    {
      id: 'workspace',
      title: 'Workspace',
      icon: FileText,
      children: [
        {
          id: 'workspace-dashboard',
          title: 'Dashboard',
          icon: Home,
          href: '/real-estate/workspace/workspace-dashboard',
        },
        {
          id: 'listings',
          title: 'Listings',
          icon: Building,
          href: '/real-estate/workspace/listings',
        },
        {
          id: 'workspace-analytics',
          title: 'Analytics',
          icon: BarChart3,
          href: '/real-estate/workspace/analytics',
        },
      ],
    },
    {
      id: 'ai-hub',
      title: 'AI Hub',
      icon: Bot,
      href: '/real-estate/ai-hub/ai-hub-dashboard',
    },
    {
      id: 'reid',
      title: 'REID Intelligence',
      icon: TrendingUp,
      badge: 'ELITE',
      children: [
        {
          id: 'reid-dashboard',
          title: 'Dashboard',
          icon: Home,
          href: '/real-estate/reid/reid-dashboard',
        },
        {
          id: 'trends',
          title: 'Trends',
          icon: TrendingUp,
          href: '/real-estate/reid/trends',
        },
        {
          id: 'demographics',
          title: 'Demographics',
          icon: MapPin,
          href: '/real-estate/reid/demographics',
        },
        {
          id: 'schools',
          title: 'Schools',
          icon: School,
          href: '/real-estate/reid/schools',
        },
        {
          id: 'heatmap',
          title: 'Heatmap',
          icon: MapPin,
          href: '/real-estate/reid/heatmap',
        },
        {
          id: 'roi',
          title: 'ROI',
          icon: DollarSign,
          href: '/real-estate/reid/roi',
        },
        {
          id: 'alerts',
          title: 'Alerts',
          icon: AlertTriangle,
          href: '/real-estate/reid/alerts',
        },
        {
          id: 'reports',
          title: 'Reports',
          icon: FileText,
          href: '/real-estate/reid/reports',
        },
        {
          id: 'ai-profiles',
          title: 'AI Profiles',
          icon: Sparkles,
          href: '/real-estate/reid/ai-profiles',
        },
      ],
    },
    {
      id: 'expense-tax',
      title: 'Expense & Tax',
      icon: Calculator,
      children: [
        {
          id: 'expense-tax-dashboard',
          title: 'Dashboard',
          icon: Home,
          href: '/real-estate/expense-tax/expense-tax-dashboard',
        },
        {
          id: 'expenses',
          title: 'Expenses',
          icon: Receipt,
          href: '/real-estate/expense-tax/expenses',
        },
        {
          id: 'tax-estimates',
          title: 'Tax Estimates',
          icon: Calculator,
          href: '/real-estate/expense-tax/tax-estimates',
        },
        {
          id: 'expense-reports',
          title: 'Reports',
          icon: FileText,
          href: '/real-estate/expense-tax/reports',
        },
      ],
    },
    {
      id: 'content-pilot',
      title: 'ContentPilot-CMS',
      icon: Megaphone,
      children: [
        {
          id: 'cms-dashboard',
          title: 'Dashboard',
          icon: Home,
          href: '/real-estate/cms-marketing/cms-dashboard',
        },
        {
          id: 'content',
          title: 'Content',
          icon: FileEdit,
          href: '/real-estate/cms-marketing/content',
        },
        {
          id: 'cms-analytics',
          title: 'Analytics',
          icon: BarChart3,
          href: '/real-estate/cms-marketing/analytics',
        },
      ],
    },
    {
      id: 'marketplace',
      title: 'Marketplace',
      icon: ShoppingBag,
      href: '/real-estate/marketplace/dashboard',
    },
  ];

  const isActiveRoute = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-72 glass-strong border-r border-border z-50 transition-transform duration-300',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-chart-3 flex items-center justify-center neon-cyan">
                  <span className="text-xl font-bold text-background">S</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-chart-3 bg-clip-text text-transparent">
                  Strive
                </span>
              </div>
              {/* Mobile Close Button */}
              {onClose && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="lg:hidden"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2" aria-label="Main navigation">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);

              if (item.children) {
                return (
                  <Collapsible
                    key={item.id}
                    open={openItems.includes(item.id)}
                    onOpenChange={() => toggleItem(item.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          'w-full justify-between hover:bg-muted/30',
                          isActive && 'neon-border-primary bg-primary/10'
                        )}
                        aria-label={`${item.title} menu, ${openItems.includes(item.id) ? 'expanded' : 'collapsed'}`}
                        aria-expanded={openItems.includes(item.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={cn(
                              'w-5 h-5',
                              isActive ? 'text-primary' : 'text-muted-foreground'
                            )}
                          />
                          <span
                            className={cn(
                              isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                            )}
                          >
                            {item.title}
                          </span>
                        </div>
                        <ChevronDown
                          className={cn(
                            'w-4 h-4 text-muted-foreground transition-transform',
                            openItems.includes(item.id) && 'rotate-180'
                          )}
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-8 mt-2 space-y-1">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          const childActive = isActiveRoute(child.href);
                          return (
                            <Link key={child.id} href={child.href || '#'}>
                              <Button
                                variant="ghost"
                                className={cn(
                                  'w-full justify-start text-sm hover:bg-muted/30',
                                  childActive && 'neon-border-cyan bg-primary/10 text-primary'
                                )}
                                aria-label={child.title}
                                aria-current={childActive ? 'page' : undefined}
                              >
                                <ChildIcon className="w-4 h-4 mr-3" aria-hidden="true" />
                                <span>{child.title}</span>
                              </Button>
                            </Link>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              }

              return (
                <Link key={item.id} href={item.href || '#'}>
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full justify-start hover:bg-muted/30',
                      isActive && 'neon-border-cyan bg-primary/10'
                    )}
                    aria-label={item.title}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon
                      className={cn(
                        'w-5 h-5 mr-3',
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      )}
                      aria-hidden="true"
                    />
                    <span
                      className={cn(
                        'flex-1 text-left',
                        isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                      )}
                    >
                      {item.title}
                    </span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Favorites Dock */}
          <div className="p-4 border-t border-border">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Favorites
            </h3>
            <div className="flex gap-2">
              {/* Quick Add Button */}
              <button
                onClick={() => setQuickAddOpen(true)}
                className={cn(
                  'flex-1 h-10 rounded-lg glass flex items-center justify-center cursor-pointer transition-all hover:scale-105',
                  'neon-border-cyan hover:bg-primary/10'
                )}
                title="Quick Add"
                aria-label="Open quick add dialog"
              >
                <Plus className="w-5 h-5 text-primary" />
              </button>

              {/* Calendar Popover */}
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      'flex-1 h-10 rounded-lg glass flex items-center justify-center cursor-pointer transition-all hover:scale-105',
                      'neon-border-green hover:bg-secondary/10'
                    )}
                    title="Calendar"
                    aria-label="Open calendar"
                  >
                    <Calendar className="w-5 h-5 text-secondary" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end" side="top">
                  <MiniCalendar />
                </PopoverContent>
              </Popover>

              {/* Settings Button */}
              <Link href="/settings">
                <button
                  className={cn(
                    'flex-1 h-10 rounded-lg glass flex items-center justify-center cursor-pointer transition-all hover:scale-105',
                    'neon-border-purple hover:bg-accent/10'
                  )}
                  title="Settings"
                  aria-label="Go to settings"
                >
                  <Settings className="w-5 h-5 text-accent" />
                </button>
              </Link>
            </div>
          </div>

          {/* Quick Add Dialog */}
          <QuickAddDialog open={quickAddOpen} onOpenChange={setQuickAddOpen} />
        </div>
      </aside>
    </>
  );
}
