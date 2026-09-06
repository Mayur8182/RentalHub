import { useState } from 'react';
import './StarRating.css';

/**
 * StarRating
 *
 * Props:
 *   value      — current rating (number 0–5)
 *   onChange   — (rating) => void  — if provided the component is interactive
 *   size       — 'sm' | 'md' | 'lg'  (default 'md')
 *   showValue  — bool, display numeric value next to stars (default false)
 *   count      — number of reviews to show alongside (optional)
 */
function StarRating({ value = 0, onChange, size = 'md', showValue = false, count }) {
  const interactive = typeof onChange === 'function';
  const [hovered, setHovered] = useState(0);

  const display = interactive ? (hovered || value) : value;

  return (
    <span className={`stars stars--${size} ${interactive ? 'stars--interactive' : ''}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        // Partial fill for display mode (e.g. 4.3 → 4th star 30% filled)
        const full = display >= star;
        const partial = !full && display > star - 1 && !interactive;
        const fillPct = partial ? Math.round((display - (star - 1)) * 100) : 0;

        return (
          <span
            key={star}
            className={`star ${full ? 'star--full' : partial ? 'star--partial' : 'star--empty'}`}
            style={partial ? { '--fill': `${fillPct}%` } : undefined}
            onClick={interactive ? () => onChange(star) : undefined}
            onMouseEnter={interactive ? () => setHovered(star) : undefined}
            onMouseLeave={interactive ? () => setHovered(0) : undefined}
            role={interactive ? 'button' : undefined}
            aria-label={interactive ? `Rate ${star} star${star !== 1 ? 's' : ''}` : undefined}
          >
            ★
          </span>
        );
      })}

      {showValue && value > 0 && (
        <span className="stars-value">{value.toFixed(1)}</span>
      )}
      {count !== undefined && (
        <span className="stars-count">
          {count === 0 ? 'No reviews yet' : `${count} review${count !== 1 ? 's' : ''}`}
        </span>
      )}
    </span>
  );
}

export default StarRating;
