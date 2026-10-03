import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

type GeologyUnit = {
  id: number;
  code: string;
  name_bg: string;
  name_en: string;
  style?: string;
  rgb?: number[];
};

type GeologyMeta = {
  version: number;
  source: string;
  source_scale: string;
  master: {
    width: number;
    height: number;
    low_width: number;
    low_height: number;
    crop_x: number;
    crop_y: number;
    scale_x: number;
    scale_y: number;
  };
  affine: {
    pixel_to_utm_easting: number[];
    pixel_to_utm_northing: number[];
    utm_to_pixel_matrix: number[][];
  };
  rasters: {
    direct: string;
    reliable: string;
    source_obscured: string;
  };
  units: GeologyUnit[];
  qa?: Record<string, unknown>;
};

export type GeologyLocationResult = {
  status:
    | "DIRECT"
    | "GAP_FILL"
    | "SOURCE_OBSCURED"
    | "UNRESOLVED"
    | "OUTSIDE_RASTER"
    | "ERROR";
  classId: number;
  directId: number;
  reliableId: number;
  obscured: boolean;
  unit: GeologyUnit | null;
  pixel: { x: number; y: number } | null;
  source: string | null;
  sourceScale: string | null;
  qa: Record<string, unknown>;
  error?: string;
};

type LoadedMachine = {
  meta: GeologyMeta;
  direct: PNG;
  reliable: PNG;
  obscured: PNG;
  unitById: Map<number, GeologyUnit>;
};

let machineCache: LoadedMachine | null = null;

function publicPathFromUrl(url: string): string {
  const clean = url.replace(/^\/+/, "");
  return path.join(process.cwd(), "public", clean);
}

function readPng(filePath: string): PNG {
  return PNG.sync.read(fs.readFileSync(filePath));
}

function loadMachine(): LoadedMachine {
  if (machineCache) return machineCache;

  const metaPath = path.join(
    process.cwd(),
    "public",
    "geology-map",
    "data",
    "bd_ibr_geology_lookup.json"
  );

  const meta = JSON.parse(
    fs.readFileSync(metaPath, "utf8")
  ) as GeologyMeta;

  const direct = readPng(publicPathFromUrl(meta.rasters.direct));
  const reliable = readPng(publicPathFromUrl(meta.rasters.reliable));
  const obscured = readPng(publicPathFromUrl(meta.rasters.source_obscured));

  const expectedWidth = Number(meta.master.width);
  const expectedHeight = Number(meta.master.height);

  for (const raster of [direct, reliable, obscured]) {
    if (
      raster.width !== expectedWidth ||
      raster.height !== expectedHeight
    ) {
      throw new Error("Geology raster dimensions do not match metadata.");
    }
  }

  const unitById = new Map<number, GeologyUnit>();

  for (const unit of meta.units || []) {
    unitById.set(Number(unit.id), unit);
  }

  machineCache = {
    meta,
    direct,
    reliable,
    obscured,
    unitById,
  };

  return machineCache;
}

function lonLatToUTM35(lon: number, lat: number) {
  const a = 6378137.0;
  const f = 1 / 298.257223563;
  const k0 = 0.9996;

  const e2 = f * (2 - f);
  const ep2 = e2 / (1 - e2);

  const rad = Math.PI / 180;

  const phi = lat * rad;
  const lambda = lon * rad;
  const lambda0 = 27 * rad;

  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);
  const tanPhi = Math.tan(phi);

  const N =
    a /
    Math.sqrt(
      1 - e2 * sinPhi * sinPhi
    );

  const T = tanPhi * tanPhi;
  const C = ep2 * cosPhi * cosPhi;
  const A = cosPhi * (lambda - lambda0);

  const e4 = e2 * e2;
  const e6 = e4 * e2;

  const M =
    a *
    (
      (
        1 -
        e2 / 4 -
        (3 * e4) / 64 -
        (5 * e6) / 256
      ) *
        phi -
      (
        (3 * e2) / 8 +
        (3 * e4) / 32 +
        (45 * e6) / 1024
      ) *
        Math.sin(2 * phi) +
      (
        (15 * e4) / 256 +
        (45 * e6) / 1024
      ) *
        Math.sin(4 * phi) -
      ((35 * e6) / 3072) *
        Math.sin(6 * phi)
    );

  const easting =
    k0 *
      N *
      (
        A +
        ((1 - T + C) * Math.pow(A, 3)) / 6 +
        (
          (
            5 -
            18 * T +
            T * T +
            72 * C -
            58 * ep2
          ) *
          Math.pow(A, 5)
        ) /
          120
      ) +
    500000.0;

  let northing =
    k0 *
    (
      M +
      N *
        tanPhi *
        (
          (A * A) / 2 +
          (
            (
              5 -
              T +
              9 * C +
              4 * C * C
            ) *
            Math.pow(A, 4)
          ) /
            24 +
          (
            (
              61 -
              58 * T +
              T * T +
              600 * C -
              330 * ep2
            ) *
            Math.pow(A, 6)
          ) /
            720
        )
    );

  if (lat < 0) {
    northing += 10000000.0;
  }

  return { easting, northing };
}

