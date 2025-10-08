import { ContentListSkeleton } from '@/components/real-estate/content/shared/content-skeleton';

/**
 * Content Page Loading State
 *
 * Displayed while content list is being fetched
 */
export default function ContentLoading() {
  return <ContentListSkeleton />;
}
