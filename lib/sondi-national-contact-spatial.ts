import "server-only";

import {
  getNationalDocumentedContacts,
  type NationalDocumentedContact,
} from "./sondi-national-contacts";
import { getGeologyAtLocation } from "./geology-location";
import { getMappedGemFaultsBetweenPoints } from "./fault-spatial-profile";

// Observations near a requested location, NOT a subsurface
// prediction at the requested coordinates.
export type NationalDocumentedContactContext = {
  upper_stratigraphy: string;
  lower_stratigraphy: string;
  documented_depth_range_m: [number, number];
  controls: {
    borehole_id: string;
    distance_km: number;
    documented_depth_m: number;
    source_ids: string[];
  }[];
  depth_prediction_approved: false;
  geological_continuity_verified: false;
  interpretation_scope: "NEARBY_REFERENCE_BOREHOLES_ONLY";
};

export function getNationalDocumentedContactContext(
  latitude: number,
  longitude: number,
  searchRadiusKm = 5
): NationalDocumentedContactContext[] {
  if (
    !Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
    !Number.isFinite(longitude) || longitude < -180 || longitude > 180 ||
    !Number.isFinite(searchRadiusKm) || searchRadiusKm <= 0
  ) return [];

  const groups = new Map<
    string,
    {
      contact: NationalDocumentedContact;
      distance_km: number;
    }[]
  >();

  for (const contact of getNationalDocumentedContacts()) {
    if (
      contact.origin !== "NATIONAL" ||
      contact.coordinate_status !== "OFFICIAL_EXACT" ||
      contact.contact_type !== "STRATIGRAPHIC_BOUNDARY" ||
      !contact.upper_stratigraphy ||
      !contact.lower_stratigraphy
    ) continue;

    const distance = km(
      latitude, longitude,
      contact.latitude, contact.longitude
    );
    if (distance > searchRadiusKm) continue;

    const key = JSON.stringify([
      contact.upper_stratigraphy,
      contact.lower_stratigraphy
    ]);

    const entries = groups.get(key) ?? [];
    entries.push({contact, distance_km: distance});
    groups.set(key, entries);
  }

  const results: NationalDocumentedContactContext[] = [];

  for (const entries of groups.values()) {
    // Only distinct documented coordinates count as
    // independent reference controls.
    const distinct = new Map<string, typeof entries[number]>();

    for (const entry of entries.sort(
      (a, b) => a.distance_km - b.distance_km
    )) {
      const c = entry.contact;
      const key = [
        c.latitude.toFixed(7),
        c.longitude.toFixed(7)
      ].join(":");

      if (!distinct.has(key)) distinct.set(key, entry);
    }

    const selected = [...distinct.values()].slice(0, 3);
    if (selected.length < 2) continue;

    const depths = selected.map(x => x.contact.depth_m);
    const first = selected[0].contact;

    results.push({
      upper_stratigraphy: first.upper_stratigraphy!,
      lower_stratigraphy: first.lower_stratigraphy!,
      documented_depth_range_m: [
        Math.min(...depths),
        Math.max(...depths)
      ],
      controls: selected.map(x => ({
        borehole_id: x.contact.borehole_id,
        distance_km: Math.round(x.distance_km * 1000) / 1000,
        documented_depth_m: x.contact.depth_m,
        source_ids: x.contact.source_ids
      })),
      depth_prediction_approved: false,
      geological_continuity_verified: false,
      interpretation_scope: "NEARBY_REFERENCE_BOREHOLES_ONLY"
    });
  }

  return results.sort(
    (a, b) =>
      Math.min(...a.controls.map(x => x.distance_km)) -
      Math.min(...b.controls.map(x => x.distance_km))
  );
}

export type NationalSpatialContact = {
  status: "EXPLORATORY_CONTACT_ESTIMATE";
  upper_stratigraphy: string;
  lower_stratigraphy: string;
  estimated_depth_m: number;
  documented_depth_range_m: [number, number];
  control_borehole_ids: string[];
  source_ids: string[];
  mapped_surface_unit: string;
  control_count: number;
  geological_block_verified: false;
  depth_prediction_approved: false;
  research_only: true;
};

type Control = NationalDocumentedContact & {
  distance_km: number;
};

function km(
  a: number, b: number, c: number, d: number
): number {
  const r = Math.PI / 180;
  const y = (c - a) * r;
  const x = (d - b) * r;
  const h = Math.sin(y / 2) ** 2 +
    Math.cos(a * r) * Math.cos(c * r) *
    Math.sin(x / 2) ** 2;
  return 12742 * Math.asin(Math.min(1, Math.sqrt(h)));
}

function cross(
  a: [number, number],
  b: [number, number],
  p: [number, number]
): number {
  return (b[0] - a[0]) * (p[1] - a[1]) -
    (b[1] - a[1]) * (p[0] - a[0]);
}

