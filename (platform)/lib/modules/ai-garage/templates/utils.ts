import { AgentCategory } from '@prisma/client';

/**
 * Agent Template Utilities
 *
 * Helper functions for template marketplace functionality
 */

/**
 * Calculate template popularity score
 *
 * Popular templates have:
 * - High usage count (>10 uses)
 * - Good rating (>=4.0 stars)
 *
 * @param usageCount - Number of times template has been used
 * @param rating - Average rating (1-5 stars)
 * @returns true if template is considered popular
 */
export function calculateTemplatePopularity(
  usageCount: number,
  rating: number | null
): boolean {
  return usageCount > 10 && (rating || 0) >= 4.0;
}

/**
 * Get template quality badge
 *
 * Returns a badge label based on template metrics
 *
 * @param usageCount - Number of times template has been used
 * @param rating - Average rating (1-5 stars)
 * @returns Quality badge ('Featured', 'Popular', 'New', 'Standard')
 */
export function getTemplateQualityBadge(
  usageCount: number,
  rating: number | null
): 'Featured' | 'Popular' | 'New' | 'Standard' {
  if (usageCount > 100 && (rating || 0) >= 4.5) {
    return 'Featured';
  }

  if (usageCount > 50 && (rating || 0) >= 4.0) {
    return 'Popular';
  }

  if (usageCount < 10) {
    return 'New';
  }

  return 'Standard';
}

/**
 * Get category icon/emoji for template category
 *
 * @param category - Template category
 * @returns Emoji icon for category
 */
export function getTemplateIcon(category: AgentCategory): string {
  const icons: Record<AgentCategory, string> = {
    SALES: '💼',
    SUPPORT: '🎧',
    ANALYSIS: '📊',
    CONTENT: '📝',
    AUTOMATION: '⚙️',
    RESEARCH: '🔬',
  };

  return icons[category] || '🤖';
}

/**
 * Get category display name
 *
 * @param category - Template category
 * @returns Human-readable category name
 */
export function getCategoryDisplayName(category: AgentCategory): string {
  const names: Record<AgentCategory, string> = {
    SALES: 'Sales',
    SUPPORT: 'Customer Support',
    ANALYSIS: 'Data Analysis',
    CONTENT: 'Content Creation',
    AUTOMATION: 'Process Automation',
    RESEARCH: 'Research & Development',
  };

  return names[category] || category;
}

/**
 * Get category description
 *
 * @param category - Template category
 * @returns Category description
 */
export function getCategoryDescription(category: AgentCategory): string {
  const descriptions: Record<AgentCategory, string> = {
    SALES: 'Templates for sales automation, lead generation, and customer outreach',
    SUPPORT: 'Templates for customer service, ticketing, and support automation',
    ANALYSIS: 'Templates for data analysis, reporting, and business intelligence',
    CONTENT: 'Templates for content creation, copywriting, and marketing',
    AUTOMATION: 'Templates for workflow automation and process optimization',
    RESEARCH: 'Templates for research, information gathering, and analysis',
  };

  return descriptions[category] || 'Agent templates for various use cases';
}

/**
 * Format rating for display
 *
 * @param rating - Average rating (1-5 stars)
 * @returns Formatted rating string (e.g., '4.5 ⭐')
 */
export function formatRating(rating: number | null): string {
  if (rating === null || rating === undefined) {
    return 'No ratings yet';
  }

  return `${rating.toFixed(1)} ⭐`;
}

/**
 * Get rating stars (for visual display)
 *
 * @param rating - Average rating (1-5 stars)
 * @returns Array of star states ('full', 'half', 'empty')
 */
export function getRatingStars(rating: number | null): ('full' | 'half' | 'empty')[] {
  if (rating === null || rating === undefined) {
    return ['empty', 'empty', 'empty', 'empty', 'empty'];
  }

  const stars: ('full' | 'half' | 'empty')[] = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    stars.push('full');
  }

  if (hasHalfStar && fullStars < 5) {
    stars.push('half');
  }

  while (stars.length < 5) {
    stars.push('empty');
  }

  return stars;
}

