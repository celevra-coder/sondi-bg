import "server-only";
import { getGeologyAtLocation } from "./geology-location";
import { getNationalGwbGeologyContext } from "./sondi-national-gwb-geology-context";
import { resolveNationalSpatialResearch } from "./sondi-national-spatial-research";
import { getGlimSurface } from "./glim-surface";
import type { NationalDepthResult } from "./sondi-national-depth-engine";

/**
 * Read-only multi-source geological comparability assessment.
 * Direct mapped-unit identity is the ONLY confirmation recognized here.
 * GLiM and groundwater-body overlap are descriptive corroboration, not
 * site-scale stratigraphic continuity or depth prediction authorization.
 */
type Evidence = NationalDepthResult["evidence"];
type Point = { latitude: number; longitude: number };

type PairResult = {
  borehole_id: string;
  distance_km: number | null;
  mapped_comparison: string;
  independent_surface_check: "SAME_DIRECT_UNIT" | "DIFFERENT_DIRECT_UNIT" | "UNKNOWN";
  common_groundwater_bodies: string[];
  same_glim_polygon: boolean | null;
  geology_decision: "VERIFIED_MAPPED_MATCH" | "VERIFIED_MAPPED_CONFLICT" | "SUPPORT_ONLY" | "UNRESOLVED";
  prediction_authorized_by_this_check: false;
};

type Profile = {
  mapped_status: string;
  mapped_unit: string | null;
  groundwater_bodies: string[];
  research_status: string;
  research_depth_approved: boolean;
  glim_status: string;
  glim_polygon_id: number | null;
  glim_lithology_code: string | null;
};

function regional(point: Point) {
  let bodies: string[] = [];
  let researchStatus = "UNAVAILABLE";
  let researchDepthApproved = false;
  try { bodies = getNationalGwbGeologyContext(point.latitude, point.longitude)
    .map(item => item.code).filter(Boolean); } catch { /* missing data isn't a contradiction */ }
  try {
    const research = resolveNationalSpatialResearch(point.latitude, point.longitude);
    researchStatus = research.status;
    researchDepthApproved = research.depth_prediction_authorized;
  } catch { /* research is supplementary only */ }
  return { bodies: [...new Set(bodies)], researchStatus, researchDepthApproved };
}

async function describe(point: Point, includeGlim: boolean): Promise<Profile> {
  const mapped = getGeologyAtLocation(point.latitude, point.longitude);
  const regionalContext = regional(point);
  const glim = includeGlim ? await getGlimSurface(point.latitude, point.longitude)
    : null;
  return {
    mapped_status: mapped.status,
    mapped_unit: mapped.status === "DIRECT" ? mapped.unit?.code ?? null : null,
    groundwater_bodies: regionalContext.bodies,
    research_status: regionalContext.researchStatus,
    research_depth_approved: regionalContext.researchDepthApproved,
    glim_status: glim?.status ?? "NOT_QUERIED",
    glim_polygon_id: glim?.polygon_id ?? null,
    glim_lithology_code: glim?.lithology_code ?? null,
  };
}

export async function assessNationalUnifiedGeology(
  point: Point,
  evidence: Evidence,
  options: { includeGlim?: boolean; maxBoreholes?: number } = {}
) {
  const includeGlim = options.includeGlim === true;
  const limit = Math.min(Math.max(options.maxBoreholes ?? 5, 1), 8);
  const nearest = new Map<string, { id: string; distance: number | null; point: Point; comparison: string }>();
  for (const item of evidence) {
    if (item.type !== "BOREHOLE" || item.site_relation !== "NEARBY_REFERENCE" ||
      !item.borehole_id || item.coordinate_status !== "OFFICIAL_EXACT") continue;
    // Evidence carries no source coordinates. Resolve them from the authoritative index.
    // This also avoids guessing coordinates from distance or reference labels.
    const prev = nearest.get(item.borehole_id);
    if (!prev || (item.distance_km ?? Infinity) < (prev.distance ?? Infinity)) {
      nearest.set(item.borehole_id, {
        id: item.borehole_id,
        distance: item.distance_km ?? null,
        point: { latitude: NaN, longitude: NaN },
        comparison: item.surface_comparison ?? "UNRESOLVED",
      });
    }
  }
  const { getNationalBoreholeIndex } = await import("./sondi-national-borehole-index");
  const index = new Map(getNationalBoreholeIndex().map(x => [x.id, x]));
  const list = [...nearest.values()]
    .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
    .filter(record => {
      const borehole = index.get(record.id);
      if (typeof borehole?.latitude !== "number" ||
          typeof borehole.longitude !== "number") return false;
      record.point = { latitude: borehole.latitude, longitude: borehole.longitude };
      return true;
    }).slice(0, limit);

  const target = await describe(point, includeGlim);
  const profiles = await Promise.all(list.map(record => describe(record.point, includeGlim)));
  const pairs: PairResult[] = list.map((record, i) => {
    const profile = profiles[i];
    const verifiedComparable = !!target.mapped_unit && !!profile.mapped_unit;
    const comparison = !verifiedComparable ? "UNKNOWN" :
      target.mapped_unit === profile.mapped_unit ? "SAME_DIRECT_UNIT" : "DIFFERENT_DIRECT_UNIT";
    const common = target.groundwater_bodies.filter(code => profile.groundwater_bodies.includes(code));
    const glimMatch = target.glim_status === "OK" && profile.glim_status === "OK" &&
      target.glim_polygon_id !== null && profile.glim_polygon_id !== null
      ? target.glim_polygon_id === profile.glim_polygon_id : null;
    const decision = comparison === "SAME_DIRECT_UNIT" ? "VERIFIED_MAPPED_MATCH" :
      comparison === "DIFFERENT_DIRECT_UNIT" ? "VERIFIED_MAPPED_CONFLICT" :
      common.length || glimMatch === true ? "SUPPORT_ONLY" : "UNRESOLVED";
    return {
      borehole_id: record.id,
      distance_km: record.distance,
      mapped_comparison: record.comparison,
      independent_surface_check: comparison,
      common_groundwater_bodies: common,
      same_glim_polygon: glimMatch,
      geology_decision: decision,
      prediction_authorized_by_this_check: false as const,
    };
  });
  return {
    target,
    compared_borehole_count: pairs.length,
    results: pairs,
    verified_direct_match_count: pairs.filter(x => x.independent_surface_check === "SAME_DIRECT_UNIT").length,
    supporting_only_count: pairs.filter(x => x.geology_decision === "SUPPORT_ONLY").length,
    verified_direct_conflict_count: pairs.filter(x => x.geology_decision === "VERIFIED_MAPPED_CONFLICT").length,
    research_or_glim_cannot_authorize_depths: true,
    source_boundaries_not_extrapolated: true,
  };
}
