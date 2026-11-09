import fs from "node:fs";
import path from "node:path";
import { getNationalBoreholeIndex } from "./sondi-national-borehole-index";
import "server-only";
import { getNationalResearchEvidenceCatalog } from
  "./sondi-national-research-evidence";

type JsonRecord = Record<string, unknown>;

type IndexedItem = {
  id: string;
  kind: string;
  source_file: string;
  source_ids: string[];
  declared_regions: string[];
  latitude: number | null;
  longitude: number | null;
  coordinate_status: string;
  geographic_class:
    | "VERIFIED_COORDINATE_REFERENCE"
    | "UNVERIFIED_COORDINATE_REFERENCE"
    | "DECLARED_REGIONAL_REFERENCE"
    | "GEOGRAPHY_NOT_VERIFIED";
  summary: string;
};

let cachedIndex: IndexedItem[] | null = null;

function object(value: unknown): JsonRecord {
  return value && typeof value === "object" &&
    !Array.isArray(value)
    ? value as JsonRecord
    : {};
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function coordinate(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeRegion(value: string): string {
  const map: Record<string, string> = {
    "а":"a","б":"b","в":"v","г":"g","д":"d",
    "е":"e","ж":"zh","з":"z","и":"i","й":"y",
    "к":"k","л":"l","м":"m","н":"n","о":"o",
    "п":"p","р":"r","с":"s","т":"t","у":"u",
    "ф":"f","х":"h","ц":"ts","ч":"ch","ш":"sh",
    "щ":"sht","ъ":"a","ь":"","ю":"yu","я":"ya"
  };

  return value.toLocaleLowerCase("bg-BG")
    .split("")
    .map(ch => map[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]/g, "");
}

function declaredRegions(r: JsonRecord): string[] {
  const admin = object(r.administrative_reference);

  const values = [
    r.oblast,
    r.region,
    admin.oblast,
    admin.region
  ].map(text).filter(Boolean);

  return [...new Set(values)];
}

function extractCoordinates(r: JsonRecord): {
  lat: number | null;
  lon: number | null;
  status: string;
  verified: boolean;
} {
  const coordinates = object(r.coordinates);
  const location = object(r.location);

  const candidates = [coordinates, location, r];

  let lat: number | null = null;
  let lon: number | null = null;
  let selected: JsonRecord = {};

  for (const c of candidates) {
    const a = coordinate(c.latitude ?? c.lat);
    const b = coordinate(c.longitude ?? c.lon ?? c.lng);

    if (
      a !== null && b !== null &&
      a >= 40 && a <= 45 &&
      b >= 20 && b <= 30
    ) {
      lat = a;
      lon = b;
      selected = c;
      break;
    }
  }

  const status = text(
    selected.coordinate_status ??
    selected.status ??
    r.coordinate_status ??
    r.location_precision
  );

  const verified =
    r.coordinates_verified === true ||
    r.individual_borehole_coordinates_verified === true ||
    r.is_exact_point_evidence === true ||
    selected.coordinates_verified === true ||
    [
      "OFFICIAL_EXACT",
      "VERIFIED_EXACT",
      "SURVEYED_EXACT"
    ].includes(status.toUpperCase());

  return { lat, lon, status: status || "UNSPECIFIED", verified };
}

function distanceKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) *
    Math.cos(lat2 * rad) *
    Math.sin(dLon / 2) ** 2;

  return 12742.0176 *
    Math.asin(Math.min(1, Math.sqrt(h)));
}

