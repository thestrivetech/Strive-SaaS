/**
 * Reusable validation utilities for form fields across the application
 */

import { z } from 'zod';

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Creates a properly-typed Zod date schema that works with React Hook Form
 * Uses a simpler approach that avoids type inference issues
 *
 * @param options.required - Whether the date field is required (default: false)
 * @param options.nullable - Whether the date field can be null (default: false)
 * @returns Zod schema with proper Date type inference
 */
export const createDateSchema = (options?: { required?: boolean; nullable?: boolean }) => {
  if (options?.required) {
    return z.date({
      required_error: "Date is required",
      invalid_type_error: "Invalid date"
    });
  }

  if (options?.nullable) {
    return z.date({ invalid_type_error: "Invalid date" }).nullable().optional();
  }

  return z.date({ invalid_type_error: "Invalid date" }).optional();
};

/**
 * Validates email addresses using a standard regex pattern
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email.trim()) {
    return { isValid: false, errorMessage: "Email is required" };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  
  return {
    isValid,
    errorMessage: isValid ? undefined : "Please enter a valid email address"
  };
};

/**
 * Validates phone numbers allowing various international formats
 * Accepts formats like: +1234567890, (123) 456-7890, 123-456-7890, etc.
 */
export const validatePhone = (phone: string, required: boolean = false): ValidationResult => {
  if (!phone.trim()) {
    return { 
      isValid: !required, 
      errorMessage: required ? "Phone number is required" : undefined 
    };
  }
  
  const phoneRegex = /^[\+]?[1-9]?[\d\s\-\(\)]{7,15}$/;
  const isValid = phoneRegex.test(phone.replace(/\s/g, ''));
  
  return {
    isValid,
    errorMessage: isValid ? undefined : "Please enter a valid phone number"
  };
};

/**
 * Validates required text fields
 */
export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  const isValid = value.trim().length > 0;
  
  return {
    isValid,
    errorMessage: isValid ? undefined : `${fieldName} is required`
  };
};

/**
 * Validates minimum length for text fields
 */
export const validateMinLength = (value: string, minLength: number, fieldName: string): ValidationResult => {
  const isValid = value.trim().length >= minLength;
  
  return {
    isValid,
    errorMessage: isValid ? undefined : `${fieldName} must be at least ${minLength} characters`
  };
};

/**
 * Comprehensive form validation helper
 */
export const validateForm = (fields: Array<{ value: string; validator: (value: string) => ValidationResult }>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  let isValid = true;
  
  fields.forEach(field => {
    const result = field.validator(field.value);
    if (!result.isValid && result.errorMessage) {
      errors.push(result.errorMessage);
      isValid = false;
    }
  });
  
  return { isValid, errors };
};