import "server-only";
import { getNationalBoreholeIndex, type IndexedBorehole, type IndexedInterval } from "./sondi-national-borehole-index";

/**
 * Descriptive, national borehole-to-borehole sequence analysis.
 * A geological sequence observed in reference logs is NOT automatically
 * a predicted sequence at the target. No radius, borehole quota, or
 * depth-cutoff is used to grant site-specific lithology.
 */
const families: ReadonlyArray<readonly [string, RegExp]> = [
  ["gneiss", /гнайс|gneiss/iu],
  ["amphibolite", /амфиболит|amphibolit/iu],
  ["granitoid", /гранит|гранодиорит|granite|granodiorit/iu],
  ["sandstone", /пясъчник|sandstone/iu],
  ["conglomerate", /конгломерат|conglomerate/iu],
  ["argillite", /аргилит|argillite/iu],
  ["marl", /мергел|marl/iu],
  ["limestone", /варовик|limestone/iu],
  ["clay", /глин|clay/iu],
  ["sand", /пясък|пясъц|\bsand\b/iu],
  ["gravel", /чакъл|грави|gravel/iu],
  ["alluvial_deluvial", /алуви|делуви|alluv|delluv/iu],
];

function materialFamilies(material: string): string[] {
  return families.filter(([, re]) => re.test(material)).map(([key]) => key);
}
function haversine(a: number, b: number, c: number, d: number) {
  const rad = Math.PI / 180;
  const y = (c - a) * rad;
  const x = (d - b) * rad;
  const f = Math.sin(y / 2) ** 2 + Math.cos(a * rad) * Math.cos(c * rad) * Math.sin(x / 2) ** 2;
  return 12742 * Math.atan2(Math.sqrt(f), Math.sqrt(Math.max(0, 1 - f)));
}
function validInterval(x: IndexedInterval): boolean {
  return x.from_m !== null && x.to_m !== null && x.to_m > x.from_m &&
    x.interval_status === null && x.material_bg.trim().length > 0 &&
    ["borehole_exact", "documented_borehole_log", "regional_documented_interval", "borehole_exact_partial_column"].includes(x.evidence_level ?? "");
}
function sequence(h: IndexedBorehole) {
  const valid = h.intervals.filter(validInterval).sort((a, b) => (a.from_m! - b.from_m!) || (a.to_m! - b.to_m!));
  const conflicted: Array<[number, number]> = [];
  const gaps: Array<[number, number]> = [];
  for (let i = 1; i < valid.length; i++) {
    const prev = valid[i - 1];
    const cur = valid[i];
    if (cur.from_m! < prev.to_m! && cur.material_bg !== prev.material_bg) {
      conflicted.push([cur.from_m!, Math.min(prev.to_m!, cur.to_m!)]);
    } else if (cur.from_m! > prev.to_m!) {
      gaps.push([prev.to_m!, cur.from_m!]);
    }
  }
  return { valid, conflicted, gaps };
}

