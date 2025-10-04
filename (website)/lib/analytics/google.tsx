'use client';

/**
 * Google Analytics Component
 *
 * Loads Google Analytics 4 script for tracking website analytics.
 * Only loads in production to avoid tracking during development.
 */

import Script from 'next/script';

interface GoogleAnalyticsProps {
  /** Google Analytics Measurement ID (e.g., "G-XXXXXXXXXX") */
  gaId: string;
}

/**
 * Google Analytics component
 *
 * Add to root layout to enable GA tracking across all pages.
 * Automatically skips loading in development environment.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { GoogleAnalytics } from '@/lib/analytics';
 *
 * export default function RootLayout({ children }) {
 *   const gaId = process.env.NEXT_PUBLIC_GA_ID;
 *
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         {gaId && <GoogleAnalytics gaId={gaId} />}
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  // Only load in production
  if (!gaId || process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />

      {/* Initialize GA */}
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

/**
 * Type declaration for window.gtag
 */
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
