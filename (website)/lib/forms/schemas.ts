/**
 * Form Validation Schemas
 *
 * Zod schemas for form validation across the marketing website.
 * Provides type-safe validation for contact forms, newsletter, etc.
 */

import { z } from 'zod';

/**
 * Contact Form Schema
 *
 * Used in contact page and inquiry forms.
 */
export const ContactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().optional(),
  phone: z.string().optional(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),
  // Honeypot field (hidden from users, bots will fill it)
  website: z.string().optional(),
});

export type ContactFormData = z.infer<typeof ContactFormSchema>;

/**
 * Newsletter Subscription Schema
 *
 * Used in footer and blog newsletter forms.
 */
export const NewsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  // Honeypot field
  website: z.string().optional(),
});

export type NewsletterData = z.infer<typeof NewsletterSchema>;

/**
 * Demo Request Schema
 *
 * Used for requesting product demos.
 */
export const DemoRequestSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  company: z
    .string()
    .min(2, 'Company name is required')
    .max(100, 'Company name must be less than 100 characters'),
  phone: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '501+']).optional(),
  message: z.string().optional(),
  // Honeypot field
  website: z.string().optional(),
});

export type DemoRequestData = z.infer<typeof DemoRequestSchema>;

/**
 * Assessment Form Schema
 *
 * Used for business/AI readiness assessments.
 */
export const AssessmentFormSchema = z.object({
  // Contact info
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  company: z
    .string()
    .min(2, 'Company name is required')
    .max(100, 'Company name must be less than 100 characters'),
  phone: z.string().optional(),

  // Assessment questions
  industry: z.string().min(1, 'Please select an industry'),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '501+']),
  currentChallenges: z
    .array(z.string())
    .min(1, 'Please select at least one challenge'),
  budget: z.enum(['<10k', '10k-50k', '50k-100k', '100k-250k', '250k+']).optional(),
  timeline: z.enum(['immediate', '1-3-months', '3-6-months', '6-12-months', 'unsure']),

  // Additional info
  additionalInfo: z.string().optional(),

  // Honeypot field
  website: z.string().optional(),
});

export type AssessmentFormData = z.infer<typeof AssessmentFormSchema>;

/**
 * Whitepaper Download Schema
 *
 * Used for gated content downloads.
 */
export const WhitepaperDownloadSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  industry: z.string().optional(),
  // Consent
  marketingConsent: z.boolean().optional(),
  // Honeypot field
  website: z.string().optional(),
});

export type WhitepaperDownloadData = z.infer<typeof WhitepaperDownloadSchema>;

/**
 * Job Application Schema
 *
 * Used for career page applications.
 */
export const JobApplicationSchema = z.object({
  // Personal info
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .min(10, 'Please enter a valid phone number')
    .regex(/^[0-9\s\-\(\)\+]+$/, 'Please enter a valid phone number'),

  // Professional info
  linkedinUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  portfolioUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  resume: z.string().min(1, 'Resume is required'), // File URL or base64
  coverLetter: z.string().optional(),

  // Position
  position: z.string().min(1, 'Please select a position'),
  availableStartDate: z.string().optional(),

  // Additional
  referralSource: z.string().optional(),

  // Honeypot field
  website: z.string().optional(),
});

export type JobApplicationData = z.infer<typeof JobApplicationSchema>;

/**
 * Support Request Schema
 *
 * Used for customer support inquiries.
 */
export const SupportRequestSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),
  category: z.enum(['technical', 'billing', 'general', 'feature-request']),
  priority: z.enum(['low', 'medium', 'high']),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  // Honeypot field
  website: z.string().optional(),
});

export type SupportRequestData = z.infer<typeof SupportRequestSchema>;

/**
 * Partner Inquiry Schema
 *
 * Used for partnership inquiries.
 */
export const PartnerInquirySchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  company: z
    .string()
    .min(2, 'Company name is required')
    .max(100, 'Company name must be less than 100 characters'),
  companyWebsite: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  partnershipType: z.enum(['reseller', 'integration', 'referral', 'other']),
  message: z
    .string()
    .min(20, 'Message must be at least 20 characters')
    .max(1000, 'Message must be less than 1000 characters'),
  // Honeypot field
  website: z.string().optional(),
});

export type PartnerInquiryData = z.infer<typeof PartnerInquirySchema>;

/**
 * Common validation patterns
 */
export const commonPatterns = {
  phone: /^[0-9\s\-\(\)\+]+$/,
  url: /^https?:\/\/.+/,
  zipCode: /^\d{5}(-\d{4})?$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
};

/**
 * Honeypot validation helper
 *
 * Returns true if honeypot was filled (indicates bot)
 */
export function isBot(data: { website?: string }): boolean {
  return Boolean(data.website && data.website.length > 0);
}
