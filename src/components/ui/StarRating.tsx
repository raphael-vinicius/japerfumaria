import { Star } from "lucide-react";
import clsx from "clsx";

interface Props {
  rating: number;
  size?: number;
  showValue?: boolean;
  count?: number;
  className?: string;
}

export function StarRating({
  rating,
  size = 14,
  showValue = false,
  count,
  className,
}: Props) {
  return (
    <div className={clsx("flex items-center gap-1.5", className)}>
      <div className="flex items-center" aria-label={`Nota ${rating} de 5`}>
        {Array.from({ length: 5 }).map((_, i) => {
          const fill = Math.max(0, Math.min(1, rating - i));
          return (
            <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
              <Star
                size={size}
                className="absolute inset-0 text-champagne/30"
                strokeWidth={1.5}
              />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star
                  size={size}
                  className="text-champagne fill-champagne"
                  strokeWidth={1.5}
                />
              </span>
            </span>
          );
        })}
      </div>
      {showValue && (
        <span className="text-xs font-semibold text-ink-700">
          {rating.toFixed(1)}
        </span>
      )}
      {typeof count === "number" && (
        <span className="text-xs text-ink-500">({count})</span>
      )}
    </div>
  );
}
