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
} from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  const { isOpen, close, query, setQuery, results, loading } = useCommandBar();
  const router = useRouter();

  const handleSelect = (action: string) => {
    close();

    // Handle navigation
    if (action.startsWith('/')) {
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
        console.log('Action not implemented:', action);
    }
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
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-2xl p-0 glass-strong neon-border-cyan overflow-hidden" aria-label="Command palette">
        <Command shouldFilter={false} className="bg-transparent" role="dialog">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
            <Search className="w-5 h-5 text-primary" aria-hidden="true" />
            <CommandInput
              placeholder="Search modules, actions, or type a command..."
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

            {!loading && query && results.length === 0 && (
              <CommandEmpty>No results found for &quot;{query}&quot;</CommandEmpty>
            )}

            {!loading && query && results.length > 0 && (
              <CommandGroup heading="Search Results">
                {results.map((result) => {
                  const Icon = iconMap[result.icon || 'Search'] || Search;
                  return (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleSelect(result.action)}
                      className="flex items-center justify-between p-3 hover:bg-primary/10 cursor-pointer"
                      aria-label={`${result.title}: ${result.description}`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{result.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {result.description}
                          </p>
                        </div>
                      </div>
                      {result.shortcut && (
                        <kbd className="px-2 py-1 text-xs rounded bg-muted/50 text-muted-foreground">
                          {result.shortcut}
                        </kbd>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}

            {!query && (
              <>
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
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
