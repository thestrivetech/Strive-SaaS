/**
 * Analytics Mock Data Provider
 *
 * Provides mock analytics data for showcase mode
 */

import { dataConfig, simulateDelay } from '../config';

/**
 * Get overview KPIs (mock data)
 */
export async function getOverviewKPIs() {
  if (dataConfig.useMocks) {
    await simulateDelay();
    return {
      leads: {
        new: 24,
        total: 156,
        change: 12.5,
      },
      pipeline: {
        totalValue: 2450000,
        activeDeals: 18,
        averageDealSize: 136111,
      },
      revenue: {
        thisMonth: 485000,
        lastMonth: 420000,
        change: 15.5,
      },
      conversionRate: 24.5,
    };
  }

  throw new Error('Real analytics not implemented - enable mock mode');
}

/**
 * Get sales funnel data (mock)
 */
export async function getSalesFunnelData() {
  if (dataConfig.useMocks) {
    await simulateDelay();
    return [
      { stage: 'New Lead', count: 24, value: 480000 },
      { stage: 'Qualified', count: 18, value: 360000 },
      { stage: 'Proposal', count: 12, value: 720000 },
      { stage: 'Negotiation', count: 8, value: 640000 },
      { stage: 'Closed Won', count: 5, value: 250000 },
    ];
  }

  throw new Error('Real analytics not implemented - enable mock mode');
}

/**
 * Get agent performance data (mock)
 */
export async function getAgentPerformance(timeRange: { start: Date; end: Date }) {
  if (dataConfig.useMocks) {
    await simulateDelay();
    return [
      {
        user: {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@demo.com',
          avatar_url: null,
        },
        metrics: {
          dealsWon: 12,
          revenue: 485000,
          winRate: 28.5,
          averageDealSize: 40417,
        },
      },
      {
        user: {
          id: '2',
          name: 'Michael Chen',
          email: 'michael.chen@demo.com',
          avatar_url: null,
        },
        metrics: {
          dealsWon: 10,
          revenue: 420000,
          winRate: 25.2,
          averageDealSize: 42000,
        },
      },
      {
        user: {
          id: '3',
          name: 'Emily Rodriguez',
          email: 'emily.rodriguez@demo.com',
          avatar_url: null,
        },
        metrics: {
          dealsWon: 8,
          revenue: 365000,
          winRate: 22.1,
          averageDealSize: 45625,
        },
      },
      {
        user: {
          id: '4',
          name: 'David Kim',
          email: 'david.kim@demo.com',
          avatar_url: null,
        },
        metrics: {
          dealsWon: 7,
          revenue: 315000,
          winRate: 19.8,
          averageDealSize: 45000,
        },
      },
    ];
  }

  throw new Error('Real analytics not implemented - enable mock mode');
}
