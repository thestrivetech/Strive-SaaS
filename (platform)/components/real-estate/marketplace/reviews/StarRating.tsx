'use client';

import React, { useState } from 'react';
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

/**
 * Star Rating Component
 *
 * Displays star ratings in two modes:
 * - Display mode: Shows filled/empty stars based on rating (static)
 * - Interactive mode: Allows user to select rating (hover + click)
 *
 * Features:
 * - Keyboard accessible (tab + arrow keys when interactive)
 * - Responsive sizes (sm, md, lg)
 * - Yellow stars with hover effects
 * - Half-star support via decimal ratings
 */
export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [focusedStar, setFocusedStar] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const handleClick = (starValue: number) => {
    if (interactive && onChange) {
      onChange(starValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, starValue: number) => {
    if (!interactive || !onChange) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(starValue);
    } else if (e.key === 'ArrowRight' && starValue < maxRating) {
      e.preventDefault();
      setFocusedStar(starValue + 1);
    } else if (e.key === 'ArrowLeft' && starValue > 1) {
      e.preventDefault();
      setFocusedStar(starValue - 1);
    }
  };

  const getStarFill = (starValue: number) => {
    const currentRating = interactive && hoverRating > 0 ? hoverRating : rating;

    if (currentRating >= starValue) {
      return 'fill';
    } else if (currentRating >= starValue - 0.5) {
      return 'half';
    }
    return 'empty';
  };

  return (
    <div
      className={cn('flex items-center gap-1', className)}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={
        interactive
          ? `Rate from 1 to ${maxRating} stars`
          : `Rating: ${rating} out of ${maxRating} stars`
      }
    >
      {Array.from({ length: maxRating }, (_, i) => {
        const starValue = i + 1;
        const fill = getStarFill(starValue);
        const isFocused = focusedStar === starValue;

        return (
          <button
            key={starValue}
            type="button"
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onFocus={() => interactive && setFocusedStar(starValue)}
            onBlur={() => interactive && setFocusedStar(null)}
            onKeyDown={(e) => handleKeyDown(e, starValue)}
            disabled={!interactive}
            className={cn(
              'transition-all duration-150',
              interactive && 'cursor-pointer hover:scale-110 focus:outline-none',
              interactive && isFocused && 'ring-2 ring-yellow-400 rounded',
              !interactive && 'cursor-default'
            )}
            role={interactive ? 'radio' : undefined}
            aria-checked={interactive ? rating === starValue : undefined}
            aria-label={interactive ? `${starValue} star${starValue > 1 ? 's' : ''}` : undefined}
            tabIndex={interactive ? (isFocused || (!focusedStar && starValue === 1) ? 0 : -1) : -1}
          >
            <Star
              className={cn(
                sizeClasses[size],
                'transition-colors duration-150',
                fill === 'fill' && 'fill-yellow-400 text-yellow-400',
                fill === 'half' && 'fill-yellow-400/50 text-yellow-400',
                fill === 'empty' && 'fill-none text-gray-300 dark:text-gray-600',
                interactive &&
                  hoverRating >= starValue &&
                  'fill-yellow-400 text-yellow-400'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
