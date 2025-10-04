import { useCommandBar } from "@/hooks/use-command-bar";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export function CommandBar() {
  const { isOpen, close, query, setQuery, results, loading } = useCommandBar();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSelect = (action: string) => {
    close();
    
    // Handle navigation
    if (action.startsWith('/')) {
      setLocation(action);
      return;
    }
    
    // Handle quick actions
    switch (action) {
      case 'create-lead':
        toast({
          title: "Create Lead",
          description: "Lead creation form would open here",
        });
        break;
      case 'create-deal':
        toast({
          title: "Create Deal",
          description: "Deal creation form would open here",
        });
        break;
      default:
        console.log("Action not implemented:", action);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-2xl p-0 glass-strong neon-border-cyan">
        <Command shouldFilter={false}>
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search className="w-5 h-5 text-primary" />
            <CommandInput
              placeholder="Search modules, records, or ask a question..."
              value={query}
              onValueChange={setQuery}
              className="border-none bg-transparent placeholder:text-muted-foreground"
            />
            <kbd className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">
              ESC
            </kbd>
          </div>
          
          <CommandList className="max-h-96">
            {loading && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
            
            {!loading && results.length === 0 && query && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
            
            {!loading && results.map((result: any) => (
              <CommandItem
                key={result.id}
                onSelect={() => handleSelect(result.action)}
                className="flex items-center justify-between p-3 hover:bg-primary/10 cursor-pointer"
              >
                <div>
                  <span className="text-sm font-medium">{result.title}</span>
                  <p className="text-xs text-muted-foreground">{result.description}</p>
                </div>
                {result.shortcut && (
                  <kbd className="text-xs text-muted-foreground">
                    {result.shortcut}
                  </kbd>
                )}
              </CommandItem>
            ))}
            
            {!query && (
              <div className="p-4 space-y-2">
                <p className="text-sm text-muted-foreground mb-3">Quick actions:</p>
                <CommandItem onSelect={() => handleSelect("create-lead")} className="hover:bg-primary/10" data-testid="command-quick-create-lead">
                  <span>Create New Lead</span>
                  <kbd className="ml-auto text-xs text-muted-foreground">⌘N</kbd>
                </CommandItem>
                <CommandItem onSelect={() => handleSelect("create-deal")} className="hover:bg-primary/10" data-testid="command-quick-create-deal">
                  <span>Create New Deal</span>
                </CommandItem>
                <CommandItem onSelect={() => handleSelect("/dashboard")} className="hover:bg-primary/10" data-testid="command-quick-dashboard">
                  <span>Go to Dashboard</span>
                  <kbd className="ml-auto text-xs text-muted-foreground">⌘H</kbd>
                </CommandItem>
              </div>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
