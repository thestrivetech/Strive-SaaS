'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { MetricCategory } from '@prisma/client';

interface MetricCalculation {
  id: string;
  name: string;
  value: number;
  unit?: string;
  change?: number; // Percentage change from last period
  status: 'normal' | 'warning' | 'critical';
}

export async function calculateMetrics(organizationId: string): Promise<MetricCalculation[]> {
  const user = await requireAuth();

  if (organizationId !== user.organizationId) {
    throw new Error('Unauthorized');
  }

  // Get all active metrics for the organization
  const metrics = await prisma.dashboard_metrics.findMany({
    where: {
      OR: [
        { organization_id: organizationId },
        { organization_id: null }, // System metrics
      ],
    },
  });

  const calculatedMetrics: MetricCalculation[] = [];

  for (const metric of metrics) {
    try {
      const value = await calculateMetricValue(metric, organizationId);

      // Update cached value
      await prisma.dashboard_metrics.update({
        where: { id: metric.id },
        data: {
          cached_value: value,
          last_calculated: new Date(),
        },
      });

      calculatedMetrics.push({
        id: metric.id,
        name: metric.name,
        value,
        unit: metric.unit || undefined,
        status: getMetricStatus(value, metric),
      });
    } catch (error) {
      console.error(`Failed to calculate metric ${metric.name}:`, error);
    }
  }

  return calculatedMetrics;
}

async function calculateMetricValue(metric: any, organizationId: string): Promise<number> {
  // This would implement the actual metric calculation based on the query
  // For now, return cached value or 0

  switch (metric.category) {
    case MetricCategory.FINANCIAL:
      return await calculateFinancialMetric(metric.query, organizationId);
    case MetricCategory.OPERATIONAL:
      return await calculateOperationalMetric(metric.query, organizationId);
    case MetricCategory.PRODUCTIVITY:
      return await calculateProductivityMetric(metric.query, organizationId);
    case MetricCategory.SALES:
      return await calculateSalesMetric(metric.query, organizationId);
    default:
      return metric.cached_value || 0;
  }
}

function getMetricStatus(value: number, metric: any): 'normal' | 'warning' | 'critical' {
  if (metric.critical_threshold && value >= metric.critical_threshold) {
    return 'critical';
  }
  if (metric.warning_threshold && value >= metric.warning_threshold) {
    return 'warning';
  }
  return 'normal';
}

async function calculateFinancialMetric(query: any, orgId: string): Promise<number> {
  // Placeholder - implement based on query structure
  // Example: Total revenue, expenses, profit margin
  return 0;
}

async function calculateOperationalMetric(query: any, orgId: string): Promise<number> {
  // Placeholder - implement based on query structure
  // Example: Active projects, completed tasks, uptime
  return 0;
}

async function calculateProductivityMetric(query: any, orgId: string): Promise<number> {
  // Placeholder - implement based on query structure
  // Example: Tasks per day, completion rate
  return 0;
}

async function calculateSalesMetric(query: any, orgId: string): Promise<number> {
  // Placeholder - implement based on query structure
  // Example: Total deals, conversion rate
  return 0;
}