function withinTriangle(
  lat: number,
  lon: number,
  a: Control,
  b: Control,
  c: Control
): boolean {
  const A: [number, number] = [a.longitude, a.latitude];
  const B: [number, number] = [b.longitude, b.latitude];
  const C: [number, number] = [c.longitude, c.latitude];
  const P: [number, number] = [lon, lat];

  const area = cross(A, B, C);
  if (Math.abs(area) < 1e-12) return false;

  const s1 = cross(A, B, P);
  const s2 = cross(B, C, P);
  const s3 = cross(C, A, P);
  const epsilon = 1e-12;

  return area > 0
    ? s1 >= -epsilon && s2 >= -epsilon && s3 >= -epsilon
    : s1 <= epsilon && s2 <= epsilon && s3 <= epsilon;
}

export function resolveNationalSpatialContacts(
  latitude: number,
  longitude: number
): NationalSpatialContact[] {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 || latitude > 90 ||
    longitude < -180 || longitude > 180
  ) return [];

  const target = getGeologyAtLocation(latitude, longitude);

  // A broadly similar GLiM surface category is NOT
  // sufficient to establish stratigraphic continuity.
  if (target.status !== "DIRECT" || !target.unit?.code) {
    return [];
  }

  const groups = new Map<string, Control[]>();

  for (const contact of getNationalDocumentedContacts()) {
    if (
      contact.origin !== "NATIONAL" ||
      contact.coordinate_status !== "OFFICIAL_EXACT" ||
      contact.contact_type !== "STRATIGRAPHIC_BOUNDARY" ||
      !contact.upper_stratigraphy ||
      !contact.lower_stratigraphy
    ) continue;

    const surface = getGeologyAtLocation(
      contact.latitude, contact.longitude
    );

    if (
      surface.status !== "DIRECT" ||
      surface.unit?.code !== target.unit.code
    ) continue;

    const faults = getMappedGemFaultsBetweenPoints(
      latitude, longitude,
      contact.latitude, contact.longitude
    );

    // Missing fault information cannot be treated as clear.
    if (!faults || faults.intersects_mapped_gem_fault) {
      continue;
    }

    const key = JSON.stringify([
      contact.upper_stratigraphy,
      contact.lower_stratigraphy
    ]);

    const group = groups.get(key) ?? [];

    group.push({
      ...contact,
      distance_km: km(
        latitude, longitude,
        contact.latitude, contact.longitude
      )
    });

    groups.set(key, group);
  }

  const results: NationalSpatialContact[] = [];

  for (const group of groups.values()) {
    // Distinct coordinates: duplicate entries never count
    // as independent spatial controls.
    const positions = new Map<string, Control>();

    for (const control of group) {
      const key =
        `${control.latitude.toFixed(7)}:` +
        `${control.longitude.toFixed(7)}`;

      if (!positions.has(key)) positions.set(key, control);
    }

    const controls = [...positions.values()]
      .sort((a, b) => a.distance_km - b.distance_km)
      .slice(0, 12);

    if (controls.length < 3) continue;

    let winner: [Control, Control, Control] | null = null;
    let bestPerimeter = Infinity;

    for (let i = 0; i < controls.length - 2; i++) {
      for (let j = i + 1; j < controls.length - 1; j++) {
        for (let k = j + 1; k < controls.length; k++) {
          const a = controls[i];
          const b = controls[j];
          const c = controls[k];

          if (!withinTriangle(latitude, longitude, a, b, c)) {
            continue;
          }

          const perimeter =
            km(a.latitude,a.longitude,b.latitude,b.longitude) +
            km(b.latitude,b.longitude,c.latitude,c.longitude) +
            km(c.latitude,c.longitude,a.latitude,a.longitude);

          if (perimeter < bestPerimeter) {
            winner = [a, b, c];
            bestPerimeter = perimeter;
          }
        }
      }
    }

    if (!winner) continue;

    const [a, b, c] = winner;

    // Barycentric interpolation only inside a documented
    // control triangle. It remains unvalidated research.
    const A: [number, number] = [a.longitude,a.latitude];
    const B: [number, number] = [b.longitude,b.latitude];
    const C: [number, number] = [c.longitude,c.latitude];
    const P: [number, number] = [longitude,latitude];

    const denominator = cross(A,B,C);

    if (Math.abs(denominator) < 1e-12) continue;

    const wa = cross(B,C,P) / denominator;
    const wb = cross(C,A,P) / denominator;
    const wc = cross(A,B,P) / denominator;

    const observed = [a.depth_m,b.depth_m,c.depth_m];
    const estimate =
      wa*a.depth_m + wb*b.depth_m + wc*c.depth_m;

    if (!Number.isFinite(estimate)) continue;

    results.push({
      status: "EXPLORATORY_CONTACT_ESTIMATE",
      upper_stratigraphy: a.upper_stratigraphy!,
      lower_stratigraphy: a.lower_stratigraphy!,
      estimated_depth_m: Math.round(estimate*10)/10,
      documented_depth_range_m: [
        Math.min(...observed),Math.max(...observed)
      ],
      control_borehole_ids: [a,b,c].map(x=>x.borehole_id),
      source_ids: [...new Set(
        [a,b,c].flatMap(x=>x.source_ids)
      )],
      mapped_surface_unit: target.unit.code,
      control_count: 3,
      geological_block_verified: false,
      depth_prediction_approved: false,
      research_only: true
    });
  }

  // Competing geological interpretations are not ranked
  // or silently resolved by distance.
  return results;
}
