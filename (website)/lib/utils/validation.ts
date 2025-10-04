/**
 * Validation Utilities
 *
 * Provides reusable validation functions for common data types.
 * Used in forms, inputs, and data processing.
 */

/**
 * Validate email address format
 *
 * @param email - Email address to validate
 * @returns True if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 *
 * @param url - URL to validate
 * @returns True if URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate US phone number format
 * Accepts: (123) 456-7890, 123-456-7890, 1234567890, +1 123 456 7890
 *
 * @param phone - Phone number to validate
 * @returns True if phone is valid US format
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || (cleaned.length === 11 && cleaned.startsWith('1'));
}

/**
 * Validate ZIP code format (US)
 * Accepts: 12345 or 12345-6789
 *
 * @param zip - ZIP code to validate
 * @returns True if ZIP is valid
 */
export function isValidZipCode(zip: string): boolean {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zip);
}

/**
 * Validate password strength
 * Requirements: At least 8 characters, 1 uppercase, 1 lowercase, 1 number
 *
 * @param password - Password to validate
 * @returns True if password meets requirements
 */
export function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false;

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  return hasUppercase && hasLowercase && hasNumber;
}

/**
 * Validate credit card number using Luhn algorithm
 *
 * @param cardNumber - Credit card number (digits only)
 * @returns True if card number is valid
 */
export function isValidCreditCard(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\D/g, '');

  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Sanitize HTML to prevent XSS attacks
 * Removes all HTML tags and entities
 *
 * @param html - HTML string to sanitize
 * @returns Plain text without HTML
 */
export function sanitizeHtml(html: string): string {
  // Remove all HTML tags
  const withoutTags = html.replace(/<[^>]*>/g, '');

  // Decode HTML entities
  const textarea = document.createElement('textarea');
  textarea.innerHTML = withoutTags;
  const decoded = textarea.value;

  return decoded;
}

/**
 * Validate slug format (URL-friendly)
 * Allows: lowercase letters, numbers, hyphens
 *
 * @param slug - Slug to validate
 * @returns True if slug is valid
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Validate hexadecimal color code
 * Accepts: #fff, #ffffff, #FFFFFF
 *
 * @param color - Color code to validate
 * @returns True if color is valid hex
 */
export function isValidHexColor(color: string): boolean {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
}

/**
 * Validate that a string is not empty (after trimming)
 *
 * @param value - String to validate
 * @returns True if string has content
 */
export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Validate that a value is within a range
 *
 * @param value - Number to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns True if value is in range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Validate that a string length is within a range
 *
 * @param text - String to validate
 * @param min - Minimum length
 * @param max - Maximum length
 * @returns True if length is in range
 */
export function isLengthInRange(text: string, min: number, max: number): boolean {
  return text.length >= min && text.length <= max;
}

/**
 * Validate that a value matches a pattern
 *
 * @param value - String to validate
 * @param pattern - Regular expression pattern
 * @returns True if value matches pattern
 */
export function matchesPattern(value: string, pattern: RegExp): boolean {
  return pattern.test(value);
}

/**
 * Validate IP address (IPv4)
 *
 * @param ip - IP address to validate
 * @returns True if IP is valid
 */
export function isValidIPv4(ip: string): boolean {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
}

/**
 * Validate domain name
 *
 * @param domain - Domain name to validate
 * @returns True if domain is valid
 */
export function isValidDomain(domain: string): boolean {
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  return domainRegex.test(domain);
}

/**
 * Validate username format
 * Allows: letters, numbers, underscores, hyphens (3-20 chars)
 *
 * @param username - Username to validate
 * @returns True if username is valid
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Check if a file extension is allowed
 *
 * @param filename - File name with extension
 * @param allowedExtensions - Array of allowed extensions (e.g., ['jpg', 'png'])
 * @returns True if file extension is allowed
 */
export function hasAllowedExtension(
  filename: string,
  allowedExtensions: string[]
): boolean {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? allowedExtensions.includes(extension) : false;
}

/**
 * Validate file size is within limit
 *
 * @param fileSize - File size in bytes
 * @param maxSize - Maximum size in bytes
 * @returns True if file size is within limit
 */
export function isFileSizeValid(fileSize: number, maxSize: number): boolean {
  return fileSize > 0 && fileSize <= maxSize;
}
