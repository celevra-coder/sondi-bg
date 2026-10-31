import { resolveNationalDocumentaryDecision, resolveNationalDocumentaryCompatibilityPolicy, applyNationalDocumentaryDecision, getNationalDocumentaryFallback } from "./sondi-national-evidence-engine";
import { resolveNationalColocatedMaterial, resolveNationalNearbyCandidates } from "./sondi-national-evidence-engine";
import { getNationalBoreholeResearchReferences } from "./sondi-national-borehole-index";
import { resolveNationalContactEvidence } from "./sondi-national-evidence-engine";
import "server-only";
// Unified national access to documented borehole contacts.
export {
  getNationalDocumentedContacts,
  extractContactsFromBorehole,
} from "./sondi-national-contacts";

export type {
  NationalDocumentedContact,
  DocumentedContactQuery,
} from "./sondi-national-contacts";


import { getNationalBoreholeIndex } from "./sondi-national-borehole-index";
import { resolveStratigraphicResearch, type StratigraphicResearchResult } from "./sondi-national-stratigraphic-interpreter";
import { resolveNationalCorrelation } from "./sondi-national-correlation";
import { assessLithologySemantic } from "./sondi-lithology-semantic";
import { resolveNationalSpatialContacts, type NationalSpatialContact, getNationalDocumentedContactContext, type NationalDocumentedContactContext } from "./sondi-national-contact-spatial";

import { getGeologyAtLocation } from "./geology-location";

import { getMappedGemFaultsBetweenPoints } from "./fault-spatial-profile";
import fs from "node:fs";
import path from "node:path";
import {
  resolveVratsaSpatialContext,
  type VratsaSpatialContextResult,
  type SpatialLithologyConfidence,
} from "./lithology-spatial-engine";

type Point = [number, number];
type Polygon = Point[][];

type Geometry = {
  type: "Polygon" | "MultiPolygon";
  coordinates: Polygon | Polygon[];
};

type RegionEntry = {
  id: string;
  name_bg: string;
  zone_id: string;
  model_file: string;
  boundary_file: string;
};

type RegionRegistry = {
  regions: RegionEntry[];
};

type Interval = {
  from_m: number;
  to_m: number;
  material_bg: string;
};

type ReferenceBorehole = {
  borehole_id: string;
  latitude?: number | null;
  longitude?: number | null;
  intervals?: Interval[];
  source_ids?: string[];
};

type RegionalContext = {
  dominant_lithology_context?: string[];
  regional_units?: Array<{
    unit?: string;
    regional_thickness_m?: string | number;
  }>;
  source_id?: string;
};

type RegionalZone = {
  documented_regional_sequence?: {
    record_id: string;
    source_ids: string[];
    units: Array<{
      unit: string;
      probable_material: string;
      contact_depth: string;
    }>;
    exact_contact_depths_verified: false;
    location_specific_depth_prediction_authorized: false;
  };
  regional_documented_alternatives?: string[];
  regional_structural_context?: RegionalContext[];
  documented_reference_intervals?: ReferenceBorehole[];
  source_ids?: string[];
};

type RegionalModel = {
  zones: Record<string, RegionalZone>;
};

export type NationalDepthInput = {
  latitude: number;
  longitude: number;
  depthM: number;
};

export type NationalDepthResult = {
  regional_sequence_context?: {
    units: Array<{
      unit: string;
      probable_material: string;
      contact_depth: string;
    }>;
    source_ids: string[];
    interpretation_scope: "REGIONAL_REFERENCE_ONLY";
    exact_contact_depths_verified: false;
    depth_prediction_authorized: false;
  };

  status:
    | "OK"
    | "CONDITIONAL"
    | "UNRESOLVED"
    | "INVALID_INPUT"
    | "OUTSIDE_MODEL";
  target: {
    latitude: number;
    longitude: number;
    depth_m: number;
  };
  region_id: string | null;
  region_name: string | null;
  zone_id: string | null;
  engine: "VRATSA_COMPATIBLE" | "NATIONAL_REGIONAL";
  surface_geology: {
    status: string;
    code: string | null;
    name_bg: string | null;
    source: string | null;
    source_scale: string | null;
  } | null;
  probable_lithology: string | null;
  spatial_contact_research?: NationalSpatialContact[];
  documented_contact_context?: NationalDocumentedContactContext[];
  evidence_tier?:
    | "DOCUMENTED_BOREHOLE"
    | "GEOLOGICAL_CORRELATION"
    | "REGIONAL_CONTEXT"
    | "INSUFFICIENT_EVIDENCE";
  interpretation_scope?: "REFERENCE_BOREHOLE_ONLY" | "SPATIAL_CORRELATION_CONDITIONAL" | "NEARBY_BOREHOLE_ANALOG_UNVERIFIED";
  alternative_lithologies: string[];
  confidence: SpatialLithologyConfidence;
  evidence: Array<{
    type: "BOREHOLE" | "REGIONAL_CONTEXT";
    description: string;
    distance_km: number | null;
    source_ids: string[];
    mapped_fault_intersection_count?: number | null;
    mapped_fault_ids?: string[];
    borehole_id?: string;
    interval_from_m?: number;
    interval_to_m?: number;
    interval_material_bg?: string;
    depth_evidence_class?:
      | "DOCUMENTED_REFERENCE_COORDINATE_MATCH"
      | "PARTIAL_OR_CONFLICTED_REFERENCE"
      | "UNVERIFIED_SPATIAL_ANALOG";
    interval_evidence_level?: string | null;
    interval_status?: string | null;
    coordinate_status?: string | null;
    site_relation?: "COLOCATED_COORDINATES" | "NEARBY_REFERENCE";
    applicability?: "CONDITIONAL" | "UNCONFIRMED";
    surface_comparison?:
      | "SAME_MAPPED_UNIT"
      | "DIFFERENT_MAPPED_UNIT"
      | "UNRESOLVED";
  }>;
  source_ids: string[];
  vratsa_result?: VratsaSpatialContextResult;
};

