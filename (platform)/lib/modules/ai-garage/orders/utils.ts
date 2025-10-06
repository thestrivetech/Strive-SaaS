import { ComplexityLevel } from '@prisma/client';

/**
 * Calculate estimated hours based on complexity and requirements
 */
export function calculateEstimatedHours(
  complexity: ComplexityLevel,
  requirements: any
): number {
  const baseHours = {
    SIMPLE: 6,
    MODERATE: 16,
    COMPLEX: 48,
    ENTERPRISE: 120
  };

  let hours = baseHours[complexity];

  // Adjust based on requirements complexity
  if (requirements.integrations?.length > 3) {
    hours *= 1.5;
  }
  if (requirements.customUI) {
    hours *= 1.3;
  }
  if (requirements.multiModel) {
    hours *= 1.2;
  }
  if (requirements.advancedMemory) {
    hours *= 1.4;
  }

  return Math.round(hours);
}

/**
 * Calculate estimated cost based on hours
 */
export function calculateEstimatedCost(hours: number): number {
  const hourlyRate = 150; // $150 per hour
  return hours * hourlyRate * 100; // Store in cents
}

/**
 * Get complexity tier details
 */
export function getComplexityDetails(complexity: ComplexityLevel) {
  const details = {
    SIMPLE: {
      label: 'Simple',
      description: '1-8 hours',
      features: ['Basic configuration', 'Single model', 'Standard tools'],
    },
    MODERATE: {
      label: 'Moderate',
      description: '8-24 hours',
      features: ['Custom personality', 'Multiple tools', 'Basic integrations'],
    },
    COMPLEX: {
      label: 'Complex',
      description: '24-72 hours',
      features: ['Advanced features', 'Custom UI', 'Multiple integrations'],
    },
    ENTERPRISE: {
      label: 'Enterprise',
      description: '72+ hours',
      features: ['Full customization', 'Complex workflows', 'Enterprise integrations'],
    },
  };

  return details[complexity];
}
