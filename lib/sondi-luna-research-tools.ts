import "server-only";
import { getNationalBoreholeIndex } from "./sondi-national-borehole-index";
import fs from "node:fs";
import path from "node:path";

type Feature = {
  type: string;
  geometry?: { type: string; coordinates: unknown };
  properties?: Record<string, unknown>;
};

type Unit = {
  sheet?: string;
  unit_name?: string;
  material_variants?: Array<{ materials?: string[] }>;
  source_tiers?: Record<string, number>;
  original_legend_independently_checked?: boolean;
  geological_contact_verified_for_point?: boolean;
  depth_prediction_authorized?: boolean;
};

const ROOT = path.join(process.cwd(), "data", "soil-lithology", "runtime", "regions");

let cached: { features: Feature[]; units: Unit[] } | null = null;

function load() {
  if (cached) return cached;
  const geo = JSON.parse(fs.readFileSync(path.join(ROOT,
    "montana_research_spatial_evidence.geojson"), "utf8")) as {
      features: Feature[];
    };
  const catalog = JSON.parse(fs.readFileSync(path.join(ROOT,
    "montana_integrated_research_catalog.json"), "utf8")) as {
      sheet_unit_catalog: Unit[];
    };
  cached = { features: geo.features, units: catalog.sheet_unit_catalog };
  return cached;
}

