/**
 * Analytics - Public API
 *
 * Barrel export file for all analytics utilities.
 * Import from '@/lib/analytics' to access Google Analytics and event tracking.
 */

// Google Analytics component
export { GoogleAnalytics } from './google';

// Event tracking functions
export {
  trackEvent,
  trackPageView,
  trackSignUpClick,
  trackDemoRequest,
  trackContactForm,
  trackNewsletterSubscribe,
  trackResourceDownload,
  trackBlogPostView,
  trackCaseStudyView,
  trackVideoPlay,
  trackSolutionView,
  trackIndustryView,
  trackExternalLinkClick,
  trackSearch,
  trackFilter,
  trackSocialShare,
  trackSocialFollow,
  trackError,
  trackPerformance,
  trackScroll,
  trackClick,
  type AnalyticsEvent,
} from './events';
