'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StarRating } from './StarRating';
import { createToolReview } from '@/lib/modules/marketplace';
import { Send, Loader2 } from 'lucide-react';

interface ReviewFormProps {
  toolId: string;
  existingReview?: {
    id: string;
    rating: number;
    review: string | null;
  } | null;
  onSuccess?: () => void;
}

/**
 * Review Form Component
 *
 * Allows users to submit or update a tool review
 *
 * Features:
 * - Interactive star rating (required)
 * - Optional review text (max 2000 chars with counter)
 * - Upsert pattern (create or update)
 * - Character counter
 * - Success/error toasts
 * - Loading states
 */
export function ReviewForm({ toolId, existingReview, onSuccess }: ReviewFormProps) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [reviewText, setReviewText] = useState(existingReview?.review || '');

  const maxChars = 2000;
  const remainingChars = maxChars - reviewText.length;

  const createReviewMutation = useMutation({
    mutationFn: async () => {
      return createToolReview({
        tool_id: toolId,
        rating,
        review: reviewText.trim() || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tool-reviews', toolId] });
      queryClient.invalidateQueries({ queryKey: ['review-stats', toolId] });
      queryClient.invalidateQueries({ queryKey: ['user-review', toolId] });
      toast.success(
        existingReview ? 'Review updated successfully!' : 'Review submitted successfully!'
      );
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit review');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }

    if (reviewText.length > maxChars) {
      toast.error(`Review text exceeds ${maxChars} characters`);
      return;
    }

    createReviewMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Star Rating */}
      <div className="space-y-2">
        <Label htmlFor="rating" className="text-base font-semibold">
          Your Rating <span className="text-red-500">*</span>
        </Label>
        <div className="flex items-center gap-4">
          <StarRating
            rating={rating}
            interactive
            onChange={setRating}
            size="lg"
          />
          {rating > 0 && (
            <span className="text-sm text-muted-foreground">
              {rating} {rating === 1 ? 'star' : 'stars'}
            </span>
          )}
        </div>
      </div>

      {/* Review Text */}
      <div className="space-y-2">
        <Label htmlFor="review-text" className="text-base font-semibold">
          Your Review (Optional)
        </Label>
        <Textarea
          id="review-text"
          placeholder="Share your experience with this tool..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={6}
          className="resize-none"
          maxLength={maxChars}
        />
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Optional: Share details about your experience</span>
          <span
            className={remainingChars < 100 ? 'text-orange-500' : ''}
          >
            {remainingChars} characters remaining
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={rating === 0 || createReviewMutation.isPending}
          className="min-w-[140px]"
        >
          {createReviewMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              {existingReview ? 'Update Review' : 'Submit Review'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
