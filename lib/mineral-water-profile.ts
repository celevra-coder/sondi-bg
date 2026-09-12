import fs from "node:fs";
import path from "node:path";

type Obj = Record<string, any>;

export type MineralFacilityContext = {
  mineralId: string;
  name: string;
  facilityType: string | null;
  settlement: string | null;
  deposit: string | null;
  depthM: number | null;
  temperatureC: number | null;
  latitude: number | null;
  longitude: number | null;
  coordinateStatus: string | null;
  hasCoordinates: boolean;
};

export type MineralWaterProfile = {
  mineralId: string;
  name: string;
  facilityType: string | null;
  settlement: string | null;
  deposit: string | null;
  depthM: number | null;
  temperatureC: number | null;
  latitude: number | null;
  longitude: number | null;
  coordinateStatus: string | null;

  existingProperties: Obj;
  researchEnrichment: Obj;

  relatedFacilities: MineralFacilityContext[];
  relatedWithCoordinates: number;
  relatedWithoutCoordinates: number;

  depthMin: number | null;
  depthMax: number | null;
  temperatureMin: number | null;
  temperatureMax: number | null;

  sources: string[];
};


export type MineralAreaFacility =
  MineralFacilityContext & {
    distanceKm: number;
  };

export type MineralWaterAreaProfile = {
  latitude: number;
  longitude: number;

  nearbyFacilities: MineralAreaFacility[];

  within1Km: number;
  within5Km: number;
  within10Km: number;
  within25Km: number;

  nearestFacility:
    | MineralAreaFacility
    | null;

  representedDeposits: string[];

  contextualUnlocated:
    MineralFacilityContext[];

  temperatureMin: number | null;
  temperatureMax: number | null;

  depthMin: number | null;
  depthMax: number | null;
};

let cache: Obj[] | null = null;

function records(): Obj[] {
  if (cache) return cache;

  const file = path.join(
    process.cwd(),
    "data",
    "mineral-water",
    "mineral_water_master.json"
  );

  const raw = JSON.parse(
    fs.readFileSync(file, "utf8")
  );

  cache = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.facilities)
      ? raw.facilities
      : [];

  return cache ?? [];
}

function s(v: unknown): string | null {
  if (v === null || v === undefined) {
    return null;
  }

  const value = String(v).trim();
  return value || null;
}

function n(v: unknown): number | null {
  if (
    v === null ||
    v === undefined ||
    v === ""
  ) {
    return null;
  }

  const value = Number(
    String(v).replace(",", ".")
  );

  return Number.isFinite(value)
    ? value
    : null;
}

