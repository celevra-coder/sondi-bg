import "server-only";

import fs from "node:fs";
import path from "node:path";
import proj4 from "proj4";
import { fromFile } from "geotiff";

const DATA_ROOT = path.join(
  process.cwd(),
  "data",
  "surface-water-wetness",
  "WAW_2018_010m_bg_03035_v020",
  "WAW_2018_010m_bg_03035_v020",
  "DATA"
);

const EPSG_4326 = "EPSG:4326";
const EPSG_3035 = "EPSG:3035";

proj4.defs(
  EPSG_3035,
  [
    "+proj=laea",
    "+lat_0=52",
    "+lon_0=10",
    "+x_0=4321000",
    "+y_0=3210000",
    "+ellps=GRS80",
    "+units=m",
    "+no_defs",
  ].join(" ")
);

const PIXEL_SIZE_M = 10;
const TILE_SIZE_M = 100000;
const TILE_PIXELS = 10000;

export type WaterWetnessClass =
  | "dry"
  | "permanent_water"
  | "temporary_water"
  | "permanent_wet"
  | "temporary_wet"
  | "sea_water"
  | "unclassifiable"
  | "outside_area"
  | "unknown";

export type WaterWetnessRadiusSummary = {
  radius_m: number;

  expected_pixels: number;
  sampled_pixels: number;
  valid_pixels: number;

  coverage_complete: boolean;
  tiles_used: number;
  missing_tiles: number;

  dry_pixels: number;
  water_pixels: number;
  wet_pixels: number;

  permanent_water_pixels: number;
  temporary_water_pixels: number;
  permanent_wet_pixels: number;
  temporary_wet_pixels: number;

  water_percent: number | null;
  wet_percent: number | null;
  water_or_wet_percent: number | null;
};

export type SurfaceWaterWetnessProfile = {
  status:
    | "OK"
    | "INVALID_COORDINATES"
    | "OUTSIDE_DATASET"
    | "READ_ERROR";

  source:
    "Copernicus HRL Water and Wetness 2018";

  reference_period: "2012-2018";
  resolution_m: 10;
  crs: "EPSG:3035";

  latitude: number;
  longitude: number;

  projected_x_m: number | null;
  projected_y_m: number | null;

  tile: string | null;

  point_value: number | null;
  point_class: WaterWetnessClass | null;
  point_class_bg: string | null;

  radius_100m: WaterWetnessRadiusSummary | null;
  radius_300m: WaterWetnessRadiusSummary | null;

  semantics: {
    role: "surface_water_wetness_context_only";
    groundwater_presence_not_proven: true;
    aquifer_depth_not_inferred: true;
    limitation_bg: string;
  };
};

const CLASS_MAP: Record<
  number,
  {
    key: WaterWetnessClass;
    bg: string;
  }
> = {
  0: {
    key: "dry",
    bg: "суха повърхност",
  },
  1: {
    key: "permanent_water",
    bg: "постоянна повърхностна вода",
  },
  2: {
    key: "temporary_water",
    bg: "временна повърхностна вода",
  },
  3: {
    key: "permanent_wet",
    bg: "постоянно влажна повърхност",
  },
  4: {
    key: "temporary_wet",
    bg: "временно влажна повърхност",
  },
  253: {
    key: "sea_water",
    bg: "морска вода",
  },
  254: {
    key: "unclassifiable",
    bg: "некласифицирана повърхност",
  },
  255: {
    key: "outside_area",
    bg: "извън класифицираната зона",
  },
};

function validLatitude(value: number): boolean {
  return (
    Number.isFinite(value) &&
    value >= -90 &&
    value <= 90
  );
}

function validLongitude(value: number): boolean {
  return (
    Number.isFinite(value) &&
    value >= -180 &&
    value <= 180
  );
}

function tileNameFromProjected(
  x: number,
  y: number
): string | null {
  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y)
  ) {
    return null;
  }

  const eastIndex = Math.floor(x / TILE_SIZE_M);
  const northIndex = Math.floor(y / TILE_SIZE_M);

  if (
    eastIndex < 0 ||
    northIndex < 0
  ) {
    return null;
  }

  return (
    `WAW_2018_010m_` +
    `E${eastIndex}` +
    `N${northIndex}_03035_v020.tif`
  );
}

function classInfo(value: number | null) {
  if (value === null) {
    return null;
  }

  return (
    CLASS_MAP[value] ?? {
      key: "unknown" as const,
      bg: `непознат клас (${value})`,
    }
  );
}

function roundPercent(
  numerator: number,
  denominator: number
): number | null {
  if (denominator <= 0) {
    return null;
  }

  return (
    Math.round(
      (numerator / denominator) *
      10000
    ) / 100
  );
}

