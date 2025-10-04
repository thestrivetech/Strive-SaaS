/**
 * Analytics Event Tracking
 *
 * Type-safe event tracking functions for Google Analytics.
 * Use these functions to track user interactions and conversions.
 */

/**
 * Analytics event types (discriminated union for type safety)
 */
export type AnalyticsEvent =
  // User engagement
  | { name: 'page_view'; page: string; title?: string }
  | { name: 'scroll'; depth: number; page: string }
  | { name: 'click'; element: string; page: string }

  // Conversions
  | { name: 'sign_up_clicked'; source: string; plan?: string }
  | { name: 'demo_requested'; source: string; industry?: string }
  | { name: 'contact_form_submitted'; page: string; formType: string }
  | { name: 'newsletter_subscribed'; source: string }

  // Content engagement
  | { name: 'resource_downloaded'; resourceType: string; resourceId: string; title: string }
  | { name: 'blog_post_viewed'; postId: string; title: string; category?: string }
  | { name: 'case_study_viewed'; caseStudyId: string; industry: string }
  | { name: 'video_played'; videoId: string; title: string }

  // Navigation
  | { name: 'solution_viewed'; solutionId: string; solutionName: string }
  | { name: 'industry_viewed'; industryId: string; industryName: string }
  | { name: 'external_link_clicked'; url: string; location: string }

  // Search & filtering
  | { name: 'search'; query: string; resultsCount?: number }
  | { name: 'filter_applied'; filterType: string; filterValue: string }

  // Social & sharing
  | { name: 'social_share'; platform: string; contentType: string; contentId: string }
  | { name: 'social_follow'; platform: string }

  // Errors & performance
  | { name: 'error'; errorType: string; errorMessage: string; page: string }
  | { name: 'performance'; metric: string; value: number; page: string };

/**
 * Track an analytics event
 *
 * @param event - Event to track
 *
 * @example
 * ```ts
 * trackEvent({ name: 'sign_up_clicked', source: 'homepage', plan: 'pro' });
 * ```
 */
export function trackEvent(event: AnalyticsEvent): void {
  // Check if running on client side
  if (typeof window === 'undefined') {
    return;
  }

  // Check if gtag is available
  if (!window.gtag) {
    console.warn('Google Analytics not loaded. Event not tracked:', event);
    return;
  }

  // Send event to GA
  const { name, ...params } = event;
  window.gtag('event', name, params);

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', name, params);
  }
}

/**
 * Track page view
 *
 * @param page - Page path
 * @param title - Page title (optional)
 */
export function trackPageView(page: string, title?: string): void {
  trackEvent({ name: 'page_view', page, title });
}

/**
 * Track sign-up button click
 *
 * @param source - Where the sign-up was initiated (e.g., 'homepage', 'pricing')
 * @param plan - Selected plan (optional)
 */
export function trackSignUpClick(source: string, plan?: string): void {
  trackEvent({ name: 'sign_up_clicked', source, plan });
}

/**
 * Track demo request
 *
 * @param source - Where the demo was requested (e.g., 'header', 'hero')
 * @param industry - Selected industry (optional)
 */
export function trackDemoRequest(source: string, industry?: string): void {
  trackEvent({ name: 'demo_requested', source, industry });
}

/**
 * Track contact form submission
 *
 * @param page - Page where form was submitted
 * @param formType - Type of form (e.g., 'contact', 'support', 'sales')
 */
export function trackContactForm(page: string, formType = 'contact'): void {
  trackEvent({ name: 'contact_form_submitted', page, formType });
}

/**
 * Track newsletter subscription
 *
 * @param source - Where the subscription occurred (e.g., 'footer', 'blog')
 */
export function trackNewsletterSubscribe(source: string): void {
  trackEvent({ name: 'newsletter_subscribed', source });
}

/**
 * Track resource download
 *
 * @param resourceType - Type of resource (e.g., 'whitepaper', 'ebook', 'guide')
 * @param resourceId - Resource identifier
 * @param title - Resource title
 */
