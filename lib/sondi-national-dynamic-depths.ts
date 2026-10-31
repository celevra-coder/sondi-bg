import "server-only";
import { getNationalBoreholeIndex } from "./sondi-national-borehole-index";

export type NationalDynamicIntervalEvidence = {
  from_m: number;
  to_m: number;
  midpoint_m: number;
  scope: "EXACT_BOREHOLE" | "NEARBY_REFERENCE_ONLY";
  borehole_ids: string[];
  materials: string[];
  source_ids: string[];
  spatial_transfer_approved: false;
};

const RADIANS = Math.PI / 180;

function distanceKm(
  latitude: number,
  longitude: number,
  otherLat: number,
  otherLon: number
): number {
  const a = (otherLat - latitude) * RADIANS;
  const b = (otherLon - longitude) * RADIANS;
  const h = Math.sin(a / 2) ** 2 +
    Math.cos(latitude * RADIANS) *
    Math.cos(otherLat * RADIANS) *
    Math.sin(b / 2) ** 2;

  return 12742.0176 *
    Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * One national evidence collector for any GPS point.
 *
 * Exact intervals are observations at registered borehole
 * coordinates. Nearby intervals remain reference evidence.
 * Neither may be automatically reclassified as a verified
 * spatial prediction beneath neighbouring property.
 */
export function getNationalDynamicIntervals(
  latitude: number,
  longitude: number,
  radiusKm = 15
): NationalDynamicIntervalEvidence[] {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 || latitude > 90 ||
    longitude < -180 || longitude > 180 ||
    !Number.isFinite(radiusKm) || radiusKm <= 0
  ) return [];

  const nearby = getNationalBoreholeIndex()
    .filter(h =>
      h.latitude !== null &&
      h.longitude !== null &&
      Number.isFinite(h.latitude) &&
      Number.isFinite(h.longitude) &&
      (
        h.coordinate_status === "OFFICIAL_EXACT" ||
        h.coordinate_status === "REGIONAL_DOCUMENTED"
      )
    )
    .map(h => ({
      hole: h,
      distance: distanceKm(
        latitude, longitude,
        h.latitude!, h.longitude!
      )
    }))
    .filter(x => x.distance <= radiusKm)
    .sort((a,b) =>
      a.distance - b.distance ||
      a.hole.id.localeCompare(b.hole.id)
    );

  const exact = nearby.filter(x =>
    Math.abs(x.hole.latitude! - latitude) <= 0.000001 &&
    Math.abs(x.hole.longitude! - longitude) <= 0.000001
  );

  const selected = exact.length ? exact : nearby;

  const observations = selected.flatMap(({hole}) =>
    hole.intervals.filter(i =>
      i.from_m !== null &&
      i.to_m !== null &&
      Number.isFinite(i.from_m) &&
      Number.isFinite(i.to_m) &&
      i.from_m >= 0 &&
      i.to_m > i.from_m &&
      i.interval_status === null &&
      i.material_bg.trim().length > 0 &&
      (
        (
          hole.origin === "NATIONAL" &&
          (
            i.evidence_level === "borehole_exact" ||
            i.evidence_level === "documented_borehole_log"
          )
        ) ||
        (
          hole.origin === "REGIONAL" &&
          i.evidence_level === "regional_documented_interval"
        )
      )
    ).map(i => ({hole,interval:i}))
  );

  if(observations.length === 0) return [];

  const boundaries = [...new Set(
    observations.flatMap(x => [
      x.interval.from_m!,
      x.interval.to_m!
    ])
  )].sort((a,b) => a-b);

  const result: NationalDynamicIntervalEvidence[] = [];

  for(let j=0; j<boundaries.length-1; j++) {
    const from = boundaries[j];
    const to = boundaries[j+1];
    if(to <= from) continue;

    const supporting = observations.filter(x =>
      x.interval.from_m! <= from &&
      x.interval.to_m! >= to
    );

    if(!supporting.length) continue;

    const unique = (values: string[]) =>
      [...new Set(values.filter(Boolean))].sort();

    result.push({
      from_m:from,
      to_m:to,
      midpoint_m:(from+to)/2,
      scope:exact.length
        ? "EXACT_BOREHOLE"
        : "NEARBY_REFERENCE_ONLY",
      borehole_ids:unique(
        supporting.map(x=>x.hole.id)
      ),
      materials:unique(
        supporting.map(x=>x.interval.material_bg.trim())
      ),
      source_ids:unique(
        supporting.flatMap(x=>x.interval.source_ids)
      ),
      spatial_transfer_approved:false
    });
  }

  return result;
}

