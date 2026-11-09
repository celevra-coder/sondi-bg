import fs from "node:fs";
import path from "node:path";
import "server-only";
import { getNationalSpatialResearchDescriptions } from "./sondi-national-spatial-research";

/**
 * SONDI_MONTANA_CATALOG_V1
 * Additive national evidence intake, NOT a depth interpreter.
 * No new regional geological algorithms, no coordinate fabrication.
 * Every research entry retains its original source and trust classification.
 */
type Point = [number, number];
type Shape = { type: "Polygon" | "MultiPolygon"; coordinates: unknown };
type Draft = {
  cell_id: string;
  latitude: number;
  longitude: number;
  source_sheet: string;
  classification: string;
  research_only: boolean;
  production_approved: boolean;
  regional_sources?: Array<{
    source_id?: string;
    distance_m?: number;
    text?: string;
    status?: string;
    local_applicability_confirmed?: boolean;
  }>;
};
type SheetUnit = {
  sheet: string;
  unit_name: string;
  source_tiers?: Record<string, number>;
  material_variants?: Array<{ materials?: string[] }>;
};
type Catalog = {
  schema_version: string;
  files_indexed_count: number;
  source_manifest: Array<{ path: string; bytes: number; sha256: string; role: string; declared_status: string | null }>;
  spatial_facts: unknown[];
  sheet_unit_catalog: SheetUnit[];
  local_research_drafts: Draft[];
  legend_name_material_verified: unknown[];
  documented_borehole_anchors_research_only: unknown[];
  original_borehole_documents: unknown[];
};

export type NationalResearchIntegration = {
  status: "NOT_APPLICABLE" | "UNAVAILABLE" | "RESEARCH_CONTEXT";
  scope: "MONTANA_RESEARCH_ONLY" | null;
  indexed_source_files: number;
  spatial_research_records: number;
  regional_sheet_unit_records: number;
  local_research_drafts: number;
  independently_approved_depth_prediction: false;
  directly_applicable_proven_intervals: [];
  spatial_descriptions: string[];
  nearby_research_cells: Array<{
    distance_km: number;
    classification: string;
    source_sheet: string;
    sources: Array<{ text: string; source_status: string; distance_m: number | null }>;
    evidence_level: "RESEARCH_ONLY_NOT_POINT_VERIFIED";
  }>;
  broad_sheet_candidates: Array<{
    name: string;
    materials: string[];
    source_tiers: string[];
    evidence_level: "MAP_SHEET_CONTEXT_NOT_LOCATION_VERIFIED";
  }>;
};

const EMPTY: NationalResearchIntegration = {
  status: "NOT_APPLICABLE",
  scope: null,
  indexed_source_files: 0,
  spatial_research_records: 0,
  regional_sheet_unit_records: 0,
  local_research_drafts: 0,
  independently_approved_depth_prediction: false,
  directly_applicable_proven_intervals: [],
  spatial_descriptions: [],
  nearby_research_cells: [],
  broad_sheet_candidates: [],
};

let cached: { boundary: Shape; catalog: Catalog } | null = null;
function load() {
  if (cached) return cached;
  const dir = path.join(process.cwd(), "data", "soil-lithology", "runtime", "regions");
  try {
    const boundary = JSON.parse(fs.readFileSync(path.join(dir, "montana_boundary.json"), "utf8")) as Shape;
    const catalog = JSON.parse(fs.readFileSync(path.join(dir, "montana_integrated_research_catalog.json"), "utf8")) as Catalog;
    if (catalog.schema_version !== "SONDI-MONTANA-RESEARCH-INTEGRATION-V1" ||
        catalog.files_indexed_count !== catalog.source_manifest.length ||
        !Array.isArray(catalog.spatial_facts) ||
        !Array.isArray(catalog.local_research_drafts) ||
        !Array.isArray(catalog.sheet_unit_catalog)) return null;
    cached = { boundary, catalog };
    return cached;
  } catch { return null; }
}

