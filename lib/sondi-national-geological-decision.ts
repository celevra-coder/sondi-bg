import "server-only";
import { assessNationalSiteMaterialEvidence } from "./sondi-national-site-material-assessment";
import { validateNationalContactTypes } from "./sondi-national-contact-types";
import { assessNationalSpatialCorrelation } from "./sondi-national-spatial-correlation";
import type { NationalDepthResult } from "./sondi-national-depth-engine";
import { resolveNationalEvidence } from "./sondi-national-evidence-engine";
import { getNationalGwbGeologyContext } from "./sondi-national-gwb-geology-context";

/**
 * One national evidence-policy, for any coordinate (not tied to a region).
 * Does NOT infer site horizons from borehole distances, a triangle or a mapped-fault inventory.
 * Reference evidence and site prediction are different objects by design.
 */
const labels: Record<string, string> = {
  gneiss: "гнайси", amphibolite: "амфиболити", granitoid: "гранитоидни скали",
  sandstone: "пясъчници", conglomerate: "конгломерати", argillite: "аргилити",
  marl: "мергели", limestone: "варовици", clay: "глини", sand: "пясъци",
  gravel: "чакъли", alluvial_deluvial: "алувиални и делувиални наслаги",
};

export function assessNationalGeologicalDecision(latitude: number, longitude: number, baseline: NationalDepthResult) {
  if (baseline.engine === "VRATSA_COMPATIBLE" || baseline.status === "INVALID_INPUT" || baseline.status === "OUTSIDE_MODEL") {
    return {
      decision: "PRESERVE_EXISTING_VERIFIED_OR_INVALID_BRANCH" as const,
      local_material_evidence: [] as Array<{family:string;label_bg:string;reference_borehole_count:number;coordinate_exact_count:number;borehole_ids:string[]}>,
      contact_evidence: [] as Array<{contact_type:string;observed_count:number;bracketed_count:number;leave_one_out_mean_error_m:number|null;leave_one_out_max_error_m:number|null}>,
      locality_scope: "NOT_EVALUATED" as const,
      site_material_status: "BASELINE_ONLY" as const,
      site_depth_status: "BASELINE_ONLY" as const,
      structural_continuity_established: false as const,
      geometry_is_clearance: false as const,
      reference_materials_promoted: false as const,
      site_depth_intervals_promoted: false as const,
      regional_reference_summary_bg: null as string|null,
      restrictions: ["Запазен е съществуващият национален или специално защитен резултат."],
    };
  }
  // National evidence is collected independently of the local borehole cluster.
  // Research-only and groundwater-body context must NEVER authorize a depth boundary.
  let nationalContext: ReturnType<typeof resolveNationalEvidence> | null = null;
  let nationalEvidenceError: string | null = null;
  try {
    nationalContext = resolveNationalEvidence(latitude, longitude);
  } catch (error) {
    nationalEvidenceError = error instanceof Error ? error.message : "NATIONAL_EVIDENCE_UNAVAILABLE";
  }
  let groundwater: ReturnType<typeof getNationalGwbGeologyContext> = [];
  let groundwaterError: string | null = null;
  try {
    groundwater = getNationalGwbGeologyContext(latitude, longitude);
  } catch (error) {
    groundwaterError = error instanceof Error ? error.message : "GWB_DATA_UNAVAILABLE";
  }
  const regional_context = {
    source_scope: "NATIONAL_COLLECTED_EVIDENCE_NON_PROMOTING" as const,
    status: nationalContext?.status ?? "UNAVAILABLE",
    documented_reference_intervals: nationalContext?.intervals.length ?? 0,
    reference_columns: nationalContext?.references.length ?? 0,
    documented_contact_groups: nationalContext?.documented_contacts.length ?? 0,
    exploratory_spatial_contacts: nationalContext?.spatial_contact_research.length ?? 0,
    spatial_research_status: nationalContext?.spatial_research.status ?? "UNAVAILABLE",
    spatial_research_matches: nationalContext?.spatial_research.matching_footprint_count ?? 0,
    regional_research_status: nationalContext?.research_catalog_context.status ?? "UNAVAILABLE",
    regional_sheet_candidates: nationalContext?.research_catalog_context.broad_sheet_candidates.length ?? 0,
    regional_spatial_descriptions: (nationalContext?.research_catalog_context.spatial_descriptions ?? []).slice(0, 3),
    groundwater_profiles: groundwater.map(item => ({
      code: item.code,
      lithology: item.lithology,
      lithostratigraphic_units: item.lithostratigraphic_units,
      tectonic_unit: item.tectonic_unit,
      scope: item.interpretation_scope,
    })),
    national_evidence_error: nationalEvidenceError,
    groundwater_data_error: groundwaterError,
    site_depth_prediction_authorized: false as const,
    independent_structural_clearance_established: false as const,
  };
  const material = assessNationalSiteMaterialEvidence(latitude, longitude);
  const contacts = validateNationalContactTypes(latitude, longitude);
  const spatial = assessNationalSpatialCorrelation(latitude, longitude);
  const raw = material.borehole_family_evidence;
  const localMaterialEvidence = raw.map(entry => ({
    family: entry.family,
    label_bg: labels[entry.family] ?? entry.family,
    reference_borehole_count: entry.independent_logs,
    coordinate_exact_count: entry.exact_coordinate_logs,
    borehole_ids: entry.borehole_ids,
  }));
  const contactEvidence = contacts.contact_type_validations.map(entry => ({
    contact_type: entry.kind,
    observed_count: entry.observed_adjacent_contacts,
    bracketed_count: entry.bracketed_contacts,
    leave_one_out_mean_error_m: entry.mean_abs_error_m,
    leave_one_out_max_error_m: entry.max_error_m,
  }));
  const hasMappedConflict = spatial.pair_checks.some(pair =>
    pair.mapped_unit_comparison === "DIFFERENT_DIRECT" ||
    (typeof pair.mapped_fault_crossings === "number" && pair.mapped_fault_crossings > 0));
  const corroborated = localMaterialEvidence.filter(entry => entry.reference_borehole_count > 1);
  const materialStatus = hasMappedConflict ? "REFERENCE_AGREEMENT_WITH_MAPPED_CONTRADICTION" :
    corroborated.length ? "LOCAL_BOREHOLE_MATERIALS_CORROBORATED" :
    localMaterialEvidence.length ? "REFERENCE_MATERIALS_DOCUMENTED_NOT_CORROBORATED" :
    "NO_LOCAL_REFERENCE_MATERIALS";
  // Geographic grouping is only descriptive and not validated as a single unit.
  // If spatial structural clearance cannot be proven, depth predictions cannot be granted.
  const restrictions = [
    "Локалната група е определена по разстояния само за диагностика; не доказва геоложко единство.",
    "Еднакъв материал в различни сондажи не доказва еднаква дълбочина на контакта.",
    "Картографирани активни разломни линии не са пълен модел на структурните блокове.",
  ];
  if (spatial.target.mapped_status !== "DIRECT") restrictions.push("Няма пряко определена картографска единица за избраната точка.");
  if (hasMappedConflict) restrictions.push("Има картографирано противоречие, което изисква геоложко разграничаване.");
  if (material.incomplete_or_overlap_logs.length) restrictions.push("Има празнини или припокривания в част от референтните колонки.");
  if (contactEvidence.some(x=>x.leave_one_out_max_error_m !== null)) restrictions.push("Измерената грешка на референтните контакти не е гарантирана грешка за избраната точка.");
  const shortNames = corroborated.slice(0, 5).map(x=>x.label_bg);
  const regionalSummary = shortNames.length
    ? `В разгледаните референтни сондажи от местната диагностична група се повтарят ${shortNames.join(", ")}. Това са документирани материали в сондажите, не доказани пластове под избраната точка.`
    : localMaterialEvidence.length
      ? "Налични са документирани материали в референтни сондажи, но няма достатъчно потвърждение между местните колонки за обобщение."
      : "Не е установена надеждна местна сондажна група; използва се съществуващият регионален анализ.";
  return {
    decision: "NATIONAL_EVIDENCE_TRIAGE" as const,
    local_material_evidence: localMaterialEvidence,
    contact_evidence: contactEvidence,
    locality_scope: "DISTANCE_CLUSTER_NOT_GEOLOGICALLY_VERIFIED" as const,
    site_material_status: materialStatus,
    site_depth_status: hasMappedConflict ? "MAPPED_CONTRADICTION_REQUIRES_REVIEW" as const :
      "STRUCTURAL_CONTINUITY_UNPROVEN_NO_SITE_INTERVAL" as const,
    map_status: spatial.target.mapped_status,
    mapped_fault_inventory: spatial.mapped_fault_inventory.status,
    mapped_fault_features: spatial.mapped_fault_inventory.feature_count,
    target_in_reference_triangle: spatial.target_inside_reference_triangle,
    structural_continuity_established: false as const,
    geometry_is_clearance: false as const,
    reference_materials_promoted: false as const,
    site_depth_intervals_promoted: false as const,
    regional_reference_summary_bg: regionalSummary,
    regional_context,
    restrictions,
  };
}


