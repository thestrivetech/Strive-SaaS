'use client';

import { useCommandBar } from '@/hooks/use-command-bar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Search,
  Loader2,
  Users,
  FileText,
  TrendingUp,
  Home,
  DollarSign,
  Bot,
  BarChart,
  Calculator,
  Megaphone,
  ShoppingBag,
  UserPlus,
  Plus,
  HelpCircle,
  Building,
  Receipt,
  Calendar,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

/**
 * CommandBar Component
 *
 * Global command bar with ⌘K shortcut
 * Provides quick navigation and actions
 *
 * Features:
 * - Keyboard shortcuts (⌘K to open, ESC to close)
 * - Debounced search
 * - Quick actions
 * - Navigation shortcuts
 * - Glass morphism design
 */
export function CommandBar() {
  const { isOpen, close, query, setQuery, loading } = useCommandBar();
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);
  const [recentPages, setRecentPages] = useState<string[]>([]);

  // Load recent pages from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentPages');
    if (stored) {
      try {
        setRecentPages(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recent pages:', e);
      }
    }
  }, [isOpen]);

  const handleSelect = (action: string) => {
    // Handle help command
    if (action === 'help') {
      setShowHelp(true);
      return;
    }

    close();

    // Handle navigation
    if (action.startsWith('/')) {
      // Track in recent pages
      addRecentPage(action);
      router.push(action);
      return;
    }

    // Handle quick actions
    switch (action) {
      case 'create-lead':
        router.push('/real-estate/crm/contacts?new=true');
        break;
      case 'create-transaction':
        router.push('/real-estate/workspace?new=true');
        break;
      case 'create-deal':
        router.push('/real-estate/crm/deals?new=true');
        break;
      default:
        // Action not implemented
        break;
    }
  };

  // Add page to recent pages
  const addRecentPage = (path: string) => {
    const updated = [path, ...recentPages.filter((p) => p !== path)].slice(0, 10);
    setRecentPages(updated);
    localStorage.setItem('recentPages', JSON.stringify(updated));
  };

  // Icon mapping
  const iconMap: Record<string, any> = {
    Users,
    FileText,
    TrendingUp,
    Home,
    DollarSign,
    Bot,
    BarChart,
    Calculator,
    Megaphone,
    ShoppingBag,
    UserPlus,
    Plus,
    HelpCircle,
    Building,
    Receipt,
    Calendar,
  };

  // Comprehensive search index
  const searchIndex = [
    // Pages - CRM
    { type: 'page', title: 'CRM Dashboard', path: '/real-estate/crm/crm-dashboard', keywords: ['crm', 'dashboard', 'contacts', 'leads'], icon: 'Users' },
    { type: 'page', title: 'Contacts', path: '/real-estate/crm/contacts', keywords: ['contacts', 'people', 'clients'], icon: 'Users' },
    { type: 'page', title: 'Leads', path: '/real-estate/crm/leads', keywords: ['leads', 'prospects', 'new'], icon: 'UserPlus' },
    { type: 'page', title: 'Deals', path: '/real-estate/crm/deals', keywords: ['deals', 'pipeline', 'sales'], icon: 'DollarSign' },
    { type: 'page', title: 'CRM Calendar', path: '/real-estate/crm/calendar', keywords: ['calendar', 'schedule', 'events'], icon: 'Calendar' },
    { type: 'page', title: 'CRM Analytics', path: '/real-estate/crm/analytics', keywords: ['analytics', 'reports', 'insights'], icon: 'BarChart' },

    // Pages - Workspace
    { type: 'page', title: 'Workspace Dashboard', path: '/real-estate/workspace/workspace-dashboard', keywords: ['workspace', 'transactions', 'loops'], icon: 'FileText' },
    { type: 'page', title: 'Listings', path: '/real-estate/workspace/listings', keywords: ['listings', 'properties', 'homes'], icon: 'Building' },
    { type: 'page', title: 'Workspace Analytics', path: '/real-estate/workspace/analytics', keywords: ['analytics', 'reports', 'metrics'], icon: 'BarChart' },

    // Pages - AI Hub
    { type: 'page', title: 'AI Hub', path: '/real-estate/ai-hub/ai-hub-dashboard', keywords: ['ai', 'assistant', 'automation'], icon: 'Bot' },

    // Pages - REID
    { type: 'page', title: 'REID Dashboard', path: '/real-estate/reid/reid-dashboard', keywords: ['reid', 'intelligence', 'analytics'], icon: 'TrendingUp' },

    // Pages - Expense & Tax
    { type: 'page', title: 'Expense Dashboard', path: '/real-estate/expense-tax/expense-tax-dashboard', keywords: ['expenses', 'tax', 'receipts'], icon: 'Calculator' },
    { type: 'page', title: 'Expenses', path: '/real-estate/expense-tax/expenses', keywords: ['expenses', 'costs', 'spending'], icon: 'Receipt' },

    // Pages - CMS & Marketing
    { type: 'page', title: 'CMS Dashboard', path: '/real-estate/cms-marketing/cms-dashboard', keywords: ['cms', 'content', 'marketing'], icon: 'Megaphone' },

    // Pages - Marketplace
    { type: 'page', title: 'Marketplace', path: '/real-estate/marketplace/dashboard', keywords: ['marketplace', 'tools', 'shop'], icon: 'ShoppingBag' },

    // Actions
    { type: 'action', title: 'Create Contact', path: 'create-contact', keywords: ['new', 'create', 'contact', 'add'], icon: 'UserPlus' },
    { type: 'action', title: 'Create Lead', path: 'create-lead', keywords: ['new', 'create', 'lead', 'prospect'], icon: 'UserPlus' },
    { type: 'action', title: 'Create Deal', path: 'create-deal', keywords: ['new', 'create', 'deal', 'pipeline'], icon: 'DollarSign' },
    { type: 'action', title: 'Create Transaction', path: 'create-transaction', keywords: ['new', 'create', 'transaction', 'loop'], icon: 'Plus' },

    // Help
    { type: 'help', title: 'Keyboard Shortcuts', path: 'help', keywords: ['help', 'shortcuts', 'commands', '?'], icon: 'HelpCircle' },
  ];

  // Filter search index based on query
  const getSearchResults = () => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    return searchIndex
      .filter((item) => {
        const titleMatch = item.title.toLowerCase().includes(lowerQuery);
        const keywordMatch = item.keywords.some((kw) => kw.includes(lowerQuery));
        return titleMatch || keywordMatch;
      })
      .slice(0, 8); // Limit to 8 results
  };

  const searchResults = getSearchResults();

  // Quick actions when no query
  const quickActions = [
    {
      id: 'dashboard',
      title: 'Go to Dashboard',
      description: 'Main dashboard overview',
      action: '/real-estate/user-dashboard',
      icon: 'Home',
      shortcut: '⌘H',
    },
    {
      id: 'crm',
      title: 'Go to CRM',
      description: 'Manage contacts and leads',
      action: '/real-estate/crm/crm-dashboard',
      icon: 'Users',
      shortcut: '⌘1',
    },
    {
      id: 'workspace',
      title: 'Go to Workspace',
      description: 'Manage transactions',
      action: '/real-estate/workspace/workspace-dashboard',
      icon: 'FileText',
      shortcut: '⌘2',
    },
  ];

  const quickCreateActions = [
    {
      id: 'create-lead',
      title: 'Create New Lead',
      description: 'Add a lead to CRM',
      action: 'create-lead',
      icon: 'UserPlus',
    },
    {
      id: 'create-transaction',
      title: 'Create New Transaction',
      description: 'Start a transaction loop',
      action: 'create-transaction',
      icon: 'Plus',
    },
    {
      id: 'create-deal',
      title: 'Create New Deal',
      description: 'Add a deal to pipeline',
      action: 'create-deal',
      icon: 'DollarSign',
    },
  ];

  // Get recent pages data
  const getRecentPagesData = () => {
    return recentPages
      .map((path) => searchIndex.find((item) => item.path === path))
      .filter((item): item is typeof searchIndex[0] => item !== undefined)
      .slice(0, 5);
  };

  const recentPagesData = getRecentPagesData();

  // Help modal
  if (showHelp) {
    return (
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-2xl glass-strong neon-border-cyan">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Keyboard Shortcuts</h2>
              <p className="text-sm text-muted-foreground">
                Navigate faster with these keyboard shortcuts
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Navigation</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                    <span className="text-sm">Open command bar</span>
                    <kbd className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">⌘K</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                    <span className="text-sm">Open quick add</span>
                    <kbd className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">⌘⇧N</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                    <span className="text-sm">Toggle sidebar</span>
                    <kbd className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">⌘B</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                    <span className="text-sm">Focus search</span>
                    <kbd className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">⌘/</kbd>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">General</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                    <span className="text-sm">Close dialogs</span>
                    <kbd className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">ESC</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                    <span className="text-sm">Show this help</span>
                    <kbd className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">?</kbd>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setShowHelp(false)} className="w-full">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-2xl p-0 glass-strong neon-border-cyan overflow-hidden" aria-label="Command palette">
        <Command shouldFilter={false} className="bg-transparent" role="dialog">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
            <Search className="w-5 h-5 text-primary" aria-hidden="true" />
            <CommandInput
              placeholder="Search pages, actions, or type '?' for help..."
              value={query}
              onValueChange={setQuery}
              className="border-none bg-transparent placeholder:text-muted-foreground focus:ring-0"
              aria-label="Search command palette"
            />
            <kbd className="hidden sm:inline-flex px-2 py-1 text-xs rounded bg-muted/50 text-muted-foreground border border-border/50" aria-label="Press Escape to close">
              ESC
            </kbd>
          </div>

          <CommandList className="max-h-[400px] overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}

            {!loading && query && searchResults.length === 0 && (
              <CommandEmpty>No results found for &quot;{query}&quot;</CommandEmpty>
            )}

            {!loading && query && searchResults.length > 0 && (
              <CommandGroup heading="Search Results">
                {searchResults.map((result, index) => {
                  const Icon = iconMap[result.icon || 'Search'] || Search;
                  return (
                    <CommandItem
                      key={`${result.path}-${index}`}
                      onSelect={() => handleSelect(result.path)}
                      className="flex items-center justify-between p-3 hover:bg-primary/10 cursor-pointer"
                      aria-label={result.title}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{result.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {result.type}
                          </p>
                        </div>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}

            {!query && (
              <>
                {recentPagesData.length > 0 && (
                  <>
                    <CommandGroup heading="Recent Pages">
                      {recentPagesData.map((page, index) => {
                        const Icon = iconMap[page.icon] || Home;
                        return (
                          <CommandItem
                            key={`${page.path}-${index}`}
                            onSelect={() => handleSelect(page.path)}
                            className="flex items-center gap-3 p-3 hover:bg-primary/10 cursor-pointer"
                          >
                            <Icon className="w-5 h-5 text-primary" />
                            <div>
                              <p className="text-sm font-medium">{page.title}</p>
                              <p className="text-xs text-muted-foreground capitalize">{page.type}</p>
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                    <CommandSeparator />
                  </>
                )}

                <CommandGroup heading="Quick Actions">
                  {quickActions.map((action) => {
                    const Icon = iconMap[action.icon] || Home;
                    return (
                      <CommandItem
                        key={action.id}
                        onSelect={() => handleSelect(action.action)}
                        className="flex items-center justify-between p-3 hover:bg-primary/10 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium">{action.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {action.description}
                            </p>
                          </div>
                        </div>
                        {action.shortcut && (
                          <kbd className="px-2 py-1 text-xs rounded bg-muted/50 text-muted-foreground">
                            {action.shortcut}
                          </kbd>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Create">
                  {quickCreateActions.map((action) => {
                    const Icon = iconMap[action.icon] || Plus;
                    return (
                      <CommandItem
                        key={action.id}
                        onSelect={() => handleSelect(action.action)}
                        className="flex items-center gap-3 p-3 hover:bg-primary/10 cursor-pointer"
                      >
                        <Icon className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{action.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Help">
                  <CommandItem
                    onSelect={() => handleSelect('help')}
                    className="flex items-center gap-3 p-3 hover:bg-primary/10 cursor-pointer"
                  >
                    <HelpCircle className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Keyboard Shortcuts</p>
                      <p className="text-xs text-muted-foreground">
                        View all available shortcuts
                      </p>
                    </div>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

