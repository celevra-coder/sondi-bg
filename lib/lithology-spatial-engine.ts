import "server-only";

import fs from "node:fs";
import path from "node:path";

import { getGeologyAtLocation } from "./geology-location";
import { getFaultSpatialProfile } from "./fault-spatial-profile";
import {
  resolveVratsaDepthLithology,
  type VratsaDepthLithologySelector,
  type VratsaDepthLithologyResult,
} from "./vratsa-depth-lithology";
import { resolveVratsaMunicipality } from "./vratsa-municipality-resolver";

export type SpatialLithologyConfidence =
  | "VERY_HIGH"
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "UNRESOLVED";

export type VratsaZoneId =
  | "VRA-Z01"
  | "VRA-Z02"
  | "VRA-Z03"
  | "VRA-Z04";

type ResolveVratsaSpatialInput = {
  latitude: number;
  longitude: number;
  depthM: number;

  /*
   * Municipality remains optional.
   *
   * Coordinate-only resolution now uses the official NSI LAU
   * municipality polygons. A caller-provided municipality is kept
   * only as a compatibility fallback when official geometry cannot
   * resolve the coordinate.
   */
  municipality?: string | null;

  /*
   * Optional geological selector.
   *
   * This must only be supplied when a separate spatial
   * geological/geomorphic resolver has actually established
   * the polygon or local model.
   *
   * It must never be guessed from municipality alone.
   */
  lithologySelector?:
    VratsaDepthLithologySelector;
};

type EngineSchemaZone = {
  zone_id: VratsaZoneId;
  name: string;
  municipality_fallback?: string[];
  model_strength?: string;
  preferred_model_order?: string[];
  structural_guards?: string[];
  critical_facies_rules?: string[];
  critical_structural_rules?: string[];
  depth_policy?: Record<string, string>;
};

type EngineSchema = {
  schema_version: number;
  oblast: string;
  zones: EngineSchemaZone[];

  confidence_translation_from_final_qa?: Record<
    string,
    SpatialLithologyConfidence
  >;

  scientific_guards?: string[];

  fallback_policy?: {
    never_upgrade_confidence_during_fallback?: boolean;
  };
};

type FinalQaMunicipality = {
  depths?: Record<string, string>;
  basis?: string[];
  remaining_refinement?: string[];
  coverage_class?: string;
};

type FinalQa = {
  oblast: string;
  municipality_results?: Record<
    string,
    FinalQaMunicipality
  >;
};

export type VratsaSpatialContextResult = {
  status:
    | "OK"
    | "ZONE_UNRESOLVED"
    | "OUTSIDE_SUPPORTED_MODEL"
    | "INVALID_INPUT";

  target: {
    latitude: number;
    longitude: number;
    depth_m: number;
    municipality: string | null;
  };

  oblast: "Враца";

  zone: {
    zone_id: VratsaZoneId | null;
    name: string | null;

    resolution:
      | "OFFICIAL_MUNICIPALITY_POLYGON"
      | "MUNICIPALITY_FALLBACK"
      | "UNRESOLVED";

    exact_geometry_used: boolean;

    model_strength: string | null;
  };

  surface_geology: {
    status: string;
    code: string | null;
    name_bg: string | null;
    name_en: string | null;
    source: string | null;
    source_scale: string | null;
  };

  fault_context: {
    nearest_gem_distance_km: number | null;
    nearest_gem_bgcs: string | null;
    mrrb_corridor_ids: string[];
  };

  depth_model: {
    requested_depth_m: number;

    matched_depth_band: string | null;

    zone_confidence_raw: string | null;

    qa_confidence_raw: string | null;

    confidence: SpatialLithologyConfidence;

    interpretation_basis: string[];

    preferred_model_order: string[];

    structural_guards: string[];

    limitations: string[];
  };

  /*
   * Probable material at the requested depth.
   *
   * This is separate from surface_geology because the
   * subsurface model may remain usable even when the old
   * surface raster is unresolved.
   */
  depth_lithology?: VratsaDepthLithologyResult;


  scientific_guards: string[];

  prototype_rules: {
    borehole_is_primary_spatial_model: false;
    municipality_inferred_from_coordinates: boolean;
    exact_polygon_geometry_invented: false;
    spatial_context_precedes_borehole_analogue: true;
    production_output_changed: false;
  };
};

