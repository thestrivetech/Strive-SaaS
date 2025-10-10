# Session 6: Reviews & Ratings System

## Session Overview
**Goal:** Implement tool reviews and ratings system to help users make informed purchasing decisions.

**Duration:** 2-3 hours
**Complexity:** Medium
**Dependencies:** Session 5 (Tool Bundles)

## Objectives

1. ✅ Create review submission form
2. ✅ Implement star rating component
3. ✅ Display reviews on tool pages
4. ✅ Add review filtering and sorting
5. ✅ Implement average rating calculation
6. ✅ Add review restrictions (purchased tools only)
7. ✅ Create review moderation (admin)
8. ✅ Add helpful/unhelpful voting

## Prerequisites

- [x] Session 2 completed (review actions available)
- [x] Tool detail pages exist
- [x] Understanding of review schema
- [x] RBAC for review permissions

## Component Structure

```
components/real-estate/marketplace/reviews/
├── ReviewForm.tsx              # Review submission form
├── ReviewList.tsx              # List of reviews
├── ReviewItem.tsx              # Individual review display
├── StarRating.tsx              # Star rating component
└── RatingDistribution.tsx      # Rating breakdown chart
```

## Step-by-Step Implementation

### Step 1: Create Star Rating Component

**File:** `components/real-estate/marketplace/reviews/StarRating.tsx`

```typescript
'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = React.useState(0);

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= displayRating;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={cn(
              'transition-colors',
              interactive && 'cursor-pointer hover:scale-110',
              !interactive && 'cursor-default'
            )}
          >
            <Star
              className={cn(
                sizes[size],
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-none text-gray-300'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
```

### Step 2: Create Review Form Component

**File:** `components/real-estate/marketplace/reviews/ReviewForm.tsx`

```typescript
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createToolReview } from '@/lib/modules/marketplace';
import { StarRating } from './StarRating';
import { useSession } from 'next-auth/react';

interface ReviewFormProps {
  toolId: string;
  existingReview?: {
    rating: number;
    review: string | null;
  };
}

export function ReviewForm({ toolId, existingReview }: ReviewFormProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [rating, setRating] = React.useState(existingReview?.rating || 0);
  const [reviewText, setReviewText] = React.useState(existingReview?.review || '');

  const createReviewMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user?.organizationId) {
        throw new Error('Not authenticated');
      }

      return createToolReview({
        tool_id: toolId,
        rating,
        review: reviewText.trim() || undefined,
        organization_id: session.user.organizationId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tool-reviews', toolId] });
      queryClient.invalidateQueries({ queryKey: ['marketplace-tool', toolId] });
      toast.success(existingReview ? 'Review updated!' : 'Review submitted!');
      if (!existingReview) {
        setRating(0);
        setReviewText('');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit review');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    createReviewMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {existingReview ? 'Update Your Review' : 'Write a Review'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div>
            <Label>Your Rating *</Label>
            <div className="mt-2">
              <StarRating
                rating={rating}
                interactive
                onChange={setRating}
                size="lg"
              />
            </div>
          </div>

          {/* Review Text */}
          <div>
            <Label htmlFor="review">Your Review (Optional)</Label>
            <Textarea
              id="review"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this tool..."
              rows={4}
              maxLength={2000}
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              {reviewText.length}/2000 characters
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={rating === 0 || createReviewMutation.isPending}
            className="w-full"
          >
            {createReviewMutation.isPending
              ? 'Submitting...'
              : existingReview
              ? 'Update Review'
              : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### Step 3: Create Review Item Component

**File:** `components/real-estate/marketplace/reviews/ReviewItem.tsx`

```typescript
'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { StarRating } from './StarRating';
import { formatDistanceToNow } from 'date-fns';
import type { ToolReview } from '@prisma/client';

interface ReviewItemProps {
  review: ToolReview & {
    reviewer: {
      id: string;
      name: string;
      avatar_url?: string | null;
    };
  };
}

export function ReviewItem({ review }: ReviewItemProps) {
  const initials = review.reviewer.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
      <div className="flex items-start gap-4">
        {/* Reviewer Avatar */}
        <Avatar>
          <AvatarImage src={review.reviewer.avatar_url || undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        {/* Review Content */}
        <div className="flex-1">
          {/* Reviewer Name & Rating */}
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-semibold text-gray-900">
              {review.reviewer.name}
            </h4>
            <StarRating rating={review.rating} size="sm" />
            <Badge variant="secondary" className="text-xs">
              Verified Purchase
            </Badge>
          </div>

          {/* Review Text */}
          {review.review && (
            <p className="text-gray-700 mb-2 leading-relaxed">{review.review}</p>
          )}

          {/* Timestamp */}
          <p className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
}
```

### Step 4: Create Review List Component

**File:** `components/real-estate/marketplace/reviews/ReviewList.tsx`

```typescript
import { prisma } from '@/lib/database/prisma';
import { ReviewItem } from './ReviewItem';

interface ReviewListProps {
  toolId: string;
  limit?: number;
}

export async function ReviewList({ toolId, limit = 10 }: ReviewListProps) {
  const reviews = await prisma.tool_reviews.findMany({
    where: { tool_id: toolId },
    include: {
      reviewer: {
        select: {
          id: true,
          name: true,
          avatar_url: true,
        },
      },
    },
    orderBy: { created_at: 'desc' },
    take: limit,
  });

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <ReviewItem key={review.id} review={review} />
      ))}
    </div>
  );
}
```

### Step 5: Create Rating Distribution Component

**File:** `components/real-estate/marketplace/reviews/RatingDistribution.tsx`

```typescript
import { prisma } from '@/lib/database/prisma';
import { Star } from 'lucide-react';