function ringContains(ring: Point[], x: number, y: number) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[j], b = ring[i];
    if (!a || !b) continue;
    const crosses = ((a[1] > y) !== (b[1] > y)) &&
      x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0];
    if (crosses) inside = !inside;
  }
  return inside;
}
function polygonContains(rings: Point[][], x: number, y: number) {
  return rings.length > 0 && ringContains(rings[0], x, y) &&
    !rings.slice(1).some(ring => ringContains(ring, x, y));
}
function withinBoundary(shape: Shape, longitude: number, latitude: number) {
  if (shape.type === "Polygon") {
    return polygonContains(shape.coordinates as Point[][], longitude, latitude);
  }
  if (shape.type === "MultiPolygon") {
    return (shape.coordinates as Point[][][]).some(rings => polygonContains(rings, longitude, latitude));
  }
  return false;
}
function distanceKm(latitude: number, longitude: number, a: number, b: number) {
  const rad = Math.PI / 180;
  const dy = (a - latitude) * 111.195;
  const dx = (b - longitude) * 111.32 * Math.cos(latitude * rad);
  return Math.hypot(dx, dy);
}

/** Research is surfaced as clearly scoped context; NEVER promoted to depth evidence. */
export function resolveNationalResearchIntegration(
  latitude: number,
  longitude: number
): NationalResearchIntegration {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) ||
      Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return { ...EMPTY };
  const data = load();
  if (!data) return { ...EMPTY, status: "UNAVAILABLE" };
  if (!withinBoundary(data.boundary, longitude, latitude)) return { ...EMPTY };

  const catalog = data.catalog;
  const spatial = getNationalSpatialResearchDescriptions(latitude, longitude);
  const nearby = catalog.local_research_drafts
    .filter(v => Number.isFinite(v.latitude) && Number.isFinite(v.longitude) && v.research_only === true)
    .map(v => ({ v, distance: distanceKm(latitude, longitude, v.latitude, v.longitude) }))
    .filter(v => v.distance <= 7)
    .sort((a,b) => a.distance - b.distance)
    .slice(0, 2);

  const nearby_research_cells: NationalResearchIntegration["nearby_research_cells"] = nearby.map(({v,distance}) => ({
    distance_km: Math.round(distance * 1000) / 1000,
    classification: v.classification,
    source_sheet: v.source_sheet,
    sources: (v.regional_sources || [])
      .filter(s => typeof s.text === "string" && s.text.trim().length > 0)
      .slice(0, 4)
      .map(s => ({text: s.text!.trim(), source_status: String(s.status || "RESEARCH_ONLY"),
        distance_m: typeof s.distance_m === "number" ? s.distance_m : null})),
    evidence_level: "RESEARCH_ONLY_NOT_POINT_VERIFIED",
  }));

  // A draft's nearest cell can suggest which wide sheet has source material.
  // This is NOT a reliable assignment of lithology to the clicked coordinate.
  // Do not supplement existing spatial descriptions with indiscriminate sheets.
  const sheet = nearby.length
    ? nearby[0].v.source_sheet : null;
  const broad_sheet_candidates: NationalResearchIntegration["broad_sheet_candidates"] = sheet
    ? catalog.sheet_unit_catalog.filter(item => item.sheet === sheet)
      .filter(item => typeof item.unit_name === "string" && item.unit_name.trim() && !/[?]{3,}/.test(item.unit_name))
      .map(item => ({
        name: item.unit_name.trim(),
        materials: [...new Set((item.material_variants || [])
          .flatMap(v => v.materials || [])
          .filter(v => typeof v === "string" && v.trim()))].slice(0, 3),
        source_tiers: Object.keys(item.source_tiers || {}),
        evidence_level: "MAP_SHEET_CONTEXT_NOT_LOCATION_VERIFIED" as const,
      }))
      .filter(item => item.materials.length > 0)
      .sort((a,b) => a.name.localeCompare(b.name, "bg"))
      .slice(0, 6)
    : [];

  return {
    status: "RESEARCH_CONTEXT",
    scope: "MONTANA_RESEARCH_ONLY",
    indexed_source_files: catalog.files_indexed_count,
    spatial_research_records: catalog.spatial_facts.length,
    regional_sheet_unit_records: catalog.sheet_unit_catalog.length,
    local_research_drafts: catalog.local_research_drafts.length,
    independently_approved_depth_prediction: false,
    directly_applicable_proven_intervals: [],
    spatial_descriptions: spatial.paragraphs.slice(0,5),
    nearby_research_cells,
    broad_sheet_candidates,
  };
}
