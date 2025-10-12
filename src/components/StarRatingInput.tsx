
'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingInputProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  maxRating?: number;
  className?: string;
}

export default function StarRatingInput({
  rating,
  onRatingChange,
  maxRating = 5,
  className,
}: StarRatingInputProps) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            type="button"
            key={index}
            onClick={() => onRatingChange(starValue)}
            onMouseEnter={() => setHoverRating(starValue)}
            onMouseLeave={() => setHoverRating(0)}
            className="cursor-pointer"
          >
            <Star
              className={cn(
                'h-6 w-6 transition-colors',
                (hoverRating || rating) >= starValue
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300 fill-gray-300'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
