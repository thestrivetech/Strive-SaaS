/**
 * Common validation types used across all domains
 * Extracted from lib/validation.ts for centralized access
 */

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Generic validation function type
 */
export type ValidatorFn<T = unknown> = (value: T) => ValidationResult;

/**
 * Validation error detail for form fields
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Form validation result with multiple field errors
 */
export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
