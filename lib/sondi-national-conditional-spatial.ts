import "server-only";
import { getNationalBoreholeIndex } from "./sondi-national-borehole-index";
import { getGeologyAtLocation } from "./geology-location";
import { getMappedGemFaultsBetweenPoints } from "./fault-spatial-profile";
import { getSpatialLithologyKey } from "./sondi-lithology-semantic";

/**
 * A uniform, strictly conditional NATIONAL spatial analogue, never a proven site log.
 * Considers every indexed borehole. No administrative region, fixed radius, top-N
 * truncation, mandated triangle or hardcoded sampling depths.
 * Only homogeneous, undamaged, original documented intervals qualify.
 * Missing mapped-unit evidence / source provenance / fault inventory are UNKNOWN,
 * not a reason to claim structural clearance. No unseen contact boundaries are created.
 */
export type NationalConditionalSpatialResult = {
  status: "CONDITIONAL_ANALOG" | "WITHHELD";
  material: string | null;
  source_ids: string[];
  borehole_ids: string[];
  observed_common_interval_m: [number, number] | null;
  reason: string;
  inspected_boreholes: number;
  matching_mapped_unit_boreholes: number;
  mapped_unit_code: string | null;
  target_map_status: string;
  verified_reference_boreholes: number;
  reference_map_unknown_boreholes: number;
  reference_map_different_boreholes: number;
  structural_continuity_proven: false;
  precise_site_depth_authorized: false;
};

export function resolveNationalConditionalSpatial(
  latitude: number, longitude: number, depthM: number,
): NationalConditionalSpatialResult {
  let targetMapStatus = "NOT_CHECKED";
  let verifiedReferences = 0;
  let unknownReferenceMaps = 0;
  let differentReferenceMaps = 0;
  const withheld = (reason: string, inspected = 0, matching = 0, mappedUnit: string | null = null): NationalConditionalSpatialResult => ({
    status: "WITHHELD", material: null, source_ids: [], borehole_ids: [],
    observed_common_interval_m: null, reason, inspected_boreholes: inspected,
    matching_mapped_unit_boreholes: matching, mapped_unit_code: mappedUnit,
    target_map_status: targetMapStatus,
    verified_reference_boreholes: verifiedReferences,
    reference_map_unknown_boreholes: unknownReferenceMaps,
    reference_map_different_boreholes: differentReferenceMaps,
    structural_continuity_proven: false, precise_site_depth_authorized: false,
  });
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !Number.isFinite(depthM) ||
      latitude < 40 || latitude > 45 || longitude < 20 || longitude > 30 || depthM < 0) {
    return withheld("INVALID_TARGET");
  }
  let target: ReturnType<typeof getGeologyAtLocation> | null = null;
  try {
    target = getGeologyAtLocation(latitude, longitude);
    targetMapStatus = target.status;
  } catch { targetMapStatus = "UNAVAILABLE"; }
  // Missing map evidence is UNKNOWN, not a geological contradiction.
  // Crucially, do not terminate before inspecting the original borehole logs.
  const unitCode = target?.status === "DIRECT" ? (target.unit?.code ?? null) : null;
  const candidates: Array<{
    id: string; material: string; key: string; from: number; to: number;
    sourceIds: string[];
  }> = [];
  let inspected = 0;
  let matched = 0;
  for (const hole of getNationalBoreholeIndex()) {
    if (hole.coordinate_status !== "OFFICIAL_EXACT" ||
        typeof hole.latitude !== "number" || typeof hole.longitude !== "number") continue;
    const atDepth = hole.intervals.filter(i => i.from_m !== null && i.to_m !== null &&
      i.from_m <= depthM && depthM < i.to_m);
    if (!atDepth.length) continue;
    inspected++;
    if (atDepth.length !== 1) continue; // Ambiguous source overlap.
    const interval = atDepth[0];
    if (interval.interval_status !== null ||
        !["borehole_exact", "documented_borehole_log"].includes(interval.evidence_level ?? "") ||
        interval.from_m === null || interval.to_m === null || !interval.source_ids.length) continue;
    const key = getSpatialLithologyKey(interval.material_bg);
    if (!key) continue;
    verifiedReferences++;
    let mapped: ReturnType<typeof getGeologyAtLocation> | null = null;
    try { mapped = getGeologyAtLocation(hole.latitude, hole.longitude); }
    catch { /* Geography unavailable: preserve it as unknown. */ }
    if (mapped?.status !== "DIRECT" || !mapped.unit?.code) {
      unknownReferenceMaps++;
      continue;
    }
    if (!unitCode) {
      // A mapped reference cannot resolve an unmapped target by itself.
      unknownReferenceMaps++;
      continue;
    }
    if (mapped.unit.code !== unitCode) {
      differentReferenceMaps++;
      continue;
    }
    matched++;
    // A zero count only means NO MAPPED GEM CROSSING; it is not proof of a shared block.
    let faults: ReturnType<typeof getMappedGemFaultsBetweenPoints>;
    try { faults = getMappedGemFaultsBetweenPoints(latitude, longitude, hole.latitude, hole.longitude); }
    catch { continue; }
    if (!faults || faults.intersection_count !== 0) continue;
    candidates.push({ id: hole.id, material: interval.material_bg, key,
      from: interval.from_m, to: interval.to_m, sourceIds: interval.source_ids });
  }
  if (!unitCode) {
    return withheld(
      targetMapStatus === "UNAVAILABLE" ? "TARGET_MAP_UNAVAILABLE_REFERENCES_INSPECTED" : "TARGET_MAP_NOT_DIRECT_REFERENCES_INSPECTED",
      inspected, matched, null,
    );
  }
  const unique = new Map(candidates.map(c => [c.id, c]));
  const observations = [...unique.values()];
  if (observations.length < 2) return withheld("LESS_THAN_TWO_INDEPENDENT_VERIFIED_REFERENCES", inspected, matched, unitCode);
  const keys = new Set(observations.map(o => o.key));
  if (keys.size !== 1) return withheld("CONFLICTING_LITHOLOGIES_IN_SAME_MAPPED_UNIT", inspected, matched, unitCode);
  const from = Math.max(...observations.map(o => o.from));
  const to = Math.min(...observations.map(o => o.to));
  if (!(to > from && from <= depthM && depthM < to)) {
    return withheld("REFERENCE_INTERVALS_HAVE_NO_COMMON_OBSERVED_OVERLAP", inspected, matched, unitCode);
  }
  // No interpolation or extrapolation of unobserved contacts. Observed common
  // overlap is only a description of the reference wells, never site boundaries.
  return {
    status: "CONDITIONAL_ANALOG", material: observations[0].material,
    source_ids: [...new Set(observations.flatMap(o => o.sourceIds))],
    borehole_ids: observations.map(o => o.id),
    observed_common_interval_m: [from, to],
    reason: "SAME_DIRECT_MAPPED_UNIT_AND_HOMOGENEOUS_VERIFIED_REFERENCE_LOGS; STRUCTURAL_CONTINUITY_NOT_PROVEN",
    inspected_boreholes: inspected, matching_mapped_unit_boreholes: matched,
    mapped_unit_code: unitCode,
    target_map_status: targetMapStatus,
    verified_reference_boreholes: verifiedReferences,
    reference_map_unknown_boreholes: unknownReferenceMaps,
    reference_map_different_boreholes: differentReferenceMaps,
    structural_continuity_proven: false, precise_site_depth_authorized: false,
  };
}
