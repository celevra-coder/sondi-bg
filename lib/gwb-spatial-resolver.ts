import fs from "fs";
import path from "path";

type AnyGeometry = {
  type?: string;
  coordinates?: any;
};

type AnyFeature = {
  properties?: Record<string, any>;
  geometry?: AnyGeometry;
};

export type ResolvedGroundwaterBody = {
  code: string;
  basin: "BG1" | "BG2" | "BG3" | "BG4";
};

const SOURCES = [
  {
    basin: "BG1" as const,
    filename:
      "bd_danube_groundwater_bodies.geojson",
  },
  {
    basin: "BG2" as const,
    filename:
      "bd_bs_groundwater_bodies.geojson",
  },
  {
    basin: "BG3" as const,
    filename:
      "bd_ibr_groundwater_bodies_enriched.geojson",
  },
  {
    basin: "BG4" as const,
    filename:
      "bd_wabd_groundwater_bodies.geojson",
  },
];

const cache = new Map<string, AnyFeature[]>();

function loadFeatures(
  filename: string
): AnyFeature[] {
  const cached = cache.get(filename);

  if (cached) {
    return cached;
  }

  const filePath = path.join(
    process.cwd(),
    "public",
    "geology-map",
    "data",
    filename
  );

  const parsed = JSON.parse(
    fs.readFileSync(filePath, "utf8")
  );

  const features =
    Array.isArray(parsed?.features)
      ? parsed.features
      : [];

  cache.set(filename, features);

  return features;
}

function groundwaterBodyCode(
  feature: AnyFeature
): string {
  const p = feature?.properties || {};

  return String(
    p.canonical_code ||
    p.localId ||
    p.localID ||
    p.gwb_code ||
    p.cod ||
    p.code ||
    p.Code ||
    ""
  )
    .trim()
    .toUpperCase();
}

function pointInRing(
  lon: number,
  lat: number,
  ring: number[][]
): boolean {
  let inside = false;

  for (
    let i = 0, j = ring.length - 1;
    i < ring.length;
    j = i++
  ) {
    const xi = Number(ring[i]?.[0]);
    const yi = Number(ring[i]?.[1]);
    const xj = Number(ring[j]?.[0]);
    const yj = Number(ring[j]?.[1]);

    if (
      !Number.isFinite(xi) ||
      !Number.isFinite(yi) ||
      !Number.isFinite(xj) ||
      !Number.isFinite(yj)
    ) {
      continue;
    }

    const intersect =
      yi > lat !== yj > lat &&
      lon <
        ((xj - xi) * (lat - yi)) /
          ((yj - yi) || 1e-12) +
        xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

function pointInPolygon(
  lon: number,
  lat: number,
  rings: number[][][]
): boolean {
  if (
    !Array.isArray(rings) ||
    !rings.length ||
    !pointInRing(lon, lat, rings[0])
  ) {
    return false;
  }

  for (let i = 1; i < rings.length; i++) {
    if (pointInRing(lon, lat, rings[i])) {
      return false;
    }
  }

  return true;
}

function pointInGeometry(
  lon: number,
  lat: number,
  geometry?: AnyGeometry
): boolean {
  if (!geometry) {
    return false;
  }

  if (geometry.type === "Polygon") {
    return pointInPolygon(
      lon,
      lat,
      geometry.coordinates || []
    );
  }

  if (geometry.type === "MultiPolygon") {
    const polygons =
      geometry.coordinates || [];

    return polygons.some(
      (rings: number[][][]) =>
        pointInPolygon(lon, lat, rings)
    );
  }

  return false;
}

export function resolveGroundwaterBodiesAtPoint(
  lat: number,
  lng: number
): ResolvedGroundwaterBody[] {
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    return [];
  }

  const result:
    ResolvedGroundwaterBody[] = [];

  const seen = new Set<string>();

  for (const source of SOURCES) {
    const features =
      loadFeatures(source.filename);

    for (const feature of features) {
      if (
        !pointInGeometry(
          lng,
          lat,
          feature.geometry
        )
      ) {
        continue;
      }

      const code =
        groundwaterBodyCode(feature);

      if (
        !code ||
        !code.startsWith(source.basin + "G") ||
        seen.has(code)
      ) {
        continue;
      }

      seen.add(code);

      result.push({
        code,
        basin: source.basin,
      });
    }
  }

  return result;
}
