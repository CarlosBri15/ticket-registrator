import { lazy } from "react";

/**
 * LazyDashboardCharts — dynamic-import wrappers around the recharts-heavy
 * dashboard sections. Importing from here splits recharts out of the main
 * bundle so login + non-dashboard routes do not pay for the dependency.
 *
 * Wrap each consumer in a `<Suspense fallback={<ChartSkeleton .../>}>` boundary.
 */

export const AnalyticsSection = lazy(() =>
  import("./AnalyticsSection").then((m) => ({ default: m.AnalyticsSection })),
);

export const OrgGrowthChart = lazy(() =>
  import("./OrgGrowthChart").then((m) => ({ default: m.OrgGrowthChart })),
);

export const OrgDistributionChart = lazy(() =>
  import("./OrgDistributionChart").then((m) => ({ default: m.OrgDistributionChart })),
);
