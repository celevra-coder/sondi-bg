import { validateNationalContactTypes } from "./sondi-national-contact-types";
import "server-only";
import { validateNationalObservedContact } from "./sondi-national-contact-validation";
import { assessNationalSequenceCorrelation } from "./sondi-national-sequence-correlation";
import { assessNationalSpatialCorrelation } from "./sondi-national-spatial-correlation";

/** Research-side geological assessment. Never converts reference depths into site intervals. */
export function assessNationalSiteMaterialEvidence(latitude: number, longitude: number) {
  const spatial = assessNationalSpatialCorrelation(latitude, longitude);
  const sequence = assessNationalSequenceCorrelation(latitude, longitude, []);
  const pairById = new Map(spatial.pair_checks.map(p => [p.borehole_id, p]));
  const local = sequence.boreholes.filter(b => b.diagnostic_group === "LOCAL_DISTANCE_CLUSTER");
  const exact = local.filter(b => b.coordinate_status === "OFFICIAL_EXACT");
  // Each borehole contributes only once to each rock family, regardless of its number of layers.
  const byFamily = new Map<string, string[]>();
  for (const borehole of local) {
    const families = new Set(borehole.documented_intervals.flatMap(i => i.families));
    for (const family of families) byFamily.set(family, [...(byFamily.get(family) ?? []), borehole.borehole_id]);
  }
  const families = [...byFamily.entries()].map(([family, borehole_ids]) => ({
    family, borehole_ids, independent_logs: borehole_ids.length,
    exact_coordinate_logs: borehole_ids.filter(id => exact.some(b => b.borehole_id === id)).length,
  })).sort((a,b) => b.independent_logs - a.independent_logs || a.family.localeCompare(b.family));

  const triangleIds = spatial.enclosing_triangle?.borehole_ids ?? [];
  const triple = triangleIds.map(id => ({ id, hole:local.find(b=>b.borehole_id===id), check:pairById.get(id) }));
  const triangleHasConflict = triple.some(t => t.check?.mapped_unit_comparison === "DIFFERENT_DIRECT" || (t.check?.mapped_fault_crossings ?? 0) > 0);
  const triangleDirectAgreement = triple.length===3 && triple.every(t=>t.check?.mapped_unit_comparison === "SAME_DIRECT");
  const referenceFamilySupport = families.filter(f => f.independent_logs >= 2);
  const mainFamily = referenceFamilySupport[0] ?? null;
  const gneissMarkers = spatial.pair_checks.filter(p=>p.first_fractured_gneiss?.first_observed_fractured_gneiss_m !== null &&
    typeof p.first_fractured_gneiss?.first_observed_fractured_gneiss_m === "number")
    .map(p=>({borehole_id:p.borehole_id,depth_m:p.first_fractured_gneiss!.first_observed_fractured_gneiss_m!,
      transition_bracket_m:p.first_fractured_gneiss!.transition_bracket_m}));
  const markerValues = gneissMarkers.map(m=>m.depth_m);
  const documentedSpread = markerValues.length > 0 ? {min_m:Math.min(...markerValues),max_m:Math.max(...markerValues)} : null;
  const conflicts = local.filter(b=>b.conflicting_overlap_ranges_m.length>0 || b.uncovered_ranges_m.length>0).map(b=>({
    borehole_id:b.borehole_id, overlapping_ranges_m:b.conflicting_overlap_ranges_m, uncovered_ranges_m:b.uncovered_ranges_m,
  }));
  const materialAssessment = !local.length ? "NO_LOCAL_REFERENCE_EVIDENCE" :
    !mainFamily ? "MIXED_OR_SINGLE_REFERENCE_FAMILIES" :
    triangleHasConflict ? "LOCAL_REFERENCE_AGREEMENT_WITH_MAPPED_CONFLICT" :
    "LOCAL_REFERENCE_FAMILIES_CORROBORATED";
  // Missing map evidence is unknown, not a conflict and not clearance. Even direct
  // map agreement cannot alone prove stratigraphic boundaries or fault continuity.
  const depthDecision = triangleHasConflict ? "MAPPED_CONTRADICTION" :
    !spatial.enclosing_triangle ? "NO_ENCLOSING_EXACT_REFERENCE_TRIANGLE" :
    !triangleDirectAgreement ? "INDEPENDENT_GEOLOGICAL_CORRELATION_UNRESOLVED" :
    "STRUCTURAL_CONTINUITY_NOT_PROVEN";
  return {
    target:{latitude, longitude},
    contact_validation:validateNationalObservedContact(latitude, longitude),
    typed_contact_validation:validateNationalContactTypes(latitude, longitude),
    local_reference_count:local.length,
    exact_local_count:exact.length,
    borehole_family_evidence:families,
    material_assessment:materialAssessment,
    mapped_triangle_conflict:triangleHasConflict,
    mapped_triangle_direct_agreement:triangleDirectAgreement,
    spatial_triangle:spatial.enclosing_triangle,
    structural_status:spatial.structural_continuity,
    mapped_fault_inventory:spatial.mapped_fault_inventory,
    documented_fractured_gneiss_markers:gneissMarkers,
    observed_marker_spread_m:documentedSpread,
    incomplete_or_overlap_logs:conflicts,
    source_materials_are_site_prediction:false as const,
    material_context_usable_as_reference:true as const,
    source_group_is_geologically_verified:false as const,
    depth_status:depthDecision,
    target_material_approved:false as const,
    target_depth_intervals_approved:false as const,
    descriptive_marker_m:spatial.descriptive_weighted_marker_m,
    warning:"Литоложкото съгласуване се отнася до сондажни колонки. Геометричното обхващане, липсата на пресичане с активни разломи и интерполацията не доказват пластове под избраната точка.",
  };
}
