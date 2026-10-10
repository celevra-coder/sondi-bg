import "server-only";
import {
  getMarichinLocalContext,
  type MarichinLocalContext,
} from "./vratsa-marichin-context";

import fs from "node:fs";
import path from "node:path";
import {
  getGeologyAtLocation,
  type GeologyLocationResult,
} from "./geology-location";
import {
  getFaultSpatialProfile,
  getMappedGemFaultsBetweenPoints,
} from "./fault-spatial-profile";
import { getTerrainProfile } from "./terrain-profile";
import {
  getGroundwaterBodyProfile,
  type GroundwaterBodyProfileResult,
} from "./groundwater-body-profile";
import {
  resolveVratsaSpatialContext,
  type VratsaSpatialContextResult,
} from "./lithology-spatial-engine";

type TerrainProfileResult =
  Awaited<ReturnType<typeof getTerrainProfile>>;

type Coordinates = {
  latitude?: number | null;
  longitude?: number | null;
  status?: string | null;
  evidence_level?: string | null;
};

type ApproximateLocation = {
  status?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  location_note_bg?: string | null;
  evidence_level?: string | null;
  source_ids?: string[] | null;
  usable_for_public_map?: boolean | null;
  usable_for_pro_context?: boolean | null;
  distance_is_exact?: boolean | null;
};

type LithologyInterval = {
  depth_from_m?: number | null;
  depth_to_m?: number | null;
  expected_material_bg?: string | null;
  confidence?: string | null;
  evidence_level?: string | null;
  source_ids?: string[] | null;
};

type StructuralInterval = {
  depth_from_m?: number | null;
  depth_to_m?: number | null;
  type_bg?: string | null;
  description_bg?: string | null;
  significance_bg?: string | null;
  evidence_level?: string | null;
  source_ids?: string[] | null;
};

type HydraulicInterval = {
  depth_from_m?: number | null;
  depth_to_m?: number | null;
  event_bg?: string | null;
  evidence_level?: string | null;
  source_ids?: string[] | null;
};

type Borehole = {
  borehole_id: string;
  name_bg?: string | null;
  oblast?: string | null;
  region_code?: string | null;
  total_depth_m?: number | null;
  water_type?: string | null;
  coordinates?: Coordinates | null;
  approximate_location?: ApproximateLocation | null;
  lithology?: LithologyInterval[] | null;
  structural_intervals?: StructuralInterval[] | null;
  hydraulic_intervals?: HydraulicInterval[] | null;
  hydro_notes_bg?: string | null;
  expert_context?: {
    simple_text_bg?: string | null;
    usage?: string | null;
    warning?: string | null;
  } | null;
};

type LithologyDatabase = {
  schema_version?: string;
  borehole_count?: number;
  oblasts_loaded?: string[];
  boreholes?: Borehole[];
};

export type LithologyAnalogue = {
  borehole_id: string;
  name_bg: string;
  oblast: string | null;
  total_depth_m: number | null;

  distance_km: number | null;
  distance_is_exact: boolean;

  coordinate_quality:
    | "exact"
    | "documented"
    | "approximate"
    | "unresolved";

  spatial_role:
    | "distance_ranked"
    | "geology_ranked"
    | "approximate_geology_ranked"
    | "regional_context";

  geology: {
    status: GeologyLocationResult["status"];
    code: string | null;
    name_bg: string | null;
    name_en: string | null;
    same_as_target: boolean | null;
  };

  fault_context: {
    nearest_gem_distance_km: number | null;
    nearest_gem_bgcs: string | null;
    mrrb_corridor_ids: string[];
    same_nearest_gem_as_target: boolean | null;
    shared_mrrb_corridor: boolean | null;
    mapped_gem_fault_between: boolean | null;
    mapped_gem_fault_between_count: number | null;
    mapped_gem_fault_between_ids: string[];
  };

  terrain_context: {
    status: string;
    elevation_m: number | null;
    slope_degrees: number | null;
    local_relief_m: number | null;
    elevation_relative_to_local_mean_m: number | null;
    terrain_position: string | null;
    same_position_as_target: boolean | null;
    elevation_difference_m: number | null;
    slope_difference_degrees: number | null;
    interpretation_guard: string;
  };

  groundwater_body_context: {
    status: string;
    canonical_codes: string[];
    shared_canonical_codes_with_target: string[];
    shared_body_count: number;
    regional_hydrogeology_only: true;
    interpretation_guard: string;
  };

  analogue_score: number | null;
  selection_reasons_bg: string[];

  lithology: LithologyInterval[];
  structural_intervals: StructuralInterval[];
  hydraulic_intervals: HydraulicInterval[];

  hydro_notes_bg: string | null;
  usage: string | null;
  warning: string | null;
};

