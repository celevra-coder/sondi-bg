import fs from "node:fs";
import path from "node:path";

type Position = [number, number];

type PolygonGeometry = {
  type: "Polygon";
  coordinates: Position[][];
};

type MultiPolygonGeometry = {
  type: "MultiPolygon";
  coordinates: Position[][][];
};

type Geometry =
  | PolygonGeometry
  | MultiPolygonGeometry;

type VratsaMunicipalityProperties = {
  identifier: string;
  name_bg: string;
  name_latin: string;
  district_code: string;
  nuts3_2024: string;
  nuts3_2027: string;
  version: string;
  zone_id: string;
  source: string;
  source_geometry_crs: string;
  geometry_crs: string;
  geometry_status: string;
};

type VratsaMunicipalityFeature = {
  type: "Feature";
  properties: VratsaMunicipalityProperties;
  geometry: Geometry;
};

type VratsaMunicipalityGeoJson = {
  type: "FeatureCollection";
  features: VratsaMunicipalityFeature[];
};

export type VratsaMunicipalityResolution =
  | {
      status: "OK";
      municipality: {
        identifier: string;
        name_bg: string;
        name_latin: string;
        district_code: string;
        nuts3_2024: string;
        version: string;
        source: string;
        geometry: "OFFICIAL_POLYGON";
      };
      zone: {
        zone_id: string;
        resolution:
          "OFFICIAL_MUNICIPALITY_POLYGON";
        exact_geometry_used: true;
      };
    }
  | {
      status:
        | "OUTSIDE_VRATSA_DISTRICT"
        | "AMBIGUOUS_BOUNDARY"
        | "INVALID_INPUT"
        | "DATA_UNAVAILABLE";
      municipality: null;
      zone: null;
    };

let cache:
  | VratsaMunicipalityGeoJson
  | null = null;

function loadVratsaMunicipalities():
  VratsaMunicipalityGeoJson {

  if (cache) {
    return cache;
  }

  const file = path.join(
    process.cwd(),
    "data",
    "soil-lithology",
    "runtime",
    "vratsa",
    "municipalities_2024.geojson"
  );

  const raw = fs.readFileSync(
    file,
    "utf8"
  );

  const parsed = JSON.parse(
    raw
  ) as VratsaMunicipalityGeoJson;

  if (
    parsed.type !== "FeatureCollection" ||
    !Array.isArray(parsed.features)
  ) {
    throw new Error(
      "Invalid Vratsa municipality GeoJSON"
    );
  }

  cache = parsed;

  return cache;
}

function pointOnSegment(
  longitude: number,
  latitude: number,
  ax: number,
  ay: number,
  bx: number,
  by: number
): boolean {

  /*
   * Numerical tolerance only.
   *
   * 1e-8 degree is roughly millimetre scale in Bulgaria.
   * This is not a geographic boundary buffer.
   */
  const epsilon =
    1e-8;

  const dx =
    bx - ax;

  const dy =
    by - ay;

  const length =
    Math.hypot(
      dx,
      dy
    );

  if (length === 0) {
    return (
      Math.abs(
        longitude - ax
      ) <= epsilon &&
      Math.abs(
        latitude - ay
      ) <= epsilon
    );
  }

  const cross =
    (
      longitude - ax
    ) * dy -
    (
      latitude - ay
    ) * dx;

  const distanceFromLine =
    Math.abs(cross) /
    length;

  if (
    distanceFromLine >
    epsilon
  ) {
    return false;
  }

  return (
    longitude >=
      Math.min(ax, bx) -
        epsilon &&
    longitude <=
      Math.max(ax, bx) +
        epsilon &&
    latitude >=
      Math.min(ay, by) -
        epsilon &&
    latitude <=
      Math.max(ay, by) +
        epsilon
  );
}

function pointInRing(
  longitude: number,
  latitude: number,
  ring: Position[]
): boolean {

  if (ring.length < 3) {
    return false;
  }

  let inside = false;

  let j =
    ring.length - 1;

  for (
    let i = 0;
    i < ring.length;
    i += 1
  ) {
    const [xi, yi] =
      ring[i];

    const [xj, yj] =
      ring[j];

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
      (yi > latitude) !==
        (yj > latitude) &&
      longitude <
        ((xj - xi) *
          (latitude - yi)) /
          (yj - yi) +
          xi;

    if (intersects) {
      inside = !inside;
    }

    j = i;
  }

  return inside;
}

function pointInPolygon(
  longitude: number,
  latitude: number,
  rings: Position[][]
): boolean {

  if (!rings.length) {
    return false;
  }

  if (
    !pointInRing(
      longitude,
      latitude,
      rings[0]
    )
  ) {
    return false;
  }

  for (
    let i = 1;
    i < rings.length;
    i += 1
  ) {
    if (
      pointInRing(
        longitude,
        latitude,
        rings[i]
      )
    ) {
      return false;
    }
  }

  return true;
}

function pointInGeometry(
  longitude: number,
  latitude: number,
  geometry: Geometry
): boolean {

  if (
    geometry.type === "Polygon"
  ) {
    return pointInPolygon(
      longitude,
      latitude,
      geometry.coordinates
    );
  }

  if (
    geometry.type ===
    "MultiPolygon"
  ) {
    return geometry.coordinates.some(
      polygon =>
        pointInPolygon(
          longitude,
          latitude,
          polygon
        )
    );
  }

  return false;
}

function validCoordinate(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

export function resolveVratsaMunicipality(
  latitude: number,
  longitude: number
): VratsaMunicipalityResolution {

  if (
    !validCoordinate(latitude) ||
    !validCoordinate(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return {
      status: "INVALID_INPUT",
      municipality: null,
      zone: null,
    };
  }

  let data:
    VratsaMunicipalityGeoJson;

  try {
    data =
      loadVratsaMunicipalities();
  }
  catch {
    return {
      status: "DATA_UNAVAILABLE",
      municipality: null,
      zone: null,
    };
  }

  const matches =
    data.features.filter(
      feature =>
        pointInGeometry(
          longitude,
          latitude,
          feature.geometry
        )
    );

  if (!matches.length) {
    return {
      status:
        "OUTSIDE_VRATSA_DISTRICT",
      municipality: null,
      zone: null,
    };
  }

  if (matches.length > 1) {
    return {
      status:
        "AMBIGUOUS_BOUNDARY",
      municipality: null,
      zone: null,
    };
  }

  const feature =
    matches[0];

  const p =
    feature.properties;

  return {
    status: "OK",

    municipality: {
      identifier:
        p.identifier,

      name_bg:
        p.name_bg,

      name_latin:
        p.name_latin,

      district_code:
        p.district_code,

      nuts3_2024:
        p.nuts3_2024,

      version:
        p.version,

      source:
        p.source,

      geometry:
        "OFFICIAL_POLYGON",
    },

    zone: {
      zone_id:
        p.zone_id,

      resolution:
        "OFFICIAL_MUNICIPALITY_POLYGON",

      exact_geometry_used:
        true,
    },
  };
}