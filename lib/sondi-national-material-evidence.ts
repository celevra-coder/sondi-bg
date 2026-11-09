import "server-only";
import type { NationalDepthResult } from "./sondi-national-depth-engine";

type Evidence = NationalDepthResult["evidence"];

type SourceMaterial = {
  borehole_id: string;
  coordinate_status: string | null;
  distance_km: number | null;
  material: string;
  families: string[];
  interpretation: "REFERENCE_OBSERVATION_ONLY";
};

/**
 * Independent descriptive lithological-evidence layer. Read-only and
 * intentionally incapable of authorizing a target-site depth interval.
 * It never treats missing surface-map coverage as a geological match.
 */
const patterns: Array<[string, RegExp]> = [
  ["Гнайсови скали", /гнайс/iu],
  ["Амфиболити", /амфиболит/iu],
  ["Гранитни и гранодиоритни скали", /гранит|гранодиорит/iu],
  ["Пясъчници", /пясъчник/iu],
  ["Конгломерати", /конгломерат/iu],
  ["Аргилити", /аргилит/iu],
  ["Мергели", /мергел/iu],
  ["Варовици", /варовик/iu],
  ["Глини", /глин/iu],
  ["Пясъци", /пясък|пясъц/iu],
  ["Чакъли и гравий", /чакъл|грави/iu],
  ["Алувиални и делувиални наслаги", /алуви|делуви/iu],
];

export function assessNationalMaterialEvidence(evidence: Evidence, depthM: number) {
  const references = new Map<string, SourceMaterial[]>();
  let ambiguous_or_incomplete_records = 0;
  for (const item of evidence) {
    if (item.type !== "BOREHOLE" || item.site_relation !== "NEARBY_REFERENCE" ||
        !item.borehole_id || !item.interval_material_bg ||
        typeof item.interval_from_m !== "number" ||
        typeof item.interval_to_m !== "number" ||
        item.interval_from_m > depthM || item.interval_to_m <= depthM) continue;

    const id = item.borehole_id;
    const reliable = item.interval_status == null &&
      (item.interval_evidence_level === "borehole_exact" ||
       item.interval_evidence_level === "documented_borehole_log" ||
       item.interval_evidence_level === "regional_documented_interval" ||
       item.interval_evidence_level === "borehole_exact_partial_column");
    if (!reliable) { ambiguous_or_incomplete_records++; continue; }
    const families = patterns.filter(([, re]) => re.test(item.interval_material_bg!))
      .map(([name]) => name);
    const row: SourceMaterial = {
      borehole_id: id,
      coordinate_status: item.coordinate_status ?? null,
      distance_km: item.distance_km ?? null,
      material: item.interval_material_bg,
      families,
      interpretation: "REFERENCE_OBSERVATION_ONLY",
    };
    const current = references.get(id) ?? [];
    current.push(row);
    references.set(id, current);
  }

  const boreholes = [...references].map(([id, rows]) => ({
    borehole_id: id,
    coordinate_status: rows[0].coordinate_status,
    distance_km: rows[0].distance_km,
    source_materials: [...new Set(rows.map(row => row.material))],
    material_families: [...new Set(rows.flatMap(row => row.families))],
    has_conflicting_overlapping_intervals: new Set(rows.map(row => row.material)).size > 1,
  })).sort((a,b) => (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity) ||
    a.borehole_id.localeCompare(b.borehole_id));

  const families = [...new Set(boreholes.flatMap(b => b.material_families))]
    .map(name => ({
      family: name,
      supporting_boreholes: boreholes.filter(b => !b.has_conflicting_overlapping_intervals && b.material_families.includes(name))
        .map(b => b.borehole_id),
    }))
    .sort((a,b) => b.supporting_boreholes.length - a.supporting_boreholes.length || a.family.localeCompare(b.family, "bg"));

  return {
    depth_m: depthM,
    reference_borehole_count: boreholes.length,
    ambiguous_or_incomplete_records,
    boreholes,
    observed_material_families: families,
    target_site_material_approved: false as const,
    target_site_depth_interval_approved: false as const,
    note: "Материалите са документирани в референтни сондажи. Този резултат не доказва същите пластове или граници под избраната точка.",
  };
}
