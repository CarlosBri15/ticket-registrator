import { lazy } from "react";

/**
 * LazyCharts — dynamic-import wrappers around the recharts-based primitives in
 * `Charts.tsx`. Importing from here means the recharts vendor chunk is only
 * downloaded on screens that actually render charts. Wrap consumer JSX in a
 * `<Suspense fallback={<ChartSkeleton .../>}>` boundary.
 */

// Single dynamic import is shared across both lazy bindings — the bundler
// emits one chunk for `Charts.tsx` (which transitively pulls recharts).
const chartsModule = () => import("./Charts");

export const DonutChart = lazy(() =>
  chartsModule().then((m) => ({ default: m.DonutChart })),
);

export const AreaTrendChart = lazy(() =>
  chartsModule().then((m) => ({ default: m.AreaTrendChart })),
);