export type LithologyProfile = {
  target: {
    latitude: number;
    longitude: number;
  };

  search_radius_km: number;

  target_geology: {
    status: GeologyLocationResult["status"];
    code: string | null;
    name_bg: string | null;
    name_en: string | null;
    source: string | null;
    source_scale: string | null;
  };

  target_fault_context: {
    nearest_gem_distance_km: number | null;
    nearest_gem_bgcs: string | null;
    mrrb_corridor_ids: string[];
  };

  target_groundwater_body_context: {
    status: string;
    canonical_codes: string[];
    body_count: number;
    bodies: GroundwaterBodyProfileResult["bodies"];
    regional_hydrogeology_only: true;
    interpretation_guard: string;
  };

  /*
   * Spatial/depth model results for standard checkpoints.
   *
   * Empty outside the currently supported Vratsa model.
   * This is separate from borehole analogue evidence.
   */
  target_spatial_depth_model:
    VratsaSpatialContextResult[];

  marichin_local_context:
    MarichinLocalContext | null;

  direct_borehole_evidence: LithologyAnalogue[];

  exact_coordinate_analogues: LithologyAnalogue[];

  regional_context_analogues: LithologyAnalogue[];

  evidence_summary: {
    total_database_boreholes: number;
    exact_or_documented_coordinate_boreholes: number;
    nearby_coordinate_analogues: number;
    regional_context_analogues: number;
  };

  scientific_rules: {
    lithology_is_observed_at_borehole: true;
    projection_to_target_is_interpretation: true;
    fracture_is_not_automatic_inflow: true;
    filter_is_not_automatic_inflow: true;
    approximate_location_is_not_map_point: true;
    groundwater_body_is_regional_context_only: true;
  };
};

let cache: LithologyDatabase | null = null;

function loadDatabase(): LithologyDatabase {
  if (cache) return cache;

  const filePath = path.join(
    process.cwd(),
    "data",
    "soil-lithology",
    "bulgaria_borehole_lithology.json"
  );

  const raw = fs.readFileSync(filePath, "utf8");
  cache = JSON.parse(raw) as LithologyDatabase;

  return cache;
}

function validNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const earthRadiusKm = 6371.0088;

  const toRad = (value: number) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return earthRadiusKm * c;
}

function coordinateQuality(
  coordinates: Coordinates | null | undefined,
  approximateLocation?: ApproximateLocation | null
): LithologyAnalogue["coordinate_quality"] {
  const status = String(coordinates?.status || "").toLowerCase();

  if (
    status.includes("exact") ||
    status.includes("geodetic")
  ) {
    return "exact";
  }

  if (
    status.includes("official_documented") ||
    status.includes("documented")
  ) {
    return "documented";
  }

  if (
    validNumber(coordinates?.latitude) &&
    validNumber(coordinates?.longitude)
  ) {
    return "approximate";
  }

  if (
    approximateLocation?.usable_for_pro_context === true &&
    validNumber(approximateLocation.latitude) &&
    validNumber(approximateLocation.longitude)
  ) {
    return "approximate";
  }

  return "unresolved";
}

function geologySummary(
  result: GeologyLocationResult,
  targetCode?: string | null
): LithologyAnalogue["geology"] {
  const code = result.unit?.code || null;

  return {
    status: result.status,
    code,
    name_bg: result.unit?.name_bg || null,
    name_en: result.unit?.name_en || null,
    same_as_target:
      code && targetCode
        ? code === targetCode
        : null,
  };
}

function geologyConfidenceWeight(
  status: GeologyLocationResult["status"]
): number {
  if (status === "DIRECT") return 1;
  if (status === "GAP_FILL") return 0.65;
  return 0;
}

function normalizeFaultId(value: unknown): string | null {
  const text = String(value ?? "").trim().toUpperCase();
  return text || null;
}

function getNearestGemBgcs(profile: any): string | null {
  return normalizeFaultId(
    profile?.nearestGem?.bgcs ??
    profile?.nearestGem?.properties?.catalog_id
  );
}

function getMrrbCorridorIds(profile: any): string[] {
  const rows = Array.isArray(profile?.mrrbAtPoint)
    ? profile.mrrbAtPoint
    : [];

  const ids = rows
    .map((row: any) =>
      normalizeFaultId(
        row?.master?.faultId ??
        row?.properties?.mrrb_record ??
        row?.properties?.record ??
        row?.properties?.id
      )
    )
    .filter((value: string | null): value is string => Boolean(value));

  return Array.from(new Set(ids));
}

function faultContextSummary(
  profile: any,
  targetProfile?: any,
  betweenProfile?: any
): LithologyAnalogue["fault_context"] {
  const bgcs = getNearestGemBgcs(profile);
  const targetBgcs = getNearestGemBgcs(targetProfile);

  const corridors = getMrrbCorridorIds(profile);
  const targetCorridors = getMrrbCorridorIds(targetProfile);

  const shared =
    corridors.length > 0 &&
    targetCorridors.length > 0
      ? corridors.some(id => targetCorridors.includes(id))
      : null;

  return {
    nearest_gem_distance_km:
      typeof profile?.nearestGem?.distanceKm === "number"
        ? Math.round(profile.nearestGem.distanceKm * 100) / 100
        : null,

    nearest_gem_bgcs: bgcs,

    mrrb_corridor_ids: corridors,

    same_nearest_gem_as_target:
      bgcs && targetBgcs
        ? bgcs === targetBgcs
        : null,

    shared_mrrb_corridor: shared,

    mapped_gem_fault_between:
      typeof betweenProfile?.intersects_mapped_gem_fault === "boolean"
        ? betweenProfile.intersects_mapped_gem_fault
        : null,

    mapped_gem_fault_between_count:
      typeof betweenProfile?.intersection_count === "number"
        ? betweenProfile.intersection_count
        : null,

    mapped_gem_fault_between_ids:
      Array.isArray(betweenProfile?.faults)
        ? betweenProfile.faults
            .map((item: any) => normalizeFaultId(item?.bgcs))
            .filter(
              (value: string | null): value is string =>
                Boolean(value)
            )
        : [],
  };
}

