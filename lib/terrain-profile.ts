import "server-only";

import path from "node:path";
import { fromFile } from "geotiff";

const DEM_ROOT = path.join(
  process.cwd(),
  "data",
  "terrain",
  "copernicus-glo30"
);

const PIXEL_DEGREES = 1 / 3600;

export type TerrainPosition =
  | "local_low"
  | "lower_slope"
  | "mid_slope"
  | "upper_slope"
  | "local_high"
  | "flat_or_indeterminate";

export type TerrainProfile = {
  status:
    | "OK"
    | "OUTSIDE_DATASET"
    | "INVALID_COORDINATES"
    | "NO_VALID_TERRAIN"
    | "DATA_UNAVAILABLE";
  source: "Copernicus DEM GLO-30";
  resolution_arc_seconds: 1;
  resolution_approx_m: 30;
  latitude: number;
  longitude: number;
  tile: string | null;
  elevation_m: number | null;
  local_window_radius_pixels: number;
  local_window_approx_radius_m: number;
  local_min_m: number | null;
  local_max_m: number | null;
  local_mean_m: number | null;
  local_relief_m: number | null;
  elevation_relative_to_local_mean_m: number | null;
  slope_degrees: number | null;
  terrain_position: TerrainPosition | null;
  semantics: {
    model: "digital_surface_model";
    vertical_reference: "EGM2008";
    role: "terrain_context_only";
    limitation: string;
  };
};

function finiteNumber(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function tileName(lat: number, lon: number): string | null {
  /*
   * Current local dataset intentionally covers:
   * N41..N44 and E022..E028.
   */
  const latFloor = Math.floor(lat);
  const lonFloor = Math.floor(lon);

  if (
    latFloor < 41 ||
    latFloor > 44 ||
    lonFloor < 22 ||
    lonFloor > 28
  ) {
    return null;
  }

  return (
    `Copernicus_DSM_10_` +
    `N${String(latFloor).padStart(2, "0")}_00_` +
    `E${String(lonFloor).padStart(3, "0")}_00_DEM.tif`
  );
}

function classifyTerrainPosition(
  elevation: number,
  mean: number,
  min: number,
  max: number,
  slopeDegrees: number | null
): TerrainPosition {
  const relief = max - min;

  /*
   * Do not assign slope-position labels merely because a point lies
   * high or low inside a very small elevation range.
   *
   * With the default 5-pixel radius (~150 m), terrain with both
   * low local relief and a very small central slope is treated as
   * flat/indeterminate. This prevents nearly level valley-floor
   * surfaces from being labelled "upper_slope" or "local_high"
   * because of only a few metres of DEM variation.
   */
  if (
    !Number.isFinite(relief) ||
    (
      relief < 10 &&
      (slopeDegrees === null || slopeDegrees < 2)
    )
  ) {
    return "flat_or_indeterminate";
  }

  const normalized = (elevation - min) / relief;

  if (normalized <= 0.2) return "local_low";
  if (normalized <= 0.4) return "lower_slope";
  if (normalized < 0.6) return "mid_slope";
  if (normalized < 0.8) return "upper_slope";
  if (normalized <= 1.0) return "local_high";

  return elevation < mean
    ? "lower_slope"
    : "upper_slope";
}

function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const r = 6371008.8;
  const toRad = Math.PI / 180;

  const p1 = lat1 * toRad;
  const p2 = lat2 * toRad;
  const dp = (lat2 - lat1) * toRad;
  const dl = (lon2 - lon1) * toRad;

  const a =
    Math.sin(dp / 2) ** 2 +
    Math.cos(p1) *
      Math.cos(p2) *
      Math.sin(dl / 2) ** 2;

  return 2 * r * Math.asin(Math.sqrt(a));
}