async function sampleRadiusMultiTile(
  centreX: number,
  centreY: number,
  radiusM: number
): Promise<WaterWetnessRadiusSummary> {
  const minTileE = Math.floor(
    (centreX - radiusM) / TILE_SIZE_M
  );

  const maxTileE = Math.floor(
    (centreX + radiusM) / TILE_SIZE_M
  );

  const minTileN = Math.floor(
    (centreY - radiusM) / TILE_SIZE_M
  );

  const maxTileN = Math.floor(
    (centreY + radiusM) / TILE_SIZE_M
  );

  let expectedPixels = 0;

  const minGlobalX =
    Math.floor((centreX - radiusM) / PIXEL_SIZE_M) - 1;

  const maxGlobalX =
    Math.floor((centreX + radiusM) / PIXEL_SIZE_M) + 1;

  const minGlobalY =
    Math.floor((centreY - radiusM) / PIXEL_SIZE_M) - 1;

  const maxGlobalY =
    Math.floor((centreY + radiusM) / PIXEL_SIZE_M) + 1;

  for (
    let gx = minGlobalX;
    gx <= maxGlobalX;
    gx++
  ) {
    const pixelCentreX =
      gx * PIXEL_SIZE_M +
      PIXEL_SIZE_M / 2;

    for (
      let gy = minGlobalY;
      gy <= maxGlobalY;
      gy++
    ) {
      const pixelCentreY =
        gy * PIXEL_SIZE_M +
        PIXEL_SIZE_M / 2;

      const dx =
        pixelCentreX - centreX;

      const dy =
        pixelCentreY - centreY;

      if (
        Math.sqrt(dx * dx + dy * dy) <=
        radiusM
      ) {
        expectedPixels += 1;
      }
    }
  }

  let sampledPixels = 0;
  let validPixels = 0;

  let dryPixels = 0;

  let permanentWaterPixels = 0;
  let temporaryWaterPixels = 0;
  let permanentWetPixels = 0;
  let temporaryWetPixels = 0;

  let tilesUsed = 0;
  let missingTiles = 0;

  for (
    let eastIndex = minTileE;
    eastIndex <= maxTileE;
    eastIndex++
  ) {
    for (
      let northIndex = minTileN;
      northIndex <= maxTileN;
      northIndex++
    ) {
      const tileName =
        `WAW_2018_010m_` +
        `E${eastIndex}` +
        `N${northIndex}_03035_v020.tif`;

      const file = path.join(
        DATA_ROOT,
        tileName
      );

      if (!fs.existsSync(file)) {
        missingTiles += 1;
        continue;
      }

      const tif = await fromFile(file);
      const image = await tif.getImage();

      const bbox = image.getBoundingBox();

      const minCol = Math.max(
        0,
        Math.floor(
          (
            centreX -
            radiusM -
            bbox[0]
          ) / PIXEL_SIZE_M
        ) - 1
      );

      const maxCol = Math.min(
        image.getWidth() - 1,
        Math.floor(
          (
            centreX +
            radiusM -
            bbox[0]
          ) / PIXEL_SIZE_M
        ) + 1
      );

      const minRow = Math.max(
        0,
        Math.floor(
          (
            bbox[3] -
            (centreY + radiusM)
          ) / PIXEL_SIZE_M
        ) - 1
      );

      const maxRow = Math.min(
        image.getHeight() - 1,
        Math.floor(
          (
            bbox[3] -
            (centreY - radiusM)
          ) / PIXEL_SIZE_M
        ) + 1
      );

      if (
        minCol > maxCol ||
        minRow > maxRow
      ) {
        continue;
      }

      const width =
        maxCol - minCol + 1;

      const height =
        maxRow - minRow + 1;

      const raster =
        await image.readRasters({
          window: [
            minCol,
            minRow,
            maxCol + 1,
            maxRow + 1,
          ],
          interleave: true,
        });

      tilesUsed += 1;

      for (
        let row = 0;
        row < height;
        row++
      ) {
        const sourceRow =
          minRow + row;

        const pixelCentreY =
          bbox[3] -
          (
            sourceRow +
            0.5
          ) *
          PIXEL_SIZE_M;

        for (
          let col = 0;
          col < width;
          col++
        ) {
          const sourceCol =
            minCol + col;

          const pixelCentreX =
            bbox[0] +
            (
              sourceCol +
              0.5
            ) *
            PIXEL_SIZE_M;

          const dx =
            pixelCentreX -
            centreX;

          const dy =
            pixelCentreY -
            centreY;

          if (
            Math.sqrt(
              dx * dx +
              dy * dy
            ) > radiusM
          ) {
            continue;
          }

          sampledPixels += 1;

          const index =
            row * width +
            col;

          const value =
            Number(raster[index]);

          if (
            !Number.isFinite(value) ||
            value === 253 ||
            value === 254 ||
            value === 255
          ) {
            continue;
          }

          validPixels += 1;

          if (value === 0) {
            dryPixels += 1;
          }
          else if (value === 1) {
            permanentWaterPixels += 1;
          }
          else if (value === 2) {
            temporaryWaterPixels += 1;
          }
          else if (value === 3) {
            permanentWetPixels += 1;
          }
          else if (value === 4) {
            temporaryWetPixels += 1;
          }
        }
      }
    }
  }

  const waterPixels =
    permanentWaterPixels +
    temporaryWaterPixels;

  const wetPixels =
    permanentWetPixels +
    temporaryWetPixels;

  return {
    radius_m: radiusM,

    expected_pixels:
      expectedPixels,

    sampled_pixels:
      sampledPixels,

    valid_pixels:
      validPixels,

    coverage_complete:
      sampledPixels === expectedPixels,

    tiles_used:
      tilesUsed,

    missing_tiles:
      missingTiles,

    dry_pixels:
      dryPixels,

    water_pixels:
      waterPixels,

    wet_pixels:
      wetPixels,

    permanent_water_pixels:
      permanentWaterPixels,

    temporary_water_pixels:
      temporaryWaterPixels,

    permanent_wet_pixels:
      permanentWetPixels,

    temporary_wet_pixels:
      temporaryWetPixels,

    water_percent:
      roundPercent(
        waterPixels,
        validPixels
      ),

    wet_percent:
      roundPercent(
        wetPixels,
        validPixels
      ),

    water_or_wet_percent:
      roundPercent(
        waterPixels +
        wetPixels,
        validPixels
      ),
  };
}

