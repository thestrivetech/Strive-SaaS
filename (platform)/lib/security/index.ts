/**
 * Security Utilities
 *
 * Centralized exports for all security-related utilities.
 *
 * @module lib/security
 */

// Input validation and sanitization
export {
  sanitizeHtml,
  sanitizeRichText,
  stripHtml,
  sanitizeText,
  escapeHtml,
  validateFile,
  validateUrl,
  containsSqlInjectionPattern,
  FileUploadSchema,
  SafeUrlSchema,
  EmailSchema,
  PhoneSchema,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZES,
  type FileUploadInput,
} from './input-validation';

// CSRF protection
export {
  generateCSRFToken,
  setCSRFToken,
  getCSRFTokenFromCookie,
  validateCSRFToken,
  csrfMiddleware,
} from './csrf';

// Rate limiting (re-export from parent lib)
export {
  authRateLimit,
  apiRateLimit,
  strictRateLimit,
  checkRateLimit,
  getClientIdentifier,
} from '../rate-limit';
