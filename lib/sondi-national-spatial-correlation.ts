import "server-only";
import fs from "node:fs";
import path from "node:path";
import { getGeologyAtLocation } from "./geology-location";
import { getMappedGemFaultsBetweenPoints } from "./fault-spatial-profile";
import { assessNationalSequenceCorrelation } from "./sondi-national-sequence-correlation";
import { getNationalBoreholeIndex } from "./sondi-national-borehole-index";

/** Read-only national spatial correlation. Never promotes a borehole log to site geology. */
type XY = { x: number; y: number };
type Hole = { id: string; latitude: number; longitude: number; xy: XY; distance_km: number; log: ReturnType<typeof assessNationalSequenceCorrelation>["boreholes"][number] };
function weights(a: XY, b: XY, c: XY, p: XY): number[] | null {
  const det = (b.y-c.y)*(a.x-c.x)+(c.x-b.x)*(a.y-c.y);
  if (Math.abs(det) < 1e-8) return null; // projected coordinates are metres
  const w1 = ((b.y-c.y)*(p.x-c.x)+(c.x-b.x)*(p.y-c.y))/det;
  const w2 = ((c.y-a.y)*(p.x-c.x)+(a.x-c.x)*(p.y-c.y))/det;
  return [w1,w2,1-w1-w2];
}
function length(a: XY,b: XY) { return Math.hypot(a.x-b.x,a.y-b.y); }
function projected(lat: number, lon: number, refLat: number, refLon: number): XY {
  const rad = Math.PI/180;
  return {x: (lon-refLon)*111320*Math.cos(refLat*rad), y:(lat-refLat)*111195};
}
function firstFracturedGneiss(h: Hole) {
  const intervals = h.log.documented_intervals;
  const index = intervals.findIndex(i => /гнайс|gneiss/iu.test(i.material) && /напукан|амфиболит|fractur/iu.test(i.material));
  if (index < 0) return null;
  const current = intervals[index];
  // A missing segment before the first fractured gneiss means the actual transition is unknown.
  const prior = index > 0 ? intervals[index-1] : null;
  return {
    first_observed_fractured_gneiss_m: current.from_m,
    transition_bracket_m: prior && typeof prior.to_m === "number" && typeof current.from_m === "number" && prior.to_m < current.from_m
      ? [prior.to_m,current.from_m] : null,
    description: current.material,
    source_ids: current.source_ids,
  };
}
export function assessNationalSpatialCorrelation(latitude: number, longitude: number) {
  const seq = assessNationalSequenceCorrelation(latitude, longitude, []);
  const byId = new Map(getNationalBoreholeIndex().map(h => [h.id,h]));
  const local = seq.boreholes.filter(h => h.diagnostic_group === "LOCAL_DISTANCE_CLUSTER");
  const eligible: Hole[] = local.flatMap(log => {
    const item = byId.get(log.borehole_id);
    if (item?.coordinate_status !== "OFFICIAL_EXACT" || typeof item.latitude !== "number" || typeof item.longitude !== "number") return [];
    return [{ id: item.id, latitude:item.latitude,longitude:item.longitude,
      xy:projected(item.latitude,item.longitude,latitude,longitude),distance_km:log.distance_km,log }];
  });
  const target: XY = {x:0,y:0};
  // Enumerate all non-degenerate triangles; choose shortest-perimeter containing one.
  // This is geometric bracketing, not a replacement for a geological structural model.
  let best: {members: Hole[]; barycentric: number[]; perimeter_m: number} | null = null;
  for(let i=0;i<eligible.length;i++) for(let j=i+1;j<eligible.length;j++) for(let k=j+1;k<eligible.length;k++) {
    const members=[eligible[i],eligible[j],eligible[k]];
    const w=weights(members[0].xy,members[1].xy,members[2].xy,target);
    if (!w || w.some(v=>v < -1e-8 || v > 1+1e-8)) continue;
    const perimeter=length(members[0].xy,members[1].xy)+length(members[1].xy,members[2].xy)+length(members[2].xy,members[0].xy);
    if(!best || perimeter<best.perimeter_m) best={members,barycentric:w,perimeter_m:perimeter};
  }
  const mapped = getGeologyAtLocation(latitude,longitude);
  // GEM is an inventory of mapped active fault traces, not a nationwide proof of
  // absence of faults, and not a structural block model. Report provenance honestly.
  const faultSourcePath = path.join(process.cwd(), "public", "geology-map", "data", "gem_active_faults_bulgaria.geojson");
  let mappedFaultInventory: "UNAVAILABLE" | "LOADED" | "EMPTY_OR_INVALID" = "UNAVAILABLE";
  let mappedFaultFeatures = 0;
  try {
    if (fs.existsSync(faultSourcePath)) {
      const raw = JSON.parse(fs.readFileSync(faultSourcePath, "utf8"));
      if (Array.isArray(raw?.features) && raw.features.length > 0) {
        mappedFaultInventory = "LOADED";
        mappedFaultFeatures = raw.features.length;
      } else {
        mappedFaultInventory = "EMPTY_OR_INVALID";
      }
    }
  } catch { mappedFaultInventory = "EMPTY_OR_INVALID"; }
  const pairChecks = eligible.map(h => {
    let hm: ReturnType<typeof getGeologyAtLocation> | null = null;
    try { hm=getGeologyAtLocation(h.latitude,h.longitude); } catch { /* mapping unavailable is unknown, not a mismatch */ }
    const sameDirect=mapped.status === "DIRECT" && hm?.status === "DIRECT" && !!mapped.unit?.code && mapped.unit.code === hm?.unit?.code;
    const differentDirect=mapped.status === "DIRECT" && hm?.status === "DIRECT" && !!mapped.unit?.code && !!hm?.unit?.code && mapped.unit.code !== hm?.unit?.code;
    let faults: ReturnType<typeof getMappedGemFaultsBetweenPoints> | null = null;
    try { faults=getMappedGemFaultsBetweenPoints(latitude,longitude,h.latitude,h.longitude); } catch { /* missing fault dataset is not zero faults */ }
    return {borehole_id:h.id,distance_km:h.distance_km,
      mapped_unit_comparison: sameDirect ? "SAME_DIRECT" : differentDirect ? "DIFFERENT_DIRECT" : "UNKNOWN",
      fault_coverage: faults === null || faults === undefined || mappedFaultInventory !== "LOADED"
        ? "UNAVAILABLE_OR_INVALID_INVENTORY" : "ACTIVE_FAULT_TRACES_CHECKED_NOT_STRUCTURAL_CLEARANCE",
      mapped_fault_crossings: faults?.intersection_count ?? null,
      first_fractured_gneiss: firstFracturedGneiss(h)};
  });
  const tri=best as {members:Hole[]; barycentric:number[]; perimeter_m:number} | null;
  const triangle=tri ? {
    borehole_ids:tri.members.map(m=>m.id),
    barycentric_weights:tri.barycentric.map(w=>Math.round(w*10000)/10000),
    perimeter_m:Math.round(tri.perimeter_m),
  } : null;
  const triangleObservations=tri ? tri.members.map(m=>({id:m.id, marker:firstFracturedGneiss(m)})) : [];
  const canInterpolateMarker=triangleObservations.length===3 && triangleObservations.every(o =>
    o.marker !== null && typeof o.marker.first_observed_fractured_gneiss_m === "number" && o.marker.transition_bracket_m === null);
  const descriptiveWeightedMarker=canInterpolateMarker && tri ? Math.round(triangleObservations.reduce((s,o,i)=>
    s+(o.marker!.first_observed_fractured_gneiss_m!)*tri.barycentric[i],0)*10)/10 : null;
  const faultCrossings=pairChecks.filter(x=>x.mapped_fault_crossings !== null && x.mapped_fault_crossings > 0);
  const structuralContinuity = faultCrossings.length ? "MAPPED_FAULT_CONFLICT" :
    (triangle && pairChecks.filter(x=>triangle.borehole_ids.includes(x.borehole_id)).every(x=>x.mapped_unit_comparison==="SAME_DIRECT" && x.fault_coverage==="ACTIVE_FAULT_TRACES_CHECKED_NOT_STRUCTURAL_CLEARANCE" && x.mapped_fault_crossings===0))
      ? "NO_MAPPED_CONTRADICTION_ONLY" : "NOT_ESTABLISHED";
  return {
    target: {latitude,longitude,mapped_status:mapped.status,mapped_unit:mapped.status==="DIRECT"?mapped.unit?.code??null:null},
    reference_total:seq.analyzed_reference_columns,local_distance_group_count:local.length,
    locally_mapped_exact_boreholes:eligible.length,
    target_inside_reference_triangle:triangle!==null,
    enclosing_triangle:triangle,
    mapped_fault_inventory: { status:mappedFaultInventory, feature_count:mappedFaultFeatures,
      source:"GEM active fault traces", limitation:"Zero intersections does not establish structural continuity or full fault coverage." },
    pair_checks:pairChecks,
    triangle_observations:triangleObservations,
    descriptive_weighted_marker_m:descriptiveWeightedMarker,
    marker_is_target_prediction:false as const,
    structural_continuity:structuralContinuity,
    site_material_approved:false as const,
    site_depth_intervals_approved:false as const,
    decision:"SPATIAL_CANDIDATE_REQUIRES_INDEPENDENT_STRUCTURAL_VALIDATION" as const,
    caution:"Обхващането от три сондажа и числената интерполация не доказват еднакъв стратиграфски хоризонт или структурна непрекъснатост. Без доказани структурни връзки не се разрешават пластове по метри.",
  };
}
