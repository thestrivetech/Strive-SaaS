/**
 * Formatting Utilities
 *
 * Provides consistent formatting for dates, numbers, text, and URLs
 * throughout the marketing website.
 */

/**
 * Format a date string or Date object
 *
 * @param date - Date to format
 * @param format - Format type ('short', 'long', 'iso')
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'long' | 'iso' = 'long'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (format === 'iso') {
    return dateObj.toISOString();
  }

  const options: Intl.DateTimeFormatOptions =
    format === 'short'
      ? { month: 'short', day: 'numeric', year: 'numeric' }
      : { month: 'long', day: 'numeric', year: 'numeric' };

  return dateObj.toLocaleDateString('en-US', options);
}

/**
 * Format a date relative to now (e.g., "2 days ago", "in 3 weeks")
 *
 * @param date - Date to format
 * @returns Relative date string
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (Math.abs(diffSec) < 60) {
    return 'just now';
  } else if (Math.abs(diffMin) < 60) {
    const count = Math.abs(diffMin);
    const unit = count === 1 ? 'minute' : 'minutes';
    return diffMin > 0 ? `in ${count} ${unit}` : `${count} ${unit} ago`;
  } else if (Math.abs(diffHour) < 24) {
    const count = Math.abs(diffHour);
    const unit = count === 1 ? 'hour' : 'hours';
    return diffHour > 0 ? `in ${count} ${unit}` : `${count} ${unit} ago`;
  } else if (Math.abs(diffDay) < 7) {
    const count = Math.abs(diffDay);
    const unit = count === 1 ? 'day' : 'days';
    return diffDay > 0 ? `in ${count} ${unit}` : `${count} ${unit} ago`;
  } else if (Math.abs(diffWeek) < 4) {
    const count = Math.abs(diffWeek);
    const unit = count === 1 ? 'week' : 'weeks';
    return diffWeek > 0 ? `in ${count} ${unit}` : `${count} ${unit} ago`;
  } else if (Math.abs(diffMonth) < 12) {
    const count = Math.abs(diffMonth);
    const unit = count === 1 ? 'month' : 'months';
    return diffMonth > 0 ? `in ${count} ${unit}` : `${count} ${unit} ago`;
  } else {
    const count = Math.abs(diffYear);
    const unit = count === 1 ? 'year' : 'years';
    return diffYear > 0 ? `in ${count} ${unit}` : `${count} ${unit} ago`;
  }
}

/**
 * Format a number with thousand separators
 *
 * @param num - Number to format
 * @returns Formatted number string (e.g., "1,234,567")
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Format a number as currency
 *
 * @param amount - Amount to format
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format a number as a percentage
 *
 * @param value - Value to format (0-1 or 0-100)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string (e.g., "45.5%")
 */
export function formatPercentage(value: number, decimals = 1): string {
  const percentage = value > 1 ? value : value * 100;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Create a URL-friendly slug from text
 *
 * @param text - Text to convert to slug
 * @returns URL-friendly slug (e.g., "hello-world")
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Truncate text to a maximum length with ellipsis
 *
 * @param text - Text to truncate
 * @param length - Maximum length
 * @param suffix - Suffix to add (default: '...')
 * @returns Truncated text
 */
export function truncate(text: string, length: number, suffix = '...'): string {
  if (text.length <= length) {
    return text;
  }

  return text.slice(0, length - suffix.length) + suffix;
}

/**
 * Pluralize a word based on count
 *
 * @param count - Number determining singular/plural
 * @param singular - Singular form of word
 * @param plural - Plural form (optional, defaults to singular + 's')
 * @returns Pluralized string with count (e.g., "1 item", "5 items")
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string
): string {
  const word = count === 1 ? singular : plural || `${singular}s`;
  return `${count} ${word}`;
}

/**
 * Capitalize the first letter of a string
 *
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Convert text to title case
 *
 * @param text - Text to convert
 * @returns Title-cased text
 */
export function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Extract initials from a name
 *
 * @param name - Full name
 * @returns Initials (e.g., "John Doe" -> "JD")
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
}

/**
 * Format a file size in bytes to human-readable format
 *
 * @param bytes - Size in bytes
 * @param decimals - Number of decimal places
 * @returns Formatted size (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Format a phone number to standard US format
 *
 * @param phone - Phone number string (digits only or formatted)
 * @returns Formatted phone (e.g., "(123) 456-7890")
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone; // Return as-is if not a valid format
}

/**
 * Format reading time based on word count
 *
 * @param wordCount - Number of words
 * @param wordsPerMinute - Average reading speed (default: 200)
 * @returns Reading time string (e.g., "5 min read")
 */
export function formatReadingTime(
  wordCount: number,
  wordsPerMinute = 200
): string {
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}
