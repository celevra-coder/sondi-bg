// SONDI_78HJ_NATIONAL_HWSD2_READER
// Independent FAO HWSD2 model: soil properties at 0-200 cm.
// Never used to predict bedrock or groundwater mineralization.

import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { gunzipSync } from "node:zlib";

const ROOT = path.join(
  process.cwd(), "data", "soil-lithology", "runtime", "hwsd2"
);

type PropertyName =
  | "ELEC_COND" | "ESP" | "TCARBON_EQ" | "GYPSUM";

type Property = {
  weightedMean: number | null;
  validSharePercent: number;
};

type Depth = {
  topCm: number;
  bottomCm: number;
  properties: Record<PropertyName, Property>;
};

type Component = {
  sequence: number;
  share: number;
  layer: string;
  topCm: number;
  bottomCm: number;
  values: Record<PropertyName, number | null>;
};

type SoilUnit = {
  smuId: number;
  components: Component[];
  weightedByDepth: Depth[];
};

type Index = {
  version: string;
  width: number;
  height: number;
  west: number;
  north: number;
  pixelWidth: number;
  pixelHeight: number;
  nodata: number;
  urbanId: number;
  rasterFile: string;
  profilesFile: string;
  soilUnitCount: number;
};

export type SondiHwsd2Result = {
  status: "DIRECT_SOIL_CELL";
  source: "FAO HWSD2";
  interpretation: "MODELLED_SOIL_PROFILE_NOT_FIELD_MEASUREMENT";
  smuId: number;
  coordinateLat: number;
  coordinateLon: number;
  cellLat: number;
  cellLon: number;
  depthGroups: Depth[];
  components: Component[];
};

type Dataset = {
  index: Index;
  raster: Buffer;
  units: Map<number, SoilUnit>;
};

let datasetPromise: Promise<Dataset> | undefined;

async function loadDataset(): Promise<Dataset> {
  if (!datasetPromise) {
    datasetPromise = (async () => {
      const index = JSON.parse(
        await fs.readFile(path.join(ROOT, "index.json"), "utf8")
      ) as Index;

      if (
        index.version !== "78HJ" ||
        index.width !== 841 ||
        index.height !== 421 ||
        index.soilUnitCount !== 64 ||
        index.nodata !== 65535 ||
        index.urbanId !== 7001 ||
        !Number.isFinite(index.west) ||
        !Number.isFinite(index.north) ||
        !(index.pixelWidth > 0) ||
        !(index.pixelHeight > 0)
      ) throw Error("HWSD2_INVALID_INDEX");

      const [raster, compressed] = await Promise.all([
        fs.readFile(path.join(ROOT, "bulgaria.bil")),
        fs.readFile(path.join(ROOT, "profiles.json.gz"))
      ]);

      if (raster.length !== index.width * index.height * 2) {
        throw Error("HWSD2_INVALID_RASTER");
      }

      const parsed = JSON.parse(
        gunzipSync(compressed).toString("utf8")
      ) as { soilUnits: SoilUnit[] };

      if (
        !Array.isArray(parsed.soilUnits) ||
        parsed.soilUnits.length !== index.soilUnitCount
      ) throw Error("HWSD2_INVALID_PROFILE_DATA");

      const units = new Map<number, SoilUnit>();
      for (const u of parsed.soilUnits) {
        if (
          !Number.isInteger(u.smuId) ||
          units.has(u.smuId) ||
          !Array.isArray(u.components) ||
          !Array.isArray(u.weightedByDepth) ||
          u.weightedByDepth.length !== 7
        ) throw Error("HWSD2_INVALID_UNIT");

        units.set(u.smuId, u);
      }

      return { index, raster, units };
    })().catch(error => {
      datasetPromise = undefined;
      throw error;
    });
  }

  return datasetPromise;
}

export async function getSondiNationalHwsd2AtPoint(
  latitude: number,
  longitude: number
): Promise<SondiHwsd2Result | null> {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < 40 || latitude > 45 ||
    longitude < 21 || longitude > 30
  ) return null;

  const { index, raster, units } = await loadDataset();

  const x = Math.floor(
    (longitude - index.west) / index.pixelWidth
  );
  const y = Math.floor(
    (index.north - latitude) / index.pixelHeight
  );

  if (
    x < 0 || y < 0 ||
    x >= index.width || y >= index.height
  ) return null;

  const smuId = raster.readUInt16LE(
    (y * index.width + x) * 2
  );

  // Outside Bulgaria, urban and nodata: no direct profile.
  if (
    smuId === 0 ||
    smuId === index.urbanId ||
    smuId === index.nodata
  ) return null;

  const unit = units.get(smuId);
  if (!unit) {
    throw Error("HWSD2_MISSING_PROFILE_" + smuId);
  }

  return {
    status: "DIRECT_SOIL_CELL",
    source: "FAO HWSD2",
    interpretation: "MODELLED_SOIL_PROFILE_NOT_FIELD_MEASUREMENT",
    smuId,
    coordinateLat: latitude,
    coordinateLon: longitude,
    cellLat: index.north - (y + 0.5) * index.pixelHeight,
    cellLon: index.west + (x + 0.5) * index.pixelWidth,
    depthGroups: unit.weightedByDepth,
    components: unit.components
  };
}


