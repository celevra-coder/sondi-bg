import "server-only";
import { getNationalBoreholeIndex } from "./sondi-national-borehole-index";

// SONDI_DOB_STEP06_EXACT_SOIL_ACCESS_V1
// Permit raster lookup only at the documented borehole collars.
// This does not extend any regional boundary or invent soil data.
const eligibleIds = new Set(["DOB-BH-025", "DOB-BH-040"]);

export function isSondiExactBoreholeSoilAccess(
  latitude: number,
  longitude: number
): boolean {
  if (!Number.isFinite(latitude) ||
      !Number.isFinite(longitude)) return false;

  return getNationalBoreholeIndex().some(hole =>
    eligibleIds.has(hole.id) &&
    hole.origin === "NATIONAL" &&
    hole.coordinate_status === "OFFICIAL_EXACT" &&
    hole.latitude !== null &&
    hole.longitude !== null &&
    Math.abs(hole.latitude - latitude) <= 0.000001 &&
    Math.abs(hole.longitude - longitude) <= 0.000001 &&
    hole.intervals.some(interval =>
      interval.interval_status === null &&
      interval.from_m !== null &&
      interval.to_m !== null &&
      Number.isFinite(interval.from_m) &&
      Number.isFinite(interval.to_m) &&
      interval.to_m > interval.from_m &&
      interval.source_ids.length > 0
    )
  );
}
