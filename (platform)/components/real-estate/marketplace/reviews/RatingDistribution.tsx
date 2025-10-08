import React from 'react';
import { Progress } from '@/components/ui/progress';
import { StarRating } from './StarRating';
import { getReviewStats } from '@/lib/modules/marketplace';
import { Star } from 'lucide-react';

interface RatingDistributionProps {
  toolId: string;
}

/**
 * Rating Distribution Component (Server Component)
 *
 * Displays rating statistics for a tool:
 * - Average rating (large display)
 * - Total review count
 * - Rating distribution (5-star to 1-star) with bar chart
 *
 * Features:
 * - Server-side data fetching
 * - Visual bar chart for each star rating
 * - Percentage display
 * - Color-coded bars
 */
export async function RatingDistribution({ toolId }: RatingDistributionProps) {
  const stats = await getReviewStats(toolId);

  const getPercentage = (count: number) => {
    if (stats.totalReviews === 0) return 0;
    return Math.round((count / stats.totalReviews) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Average Rating Display */}
      <div className="text-center space-y-2">
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-5xl font-bold">{stats.averageRating.toFixed(1)}</span>
          <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
        </div>
        <StarRating rating={stats.averageRating} size="md" className="justify-center" />
        <p className="text-sm text-muted-foreground">
          Based on {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
        </p>
      </div>

      {/* Rating Distribution */}
      {stats.totalReviews > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Rating Breakdown</h4>

          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.ratingDistribution[rating as 1 | 2 | 3 | 4 | 5];
            const percentage = getPercentage(count);

            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </div>

                <Progress
                  value={percentage}
                  className="h-2 flex-1"
                />

                <span className="text-xs text-muted-foreground w-12 text-right">
                  {count} ({percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      )}

      {stats.totalReviews === 0 && (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">
            No ratings yet
          </p>
        </div>
      )}
    </div>
  );
}