/**
 * Compatibility adapter for the existing depth-at-point
 * evaluation. The principal evidence is the interval above.
 * Midpoints must never be displayed as documented contacts.
 */
export function getNationalDynamicDepths(
  latitude: number,
  longitude: number
): number[] {
  return getNationalDynamicIntervals(latitude,longitude)
    .map(x=>x.midpoint_m);
}


export type NationalReferenceColumn = {
  borehole_id: string;
  distance_km: number;
  intervals: Array<{
    from_m: number;
    to_m: number;
    material: string;
    stratigraphy: string | null;
    source_ids: string[];
  }>;
};

/**
 * Original observations at neighbouring borehole locations.
 * Never claimed as a measured or predicted column at the target.
 */
export function getNationalReferenceColumns(
  latitude: number,
  longitude: number,
  radiusKm = 15,
  maxColumns = 8
): NationalReferenceColumn[] {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 || latitude > 90 ||
    longitude < -180 || longitude > 180 ||
    !Number.isFinite(radiusKm) ||
    radiusKm <= 0 ||
    !Number.isInteger(maxColumns) ||
    maxColumns < 1
  ) return [];

  return getNationalBoreholeIndex()
    .filter(h =>
      h.latitude !== null &&
      h.longitude !== null &&
      Number.isFinite(h.latitude) &&
      Number.isFinite(h.longitude) &&
      (
        h.coordinate_status === "OFFICIAL_EXACT" ||
        h.coordinate_status === "REGIONAL_DOCUMENTED"
      )
    )
    .map(h => ({
      hole: h,
      distance: distanceKm(
        latitude, longitude,
        h.latitude!, h.longitude!
      )
    }))
    .filter(x =>
      x.distance <= radiusKm &&
      !(
        Math.abs(x.hole.latitude! - latitude) <= 0.000001 &&
        Math.abs(x.hole.longitude! - longitude) <= 0.000001
      )
    )
    .map(({hole,distance}) => ({
      borehole_id: hole.id,
      distance_km: distance,
      intervals: hole.intervals
        .filter(i =>
          i.from_m !== null &&
          i.to_m !== null &&
          Number.isFinite(i.from_m) &&
          Number.isFinite(i.to_m) &&
          i.from_m >= 0 &&
          i.to_m > i.from_m &&
          i.interval_status === null &&
          i.material_bg.trim().length > 0 &&
          (
            (hole.origin === "NATIONAL" &&
              (i.evidence_level === "borehole_exact" ||
               i.evidence_level === "documented_borehole_log")) ||
            (hole.origin === "REGIONAL" &&
              i.evidence_level === "regional_documented_interval")
          )
        )
        .map(i => ({
          from_m: i.from_m!,
          to_m: i.to_m!,
          material: i.material_bg,
          stratigraphy: i.stratigraphy,
          source_ids: i.source_ids
        }))
        .sort((a,b) => a.from_m - b.from_m)
    }))
    .filter(x => x.intervals.length > 0)
    .sort((a,b) =>
      a.distance_km - b.distance_km ||
      a.borehole_id.localeCompare(b.borehole_id)
    )
    .slice(0,maxColumns);
}