function scoreFaultContext(
  boreholeFault: any,
  targetFault: any
): {
  score: number;
  reasons: string[];
} {
  let score = 0;
  const reasons: string[] = [];

  const targetBgcs = getNearestGemBgcs(targetFault);
  const boreholeBgcs = getNearestGemBgcs(boreholeFault);

  if (
    targetBgcs &&
    boreholeBgcs &&
    targetBgcs === boreholeBgcs
  ) {
    score += 18;
    reasons.push(
      `същата най-близка GEM разломна структура (${targetBgcs})`
    );
  }

  const targetCorridors =
    getMrrbCorridorIds(targetFault);

  const boreholeCorridors =
    getMrrbCorridorIds(boreholeFault);

  const sharedCorridor =
    targetCorridors.find(id =>
      boreholeCorridors.includes(id)
    );

  if (sharedCorridor) {
    score += 22;
    reasons.push(
      `общ официален МРРБ разломен коридор (${sharedCorridor})`
    );
  }

  const td =
    targetFault?.nearestGem?.distanceKm;

  const bd =
    boreholeFault?.nearestGem?.distanceKm;

  const sameNearestGem =
    Boolean(
      targetBgcs &&
      boreholeBgcs &&
      targetBgcs === boreholeBgcs
    );

  const hasValidatedSharedFaultContext =
    sameNearestGem || Boolean(sharedCorridor);

  if (
    hasValidatedSharedFaultContext &&
    typeof td === "number" &&
    typeof bd === "number"
  ) {
    const difference = Math.abs(td - bd);

    if (difference <= 1) {
      score += 8;
      reasons.push(
        sameNearestGem
          ? "сходна дистанция до същата най-близка GEM разломна структура"
          : "сходна дистанция в общ официален МРРБ разломен коридор"
      );
    } else if (difference <= 3) {
      score += 4;
      reasons.push(
        sameNearestGem
          ? "сходен пространствен контекст спрямо същата GEM разломна структура"
          : "сходен пространствен контекст в общ официален МРРБ разломен коридор"
      );
    }
  }

  return {
    score,
    reasons,
  };
}

function terrainNumber(
  profile: TerrainProfileResult | null | undefined,
  key:
    | "elevation_m"
    | "slope_degrees"
    | "local_relief_m"
    | "elevation_relative_to_local_mean_m"
): number | null {
  const value = profile?.[key];

  return typeof value === "number" && Number.isFinite(value)
    ? value
    : null;
}

function terrainPosition(
  profile: TerrainProfileResult | null | undefined
): string | null {
  return typeof profile?.terrain_position === "string"
    ? profile.terrain_position
    : null;
}

function scoreTerrainSimilarity(
  boreholeTerrain: TerrainProfileResult | null | undefined,
  targetTerrain: TerrainProfileResult | null | undefined,
  weight: number
): {
  score: number;
  reasons: string[];
} {
  const reasons: string[] = [];

  if (
    !boreholeTerrain ||
    !targetTerrain ||
    boreholeTerrain.status !== "OK" ||
    targetTerrain.status !== "OK"
  ) {
    return {
      score: 0,
      reasons,
    };
  }

  let raw = 0;

  const bp = terrainPosition(boreholeTerrain);
  const tp = terrainPosition(targetTerrain);

  if (
    bp &&
    tp &&
    bp === tp &&
    bp !== "flat_or_indeterminate"
  ) {
    raw += 4;
    reasons.push(
      `сходна локална релефна позиция (${bp})`
    );
  }

  if (
    bp === "flat_or_indeterminate" &&
    tp === "flat_or_indeterminate"
  ) {
    raw += 3;
    reasons.push(
      "и двете точки са в слабонаклонен/неопределен локален релеф"
    );
  }

  const be = terrainNumber(
    boreholeTerrain,
    "elevation_m"
  );

  const te = terrainNumber(
    targetTerrain,
    "elevation_m"
  );

  if (be !== null && te !== null) {
    const difference = Math.abs(be - te);

    if (difference <= 25) {
      raw += 2;
      reasons.push("много близка DEM височина");
    } else if (difference <= 75) {
      raw += 1;
      reasons.push("сходна DEM височина");
    }
  }

  const bs = terrainNumber(
    boreholeTerrain,
    "slope_degrees"
  );

  const ts = terrainNumber(
    targetTerrain,
    "slope_degrees"
  );

  if (bs !== null && ts !== null) {
    const difference = Math.abs(bs - ts);

    if (difference <= 2) {
      raw += 2;
      reasons.push("много сходен локален наклон");
    } else if (difference <= 5) {
      raw += 1;
      reasons.push("сходен локален наклон");
    }
  }

  const br = terrainNumber(
    boreholeTerrain,
    "local_relief_m"
  );

  const tr = terrainNumber(
    targetTerrain,
    "local_relief_m"
  );

  if (br !== null && tr !== null) {
    const difference = Math.abs(br - tr);

    if (difference <= 15) {
      raw += 2;
      reasons.push("сходен локален релеф");
    } else if (difference <= 40) {
      raw += 1;
      reasons.push("умерено сходен локален релеф");
    }
  }

  /*
   * Terrain is deliberately supporting evidence only.
   * It cannot establish lithology, groundwater presence,
   * aquifer depth, hydraulic connectivity, or drilling yield.
   *
   * Exact/documented coordinate: maximum +10.
   * Approximate spatial anchor: maximum +3.
   */
  const boundedWeight =
    Math.max(0, Math.min(1, weight));

  return {
    score:
      Math.round(
        Math.min(10, raw) *
        boundedWeight *
        100
      ) / 100,

    reasons,
  };
}