// SONDI_78HL_NEARBY_HWSD2
// Urban-cell fallback. A neighboring cell is a regional
// model estimate, never a measurement at the selected point.
// Outside-country and missing-data cells receive no fallback.

const HWSD2_NEARBY_MAX_DISTANCE_M = 2000;

export type SondiHwsd2NearbyResult =
  Omit<SondiHwsd2Result, "status"> & {
    status: "NEARBY_REGIONAL_ESTIMATE";
    distanceM: number;
  };

function hwsd2DistanceMetres(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const rad = Math.PI / 180;
  const dy = (lat2 - lat1) * rad;
  const dx = (lon2 - lon1) * rad *
    Math.cos((lat1 + lat2) * rad / 2);
  return 6371000 * Math.hypot(dx, dy);
}

export async function getSondiHwsd2WithNearbyFallback(
  latitude: number,
  longitude: number
): Promise<
  SondiHwsd2Result | SondiHwsd2NearbyResult | null
> {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < 40 || latitude > 45 ||
    longitude < 21 || longitude > 30
  ) return null;

  const direct = await getSondiNationalHwsd2AtPoint(
    latitude, longitude
  );
  if (direct) return direct;

  const { index, raster, units } = await loadDataset();

  const x = Math.floor(
    (longitude - index.west) / index.pixelWidth
  );
  const y = Math.floor(
    (index.north - latitude) / index.pixelHeight
  );

  if (
    x < 0 || y < 0 ||
    x >= index.width || y >= index.height
  ) return null;

  const targetId = raster.readUInt16LE(
    (y * index.width + x) * 2
  );

  // Only the identified urban class uses this fallback.
  // Do not extrapolate across the national border.
  if (targetId !== index.urbanId) return null;

  const rowRadius = Math.ceil(
    HWSD2_NEARBY_MAX_DISTANCE_M /
    (111000 * index.pixelHeight)
  ) + 1;

  const colRadius = Math.ceil(
    HWSD2_NEARBY_MAX_DISTANCE_M /
    (
      111000 *
      Math.max(0.1, Math.cos(latitude * Math.PI / 180)) *
      index.pixelWidth
    )
  ) + 1;

  let nearest:
    | {
        smuId: number;
        lat: number;
        lon: number;
        distance: number;
      }
    | undefined;

  for (
    let row = Math.max(0, y - rowRadius);
    row <= Math.min(index.height - 1, y + rowRadius);
    row++
  ) {
    const cellLat =
      index.north - (row + 0.5) * index.pixelHeight;

    for (
      let col = Math.max(0, x - colRadius);
      col <= Math.min(index.width - 1, x + colRadius);
      col++
    ) {
      const smuId = raster.readUInt16LE(
        (row * index.width + col) * 2
      );

      const unit = units.get(smuId);
      if (!unit) continue;

      // A neighboring profile must have usable information
      // for at least one property in the surface layer.
      const surface = unit.weightedByDepth[0];
      const hasSurfaceData = Object.values(
        surface.properties
      ).some(property =>
        property.weightedMean !== null &&
        property.validSharePercent >= 80
      );
      if (!hasSurfaceData) continue;

      const cellLon =
        index.west + (col + 0.5) * index.pixelWidth;

      const distance = hwsd2DistanceMetres(
        latitude, longitude, cellLat, cellLon
      );

      if (
        distance <= HWSD2_NEARBY_MAX_DISTANCE_M &&
        (!nearest || distance < nearest.distance)
      ) {
        nearest = {
          smuId, lat: cellLat,
          lon: cellLon, distance
        };
      }
    }
  }

  if (!nearest) return null;

  const unit = units.get(nearest.smuId);
  if (!unit) return null;

  return {
    status: "NEARBY_REGIONAL_ESTIMATE",
    source: "FAO HWSD2",
    interpretation: "MODELLED_SOIL_PROFILE_NOT_FIELD_MEASUREMENT",
    smuId: nearest.smuId,
    coordinateLat: latitude,
    coordinateLon: longitude,
    cellLat: nearest.lat,
    cellLon: nearest.lon,
    distanceM: nearest.distance,
    depthGroups: unit.weightedByDepth,
    components: unit.components
  };
}
