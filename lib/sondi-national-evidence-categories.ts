// SONDI_NATIONAL_EVIDENCE_SHARED_CONTRACT_V1
// Shared by exact borehole client display and Luna's initial
// verified depth observations. Evidence category is NOT coordinate proof.
// Do not add region-specific evidence labels to consumers.

import type { IndexedInterval } from "./sondi-national-borehole-index";

export const NATIONAL_DOCUMENTED_LITHOLOGY_CATEGORIES =
  new Set<string>([
    "ACTUAL_BOREHOLE_LITHOLOGY_REPORTED_IN_EIA_PROSE",
    "ACTUAL_ENGINEERING_BOREHOLE_LOG",
    "DOCUMENTED_ACTUAL_BOREHOLE_SECTION",
    "OFFICIAL_ACTUAL_BOREHOLE_GEOLOGICAL_SECTION",
    "OFFICIAL_ACTUAL_BOREHOLE_SECTION",
    "PUBLISHED_ACTUAL_BOREHOLE_STRATIGRAPHIC_INTERVAL",
    "PUBLISHED_BOREHOLE_LITHOSTRATIGRAPHIC_INTERVAL",
    "borehole_exact",
    "documented_borehole_interval_research_review",
    "documented_borehole_log",
    "published_borehole_lithology",
  ]);

export function isNationalDocumentedLithologyInterval(
  interval: IndexedInterval
): boolean {
  return (
    NATIONAL_DOCUMENTED_LITHOLOGY_CATEGORIES.has(
      interval.evidence_level ?? ""
    ) &&
    interval.interval_status === null &&
    interval.from_m !== null &&
    interval.to_m !== null &&
    Number.isFinite(interval.from_m) &&
    Number.isFinite(interval.to_m) &&
    interval.from_m >= 0 &&
    interval.to_m > interval.from_m &&
    interval.material_bg.trim().length > 0 &&
    interval.source_ids.some(id => id.trim().length > 0)
  );
}