export function getLunaNationalSpatialIndex(): IndexedItem[] {
  if (cachedIndex !== null) return cachedIndex;

  cachedIndex = getNationalResearchEvidenceCatalog().map(item => {
    const r = object(item.record);
    const coords = extractCoordinates(r);
    const regions = declaredRegions(r);

    const hasCoordinates =
      coords.lat !== null && coords.lon !== null;

    const geographic_class: IndexedItem["geographic_class"] =
      hasCoordinates && coords.verified
        ? "VERIFIED_COORDINATE_REFERENCE"
        : hasCoordinates
          ? "UNVERIFIED_COORDINATE_REFERENCE"
          : regions.length
            ? "DECLARED_REGIONAL_REFERENCE"
            : "GEOGRAPHY_NOT_VERIFIED";

    return {
      id: item.intake_id,
      kind: item.evidence_kind,
      source_file: item.source_file,
      source_ids: item.source_ids,
      declared_regions: regions,
      latitude: coords.lat,
      longitude: coords.lon,
      coordinate_status: coords.status,
      geographic_class,
      summary: JSON.stringify(r).slice(0, 450)
    };
  });

  return cachedIndex;
}

// Shared nationwide evidence lookup. Data-source adapters are not
// region-specific interpretation engines.

type ResearchGeometry = {
  type: string;
  coordinates: unknown;
};

type ResearchFeature = {
  geometry?: ResearchGeometry | null;
  properties?: Record<string, unknown>;
};

let nationalPolygonFeaturesCache: ResearchFeature[] | null = null;

// One national loader for research polygons.
// No oblast-specific geological rules are used.
function getNationalResearchPolygonFeatures(): ResearchFeature[] {
  if (nationalPolygonFeaturesCache !== null) {
    return nationalPolygonFeaturesCache;
  }

  const directory = path.join(
    process.cwd(),
    "data", "soil-lithology", "runtime", "regions"
  );

  if (!fs.existsSync(directory)) {
    throw new Error("NATIONAL_RESEARCH_POLYGON_DIRECTORY_MISSING");
  }

  const files = fs.readdirSync(directory)
    .filter(name =>
      /^[a-z0-9_-]+_research_spatial_evidence\.geojson$/i.test(name)
    )
    .sort();

  const features: ResearchFeature[] = [];

  for (const filename of files) {
    const fullPath = path.join(directory, filename);

    if (!fs.statSync(fullPath).isFile()) continue;

    const parsed = JSON.parse(
      fs.readFileSync(fullPath, "utf8")
    ) as {
      type?: string;
      features?: ResearchFeature[];
    };

    if (
      parsed.type !== "FeatureCollection" ||
      !Array.isArray(parsed.features)
    ) {
      throw new Error("INVALID_NATIONAL_RESEARCH_GEOJSON:" + filename);
    }

    for (const feature of parsed.features) {
      if (
        !feature ||
        !feature.geometry ||
        !["Polygon", "MultiPolygon"].includes(
          feature.geometry.type
        )
      ) continue;

      features.push(feature);
    }
  }

  nationalPolygonFeaturesCache = features;
  return features;
}
function insideRing(
  longitude: number,
  latitude: number,
  input: unknown
): boolean {
  if (!Array.isArray(input) || input.length < 3) return false;

  const ring = input as unknown[];
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i];
    const b = ring[j];

    if (!Array.isArray(a) || !Array.isArray(b)) continue;

    const xi = Number(a[0]), yi = Number(a[1]);
    const xj = Number(b[0]), yj = Number(b[1]);

    if (![xi, yi, xj, yj].every(Number.isFinite)) continue;

    // Boundary is included when the point lies on a segment.
    const cross =
      (longitude - xi) * (yj - yi) -
      (latitude - yi) * (xj - xi);

    if (
      Math.abs(cross) < 1e-10 &&
      longitude >= Math.min(xi, xj) - 1e-10 &&
      longitude <= Math.max(xi, xj) + 1e-10 &&
      latitude >= Math.min(yi, yj) - 1e-10 &&
      latitude <= Math.max(yi, yj) + 1e-10
    ) return true;

    if (
      (yi > latitude) !== (yj > latitude) &&
      longitude <
        (xj - xi) * (latitude - yi) / (yj - yi) + xi
    ) inside = !inside;
  }

  return inside;
}

