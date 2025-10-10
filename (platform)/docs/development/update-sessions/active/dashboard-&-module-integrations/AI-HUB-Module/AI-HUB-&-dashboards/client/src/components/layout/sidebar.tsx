import { Link, useLocation } from "wouter";
import { Brain, LayoutDashboard, Workflow, Bot, Users, Store, BarChart3, Plug, Plus, Settings, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Workflows", href: "/workflows", icon: Workflow },
  { name: "AI Agents", href: "/agents", icon: Bot },
  { name: "Teams", href: "/teams", icon: Users },
  { name: "Marketplace", href: "/marketplace", icon: Store },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Integrations", href: "/integrations", icon: Plug },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 glass-panel border-r border-border/50 flex flex-col" data-testid="sidebar">
      {/* Logo & Brand */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Brain className="text-primary-foreground text-xl" />
          </div>
          <div>
            <h1 className="text-lg font-bold neon-text" data-testid="app-title">NeuroFlow</h1>
            <p className="text-xs text-muted-foreground">AI Automation Hub</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin" data-testid="navigation">
        {navigation.map((item) => {
          const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary border border-primary/30" 
                  : "text-foreground/80 hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground px-3 mb-2 font-semibold uppercase tracking-wider">Quick Actions</p>
          <Link 
            href="/workflows/new" 
            data-testid="button-new-workflow"
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            <span>New Workflow</span>
          </Link>
          <Link 
            href="/agents/new" 
            data-testid="button-create-agent"
            className="w-full flex items-center space-x-3 px-3 py-2 mt-2 rounded-lg border border-border hover:bg-muted transition-colors text-foreground/80"
          >
            <Bot className="w-4 h-4" />
            <span>Create Agent</span>
          </Link>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer" data-testid="user-profile">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-green to-neon-violet flex items-center justify-center text-sm font-bold">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="user-name">John Doe</p>
            <p className="text-xs text-muted-foreground">Enterprise Plan</p>
          </div>
          <Settings className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </aside>
  );
}
