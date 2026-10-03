import "server-only";

import fs from "node:fs";
import path from "node:path";

type Position = [number, number];

type Geometry = {
  type: string;
  coordinates: any;
};

type Feature = {
  type?: string;
  geometry?: Geometry | null;
  properties?: Record<string, any>;
};

type FeatureCollection = {
  type?: string;
  features?: Feature[];
};

export type GroundwaterBodyContext = {
  canonical_code: string | null;
  gwb_code: string | null;

  name_bg: string | null;
  name_en: string | null;

  basin_district: string | null;
  basin_district_code: string | null;

  vertical_horizon: string | null;
  groundwater_body_type: string | null;
  aquifer_type: string | null;

  lithology: string | null;
  stratigraphy: string | null;

  aquifer_thickness_m: string | number | null;
  hydraulic_conductivity_m_day: string | number | null;
  transmissivity_m2_day: string | number | null;

  pressure_condition: string | null;
  surface_water_connection_degree: string | null;

  source_hydrogeology: string | null;
  source_geometry: string | null;

  interpretation_guard: string;
};

export type GroundwaterBodyProfileResult = {
  latitude: number;
  longitude: number;

  status:
    | "MATCHED"
    | "NO_MATCH"
    | "OUTSIDE_DATASET"
    | "INVALID_COORDINATES";

  bodies: GroundwaterBodyContext[];

  source: string;
  semantics: {
    official_groundwater_body_context: true;
    regional_hydrogeology_only: true;
    does_not_define_exact_borehole_lithology: true;
    does_not_define_exact_aquifer_depth_at_target: true;
    does_not_establish_groundwater_presence_at_target: true;
    does_not_establish_drilling_yield: true;
  };
};

let cache: FeatureCollection | null = null;

function loadData(): FeatureCollection {
  if (cache) return cache;

  const filePath = path.join(
    process.cwd(),
    "public",
    "geology-map",
    "data",
    "bd_wabd_groundwater_bodies.geojson"
  );

  const raw = fs.readFileSync(filePath, "utf8");

  cache = JSON.parse(raw) as FeatureCollection;

  return cache;
}

function validCoordinate(
  latitude: number,
  longitude: number
): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function pointOnSegment(
  x: number,
  y: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): boolean {
  const eps = 1e-10;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx ** 2 + dy ** 2;

  if (lenSq <= eps ** 2) {
    return (
      Math.abs(x - x1) <= eps &&
      Math.abs(y - y1) <= eps
    );
  }

  const cross =
    (x - x1) * (y2 - y1) -
    (y - y1) * (x2 - x1);

  if (Math.abs(cross) > eps) {
    return false;
  }

  const dot =
    (x - x1) * (x2 - x1) +
    (y - y1) * (y2 - y1);

  if (dot < -eps) {
    return false;
  }

  if (dot - lenSq > eps) {
    return false;
  }

  return true;
}

