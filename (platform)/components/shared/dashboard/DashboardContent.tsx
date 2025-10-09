'use client';

import { useState } from 'react';
import { ParticleBackground } from '@/components/shared/dashboard/ParticleBackground';
import { HeroSection } from '@/components/shared/dashboard/HeroSection';
import { TopBar } from '@/components/shared/dashboard/TopBar';
import { Sidebar } from '@/components/shared/dashboard/Sidebar';
import { CommandBar } from '@/components/shared/dashboard/CommandBar';
import { MobileBottomNav } from '@/components/shared/dashboard/MobileBottomNav';
import { useCommandBar } from '@/hooks/use-command-bar';
import type { UserWithOrganization } from '@/lib/auth/user-helpers';

interface DashboardContentProps {
  user: UserWithOrganization;
  organizationId: string;
  children: React.ReactNode;
}

/**
 * DashboardContent Component
 *
 * Wrapper component that provides the dashboard layout structure
 * Integrates Sidebar, TopBar, CommandBar, and MobileBottomNav
 *
 * Features:
 * - Mobile sidebar toggle
 * - Command bar integration
 * - Responsive layout with proper margins
 * - Particle background
 */
export function DashboardContent({ user, organizationId, children }: DashboardContentProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { open: openCommandBar } = useCommandBar();

  const handleMenuToggle = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  const handleCommandBarOpen = () => {
    openCommandBar();
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Command Bar (Portal-based, renders at root level) */}
      <CommandBar />

      {/* Sidebar - Fixed on desktop, overlay on mobile */}
      <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />

      {/* Main Content Area - with margin for sidebar on desktop */}
      <div className="relative z-10 lg:ml-72 transition-all duration-300">
        {/* Top Bar */}
        <TopBar
          user={user}
          onMenuToggle={handleMenuToggle}
          onCommandBarOpen={handleCommandBarOpen}
        />

        {/* Page Content */}
        {children}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