function terrainContextSummary(
  profile?: TerrainProfileResult | null,
  target?: TerrainProfileResult | null
) {
  const elevation =
    terrainNumber(profile, "elevation_m");

  const targetElevation =
    terrainNumber(target, "elevation_m");

  const slope =
    terrainNumber(profile, "slope_degrees");

  const targetSlope =
    terrainNumber(target, "slope_degrees");

  const position = terrainPosition(profile);
  const targetPosition = terrainPosition(target);

  return {
    status: profile?.status || "UNAVAILABLE",

    elevation_m: elevation,

    slope_degrees: slope,

    local_relief_m:
      terrainNumber(profile, "local_relief_m"),

    elevation_relative_to_local_mean_m:
      terrainNumber(
        profile,
        "elevation_relative_to_local_mean_m"
      ),

    terrain_position: position,

    same_position_as_target:
      position && targetPosition
        ? position === targetPosition
        : null,

    elevation_difference_m:
      elevation !== null &&
      targetElevation !== null
        ? Math.round(
            Math.abs(
              elevation - targetElevation
            ) * 100
          ) / 100
        : null,

    slope_difference_degrees:
      slope !== null &&
      targetSlope !== null
        ? Math.round(
            Math.abs(
              slope - targetSlope
            ) * 100
          ) / 100
        : null,

    interpretation_guard:
      "DEM terrain is supporting spatial context only; it does not establish lithology, groundwater presence, aquifer depth, hydraulic connectivity, or drilling yield.",
  };
}

function groundwaterBodyCodes(
  profile?: GroundwaterBodyProfileResult | null
): string[] {
  if (!profile || !Array.isArray(profile.bodies)) {
    return [];
  }

  return Array.from(
    new Set(
      profile.bodies
        .map(
          (body) =>
            body.canonical_code ||
            body.gwb_code ||
            null
        )
        .filter(
          (value): value is string =>
            typeof value === "string" &&
            value.trim().length > 0
        )
    )
  ).sort();
}

function sharedGroundwaterBodyCodes(
  profile?: GroundwaterBodyProfileResult | null,
  targetProfile?: GroundwaterBodyProfileResult | null
): string[] {
  const targetCodes = new Set(
    groundwaterBodyCodes(targetProfile)
  );

  return groundwaterBodyCodes(profile).filter(
    (code) => targetCodes.has(code)
  );
}

function groundwaterBodyContextSummary(
  profile?: GroundwaterBodyProfileResult | null,
  targetProfile?: GroundwaterBodyProfileResult | null
) {
  const codes =
    groundwaterBodyCodes(profile);

  const shared =
    sharedGroundwaterBodyCodes(
      profile,
      targetProfile
    );

  return {
    status:
      profile?.status || "NO_MATCH",

    canonical_codes:
      codes,

    shared_canonical_codes_with_target:
      shared,

    shared_body_count:
      shared.length,

    regional_hydrogeology_only:
      true as const,

    interpretation_guard:
      "Official groundwater-body polygons provide regional hydrogeological context only. They do not define the exact lithological column, exact aquifer depth, groundwater presence, hydraulic connectivity, or drilling yield at the target.",
  };
}