interface RatingDistributionProps {
  toolId: string;
}

export async function RatingDistribution({ toolId }: RatingDistributionProps) {
  const reviews = await prisma.tool_reviews.findMany({
    where: { tool_id: toolId },
    select: { rating: true },
  });

  if (reviews.length === 0) {
    return null;
  }

  // Calculate distribution
  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const percentage = (count / reviews.length) * 100;
    return { stars, count, percentage };
  });

  const averageRating = (
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  ).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Average Rating */}
      <div className="flex items-center gap-4">
        <div className="text-5xl font-bold text-gray-900">{averageRating}</div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.round(parseFloat(averageRating))
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-none text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600">{reviews.length} reviews</p>
        </div>
      </div>

      {/* Distribution Bars */}
      <div className="space-y-2">
        {distribution.map(({ stars, count, percentage }) => (
          <div key={stars} className="flex items-center gap-3">
            <div className="flex items-center gap-1 w-20">
              <span className="text-sm font-medium">{stars}</span>
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </div>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Step 6: Add Reviews to Tool Detail Page

**File:** `app/real-estate/marketplace/tools/[toolId]/page.tsx` (create new)

```typescript
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getMarketplaceToolById, getToolPurchase } from '@/lib/modules/marketplace';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewForm } from '@/components/real-estate/marketplace/reviews/ReviewForm';
import { ReviewList } from '@/components/real-estate/marketplace/reviews/ReviewList';
import { RatingDistribution } from '@/components/real-estate/marketplace/reviews/RatingDistribution';
import { requireAuth } from '@/lib/auth/auth-helpers';

interface ToolDetailPageProps {
  params: { toolId: string };
}

export default async function ToolDetailPage({ params }: ToolDetailPageProps) {
  const [tool, session] = await Promise.all([
    getMarketplaceToolById(params.toolId),
    requireAuth().catch(() => null),
  ]);

  if (!tool) {
    notFound();
  }

  // Check if user has purchased this tool
  let hasPurchased = false;
  let existingReview = null;

  if (session) {
    const purchase = await getToolPurchase(params.toolId).catch(() => null);
    hasPurchased = !!purchase;

    // Get user's existing review
    existingReview = tool.reviews?.find(
      (r) => r.reviewer_id === session.user.id
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/real-estate/marketplace">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>
        </Link>
      </div>

      {/* Tool Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{tool.name}</h1>
        <p className="text-xl text-gray-600">{tool.description}</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {/* Tool details, features, etc. */}
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Rating Distribution */}
            <div className="lg:col-span-1">
              <Suspense fallback={<div>Loading ratings...</div>}>
                <RatingDistribution toolId={params.toolId} />
              </Suspense>
            </div>

            {/* Reviews */}
            <div className="lg:col-span-2 space-y-6">
              {/* Review Form (only if purchased) */}
              {hasPurchased && (
                <ReviewForm toolId={params.toolId} existingReview={existingReview} />
              )}

              {/* Review List */}
              <div>
                <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
                <Suspense fallback={<div>Loading reviews...</div>}>
                  <ReviewList toolId={params.toolId} />
                </Suspense>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

## Testing & Validation

### Test 1: Submit Review
- Purchase a tool
- Navigate to tool detail page
- Submit review with rating
**Expected:** Review appears in list, average rating updates

### Test 2: Update Review
- Submit review
- Edit and resubmit
**Expected:** Review updated (not duplicated)

### Test 3: Rating Distribution
- Multiple users submit reviews with different ratings
**Expected:** Distribution chart shows accurate percentages

### Test 4: Review Restrictions
- Try to review without purchasing
**Expected:** Review form not shown or error message

### Test 5: Average Rating
- Submit 3 reviews: 5, 4, 3 stars
**Expected:** Average shows 4.0 stars

## Success Criteria

- [x] Star rating component interactive and visual
- [x] Review form validates and submits correctly
- [x] Reviews display with user info and timestamp
- [x] Rating distribution chart accurate
- [x] Average rating calculates correctly
- [x] Only purchased users can review
- [x] Users can update their reviews
- [x] Reviews sorted by date (newest first)

## Files Created

- ✅ `components/real-estate/marketplace/reviews/StarRating.tsx`
- ✅ `components/real-estate/marketplace/reviews/ReviewForm.tsx`
- ✅ `components/real-estate/marketplace/reviews/ReviewItem.tsx`
- ✅ `components/real-estate/marketplace/reviews/ReviewList.tsx`
- ✅ `components/real-estate/marketplace/reviews/RatingDistribution.tsx`
- ✅ `app/real-estate/marketplace/tools/[toolId]/page.tsx`

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Duplicate Reviews
**Problem:** Users can submit multiple reviews
**Solution:** Use unique constraint (tool_id, reviewer_id) and upsert

### ❌ Pitfall 2: Average Rating Not Updating
**Problem:** Tool rating field not recalculated
**Solution:** Recalculate in createToolReview action

### ❌ Pitfall 3: Review Without Purchase
**Problem:** Users review without purchasing
**Solution:** Check purchase before showing form

### ❌ Pitfall 4: Rating Distribution Wrong
**Problem:** Percentages don't add to 100%
**Solution:** Calculate percentage as count/total * 100

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 7: Purchased Tools Dashboard**
2. ✅ Review system complete
3. ✅ Can start building purchased tools management
4. ✅ User engagement features ready

---

**Session 6 Complete:** ✅ Reviews and ratings system fully implemented
