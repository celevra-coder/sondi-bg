import "server-only";

import {
  getNationalBoreholeIndex,
  type IndexedInterval,
  type IndexedBorehole,
} from "./sondi-national-borehole-index";

// Contacts are observed in reference columns.
// They are NOT automatically projected to other coordinates.

export type NationalDocumentedContact = {
  borehole_id: string;
  latitude: number;
  longitude: number;
  coordinate_status: string | null;
  origin: "NATIONAL" | "REGIONAL";
  depth_m: number;
  upper_material_bg: string;
  lower_material_bg: string;
  upper_stratigraphy: string | null;
  lower_stratigraphy: string | null;
  contact_type:
    | "STRATIGRAPHIC_BOUNDARY"
    | "LITHOLOGICAL_BOUNDARY";
  source_ids: string[];
  evidence_levels: string[];
  interpretation_scope: "REFERENCE_BOREHOLE_ONLY";
};

export type DocumentedContactQuery = {
  boreholeId?: string;
  latitude?: number;
  longitude?: number;
  coordinateToleranceDegrees?: number;
};

function validInterval(
  interval: IndexedInterval,
  hole: IndexedBorehole
): boolean {
  if (
    interval.from_m === null ||
    interval.to_m === null ||
    !Number.isFinite(interval.from_m) ||
    !Number.isFinite(interval.to_m) ||
    interval.from_m < 0 ||
    interval.to_m <= interval.from_m ||
    !interval.material_bg.trim() ||
    interval.interval_status !== null
  ) {
    return false;
  }

  if (hole.origin === "NATIONAL") {
    return (
      interval.evidence_level === "borehole_exact" ||
      interval.evidence_level === "documented_borehole_log"
    );
  }

  return interval.evidence_level === "regional_documented_interval";
}

function normalizedStratigraphy(
  value: string | null
): string | null {
  const result = value?.trim().toUpperCase() ?? "";
  return result || null;
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

export function extractContactsFromBorehole(
  hole: IndexedBorehole
): NationalDocumentedContact[] {
  if (
    hole.latitude === null ||
    hole.longitude === null ||
    !Number.isFinite(hole.latitude) ||
    !Number.isFinite(hole.longitude)
  ) {
    return [];
  }

  // A regional reference is kept separate from a surveyed
  // official-exact coordinate in its provenance.
  const allowedCoordinate =
    hole.coordinate_status === "OFFICIAL_EXACT" ||
    (
      hole.origin === "REGIONAL" &&
      hole.coordinate_status === "REGIONAL_DOCUMENTED"
    );

  if (!allowedCoordinate) return [];

  const intervals = hole.intervals
    .filter(interval => validInterval(interval, hole))
    .sort(
      (a, b) =>
        a.from_m! - b.from_m! ||
        a.to_m! - b.to_m!
    );

  const contacts: NationalDocumentedContact[] = [];

  for (let i = 1; i < intervals.length; i++) {
    const upper = intervals[i - 1];
    const lower = intervals[i];

    // Only explicitly adjoining, non-overlapping intervals
    // can establish a documented contact.
    const gap = lower.from_m! - upper.to_m!;

    if (Math.abs(gap) > 0.001) continue;

    const upperStrat = normalizedStratigraphy(
      upper.stratigraphy
    );
    const lowerStrat = normalizedStratigraphy(
      lower.stratigraphy
    );

    const stratigraphyChanged =
      upperStrat !== null &&
      lowerStrat !== null &&
      upperStrat !== lowerStrat;

    const materialChanged =
      upper.material_bg.trim() !==
      lower.material_bg.trim();

    if (!stratigraphyChanged && !materialChanged) {
      continue;
    }

    contacts.push({
      borehole_id: hole.id,
      latitude: hole.latitude,
      longitude: hole.longitude,
      coordinate_status: hole.coordinate_status,
      origin: hole.origin,
      depth_m: upper.to_m!,
      upper_material_bg: upper.material_bg,
      lower_material_bg: lower.material_bg,
      upper_stratigraphy: upperStrat,
      lower_stratigraphy: lowerStrat,
      contact_type: stratigraphyChanged
        ? "STRATIGRAPHIC_BOUNDARY"
        : "LITHOLOGICAL_BOUNDARY",
      source_ids: unique([
        ...upper.source_ids,
        ...lower.source_ids,
      ]),
      evidence_levels: unique([
        upper.evidence_level ?? "",
        lower.evidence_level ?? "",
      ]),
      interpretation_scope: "REFERENCE_BOREHOLE_ONLY",
    });
  }

  return contacts;
}

// One national algorithm; no municipality or province branches.
export function getNationalDocumentedContacts(
  query: DocumentedContactQuery = {}
): NationalDocumentedContact[] {
  const {
    boreholeId,
    latitude,
    longitude,
    coordinateToleranceDegrees = 0.000001,
  } = query;

  if (
    !Number.isFinite(coordinateToleranceDegrees) ||
    coordinateToleranceDegrees < 0 ||
    (latitude !== undefined && !Number.isFinite(latitude)) ||
    (longitude !== undefined && !Number.isFinite(longitude))
  ) {
    return [];
  }

  return getNationalBoreholeIndex()
    .filter(hole =>
      (!boreholeId || hole.id === boreholeId) &&
      (latitude === undefined ||
        (hole.latitude !== null &&
         Math.abs(hole.latitude - latitude) <=
           coordinateToleranceDegrees)) &&
      (longitude === undefined ||
        (hole.longitude !== null &&
         Math.abs(hole.longitude - longitude) <=
           coordinateToleranceDegrees))
    )
    .flatMap(extractContactsFromBorehole)
    .sort(
      (a, b) =>
        a.borehole_id.localeCompare(b.borehole_id) ||
        a.depth_m - b.depth_m
    );
}
