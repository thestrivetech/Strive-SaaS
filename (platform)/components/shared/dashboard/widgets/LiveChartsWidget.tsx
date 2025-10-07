'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface LiveChartsWidgetProps {
  organizationId?: string;
}

// Mock data - will be replaced with real data in Phase 5
const revenueData = [
  { month: 'Jan', revenue: 42000, target: 40000 },
  { month: 'Feb', revenue: 45000, target: 43000 },
  { month: 'Mar', revenue: 51000, target: 46000 },
  { month: 'Apr', revenue: 48000, target: 49000 },
  { month: 'May', revenue: 62000, target: 52000 },
  { month: 'Jun', revenue: 68000, target: 55000 },
];

const dealsByStatusData = [
  { status: 'Active', count: 24, value: 1200000 },
  { status: 'Pending', count: 18, value: 850000 },
  { status: 'Under Contract', count: 12, value: 650000 },
  { status: 'Closed', count: 35, value: 2100000 },
];

const pipelineData = [
  { week: 'Week 1', leads: 45, deals: 12, closed: 3 },
  { week: 'Week 2', leads: 52, deals: 15, closed: 4 },
  { week: 'Week 3', leads: 48, deals: 18, closed: 5 },
  { week: 'Week 4', leads: 61, deals: 21, closed: 7 },
];

type ChartType = 'revenue' | 'deals' | 'pipeline';

export function LiveChartsWidget({ organizationId }: LiveChartsWidgetProps) {
  const [activeChart, setActiveChart] = useState<ChartType>('revenue');

  return (
    <div className="glass-strong rounded-2xl p-6 widget-hover h-full neon-border-green">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          className="w-2 h-2 rounded-full bg-green-400"
        />
        Live Charts
      </h3>

      {/* Chart Selector */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeChart === 'revenue' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveChart('revenue')}
          className={
            activeChart === 'revenue'
              ? 'neon-border-cyan text-cyan-400'
              : 'text-muted-foreground'
          }
        >
          Revenue
        </Button>
        <Button
          variant={activeChart === 'deals' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveChart('deals')}
          className={
            activeChart === 'deals'
              ? 'neon-border-green text-green-400'
              : 'text-muted-foreground'
          }
        >
          Deals
        </Button>
        <Button
          variant={activeChart === 'pipeline' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveChart('pipeline')}
          className={
            activeChart === 'pipeline'
              ? 'neon-border-purple text-purple-400'
              : 'text-muted-foreground'
          }
        >
          Pipeline
        </Button>
      </div>

      {/* Charts */}
      <div className="h-64">
        {activeChart === 'revenue' && (
          <motion.div
            key="revenue"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D2FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00D2FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#39FF14" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#39FF14" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="month"
                  stroke="rgba(255,255,255,0.6)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.6)"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid #00D2FF',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#00D2FF"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke="#39FF14"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fillOpacity={1}
                  fill="url(#colorTarget)"
                  name="Target"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {activeChart === 'deals' && (
          <motion.div
            key="deals"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dealsByStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="status"
                  stroke="rgba(255,255,255,0.6)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.6)"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid #39FF14',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Bar dataKey="count" fill="#39FF14" name="Deal Count" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {activeChart === 'pipeline' && (
          <motion.div
            key="pipeline"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="week"
                  stroke="rgba(255,255,255,0.6)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.6)"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid #8B5CF6',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="#00D2FF"
                  strokeWidth={2}
                  name="Leads"
                />
                <Line
                  type="monotone"
                  dataKey="deals"
                  stroke="#39FF14"
                  strokeWidth={2}
                  name="Deals"
                />
                <Line
                  type="monotone"
                  dataKey="closed"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  name="Closed"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
        {activeChart === 'revenue' && (
          <>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-lg font-bold text-cyan-400">$316k</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Target</p>
              <p className="text-lg font-bold text-green-400">$285k</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Growth</p>
              <p className="text-lg font-bold text-purple-400">+10.9%</p>
            </div>
          </>
        )}
        {activeChart === 'deals' && (
          <>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Total Deals</p>
              <p className="text-lg font-bold text-cyan-400">89</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Total Value</p>
              <p className="text-lg font-bold text-green-400">$4.8M</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Avg Deal</p>
              <p className="text-lg font-bold text-purple-400">$54k</p>
            </div>
          </>
        )}
        {activeChart === 'pipeline' && (
          <>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Conv. Rate</p>
              <p className="text-lg font-bold text-cyan-400">31%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Close Rate</p>
              <p className="text-lg font-bold text-green-400">28%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Trend</p>
              <p className="text-lg font-bold text-purple-400">↑ 12%</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