export async function getSurfaceWaterWetnessProfile(
  latitude: number,
  longitude: number
): Promise<SurfaceWaterWetnessProfile> {
  const semantics = {
    role:
      "surface_water_wetness_context_only" as const,

    groundwater_presence_not_proven:
      true as const,

    aquifer_depth_not_inferred:
      true as const,

    limitation_bg:
      "Copernicus Water and Wetness 2018 описва " +
      "повърхностна вода и влажност за периода " +
      "2012–2018. Данните не доказват наличие на " +
      "подземни води, водоносен хоризонт или " +
      "дълбочина до вода.",
  };

  const invalid = (
    status:
      SurfaceWaterWetnessProfile["status"]
  ): SurfaceWaterWetnessProfile => ({
    status,

    source:
      "Copernicus HRL Water and Wetness 2018",

    reference_period: "2012-2018",
    resolution_m: 10,
    crs: "EPSG:3035",

    latitude,
    longitude,

    projected_x_m: null,
    projected_y_m: null,

    tile: null,

    point_value: null,
    point_class: null,
    point_class_bg: null,

    radius_100m: null,
    radius_300m: null,

    semantics,
  });

  if (
    !validLatitude(latitude) ||
    !validLongitude(longitude)
  ) {
    return invalid("INVALID_COORDINATES");
  }

  let projected: [number, number];

  try {
    projected = proj4(
      EPSG_4326,
      EPSG_3035,
      [longitude, latitude]
    ) as [number, number];
  }
  catch {
    return invalid("READ_ERROR");
  }

  const [x, y] = projected;

  const tileName =
    tileNameFromProjected(x, y);

  if (!tileName) {
    return {
      ...invalid("OUTSIDE_DATASET"),
      projected_x_m:
        Math.round(x * 100) / 100,
      projected_y_m:
        Math.round(y * 100) / 100,
    };
  }

  const file = path.join(
    DATA_ROOT,
    tileName
  );

  try {
    const tif = await fromFile(file);
    const image = await tif.getImage();

    const bbox = image.getBoundingBox();

    if (
      x < bbox[0] ||
      x >= bbox[2] ||
      y < bbox[1] ||
      y >= bbox[3]
    ) {
      return {
        ...invalid("OUTSIDE_DATASET"),

        projected_x_m:
          Math.round(x * 100) / 100,

        projected_y_m:
          Math.round(y * 100) / 100,

        tile: tileName,
      };
    }

    const pixelX = Math.floor(
      (x - bbox[0]) /
      PIXEL_SIZE_M
    );

    const pixelY = Math.floor(
      (bbox[3] - y) /
      PIXEL_SIZE_M
    );

    const pointRaster =
      await image.readRasters({
        window: [
          pixelX,
          pixelY,
          pixelX + 1,
          pixelY + 1,
        ],
        interleave: true,
      });

    const rawValue = Number(
      pointRaster[0]
    );

    const pointValue =
      Number.isFinite(rawValue)
        ? rawValue
        : null;

    const pointInfo =
      classInfo(pointValue);

    const radius100 =
      await sampleRadiusMultiTile(
        x,
        y,
        100
      );

    const radius300 =
      await sampleRadiusMultiTile(
        x,
        y,
        300
      );

    return {
      status: "OK",

      source:
        "Copernicus HRL Water and Wetness 2018",

      reference_period: "2012-2018",
      resolution_m: 10,
      crs: "EPSG:3035",

      latitude,
      longitude,

      projected_x_m:
        Math.round(x * 100) / 100,

      projected_y_m:
        Math.round(y * 100) / 100,

      tile: tileName,

      point_value: pointValue,

      point_class:
        pointInfo?.key ?? null,

      point_class_bg:
        pointInfo?.bg ?? null,

      radius_100m: radius100,
      radius_300m: radius300,

      semantics,
    };
  }
  catch {
    return {
      ...invalid("READ_ERROR"),

      projected_x_m:
        Math.round(x * 100) / 100,

      projected_y_m:
        Math.round(y * 100) / 100,

      tile: tileName,
    };
  }
}