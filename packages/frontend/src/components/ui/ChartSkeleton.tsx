interface ChartSkeletonProps {
  /** Height in px (defaults to 200, matches the kit default chart height). */
  height?: number;
  /** Optional extra class for container layout overrides. */
  className?: string;
}

/**
 * ChartSkeleton — pulsing placeholder rendered as the Suspense fallback for
 * lazy-loaded Recharts wrappers. Keeps layout stable while the recharts chunk
 * downloads on first paint.
 */
export const ChartSkeleton = ({ height = 200, className }: ChartSkeletonProps) => (
  <div
    role="presentation"
    aria-hidden={true}
    className={`w-full bg-dark/5 rounded-md animate-pulse ${className ?? ""}`.trim()}
    style={{ height }}
  />
);