function utmToMasterPixel(
  east: number,
  north: number,
  meta: GeologyMeta
) {
  const inv = meta.affine.utm_to_pixel_matrix;
  const eCoef = meta.affine.pixel_to_utm_easting;
  const nCoef = meta.affine.pixel_to_utm_northing;

  const de = east - Number(eCoef[2]);
  const dn = north - Number(nCoef[2]);

  const cropPixelX =
    inv[0][0] * de +
    inv[0][1] * dn;

  const cropPixelY =
    inv[1][0] * de +
    inv[1][1] * dn;

  const fullLowX =
    cropPixelX +
    Number(meta.master.crop_x);

  const fullLowY =
    cropPixelY +
    Number(meta.master.crop_y);

  return {
    x: Math.round(
      fullLowX *
        Number(meta.master.scale_x)
    ),
    y: Math.round(
      fullLowY *
        Number(meta.master.scale_y)
    ),
  };
}

function rasterValue(
  raster: PNG,
  x: number,
  y: number
): number {
  const index =
    (raster.width * y + x) * 4;

  return Number(raster.data[index]);
}

export function getGeologyAtLocation(
  lat: number,
  lon: number
): GeologyLocationResult {
  try {
    const machine = loadMachine();
    const meta = machine.meta;

    const utm = lonLatToUTM35(lon, lat);

    const pixel = utmToMasterPixel(
      utm.easting,
      utm.northing,
      meta
    );

    if (
      pixel.x < 0 ||
      pixel.y < 0 ||
      pixel.x >= meta.master.width ||
      pixel.y >= meta.master.height
    ) {
      return {
        status: "OUTSIDE_RASTER",
        classId: 0,
        directId: 0,
        reliableId: 0,
        obscured: false,
        unit: null,
        pixel,
        source: meta.source,
        sourceScale: meta.source_scale,
        qa: meta.qa || {},
      };
    }

    const directId = rasterValue(
      machine.direct,
      pixel.x,
      pixel.y
    );

    const reliableId = rasterValue(
      machine.reliable,
      pixel.x,
      pixel.y
    );

    const obscured =
      rasterValue(
        machine.obscured,
        pixel.x,
        pixel.y
      ) > 0;

    let status:
      | "DIRECT"
      | "GAP_FILL"
      | "SOURCE_OBSCURED"
      | "UNRESOLVED";

    let classId = 0;

    if (obscured) {
      status = "SOURCE_OBSCURED";
    } else if (reliableId === 0) {
      status = "UNRESOLVED";
    } else if (directId > 0) {
      status = "DIRECT";
      classId = directId;
    } else {
      status = "GAP_FILL";
      classId = reliableId;
    }

    return {
      status,
      classId,
      directId,
      reliableId,
      obscured,
      unit:
        classId > 0
          ? machine.unitById.get(classId) || null
          : null,
      pixel,
      source: meta.source,
      sourceScale: meta.source_scale,
      qa: meta.qa || {},
    };
  } catch (error) {
    return {
      status: "ERROR",
      classId: 0,
      directId: 0,
      reliableId: 0,
      obscured: false,
      unit: null,
      pixel: null,
      source: null,
      sourceScale: null,
      qa: {},
      error:
        error instanceof Error
          ? error.message
          : String(error),
    };
  }
}