const dataDir = path.join(
  process.cwd(),
  "data",
  "soil-lithology",
  "runtime",
  "regions"
);

function readJson<T>(filename: string): T {
  if (!/^[a-zA-Z0-9_.-]+\.json$/.test(filename)) {
    throw new Error("Invalid regional filename");
  }
  return JSON.parse(
    fs.readFileSync(path.join(dataDir, filename), "utf8")
  ) as T;
}

function insideRing(
  lon: number,
  lat: number,
  ring: Point[]
): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i];
    const b = ring[j];
    if (
      (a[1] > lat) !== (b[1] > lat) &&
      lon < ((b[0] - a[0]) * (lat - a[1])) /
        (b[1] - a[1]) + a[0]
    ) {
      inside = !inside;
    }
  }
  return inside;
}

function containsPoint(
  geometry: Geometry,
  lat: number,
  lon: number
): boolean {
  // SONDI_GEOJSON_WRAPPER_SUPPORT_64R
  // Accept GeoJSON geometry, Feature and FeatureCollection.
  // Existing Polygon/MultiPolygon calculations remain unchanged.
  const input = geometry as unknown as {
    type?: string;
    coordinates?: unknown;
    geometry?: unknown;
    features?: unknown;
  };

  if (!input || typeof input !== "object") {
    throw new Error("Invalid regional boundary object");
  }

  if (input.type === "Feature") {
    if (!input.geometry) {
      throw new Error("GeoJSON Feature has no geometry");
    }
    return containsPoint(input.geometry as Geometry, lat, lon);
  }

  if (input.type === "FeatureCollection") {
    if (!Array.isArray(input.features)) {
      throw new Error("GeoJSON FeatureCollection has no features");
    }
    return input.features.some(feature =>
      containsPoint(feature as Geometry, lat, lon)
    );
  }

  if (
    input.type !== "Polygon" &&
    input.type !== "MultiPolygon"
  ) {
    throw new Error(
      "Unsupported regional geometry type: " +
      String(input.type)
    );
  }

  if (!Array.isArray(input.coordinates)) {
    throw new Error(
      "Regional geometry has no coordinate array: " +
      input.type
    );
  }

  const polygons: Polygon[] =
    input.type === "MultiPolygon"
      ? input.coordinates as Polygon[]
      : [input.coordinates as Polygon];

  return polygons.some(
    polygon =>
      Array.isArray(polygon) &&
      polygon.length > 0 &&
      insideRing(lon, lat, polygon[0]) &&
      !polygon.slice(1).some(
        hole => insideRing(lon, lat, hole)
      )
  );
}

function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) *
    Math.cos(lat2 * rad) *
    Math.sin(dLon / 2) ** 2;

  return 6371 * 2 * Math.atan2(
    Math.sqrt(a),
    Math.sqrt(1 - a)
  );
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

type BoreholeEvidenceOptions = {
  latitude: number;
  longitude: number;
  depthM: number;
  maxDistanceKm: number | null;
  maxBoreholes: number;
};

