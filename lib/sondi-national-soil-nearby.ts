import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { fromArrayBuffer } from "geotiff";

import {
  isSondiLithologyLocationRegistered
} from "./sondi-regional-report";

import {
  getSondiNationalSoilAtPoint,
  type SondiNationalSoilResult
} from "./sondi-national-soil-reader";

import {
  createSondiSoilGridSummary
} from "./sondi-national-soil-classifier";

// SONDI_78EU_NEARBY_SOIL_READER
// A neighboring modelled cell is a regional estimate,
// never a measured soil sample at the selected point.

const ROOT = path.join(
  process.cwd(),
  "data", "soil-lithology", "runtime", "soilgrids"
);

const PROPS = [
  "clay", "sand", "silt", "phh2o", "cfvo"
] as const;

const MAX_DISTANCE_M = 2000;

type Bounds = {
  min_lon: number;
  min_lat: number;
  max_lon: number;
  max_lat: number;
};

type Tile = { id: string; bounds: Bounds };

type Layer = {
  width: number;
  height: number;
  bbox: number[];
  nodata: number | null;
  values: ArrayLike<number>;
};

type TileData = {
  layers: Layer[];
  width: number;
  height: number;
  bbox: number[];
};

export type SondiNearbySoilResult = {
  status: "NEARBY_REGIONAL_ESTIMATE";
  tile_id: string;
  coordinate_lat: number;
  coordinate_lon: number;
  sampled_cell_lat: number;
  sampled_cell_lon: number;
  distance_m: number;
  source_depth_cm: [number, number];
  summary: NonNullable<
    ReturnType<typeof createSondiSoilGridSummary>
  >;
};

type Index = { tiles: Tile[] };

let indexTask: Promise<Index> | undefined;
const tileCache = new Map<string, Promise<TileData>>();

async function getIndex(): Promise<Index> {
  if (!indexTask) {
    indexTask = fs.readFile(
      path.join(ROOT, "index.json"), "utf8"
    ).then(text => {
      const value = JSON.parse(text) as Index;
      if (!Array.isArray(value.tiles)) {
        throw new Error("Invalid soil tile index");
      }
      return value;
    }).catch(error => {
      indexTask = undefined;
      throw error;
    });
  }
  return indexTask;
}

async function loadTile(id: string): Promise<TileData> {
  const cached = tileCache.get(id);
  if (cached) return cached;

  const task = (async () => {
    const layers = await Promise.all(PROPS.map(async property => {
      const filename = path.join(
        ROOT, "tiles", id + "_" + property + "_0-5cm.tif"
      );

      const bytes = await fs.readFile(filename);
      const buffer = Uint8Array.from(bytes).buffer;
      const tiff = await fromArrayBuffer(buffer);
      const image = await tiff.getImage();
      const pixels = await image.readRasters();

      return {
        width: image.getWidth(),
        height: image.getHeight(),
        bbox: image.getBoundingBox(),
        nodata: image.getGDALNoData(),
        values: pixels[0]
      } satisfies Layer;
    }));

    const first = layers[0];

    if (!layers.every(layer =>
      layer.width === first.width &&
      layer.height === first.height &&
      layer.bbox.every(
        (value, i) => Math.abs(value-first.bbox[i]) < 0.00001
      )
    )) {
      throw new Error("Soil raster grid mismatch: " + id);
    }

    return {
      layers,
      width: first.width,
      height: first.height,
      bbox: first.bbox
    };
  })();

  tileCache.set(id, task);

  // Limit the in-process cache to eight tiles.
  while (tileCache.size > 8) {
    const oldest = tileCache.keys().next().value;
    if (oldest !== undefined) tileCache.delete(oldest);
  }

  try {
    return await task;
  } catch (error) {
    if (tileCache.get(id) === task) tileCache.delete(id);
    throw error;
  }
}

function metres(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const rad = Math.PI / 180;
  const dx = (lon2-lon1)*rad *
    Math.cos((lat1+lat2)*rad/2);
  const dy = (lat2-lat1)*rad;
  return 6371000*Math.hypot(dx,dy);
}

