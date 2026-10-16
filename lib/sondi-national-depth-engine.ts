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
  interpretation_scope?: "REFERENCE_BOREHOLE_ONLY" | "SPATIAL_CORRELATION_CONDITIONAL";
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
  const polygons: Polygon[] =
    geometry.type === "MultiPolygon"
      ? geometry.coordinates as Polygon[]
      : [geometry.coordinates as Polygon];

  return polygons.some(
    polygon =>
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
            ? interval.evidence_level === "borehole_exact" &&
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
      alternative_lithologies: [],
      confidence: evidence.length
        ? "LOW"
        : "UNRESOLVED",
      evidence,
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

  return emptyResult(input, "OUTSIDE_MODEL");
}


export function resolveNationalDepthLithology(
  input: NationalDepthInput
): NationalDepthResult {
  const resolvedBase = resolveNationalDepthLithologyBase(input);
  const base: NationalDepthResult = {
    ...resolvedBase,
    documented_contact_context:
      resolvedBase.engine === "VRATSA_COMPATIBLE" ||
      resolvedBase.status === "INVALID_INPUT"
        ? []
        : getNationalDocumentedContactContext(
            input.latitude, input.longitude
          ),
    spatial_contact_research:
      resolvedBase.engine === "VRATSA_COMPATIBLE" ||
      resolvedBase.status === "INVALID_INPUT"
        ? []
        : resolveNationalSpatialContacts(
            input.latitude, input.longitude
          )
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

  const matches = base.evidence.filter(item =>
    item.type === "BOREHOLE" &&
    item.depth_evidence_class ===
      "DOCUMENTED_REFERENCE_COORDINATE_MATCH" &&
    item.coordinate_status === "OFFICIAL_EXACT" &&
    typeof item.distance_km === "number" &&
    item.distance_km <= 0.001 &&
    typeof item.interval_from_m === "number" &&
    typeof item.interval_to_m === "number" &&
    item.interval_from_m <= input.depthM &&
    input.depthM < item.interval_to_m &&
    typeof item.interval_material_bg === "string" &&
    item.interval_material_bg.trim().length > 0
  );

  const materials = Array.from(new Set(
    matches.map(item => item.interval_material_bg!.trim())
  ));

  // Ambiguous or absent references cannot produce a material.
  if (materials.length !== 1) {
    return {
      ...base,
      evidence_tier: base.evidence.length > 0 ||
        base.surface_geology !== null
        ? "REGIONAL_CONTEXT"
        : "INSUFFICIENT_EVIDENCE"
    };
  }

  return {
    ...base,
    status: "CONDITIONAL",
    confidence: "LOW",
    evidence_tier: "DOCUMENTED_BOREHOLE",
    probable_lithology: materials[0],
    interpretation_scope: "REFERENCE_BOREHOLE_ONLY",
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
