import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { fromArrayBuffer } from "geotiff";

// SONDI_78FI_EXTENDED_SOIL_READER
// Reads the SAME selected SoilGrids cell as the
// existing national soil reader. All values are
// modelled for soil depth 0-5 cm.

const ROOT = path.join(
  process.cwd(),
  "data", "soil-lithology", "runtime", "soilgrids"
);

const PROPERTIES = [
  "soc", "bdod", "cec", "nitrogen", "wv0033"
] as const;

export type SondiExtendedSoilValues = {
  organic_carbon_g_kg: number;
  bulk_density_g_cm3: number;
  cation_exchange_capacity_cmol_kg: number;
  total_nitrogen_g_kg: number;
  water_content_33kpa_vol_percent: number;
};

export type SondiExtendedSoilResult = {
  source: "ISRIC SoilGrids";
  depth_cm: [0, 5];
  tile_id: string;
  sampled_cell_lat: number;
  sampled_cell_lon: number;
  values: SondiExtendedSoilValues;
};

type ExistingSoilSample = {
  tile_id: string;
  sampled_cell_lat: number;
  sampled_cell_lon: number;
};

type TileIndex = {
  tiles: Array<{id: string}>;
};

let indexPromise: Promise<TileIndex> | undefined;

async function getIndex(): Promise<TileIndex> {
  if (!indexPromise) {
    indexPromise = fs.readFile(
      path.join(ROOT, "index.json"), "utf8"
    ).then(text => {
      const index = JSON.parse(text) as TileIndex;

      if (!Array.isArray(index.tiles)) {
        throw Error("Invalid soil index");
      }

      return index;
    }).catch(error => {
      indexPromise = undefined;
      throw error;
    });
  }

  return indexPromise;
}

async function readValue(
  tileId: string,
  property: typeof PROPERTIES[number],
  latitude: number,
  longitude: number
): Promise<{
  value: number;
  bbox: number[];
  width: number;
  height: number;
  pixelX: number;
  pixelY: number;
} | null> {
  const file = path.join(
    ROOT, "extended",
    tileId + "_" + property + "_0-5cm.tif"
  );

  const bytes = await fs.readFile(file);

  const arrayBuffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;

  const tiff = await fromArrayBuffer(arrayBuffer);
  const image = await tiff.getImage();

  const bbox = image.getBoundingBox();
  const width = image.getWidth();
  const height = image.getHeight();

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    longitude < bbox[0] ||
    longitude >= bbox[2] ||
    latitude <= bbox[1] ||
    latitude > bbox[3]
  ) return null;

  const x = Math.floor(
    (longitude-bbox[0]) /
    (bbox[2]-bbox[0]) * width
  );

  const y = Math.floor(
    (bbox[3]-latitude) /
    (bbox[3]-bbox[1]) * height
  );

  if (
    x < 0 || x >= width ||
    y < 0 || y >= height
  ) return null;

  const raster = await image.readRasters({
    window: [x, y, x+1, y+1],
    interleave: true
  });

  const value = Number(raster[0]);
  const nodata = image.getGDALNoData();

  if (
    !Number.isFinite(value) ||
    (nodata !== null && value === Number(nodata))
  ) return null;

  return {
    value, bbox, width, height,
    pixelX:x, pixelY:y
  };
}

export async function getSondiExtendedSoilAtSample(
  sample: ExistingSoilSample | null
): Promise<SondiExtendedSoilResult | null> {
  if (!sample) return null;

  const {tile_id, sampled_cell_lat, sampled_cell_lon} =
    sample;

  if (!/^soil_x[0-9]+_y[0-9]+$/.test(tile_id)) {
    return null;
  }

  const index = await getIndex();

  if (!index.tiles.some(tile => tile.id === tile_id)) {
    return null;
  }

  const layers = await Promise.all(
    PROPERTIES.map(property =>
      readValue(
        tile_id,
        property,
        sampled_cell_lat,
        sampled_cell_lon
      )
    )
  );

  if (layers.some(layer => layer === null)) {
    return null;
  }

  const complete = layers as Array<
    NonNullable<(typeof layers)[number]>
  >;

  const first = complete[0];

  if (!complete.every(layer =>
    layer.width === first.width &&
    layer.height === first.height &&
    layer.pixelX === first.pixelX &&
    layer.pixelY === first.pixelY &&
    layer.bbox.every(
      (value,i) =>
        Math.abs(value-first.bbox[i]) < 0.00001
    )
  )) {
    throw Error("Extended soil raster misalignment");
  }

  const [soc, bdod, cec, nitrogen, wv0033] =
    complete.map(layer => layer.value);

  if (
    soc < 0 || soc > 10000 ||
    bdod <= 0 || bdod > 300 ||
    cec < 0 || cec > 2000 ||
    nitrogen < 0 || nitrogen > 10000 ||
    wv0033 < 0 || wv0033 > 1000
  ) return null;

  // SoilGrids 0-5 cm mean scale factors:
  // soc / 10, bdod / 100, cec / 10,
  // nitrogen / 100, wv0033 / 10.
  return {
    source: "ISRIC SoilGrids",
    depth_cm: [0, 5],
    tile_id,
    sampled_cell_lat,
    sampled_cell_lon,
    values: {
      organic_carbon_g_kg: soc/10,
      bulk_density_g_cm3: bdod/100,
      cation_exchange_capacity_cmol_kg: cec/10,
      total_nitrogen_g_kg: nitrogen/100,
      water_content_33kpa_vol_percent: wv0033/10
    }
  };
}