export function trackResourceDownload(
  resourceType: string,
  resourceId: string,
  title: string
): void {
  trackEvent({ name: 'resource_downloaded', resourceType, resourceId, title });
}

/**
 * Track blog post view
 *
 * @param postId - Blog post ID
 * @param title - Blog post title
 * @param category - Blog category (optional)
 */
export function trackBlogPostView(
  postId: string,
  title: string,
  category?: string
): void {
  trackEvent({ name: 'blog_post_viewed', postId, title, category });
}

/**
 * Track case study view
 *
 * @param caseStudyId - Case study ID
 * @param industry - Industry name
 */
export function trackCaseStudyView(caseStudyId: string, industry: string): void {
  trackEvent({ name: 'case_study_viewed', caseStudyId, industry });
}

/**
 * Track video play
 *
 * @param videoId - Video ID
 * @param title - Video title
 */
export function trackVideoPlay(videoId: string, title: string): void {
  trackEvent({ name: 'video_played', videoId, title });
}

/**
 * Track solution page view
 *
 * @param solutionId - Solution ID
 * @param solutionName - Solution name
 */
export function trackSolutionView(solutionId: string, solutionName: string): void {
  trackEvent({ name: 'solution_viewed', solutionId, solutionName });
}

/**
 * Track industry page view
 *
 * @param industryId - Industry ID
 * @param industryName - Industry name
 */
export function trackIndustryView(industryId: string, industryName: string): void {
  trackEvent({ name: 'industry_viewed', industryId, industryName });
}

/**
 * Track external link click
 *
 * @param url - External URL
 * @param location - Where the link was clicked (e.g., 'footer', 'blog-post')
 */
export function trackExternalLinkClick(url: string, location: string): void {
  trackEvent({ name: 'external_link_clicked', url, location });
}

/**
 * Track search query
 *
 * @param query - Search query
 * @param resultsCount - Number of results (optional)
 */
export function trackSearch(query: string, resultsCount?: number): void {
  trackEvent({ name: 'search', query, resultsCount });
}

/**
 * Track filter application
 *
 * @param filterType - Type of filter (e.g., 'category', 'industry')
 * @param filterValue - Filter value
 */
export function trackFilter(filterType: string, filterValue: string): void {
  trackEvent({ name: 'filter_applied', filterType, filterValue });
}

/**
 * Track social share
 *
 * @param platform - Social platform (e.g., 'twitter', 'linkedin')
 * @param contentType - Type of content (e.g., 'blog', 'case-study')
 * @param contentId - Content ID
 */
export function trackSocialShare(
  platform: string,
  contentType: string,
  contentId: string
): void {
  trackEvent({ name: 'social_share', platform, contentType, contentId });
}

/**
 * Track social follow
 *
 * @param platform - Social platform (e.g., 'twitter', 'linkedin')
 */
export function trackSocialFollow(platform: string): void {
  trackEvent({ name: 'social_follow', platform });
}

/**
 * Track error
 *
 * @param errorType - Error type
 * @param errorMessage - Error message
 * @param page - Page where error occurred
 */
export function trackError(
  errorType: string,
  errorMessage: string,
  page: string
): void {
  trackEvent({ name: 'error', errorType, errorMessage, page });
}

/**
 * Track performance metric
 *
 * @param metric - Metric name (e.g., 'LCP', 'FID', 'CLS')
 * @param value - Metric value
 * @param page - Page where measured
 */
export function trackPerformance(metric: string, value: number, page: string): void {
  trackEvent({ name: 'performance', metric, value, page });
}

/**
 * Track scroll depth
 *
 * @param depth - Scroll depth percentage
 * @param page - Page being scrolled
 */
export function trackScroll(depth: number, page: string): void {
  trackEvent({ name: 'scroll', depth, page });
}

/**
 * Track element click
 *
 * @param element - Element identifier (e.g., 'cta-button', 'nav-link')
 * @param page - Page where clicked
 */
export function trackClick(element: string, page: string): void {
  trackEvent({ name: 'click', element, page });
}

/**
 * Type declaration for window.gtag
 */
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}