function scoreGroundwaterBodyContext(
  profile?: GroundwaterBodyProfileResult | null,
  targetProfile?: GroundwaterBodyProfileResult | null,
  weight = 1
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  const profileCodes = groundwaterBodyCodes(profile);
  const targetCodes = groundwaterBodyCodes(targetProfile);
  const shared = sharedGroundwaterBodyCodes(profile, targetProfile);
  if (shared.length > 0) {
    const rawScore = Math.min(30, 22 + (shared.length - 1) * 4);
    reasons.push(`общо официално подземно водно тяло с целта (${shared.join(", ")}); регионален хидрогеоложки контекст`);
    return { score: Math.round(rawScore * weight * 100) / 100, reasons };
  }
  if (profileCodes.length > 0 && targetCodes.length > 0) reasons.push("няма общ официален код на подземно водно тяло с целта");
  else reasons.push("съответствието по официални подземни водни тела не може да се определи");
  return { score: 0, reasons };
}

function scoreAnalogue(
  distance: number,
  boreholeGeology: GeologyLocationResult,
  targetGeology: GeologyLocationResult,
  boreholeFault: any,
  targetFault: any,
  betweenFaults?: any,
  boreholeTerrain?: TerrainProfileResult | null,
  targetTerrain?: TerrainProfileResult | null,
  terrainWeight = 1,
  boreholeGroundwaterBodies?: GroundwaterBodyProfileResult | null,
  targetGroundwaterBodies?: GroundwaterBodyProfileResult | null,
  groundwaterBodyWeight = 1
): {
  score: number;
  reasons: string[];
} {
  const reasons: string[] = [];

  /*
   * Distance contributes, but cannot by itself dominate the selection.
   * 15 km -> 0 distance points.
   */
  const distanceScore =
    Math.max(0, 15 - Math.min(distance, 15)) * 2;

  if (distance <= 5) {
    reasons.push("близък сондаж (до 5 km)");
  } else if (distance <= 15) {
    reasons.push("сондаж в регионалния радиус до 15 km");
  }

  const targetCode = targetGeology.unit?.code || null;
  const boreholeCode = boreholeGeology.unit?.code || null;

  const targetConfidence =
    geologyConfidenceWeight(targetGeology.status);

  const boreholeConfidence =
    geologyConfidenceWeight(boreholeGeology.status);

  let geologyScore = 0;

  if (
    targetCode &&
    boreholeCode &&
    targetCode === boreholeCode
  ) {
    geologyScore =
      55 *
      Math.min(
        targetConfidence || 0,
        boreholeConfidence || 0
      );

    reasons.push(
      `същата геоложка единица (${targetCode})`
    );
  } else if (targetCode && boreholeCode) {
    reasons.push(
      `различна геоложка единица (${boreholeCode} спрямо ${targetCode})`
    );
  } else {
    reasons.push(
      "геоложкото съответствие не може да се потвърди надеждно"
    );
  }

  if (boreholeGeology.status === "DIRECT") {
    reasons.push("директна растерна геоложка класификация");
  } else if (boreholeGeology.status === "GAP_FILL") {
    reasons.push("геоложка класификация чрез надеждно gap-fill поле");
  }

  const faultRank =
    scoreFaultContext(
      boreholeFault,
      targetFault
    );

  reasons.push(...faultRank.reasons);

  /*
   * A mapped GEM trace crossing the target-to-borehole segment is
   * structural separation evidence. It is deliberately only a moderate
   * penalty: a mapped trace is not automatically a hydraulic barrier,
   * conduit, or proof of different hydrogeological blocks.
   */
  const mappedFaultBetweenPenalty =
    betweenFaults?.intersects_mapped_gem_fault === true
      ? 15
      : 0;

  if (mappedFaultBetweenPenalty > 0) {
    const ids = Array.isArray(betweenFaults?.faults)
      ? betweenFaults.faults
          .map((item: any) => normalizeFaultId(item?.bgcs))
          .filter(
            (value: string | null): value is string =>
              Boolean(value)
          )
      : [];

    reasons.push(
      ids.length > 0
        ? `картографиран GEM разлом пресича отсечката до аналога (${ids.join(", ")}); използва се само като структурен контекст`
        : "картографиран GEM разлом пресича отсечката до аналога; използва се само като структурен контекст"
    );
  }

  const terrainRank =
    scoreTerrainSimilarity(
      boreholeTerrain,
      targetTerrain,
      terrainWeight
    );

  reasons.push(...terrainRank.reasons);

  const groundwaterBodyRank = scoreGroundwaterBodyContext(boreholeGroundwaterBodies, targetGroundwaterBodies, groundwaterBodyWeight);
  reasons.push(...groundwaterBodyRank.reasons);

  return {
    score:
      Math.round(
        (
          distanceScore +
          geologyScore +
          faultRank.score +
          terrainRank.score +
          groundwaterBodyRank.score -
          mappedFaultBetweenPenalty
        ) * 100
      ) / 100,
    reasons,
  };
}

