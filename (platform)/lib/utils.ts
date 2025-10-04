import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency (USD)
 * @param value - The number to format
 * @param options - Intl.NumberFormat options
 * @returns Formatted currency string
 * @example
 * formatCurrency(1234.56) // "$1,234.56"
 * formatCurrency(1000000) // "$1,000,000.00"
 */
export function formatCurrency(
  value: number | string,
  options?: Intl.NumberFormatOptions
): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return '$0.00';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(numValue);
}

/**
 * Get initials from a name
 * @param name - Full name
 * @returns Initials (max 2 characters)
 * @example
 * getInitials("John Doe") // "JD"
 * getInitials("Jane") // "JA"
 */
export function getInitials(name: string): string {
  if (!name || name.trim().length === 0) {
    return '??';
  }

  const parts = name.trim().split(' ');

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Format a number with thousand separators
 * @param value - The number to format
 * @param options - Intl.NumberFormat options
 * @returns Formatted number string
 * @example
 * formatNumber(1234) // "1,234"
 * formatNumber(1000000) // "1,000,000"
 */
export function formatNumber(
  value: number | string,
  options?: Intl.NumberFormatOptions
): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return '0';
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options,
  }).format(numValue);
}

/**
 * Format a date relative to now
 * @param date - Date to format
 * @returns Relative time string
 * @example
 * formatRelativeTime(new Date()) // "just now"
 * formatRelativeTime(pastDate) // "2 hours ago"
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
}
