import { Star } from 'lucide-react';

interface StarRatingProps {
  stars: number;
  maxStars?: number;
  size?: number;
  showCount?: boolean;
  animated?: boolean;
}

export default function StarRating({
  stars,
  maxStars = 3,
  size = 24,
  showCount = false,
  animated = false,
}: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxStars }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={`${
            i < stars
              ? 'text-yellow-400 fill-yellow-400 drop-shadow-sm'
              : 'text-gray-300'
          } ${animated ? 'star-appear' : ''}`}
          style={animated ? { animationDelay: `${i * 0.2}s` } : undefined}
        />
      ))}
      {showCount && (
        <span className="ml-1 font-bold text-yellow-500">{stars}</span>
      )}
    </div>
  );
}
