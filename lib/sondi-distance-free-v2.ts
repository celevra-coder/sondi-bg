import "server-only";
import type { NationalDepthResult } from "./sondi-national-depth-engine";

/**
 * Local-only exploratory *lithological-family* correlation. Never projects
 * source borehole interval boundaries to a target location. No kilometre
 * cutoffs and no mandatory enclosing triangle. Incomparable/unknown mapped
 * units and uncertain fault traces are not proof of continuity.
 */
type Evidence = NationalDepthResult["evidence"];
export type V2DepthDiagnostic = {
  material: string | null;
  source_ids: string[];
  borehole_ids: string[];
  reason: string;
  total_reference_ids: number;
  passed_ids: number;
  unknown_surface_ids: number;
  different_unit_ids: number;
  uncertain_fault_ids: number;
  conflicted_ids: number;
};

const families: Array<[string, RegExp]> = [
  ["SANDSTONE", /пясъчниц/],
  ["CONGLOMERATE", /конгломерат/],
  ["ARGILLITE", /аргилит/],
  ["MARL", /мергел/],
  ["LIMESTONE", /варовик/],
  ["GRANITE", /гранит/],
  ["CLAY", /глин/],
  ["GRAVEL", /чакъл|грави/],
  ["SAND", /пясък|пясъц/],
];
const labels: Record<string, string> = {
  SANDSTONE: "Пясъчници", CONGLOMERATE: "Конгломерати",
  ARGILLITE: "Аргилити", MARL: "Мергели",
  LIMESTONE: "Варовици", GRANITE: "Гранитни скали",
  CLAY: "Глинести материали", GRAVEL: "Чакълести материали",
  SAND: "Пясъчни материали"
};
function simpleFamily(value: string): string | null {
  const text = value.toLocaleLowerCase("bg");
  if (/редуван|алтернац|прослой|включени|късове|с примеси|смесени/.test(text)) {
    return null;
  }
  const found = families.filter(([, re]) => re.test(text));
  return found.length === 1 ? found[0][0] : null;
}

export function resolveNationalDistanceFreeV2(
  evidence: Evidence,
  depthM: number
): V2DepthDiagnostic {
  const empty: V2DepthDiagnostic = {
    material: null, source_ids: [], borehole_ids: [],
    reason: "NO_VALID_REFERENCES", total_reference_ids: 0, passed_ids: 0,
    unknown_surface_ids: 0, different_unit_ids: 0,
    uncertain_fault_ids: 0, conflicted_ids: 0
  };
  if (!Number.isFinite(depthM) || depthM < 0) {
    return { ...empty, reason: "INVALID_DEPTH" };
  }

  const items = evidence.filter(item =>
    item.type === "BOREHOLE" &&
    typeof item.borehole_id === "string" &&
    item.site_relation === "NEARBY_REFERENCE" &&
    typeof item.interval_from_m === "number" &&
    typeof item.interval_to_m === "number" &&
    item.interval_from_m <= depthM && depthM < item.interval_to_m &&
    typeof item.interval_material_bg === "string" &&
    typeof item.distance_km === "number" &&
    item.distance_km > 0.001
  );
  const totalIds = new Set(items.map(item => item.borehole_id!));
  const unknown = new Set<string>();
  const different = new Set<string>();
  const faults = new Set<string>();
  const conflicts = new Set<string>();
  const groups = new Map<string, { family: string; sources: string[]; distance: number }>();

  for (const item of items) {
    const id = item.borehole_id!;
    if (item.coordinate_status !== "OFFICIAL_EXACT" ||
        item.interval_status !== null ||
        !(item.interval_evidence_level === "borehole_exact" ||
          item.interval_evidence_level === "documented_borehole_log" ||
          item.interval_evidence_level === "borehole_exact_partial_column")) {
      conflicts.add(id);
      continue;
    }
    if (item.surface_comparison === "DIFFERENT_MAPPED_UNIT") {
      different.add(id); continue;
    }
    if (item.surface_comparison !== "SAME_MAPPED_UNIT") {
      unknown.add(id); continue;
    }
    if (item.mapped_fault_intersection_count !== 0) {
      faults.add(id); continue;
    }
    const family = simpleFamily(item.interval_material_bg!);
    if (!family) { conflicts.add(id); continue; }
    const current = groups.get(id);
    if (current && current.family !== family) {
      conflicts.add(id); groups.delete(id); continue;
    }
    if (!conflicts.has(id)) {
      groups.set(id, {
        family,
        sources: [...new Set([...(current?.sources ?? []), ...item.source_ids])],
        distance: item.distance_km!
      });
    }
  }
  for (const id of conflicts) groups.delete(id);
  const accepted = [...groups.entries()]
    .sort((a, b) => a[1].distance - b[1].distance || a[0].localeCompare(b[0]));
  const foundation = {
    ...empty,
    total_reference_ids: totalIds.size,
    passed_ids: accepted.length,
    unknown_surface_ids: unknown.size,
    different_unit_ids: different.size,
    uncertain_fault_ids: faults.size,
    conflicted_ids: conflicts.size,
  };
  if (accepted.length < 2) return {
    ...foundation,
    reason: accepted.length === 1 ? "ONLY_ONE_VERIFIED_COMPATIBLE_BOREHOLE" :
      (unknown.size ? "MAPPED_GEOLOGY_UNRESOLVED" :
       faults.size ? "FAULT_CONTINUITY_UNRESOLVED" : "NO_TWO_COMPATIBLE_BOREHOLES")
  };

  // Conflicting families in otherwise applicable logs prevent a prediction;
  // never use voting or a remote majority to conceal a real disagreement.
  const uniqueFamilies = new Set(accepted.map(([, record]) => record.family));
  if (uniqueFamilies.size !== 1) {
    return { ...foundation, reason: "CONFLICTING_LITHOLOGIES" };
  }
  const family = accepted[0][1].family;
  return {
    ...foundation,
    material: labels[family] ?? null,
    source_ids: [...new Set(accepted.flatMap(([, record]) => record.sources))],
    borehole_ids: accepted.map(([id]) => id),
    reason: "TWO_OR_MORE_COMPATIBLE_BOREHOLES"
  };
}
