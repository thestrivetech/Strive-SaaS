import React from 'react';
import { ReviewItem } from './ReviewItem';
import { getToolReviews } from '@/lib/modules/marketplace';
import { AlertCircle } from 'lucide-react';

interface ReviewListProps {
  toolId: string;
  limit?: number;
}

/**
 * Review List Component (Server Component)
 *
 * Fetches and displays reviews for a tool
 *
 * Features:
 * - Server-side data fetching
 * - Sorted by created_at DESC (newest first)
 * - Empty state handling
 * - Pagination support via limit
 */
export async function ReviewList({ toolId, limit = 10 }: ReviewListProps) {
  const reviews = await getToolReviews(toolId, {
    limit,
    offset: 0,
    sort_by: 'created_at',
    sort_order: 'desc',
  });

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="font-semibold text-lg mb-2">No reviews yet</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Be the first to review this tool! Share your experience to help others make informed decisions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">
          Customer Reviews ({reviews.length})
        </h3>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </div>

      {reviews.length >= limit && (
        <p className="text-sm text-muted-foreground text-center pt-4">
          Showing {limit} most recent reviews
        </p>
      )}
    </div>
  );
}
