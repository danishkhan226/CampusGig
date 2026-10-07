import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({
  rating = 0,
  maxStars = 5,
  size = 'md', // 'sm' | 'md' | 'lg'
  interactive = false,
  onChange = null,
  showScore = false,
  scoreClass = 'text-xs font-semibold text-slate-700'
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };

  const starSize = sizeClasses[size] || sizeClasses.md;
  const currentRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[...Array(maxStars)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = currentRating >= starValue;

          return (
            <button
              key={index}
              type={interactive ? 'button' : undefined}
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              className={`${
                interactive
                  ? 'cursor-pointer transition-transform hover:scale-110 focus:outline-none'
                  : 'cursor-default pointer-events-none'
              }`}
              aria-label={`${starValue} Stars`}
            >
              <Star
                className={`${starSize} transition-colors ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-200 fill-slate-100'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showScore && (
        <span className={scoreClass}>
          {rating > 0 ? Number(rating).toFixed(1) : '0.0'}
        </span>
      )}
    </div>
  );
}