export async function getTerrainProfile(
  latitudeValue: string | number | null,
  longitudeValue: string | number | null,
  windowRadiusPixels = 5
): Promise<TerrainProfile> {
  const latitude = finiteNumber(latitudeValue);
  const longitude = finiteNumber(longitudeValue);

  const baseSemantics = {
    model: "digital_surface_model" as const,
    vertical_reference: "EGM2008" as const,
    role: "terrain_context_only" as const,
    limitation:
      "Copernicus GLO-30 is used only for broad terrain and relief context. " +
      "It does not establish groundwater presence, aquifer depth, hydraulic connectivity, " +
      "or exact geological boundaries.",
  };

  const invalid = (
    status: TerrainProfile["status"],
    lat: number,
    lon: number,
    tile: string | null
  ): TerrainProfile => ({
    status,
    source: "Copernicus DEM GLO-30",
    resolution_arc_seconds: 1,
    resolution_approx_m: 30,
    latitude: lat,
    longitude: lon,
    tile,
    elevation_m: null,
    local_window_radius_pixels: windowRadiusPixels,
    local_window_approx_radius_m:
      Math.round(windowRadiusPixels * 30),
    local_min_m: null,
    local_max_m: null,
    local_mean_m: null,
    local_relief_m: null,
    elevation_relative_to_local_mean_m: null,
    slope_degrees: null,
    terrain_position: null,
    semantics: baseSemantics,
  });

  if (latitude === null || longitude === null) {
    return invalid(
      "INVALID_COORDINATES",
      latitude ?? NaN,
      longitude ?? NaN,
      null
    );
  }

  const filename = tileName(latitude, longitude);

  if (!filename) {
    return invalid(
      "OUTSIDE_DATASET",
      latitude,
      longitude,
      null
    );
  }

  const file = path.join(DEM_ROOT, filename);

  /*
   * DEM tiles are local optional terrain context.
   *
   * Production deployments may intentionally omit the large
   * Copernicus GeoTIFF files. Missing/unreadable terrain data
   * must never abort the complete depth/lithology analysis.
   */
  const image =
    await (async () => {
      try {
        const tif =
          await fromFile(file);

        return await tif.getImage();
      }
      catch {
        return null;
      }
    })();

  if (!image) {
    return invalid(
      "DATA_UNAVAILABLE",
      latitude,
      longitude,
      filename
    );
  }

  const [originX, originY] = image.getOrigin();
  const [resX, resY] = image.getResolution();

  const width = image.getWidth();
  const height = image.getHeight();

  const pixelX = Math.round(
    (longitude - originX) / resX
  );

  const pixelY = Math.round(
    (latitude - originY) / resY
  );

  if (
    pixelX < 0 ||
    pixelX >= width ||
    pixelY < 0 ||
    pixelY >= height
  ) {
    return invalid(
      "OUTSIDE_DATASET",
      latitude,
      longitude,
      filename
    );
  }

  const radius = Math.max(
    2,
    Math.min(30, Math.floor(windowRadiusPixels))
  );

  const x0 = Math.max(0, pixelX - radius);
  const y0 = Math.max(0, pixelY - radius);
  const x1 = Math.min(width, pixelX + radius + 1);
  const y1 = Math.min(height, pixelY + radius + 1);

  const raster = await image.readRasters({
    window: [x0, y0, x1, y1],
    interleave: true,
  });

  const values = Array.from(
    raster as unknown as ArrayLike<number>
  ).filter((value) => Number.isFinite(value));

  /*
   * In Copernicus DEM ocean cells can be represented by 0.
   * Bulgaria analysis is land-based. We do not treat an all-zero
   * sample as valid terrain evidence.
   */
  const nonZero = values.filter(
    (value) => Math.abs(value) > 0.0001
  );

  if (nonZero.length === 0) {
    return invalid(
      "NO_VALID_TERRAIN",
      latitude,
      longitude,
      filename
    );
  }

  const windowWidth = x1 - x0;

  const centreIndex =
    (pixelY - y0) * windowWidth +
    (pixelX - x0);

  const centreRaw = Number(
    (raster as unknown as ArrayLike<number>)[centreIndex]
  );

  if (
    !Number.isFinite(centreRaw) ||
    Math.abs(centreRaw) <= 0.0001
  ) {
    return invalid(
      "NO_VALID_TERRAIN",
      latitude,
      longitude,
      filename
    );
  }

  const min = Math.min(...nonZero);
  const max = Math.max(...nonZero);
  const mean =
    nonZero.reduce((sum, value) => sum + value, 0) /
    nonZero.length;

  /*
   * Horn-style central slope approximation using the immediate
   * north/south/east/west neighbours. Horizontal ground distances
   * are calculated geodesically at the target latitude.
   */
  const sampleAt = (
    dx: number,
    dy: number
  ): number | null => {
    const x = pixelX + dx;
    const y = pixelY + dy;

    if (
      x < x0 ||
      x >= x1 ||
      y < y0 ||
      y >= y1
    ) {
      return null;
    }

    const index =
      (y - y0) * windowWidth +
      (x - x0);

    const value = Number(
      (raster as unknown as ArrayLike<number>)[index]
    );

    return Number.isFinite(value) &&
      Math.abs(value) > 0.0001
      ? value
      : null;
  };

  const west = sampleAt(-1, 0);
  const east = sampleAt(1, 0);
  const north = sampleAt(0, -1);
  const south = sampleAt(0, 1);

  let slopeDegrees: number | null = null;

  if (
    west !== null &&
    east !== null &&
    north !== null &&
    south !== null
  ) {
    const eastLon = longitude + PIXEL_DEGREES;
    const westLon = longitude - PIXEL_DEGREES;
    const northLat = latitude + PIXEL_DEGREES;
    const southLat = latitude - PIXEL_DEGREES;

    const dx = haversineMeters(
      latitude,
      westLon,
      latitude,
      eastLon
    );

    const dy = haversineMeters(
      southLat,
      longitude,
      northLat,
      longitude
    );

    const dzdx = (east - west) / dx;
    const dzdy = (north - south) / dy;

    slopeDegrees =
      Math.atan(
        Math.sqrt(dzdx * dzdx + dzdy * dzdy)
      ) *
      180 /
      Math.PI;
  }

  return {
    status: "OK",
    source: "Copernicus DEM GLO-30",
    resolution_arc_seconds: 1,
    resolution_approx_m: 30,
    latitude,
    longitude,
    tile: filename,
    elevation_m:
      Math.round(centreRaw * 10) / 10,
    local_window_radius_pixels: radius,
    local_window_approx_radius_m:
      Math.round(radius * 30),
    local_min_m:
      Math.round(min * 10) / 10,
    local_max_m:
      Math.round(max * 10) / 10,
    local_mean_m:
      Math.round(mean * 10) / 10,
    local_relief_m:
      Math.round((max - min) * 10) / 10,
    elevation_relative_to_local_mean_m:
      Math.round((centreRaw - mean) * 10) / 10,
    slope_degrees:
      slopeDegrees === null
        ? null
        : Math.round(slopeDegrees * 10) / 10,
    terrain_position:
      classifyTerrainPosition(
        centreRaw,
        mean,
        min,
        max,
        slopeDegrees
      ),
    semantics: baseSemantics,
  };
}