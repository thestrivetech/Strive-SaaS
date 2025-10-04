/**
 * Form Schemas - Public API
 *
 * Barrel export file for all form validation schemas.
 * Import from '@/lib/forms' to access Zod schemas and types.
 */

// Form schemas
export {
  ContactFormSchema,
  NewsletterSchema,
  DemoRequestSchema,
  AssessmentFormSchema,
  WhitepaperDownloadSchema,
  JobApplicationSchema,
  SupportRequestSchema,
  PartnerInquirySchema,
  commonPatterns,
  isBot,
} from './schemas';

// Form types
export type {
  ContactFormData,
  NewsletterData,
  DemoRequestData,
  AssessmentFormData,
  WhitepaperDownloadData,
  JobApplicationData,
  SupportRequestData,
  PartnerInquiryData,
} from './schemas';