/** National applicability verdict based on the evidence actually available.
 * This function can recognize ALREADY-authorized site-specific depth evidence.
 * It does not promote a nearby borehole boundary to the requested location.
 * Missing structural evidence is UNKNOWN, never evidence of no fault.
 */
export function resolveNationalApplicabilityVerdict(
  baseline: NationalDepthResult,
  assessment: ReturnType<typeof assessNationalGeologicalDecision> | null,
) {
  const existingSiteDepth = Boolean(
    (baseline.status === "OK" || baseline.status === "CONDITIONAL") &&
    baseline.probable_lithology &&
    (baseline.evidence_tier === "DOCUMENTED_BOREHOLE" ||
      baseline.evidence_tier === "GEOLOGICAL_CORRELATION") &&
    (baseline.interpretation_scope === "REFERENCE_BOREHOLE_ONLY" ||
      baseline.interpretation_scope === "SPATIAL_CORRELATION_CONDITIONAL")
  );
  const evidence = assessment?.local_material_evidence ?? [];
  const replicated = evidence.filter(x => x.reference_borehole_count > 1);
  const mappedConflict = assessment && "site_material_status" in assessment &&
    assessment.site_material_status === "REFERENCE_AGREEMENT_WITH_MAPPED_CONTRADICTION";
  const localMaterials = replicated.map(x => ({
    family: x.family, label_bg: x.label_bg,
    reference_logs: x.reference_borehole_count,
    exact_coordinate_logs: x.coordinate_exact_count,
    source_borehole_ids: x.borehole_ids,
  }));
  const regional = assessment && "regional_context" in assessment
    ? assessment.regional_context : null;
  const spatialMatches = regional?.spatial_research_matches ?? 0;
  const researchOnly = spatialMatches > 0;
  const observedContacts = assessment?.contact_evidence.filter(c => c.observed_count > 0) ?? [];
  const controls = observedContacts.map(c => ({
    kind: c.contact_type,
    observed_contacts: c.observed_count,
    bracketed_contacts: c.bracketed_count,
    leave_one_out_mean_error_m: c.leave_one_out_mean_error_m,
    leave_one_out_max_error_m: c.leave_one_out_max_error_m,
    prediction_at_target_authorized: false as const,
  }));
  const material_scope = existingSiteDepth ? "BASELINE_VERIFIED_SITE_LITHOLOGY" as const
    : mappedConflict ? "REFERENCE_EVIDENCE_CONFLICT_REVIEW" as const
    : localMaterials.length ? "CORROBORATED_REFERENCE_LITHOLOGY_NOT_SITE_PROOF" as const
    : researchOnly ? "RESEARCH_ONLY_REGIONAL_GEOLOGY" as const
    : evidence.length ? "SINGLE_REFERENCE_CONTEXT" as const
    : "EXISTING_REGIONAL_CONTEXT" as const;
  const depth_scope = existingSiteDepth ? "PRESERVE_EXISTING_SITE_DEPTH" as const
    : observedContacts.length ? "OBSERVED_CONTACTS_NOT_STRUCTURALLY_CORRELATED" as const
    : "NO_VERIFIED_SITE_DEPTH_EVIDENCE" as const;
  const reason_codes: string[] = [];
  if (mappedConflict) reason_codes.push("MAPPED_GEOLOGICAL_CONFLICT");
  if (!existingSiteDepth) reason_codes.push("NO_INDEPENDENT_SITE_DEPTH_CLEARANCE");
  if (assessment && "map_status" in assessment && assessment.map_status !== "DIRECT")
    reason_codes.push("MAPPED_UNIT_NOT_DIRECT");
  if (observedContacts.length) reason_codes.push("REFERENCE_CONTACTS_REQUIRE_INDEPENDENT_CORRELATION");
  if (researchOnly) reason_codes.push("SPATIAL_RESEARCH_NOT_PROMOTED");
  if (!assessment) reason_codes.push("DIAGNOSTIC_DISABLED_IN_PRODUCTION");
  const materialText = mappedConflict
    ? "Сведенията от сондажите изискват проверка за картографирано геоложко противоречие."
    : localMaterials.length
      ? `В референтните сондажни колонки се повтарят ${localMaterials.slice(0, 5).map(x=>x.label_bg).join(", ")}. Това са наблюдавани регионални материали, а не доказани пластове на избраната координата.`
      : researchOnly
        ? "Налични са пространствени изследователски геоложки сведения, но те не доказват пластове по метри под избраната точка."
        : "Използва се наличният национален регионален геоложки анализ.";
  return {
    policy: "NATIONAL_APPLICABILITY_V3" as const,
    material_scope,
    depth_scope,
    material_reference_evidence: localMaterials,
    observed_contact_controls: controls,
    regional_research_matches: spatialMatches,
    reason_codes,
    regional_material_explanation_bg: materialText,
    existing_baseline_site_depth_preserved: existingSiteDepth,
    new_site_depth_intervals_promoted: false as const,
    new_site_materials_promoted: false as const,
    geologic_conflict_is_not_clearance: true as const,
  };
}