function pointInRing(
  longitude: number,
  latitude: number,
  ring: Position[]
): boolean {
  if (!Array.isArray(ring) || ring.length < 3) {
    return false;
  }

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

    if (
      pointOnSegment(
        longitude,
        latitude,
        xi,
        yi,
        xj,
        yj
      )
    ) {
      return true;
    }

    const intersects =
      yi > latitude !== yj > latitude &&
      longitude <
        ((xj - xi) *
          (latitude - yi)) /
          (yj - yi) +
          xi;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

function pointInPolygon(
  longitude: number,
  latitude: number,
  polygon: Position[][]
): boolean {
  if (!Array.isArray(polygon) || polygon.length === 0) {
    return false;
  }

  if (
    !pointInRing(
      longitude,
      latitude,
      polygon[0]
    )
  ) {
    return false;
  }

  for (let i = 1; i < polygon.length; i++) {
    if (
      pointInRing(
        longitude,
        latitude,
        polygon[i]
      )
    ) {
      return false;
    }
  }

  return true;
}

function geometryContainsPoint(
  geometry: Geometry | null | undefined,
  longitude: number,
  latitude: number
): boolean {
  if (!geometry) {
    return false;
  }

  if (geometry.type === "Polygon") {
    return pointInPolygon(
      longitude,
      latitude,
      geometry.coordinates as Position[][]
    );
  }

  if (geometry.type === "MultiPolygon") {
    const polygons =
      geometry.coordinates as Position[][][];

    return polygons.some((polygon) =>
      pointInPolygon(
        longitude,
        latitude,
        polygon
      )
    );
  }

  return false;
}

function textValue(value: unknown): string | null {
  if (
    typeof value === "string" &&
    value.trim().length > 0
  ) {
    return value.trim();
  }

  return null;
}

function numericOrText(
  value: unknown
): string | number | null {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  return textValue(value);
}

function toContext(
  feature: Feature
): GroundwaterBodyContext {
  const p = feature.properties || {};

  return {
    canonical_code:
      textValue(p.canonical_code),

    gwb_code:
      textValue(p.gwb_code),

    name_bg:
      textValue(p.name) ||
      textValue(p.NAME),

    name_en:
      textValue(p.name_en),

    basin_district:
      textValue(p.basin_district),

    basin_district_code:
      textValue(p.basin_district_code),

    vertical_horizon:
      textValue(p.vertical_horizon),

    groundwater_body_type:
      textValue(p.groundwater_body_type),

    aquifer_type:
      textValue(p.aquifer_type),

    lithology:
      textValue(p.lithology),

    stratigraphy:
      textValue(p.stratigraphy),

    aquifer_thickness_m:
      numericOrText(p.aquifer_thickness_m),

    hydraulic_conductivity_m_day:
      numericOrText(
        p.hydraulic_conductivity_m_day
      ),

    transmissivity_m2_day:
      numericOrText(
        p.transmissivity_m2_day
      ),

    pressure_condition:
      textValue(p.pressure_condition),

    surface_water_connection_degree:
      textValue(
        p.surface_water_connection_degree
      ),

    source_hydrogeology:
      textValue(p.source_hydrogeology),

    source_geometry:
      textValue(p.source_geometry),

    interpretation_guard:
      "Официалното подземно водно тяло описва регионален хидрогеоложки контекст. То не определя само по себе си точната литоложка колона, точната дълбочина на водоносен интервал, наличие на вода или очакван дебит в избраната точка.",
  };
}

export function getGroundwaterBodyProfile(
  latitude: number,
  longitude: number
): GroundwaterBodyProfileResult {
  const base = {
    latitude,
    longitude,

    source:
      "BDZBR PURB 2022-2027 Section 1 + ExEA GISWMR INSPIRE official groundwater body geometry",

    semantics: {
      official_groundwater_body_context: true as const,
      regional_hydrogeology_only: true as const,
      does_not_define_exact_borehole_lithology:
        true as const,
      does_not_define_exact_aquifer_depth_at_target:
        true as const,
      does_not_establish_groundwater_presence_at_target:
        true as const,
      does_not_establish_drilling_yield:
        true as const,
    },
  };

  if (!validCoordinate(latitude, longitude)) {
    return {
      ...base,
      status: "INVALID_COORDINATES",
      bodies: [],
    };
  }

  const data = loadData();

  if (!Array.isArray(data.features)) {
    return {
      ...base,
      status: "OUTSIDE_DATASET",
      bodies: [],
    };
  }

  const matches = data.features
    .filter((feature) =>
      geometryContainsPoint(
        feature.geometry,
        longitude,
        latitude
      )
    )
    .map(toContext)
    .sort((a, b) => {
      const ah = a.vertical_horizon || "";
      const bh = b.vertical_horizon || "";

      const hc = ah.localeCompare(
        bh,
        "bg"
      );

      if (hc !== 0) {
        return hc;
      }

      return (
        (a.canonical_code || "").localeCompare(
          b.canonical_code || ""
        )
      );
    });

  return {
    ...base,
    status:
      matches.length > 0
        ? "MATCHED"
        : "NO_MATCH",
    bodies: matches,
  };
}