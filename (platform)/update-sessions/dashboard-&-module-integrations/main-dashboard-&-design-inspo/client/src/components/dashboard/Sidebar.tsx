import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Home, 
  Users, 
  FileText, 
  TrendingUp, 
  DollarSign, 
  Lightbulb,
  ChevronDown,
  Plus,
  BarChart3,
  Calendar,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface NavItem {
  id: string;
  title: string;
  icon: any;
  active?: boolean;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  { id: "dashboard", title: "Dashboard", icon: Home, active: true },
  {
    id: "crm",
    title: "CRM",
    icon: Users,
    children: [
      { id: "leads", title: "Leads", icon: Users },
      { id: "contacts", title: "Contacts", icon: Users },
      { id: "deals", title: "Deals", icon: FileText },
    ],
  },
  { id: "transactions", title: "Transactions", icon: FileText },
  { id: "marketing", title: "Marketing", icon: TrendingUp },
  { id: "finance", title: "Finance", icon: DollarSign },
  { id: "intelligence", title: "Intelligence", icon: Lightbulb },
];

const favoriteActions = [
  { id: "add", icon: Plus, color: "primary" },
  { id: "analytics", icon: BarChart3, color: "secondary" },
  { id: "calendar", icon: Calendar, color: "accent" },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openItems, setOpenItems] = useState<string[]>(["crm"]);

  const toggleItem = (itemId: string) => {
    setOpenItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <motion.aside
      initial={{ x: -288 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 h-full w-72 glass-strong border-r border-border z-40"
    >
      <div className="p-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center neon-cyan">
            <span className="text-xl font-bold">R</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Replit
          </span>
        </motion.div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navigationItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {item.children ? (
                <Collapsible
                  open={openItems.includes(item.id)}
                  onOpenChange={() => toggleItem(item.id)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between hover:bg-muted/30 hover:neon-border-primary"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-muted-foreground" />
                        <span className="text-muted-foreground">{item.title}</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground transition-transform ${
                          openItems.includes(item.id) ? "rotate-180" : ""
                        }`}
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="ml-8 mt-2 space-y-1">
                      {item.children.map((child) => (
                        <Button
                          key={child.id}
                          variant="ghost"
                          className="w-full justify-start text-sm hover:bg-muted/30"
                        >
                          <child.icon className="w-4 h-4 mr-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{child.title}</span>
                        </Button>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${
                    item.active
                      ? "neon-border-cyan bg-primary/10 text-primary"
                      : "hover:bg-muted/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${item.active ? "text-primary" : "text-muted-foreground"}`} />
                  <span>{item.title}</span>
                </Button>
              )}
            </motion.div>
          ))}
        </nav>

        {/* Favorites Dock */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 pt-6 border-t border-border"
        >
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Favorites
          </h3>
          <div className="flex gap-2">
            {favoriteActions.map((action, index) => (
              <motion.button
                key={action.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-10 h-10 rounded-lg glass flex items-center justify-center cursor-pointer transition-all ${
                  action.color === "primary"
                    ? "neon-border-cyan hover:bg-primary/10"
                    : action.color === "secondary"
                    ? "neon-border-green hover:bg-secondary/10"
                    : "neon-border-purple hover:bg-accent/10"
                }`}
                data-testid={`favorite-${action.id}`}
              >
                <action.icon
                  className={`w-5 h-5 ${
                    action.color === "primary"
                      ? "text-primary"
                      : action.color === "secondary"
                      ? "text-secondary"
                      : "text-accent"
                  }`}
                />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.aside>
  );
}
