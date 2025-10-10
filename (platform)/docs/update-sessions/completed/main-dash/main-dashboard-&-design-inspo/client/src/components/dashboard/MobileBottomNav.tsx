import { motion } from "framer-motion";
import { Home, BarChart3, Plus, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  id: string;
  icon: any;
  label: string;
  active?: boolean;
}

const navItems: NavItem[] = [
  { id: "home", icon: Home, label: "Home", active: true },
  { id: "analytics", icon: BarChart3, label: "Analytics" },
  { id: "add", icon: Plus, label: "Add" },
  { id: "alerts", icon: Bell, label: "Alerts" },
  { id: "settings", icon: Settings, label: "Settings" },
];

export function MobileBottomNav() {
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-border p-4 md:hidden"
      data-testid="mobile-bottom-nav"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              variant="ghost"
              className={`flex flex-col items-center gap-1 p-2 ${
                item.active ? "text-primary" : "text-muted-foreground"
              }`}
              data-testid={`mobile-nav-${item.id}`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs">{item.label}</span>
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.nav>
  );
}