function collectNationalBoreholeEvidence(
  options: BoreholeEvidenceOptions
): {
  evidence: NationalDepthResult["evidence"];
  sourceIds: string[];
} {
  const {
    latitude, longitude, depthM,
    maxDistanceKm, maxBoreholes,
  } = options;

  const targetSurface = getGeologyAtLocation(
    latitude, longitude
  );

  const candidates = getNationalBoreholeIndex()
    .filter(borehole =>
      borehole.latitude !== null &&
      borehole.longitude !== null &&
      borehole.intervals.some(interval =>
        interval.from_m !== null &&
        interval.to_m !== null &&
        depthM >= interval.from_m &&
        depthM < interval.to_m
      )
    )
    .map(borehole => ({
      borehole,
      distance: distanceKm(
        latitude, longitude,
        borehole.latitude!,
        borehole.longitude!
      ),
    }))
    .filter(candidate =>
      maxDistanceKm === null ||
      candidate.distance <= maxDistanceKm
    )
    .sort((a, b) =>
      a.distance - b.distance ||
      a.borehole.id.localeCompare(b.borehole.id)
    )
    .slice(0, maxBoreholes);

  const evidence: NationalDepthResult["evidence"] = [];
  const sourceIds: string[] = [];

  for (const candidate of candidates) {
    const borehole = candidate.borehole;
    const matching = borehole.intervals.filter(interval =>
      interval.from_m !== null &&
      interval.to_m !== null &&
      depthM >= interval.from_m &&
      depthM < interval.to_m
    );

    const holeSurface = getGeologyAtLocation(
      borehole.latitude!,
      borehole.longitude!
    );

    const comparable =
      targetSurface.status === "DIRECT" &&
      holeSurface.status === "DIRECT" &&
      !!targetSurface.unit?.code &&
      !!holeSurface.unit?.code;

    const sameUnit =
      comparable &&
      targetSurface.unit!.code === holeSurface.unit!.code;

    const faults = getMappedGemFaultsBetweenPoints(
      latitude, longitude,
      borehole.latitude!,
      borehole.longitude!
    );

    const faultIds = faults?.faults.flatMap(item =>
      typeof item.bgcs === "string" && item.bgcs.trim()
        ? [item.bgcs]
        : []
    ) ?? [];

    for (const interval of matching) {
      evidence.push({
        type: "BOREHOLE",
        description:
          `${borehole.oblast}/${borehole.id}: ` +
          `${interval.from_m}-${interval.to_m} m: ` +
          interval.material_bg,
        distance_km: candidate.distance,
        source_ids: interval.source_ids,
        borehole_id: borehole.id,
        interval_from_m: interval.from_m!,
        interval_to_m: interval.to_m!,
        interval_material_bg: interval.material_bg,
        depth_evidence_class:
          candidate.distance <= 0.01 &&
          borehole.coordinate_status === "OFFICIAL_EXACT"
            ? (interval.evidence_level === "borehole_exact" ||
              interval.evidence_level === "documented_borehole_log" ||
              (
                (
                borehole.region_code === "Pazardzhik" ||
                borehole.region_code === "Plovdiv"
              ) &&
                interval.evidence_level === "borehole_exact_partial_column"
              )) &&
              interval.interval_status === null
              ? "DOCUMENTED_REFERENCE_COORDINATE_MATCH"
              : "PARTIAL_OR_CONFLICTED_REFERENCE"
            : "UNVERIFIED_SPATIAL_ANALOG",
        interval_evidence_level: interval.evidence_level,
        interval_status: interval.interval_status,
        coordinate_status: borehole.coordinate_status,
        site_relation: candidate.distance <= 0.01
          ? "COLOCATED_COORDINATES"
          : "NEARBY_REFERENCE",
        applicability: sameUnit
          ? "CONDITIONAL"
          : "UNCONFIRMED",
        surface_comparison: !comparable
          ? "UNRESOLVED"
          : sameUnit
            ? "SAME_MAPPED_UNIT"
            : "DIFFERENT_MAPPED_UNIT",
        mapped_fault_intersection_count:
          faults?.intersection_count ?? null,
        mapped_fault_ids: faultIds,
      });
      sourceIds.push(...interval.source_ids);
    }
  }


  // SONDI_NATIONAL_RESEARCH_CONTEXT_65G_R
  // Research-only coordinates are comparison references,
  // never proof of lithology below the clicked location.
  const researchReferences = getNationalBoreholeResearchReferences();

  if (researchReferences.length > 0) {
    const indexed = new Map(
      getNationalBoreholeIndex().map(hole => [hole.id, hole])
    );

    const candidates = researchReferences.flatMap(reference => {
      if (
        reference.latitude === null ||
        reference.longitude === null ||
        reference.validated_interval_count < 1 ||
        reference.coordinate_grade === "UNLOCATED"
      ) return [];

      const hole = indexed.get(reference.borehole_id);

      // Already positioned boreholes are handled by the
      // existing national evidence collection.
      if (
        !hole ||
        hole.latitude !== null ||
        hole.longitude !== null
      ) return [];

      const distance = distanceKm(
        latitude,
        longitude,
        reference.latitude,
        reference.longitude
      );

      if (
        distance > 50 ||
        (maxDistanceKm !== null && distance > maxDistanceKm)
      ) return [];

      return hole.intervals
        .filter(interval =>
          interval.from_m !== null &&
          interval.to_m !== null &&
          interval.from_m <= depthM &&
          depthM < interval.to_m &&
          interval.material_bg.trim().length > 0
        )
        .map(interval => ({
          reference,
          hole,
          interval,
          distance
        }));
    })
    .sort((a, b) =>
      a.distance - b.distance ||
      a.hole.id.localeCompare(b.hole.id)
    )
    .slice(0, 8);

    for (const candidate of candidates) {
      const { reference, hole, interval, distance } = candidate;

      evidence.push({
        type: "REGIONAL_CONTEXT",
        description:
          "Сравнителна сондажна колонка " + hole.id +
          " (" + reference.coordinate_grade +
          ", приблизително " + distance.toFixed(1) +
          " км): " + interval.from_m + "–" +
          interval.to_m + " м — " + interval.material_bg +
          ". Изследователски запис, който не доказва " +
          "същия пласт под избраната точка.",
        distance_km: distance,
        source_ids: interval.source_ids
      });

      sourceIds.push(...interval.source_ids);
    }
  }

  return {
    evidence,
    sourceIds: unique(sourceIds),
  };
}

