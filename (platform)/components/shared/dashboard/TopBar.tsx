'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Mic, Moon, Sun, Bell, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/use-theme';
import type { UserWithOrganization } from '@/lib/auth/user-helpers';

interface TopBarProps {
  user: UserWithOrganization;
  notifications?: number;
  onMenuToggle?: () => void;
  onCommandBarOpen?: () => void;
}

export function TopBar({ user, notifications = 0, onMenuToggle, onCommandBarOpen }: TopBarProps) {
  const { theme, setTheme, resolvedTheme, mounted } = useTheme();

  const handleCommandBarOpen = () => {
    // Trigger command bar via callback or keyboard event
    if (onCommandBarOpen) {
      onCommandBarOpen();
    } else {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true,
        ctrlKey: true,
      });
      window.dispatchEvent(event);
    }
  };

  const handleVoiceCommand = () => {
    // Voice command placeholder (to be connected later)
    console.log('Voice command triggered');
  };

  const handleThemeToggle = () => {
    // Cycle through themes: light -> dark -> system -> light
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const handleNotifications = () => {
    // Notifications panel (to be implemented)
    console.log('Notifications opened');
  };

  const getUserInitials = (name: string | null) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="glass border-b border-border p-4 sticky top-0 z-20">
      <div className="flex items-center justify-between max-w-full">
        {/* Left Section - Search Bar */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Mobile Menu Toggle */}
          {onMenuToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuToggle}
              className="text-muted-foreground hover:text-foreground lg:hidden"
              aria-label="Toggle mobile menu"
              title="Open menu"
            >
              <Menu className="w-6 h-6" />
            </Button>
          )}

          {/* Command Bar Trigger */}
          <Button
            variant="ghost"
            onClick={handleCommandBarOpen}
            className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-lg glass hover:bg-muted/30 transition-colors min-w-[200px] lg:min-w-[300px]"
            aria-label="Open command palette"
            title="Search or ask (⌘K)"
          >
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground text-sm truncate">
              Search or ask...
            </span>
            <kbd className="ml-auto px-2 py-1 text-xs rounded bg-muted text-muted-foreground hidden md:inline-block">
              ⌘K
            </kbd>
          </Button>

          {/* Mobile Search Icon */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCommandBarOpen}
            className="sm:hidden glass"
            aria-label="Open search"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </Button>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Voice Command Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleVoiceCommand}
            className="glass hover:bg-primary/10 neon-cyan hidden sm:flex"
            aria-label="Activate voice command"
            title="Voice Command"
          >
            <Mic className="w-5 h-5 text-primary" />
          </Button>

          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleThemeToggle}
            className="glass hover:bg-muted/30 hidden sm:flex relative"
            title={`Current theme: ${theme} (Click to change)`}
            aria-label={`Toggle theme. Current: ${theme}`}
          >
            <AnimatePresence mode="wait">
              {mounted && (
                <motion.div
                  key={resolvedTheme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {resolvedTheme === 'dark' ? (
                    <Moon className="w-5 h-5 text-chart-2" />
                  ) : (
                    <Sun className="w-5 h-5 text-chart-1" />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          {/* Notifications Button */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNotifications}
              className="glass hover:bg-muted/30"
              aria-label={`Notifications${notifications > 0 ? ` (${notifications} unread)` : ''}`}
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
            </Button>
            {notifications > 0 && (
              <Badge
                variant="secondary"
                className="absolute -top-1 -right-1 w-5 h-5 bg-chart-3 text-background rounded-full flex items-center justify-center text-xs font-bold neon-green p-0"
              >
                {notifications > 9 ? '9+' : notifications}
              </Badge>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-border">
            <div className="text-right hidden md:block">
              <div className="text-sm font-medium truncate max-w-[150px]">
                {user.name || 'User'}
              </div>
              <div className="text-xs text-muted-foreground">Admin</div>
            </div>
            <div
              className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-chart-3 flex items-center justify-center font-bold cursor-pointer hover:opacity-80 transition-opacity"
              title={user.name || 'User Profile'}
            >
              {getUserInitials(user.name)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