/**
 * Format usage count for display
 *
 * @param count - Usage count
 * @returns Formatted count (e.g., '1.2k', '500')
 */
export function formatUsageCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }

  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }

  return count.toString();
}

/**
 * Check if template is editable by user
 *
 * @param template - Template object
 * @param userId - Current user ID
 * @param userRole - Current user role
 * @returns true if user can edit template
 */
export function canEditTemplate(
  template: { created_by_id: string; is_system: boolean },
  userId: string,
  userRole: string
): boolean {
  // System templates can only be edited by SUPER_ADMIN
  if (template.is_system) {
    return userRole === 'SUPER_ADMIN';
  }

  // Regular templates can be edited by creator or ADMIN
  return template.created_by_id === userId || userRole === 'ADMIN';
}

/**
 * Check if template is deletable by user
 *
 * @param template - Template object
 * @param userId - Current user ID
 * @param userRole - Current user role
 * @returns true if user can delete template
 */
export function canDeleteTemplate(
  template: { created_by_id: string; is_system: boolean },
  userId: string,
  userRole: string
): boolean {
  // System templates cannot be deleted
  if (template.is_system) {
    return false;
  }

  // Regular templates can be deleted by creator or ADMIN
  return template.created_by_id === userId || userRole === 'ADMIN';
}

/**
 * Validate template configuration
 *
 * Checks if template has required configuration fields
 *
 * @param template - Template object
 * @returns Validation result with errors
 */
export function validateTemplateConfiguration(template: {
  personality_config: any;
  model_config: any;
  tools_config: any;
  memory_config: any;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!template.personality_config || typeof template.personality_config !== 'object') {
    errors.push('Personality configuration is required');
  }

  if (!template.model_config || typeof template.model_config !== 'object') {
    errors.push('Model configuration is required');
  }

  if (!template.tools_config || typeof template.tools_config !== 'object') {
    errors.push('Tools configuration is required');
  }

  if (!template.memory_config || typeof template.memory_config !== 'object') {
    errors.push('Memory configuration is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get template visibility label
 *
 * @param isSystem - Is system template
 * @param isPublic - Is public template
 * @returns Visibility label
 */
export function getTemplateVisibilityLabel(
  isSystem: boolean,
  isPublic: boolean
): 'System' | 'Public' | 'Private' {
  if (isSystem) {
    return 'System';
  }

  return isPublic ? 'Public' : 'Private';
}

/**
 * Generate template preview text
 *
 * Creates a short preview from template description
 *
 * @param description - Template description
 * @param maxLength - Maximum preview length
 * @returns Preview text
 */
export function generateTemplatePreview(
  description: string,
  maxLength: number = 150
): string {
  if (description.length <= maxLength) {
    return description;
  }

  return description.substring(0, maxLength).trim() + '...';
}

/**
 * Sort templates by popularity
 *
 * @param templates - Array of templates
 * @returns Sorted templates (most popular first)
 */
export function sortTemplatesByPopularity<T extends { usage_count: number; rating: number | null }>(
  templates: T[]
): T[] {
  return [...templates].sort((a, b) => {
    // Primary sort: usage count
    if (a.usage_count !== b.usage_count) {
      return b.usage_count - a.usage_count;
    }

    // Secondary sort: rating
    const ratingA = a.rating || 0;
    const ratingB = b.rating || 0;
    return ratingB - ratingA;
  });
}

/**
 * Filter templates by search query
 *
 * @param templates - Array of templates
 * @param query - Search query
 * @returns Filtered templates
 */
export function filterTemplatesBySearch<T extends { name: string; description: string; tags: string[] }>(
  templates: T[],
  query: string
): T[] {
  const lowerQuery = query.toLowerCase();

  return templates.filter(template => {
    return (
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  });
}
