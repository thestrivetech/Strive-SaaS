'use client';

import { motion } from 'framer-motion';
import {
  Cloud,
  TrendingUp,
  Users,
  CheckCircle,
  CheckCircle2,
  DollarSign,
  FileText,
  Eye,
  Megaphone,
  Clock,
  Archive,
  BarChart3,
  type LucideIcon
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { UserWithOrganization } from '@/lib/auth/user-helpers';

export interface ModuleStats {
  label: string;
  value: string | number;
  change?: number;
  changeType?: 'percentage' | 'count';
  icon: 'revenue' | 'customers' | 'projects' | 'tasks' | 'file' | 'check' | 'trend' | 'eye' | 'megaphone' | 'clock' | 'archive' | 'barchart3' | 'custom';
  customIcon?: LucideIcon; // Keep for backward compatibility but deprecated
}

export interface ModuleHeroSectionProps {
  user: UserWithOrganization;
  moduleName: string;
  moduleDescription: string;
  stats: ModuleStats[];
  showWeather?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  revenue: DollarSign,
  customers: Users,
  projects: TrendingUp,
  tasks: CheckCircle,
  file: FileText,
  check: CheckCircle2,
  trend: TrendingUp,
  eye: Eye,
  megaphone: Megaphone,
  clock: Clock,
  archive: Archive,
  barchart3: BarChart3,
};

export function ModuleHeroSection({
  user,
  moduleName,
  moduleDescription,
  stats,
  showWeather = false,
}: ModuleHeroSectionProps) {
  const [currentTime, setCurrentTime] = useState('');
  const [mounted, setMounted] = useState(false);

  // Update clock every second
  useEffect(() => {
    setMounted(true);
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours() % 12 || 12;
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone.split('/')[1] || 'Local';
  };

  if (!mounted) {
    return null;
  }

  const firstName = user.name?.split(' ')[0] || 'User';

  return (
    <section className="p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl p-6 sm:p-8 neon-border-cyan mb-6"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Greeting Section */}
          <div className="flex-1">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2"
            >
              <motion.span
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-block"
              >
                {getGreeting()},
              </motion.span>{' '}
              <span className="bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">
                {firstName}
              </span>
            </motion.h1>
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl sm:text-2xl font-semibold text-primary mb-2"
            >
              {moduleName}
            </motion.h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              {moduleDescription}
            </p>
          </div>

          {/* Clock & Weather Widgets */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Clock Widget */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center glass rounded-xl p-3 sm:p-4 neon-border-purple"
            >
              <div className="text-xl sm:text-2xl font-bold text-chart-2">
                {currentTime}
              </div>
              <div className="text-xs text-muted-foreground">{getTimezone()}</div>
            </motion.div>

            {/* Weather Widget (Optional) */}
            {showWeather && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="glass rounded-xl p-3 sm:p-4 neon-border-green flex items-center gap-3"
              >
                <Cloud className="w-6 h-6 sm:w-8 sm:h-8 text-chart-3" />
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-chart-3">
                    72°F
                  </div>
                  <div className="text-xs text-muted-foreground">San Francisco</div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6"
        >
          {stats.map((stat, index) => {
            const IconComponent = stat.customIcon || iconMap[stat.icon];
            const changeColor =
              stat.change && stat.change > 0
                ? 'text-chart-3'
                : 'text-destructive';

            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{
                  y: -4,
                  boxShadow: '0 10px 30px rgba(0, 210, 255, 0.2)',
                }}
                className="glass rounded-xl p-4 cursor-pointer neon-border-cyan"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <IconComponent className="w-5 h-5 text-primary" />
                </div>
                <motion.div
                  key={String(stat.value)}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.5 }}
                  className="text-2xl sm:text-3xl font-bold text-primary"
                >
                  {stat.value}
                </motion.div>
                {stat.change !== undefined && (
                  <div className={`text-xs mt-1 ${changeColor}`}>
                    ↑ {Math.abs(stat.change)}
                    {stat.changeType === 'percentage' ? '%' : ''}{' '}
                    {stat.changeType === 'percentage'
                      ? 'vs last month'
                      : 'more than yesterday'}
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}
