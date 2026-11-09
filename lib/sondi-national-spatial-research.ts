import * as structuredFs from "fs";
import * as structuredPath from "path";
import "server-only";
import fs from "node:fs";
import path from "node:path";

/**
 * National spatial research evidence reader.
 * Research geometry never establishes geological contacts,
 * depth intervals, or production-approved lithology.
 */

type Geometry = {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
};

type Feature = {
  geometry: Geometry;
  properties: {
    evidence_id: string;
    evidence_scope: string;
    source_file?: string;
    original_properties?: Record<string, unknown>;
    verified_geological_contact: boolean;
    spatial_depth_projection_authorized: boolean;
    production_geology_activation_approved: boolean;
  };
};

type Collection = {
  metadata: {
    status: string;
    feature_count: number;
    consumer_wiring_enabled: boolean;
  };
  features: Feature[];
};

export type NationalSpatialResearchResult = {
  status: "RESEARCH_ONLY" | "NO_MATCH" | "UNAVAILABLE";
  matching_evidence_ids: string[];
  matching_footprint_count: number;
  verified_geological_contacts: 0;
  depth_prediction_authorized: false;
  production_geology_approved: false;
};

let cached: Collection | null = null;

function empty(
  status: "NO_MATCH" | "UNAVAILABLE"
): NationalSpatialResearchResult {
  return {
    status,
    matching_evidence_ids: [],
    matching_footprint_count: 0,
    verified_geological_contacts: 0,
    depth_prediction_authorized: false,
    production_geology_approved: false
  };
}

function load(): Collection | null {
  if (cached) return cached;

  const filename = path.join(
    process.cwd(),
    "data", "soil-lithology", "runtime", "regions",
    "montana_research_spatial_evidence.geojson"
  );

  if (!fs.existsSync(filename)) return null;

  try {
    const parsed = JSON.parse(
      fs.readFileSync(filename, "utf8")
    ) as Collection;

    if (
      parsed.metadata?.status !== "RESEARCH_ONLY" ||
      parsed.metadata?.feature_count !== 119 ||
      parsed.metadata?.consumer_wiring_enabled !== false ||
      !Array.isArray(parsed.features) ||
      parsed.features.length !== 119
    ) return null;

    if (!parsed.features.every(f =>
      f.properties?.evidence_scope === "RESEARCH_ONLY" &&
      f.properties?.verified_geological_contact === false &&
      f.properties?.spatial_depth_projection_authorized === false &&
      f.properties?.production_geology_activation_approved === false
    )) return null;

    cached = parsed;
    return cached;
  } catch {
    return null;
  }
}

function onSegment(
  p: number[], a: number[], b: number[]
): boolean {
  const cross =
    (p[0] - a[0]) * (b[1] - a[1]) -
    (p[1] - a[1]) * (b[0] - a[0]);

  if (Math.abs(cross) > 1e-10) return false;

  return p[0] >= Math.min(a[0], b[0]) - 1e-10 &&
    p[0] <= Math.max(a[0], b[0]) + 1e-10 &&
    p[1] >= Math.min(a[1], b[1]) - 1e-10 &&
    p[1] <= Math.max(a[1], b[1]) + 1e-10;
}

function inRing(
  point: number[], ring: number[][]
): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i];
    const b = ring[j];

    if (onSegment(point, a, b)) return true;

    const intersects =
      ((a[1] > point[1]) !== (b[1] > point[1])) &&
      point[0] <
        ((b[0] - a[0]) * (point[1] - a[1])) /
        (b[1] - a[1]) + a[0];

    if (intersects) inside = !inside;
  }
  return inside;
}

function inPolygon(
  point: number[], rings: number[][][]
): boolean {
  if (!rings.length || !inRing(point, rings[0])) return false;
  for (const hole of rings.slice(1)) {
    if (inRing(point, hole)) return false;
  }
  return true;
}

function contains(
  geometry: Geometry,
  longitude: number,
  latitude: number
): boolean {
  if (!geometry || !geometry.coordinates) return false;
  const point = [longitude, latitude];

  if (geometry.type === "Polygon") {
    return inPolygon(point, geometry.coordinates as number[][][]);
  }

  if (geometry.type === "MultiPolygon") {
    return (geometry.coordinates as number[][][][])
      .some(poly => inPolygon(point, poly));
  }

  return false;
}

/**
 * Source-independent national interface.
 * Only the source registry is Montana-specific.
 * No geological or depth prediction is generated here.
 */
