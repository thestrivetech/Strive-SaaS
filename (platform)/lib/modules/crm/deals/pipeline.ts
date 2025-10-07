import 'server-only';

import { DealStage, DealStatus } from '@prisma/client';
import { PIPELINE_STAGES, type StageConfig } from './constants';

/**
 * Deals Pipeline Module
 *
 * Pipeline-specific logic and utilities for deal management
 * Stage configurations, probability calculations, forecasting
 *
 * Note: PIPELINE_STAGES constant is now imported from ./constants.ts (client-safe)
 */

// Re-export for backward compatibility
export { PIPELINE_STAGES, type StageConfig };

/**
 * Get stage configuration by ID
 */
export function getStageConfig(stage: DealStage): StageConfig | undefined {
  return PIPELINE_STAGES.find((s) => s.id === stage);
}

/**
 * Get stage title
 */
export function getStageTitle(stage: DealStage): string {
  return getStageConfig(stage)?.title || stage;
}

/**
 * Get stage probability
 */
export function getStageProbability(stage: DealStage): number {
  return getStageConfig(stage)?.probability || 50;
}

/**
 * Get stage color
 */
export function getStageColor(stage: DealStage): string {
  return getStageConfig(stage)?.color || 'gray';
}

/**
 * Validate stage transition
 * Ensures deals progress forward in the pipeline (with some exceptions)
 */
export function validateStageTransition(
  currentStage: DealStage,
  newStage: DealStage
): { valid: boolean; message?: string } {
  const currentConfig = getStageConfig(currentStage);
  const newConfig = getStageConfig(newStage);

  if (!currentConfig || !newConfig) {
    return { valid: false, message: 'Invalid stage' };
  }

  // Allow moving to closed won/lost from any stage
  if (newStage === 'CLOSED_WON' || newStage === 'CLOSED_LOST') {
    return { valid: true };
  }

  // Prevent moving from closed stages
  if (currentStage === 'CLOSED_WON' || currentStage === 'CLOSED_LOST') {
    return {
      valid: false,
      message: 'Cannot move deal from closed stage. Reopen the deal first.',
    };
  }

  // Allow forward movement or backward by 1 stage
  const stageDiff = newConfig.order - currentConfig.order;

  if (stageDiff >= 0) {
    // Forward movement always allowed
    return { valid: true };
  }

  if (stageDiff >= -1) {
    // Backward by 1 stage allowed
    return { valid: true };
  }

  return {
    valid: false,
    message: 'Can only move backward by one stage at a time',
  };
}

/**
 * Calculate weighted pipeline value
 * Uses probability to calculate expected revenue
 */
export function calculateWeightedValue(value: number, probability: number): number {
  return (value * probability) / 100;
}

/**
 * Calculate pipeline forecast
 * Estimates likely revenue based on probabilities
 */
export interface PipelineForecast {
  totalValue: number;
  weightedValue: number;
  expectedRevenue: number;
  confidenceLevel: 'low' | 'medium' | 'high';
}

export function calculatePipelineForecast(
  deals: Array<{ value: number; probability: number; stage: DealStage }>
): PipelineForecast {
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const weightedValue = deals.reduce(
    (sum, deal) => sum + calculateWeightedValue(deal.value, deal.probability),
    0
  );

  // Expected revenue = weighted value with confidence adjustment
  const avgProbability =
    deals.length > 0
      ? deals.reduce((sum, deal) => sum + deal.probability, 0) / deals.length
      : 0;

  let confidenceLevel: 'low' | 'medium' | 'high' = 'low';
  if (avgProbability >= 70) {
    confidenceLevel = 'high';
  } else if (avgProbability >= 40) {
    confidenceLevel = 'medium';
  }

  const expectedRevenue = weightedValue;

  return {
    totalValue,
    weightedValue,
    expectedRevenue,
    confidenceLevel,
  };
}

/**
 * Get pipeline health metrics
 */
export interface PipelineHealth {
  stageDistribution: Record<DealStage, number>;
  bottleneck: DealStage | null;
  velocity: number; // Average days to move through pipeline
  status: 'healthy' | 'warning' | 'critical';
}

export function analyzePipelineHealth(
  dealsByStage: Array<{ stage: DealStage; count: number; avgDaysInStage?: number }>
): PipelineHealth {
  const stageDistribution: Record<string, number> = {};
  let bottleneck: DealStage | null = null;
  let maxCount = 0;

  for (const stage of dealsByStage) {
    stageDistribution[stage.stage] = stage.count;

    if (stage.count > maxCount && stage.stage !== 'LEAD') {
      maxCount = stage.count;
      bottleneck = stage.stage;
    }
  }

  // Calculate average velocity (simplified)
  const avgVelocity =
    dealsByStage.reduce((sum, stage) => sum + (stage.avgDaysInStage || 0), 0) /
      dealsByStage.length || 0;

  // Determine health status
  let status: 'healthy' | 'warning' | 'critical' = 'healthy';

  if (avgVelocity > 60) {
    status = 'critical';
  } else if (avgVelocity > 30) {
    status = 'warning';
  }

  return {
    stageDistribution: stageDistribution as Record<DealStage, number>,
    bottleneck,
    velocity: avgVelocity,
    status,
  };
}

/**
 * Get next recommended stage
 */
export function getNextStage(currentStage: DealStage): DealStage | null {
  const currentConfig = getStageConfig(currentStage);

  if (!currentConfig) {
    return null;
  }

  const nextStage = PIPELINE_STAGES.find(
    (s) => s.order === currentConfig.order + 1 && s.id !== 'CLOSED_LOST'
  );

  return nextStage?.id || null;
}

/**
 * Get pipeline stage statistics
 */
export interface StageStats {
  stage: DealStage;
  count: number;
  totalValue: number;
  avgValue: number;
  avgProbability: number;
}

export function calculateStageStats(
  deals: Array<{ stage: DealStage; value: number; probability: number }>
): StageStats[] {
  const stageMap = new Map<DealStage, Array<{ value: number; probability: number }>>();

  // Group deals by stage
  for (const deal of deals) {
    if (!stageMap.has(deal.stage)) {
      stageMap.set(deal.stage, []);
    }
    stageMap.get(deal.stage)!.push({ value: deal.value, probability: deal.probability });
  }

  // Calculate stats for each stage
  const stats: StageStats[] = [];

  for (const [stage, stageDeals] of stageMap.entries()) {
    const count = stageDeals.length;
    const totalValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
    const avgValue = count > 0 ? totalValue / count : 0;
    const avgProbability = count > 0
      ? stageDeals.reduce((sum, d) => sum + d.probability, 0) / count
      : 0;

    stats.push({
      stage,
      count,
      totalValue,
      avgValue,
      avgProbability,
    });
  }

  // Sort by stage order
  stats.sort((a, b) => {
    const aOrder = getStageConfig(a.stage)?.order || 0;
    const bOrder = getStageConfig(b.stage)?.order || 0;
    return aOrder - bOrder;
  });

  return stats;
}
