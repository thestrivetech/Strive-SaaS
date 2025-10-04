import 'server-only';

import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Input Validation & Sanitization
 *
 * This module provides security utilities for validating and sanitizing user input
 * to prevent XSS, injection attacks, and other security vulnerabilities.
 *
 * Features:
 * - HTML sanitization (XSS prevention)
 * - File upload validation
 * - URL validation
 * - Safe text processing
 */

// ============================================================================
// HTML Sanitization (XSS Prevention)
// ============================================================================

/**
 * Sanitize HTML content to prevent XSS attacks
 *
 * Allows only safe HTML tags and attributes.
 * Use this before rendering user-generated HTML content.
 *
 * @param dirty - Untrusted HTML string
 * @returns Sanitized HTML string safe for rendering
 *
 * @example
 * ```typescript
 * const userInput = '<script>alert("xss")</script><p>Hello</p>';
 * const safe = sanitizeHtml(userInput); // '<p>Hello</p>'
 * ```
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  });
}

/**
 * Sanitize HTML for rich text editors
 *
 * Allows more tags for formatted content but still prevents XSS.
 *
 * @param dirty - Untrusted HTML from rich text editor
 * @returns Sanitized HTML safe for rendering
 */
export function sanitizeRichText(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'img', 'div', 'span',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'id'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  });
}

/**
 * Strip all HTML tags from a string
 *
 * Use this when you need plain text only.
 *
 * @param html - HTML string
 * @returns Plain text without HTML tags
 */
export function stripHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

// ============================================================================
// File Upload Validation
// ============================================================================

/**
 * Allowed file types for uploads
 */
export const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  documents: ['application/pdf', 'text/plain', 'text/csv'],
  spreadsheets: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  all: [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'text/csv',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
} as const;

/**
 * Maximum file sizes (in bytes)
 */
export const MAX_FILE_SIZES = {
  avatar: 2 * 1024 * 1024, // 2MB
  image: 5 * 1024 * 1024, // 5MB
  document: 10 * 1024 * 1024, // 10MB
  general: 50 * 1024 * 1024, // 50MB
} as const;

/**
 * File upload validation schema
 */
export const FileUploadSchema = z.object({
  name: z.string().min(1).max(255),
  size: z.number().positive(),
  type: z.string().min(1),
});

export type FileUploadInput = z.infer<typeof FileUploadSchema>;

/**
 * Validate file upload
 *
 * @param file - File to validate
 * @param options - Validation options
 * @returns Validation result
 */
export function validateFile(
  file: FileUploadInput,
  options: {
    maxSize?: number;
    allowedTypes?: readonly string[];
  } = {}
): { valid: boolean; error?: string } {
  const { maxSize = MAX_FILE_SIZES.general, allowedTypes = ALLOWED_FILE_TYPES.all } = options;

  // Validate with Zod
  const parsed = FileUploadSchema.safeParse(file);
  if (!parsed.success) {
    return { valid: false, error: 'Invalid file format' };
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSizeMB}MB`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  // Check file extension matches MIME type
  const extension = file.name.split('.').pop()?.toLowerCase();
  const expectedExtensions: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
    'application/pdf': ['pdf'],
    'text/plain': ['txt'],
    'text/csv': ['csv'],
  };

  const expected = expectedExtensions[file.type];
  if (expected && extension && !expected.includes(extension)) {
    return {
      valid: false,
      error: 'File extension does not match file type',
    };
  }

  return { valid: true };
}

// ============================================================================
// URL Validation
// ============================================================================

/**
 * Safe URL validation schema
 *
 * Only allows HTTP(S) URLs to prevent javascript:, data:, and other dangerous protocols
 */
export const SafeUrlSchema = z
  .string()
  .url('Must be a valid URL')
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    { message: 'Only HTTP and HTTPS URLs are allowed' }
  );

/**
 * Validate and sanitize URL
 *
 * @param url - URL string to validate
 * @returns Validation result with sanitized URL
 */
export function validateUrl(url: string): {
  valid: boolean;
  url?: string;
  error?: string;
} {
  const result = SafeUrlSchema.safeParse(url);

  if (!result.success) {
    return {
      valid: false,
      error: result.error.errors[0]?.message || 'Invalid URL',
    };
  }

  return {
    valid: true,
    url: result.data,
  };
}

// ============================================================================
// Text Input Sanitization
// ============================================================================

/**
 * Sanitize text input
 *
 * Removes control characters and normalizes whitespace.
 * Use this for plain text inputs like names, emails, etc.
 *
 * @param text - Text to sanitize
 * @returns Sanitized text
 */
export function sanitizeText(text: string): string {
  return text
    // Remove control characters
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Trim
    .trim();
}

/**
 * Validate email address
 *
 * More strict than basic regex validation.
 */
export const EmailSchema = z.string().email().toLowerCase();

/**
 * Validate phone number (flexible format)
 */
export const PhoneSchema = z
  .string()
  .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
    'Invalid phone number format'
  );

// ============================================================================
// SQL Injection Prevention
// ============================================================================

/**
 * Check if string contains potential SQL injection patterns
 *
 * Note: This is a last resort. ALWAYS use parameterized queries with Prisma.
 * Prisma automatically prevents SQL injection, but this can be used for
 * additional validation on raw user input.
 *
 * @param input - User input to check
 * @returns true if suspicious patterns found
 */
export function containsSqlInjectionPattern(input: string): boolean {
  const patterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|#|\/\*|\*\/)/,
    /('|(;)|(=)|(\|\|))/,
  ];

  return patterns.some((pattern) => pattern.test(input));
}

/**
 * Sanitize input for safe display (prevent XSS in text contexts)
 *
 * Use this when displaying user input in HTML text content (not attributes).
 *
 * @param input - User input
 * @returns Escaped string safe for text content
 */
export function escapeHtml(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, (char) => map[char] || char);
}
