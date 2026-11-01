import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import { isSondiLithologyLocationRegistered } from "@/lib/sondi-regional-report";

// SONDI_78FX_WRB_READER
// Independent WRB grid; model probabilities, not field observations.

type Tile = {
  id: string;
  filename: string;
  width: number;
  height: number;
  bbox: number[];
  bytes_per_cell: number;
};

type WrbIndex = {
  version: string;
  legend: Record<string, string>;
  tiles: Tile[];
};

export type SondiWrbResult = {
  source: "ISRIC SoilGrids WRB";
  model: "WRB 2017 probabilistic model";
  tile_id: string;
  cell_lat: number;
  cell_lon: number;
  primary_code: number;
  primary_name: string;
  primary_probability_percent: number;
  secondary_code: number;
  secondary_name: string;
  secondary_probability_percent: number;
  tied_maximum_classes: number;
  has_tied_winner: boolean;
  sum_of_rounded_probabilities: number;
  interpretation: "MODEL_ESTIMATE_ONLY";
};

const ROOT = path.join(
  process.cwd(), "data", "soil-lithology", "runtime", "wrb"
);

let indexPromise: Promise<WrbIndex> | undefined;
const cache = new Map<string, Buffer>();
const CACHE_LIMIT = 8;

async function getIndex(): Promise<WrbIndex> {
  if (!indexPromise) {
    indexPromise = fs.readFile(
      path.join(ROOT, "index.json"), "utf8"
    ).then(text => {
      const index = JSON.parse(text) as WrbIndex;
      if (index.version !== "78FW" ||
          !Array.isArray(index.tiles) ||
          index.tiles.length !== 112) {
        throw Error("WRB_INVALID_INDEX");
      }
      return index;
    }).catch(error => {
      indexPromise = undefined;
      throw error;
    });
  }
  return indexPromise;
}

async function getRaster(tile: Tile): Promise<Buffer> {
  const existing = cache.get(tile.id);
  if (existing) {
    cache.delete(tile.id);
    cache.set(tile.id, existing);
    return existing;
  }

  const compressed = await fs.readFile(
    path.join(ROOT, tile.filename)
  );
  const raw = gunzipSync(compressed);

  if (raw.length !== tile.width * tile.height * 8) {
    throw Error("WRB_INVALID_RASTER_SIZE");
  }

  cache.set(tile.id, raw);
  if (cache.size > CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }

  return raw;
}

export async function getSondiNationalWrbAtPoint(
  lat: number,
  lon: number
): Promise<SondiWrbResult | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }

  if (!isSondiLithologyLocationRegistered(lat, lon)) {
    return null;
  }

  const index = await getIndex();
  const tile = index.tiles.find(t =>
    lon >= t.bbox[0] && lon < t.bbox[2] &&
    lat > t.bbox[1] && lat <= t.bbox[3]
  );

  if (!tile) return null;

  const [west, south, east, north] = tile.bbox;
  const x = Math.floor((lon - west) / (east - west) * tile.width);
  const y = Math.floor((north - lat) / (north - south) * tile.height);

  if (x < 0 || y < 0 || x >= tile.width || y >= tile.height) {
    return null;
  }

  const raw = await getRaster(tile);
  const offset = (y * tile.width + x) * 8;

  const primary = raw[offset];
  const firstProbability = raw[offset + 1];
  const secondary = raw[offset + 2];
  const secondProbability = raw[offset + 3];
  const ties = raw[offset + 4];
  const sum = raw.readUInt16LE(offset + 5);
  const status = raw[offset + 7];

  if (status !== 0) return null;

  if (primary > 29 || secondary > 29 ||
      firstProbability > 100 || secondProbability > 100 ||
      ties < 1 || ties > 30 ||
      sum < 1 || sum > 3000 ||
      firstProbability < secondProbability) {
    throw Error("WRB_INVALID_CELL");
  }

  const primaryName = index.legend[String(primary)];
  const secondaryName = index.legend[String(secondary)];
  if (!primaryName || !secondaryName) {
    throw Error("WRB_MISSING_LEGEND");
  }

  return {
    source: "ISRIC SoilGrids WRB",
    model: "WRB 2017 probabilistic model",
    tile_id: tile.id,
    cell_lat: north - (y + 0.5) * (north - south) / tile.height,
    cell_lon: west + (x + 0.5) * (east - west) / tile.width,
    primary_code: primary,
    primary_name: primaryName,
    primary_probability_percent: firstProbability,
    secondary_code: secondary,
    secondary_name: secondaryName,
    secondary_probability_percent: secondProbability,
    tied_maximum_classes: ties,
    has_tied_winner: ties > 1,
    sum_of_rounded_probabilities: sum,
    interpretation: "MODEL_ESTIMATE_ONLY"
  };
}