export function assessNationalSequenceCorrelation(latitude: number, longitude: number, sampleDepths: number[]) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < 40 || latitude > 45 || longitude < 20 || longitude > 30) {
    throw new Error("INVALID_COORDINATES");
  }
  const all = getNationalBoreholeIndex().filter(h =>
    typeof h.latitude === "number" && typeof h.longitude === "number" && h.intervals.length > 0
  ).map(h => ({ h, distance_km: haversine(latitude, longitude, h.latitude!, h.longitude!), seq: sequence(h) }))
    .sort((a, b) => a.distance_km - b.distance_km || a.h.id.localeCompare(b.h.id));

  // Full evidence set: never silently drop distant references or count them as local.
  const analyzed = all.filter(x => x.seq.valid.length > 0);
  // Descriptive distance discontinuity, NOT geological compatibility or approval.
  // Largest multiplicative break distinguishes strongly clustered logs from farther
  // regional logs. A minimum factor 4 is solely a diagnostic grouping convention;
  // it must never be used to grant/reject depth intervals.
  const breaks = analyzed.slice(1).map((x, j) => ({
    index: j + 1,
    ratio: x.distance_km / Math.max(analyzed[j].distance_km, 0.001),
  }));
  const strongest = breaks.sort((a,b) => b.ratio - a.ratio)[0];
  const localCount = strongest && strongest.ratio >= 4 ? strongest.index : 0;
  const localIds = new Set(analyzed.slice(0, localCount).map(x => x.h.id));
  const boreholes = analyzed.map(({ h, distance_km, seq }) => ({
    borehole_id: h.id,
    diagnostic_group: localIds.has(h.id) ? "LOCAL_DISTANCE_CLUSTER" as const : "OTHER_REFERENCES" as const,
    distance_km: Math.round(distance_km * 1000) / 1000,
    coordinate_status: h.coordinate_status,
    origin: h.origin,
    oblast: h.oblast,
    documented_intervals: seq.valid.map(i => ({
      from_m: i.from_m, to_m: i.to_m, material: i.material_bg,
      families: materialFamilies(i.material_bg),
      source_ids: i.source_ids,
      evidence_level: i.evidence_level,
    })),
    conflicting_overlap_ranges_m: seq.conflicted,
    uncovered_ranges_m: seq.gaps,
  }));
  const depths = [...new Set(sampleDepths.filter(d => Number.isFinite(d) && d >= 0 && d <= 10000))].sort((a,b) => a-b);
  const summarizeAtDepth = (depth_m: number, group: "ALL_REFERENCES" | "LOCAL_DISTANCE_CLUSTER") => {
    const relevant = group === "LOCAL_DISTANCE_CLUSTER"
      ? boreholes.filter(h => h.diagnostic_group === "LOCAL_DISTANCE_CLUSTER") : boreholes;
    const observed = relevant.flatMap(h => {
      const hits = h.documented_intervals.filter(i => i.from_m! <= depth_m && depth_m < i.to_m!);
      const familiesAtDepth = [...new Set(hits.flatMap(i => i.families))];
      const materials = [...new Set(hits.map(i => i.material))];
      return hits.length ? [{ borehole_id: h.borehole_id, distance_km: h.distance_km,
        coordinate_status: h.coordinate_status, families: familiesAtDepth,
        materials, ambiguous_overlap: materials.length > 1 }] : [];
    });
    const unambiguous = observed.filter(o => !o.ambiguous_overlap);
    const counts = [...new Set(unambiguous.flatMap(o => o.families))].map(family => ({
      family, reference_borehole_ids: unambiguous.filter(o => o.families.includes(family)).map(o => o.borehole_id),
    })).sort((a,b) => b.reference_borehole_ids.length - a.reference_borehole_ids.length || a.family.localeCompare(b.family));
    return { reference_log_count: observed.length,
      unambiguous_log_count: unambiguous.length,
      ambiguous_overlap_log_count: observed.length - unambiguous.length,
      family_evidence: counts, reference_observations: observed };
  };
  const samples = depths.map(depth_m => ({
    depth_m,
    ...summarizeAtDepth(depth_m, "ALL_REFERENCES"),
    local_cluster: summarizeAtDepth(depth_m, "LOCAL_DISTANCE_CLUSTER"),
    interpretation: "REFERENCE_LOG_COMPARISON_ONLY" as const,
    target_material_approved: false as const,
    target_depth_interval_approved: false as const,
  }));
  return {
    candidate_total_with_valid_coordinates: all.length,
    analyzed_reference_columns: boreholes.length,
    diagnostic_limit: null,
    results_truncated: false,
    local_distance_cluster_count: localCount,
    local_distance_cluster_boundary_km: localCount > 0 ? {
      last_local_reference_km: Math.round(analyzed[localCount - 1].distance_km * 1000) / 1000,
      first_other_reference_km: analyzed[localCount] ? Math.round(analyzed[localCount].distance_km * 1000) / 1000 : null,
      multiplicative_distance_break: strongest ? Math.round(strongest.ratio * 100) / 100 : null,
    } : null,
    local_group_is_geologically_verified: false as const,
    boreholes,
    samples,
    site_specific_prediction_approved: false as const,
    warning: "Дистанционната група е само диагностична, НЕ доказателство за геоложка непрекъснатост. Сравняват се всички колонки без автоматично разрешение за прогноза.",
  };
}
