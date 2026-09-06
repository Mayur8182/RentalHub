import './Skeleton.css';

/**
 * Generic shimmer skeleton block.
 * width / height / borderRadius can be passed as style overrides.
 */
export function Skeleton({ width, height, borderRadius, className = '', style = {} }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius, ...style }}
    />
  );
}

/** Full vehicle card skeleton — matches the fleet grid card shape */
export function VehicleCardSkeleton() {
  return (
    <div className="skeleton-card">
      <Skeleton className="skeleton-card-img" />
      <div className="skeleton-card-body">
        <Skeleton height="20px" width="70%" style={{ marginBottom: 8 }} />
        <Skeleton height="14px" width="45%" style={{ marginBottom: 8 }} />
        <Skeleton height="14px" width="55%" style={{ marginBottom: 14 }} />
        <Skeleton height="36px" borderRadius="4px" />
      </div>
    </div>
  );
}

/** Vehicle detail page skeleton */
export function VehicleDetailSkeleton() {
  return (
    <div className="skeleton-detail">
      {/* Left column */}
      <div className="skeleton-detail-left">
        <Skeleton className="skeleton-detail-img" />
        <div className="skeleton-detail-card">
          <Skeleton height="28px" width="55%" style={{ marginBottom: 10 }} />
          <Skeleton height="16px" width="30%" style={{ marginBottom: 20 }} />
          <div className="skeleton-specs-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-spec-item">
                <Skeleton height="20px" width="24px" style={{ marginBottom: 6 }} />
                <Skeleton height="12px" width="60%" style={{ marginBottom: 4 }} />
                <Skeleton height="16px" width="80%" />
              </div>
            ))}
          </div>
        </div>
        <div className="skeleton-detail-card">
          <Skeleton height="18px" width="120px" style={{ marginBottom: 14 }} />
          <Skeleton height="14px" style={{ marginBottom: 6 }} />
          <Skeleton height="14px" style={{ marginBottom: 6 }} />
          <Skeleton height="14px" width="80%" />
        </div>
      </div>
      {/* Right column */}
      <div className="skeleton-detail-right">
        <div className="skeleton-detail-card">
          <Skeleton height="32px" width="160px" style={{ marginBottom: 24 }} />
          <Skeleton height="44px" style={{ marginBottom: 12 }} />
          <Skeleton height="44px" style={{ marginBottom: 20 }} />
          <Skeleton height="72px" style={{ marginBottom: 16 }} />
          <Skeleton height="48px" borderRadius="4px" />
        </div>
      </div>
    </div>
  );
}