export function resolveNationalSpatialResearch(
  latitude: number,
  longitude: number
): NationalSpatialResearchResult {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 || latitude > 90 ||
    longitude < -180 || longitude > 180
  ) return empty("NO_MATCH");

  const collection = load();
  if (!collection) return empty("UNAVAILABLE");

  const matched: string[] = [];

  for (const feature of collection.features) {
    if (contains(feature.geometry, longitude, latitude)) {
      matched.push(feature.properties.evidence_id);
    }
  }

  if (!matched.length) return empty("NO_MATCH");

  return {
    status: "RESEARCH_ONLY",
    matching_evidence_ids: matched,
    matching_footprint_count: matched.length,
    verified_geological_contacts: 0,
    depth_prediction_authorized: false,
    production_geology_approved: false
  };
}


/**
 * Common national interface for source-backed descriptive research.
 * Does not claim an exact surface unit, contact or depth.
 * The caller decides how the descriptive evidence is presented.
 */

/**
 * SONDI_83VU_NEARBY_RESEARCH_CONTEXT
 *
 * National, coordinate-based descriptive context.
 * Containing and nearby provisional evidence are never promoted
 * to verified geology, verified contacts, or depth predictions.
 */
export function getNationalSpatialResearchDescriptions(
  latitude: number,
  longitude: number
): { paragraphs: string[]; sources: string[] } {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    return { paragraphs: [], sources: [] };
  }

  const collection = load();
  if (!collection) return { paragraphs: [], sources: [] };

  const resolved = resolveNationalSpatialResearch(latitude, longitude);
  const containingIds = new Set(
    resolved.status === "RESEARCH_ONLY"
      ? resolved.matching_evidence_ids
      : []
  );

  type Coord = [number, number];
  type Ring = Coord[];
  type GeometryLike = {
    type: string;
    coordinates: unknown;
  };

  const isCoord = (p: unknown): p is Coord =>
    Array.isArray(p) &&
    p.length >= 2 &&
    typeof p[0] === "number" &&
    typeof p[1] === "number";

  const asPolygons = (geometry: GeometryLike): Ring[][] => {
    if (geometry.type !== "Polygon" &&
        geometry.type !== "MultiPolygon") return [];

    const source = geometry.type === "Polygon"
      ? [geometry.coordinates]
      : geometry.coordinates;

    if (!Array.isArray(source)) return [];

    return source
      .filter(Array.isArray)
      .map(poly => (poly as unknown[])
        .filter(Array.isArray)
        .map(ring => (ring as unknown[])
          .filter(isCoord)
        )
        .filter(ring => ring.length >= 3)
      )
      .filter(poly => poly.length > 0);
  };

  const pointInRing = (lon: number, lat: number, ring: Ring): boolean => {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [ax, ay] = ring[j];
      const [bx, by] = ring[i];

      const cross = (lon - ax) * (by - ay) -
        (lat - ay) * (bx - ax);

      if (Math.abs(cross) < 1e-10 &&
          lon >= Math.min(ax, bx) - 1e-10 &&
          lon <= Math.max(ax, bx) + 1e-10 &&
          lat >= Math.min(ay, by) - 1e-10 &&
          lat <= Math.max(ay, by) + 1e-10) {
        return true;
      }

      if ((ay > lat) !== (by > lat)) {
        const intersect = ax +
          (lat - ay) * (bx - ax) / (by - ay);
        if (lon < intersect) inside = !inside;
      }
    }
    return inside;
  };

  const distanceKm = (geometry: GeometryLike): number => {
    const polygons = asPolygons(geometry);
    const latFactor = 111.195;
    const lonFactor = 111.32 * Math.cos(latitude * Math.PI / 180);
    let best = Infinity;

    for (const polygon of polygons) {
      if (
        pointInRing(longitude, latitude, polygon[0]) &&
        !polygon.slice(1).some(hole =>
          pointInRing(longitude, latitude, hole)
        )
      ) {
        return 0;
      }

      for (const ring of polygon) {
        for (let i = 0; i < ring.length; i++) {
          const p = ring[i];
          const q = ring[(i + 1) % ring.length];

          const ax = (p[0] - longitude) * lonFactor;
          const ay = (p[1] - latitude) * latFactor;
          const bx = (q[0] - longitude) * lonFactor;
          const by = (q[1] - latitude) * latFactor;

          const dx = bx - ax;
          const dy = by - ay;
          const length2 = dx * dx + dy * dy;
          const t = length2 > 0
            ? Math.max(0, Math.min(1,
                -(ax * dx + ay * dy) / length2))
            : 0;

          best = Math.min(
            best,
            Math.hypot(ax + t * dx, ay + t * dy)
          );
        }
      }
    }
    return best;
  };

  const text = (v: unknown): string | null =>
    typeof v === "string" && v.trim()
      ? v.trim()
      : null;

  const stringItems = (v: unknown): string[] =>
    Array.isArray(v)
      ? v.filter(
          (x): x is string =>
            typeof x === "string" && x.trim().length > 0
        ).map(x => x.trim())
      : [];

  type Candidate = {
    id: string;
    distance: number;
    layer: string;
    description: string;
    materials: string[];
    source: string | null;
    contained: boolean;
  };

  // Read normalized research facts through the national
  // spatial reader. No province-specific geological rules.
  const factPath = structuredPath.join(
    process.cwd(),
    "data", "soil-lithology", "runtime", "regions",
    "montana_structured_research_facts.json"
  );

  type StructuredFact = {
    evidence_id: string;
    semantic_status: string;
    visual_description_only: boolean;
    geological_unit_candidate: string | null;
    regional_geological_context: string | null;
    documented_map_material_names: string[];
  };

  let structured: { records: StructuredFact[] };
  try {
    structured = JSON.parse(
      structuredFs.readFileSync(factPath, "utf8")
    ) as { records: StructuredFact[] };
  } catch {
    return { paragraphs: [], sources: [] };
  }

  const factById = new Map(
    structured.records.map(fact => [
      fact.evidence_id, fact
    ])
  );

  const candidates: Candidate[] = [];

  for (const feature of collection.features) {
    const properties = feature.properties;
    const original = properties.original_properties || {};
    const layer = text(original.coverage_layer);

    if (layer !== "GEOLOGICAL_RESEARCH" &&
        layer !== "REGIONAL_GEOLOGICAL_CONTEXT") {
      continue;
    }

    const contained = containingIds.has(properties.evidence_id);
    const distance = contained
      ? 0
      : distanceKm(feature.geometry as GeometryLike);

    if (!contained && distance > 1.5) continue;

    // SONDI_83VX_STRUCTURED_FACT_GATE
    // Semantic facts are explicitly separated from raw map
    // colours, research labels and unresolved raster candidates.
    const fact = factById.get(properties.evidence_id);
    if (!fact) continue;

    if (
      fact.visual_description_only ||
      (
        fact.semantic_status !==
          "NAMED_UNIT_WITH_MATERIALS_UNVERIFIED_SPATIAL" &&
        fact.semantic_status !== "REGIONAL_DESCRIPTION_ONLY"
      )
    ) {
      continue;
    }

    const description =
      fact.semantic_status === "REGIONAL_DESCRIPTION_ONLY"
        ? text(fact.regional_geological_context)
        : text(fact.geological_unit_candidate);

    if (!description) continue;

    const materials = stringItems(
      fact.documented_map_material_names
    );

    candidates.push({
      id: properties.evidence_id,
      distance,
      layer,
      description,
      materials: [...new Set(materials)].slice(0, 5),
      source: text(properties.source_file),
      contained
    });
  }

  const containing = candidates.filter(x => x.contained);
  const nearby = candidates
    .filter(x => !x.contained)
    .sort((a, b) => a.distance - b.distance);

  // Nearby evidence is a fallback, not extra geology
  // attached to an already containing research sector.
  const selected = containing.length
    ? containing.slice(0, 2)
    : nearby.slice(0, 2);

  const paragraphs: string[] = [];
  const sources = new Set<string>();
  const seen = new Set<string>();

  for (const item of selected) {
    const signature = [
      item.description.replace(/[.!?;\s]+$/u, ""),
      item.materials.length
        ? "Описани материали: " + item.materials.join(", ")
        : ""
    ].filter(Boolean).join(". ");

    if (seen.has(signature)) continue;
    seen.add(signature);

    const introduction = item.contained
      ? "Според предварителен картографски обхват за района: "
      : (
          "В съседен изследователски картографски участък " +
          "на приблизително " +
          item.distance.toFixed(1).replace(".", ",") +
          " км са описани: "
        );

    paragraphs.push(
      introduction + signature + ". " +
      (
        item.contained
          ? "Това е регионално картографско сведение."
          : "Това е сравнителна информация за съседен участък."
      ) +
      " Геореференцията и геоложките контакти " +
      "не са независимо потвърдени. " +
      "Не се установява конкретна литология " +
      "или последователност на пластове по дълбочина " +
      "под избраните координати."
    );

    if (item.source) sources.add(item.source);
  }

  return {
    paragraphs,
    sources: [...sources]
  };
}