function scoreApproximateAnalogue(
  distanceEstimate: number,
  boreholeGeology: GeologyLocationResult,
  targetGeology: GeologyLocationResult,
  boreholeFault: any,
  targetFault: any,
  boreholeTerrain?: TerrainProfileResult | null,
  targetTerrain?: TerrainProfileResult | null,
  boreholeGroundwaterBodies?: GroundwaterBodyProfileResult | null,
  targetGroundwaterBodies?: GroundwaterBodyProfileResult | null
): {
  score: number;
  reasons: string[];
} {
  /*
   * Approximate anchors are context points, not measured wellheads.
   * Therefore their numerical distance must never receive the full
   * distance weight used for exact/documented boreholes.
   */
  const base = scoreAnalogue(
    distanceEstimate,
    boreholeGeology,
    targetGeology,
    boreholeFault,
    targetFault
  );

  const fullDistanceScore =
    Math.max(0, 15 - Math.min(distanceEstimate, 15)) * 2;

  const reducedDistanceScore = fullDistanceScore * 0.20;

  const terrainRank =
    scoreTerrainSimilarity(
      boreholeTerrain,
      targetTerrain,
      0.30
    );

  const groundwaterBodyRank =
    scoreGroundwaterBodyContext(
      boreholeGroundwaterBodies,
      targetGroundwaterBodies,
      0.35
    );

  const score =
    base.score -
    fullDistanceScore +
    reducedDistanceScore +
    terrainRank.score +
    groundwaterBodyRank.score;

  const reasons = base.reasons.filter(
    (reason) =>
      !reason.toLowerCase().includes("разстоя")
  );

  reasons.push(...terrainRank.reasons);
  reasons.push(...groundwaterBodyRank.reasons);

  reasons.push(
    "Приблизителна пространствена опора: разстоянието и DEM релефното сравнение са ориентировъчни и са с по-ниска тежест."
  );

  return {
    score: Math.round(score * 100) / 100,
    reasons,
  };
}

function toAnalogue(
  borehole: Borehole,
  distance: number | null,
  role: LithologyAnalogue["spatial_role"],
  geology?: GeologyLocationResult,
  targetGeology?: GeologyLocationResult,
  faultProfile?: any,
  targetFaultProfile?: any,
  score?: number | null,
  reasons?: string[],
  betweenFaults?: any,
  terrainProfile?: TerrainProfileResult | null,
  targetTerrainProfile?: TerrainProfileResult | null,
  groundwaterBodyProfile?: GroundwaterBodyProfileResult | null,
  targetGroundwaterBodyProfile?: GroundwaterBodyProfileResult | null
): LithologyAnalogue {
  return {
    borehole_id: borehole.borehole_id,
    name_bg: borehole.name_bg || borehole.borehole_id,
    oblast: borehole.oblast || null,
    total_depth_m:
      validNumber(borehole.total_depth_m)
        ? borehole.total_depth_m
        : null,

    distance_km:
      distance === null
        ? null
        : Math.round(distance * 100) / 100,

    distance_is_exact:
      distance !== null &&
      coordinateQuality(
        borehole.coordinates,
        borehole.approximate_location
      ) !== "approximate",

    coordinate_quality: coordinateQuality(
      borehole.coordinates,
      borehole.approximate_location
    ),

    spatial_role: role,

    geology:
      geology
        ? geologySummary(
            geology,
            targetGeology?.unit?.code || null
          )
        : {
            status: "UNRESOLVED",
            code: null,
            name_bg: null,
            name_en: null,
            same_as_target: null,
          },

    fault_context:
      faultContextSummary(
        faultProfile,
        targetFaultProfile,
        betweenFaults
      ),

    terrain_context:
      terrainContextSummary(
        terrainProfile,
        targetTerrainProfile
      ),

    groundwater_body_context:
      groundwaterBodyContextSummary(
        groundwaterBodyProfile,
        targetGroundwaterBodyProfile
      ),

    analogue_score:
      typeof score === "number"
        ? score
        : null,

    selection_reasons_bg:
      Array.isArray(reasons)
        ? reasons
        : [],

    lithology: Array.isArray(borehole.lithology)
      ? borehole.lithology
      : [],

    structural_intervals:
      Array.isArray(borehole.structural_intervals)
        ? borehole.structural_intervals
        : [],

    hydraulic_intervals:
      Array.isArray(borehole.hydraulic_intervals)
        ? borehole.hydraulic_intervals
        : [],

    hydro_notes_bg: borehole.hydro_notes_bg || null,

    usage:
      borehole.expert_context?.usage || null,

    warning:
      borehole.expert_context?.warning || null,
  };
}