function nearBounds(
  lat: number,
  lon: number,
  bounds: Bounds
): boolean {
  const latGap = MAX_DISTANCE_M / 111000;
  const lonGap = MAX_DISTANCE_M /
    (111000*Math.max(0.1,Math.cos(lat*Math.PI/180)));

  return (
    lon >= bounds.min_lon-lonGap &&
    lon <= bounds.max_lon+lonGap &&
    lat >= bounds.min_lat-latGap &&
    lat <= bounds.max_lat+latGap
  );
}

function pixelValues(
  tile: TileData,
  offset: number
) {
  const raw = tile.layers.map(layer => {
    const value = Number(layer.values[offset]);
    return Number.isFinite(value) &&
      (layer.nodata === null || value !== layer.nodata)
        ? value : NaN;
  });

  const [clay,sand,silt,phh2o,cfvo] = raw;
  const sum = clay+sand+silt;

  if (
    !raw.every(Number.isFinite) ||
    clay <= 0 || sand <= 0 || silt <= 0 ||
    phh2o < 30 || phh2o > 100 ||
    cfvo < 0 || Math.abs(sum-1000) > 30
  ) return null;

  return {
    clay_percent: clay/10,
    sand_percent: sand/10,
    silt_percent: silt/10,
    ph: phh2o/10,
    coarse_fragments_vol_percent: cfvo/10
  };
}

export async function getSondiSoilWithNearbyFallback(
  latitude: number,
  longitude: number
): Promise<
  SondiNationalSoilResult |
  SondiNearbySoilResult |
  null
> {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    !isSondiLithologyLocationRegistered(latitude,longitude)
  ) return null;

  const direct = await getSondiNationalSoilAtPoint(
    latitude, longitude
  );

  if (direct) return direct;

  const index = await getIndex();

  const candidates = index.tiles.filter(tile =>
    nearBounds(latitude,longitude,tile.bounds)
  );

  let nearest: {
    distance: number;
    tile_id: string;
    lat: number;
    lon: number;
    values: NonNullable<ReturnType<typeof pixelValues>>;
  } | null = null;

  for (const candidate of candidates) {
    const tile = await loadTile(candidate.id);
    const [xmin,ymin,xmax,ymax] = tile.bbox;

    const cellWidth = (xmax-xmin)/tile.width;
    const cellHeight = (ymax-ymin)/tile.height;

    for (let y=0; y<tile.height; y++) {
      const cellLat = ymax-(y+0.5)*cellHeight;

      if (Math.abs(cellLat-latitude)*111000 >
          MAX_DISTANCE_M+200) continue;

      for (let x=0; x<tile.width; x++) {
        const cellLon = xmin+(x+0.5)*cellWidth;
        const distance = metres(
          latitude,longitude,cellLat,cellLon
        );

        if (
          distance > MAX_DISTANCE_M ||
          (nearest && distance >= nearest.distance)
        ) continue;

        const values = pixelValues(
          tile,y*tile.width+x
        );
        if (!values) continue;

        // Never borrow a modeled cell from an inactive area.
        if (!isSondiLithologyLocationRegistered(
          cellLat,cellLon
        )) continue;

        nearest = {
          distance,
          tile_id:candidate.id,
          lat:cellLat,
          lon:cellLon,
          values
        };
      }
    }
  }

  if (!nearest) return null;

  const best = nearest as {
    distance: number;
    tile_id: string;
    lat: number;
    lon: number;
    values: NonNullable<ReturnType<typeof pixelValues>>;
  };

  const summary = createSondiSoilGridSummary(
    best.values,
    "NEARBY_REGIONAL_ESTIMATE",
    best.distance
  );

  if (!summary) return null;

  return {
    status:"NEARBY_REGIONAL_ESTIMATE",
    tile_id:best.tile_id,
    coordinate_lat:latitude,
    coordinate_lon:longitude,
    sampled_cell_lat:best.lat,
    sampled_cell_lon:best.lon,
    distance_m:Math.round(best.distance),
    source_depth_cm:[0,5],
    summary
  };
}