function insidePolygon(
  longitude: number,
  latitude: number,
  input: unknown
): boolean {
  if (!Array.isArray(input) || !input.length) return false;

  const rings = input as unknown[];

  if (!insideRing(longitude, latitude, rings[0])) return false;

  for (let i = 1; i < rings.length; i++) {
    if (insideRing(longitude, latitude, rings[i])) return false;
  }

  return true;
}

function intersectsResearchGeometry(
  longitude: number,
  latitude: number,
  geometry: ResearchGeometry | null | undefined
): boolean {
  if (!geometry) return false;

  if (geometry.type === "Polygon") {
    return insidePolygon(longitude, latitude, geometry.coordinates);
  }

  if (
    geometry.type === "MultiPolygon" &&
    Array.isArray(geometry.coordinates)
  ) {
    return geometry.coordinates.some(p =>
      insidePolygon(longitude, latitude, p)
    );
  }

  return false;
}

function nearbyVerifiedBoreholes(
  latitude: number,
  longitude: number,
  radius: number
) {
  const exactStatuses = new Set([
    "OFFICIAL_EXACT",
    "VERIFIED_EXACT",
    "SURVEYED_EXACT"
  ]);

  return getNationalBoreholeIndex().flatMap(hole => {
    if (
      hole.latitude === null ||
      hole.longitude === null ||
      !exactStatuses.has(
        String(hole.coordinate_status ?? "").toUpperCase()
      )
    ) return [];

    const distance = distanceKm(
      latitude, longitude,
      hole.latitude, hole.longitude
    );

    if (distance > radius) return [];

    return [{
      id: hole.id,
      origin: hole.origin,
      oblast: hole.oblast,
      latitude: hole.latitude,
      longitude: hole.longitude,
      distance_km: Math.round(distance * 1000) / 1000,
      coordinate_status: hole.coordinate_status,
      interval_count: hole.intervals.length,
      interval_preview: hole.intervals.slice(0, 5).map(interval => ({
        from_m: interval.from_m,
        to_m: interval.to_m,
        material_bg: interval.material_bg,
        interval_status: interval.interval_status,
        evidence_level: interval.evidence_level,
        source_ids: interval.source_ids
      })),
      spatial_match: "VERIFIED_BOREHOLE_COORDINATE",
      reading_tool: "search_national_boreholes",
      warning:
        "Measured borehole intervals belong to this borehole, " +
        "not automatically to the selected property."
    }];
  }).sort((a, b) => a.distance_km - b.distance_km);
}

type NationalSpatialFact = Record<string, unknown>;

let nationalSpatialFactsCache:
  Map<string, NationalSpatialFact> | null = null;

function getNationalResearchSpatialFacts():
  Map<string, NationalSpatialFact> {

  if (nationalSpatialFactsCache !== null) {
    return nationalSpatialFactsCache;
  }

  const directory = path.join(
    process.cwd(),
    "data", "soil-lithology", "runtime", "regions"
  );

  const result = new Map<string, NationalSpatialFact>();

  if (!fs.existsSync(directory)) {
    throw new Error("NATIONAL_RESEARCH_REGION_DIRECTORY_MISSING");
  }

  const files = fs.readdirSync(directory)
    .filter(name =>
      /^[a-z0-9_-]+_integrated_research_catalog\.json$/i.test(name)
    )
    .sort();

  for (const filename of files) {
    const fullPath = path.join(directory, filename);

    if (!fs.statSync(fullPath).isFile()) continue;

    const catalog = JSON.parse(
      fs.readFileSync(fullPath, "utf8")
    ) as {
      spatial_facts?: NationalSpatialFact[];
    };

    if (!Array.isArray(catalog.spatial_facts)) {
      throw new Error(
        "INVALID_NATIONAL_SPATIAL_FACTS:" + filename
      );
    }

    for (const fact of catalog.spatial_facts) {
      const id = text(fact.evidence_id);
      if (!id) continue;

      if (result.has(id)) {
        throw new Error("DUPLICATE_SPATIAL_EVIDENCE_ID:" + id);
      }

      result.set(id, fact);
    }
  }

  nationalSpatialFactsCache = result;
  return result;
}

