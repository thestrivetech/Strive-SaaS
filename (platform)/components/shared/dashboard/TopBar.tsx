'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Moon, Sun, Bell, Menu, Check, Trash2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/use-theme';
import type { UserWithOrganization } from '@/lib/auth/user-helpers';
import { UserMenu } from '@/components/shared/navigation/user-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  action_url?: string;
}

interface TopBarProps {
  user: UserWithOrganization;
  onMenuToggle?: () => void;
  onCommandBarOpen?: () => void;
}

export function TopBar({ user, onMenuToggle, onCommandBarOpen }: TopBarProps) {
  const { theme, setTheme, resolvedTheme, mounted } = useTheme();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Mock notifications data (TODO: Replace with real data when database is ready)
  const [mockNotifications, setMockNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New lead assigned',
      message: 'John Doe has been assigned to you',
      time: '5 minutes ago',
      read: false,
      type: 'INFO',
      action_url: '/real-estate/crm/leads',
    },
    {
      id: '2',
      title: 'Transaction update',
      message: 'Property at 123 Main St closing date changed',
      time: '1 hour ago',
      read: false,
      type: 'WARNING',
      action_url: '/real-estate/workspace',
    },
    {
      id: '3',
      title: 'Welcome to Strive',
      message: 'Complete your profile to get started',
      time: '2 days ago',
      read: true,
      type: 'SUCCESS',
      action_url: '/settings/profile',
    },
  ]);

  const unreadCount = mockNotifications.filter((n) => !n.read).length;

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

  const handleMarkAsRead = (notificationId: string) => {
    setMockNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setMockNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (notificationId: string) => {
    setMockNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return '✅';
      case 'WARNING':
        return '⚠️';
      case 'ERROR':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return 'text-green-600';
      case 'WARNING':
        return 'text-yellow-600';
      case 'ERROR':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
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

          {/* Notifications Dropdown */}
          <DropdownMenu open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="glass hover:bg-muted/30 relative"
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-1 -right-1 w-5 h-5 bg-chart-3 text-background rounded-full flex items-center justify-center text-xs font-bold neon-green p-0"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {mockNotifications.length > 0 && unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 text-xs"
                    onClick={handleMarkAllAsRead}
                  >
                    Mark all read
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <ScrollArea className="h-[400px]">
                {mockNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Bell className="h-12 w-12 text-muted-foreground opacity-50 mb-2" />
                    <p className="text-sm text-muted-foreground">No notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {mockNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`group relative p-3 hover:bg-accent cursor-pointer ${
                          !notification.read ? 'bg-accent/50' : ''
                        }`}
                        onClick={() => {
                          if (!notification.read) {
                            handleMarkAsRead(notification.id);
                          }
                          if (notification.action_url) {
                            setIsNotificationsOpen(false);
                            window.location.href = notification.action_url;
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-xl">{getTypeIcon(notification.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm font-medium ${getTypeColor(notification.type)}`}>
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-muted-foreground">
                                {notification.time}
                              </span>
                              {notification.action_url && (
                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions (visible on hover) */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notification.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {mockNotifications.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        window.location.href = '/settings';
                      }}
                    >
                      View all notifications
                    </Button>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile Dropdown */}
          <div className="pl-3 border-l border-border">
            <UserMenu user={user} />
          </div>
        </div>
      </div>
    </header>
  );
}