function norm(v: unknown) {
  return String(v ?? "")
    .trim()
    .toLocaleLowerCase("bg")
    .replace(/[„“"'`]/g, "")
    .replace(/\s+/g, " ");
}

function deep(
  value: unknown,
  keys: string[]
): unknown {
  if (!value || typeof value !== "object") {
    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = deep(item, keys);

      if (
        found !== null &&
        found !== undefined &&
        found !== ""
      ) {
        return found;
      }
    }

    return null;
  }

  const obj = value as Obj;

  for (const key of keys) {
    if (
      obj[key] !== null &&
      obj[key] !== undefined &&
      obj[key] !== ""
    ) {
      return obj[key];
    }
  }

  for (const child of Object.values(obj)) {
    const found = deep(child, keys);

    if (
      found !== null &&
      found !== undefined &&
      found !== ""
    ) {
      return found;
    }
  }

  return null;
}

function getDeposit(record: Obj) {
  return s(
    deep(
      record,
      [
        "deposit",
        "deposit_name",
        "mineral_deposit",
        "field_name",
      ]
    )
  );
}

function getCoordinates(record: Obj) {
  const loc = record.location || {};

  const latitude =
    n(loc.latitude) ??
    n(loc.lat) ??
    n(
      deep(
        loc,
        [
          "resolved_latitude",
          "latitude",
          "lat",
        ]
      )
    );

  const longitude =
    n(loc.longitude) ??
    n(loc.lng) ??
    n(loc.lon) ??
    n(
      deep(
        loc,
        [
          "resolved_longitude",
          "longitude",
          "lng",
          "lon",
        ]
      )
    );

  return {
    latitude,
    longitude,
  };
}

function facilityContext(
  record: Obj
): MineralFacilityContext {
  const c = getCoordinates(record);

  return {
    mineralId:
      String(record.mineral_id || ""),

    name:
      s(record.free?.name) ||
      "Минерално водовземно съоръжение",

    facilityType:
      s(record.free?.facility_type),

    settlement:
      s(record.free?.settlement),

    deposit:
      getDeposit(record),

    depthM:
      n(record.free?.depth_m) ??
      n(
        deep(
          record.pro,
          [
            "depth_m",
            "well_depth_m",
            "depth",
          ]
        )
      ),

    temperatureC:
      n(record.free?.temperature_c) ??
      n(
        deep(
          record.pro,
          [
            "temperature_c",
            "water_temperature_c",
            "temperature",
          ]
        )
      ),

    latitude:
      c.latitude,

    longitude:
      c.longitude,

    coordinateStatus:
      s(
        deep(
          record,
          [
            "coordinate_status",
            "coordinate_accuracy",
          ]
        )
      ),

    hasCoordinates:
      c.latitude !== null &&
      c.longitude !== null,
  };
}

function numericRange(
  values: Array<number | null>
) {
  const valid =
    values.filter(
      (v): v is number =>
        typeof v === "number" &&
        Number.isFinite(v)
    );

  if (!valid.length) {
    return {
      min: null,
      max: null,
    };
  }

  return {
    min: Math.min(...valid),
    max: Math.max(...valid),
  };
}

function sourceNames(record: Obj) {
  const result: string[] = [];

  const add = (value: unknown) => {
    const text = s(value);

    if (
      text &&
      !result.some(
        x => norm(x) === norm(text)
      )
    ) {
      result.push(text);
    }
  };

  if (Array.isArray(record.sources)) {
    for (const source of record.sources) {
      if (typeof source === "string") {
        add(source);
      } else {
        add(source?.title);
        add(source?.name);
        add(source?.institution);
        add(source?.source);
      }
    }
  }

  return result;
}

export function getMineralWaterProfile(
  mineralId: string
): MineralWaterProfile | null {
  const all = records();

  const record =
    all.find(
      item =>
        String(item.mineral_id || "") ===
        mineralId
    );

  if (!record) {
    return null;
  }

  const selected =
    facilityContext(record);

  const deposit =
    selected.deposit;

  const settlement =
    selected.settlement;

  const related =
    all
      .filter(
        item =>
          String(item.mineral_id || "") !==
          mineralId
      )
      .filter(item => {
        const ctx =
          facilityContext(item);

        if (
          deposit &&
          ctx.deposit &&
          norm(ctx.deposit) === norm(deposit)
        ) {
          return true;
        }

        if (
          !deposit &&
          settlement &&
          ctx.settlement &&
          norm(ctx.settlement) ===
            norm(settlement)
        ) {
          return true;
        }

        return false;
      })
      .map(facilityContext);

  const group = [
    selected,
    ...related,
  ];

  const depthRange =
    numericRange(
      group.map(x => x.depthM)
    );

  const temperatureRange =
    numericRange(
      group.map(x => x.temperatureC)
    );

  return {
    mineralId,

    name:
      selected.name,

    facilityType:
      selected.facilityType,

    settlement:
      selected.settlement,

    deposit:
      selected.deposit,

    depthM:
      selected.depthM,

    temperatureC:
      selected.temperatureC,

    latitude:
      selected.latitude,

    longitude:
      selected.longitude,

    coordinateStatus:
      selected.coordinateStatus,

    existingProperties:
      record.pro?.existing_properties || {},

    researchEnrichment:
      record.pro?.research_enrichment || {},

    relatedFacilities:
      related,

    relatedWithCoordinates:
      related.filter(
        x => x.hasCoordinates
      ).length,

    relatedWithoutCoordinates:
      related.filter(
        x => !x.hasCoordinates
      ).length,

    depthMin:
      depthRange.min,

    depthMax:
      depthRange.max,

    temperatureMin:
      temperatureRange.min,

    temperatureMax:
      temperatureRange.max,

    sources:
      sourceNames(record),
  };
}


function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const toRad = (value: number) =>
    value * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return (
    6371 *
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )
  );
}

export function getMineralWaterAreaProfile(
  latitude: number,
  longitude: number
): MineralWaterAreaProfile {
  const all = records();

  const located =
    all
      .map(facilityContext)
      .filter(
        item =>
          item.latitude !== null &&
          item.longitude !== null
      )
      .map(item => ({
        ...item,
        distanceKm: distanceKm(
          latitude,
          longitude,
          item.latitude as number,
          item.longitude as number
        ),
      }))
      .filter(
        item =>
          item.distanceKm <= 25
      )
      .sort(
        (a, b) =>
          a.distanceKm - b.distanceKm
      );

  const representedDeposits =
    Array.from(
      new Set(
        located
          .map(item => item.deposit)
          .filter(
            (value): value is string =>
              Boolean(value)
          )
      )
    );

  const depositKeys =
    new Set(
      representedDeposits.map(norm)
    );

  const contextualUnlocated =
    all
      .map(facilityContext)
      .filter(
        item =>
          !item.hasCoordinates &&
          item.deposit &&
          depositKeys.has(
            norm(item.deposit)
          )
      );

  const group = [
    ...located,
    ...contextualUnlocated,
  ];

  const temperatures =
    numericRange(
      group.map(
        item => item.temperatureC
      )
    );

  const depths =
    numericRange(
      group.map(
        item => item.depthM
      )
    );

  return {
    latitude,
    longitude,

    nearbyFacilities:
      located,

    within1Km:
      located.filter(
        item => item.distanceKm <= 1
      ).length,

    within5Km:
      located.filter(
        item => item.distanceKm <= 5
      ).length,

    within10Km:
      located.filter(
        item => item.distanceKm <= 10
      ).length,

    within25Km:
      located.length,

    nearestFacility:
      located[0] || null,

    representedDeposits,

    contextualUnlocated,

    temperatureMin:
      temperatures.min,

    temperatureMax:
      temperatures.max,

    depthMin:
      depths.min,

    depthMax:
      depths.max,
  };
}
