import { Search, Bell, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Header() {
  return (
    <header className="glass-panel border-b border-border/50 px-8 py-4" data-testid="header">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold" data-testid="page-title">Mission Control</h2>
          <Badge variant="outline" className="px-3 py-1 bg-neon-green/20 text-neon-green border-neon-green/30" data-testid="system-status">
            <div className="w-2 h-2 bg-neon-green rounded-full mr-1 status-pulse"></div>
            All Systems Active
          </Badge>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Input 
              type="search" 
              placeholder="Search workflows, agents..." 
              className="w-80 pl-4 pr-10 bg-muted border-border focus:border-primary focus:ring-primary/20"
              data-testid="search-input"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
          <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
            <Bell className="w-4 h-4" />
            <div className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></div>
          </Button>
          <Button variant="ghost" size="icon" data-testid="button-settings">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
