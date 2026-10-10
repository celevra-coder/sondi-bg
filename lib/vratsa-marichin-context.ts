import "server-only";
import fs from "node:fs";
import path from "node:path";

type Coordinate = [number, number];

type SiteRecord = {
  record_id: string;
  geometry: {
    type: string;
    coordinates: Coordinate[][];
  };
  associated_lithology_records: string[];
  spatial_evidence: {
    production_eligible: boolean;
    individual_borehole_coordinates_verified: boolean;
  };
};

type DocumentedInterval = {
  from_m: number;
  to_m: number | null;
  material: string;
  evidence_kind: string;
};

type ControlRecord = {
  record_id: string;
  borehole_name: string;
  site?: string | null;
  profile_evidence_qualification?: string;
  spatial_interpolation_ready?: boolean;
  source_ids?: string[];
  lithology?: {
    documented_intervals?: DocumentedInterval[];
  };
};

type ControlDatabase = {
  controls: ControlRecord[];
};

export type MarichinLocalContext = {
  site_id: string;
  spatial_relation: "INSIDE_VERIFIED_SITE_BOUNDARY";
  production_eligible: false;
  evidence_type: "LOCAL_SITE_CONTEXT_NOT_TARGET_BOREHOLE";
  individual_borehole_coordinates_verified: false;
  interpolation_allowed: false;
  profiles: {
    record_id: string;
    name: string;
    site: string | null;
    evidence_qualification: string;
    documented_intervals: DocumentedInterval[];
    source_ids: string[];
  }[];
  limitations: string[];
};

function loadSite(): SiteRecord {
  const file = path.join(
    process.cwd(),
    "data",
    "soil-lithology",
    "research",
    "vratsa_marichin_valog_spatial_control.json"
  );

  return JSON.parse(
    fs.readFileSync(file, "utf8")
  ) as SiteRecord;
}

function loadControls(): ControlDatabase {
  const file = path.join(
    process.cwd(),
    "data",
    "soil-lithology",
    "research",
    "vratsa_borehole_controls_draft.json"
  );

  return JSON.parse(
    fs.readFileSync(file, "utf8")
  ) as ControlDatabase;
}

function onSegment(
  x: number,
  y: number,
  a: Coordinate,
  b: Coordinate
): boolean {
  const cross =
    (x - a[0]) * (b[1] - a[1]) -
    (y - a[1]) * (b[0] - a[0]);

  if (Math.abs(cross) > 1e-10) {
    return false;
  }

  return (
    x >= Math.min(a[0], b[0]) - 1e-10 &&
    x <= Math.max(a[0], b[0]) + 1e-10 &&
    y >= Math.min(a[1], b[1]) - 1e-10 &&
    y <= Math.max(a[1], b[1]) + 1e-10
  );
}

function insideRing(
  longitude: number,
  latitude: number,
  ring: Coordinate[]
): boolean {
  let inside = false;

  for (
    let i = 0, j = ring.length - 1;
    i < ring.length;
    j = i++
  ) {
    const a = ring[j];
    const b = ring[i];

    if (onSegment(longitude, latitude, a, b)) {
      return true;
    }

    const intersects =
      (a[1] > latitude) !== (b[1] > latitude) &&
      longitude <
        ((b[0] - a[0]) * (latitude - a[1])) /
          (b[1] - a[1]) +
          a[0];

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

export function getMarichinLocalContext(
  latitude: number,
  longitude: number
): MarichinLocalContext | null {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  // Fast rejection outside the site's bounding rectangle.
  if (
    latitude < 43.732 ||
    latitude > 43.741 ||
    longitude < 23.723 ||
    longitude > 23.736
  ) {
    return null;
  }

  const site = loadSite();

  if (
    site.record_id !== "VRA-SPATIAL-MARICHIN-001" ||
    site.geometry.type !== "Polygon" ||
    !Array.isArray(site.geometry.coordinates) ||
    !Array.isArray(site.geometry.coordinates[0])
  ) {
    return null;
  }

  const rings = site.geometry.coordinates;

  if (!insideRing(longitude, latitude, rings[0])) {
    return null;
  }

  // Exclude any interior polygon holes.
  if (
    rings.slice(1).some((ring) =>
      insideRing(longitude, latitude, ring)
    )
  ) {
    return null;
  }

  const database = loadControls();

  const ids = new Set(
    site.associated_lithology_records
  );

  const records = database.controls.filter(
    (record) => ids.has(record.record_id)
  );

  if (
    records.length !== 3 ||
    records.some(
      (record) =>
        record.spatial_interpolation_ready !== false
    )
  ) {
    throw new Error(
      "Marichin site evidence is incomplete or not safely qualified."
    );
  }

  const profiles = records.map((record) => ({
    record_id: record.record_id,
    name: record.borehole_name,
    site: record.site ?? null,
    evidence_qualification:
      record.profile_evidence_qualification ??
      "SITE_PROFILE_POSITION_UNRESOLVED",
    documented_intervals:
      record.lithology?.documented_intervals ?? [],
    source_ids: record.source_ids ?? [],
  }));

  return {
    site_id: site.record_id,
    spatial_relation:
      "INSIDE_VERIFIED_SITE_BOUNDARY",
    production_eligible: false,
    evidence_type:
      "LOCAL_SITE_CONTEXT_NOT_TARGET_BOREHOLE",
    individual_borehole_coordinates_verified: false,
    interpolation_allowed: false,
    profiles,
    limitations: [
      "Site boundary is not an individual borehole position.",
      "Infiltrometer profiles are not identical to sampling borehole logs.",
      "The three local profiles remain separate observations.",
      "Open-ended clay intervals do not establish arbitrary deeper lithology.",
      "No spatial interpolation is permitted.",
      "Not approved for direct public presentation."
    ],
  };
}