export async function getLithologyProfile(
  latitude: number,
  longitude: number,
  options?: {
    radiusKm?: number;
    maxNearby?: number;
    maxRegional?: number;
  }
) {
  if (
    !validNumber(latitude) ||
    !validNumber(longitude)
  ) {
    throw new Error(
      "Invalid target coordinates for lithology profile."
    );
  }

  const radiusKm = options?.radiusKm ?? 15;
  const maxNearby = options?.maxNearby ?? 8;
  const maxRegional = options?.maxRegional ?? 8;

  const db = loadDatabase();
  const boreholes = Array.isArray(db.boreholes)
    ? db.boreholes
    : [];

  const targetGeology =
    getGeologyAtLocation(latitude, longitude);

  /*
   * Spatial model is evaluated independently from the
   * legacy surface raster.
   *
   * Outside Vratsa these calls remain unresolved and are
   * filtered out, preserving all existing behaviour.
   */
  const spatialDepthCheckpoints =
    [20, 50, 80, 100, 150, 200, 300, 500];

  const targetSpatialDepthModel =
    spatialDepthCheckpoints
      .map(depthM =>
        resolveVratsaSpatialContext({
          latitude,
          longitude,
          depthM,
        })
      )
      .filter(result =>
        result.status === "OK" &&
        result.zone.zone_id !== null
      );

  const targetFaultProfile =
    getFaultSpatialProfile(latitude, longitude);

  const targetGroundwaterBodyProfile =
    getGroundwaterBodyProfile(
      latitude,
      longitude
    );

  const targetTerrainProfile =
    await getTerrainProfile(
      latitude,
      longitude
    );

  const coordinateCandidates =
    await Promise.all(
      boreholes
    .filter((borehole) => {
      return (
        Array.isArray(borehole.lithology) &&
        borehole.lithology.length > 0 &&
        validNumber(borehole.coordinates?.latitude) &&
        validNumber(borehole.coordinates?.longitude)
      );
    })
    .map(async (borehole) => {
      const boreholeLatitude =
        borehole.coordinates!.latitude!;

      const boreholeLongitude =
        borehole.coordinates!.longitude!;

      const distance = distanceKm(
        latitude,
        longitude,
        boreholeLatitude,
        boreholeLongitude
      );

      const geology =
        getGeologyAtLocation(
          boreholeLatitude,
          boreholeLongitude
        );

      const faultProfile =
        getFaultSpatialProfile(
          boreholeLatitude,
          boreholeLongitude
        );

      const betweenFaults =
        getMappedGemFaultsBetweenPoints(
          latitude,
          longitude,
          boreholeLatitude,
          boreholeLongitude
        );

      const terrainProfile =
        await getTerrainProfile(
          boreholeLatitude,
          boreholeLongitude
        );

      const groundwaterBodyProfile =
        getGroundwaterBodyProfile(
          boreholeLatitude,
          boreholeLongitude
        );

      const ranked =
        scoreAnalogue(
          distance,
          geology,
          targetGeology,
          faultProfile,
          targetFaultProfile,
          betweenFaults,
          terrainProfile,
          targetTerrainProfile,
          1,
          groundwaterBodyProfile,
          targetGroundwaterBodyProfile,
          1
        );

      return {
        borehole,
        distance,
        geology,
        faultProfile,
        betweenFaults,
        terrainProfile,
        groundwaterBodyProfile,
        score: ranked.score,
        reasons: ranked.reasons,
      };
    })
    );

  const nearby = coordinateCandidates
    .filter((item) => item.distance <= radiusKm)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.distance - b.distance;
    })
    .slice(0, maxNearby)
    .map((item) =>
      toAnalogue(
        item.borehole,
        item.distance,
        "geology_ranked",
        item.geology,
        targetGeology,
        item.faultProfile,
        targetFaultProfile,
        item.score,
        item.reasons,
        item.betweenFaults,
        item.terrainProfile,
        targetTerrainProfile,
        item.groundwaterBodyProfile,
        targetGroundwaterBodyProfile
      )
    );

  /*
   * Approximate coordinate anchors may participate in PRO spatial
   * comparison, but their distance is explicitly non-exact and its
   * scoring contribution is strongly reduced.
   */
  const approximateCandidates =
    await Promise.all(
      boreholes
    .filter((borehole) => {
      const a = borehole.approximate_location;

      return (
        Array.isArray(borehole.lithology) &&
        borehole.lithology.length > 0 &&
        !(
          validNumber(borehole.coordinates?.latitude) &&
          validNumber(borehole.coordinates?.longitude)
        ) &&
        a?.usable_for_pro_context === true &&
        validNumber(a.latitude) &&
        validNumber(a.longitude)
      );
    })
    .map(async (borehole) => {
      const a = borehole.approximate_location!;

      const anchorLatitude = a.latitude!;
      const anchorLongitude = a.longitude!;

      const distanceEstimate = distanceKm(
        latitude,
        longitude,
        anchorLatitude,
        anchorLongitude
      );

      const geology = getGeologyAtLocation(
        anchorLatitude,
        anchorLongitude
      );

      const faultProfile = getFaultSpatialProfile(
        anchorLatitude,
        anchorLongitude
      );

      const terrainProfile =
        await getTerrainProfile(
          anchorLatitude,
          anchorLongitude
        );

      const groundwaterBodyProfile =
        getGroundwaterBodyProfile(
          anchorLatitude,
          anchorLongitude
        );

      const ranked = scoreApproximateAnalogue(
        distanceEstimate,
        geology,
        targetGeology,
        faultProfile,
        targetFaultProfile,
        terrainProfile,
        targetTerrainProfile,
        groundwaterBodyProfile,
        targetGroundwaterBodyProfile
      );

      return {
        borehole,
        distance: distanceEstimate,
        geology,
        faultProfile,
        terrainProfile,
        groundwaterBodyProfile,
        score: ranked.score,
        reasons: ranked.reasons,
      };
    })
    );

  const approximateRanked =
    approximateCandidates
    .filter((item) => item.distance <= radiusKm)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.distance - b.distance;
    })
    .slice(0, maxNearby)
    .map((item) =>
      toAnalogue(
        item.borehole,
        item.distance,
        "approximate_geology_ranked",
        item.geology,
        targetGeology,
        item.faultProfile,
        targetFaultProfile,
        item.score,
        item.reasons,
        undefined,
        item.terrainProfile,
        targetTerrainProfile,
        item.groundwaterBodyProfile,
        targetGroundwaterBodyProfile
      )
    );

  /*
   * Records without a usable coordinate remain regional evidence only.
   * They receive no distance, geology-at-borehole, fault-at-borehole,
   * or analogue score. Selection is deterministic rather than dependent
   * on JSON insertion order.
   */
  const regional = boreholes
    .filter((borehole) => {
      const hasLithology =
        Array.isArray(borehole.lithology) &&
        borehole.lithology.length > 0;

      const hasExactCoordinates =
        validNumber(borehole.coordinates?.latitude) &&
        validNumber(borehole.coordinates?.longitude);

      const hasApproximateCoordinates =
        borehole.approximate_location?.usable_for_pro_context === true &&
        validNumber(borehole.approximate_location?.latitude) &&
        validNumber(borehole.approximate_location?.longitude);

      return (
        hasLithology &&
        !hasExactCoordinates &&
        !hasApproximateCoordinates
      );
    })
    .sort((a, b) => {
      const aEvidence =
        a.approximate_location?.usable_for_pro_context === true ? 1 : 0;

      const bEvidence =
        b.approximate_location?.usable_for_pro_context === true ? 1 : 0;

      if (bEvidence !== aEvidence) {
        return bEvidence - aEvidence;
      }

      const aDepth =
        validNumber(a.total_depth_m) ? a.total_depth_m : -1;

      const bDepth =
        validNumber(b.total_depth_m) ? b.total_depth_m : -1;

      if (bDepth !== aDepth) {
        return bDepth - aDepth;
      }

      return a.borehole_id.localeCompare(b.borehole_id);
    })
    .slice(0, maxRegional)
    .map((borehole) =>
      toAnalogue(
        borehole,
        null,
        "regional_context"
      )
    );

  return {
    target: {
      latitude,
      longitude,
    },

    search_radius_km: radiusKm,

    target_terrain:
      terrainContextSummary(
        targetTerrainProfile,
        targetTerrainProfile
      ),

    target_geology: {
      status: targetGeology.status,
      code: targetGeology.unit?.code || null,
      name_bg: targetGeology.unit?.name_bg || null,
      name_en: targetGeology.unit?.name_en || null,
      source: targetGeology.source,
      source_scale: targetGeology.sourceScale,
    },

    target_groundwater_body_context: {
      status: targetGroundwaterBodyProfile.status,
      canonical_codes: groundwaterBodyCodes(targetGroundwaterBodyProfile),
      body_count: targetGroundwaterBodyProfile.bodies.length,
      bodies: targetGroundwaterBodyProfile.bodies,
      regional_hydrogeology_only: true,
      interpretation_guard: "Официалните полигони на подземните водни тела са само регионален хидрогеоложки контекст. Те не определят точната литоложка колона, точната дълбочина на водоносен хоризонт, наличие на вода, хидравлична свързаност или дебит в избраната точка.",
    },

    target_fault_context: {
      nearest_gem_distance_km:
        typeof targetFaultProfile?.nearestGem?.distanceKm === "number"
          ? Math.round(
              targetFaultProfile.nearestGem.distanceKm * 100
            ) / 100
          : null,

      nearest_gem_bgcs:
        getNearestGemBgcs(targetFaultProfile),

      mrrb_corridor_ids:
        getMrrbCorridorIds(targetFaultProfile),
    },

    target_spatial_depth_model:
      targetSpatialDepthModel,

    marichin_local_context:
      getMarichinLocalContext(latitude, longitude),

    direct_borehole_evidence:
      nearby.filter((item) =>
        item.distance_km !== null &&
        item.distance_km <= 0.01 &&
        (item.coordinate_quality === "exact" ||
          item.coordinate_quality === "documented")
      ),

    exact_coordinate_analogues: [
      ...nearby,
      ...approximateRanked,
    ],

    regional_context_analogues: regional,

    evidence_summary: {
      total_database_boreholes: boreholes.length,

      exact_or_documented_coordinate_boreholes:
        coordinateCandidates.length,

      nearby_coordinate_analogues:
        nearby.length + approximateRanked.length,

      regional_context_analogues: regional.length,
    },

    scientific_rules: {
      lithology_is_observed_at_borehole: true,
      projection_to_target_is_interpretation: true,
      fracture_is_not_automatic_inflow: true,
      filter_is_not_automatic_inflow: true,
      approximate_location_is_not_map_point: true,
      terrain_is_supporting_context_only: true,
      groundwater_body_is_regional_context_only: true,
    },
  };
}