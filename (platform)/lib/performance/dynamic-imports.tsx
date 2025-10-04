import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import type { ComponentType } from 'react';

/**
 * Dynamic Imports for Code Splitting
 *
 * This module provides utilities for lazy loading components to reduce initial bundle size.
 *
 * Benefits:
 * - Smaller initial bundle (faster page loads)
 * - Components load on demand
 * - Better Core Web Vitals (LCP, FID)
 * - Automatic code splitting
 */

/**
 * Default loading component
 *
 * Shows a skeleton placeholder while component loads
 */
const DefaultLoading = () => (
  <div className="flex h-full w-full items-center justify-center">
    <Skeleton className="h-full w-full" />
  </div>
);

/**
 * Create a dynamically imported component with loading state
 *
 * @param importFn - Function that returns dynamic import
 * @param options - Dynamic import options
 * @returns Dynamically loaded component
 *
 * @example
 * ```typescript
 * // Instead of:
 * import HeavyChart from './HeavyChart';
 *
 * // Use:
 * const HeavyChart = createDynamicComponent(() => import('./HeavyChart'));
 * ```
 */
export function createDynamicComponent<P = any>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: {
    loading?: ComponentType;
    ssr?: boolean;
  } = {}
): ComponentType<P> {
  const { loading = DefaultLoading, ssr = false } = options;

  return dynamic(importFn, {
    loading: loading as any,
    ssr,
  });
}

/**
 * Create a dynamically imported component with custom loading skeleton
 *
 * @param importFn - Function that returns dynamic import
 * @param loadingClassName - Tailwind classes for skeleton
 * @returns Dynamically loaded component
 *
 * @example
 * ```typescript
 * const DynamicChart = createDynamicWithSkeleton(
 *   () => import('./Chart'),
 *   'h-[400px] w-full'
 * );
 * ```
 */
export function createDynamicWithSkeleton<P = any>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  loadingClassName?: string
): ComponentType<P> {
  const LoadingComponent = () => (
    <Skeleton className={loadingClassName || 'h-full w-full'} />
  );

  return dynamic(importFn, {
    loading: LoadingComponent,
    ssr: false,
  });
}

// ============================================================================
// Pre-configured Dynamic Components
// ============================================================================

/**
 * Dynamically loaded chart component
 *
 * Charts are usually heavy and not needed immediately on page load.
 * NOTE: Commented out - chart.tsx exports multiple named exports, no default
 */
// export const DynamicChart = createDynamicWithSkeleton(
//   () => import('@/components/ui/chart'),
//   'h-[400px] w-full rounded-lg'
// );

/**
 * Dynamically loaded data table
 *
 * Tables with sorting, filtering, pagination can be large.
 * NOTE: Commented out - data-table.tsx does not exist
 */
// export const DynamicDataTable = createDynamicWithSkeleton(
//   () => import('@/components/ui/data-table'),
//   'h-[600px] w-full rounded-lg'
// );

/**
 * Dynamically loaded modal/dialog
 *
 * Modals are often not needed on initial page load.
 * NOTE: Commented out - dialog.tsx exports multiple named exports, no default
 */
// export const DynamicModal = createDynamicComponent(
//   () => import('@/components/ui/dialog'),
//   { ssr: false }
// );

/**
 * Dynamically loaded rich text editor
 *
 * Editors are heavy and rarely needed immediately.
 * NOTE: Commented out - editor.tsx does not exist
 */
// export const DynamicEditor = createDynamicWithSkeleton(
//   () => import('@/components/ui/editor').then((mod) => ({ default: mod.Editor })),
//   'h-[500px] w-full rounded-lg'
// );

/**
 * Dynamically loaded calendar
 *
 * Calendars have many dependencies and can be large.
 * NOTE: Commented out - calendar.tsx exports Calendar as named export, no default
 */
// export const DynamicCalendar = createDynamicWithSkeleton(
//   () => import('@/components/ui/calendar'),
//   'h-[350px] w-full rounded-lg'
// );

/**
 * Dynamically loaded code editor
 *
 * Code editors (Monaco, CodeMirror) are very heavy.
 * NOTE: Commented out - code-editor.tsx does not exist
 */
// export const DynamicCodeEditor = createDynamicWithSkeleton(
//   () => import('@/components/ui/code-editor').then((mod) => ({ default: mod.CodeEditor })),
//   'h-[600px] w-full rounded-lg'
// );

// ============================================================================
// Route-based Code Splitting Helpers
// ============================================================================

/**
 * Dynamically load a page component
 *
 * Use this for heavy page components that don't need SSR.
 *
 * @param importFn - Function that returns page import
 * @returns Dynamically loaded page component
 *
 * @example
 * ```typescript
 * // In app/dashboard/analytics/page.tsx
 * const AnalyticsPage = createDynamicPage(() => import('./AnalyticsContent'));
 *
 * export default AnalyticsPage;
 * ```
 */
export function createDynamicPage<P = any>(
  importFn: () => Promise<{ default: ComponentType<P> }>
): ComponentType<P> {
  return dynamic(importFn, {
    loading: () => (
      <div className="container mx-auto py-8">
        <Skeleton className="mb-4 h-8 w-64" />
        <Skeleton className="mb-4 h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    ),
    ssr: false,
  });
}

/**
 * Preload a dynamic component
 *
 * Use this to preload components before they're needed.
 *
 * @param importFn - Function that returns component import
 *
 * @example
 * ```typescript
 * // Preload on hover
 * <button
 *   onMouseEnter={() => preloadComponent(() => import('./HeavyModal'))}
 * >
 *   Open Modal
 * </button>
 * ```
 */
export async function preloadComponent(
  importFn: () => Promise<{ default: ComponentType }>
): Promise<void> {
  try {
    await importFn();
  } catch (error) {
    console.error('Failed to preload component:', error);
  }
}