function compactResearchValue(value: unknown, limit = 700) {
  if (value === null || value === undefined) return null;

  const serialized = JSON.stringify(value);
  if (!serialized) return null;

  return serialized.length <= limit
    ? value
    : {
        truncated_preview: serialized.slice(0, limit),
        full_record_available_in_original_catalog: true
      };
}
type NationalResearchSupportCatalog = {
  source_file: string;
  local_research_drafts: Record<string, unknown>[];
  sheet_unit_catalog: Record<string, unknown>[];
  legend_name_material_verified: Record<string, unknown>[];
};

let nationalSupportCache:
  NationalResearchSupportCatalog[] | null = null;

function getNationalResearchSupportCatalogs():
  NationalResearchSupportCatalog[] {

  if (nationalSupportCache !== null) return nationalSupportCache;

  const directory = path.join(
    process.cwd(),
    "data", "soil-lithology", "runtime", "regions"
  );

  if (!fs.existsSync(directory)) {
    throw new Error("NATIONAL_RESEARCH_DIRECTORY_MISSING");
  }

  const files = fs.readdirSync(directory)
    .filter(name =>
      /^[a-z0-9_-]+_integrated_research_catalog\.json$/i.test(name)
    )
    .sort();

  const catalogs: NationalResearchSupportCatalog[] = [];

  for (const filename of files) {
    const fullPath = path.join(directory, filename);

    if (!fs.statSync(fullPath).isFile()) continue;

    const data = JSON.parse(
      fs.readFileSync(fullPath, "utf8")
    ) as Record<string, unknown>;

    if (
      !Array.isArray(data.local_research_drafts) ||
      !Array.isArray(data.sheet_unit_catalog) ||
      !Array.isArray(data.legend_name_material_verified)
    ) {
      throw new Error("INVALID_RESEARCH_SUPPORT_CATALOG:" + filename);
    }

    catalogs.push({
      source_file: path.relative(
        process.cwd(), fullPath
      ).replace(/\\/g, "/"),
      local_research_drafts:
        data.local_research_drafts as Record<string, unknown>[],
      sheet_unit_catalog:
        data.sheet_unit_catalog as Record<string, unknown>[],
      legend_name_material_verified:
        data.legend_name_material_verified as Record<string, unknown>[]
    });
  }

  nationalSupportCache = catalogs;
  return catalogs;
}

