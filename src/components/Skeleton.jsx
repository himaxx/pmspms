/**
 * Skeleton — generic shimmer block.
 *
 * Props:
 *   width    (string) — CSS width,  default '100%'
 *   height   (string) — CSS height, default '1rem'
 *   radius   (string) — CSS border-radius, default '6px'
 *   className (string) — extra Tailwind classes
 */
export default function Skeleton({
  width    = '100%',
  height   = '1rem',
  radius   = '6px',
  className = '',
}) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

/**
 * JobCardSkeleton — mimics a JobCard's 3-line layout.
 */
export function JobCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
      {/* Title row: job number + item */}
      <div className="flex items-center gap-3">
        <Skeleton width="4rem"  height="1rem" />
        <Skeleton width="8rem"  height="1rem" />
      </div>
      {/* Sub-row: size / qty / reason */}
      <div className="flex items-center gap-3">
        <Skeleton width="3.5rem" height="0.75rem" />
        <Skeleton width="3rem"   height="0.75rem" />
        <Skeleton width="6rem"   height="0.75rem" />
      </div>
      {/* Badge row */}
      <div className="flex items-center gap-2">
        <Skeleton width="5rem"  height="1.25rem" radius="999px" />
        <Skeleton width="4.5rem" height="1.25rem" radius="999px" />
      </div>
    </div>
  );
}
