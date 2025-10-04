/**
 * Utility Functions - Public API
 *
 * Barrel export file for all utility functions.
 * Import from '@/lib/utils' to access all utilities.
 */

// Class name utilities (from lib/utils.ts - keep backward compatibility)
export { cn } from '../utils';

// Formatting utilities
export {
  formatDate,
  formatRelativeDate,
  formatNumber,
  formatCurrency,
  formatPercentage,
  createSlug,
  truncate,
  pluralize,
  capitalize,
  toTitleCase,
  getInitials,
  formatFileSize,
  formatPhoneNumber,
  formatReadingTime,
} from './formatters';

// Validation utilities
export {
  isValidEmail,
  isValidUrl,
  isValidPhone,
  isValidZipCode,
  isStrongPassword,
  isValidCreditCard,
  sanitizeHtml,
  isValidSlug,
  isValidHexColor,
  isNotEmpty,
  isInRange,
  isLengthInRange,
  matchesPattern,
  isValidIPv4,
  isValidDomain,
  isValidUsername,
  hasAllowedExtension,
  isFileSizeValid,
} from './validation';