function getNearbyResearchSupport(
  latitude: number,
  longitude: number,
  radius: number,
  polygonSheets: string[],
  polygonUnitCandidates: string[]
) {
  const catalogs = getNationalResearchSupportCatalogs();

  const cellRadius = Math.min(radius, 7);
  const cells: Array<{
    cell_id: string;
    source_file: string;
    distance_km: number;
    source_sheet: string;
    classification: unknown;
    regional_text: string;
    regional_sources: unknown;
    lithological_sources: unknown;
    geographic_basis: string;
    research_only: true;
    point_depth_prediction_authorized: false;
  }> = [];

  const units: Array<{
    sheet: string;
    unit_name: string;
    source_file: string;
    material_variants: unknown;
    source_provenance: unknown;
    legend_verified: boolean;
    geological_contact_verified_for_point: boolean;
    depth_prediction_authorized: false;
    geographic_basis: string;
  }> = [];

  let totalCells = 0;
  let totalUnits = 0;
  let totalLegendRecords = 0;
  const legendMatches: Array<Record<string, unknown>> = [];

  const sheets = new Set(
    polygonSheets.map(x => x.trim().toUpperCase())
      .filter(Boolean)
  );

  for (const catalog of catalogs) {
    totalCells += catalog.local_research_drafts.length;
    totalUnits += catalog.sheet_unit_catalog.length;
    totalLegendRecords += catalog.legend_name_material_verified.length;

    for (const cell of catalog.local_research_drafts) {
      const lat = coordinate(cell.latitude);
      const lon = coordinate(cell.longitude);

      if (
        lat === null || lon === null ||
        lat < 40 || lat > 45 ||
        lon < 20 || lon > 30
      ) continue;

      const km = distanceKm(latitude, longitude, lat, lon);

      if (km > cellRadius) continue;

      cells.push({
        cell_id: text(cell.cell_id),
        source_file: catalog.source_file,
        distance_km: Math.round(km * 1000) / 1000,
        source_sheet: text(cell.source_sheet),
        classification: compactResearchValue(
          cell.classification, 300
        ),
        regional_text: text(cell.geological_text_bg).slice(0, 1000),
        regional_sources: compactResearchValue(
          cell.regional_sources, 450
        ),
        lithological_sources: compactResearchValue(
          cell.lithological_sources, 450
        ),
        geographic_basis:
          "RESEARCH_CELL_COORDINATE_DISTANCE_NOT_VERIFIED_GEOLOGICAL_EXTENT",
        research_only: true,
        point_depth_prediction_authorized: false
      });
    }

    for (const unit of catalog.sheet_unit_catalog) {
      const sheet = text(unit.sheet).toUpperCase();

      if (!sheet || !sheets.has(sheet)) continue;

      units.push({
        sheet,
        unit_name: text(unit.unit_name),
        source_file: catalog.source_file,
        material_variants: compactResearchValue(
          unit.material_variants, 550
        ),
        source_provenance: compactResearchValue(
          unit.source_provenance, 450
        ),
        legend_verified:
          unit.original_legend_independently_checked === true,
        geological_contact_verified_for_point:
          unit.geological_contact_verified_for_point === true,
        depth_prediction_authorized: false,
        geographic_basis:
          "SAME_MAP_SHEET_ONLY_UNIT_LOCATION_NOT_VERIFIED"
      });
    }
  }

  cells.sort((a, b) => a.distance_km - b.distance_km);

  const cleanName = (value: string): boolean =>
    value.length > 2 &&
    !/[?]{3,}/.test(value) &&
    !/\uFFFD/.test(value);

  const relevantUnits = units.filter(u => cleanName(u.unit_name));

  const canonicalName = (value: string): string =>
    value.toLocaleLowerCase("bg-BG")
      .replace(/[„“"']/g, "")
      .replace(/\s+/g, " ")
      .trim();

  for (const catalog of catalogs) {
    for (const legend of catalog.legend_name_material_verified) {
      const name = text(legend.formation_name_bg);
      if (!cleanName(name)) continue;

      const matchingUnits = relevantUnits.filter(
        u => canonicalName(u.unit_name) === canonicalName(name)
      );

      if (!matchingUnits.length) continue;

      legendMatches.push({
        formation_name_bg: name,
        matching_sheets: [...new Set(matchingUnits.map(u => u.sheet))],
        name_and_materials_verified_against_legend:
          legend.name_and_materials_verified_against_legend === true,
        exact_symbol_indices_verified:
          legend.exact_symbol_indices_verified === true,
        geographical_assignment_verified:
          legend.geographical_assignment_verified === true,
        depth_from_surface_verified:
          legend.depth_from_surface_verified === true,
        materials_from_map_legend: compactResearchValue(
          legend.materials_from_map_legend, 600
        ),
        evidence_basis:
          "MATCHING_FORMATION_NAME_ON_SAME_MAP_SHEET_ONLY",
        point_depth_prediction_authorized: false
      });
    }
  }

  // A verified legend name is not a verified unit at the point.
  // Compare against names declared by intersecting research polygons,
  // not against every formation on the same map sheet.
  const polygonNames = new Set(
    polygonUnitCandidates
      .map(canonicalName)
      .filter(Boolean)
  );

  const polygonLegendMatches = legendMatches.filter(
    reference => polygonNames.has(
      canonicalName(text(reference.formation_name_bg))
    )
  ).map(reference => ({
    ...reference,
    match_basis:
      "INTERSECTING_RESEARCH_POLYGON_UNIT_NAME_AND_LEGEND_NAME",
    geographical_assignment_verified: false,
    point_depth_prediction_authorized: false
  }));

  relevantUnits.sort((a, b) =>
    Number(b.legend_verified) - Number(a.legend_verified) ||
    a.unit_name.localeCompare(b.unit_name, "bg")
  );

  return {
    catalog_count: catalogs.length,
    total_research_cells: totalCells,
    total_sheet_units: totalUnits,
    total_legend_verification_records: totalLegendRecords,
    same_sheet_legend_reference_count: legendMatches.length,
    polygon_legend_match_count: polygonLegendMatches.length,
    polygon_legend_matches: polygonLegendMatches.slice(0, 8),
    unreadable_same_sheet_unit_count:
      units.length - relevantUnits.length,
    cell_search_radius_km: cellRadius,
    nearby_cell_count: cells.length,
    nearby_research_cells: cells.slice(0, 8),
    same_sheet_unit_count: units.length,
    same_sheet_unit_candidates: relevantUnits.slice(0, 8),
    warnings: [
      "A research cell coordinate is not a verified geological boundary.",
      "A map sheet match does not establish that a geological unit occurs at the target.",
      "No depth intervals are authorized by this research support lookup.",
      "Legend names on the same sheet are documentary context only.",
      "Polygon-to-legend name matches are research hypotheses, not verified geology at the point."
    ]
  };
}
function intersectingResearchPolygons(
  latitude: number,
  longitude: number
) {
  return getNationalResearchPolygonFeatures().flatMap(feature => {
    if (!intersectsResearchGeometry(
      longitude, latitude, feature.geometry
    )) return [];

    const p = feature.properties ?? {};
    const original = object(p.original_properties);
    const fact = getNationalResearchSpatialFacts()
      .get(text(p.evidence_id));

    return [{
      research_fact_linked: Boolean(fact),
      research_fact_source_sheet:
        fact ? compactResearchValue(fact.source_geological_sheet, 200)
             : null,
      research_fact_semantic_status:
        fact ? compactResearchValue(fact.semantic_status, 300)
             : null,
      research_fact_review_status:
        fact ? compactResearchValue(fact.source_review_status, 300)
             : null,
      research_fact_spatial_verification:
        fact ? compactResearchValue(fact.spatial_verification, 700)
             : null,
      research_fact_regional_context:
        fact ? compactResearchValue(fact.regional_geological_context, 900)
             : null,
      research_fact_documented_materials:
        fact ? compactResearchValue(fact.documented_map_material_names, 600)
             : null,
      research_fact_valid_use:
        fact ? compactResearchValue(fact.valid_use, 400)
             : null,
      research_fact_original_record_id:
        fact ? compactResearchValue(fact.source_original_record_id, 200)
             : null,
      evidence_id: text(p.evidence_id),
      oblast: text(p.oblast),
      source_file: text(p.source_file),
      original_feature_index: p.original_feature_index ?? null,
      geological_unit_candidate:
        text(original.geological_unit_bg) ||
        text(original.research_normalized_unit_bg) ||
        null,
      material_candidates:
        Array.isArray(original.materials_bg)
          ? original.materials_bg.slice(0, 8)
          : [],
      evidence_status:
        text(original.evidence_status) || "UNSPECIFIED",
      verified_geological_contact:
        p.verified_geological_contact === true,
      verified_geological_unit_at_point:
        p.verified_geological_unit_at_point === true,
      depth_intervals_at_point:
        p.depth_intervals_at_point ?? null,
      spatial_depth_projection_authorized:
        p.spatial_depth_projection_authorized === true,
      production_geology_activation_approved:
        p.production_geology_activation_approved === true,
      spatial_match:
        "RESEARCH_POLYGON_GEOMETRY_INTERSECTION_ONLY",
      warning:
        "Geometry intersection does not verify the geological " +
        "unit, contact, lithology, or depth at the selected point."
    }];
  });
}
export function searchLunaNationalSpatialEvidence(args: {
  latitude: number;
  longitude: number;
  radius_km?: number;
  region?: string;
}) {
  const {latitude, longitude} = args;

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < 40 || latitude > 45 ||
    longitude < 20 || longitude > 30
  ) {
    return { error: "INVALID_TARGET_COORDINATES" };
  }

  const radius = Math.min(
    50,
    Math.max(0.1,
      Number.isFinite(args.radius_km)
        ? args.radius_km!
        : 10)
  );

  const region = normalizeRegion(args.region ?? "");
  const index = getLunaNationalSpatialIndex();

  const verifiedNearby = index.flatMap(item => {
    if (
      item.geographic_class !== "VERIFIED_COORDINATE_REFERENCE" ||
      item.latitude === null ||
      item.longitude === null
    ) return [];

    const distance = distanceKm(
      latitude, longitude,
      item.latitude, item.longitude
    );

    if (distance > radius) return [];

    return [{
      ...item,
      distance_km: Math.round(distance * 1000) / 1000,
      spatial_match: "VERIFIED_COORDINATE_DISTANCE",
      point_depth_prediction_authorized: false
    }];
  }).sort((a, b) => a.distance_km - b.distance_km);

  const regionalCandidates = region
    ? index.filter(item =>
        item.declared_regions.some(
          value => normalizeRegion(value) === region
        ) &&
        item.geographic_class !== "VERIFIED_COORDINATE_REFERENCE"
      ).slice(0, 12).map(item => ({
        ...item,
        spatial_match: "DOCUMENTARY_REGION_ONLY",
        point_depth_prediction_authorized: false
      }))
    : [];

  const nearbyBoreholes = nearbyVerifiedBoreholes(
    latitude, longitude, radius
  );

  const researchPolygons = intersectingResearchPolygons(
    latitude, longitude
  );

  const polygonSheets = researchPolygons
    .map(p => p.research_fact_source_sheet)
    .filter((v): v is string => typeof v === "string");

  const polygonUnitCandidates = researchPolygons
    .map(p => p.geological_unit_candidate)
    .filter((v): v is string =>
      typeof v === "string" && v.trim().length > 0
    );

  const researchSupport = getNearbyResearchSupport(
    latitude,
    longitude,
    radius,
    polygonSheets,
    polygonUnitCandidates
  );

  return {
    target: { latitude, longitude },
    research_support: researchSupport,
    verified_borehole_count: nearbyBoreholes.length,
    verified_nearby_boreholes: nearbyBoreholes.slice(0, 12),
    intersecting_research_polygon_count: researchPolygons.length,
    intersecting_research_polygons: researchPolygons.slice(0, 12),
    linked_sources: {
      national_borehole_index: "getNationalBoreholeIndex",
      national_research_catalog: "getNationalResearchEvidenceCatalog",
      research_polygon_source:
        "montana_research_spatial_evidence.geojson"
    },
    radius_km: radius,
    catalog_records: index.length,
    verified_nearby_count: verifiedNearby.length,
    verified_nearby: verifiedNearby.slice(0, 12),
    regional_candidates: regionalCandidates,
    search_limit: {
      verified_nearby: 12,
      regional_candidates: 12
    },
    warning:
      "Verified coordinates identify the documentary record's location, " +
      "not proven lithology beneath the selected property. " +
      "Regional documents cannot be projected to the target point. " +
      "All national research catalog records remain research-only. " +
      "Use read_national_research for full provenance. " +
      "Validated borehole intervals must come from the separate " +
      "national borehole evidence tool."
  };
}