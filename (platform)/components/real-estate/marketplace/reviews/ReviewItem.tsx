import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { StarRating } from './StarRating';
import { formatDistanceToNow } from 'date-fns';
import type { ReviewWithReviewer } from '@/lib/modules/marketplace';

interface ReviewItemProps {
  review: ReviewWithReviewer;
  showVerifiedBadge?: boolean;
}

/**
 * Review Item Component
 *
 * Displays a single tool review with:
 * - Reviewer avatar and name
 * - Star rating
 * - Review text
 * - Timestamp (relative)
 * - "Verified Purchase" badge
 */
export function ReviewItem({ review, showVerifiedBadge = true }: ReviewItemProps) {
  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-3 p-4 rounded-lg border bg-card">
      {/* Header: Avatar, Name, Rating */}
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={review.reviewer.avatar_url || undefined} alt={review.reviewer.name || 'User'} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(review.reviewer.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{review.reviewer.name || 'Anonymous'}</span>
              {showVerifiedBadge && (
                <Badge variant="secondary" className="text-xs">
                  Verified Purchase
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
            </span>
          </div>

          <StarRating rating={review.rating} size="sm" />
        </div>
      </div>

      {/* Review Text */}
      {review.review && (
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {review.review}
        </p>
      )}
    </div>
  );
}