let schemaCache: EngineSchema | null = null;
let qaCache: FinalQa | null = null;


const VRATSA_SCHEMA_PATH =
  path.join(
    process.cwd(),
    "data",
    "soil-lithology",
    "runtime",
    "vratsa",
    "spatial_engine_schema.json"
  );

const VRATSA_FINAL_QA_PATH =
  path.join(
    process.cwd(),
    "data",
    "soil-lithology",
    "runtime",
    "vratsa",
    "lithology_final_qa.json"
  );

function readExactJson<T>(
  filePath: string
): T {
  return JSON.parse(
    fs.readFileSync(
      filePath,
      "utf8"
    )
  ) as T;
}



function loadSchema(): EngineSchema {
  if (schemaCache) {
    return schemaCache;
  }

  schemaCache =
    readExactJson<EngineSchema>(
      VRATSA_SCHEMA_PATH
    );

  return schemaCache;
}



function loadFinalQa(): FinalQa {
  if (qaCache) {
    return qaCache;
  }

  qaCache =
    readExactJson<FinalQa>(
      VRATSA_FINAL_QA_PATH
    );

  return qaCache;
}


function validNumber(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

function normalizeMunicipality(
  value: unknown
): string | null {
  const text = String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");

  return text || null;
}

function normalizeConfidence(
  value: string | null | undefined
): SpatialLithologyConfidence {
  const text = String(value || "")
    .trim()
    .toUpperCase();

  if (
    text === "VERY_HIGH" ||
    text === "DIRECT_HIGH"
  ) {
    return "VERY_HIGH";
  }

  if (
    text === "HIGH" ||
    text === "HIGH_LOCAL" ||
    text === "HIGH_REGIONAL" ||
    text === "REGIONAL_HIGH"
  ) {
    return "HIGH";
  }

  if (
    text === "MEDIUM_TO_HIGH" ||
    text === "MEDIUM_TO_HIGH_LOCAL" ||
    text === "MEDIUM_TO_HIGH_REGIONAL" ||
    text === "HIGH_TO_MEDIUM" ||
    text === "MEDIUM_STRUCTURAL" ||
    text === "MEDIUM" ||
    text === "MODEL_BASED"
  ) {
    return "MEDIUM";
  }

  if (
    text === "LOW" ||
    text === "LOW_TO_MEDIUM" ||
    text === "MODEL_BASED_LOW"
  ) {
    return "LOW";
  }

  return "UNRESOLVED";
}

function confidenceRank(
  value: SpatialLithologyConfidence
): number {
  return {
    UNRESOLVED: 0,
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    VERY_HIGH: 4,
  }[value];
}

function lowerConfidence(
  a: SpatialLithologyConfidence,
  b: SpatialLithologyConfidence
): SpatialLithologyConfidence {
  return confidenceRank(a) <=
    confidenceRank(b)
    ? a
    : b;
}

function depthBand(
  depthM: number,
  policy?: Record<string, string>
): string | null {
  if (!policy) return null;

  for (const key of Object.keys(policy)) {
    const match = key.match(
      /^(\d+)-(\d+)$/
    );

    if (!match) continue;

    const from = Number(match[1]);
    const to = Number(match[2]);

    if (
      depthM >= from &&
      depthM <= to
    ) {
      return key;
    }
  }

  return null;
}

function nearestQaDepth(
  depthM: number
): string {
  const checkpoints = [
    20,
    50,
    100,
    200,
    500,
  ];

  let best = checkpoints[0];

  for (const value of checkpoints) {
    if (
      Math.abs(value - depthM) <
      Math.abs(best - depthM)
    ) {
      best = value;
    }
  }

  return String(best);
}

function resolveZoneByMunicipality(
  schema: EngineSchema,
  municipality: string | null
): EngineSchemaZone | null {
  if (!municipality) return null;

  return (
    schema.zones.find(zone =>
      Array.isArray(zone.municipality_fallback) &&
      zone.municipality_fallback.some(
        item =>
          item.localeCompare(
            municipality,
            "bg",
            {
              sensitivity: "base",
            }
          ) === 0
      )
    ) || null
  );
}

function getNearestGemBgcs(
  profile: any
): string | null {
  const value =
    profile?.nearestGem?.bgcs ??
    profile?.nearestGem
      ?.properties?.catalog_id ??
    null;

  const text = String(value ?? "").trim();

  return text || null;
}

function getMrrbIds(
  profile: any
): string[] {
  const rows = Array.isArray(
    profile?.mrrbAtPoint
  )
    ? profile.mrrbAtPoint
    : [];

  return Array.from(
    new Set(
      rows
        .map((row: any) =>
          String(
            row?.master?.faultId ??
              row?.properties
                ?.mrrb_record ??
              row?.properties?.record ??
              row?.properties?.id ??
              ""
          ).trim()
        )
        .filter(Boolean)
    )
  );
}

function uniqueStrings(
  values: Array<
    string | null | undefined
  >
): string[] {
  return Array.from(
    new Set(
      values
        .map(value =>
          String(value ?? "").trim()
        )
        .filter(Boolean)
    )
  );
}

export function resolveVratsaSpatialContext(
  input: ResolveVratsaSpatialInput
): VratsaSpatialContextResult {
  const {
    latitude,
    longitude,
    depthM,
  } = input;

  const suppliedMunicipality =
    normalizeMunicipality(
      input.municipality
    );

  if (
    !validNumber(latitude) ||
    !validNumber(longitude) ||
    !validNumber(depthM) ||
    depthM < 0
  ) {
    return {
      status: "INVALID_INPUT",

      target: {
        latitude,
        longitude,
        depth_m: depthM,
        municipality: suppliedMunicipality,
      },

      oblast: "Враца",

      zone: {
        zone_id: null,
        name: null,
        resolution: "UNRESOLVED",
        exact_geometry_used: false,
        model_strength: null,
      },

      surface_geology: {
        status: "UNRESOLVED",
        code: null,
        name_bg: null,
        name_en: null,
        source: null,
        source_scale: null,
      },

      fault_context: {
        nearest_gem_distance_km: null,
        nearest_gem_bgcs: null,
        mrrb_corridor_ids: [],
      },

      depth_model: {
        requested_depth_m: depthM,
        matched_depth_band: null,
        zone_confidence_raw: null,
        qa_confidence_raw: null,
        confidence: "UNRESOLVED",
        interpretation_basis: [],
        preferred_model_order: [],
        structural_guards: [],
        limitations: [
          "Невалидни координати или дълбочина.",
        ],
      },

      scientific_guards: [],

      prototype_rules: {
        borehole_is_primary_spatial_model: false,
        municipality_inferred_from_coordinates: false,
        exact_polygon_geometry_invented: false,
        spatial_context_precedes_borehole_analogue: true,
        production_output_changed: false,
      },
    };
  }

  const schema = loadSchema();
  const qa = loadFinalQa();

  const geology =
    getGeologyAtLocation(
      latitude,
      longitude
    );

  const fault =
    getFaultSpatialProfile(
      latitude,
      longitude
    );

  /*
   * Spatial routing precedence:
   *
   * 1. Official NSI LAU municipality polygon from coordinates.
   * 2. Caller-provided municipality only as compatibility fallback.
   * 3. Never invent a zone if neither can resolve the point.
   *
   * The official geometry is administrative geometry. It is used
   * for model-zone routing only; it does not invent geological
   * formation contacts, dips, faults or subsurface boundaries.
   */
  const officialMunicipality =
    resolveVratsaMunicipality(
      latitude,
      longitude
    );

  const officialResolved =
    officialMunicipality.status === "OK";

  const municipality =
    officialResolved
      ? officialMunicipality.municipality.name_bg
      : suppliedMunicipality;

  const officialZoneId =
    officialResolved
      ? officialMunicipality.zone.zone_id
      : null;

  const zone =
    officialZoneId
      ? (
          schema.zones.find(
            item =>
              item.zone_id ===
              officialZoneId
          ) || null
        )
      : resolveZoneByMunicipality(
          schema,
          municipality
        );

  const zoneResolution =
    zone
      ? (
          officialZoneId
            ? "OFFICIAL_MUNICIPALITY_POLYGON"
            : "MUNICIPALITY_FALLBACK"
        )
      : "UNRESOLVED";

  const exactAdministrativeGeometryUsed =
    Boolean(
      zone &&
      officialZoneId
    );

  if (!zone) {
    return {
      status: "ZONE_UNRESOLVED",

      target: {
        latitude,
        longitude,
        depth_m: depthM,
        municipality,
      },

      oblast: "Враца",

      zone: {
        zone_id: null,
        name: null,
        resolution: "UNRESOLVED",
        exact_geometry_used: false,
        model_strength: null,
      },

      surface_geology: {
        status: geology.status,
        code:
          geology.unit?.code || null,
        name_bg:
          geology.unit?.name_bg || null,
        name_en:
          geology.unit?.name_en || null,
        source:
          geology.source || null,
        source_scale:
          geology.sourceScale || null,
      },

      fault_context: {
        nearest_gem_distance_km:
          typeof fault?.nearestGem
            ?.distanceKm === "number"
            ? Math.round(
                fault.nearestGem
                  .distanceKm * 100
              ) / 100
            : null,

        nearest_gem_bgcs:
          getNearestGemBgcs(fault),

        mrrb_corridor_ids:
          getMrrbIds(fault),
      },

      depth_model: {
        requested_depth_m: depthM,
        matched_depth_band: null,
        zone_confidence_raw: null,
        qa_confidence_raw: null,
        confidence: "UNRESOLVED",

        interpretation_basis: [
          "Повърхностната геоложка единица е прочетена.",
          "Разломният контекст е прочетен.",
          officialMunicipality.status === "OUTSIDE_VRATSA_DISTRICT"
            ? "Координатата е извън официалните NSI LAU граници на област Враца."
            : "Официалната административна геометрия не определи еднозначно община и няма надежден municipality fallback.",
        ],

        preferred_model_order: [],

        structural_guards: [],

        limitations: [
          officialMunicipality.status === "OUTSIDE_VRATSA_DISTRICT"
            ? "Точката е извън официалната административна геометрия на област Враца."
            : "Coordinate-only municipality resolution не е еднозначно за тази точка.",
          "Не се измислят геоложки контакти или подземни граници от административните полигони.",
        ],
      },

      scientific_guards:
        schema.scientific_guards || [],

      prototype_rules: {
        borehole_is_primary_spatial_model: false,
        municipality_inferred_from_coordinates: false,
        exact_polygon_geometry_invented: false,
        spatial_context_precedes_borehole_analogue: true,
        production_output_changed: false,
      },
    };
  }

  const band =
    depthBand(
      depthM,
      zone.depth_policy
    );

  const zoneRaw =
    band &&
    zone.depth_policy
      ? zone.depth_policy[band]
      : null;

  const zoneConfidence =
    normalizeConfidence(zoneRaw);

  const qaMunicipality =
    municipality
      ? qa.municipality_results?.[
          municipality
        ]
      : undefined;

  const qaDepthKey =
    nearestQaDepth(depthM);

  const qaRaw =
    qaMunicipality
      ?.depths?.[qaDepthKey] ||
    null;

  const qaConfidence =
    qaRaw
      ? normalizeConfidence(qaRaw)
      : "UNRESOLVED";

  /*
   * Final QA is authoritative when available.
   * Never upgrade confidence by municipality fallback.
   *
   * Zone confidence and QA confidence are combined
   * conservatively by keeping the lower one.
   */
  const combinedConfidence =
    qaRaw
      ? lowerConfidence(
          zoneConfidence,
          qaConfidence
        )
      : zoneConfidence;

  const structuralGuards =
    uniqueStrings([
      ...(zone.structural_guards || []),
      ...(zone.critical_facies_rules || []),
      ...(zone.critical_structural_rules || []),
    ]);

  const limitations =
    uniqueStrings([
      exactAdministrativeGeometryUsed
        ? "Zone routing uses the official NSI LAU municipality polygon; this is exact administrative geometry, not a digitised geological formation/contact polygon."
        : "Zone routing uses the caller-provided municipality fallback because official coordinate geometry did not resolve the point.",

      band
        ? null
        : "Requested depth is outside the explicitly encoded zone depth-policy bands.",

      geology.status === "UNRESOLVED"
        ? "Surface geological classification is unresolved at this coordinate."
        : null,

      zone.zone_id === "VRA-Z02"
        ? "Published paleorelief/isopach models are not yet available as machine-readable surfaces."
        : null,

      zone.zone_id === "VRA-Z03"
        ? "K-34-036 formation polygons and exact fault geometry are not yet digitised."
        : null,

      zone.zone_id === "VRA-Z04"
        ? "Exact dip, syncline-axis and formation-contact surfaces are still incomplete."
        : null,
    ]);

  /*
   * Resolve probable lithology independently from the
   * legacy surface raster.
   *
   * A geological selector is accepted only when it was
   * explicitly resolved upstream. Without such selector,
   * conditional Z03/Z04 models remain conditional.
   */
  const rawDepthLithology =
    resolveVratsaDepthLithology({
      zoneId:
        zone.zone_id,

      municipality,

      depthM,

      selector:
        input.lithologySelector ??
        null,
    });

  /*
   * Never allow the material model to increase confidence
   * above the spatial/depth model.
   *
   * Example:
   * lithology template HIGH + spatial model MEDIUM
   * => final lithology confidence MEDIUM.
   */
  const resolvedDepthLithology:
    VratsaDepthLithologyResult =
    (
      rawDepthLithology.confidence ===
      "UNRESOLVED"
    )
      ? rawDepthLithology
      : {
          ...rawDepthLithology,

          confidence:
            lowerConfidence(
              combinedConfidence,
              rawDepthLithology.confidence
            ),
        };


  return {
    status: "OK",

    target: {
      latitude,
      longitude,
      depth_m: depthM,
      municipality,
    },

    oblast: "Враца",

    zone: {
      zone_id: zone.zone_id,
      name: zone.name,
      resolution:
        zoneResolution,
      exact_geometry_used:
        exactAdministrativeGeometryUsed,
      model_strength:
        zone.model_strength || null,
    },

    surface_geology: {
      status: geology.status,
      code:
        geology.unit?.code || null,
      name_bg:
        geology.unit?.name_bg || null,
      name_en:
        geology.unit?.name_en || null,
      source:
        geology.source || null,
      source_scale:
        geology.sourceScale || null,
    },

    fault_context: {
      nearest_gem_distance_km:
        typeof fault?.nearestGem
          ?.distanceKm === "number"
          ? Math.round(
              fault.nearestGem
                .distanceKm * 100
            ) / 100
          : null,

      nearest_gem_bgcs:
        getNearestGemBgcs(fault),

      mrrb_corridor_ids:
        getMrrbIds(fault),
    },

    depth_model: {
      requested_depth_m: depthM,

      matched_depth_band:
        band,

      zone_confidence_raw:
        zoneRaw,

      qa_confidence_raw:
        qaRaw,

      confidence:
        combinedConfidence,

      interpretation_basis:
        uniqueStrings([
          `Врачански spatial zone: ${zone.name}.`,

          municipality
            ? (
                exactAdministrativeGeometryUsed
                  ? `Zone selection чрез официалния NSI LAU полигон на община ${municipality}.`
                  : `Zone selection чрез подадена община ${municipality}; използван е compatibility fallback.`
              )
            : null,

          geology.unit?.name_bg
            ? `Повърхностна геология: ${geology.unit.name_bg}.`
            : null,

          qaMunicipality
            ?.coverage_class
            ? `Final QA coverage: ${qaMunicipality.coverage_class}.`
            : null,

          ...(qaMunicipality?.basis || []),
        ]),

      preferred_model_order:
        zone.preferred_model_order || [],

      structural_guards:
        structuralGuards,

      limitations:
        uniqueStrings([
          ...limitations,
          ...(qaMunicipality
            ?.remaining_refinement ||
            []),
        ]),
    },

    depth_lithology:
      resolvedDepthLithology,


    scientific_guards:
      schema.scientific_guards || [],

    prototype_rules: {
      borehole_is_primary_spatial_model: false,
      municipality_inferred_from_coordinates:
        officialResolved,
      exact_polygon_geometry_invented: false,
      spatial_context_precedes_borehole_analogue: true,
      production_output_changed: false,
    },
  };
}
