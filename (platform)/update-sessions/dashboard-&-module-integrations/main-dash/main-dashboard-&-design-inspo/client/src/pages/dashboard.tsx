import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ParticleBackground } from "@/components/dashboard/ParticleBackground";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { CommandBar } from "@/components/dashboard/CommandBar";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";
import { useCommandBar } from "@/hooks/use-command-bar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Mic, 
  Moon, 
  Bell, 
  Menu,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { open: openCommandBar } = useCommandBar();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications] = useState(3); // Mock notification count

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <ParticleBackground />
      <CommandBar />
      
      {/* Sidebar */}
      <AnimatePresence>
        {(!isMobile || sidebarOpen) && (
          <>
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            <motion.div
              initial={isMobile ? { x: -288 } : false}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              className={`${isMobile ? 'fixed z-40' : 'fixed'}`}
            >
              <Sidebar />
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`relative z-10 ${isMobile ? '' : 'ml-72'}`} data-testid="main-dashboard">
        {/* Top Bar */}
        <header className="glass border-b border-border p-4" data-testid="top-bar">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(true)}
                  className="text-muted-foreground hover:text-foreground"
                  data-testid="sidebar-toggle"
                >
                  <Menu className="w-6 h-6" />
                </Button>
              )}

              {/* Search Bar */}
              <Button
                variant="ghost"
                onClick={openCommandBar}
                className="flex items-center gap-3 px-4 py-2 rounded-lg glass hover:bg-muted/30 transition-colors min-w-64"
                data-testid="command-trigger"
              >
                <Search className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">Search or ask...</span>
                <kbd className="ml-auto px-2 py-1 text-xs rounded bg-muted text-muted-foreground">
                  ⌘K
                </kbd>
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {/* Voice Command */}
              <Button
                variant="ghost"
                size="icon"
                className="glass hover:bg-primary/10 neon-cyan"
                data-testid="voice-command"
              >
                <Mic className="w-5 h-5 text-primary" />
              </Button>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="glass hover:bg-muted/30"
                data-testid="theme-toggle"
              >
                <Moon className="w-5 h-5" />
              </Button>

              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="glass hover:bg-muted/30"
                  data-testid="notifications-button"
                >
                  <Bell className="w-5 h-5" />
                </Button>
                {notifications > 0 && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-xs font-bold neon-green"
                    data-testid="notification-badge"
                  >
                    {notifications}
                  </Badge>
                )}
              </div>

              {/* User Profile */}
              <div className="flex items-center gap-3 pl-3 border-l border-border">
                <div className="text-right hidden md:block">
                  <div className="text-sm font-medium" data-testid="user-name">
                    Alex Morgan
                  </div>
                  <div className="text-xs text-muted-foreground">Admin</div>
                </div>
                <div
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold cursor-pointer"
                  data-testid="user-avatar"
                >
                  AM
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <HeroSection />
          <DashboardGrid />
        </motion.div>
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileBottomNav />}
    </div>
  );
}