function ringContains(p: number[], ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i], b = ring[j];
    if ((a[1] > p[1]) !== (b[1] > p[1]) &&
        p[0] < (b[0] - a[0]) * (p[1] - a[1]) /
        (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}

function contains(p: number[], geometry: Feature["geometry"]): boolean {
  if (!geometry) return false;
  const polygons = geometry.type === "Polygon"
    ? [geometry.coordinates]
    : geometry.type === "MultiPolygon" ? geometry.coordinates : [];
  if (!Array.isArray(polygons)) return false;
  return polygons.some(poly => {
    if (!Array.isArray(poly) || !poly.length) return false;
    const rings = poly as number[][][];
    return ringContains(p, rings[0]) &&
      !rings.slice(1).some(r => ringContains(p, r));
  });
}

function distanceToFeature(lat: number, lon: number, f: Feature): number {
  const p = [lon, lat];
  if (contains(p, f.geometry)) return 0;
  const g = f.geometry;
  if (!g) return Infinity;

  const polygons = g.type === "Polygon"
    ? [g.coordinates]
    : g.type === "MultiPolygon" ? g.coordinates : [];
  if (!Array.isArray(polygons)) return Infinity;

  const xs = 111.32 * Math.cos(lat * Math.PI / 180);
  const ys = 111.195;
  let best = Infinity;

  for (const poly of polygons as number[][][][]) {
    for (const ring of poly) {
      for (let i = 0; i < ring.length; i++) {
        const a = ring[i], b = ring[(i + 1) % ring.length];
        if (!Array.isArray(a) || !Array.isArray(b)) continue;
        const dx = (b[0] - a[0]) * xs;
        const dy = (b[1] - a[1]) * ys;
        const vx = (lon - a[0]) * xs;
        const vy = (lat - a[1]) * ys;
        const t = Math.max(0, Math.min(1,
          (vx * dx + vy * dy) / (dx * dx + dy * dy || 1)));
        best = Math.min(best, Math.hypot(vx - t * dx, vy - t * dy));
      }
    }
  }
  return best;
}

export function searchLunaGeologicalRecords(args: {
  latitude: number;
  longitude: number;
  query?: string;
  radius_km?: number;
}) {
  const { latitude: lat, longitude: lon } = args;
  if (!Number.isFinite(lat) || !Number.isFinite(lon) ||
      lat < 40 || lat > 45 || lon < 20 || lon > 30) {
    return { error: "INVALID_COORDINATES" };
  }

  const { features, units } = load();
  const radius = Math.min(15, Math.max(0, args.radius_km ?? 7));
  const query = (args.query ?? "").trim().toLocaleLowerCase("bg-BG");

  const spatial = features.map(f => {
    const distance_km = distanceToFeature(lat, lon, f);
    const p = f.properties ?? {};
    const original = (p.original_properties ?? {}) as Record<string, unknown>;
    const description = [
      original.regional_geological_context_bg,
      original.geological_context_bg,
      original.geological_unit_bg,
      original.research_normalized_unit_bg,
      original.regional_name_bg
    ].filter(v => typeof v === "string").join(" ");

    return {
      id: String(p.evidence_id ?? ""),
      distance_km: +distance_km.toFixed(3),
      contains_point: distance_km === 0,
      description: description.slice(0, 900),
      evidence_scope: p.evidence_scope ?? "RESEARCH_ONLY",
      production_approved: original.production_approved === true,
      geological_unit_verified: original.verified_geological_unit_at_point === true,
      source_sheet: String(original.source_sheet ??
        original.source_original_geological_sheet ?? original.sheet ?? "")
    };
  }).filter(x => x.distance_km <= radius &&
    (!query || x.description.toLocaleLowerCase("bg-BG").includes(query)))
    .sort((a,b) => a.distance_km - b.distance_km)
    .slice(0, 15);

  const names = units.filter(u =>
    spatial.some(s =>
      s.contains_point &&
      s.source_sheet === u.sheet
    ) &&
    query && (
      String(u.unit_name ?? "").toLocaleLowerCase("bg-BG").includes(query) ||
      (u.material_variants ?? []).some(v =>
        (v.materials ?? []).some(m =>
          m.toLocaleLowerCase("bg-BG").includes(query))))
  ).slice(0, 12).map(u => ({
    sheet: u.sheet,
    name: u.unit_name,
    materials: [...new Set((u.material_variants ?? [])
      .flatMap(v => v.materials ?? []))].slice(0, 12),
    evidence_scope: "MAP_SHEET_ONLY_NOT_VERIFIED_AT_POINT",
    original_legend_checked: u.original_legend_independently_checked === true,
    geological_contact_verified: u.geological_contact_verified_for_point === true
  }));

  return {
    coordinate: { latitude: lat, longitude: lon },
    spatial,
    catalog_matches: names,
    limitation: "Research polygons and map-sheet matches do not prove lithology or depth beneath the selected point."
  };
}

export function searchLunaNationalBoreholes(args: {
  latitude: number;
  longitude: number;
  radius_km?: number;
  borehole_id?: string;
}) {
  const lat = args.latitude;
  const lon = args.longitude;

  if (!Number.isFinite(lat) || !Number.isFinite(lon) ||
      lat < 40 || lat > 45 || lon < 20 || lon > 30) {
    return { error: "INVALID_COORDINATES" };
  }

  const index = getNationalBoreholeIndex();

  const distanceKm = (a: number, b: number) => {
    const r = Math.PI / 180;
    const dLat = (a - lat) * r;
    const dLon = (b - lon) * r;
    const h = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat * r) * Math.cos(a * r) *
      Math.sin(dLon / 2) ** 2;

    return 12742.0176 * Math.asin(
      Math.min(1, Math.sqrt(h))
    );
  };

  const located = index.filter(h =>
    h.latitude !== null &&
    h.longitude !== null &&
    Number.isFinite(h.latitude) &&
    Number.isFinite(h.longitude)
  );

  const format = (
    hole: (typeof index)[number],
    detailed: boolean
  ) => {
    const d = distanceKm(hole.latitude!, hole.longitude!);

    const intervals = hole.intervals.map(x => ({
      from_m: x.from_m,
      to_m: x.to_m,
      material: x.material_bg,
      stratigraphy: x.stratigraphy,
      interval_status: x.interval_status,
      evidence_level: x.evidence_level,
      source_ids: x.source_ids
    }));

    return {
      id: hole.id,
      origin: hole.origin,
      oblast: hole.oblast,
      distance_km: +d.toFixed(3),
      coordinate_status: hole.coordinate_status,
      exact_coordinates: hole.coordinate_status === "OFFICIAL_EXACT",
      source_intervals: detailed
        ? intervals.slice(0, 75)
        : intervals.slice(0, 4),
      total_intervals: intervals.length,
      evidence_scope:
        d <= 2 && hole.coordinate_status === "OFFICIAL_EXACT"
          ? "NEARBY_DOCUMENTARY_REFERENCE_NOT_SITE_PROOF"
          : "WIDER_OR_UNCERTAIN_LOCATION_CONTEXT",
      warning:
        "Documented borehole intervals are not measured layers at the selected property."
    };
  };

  if (args.borehole_id) {
    const matches = located.filter(h => h.id === args.borehole_id);

    if (matches.length !== 1) {
      return { error: "BOREHOLE_ID_NOT_UNIQUE_OR_NOT_FOUND" };
    }

    const hole = matches[0];
    const d = distanceKm(hole.latitude!, hole.longitude!);

    if (d > 50) {
      return { error: "BOREHOLE_OUTSIDE_RESEARCH_AREA" };
    }

    return { borehole: format(hole, true) };
  }

  const radius = Number.isFinite(args.radius_km)
    ? Math.max(0, Math.min(50, args.radius_km!))
    : 10;

  const matches = located
    .map(h => ({
      hole: h,
      distance: distanceKm(h.latitude!, h.longitude!)
    }))
    .filter(x => x.distance <= radius)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 15);

  return {
    coordinate: { latitude: lat, longitude: lon },
    search_radius_km: radius,
    boreholes: matches.map(x => format(x.hole, false)),
    returned_count: matches.length,
    warning:
      "Distance alone does not establish geological continuity or depths beneath the target."
  };
}
export function readLunaGeologicalRecord(id: string) {
  if (typeof id !== "string" || id.length > 120) {
    return { error: "INVALID_RECORD_ID" };
  }
  const { features } = load();
  const f = features.find(x => x.properties?.evidence_id === id);
  if (!f) return { error: "RECORD_NOT_FOUND" };

  const p = f.properties ?? {};
  const original = (p.original_properties ?? {}) as Record<string, unknown>;

  return {
    id,
    evidence_scope: p.evidence_scope ?? "RESEARCH_ONLY",
    geometry_role: p.geometry_role ?? null,
    properties: original,
    verified_geological_unit_at_point:
      p.verified_geological_unit_at_point === true,
    verified_geological_contact:
      p.verified_geological_contact === true,
    spatial_depth_projection_authorized:
      p.spatial_depth_projection_authorized === true,
    warning: "Original research metadata; do not promote provisional contacts or material descriptions to verified site observations."
  };
}