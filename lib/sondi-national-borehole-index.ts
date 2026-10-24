import "server-only";
import fs from "node:fs";
import path from "node:path";

export type IndexedInterval = {
  from_m: number | null;
  to_m: number | null;
  material_bg: string;
  stratigraphy: string | null;
  interval_status: string | null;
  evidence_level: string | null;
  source_ids: string[];
};

export type IndexedBorehole = {
  id: string;
  oblast: string;
  region_code: string | null;
  zone_type: string | null;
  latitude: number | null;
  longitude: number | null;
  coordinate_status: string | null;
  intervals: IndexedInterval[];
  origin: "NATIONAL" | "REGIONAL";
};

const base = path.join(
  process.cwd(), "data", "soil-lithology"
);

function read(file: string): any {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function validCoords(lat: unknown, lon: unknown): boolean {
  return typeof lat === "number" &&
    typeof lon === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= 40 && lat <= 45 &&
    lon >= 20 && lon <= 30;
}

function normalizeInterval(
  raw: any,
  regional: boolean
): IndexedInterval | null {
  const from = regional ? raw?.from_m : raw?.depth_from_m;
  const to = regional ? raw?.to_m : raw?.depth_to_m;
  const material = regional
    ? raw?.material_bg
    : raw?.expected_material_bg;

  if (
    (from !== null && (
      typeof from !== "number" ||
      !Number.isFinite(from) ||
      from < 0
    )) ||
    (to !== null && (
      typeof to !== "number" ||
      !Number.isFinite(to) ||
      to < 0
    )) ||
    (from === null && to === null) ||
    (from !== null && to !== null && to <= from) ||
    typeof material !== "string" ||
    !material.trim()
  ) return null;

  return {
    from_m: from,
    to_m: to,
    material_bg: material,
    stratigraphy: typeof raw.stratigraphy === "string"
      ? raw.stratigraphy : null,
    interval_status:
      typeof raw.interval_status === "string"
        ? raw.interval_status
        : null,
    evidence_level: regional
      ? "regional_documented_interval"
      : typeof raw.evidence_level === "string"
        ? raw.evidence_level
        : null,
    source_ids: Array.isArray(raw.source_ids)
      ? raw.source_ids.filter(
          (x: unknown): x is string => typeof x === "string"
        )
      : [],
  };
}

let cache: IndexedBorehole[] | null = null;

export function getNationalBoreholeIndex(): IndexedBorehole[] {
  if (cache !== null) return cache;

  const national = read(
    path.join(base, "bulgaria_borehole_lithology.json")
  );

  const records: IndexedBorehole[] = [];
  const seen = new Set<string>();

  for (const hole of national.boreholes ?? []) {
    const id = String(hole.borehole_id ?? "").trim();
    if (!id || seen.has(id)) continue;

    const c = hole.coordinates ?? {};
    const located = validCoords(c.latitude, c.longitude);

    records.push({
      id,
      oblast: String(hole.oblast ?? ""),
      region_code: String(hole.region_code ?? "") || null,
      zone_type: String(hole.zone_type ?? "") || null,
      latitude: located ? c.latitude : null,
      longitude: located ? c.longitude : null,
      coordinate_status: c.status ?? null,
      intervals: (hole.lithology ?? [])
        .map((x: any) => normalizeInterval(x, false))
        .filter((x: IndexedInterval | null): x is IndexedInterval =>
          x !== null
        ),
      origin: "NATIONAL",
    });
    seen.add(id);
  }

  const regionsDir = path.join(base, "runtime", "regions");
  const registry = read(
    path.join(regionsDir, "regional_registry.json")
  );

  for (const region of registry.regions ?? []) {
    const filename = String(region.model_file ?? "");
    if (!/^[a-zA-Z0-9_.-]+\.json$/.test(filename)) {
      throw new Error("Invalid regional model filename");
    }

    const model = read(path.join(regionsDir, filename));
    const zone = model.zones?.[region.zone_id];

    for (const hole of zone?.documented_reference_intervals ?? []) {
      const id = String(hole.borehole_id ?? "").trim();
      if (!id || seen.has(id)) continue;

      const located = validCoords(
        hole.latitude, hole.longitude
      );

      records.push({
        id,
        oblast: String(region.name_bg ?? ""),
        region_code: null,
        zone_type: null,
        latitude: located ? hole.latitude : null,
        longitude: located ? hole.longitude : null,
        coordinate_status: located
          ? "REGIONAL_DOCUMENTED"
          : "NOT_DOCUMENTED",
        intervals: (hole.intervals ?? [])
          .map((x: any) => normalizeInterval(x, true))
          .filter((x: IndexedInterval | null): x is IndexedInterval =>
            x !== null
          ),
        origin: "REGIONAL",
      });
      seen.add(id);
    }
  }

  cache = records;
  return records;
}

export function getNationalBoreholeIndexStats() {
  const records = getNationalBoreholeIndex();

  return {
    total: records.length,
    located: records.filter(
      x => x.latitude !== null && x.longitude !== null
    ).length,
    unlocated: records.filter(
      x => x.latitude === null || x.longitude === null
    ).length,
    intervals: records.reduce(
      (sum, x) => sum + x.intervals.length, 0
    ),
    regional_additions: records.filter(
      x => x.origin === "REGIONAL"
    ).length,
  };
}

// SONDI_NATIONAL_RESEARCH_REFERENCE_INDEX_65E
// Research coordinates are supplementary metadata.
// They are NEVER silently promoted to surveyed borehole mouths
// or automatically used to predict target depth lithology.

export type NationalResearchBoreholeReference = {
  borehole_id: string;
  latitude: number | null;
  longitude: number | null;
  coordinate_grade: string;
  coordinate_is_exact_surveyed_mouth: boolean;
  spatial_reference_is_canonical: boolean;
  validated_interval_count: number;
  source_dataset: string;
  research_only: true;
  automatic_depth_prediction_enabled: false;
};

export function getNationalBoreholeResearchReferences():
  NationalResearchBoreholeReference[] {

  const directory = path.join(base, "research");

  if (!fs.existsSync(directory)) return [];

  const results: NationalResearchBoreholeReference[] = [];
  const seen = new Set<string>();

  const files = fs.readdirSync(directory)
    .filter(name =>
      /^[a-zA-Z0-9_.-]*documented_depth_checkpoints[a-zA-Z0-9_.-]*\.json$/
        .test(name)
    )
    .sort();

  for (const filename of files) {
    const dataset = read(path.join(directory, filename));

    // Never override source-level publication restrictions.
    if (
      dataset.research_only !== true ||
      dataset.automatic_depth_prediction_enabled !== false ||
      !Array.isArray(dataset.records)
    ) continue;

    for (const item of dataset.records) {
      const id = String(item?.borehole_id ?? "").trim();
      if (!id) continue;

      const coordinate = item.reference_coordinate ?? {};
      const located = validCoords(
        coordinate.latitude,
        coordinate.longitude
      );

      const exact = item.coordinate_grade === "OFFICIAL_EXACT" &&
        item.coordinate_is_exact_surveyed_mouth === true &&
        item.spatial_reference_is_canonical === true &&
        located;

      const key = filename + ":" + id;

      if (seen.has(key)) continue;
      seen.add(key);

      results.push({
        borehole_id: id,
        latitude: located ? coordinate.latitude : null,
        longitude: located ? coordinate.longitude : null,
        coordinate_grade: String(
          item.coordinate_grade ?? "UNLOCATED"
        ),
        coordinate_is_exact_surveyed_mouth: exact,
        spatial_reference_is_canonical:
          item.spatial_reference_is_canonical === true,
        validated_interval_count:
          Number.isInteger(item.validated_interval_count) &&
          item.validated_interval_count >= 0
            ? item.validated_interval_count
            : 0,
        source_dataset: filename,
        research_only: true,
        automatic_depth_prediction_enabled: false
      });
    }
  }

  return results;
}