function emptyResult(
  input: NationalDepthInput,
  status: NationalDepthResult["status"]
): NationalDepthResult {
  return {
    status,
    target: {
      latitude: input.latitude,
      longitude: input.longitude,
      depth_m: input.depthM,
    },
    region_id: null,
    region_name: null,
    zone_id: null,
    engine: "NATIONAL_REGIONAL",
    surface_geology: null,
    probable_lithology: null,
    alternative_lithologies: [],
    confidence: "UNRESOLVED",
    evidence: [],
    source_ids: [],
  };
}

function resolveNationalDepthLithologyBase(
  input: NationalDepthInput
): NationalDepthResult {
  const { latitude, longitude, depthM } = input;

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    !Number.isFinite(depthM) ||
    latitude < -90 || latitude > 90 ||
    longitude < -180 || longitude > 180 ||
    depthM < 0
  ) {
    return emptyResult(input, "INVALID_INPUT");
  }

  // Preserve the existing verified Vratsa interpretation.
  const vratsa = resolveVratsaSpatialContext({
    latitude,
    longitude,
    depthM,
  });

  if (
    process.env.SONDI_LEGACY_REGIONAL_MODE === "1" &&
    vratsa.status === "OK" &&
    vratsa.zone.zone_id !== null
  ) {
    const lithology = vratsa.depth_lithology;

    const status: NationalDepthResult["status"] =
      lithology?.status === "OK"
        ? "OK"
        : lithology?.status === "CONDITIONAL_LITHOLOGY"
          ? "CONDITIONAL"
          : "UNRESOLVED";

    return {
      ...emptyResult(input, status),
      region_id: "VRA",
      region_name: "Vratsa",
      zone_id: vratsa.zone.zone_id,
      engine: "VRATSA_COMPATIBLE",
      surface_geology: {
        status: vratsa.surface_geology.status,
        code: vratsa.surface_geology.code,
        name_bg: vratsa.surface_geology.name_bg,
        source: vratsa.surface_geology.source,
        source_scale: vratsa.surface_geology.source_scale,
      },
      probable_lithology:
        lithology?.probable_lithology ?? null,
      alternative_lithologies:
        lithology?.alternative_lithologies ?? [],
      confidence:
        lithology?.confidence ?? "UNRESOLVED",
      source_ids:
        lithology?.source_ids ?? [],
      vratsa_result: vratsa,
    };
  }

  const registry = readJson<RegionRegistry>(
    "regional_registry.json"
  );

  for (const entry of registry.regions) {
    const boundary = readJson<Geometry>(
      entry.boundary_file
    );

    if (!containsPoint(boundary, latitude, longitude)) {
      continue;
    }

    const model = readJson<RegionalModel>(
      entry.model_file
    );
    const zone = model.zones[entry.zone_id];

    if (!zone) {
      return {
        ...emptyResult(input, "UNRESOLVED"),
        region_id: entry.id,
        region_name: entry.name_bg,
        zone_id: entry.zone_id,
      };
    }

    const evidence: NationalDepthResult["evidence"] = [];

    const sources: string[] = [...(zone.source_ids ?? [])];

    for (const context of zone.regional_structural_context ?? []) {
      if (context.source_id) {
        sources.push(context.source_id);
      }

      const rocks = context.dominant_lithology_context ?? [];
      // Surface and regional units are context, not
      // depth-specific lithological alternatives.
      for (const unit of context.regional_units ?? []) {
        if (unit.unit) {
          evidence.push({
            type: "REGIONAL_CONTEXT",
            description: unit.unit,
            distance_km: null,
            source_ids: context.source_id
              ? [context.source_id]
              : [],
          });
        }
      }

      if (rocks.length) {
        evidence.push({
          type: "REGIONAL_CONTEXT",
          description: rocks.join(", "),
          distance_km: null,
          source_ids: context.source_id
            ? [context.source_id]
            : [],
        });
      }
    }

    // National candidate lookup independent of municipality.
    // A borehole column is evidence at the borehole location.
    const targetSurface = getGeologyAtLocation(
      latitude,
      longitude
    );

    const nationalBoreholes = collectNationalBoreholeEvidence({
      latitude,
      longitude,
      depthM,
      maxDistanceKm: 50,
      maxBoreholes: 12,
    });

    evidence.push(...nationalBoreholes.evidence);
    sources.push(...nationalBoreholes.sourceIds);

    const surface = targetSurface;

    // A regional unit or a nearby borehole is not
    // automatically the proven lithology at the target.
    // Higher confidence requires verified spatial selectors.
    return {
      status: evidence.length
        ? "CONDITIONAL"
        : "UNRESOLVED",
      target: {
        latitude,
        longitude,
        depth_m: depthM,
      },
      region_id: entry.id,
      region_name: entry.name_bg,
      zone_id: entry.zone_id,
      engine: "NATIONAL_REGIONAL",
      surface_geology: {
        status: surface.status,
        code: surface.unit?.code ?? null,
        name_bg: surface.unit?.name_bg ?? null,
        source: surface.source,
        source_scale: surface.sourceScale,
      },
      probable_lithology: null,
      alternative_lithologies:
        zone.regional_documented_alternatives ?? [],
      confidence: evidence.length
        ? "LOW"
        : "UNRESOLVED",
      evidence,
      regional_sequence_context: zone.documented_regional_sequence
        ? {
            units: zone.documented_regional_sequence.units,
            source_ids: zone.documented_regional_sequence.source_ids,
            interpretation_scope: "REGIONAL_REFERENCE_ONLY" as const,
            exact_contact_depths_verified: false as const,
            depth_prediction_authorized: false as const
          }
        : undefined,
      source_ids: unique(sources),
    };
  }

  // National fallback: mapped surface geology is contextual
  // evidence, not a prediction of subsurface lithology.
  const nationalSurface = getGeologyAtLocation(
    latitude,
    longitude
  );

  // Discover documented national borehole evidence outside
  // registered regional boundaries. This is not an inference
  // of subsurface lithology at the target.
  const nationalBoreholes = collectNationalBoreholeEvidence({
    latitude,
    longitude,
    depthM,
    maxDistanceKm: 50,
    maxBoreholes: 8,
  });

  const fallbackEvidence = nationalBoreholes.evidence;
  const fallbackSources = nationalBoreholes.sourceIds;

  const hasMappedSurface =
    (nationalSurface.status === "DIRECT" ||
      nationalSurface.status === "GAP_FILL") &&
    nationalSurface.unit !== null;

  // Preserve both mapped surface context and borehole evidence.
  // Neither proves depth-specific lithology at the target.
  if (hasMappedSurface || fallbackEvidence.length > 0) {
    return {
      ...emptyResult(input, "UNRESOLVED"),
      surface_geology: hasMappedSurface
        ? {
            status: nationalSurface.status,
            code: nationalSurface.unit?.code ?? null,
            name_bg: nationalSurface.unit?.name_bg ?? null,
            source: nationalSurface.source,
            source_scale: nationalSurface.sourceScale,
          }
        : null,
      evidence: fallbackEvidence,
      source_ids: unique(fallbackSources),
      probable_lithology: null,
      alternative_lithologies: [],
      confidence: "UNRESOLVED",
    };
  }


  // Common national documentary fallback in shadow mode only.
  // Surface geology is not proof of subsurface lithology.
  if (process.env.SONDI_LEGACY_REGIONAL_MODE !== "1") {
    const mapped = getGeologyAtLocation(latitude, longitude);
    if (mapped.status === "DIRECT" && mapped.unit?.code) {
      return {
        ...emptyResult(input, "CONDITIONAL"),
        surface_geology: {
          status: mapped.status,
          code: mapped.unit.code,
          name_bg: null,
          source: null,
          source_scale: null
        },
        evidence_tier: "REGIONAL_CONTEXT",
        probable_lithology: null,
        confidence: "LOW"
      };
    }
  }
  return emptyResult(input, "OUTSIDE_MODEL");
}


