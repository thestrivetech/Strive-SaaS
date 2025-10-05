/**
 * Centralized types for Strive Tech SaaS Platform
 * Organized by domain: shared, web, real-estate, chatbot
 *
 * @example
 * // Import from specific domain (recommended for clarity)
 * import { CRMFilters, UserWithOrganization } from '@/lib/types/real-estate';
 * import { ApiResponse, CSVColumn } from '@/lib/types/shared';
 *
 * @example
 * // Import from main barrel (convenience)
 * import { CRMFilters, ApiResponse } from '@/lib/types';
 *
 * Structure:
 * - shared/: Cross-domain utility types (api, csv, validation, supabase)
 * - web/: Marketing site types (analytics)
 * - real-estate/: Real estate platform types (auth, crm, filters, organization, seo, etc.)
 * - chatbot/: Chatbot-specific types (iframe communication)
 */

// Re-export all domains for convenience
export * from './shared';
export * from './web';
export * from './real-estate';
