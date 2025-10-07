'use client';

import { motion } from 'framer-motion';
import { Cloud, TrendingUp, Users, CheckCircle, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { UserWithOrganization } from '@/lib/auth/user-helpers';

interface DashboardStats {
  revenue: number;
  customers: number;
  activeProjects: number;
  projects: number;
  tasks: number;
  completedTasks: number;
  taskCompletionRate: number;
}

interface HeroSectionProps {
  user: UserWithOrganization;
  stats: DashboardStats;
}

const iconMap = {
  revenue: DollarSign,
  customers: Users,
  projects: TrendingUp,
  tasks: CheckCircle,
};

export function HeroSection({ user, stats }: HeroSectionProps) {
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

  // KPI cards configuration
  const kpis = [
    {
      name: 'Revenue',
      value: `$${stats.revenue.toLocaleString()}`,
      change: 12.5,
      changeType: 'percentage' as const,
      icon: 'revenue' as const,
    },
    {
      name: 'Customers',
      value: stats.customers.toString(),
      change: 8,
      changeType: 'count' as const,
      icon: 'customers' as const,
    },
    {
      name: 'Active Projects',
      value: stats.activeProjects.toString(),
      change: 5,
      changeType: 'count' as const,
      icon: 'projects' as const,
    },
    {
      name: 'Task Completion',
      value: `${stats.taskCompletionRate}%`,
      change: 15,
      changeType: 'percentage' as const,
      icon: 'tasks' as const,
    },
  ];

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
              </span>{' '}
              <motion.span
                animate={{ rotate: [0, 20, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-block"
              >
                👋
              </motion.span>
            </motion.h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Here&apos;s what&apos;s happening with your business today
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

            {/* Weather Widget (Static Placeholder) */}
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
          </div>
        </div>

        {/* KPI Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6"
        >
          {kpis.map((kpi, index) => {
            const IconComponent = iconMap[kpi.icon];
            const changeColor =
              kpi.change && kpi.change > 0
                ? 'text-chart-3'
                : 'text-destructive';

            return (
              <motion.div
                key={kpi.name}
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
                  <span className="text-sm text-muted-foreground">{kpi.name}</span>
                  <IconComponent className="w-5 h-5 text-primary" />
                </div>
                <motion.div
                  key={kpi.value}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.5 }}
                  className="text-2xl sm:text-3xl font-bold text-primary"
                >
                  {kpi.value}
                </motion.div>
                {kpi.change && (
                  <div className={`text-xs mt-1 ${changeColor}`}>
                    ↑ {Math.abs(kpi.change)}
                    {kpi.changeType === 'percentage' ? '%' : ''}{' '}
                    {kpi.changeType === 'percentage'
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