export function resolveNationalDepthLithology(
  input: NationalDepthInput
): NationalDepthResult {
  const resolvedBase = resolveNationalDepthLithologyBase(input);

  // Preserve the verified legacy Vratsa behavior until the
  // national structural replacement passes its own regression.
  const preserveLegacyContacts =
    resolvedBase.engine === "VRATSA_COMPATIBLE" ||
    resolvedBase.status === "INVALID_INPUT";

  const nationalContacts = preserveLegacyContacts
    ? {
        documented_contacts: [],
        spatial_contact_research: []
      }
    : resolveNationalContactEvidence(
        input.latitude,
        input.longitude
      );

  const base: NationalDepthResult = {
    ...resolvedBase,
    documented_contact_context:
      nationalContacts.documented_contacts,
    spatial_contact_research:
      nationalContacts.spatial_contact_research
  };

  if (base.engine === "VRATSA_COMPATIBLE") {
    return {
      ...base,
      evidence_tier: base.probable_lithology
        ? "GEOLOGICAL_CORRELATION"
        : "REGIONAL_CONTEXT"
    };
  }

  if (base.status === "INVALID_INPUT" ||
      base.status === "OUTSIDE_MODEL") {
    return {
      ...base,
      evidence_tier: "INSUFFICIENT_EVIDENCE"
    };
  }

  // A documented borehole at the selected coordinates has
  // precedence over any spatial correlation, including partial
  // or source-conflicted columns requiring separate handling.
  const hasColocatedReference = base.evidence.some(item =>
    item.type === "BOREHOLE" &&
    item.site_relation === "COLOCATED_COORDINATES" &&
    item.coordinate_status === "OFFICIAL_EXACT" &&
    typeof item.distance_km === "number" &&
    item.distance_km <= 0.001 &&
    typeof item.interval_from_m === "number" &&
    typeof item.interval_to_m === "number" &&
    item.interval_from_m <= input.depthM &&
    input.depthM < item.interval_to_m
  );

  // Universal documented-material assessment for all regions.
  const colocatedResult = resolveNationalColocatedMaterial(
    base.evidence,
    input.depthM
  );

  if (colocatedResult.materials.length > 1) {
    return {
      ...base,
      status: "UNRESOLVED",
      probable_lithology: null,
      alternative_lithologies: colocatedResult.materials,
      confidence: "UNRESOLVED",
      evidence_tier: "REGIONAL_CONTEXT",
      interpretation_scope: "REFERENCE_BOREHOLE_ONLY"
    };
  }

  if (colocatedResult.materials.length === 1) {
    return {
      ...base,
      status: "CONDITIONAL",
      evidence_tier: "DOCUMENTED_BOREHOLE",
      probable_lithology: colocatedResult.materials[0],
      alternative_lithologies: [],
      confidence: "LOW",
      interpretation_scope: "REFERENCE_BOREHOLE_ONLY",
      source_ids: [...new Set([
        ...base.source_ids,
        ...colocatedResult.source_ids
      ])]
    };
  }

  // SONDI_PERNIK_TRIANGULATED_CORRELATION_70CV
  // A conditional lithological-family analogue, not a measured
  // column. Only inside the MK2/MK3/MK4 observation triangle.
  // No fixed kilometre cutoff and no effect outside PER-M-PER32.
  if (
    process.env.SONDI_LEGACY_REGIONAL_MODE === "1" &&
    base.region_id === "PER-M-PER32" &&
    input.depthM >= 0 &&
    input.depthM < 20 &&
    !hasColocatedReference
  ) {
    const ids = [
      "PERNIK_STOMANA_MK2",
      "PERNIK_STOMANA_MK3",
      "PERNIK_STOMANA_MK4"
    ];

    const holes = ids.map(id =>
      getNationalBoreholeIndex().find(hole =>
        hole.id === id &&
        hole.origin === "REGIONAL" &&
        hole.coordinate_status === "REGIONAL_DOCUMENTED" &&
        typeof hole.latitude === "number" &&
        typeof hole.longitude === "number"
      )
    );

    if (holes.every(hole => hole !== undefined)) {
      const controls = holes.filter(
        (hole): hole is NonNullable<typeof hole> =>
          hole !== undefined
      );

      const [a, b, c] = controls;

      const ax = a.longitude!;
      const ay = a.latitude!;
      const bx = b.longitude!;
      const by = b.latitude!;
      const cx = c.longitude!;
      const cy = c.latitude!;
      const px = input.longitude;
      const py = input.latitude;

      const cross = (
        x1: number, y1: number,
        x2: number, y2: number,
        x3: number, y3: number
      ) => (x2 - x1) * (y3 - y1) -
           (y2 - y1) * (x3 - x1);

      const area = cross(ax, ay, bx, by, cx, cy);
      const ab = cross(ax, ay, bx, by, px, py);
      const bc = cross(bx, by, cx, cy, px, py);
      const ca = cross(cx, cy, ax, ay, px, py);

      const insideTriangle =
        Math.abs(area) > 1e-12 &&
        (
          area > 0
            ? ab >= 0 && bc >= 0 && ca >= 0
            : ab <= 0 && bc <= 0 && ca <= 0
        );

      const matching = ids.map(id =>
        base.evidence.find(item =>
          item.type === "BOREHOLE" &&
          item.borehole_id === id &&
          item.coordinate_status === "REGIONAL_DOCUMENTED" &&
          item.interval_evidence_level ===
            "regional_documented_interval" &&
          item.interval_status === null &&
          typeof item.interval_from_m === "number" &&
          typeof item.interval_to_m === "number" &&
          item.interval_from_m <= input.depthM &&
          input.depthM < item.interval_to_m &&
          typeof item.interval_material_bg === "string" &&
          item.mapped_fault_intersection_count === 0
        )
      );

      const family = (value: string): string | null => {
        const material = value.toLocaleLowerCase("bg");

        if (material.includes("\u043f\u044f\u0441\u044a\u0447\u043d\u0438\u043a"))
          return "SANDSTONE";
        if (material.includes("\u0430\u0440\u0433\u0438\u043b\u0438\u0442"))
          return "ARGILLITE";
        if (material.includes("\u043c\u0435\u0440\u0433\u0435\u043b"))
          return "MARL";
        if (material.includes("\u0433\u043b\u0438\u043d"))
          return "CLAY";
        if (material.includes("\u043f\u044f\u0441\u044a\u043a"))
          return "SAND";

        return null;
      };

      const families = matching.map(item =>
        item?.interval_material_bg
          ? family(item.interval_material_bg)
          : null
      );

      const unanimous =
        families.length === 3 &&
        families[0] !== null &&
        families.every(value => value === families[0]);

      const labels: Record<string, string> = {
        CLAY: "\u0413\u043b\u0438\u043d\u0435\u0441\u0442\u0438 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u0438",
        ARGILLITE: "\u0410\u0440\u0433\u0438\u043b\u0438\u0442\u0438",
        MARL: "\u041c\u0435\u0440\u0433\u0435\u043b\u0438",
        SAND: "\u041f\u044f\u0441\u044a\u0447\u043d\u0438 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u0438",
        SANDSTONE: "\u041f\u044f\u0441\u044a\u0447\u043d\u0438\u0446\u0438"
      };

      const selectedFamily = families[0];

      if (
        insideTriangle &&
        unanimous &&
        selectedFamily !== null &&
        labels[selectedFamily]
      ) {
        return {
          ...base,
          status: "CONDITIONAL",
          evidence_tier: "GEOLOGICAL_CORRELATION",
          probable_lithology: labels[selectedFamily],
          alternative_lithologies: [],
          confidence: "LOW",
          interpretation_scope:
            "SPATIAL_CORRELATION_CONDITIONAL",
          source_ids: [...new Set([
            ...base.source_ids,
            ...matching.flatMap(item => item?.source_ids ?? [])
          ])]
        };
      }
    }
  }


  // SONDI_PERNIK_CONSENSUS_EXTENSION_70FS
  // Conditional shallow analogue outside the verified triangle.
  // At least three independent Stomana logs must agree.
  // Distance alone is never sufficient evidence.
  if (
    process.env.SONDI_LEGACY_REGIONAL_MODE === "1" &&
    base.region_id === "PER-M-PER32" &&
    input.depthM >= 0 &&
    input.depthM < 20 &&
    !hasColocatedReference
  ) {
    const familyOf = (material: string): string | null => {
      const m = material.toLocaleLowerCase("bg");
      if (m.includes("\u043f\u044f\u0441\u044a\u0447\u043d\u0438\u043a"))
        return "SANDSTONE";
      if (m.includes("\u0430\u0440\u0433\u0438\u043b\u0438\u0442"))
        return "ARGILLITE";
      if (m.includes("\u043c\u0435\u0440\u0433\u0435\u043b"))
        return "MARL";
      if (m.includes("\u0433\u043b\u0438\u043d"))
        return "CLAY";
      if (m.includes("\u043f\u044f\u0441\u044a\u043a"))
        return "SAND";
      return null;
    };

    const labels: Record<string, string> = {
      CLAY: "\u0413\u043b\u0438\u043d\u0435\u0441\u0442\u0438 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u0438",
      ARGILLITE: "\u0410\u0440\u0433\u0438\u043b\u0438\u0442\u0438",
      MARL: "\u041c\u0435\u0440\u0433\u0435\u043b\u0438",
      SAND: "\u041f\u044f\u0441\u044a\u0447\u043d\u0438 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u0438",
      SANDSTONE: "\u041f\u044f\u0441\u044a\u0447\u043d\u0438\u0446\u0438"
    };

    const bestByHole = new Map<
      string,
      (typeof base.evidence)[number]
    >();

    for (const item of base.evidence) {
      if (
        item.type !== "BOREHOLE" ||
        !/^PERNIK_STOMANA_MK[1-4]$/.test(item.borehole_id ?? "") ||
        item.coordinate_status !== "REGIONAL_DOCUMENTED" ||
        item.interval_evidence_level !== "regional_documented_interval" ||
        item.interval_status !== null ||
        typeof item.distance_km !== "number" ||
        item.distance_km > 5 ||
        item.distance_km <= 0.001 ||
        item.mapped_fault_intersection_count !== 0 ||
        typeof item.interval_material_bg !== "string" ||
        !familyOf(item.interval_material_bg)
      ) continue;

      const id = item.borehole_id!;
      if (!bestByHole.has(id)) bestByHole.set(id, item);
    }

    const eligible = [...bestByHole.values()];

    const counts = new Map<string, number>();
    for (const item of eligible) {
      const family = familyOf(item.interval_material_bg!);
      if (family) counts.set(family, (counts.get(family) ?? 0) + 1);
    }

    const ranked = [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

    const winning = ranked[0];
    if (winning && winning[1] >= 3 && labels[winning[0]]) {
      const supporting = eligible.filter(item =>
        familyOf(item.interval_material_bg!) === winning[0]
      );

      const alternatives = eligible
        .filter(item =>
          familyOf(item.interval_material_bg!) !== winning[0]
        )
        .map(item => item.interval_material_bg!)
        .filter((value, index, arr) =>
          arr.indexOf(value) === index
        );

      return {
        ...base,
        status: "CONDITIONAL",
        evidence_tier: "GEOLOGICAL_CORRELATION",
        probable_lithology: labels[winning[0]],
        alternative_lithologies: alternatives,
        confidence: "LOW",
        interpretation_scope: "SPATIAL_CORRELATION_CONDITIONAL",
        source_ids: [...new Set([
          ...base.source_ids,
          ...supporting.flatMap(item => item.source_ids)
        ])]
      };
    }
  }

  // SONDI_NATIONAL_CORRELATION_V1
  // Never replace a colocated documented reference.
  const correlation = hasColocatedReference
    ? null
    : resolveNationalCorrelation(
        input.latitude,input.longitude,input.depthM
      );

  if (correlation) {
    return {
      ...base,
      status: "CONDITIONAL",
      evidence_tier: "GEOLOGICAL_CORRELATION",
      probable_lithology: correlation.material_bg,
      confidence: correlation.confidence,
      interpretation_scope: "SPATIAL_CORRELATION_CONDITIONAL",
      source_ids: [
        ...new Set([...base.source_ids,...correlation.source_ids])
      ]
    };
  }


  // SONDI_NATIONAL_NEARBY_EVIDENCE_77N
  // Same selection criteria at every GPS coordinate.
  // This does not establish stratigraphic continuity.
  const candidates = resolveNationalNearbyCandidates(
    base.evidence,
    input.depthM
  );

  if (!hasColocatedReference) {
    if (candidates.length > 0) {
      const primary = candidates[0];
      const primaryMaterial = String(primary.interval_material_bg).trim();
      const semantic = assessLithologySemantic(primaryMaterial);

      // Preserve composite borehole descriptions as documentary evidence.
      // Never silently substitute a more distant analogue.
      if (!semantic.spatial_material_candidate) {
        return {
          ...base,
          evidence_tier: "REGIONAL_CONTEXT",
          probable_lithology: null,
          alternative_lithologies: [primaryMaterial],
          confidence: "UNRESOLVED",
          interpretation_scope: "NEARBY_BOREHOLE_ANALOG_UNVERIFIED",
          source_ids: [...new Set([
            ...base.source_ids,
            ...primary.source_ids
          ])]
        };
      }

      const alternatives = [...new Set(
        candidates.slice(1)
          .map(item => String(item.interval_material_bg).trim())
          .filter(material =>
            material.length > 0 && material !== primaryMaterial
          )
      )].slice(0, 5);

      return {
        ...base,
        status: "CONDITIONAL",
        evidence_tier: "GEOLOGICAL_CORRELATION",
        probable_lithology: primaryMaterial,
        alternative_lithologies: alternatives,
        confidence: "LOW",
        interpretation_scope: "SPATIAL_CORRELATION_CONDITIONAL",
        source_ids: [...new Set([
          ...base.source_ids,
          ...candidates.flatMap(item => item.source_ids)
        ])]
      };
    }
  }


  // SONDI_SOFIA_NEARBY_DEPTH_FORECAST_V1
  // Low-confidence forecast from documented nearby boreholes.
  // Do not affect Vratsa, exact boreholes or other regions.
  // 77U: region compatibility is resolved outside this engine.
  const documentaryPolicy =
    resolveNationalDocumentaryCompatibilityPolicy(base.region_id);

  if (!hasColocatedReference && documentaryPolicy) {
    const expectedRegion = documentaryPolicy.expectedRegion;
const documentaryDecision =
      resolveNationalDocumentaryDecision({
        latitude:input.latitude,
        longitude:input.longitude,
        depthM:input.depthM,
        expectedRegion,
        requireLocalAnalogue:documentaryPolicy.requireLocalAnalogue,
        evidence:base.evidence,
        isSpatialMaterialCandidate:material =>
          assessLithologySemantic(material).spatial_material_candidate
      });

    if (documentaryDecision) {
      return applyNationalDocumentaryDecision(
        base,
        documentaryDecision
      );
    }
  }


  // Unified exact borehole handling is performed above
  // by SONDI_NATIONAL_UNIFIED_COLOCATED_BOREHOLE_77F.
  // No second, less restrictive exact-reference path.
  // 77W: nationwide documentary-only fallback.
  // Never convert this comparison to a predicted site material.
  const documentaryFallback =
    !hasColocatedReference &&
    !documentaryPolicy &&
    base.probable_lithology === null &&
    base.alternative_lithologies.length === 0
      ? getNationalDocumentaryFallback(
          input.latitude,
          input.longitude,
          input.depthM
        )
      : null;

  if (documentaryFallback) {
    return {
      ...base,
      status: "CONDITIONAL",
      evidence_tier: "REGIONAL_CONTEXT",
      probable_lithology: null,
      alternative_lithologies: [documentaryFallback.material],
      confidence: "UNRESOLVED",
      interpretation_scope: "NEARBY_BOREHOLE_ANALOG_UNVERIFIED",
      source_ids: [...new Set([
        ...base.source_ids,
        ...documentaryFallback.source_ids
      ])]
    };
  }

  return {
    ...base,
    evidence_tier: base.evidence.length > 0 ||
      base.surface_geology !== null
      ? "REGIONAL_CONTEXT"
      : "INSUFFICIENT_EVIDENCE"
  };

}


// SONDI_NATIONAL_STRATIGRAPHIC_RESEARCH_V1
// Explicit research entry point. Never silently promotes research
// interpretation to the public national lithology result.
export type NationalDepthResearchComparison = {
  national: NationalDepthResult;
  research: StratigraphicResearchResult | null;
  research_only: true;
  production_result_modified: false;
};

export function resolveNationalDepthResearchComparison(
  input: NationalDepthInput
): NationalDepthResearchComparison {
  const national = resolveNationalDepthLithology(input);

  // The validated Vratsa branch keeps exclusive precedence.
  if (
    national.engine === "VRATSA_COMPATIBLE" ||
    national.status === "INVALID_INPUT"
  ) {
    return {
      national,
      research: null,
      research_only: true,
      production_result_modified: false
    };
  }

  const research = resolveStratigraphicResearch(
    input.latitude,
    input.longitude,
    input.depthM
  );

  return {
    national,
    research,
    research_only: true,
    production_result_modified: false
  };
}
