import "server-only";

import type { LithologyAnalogue, LithologyProfile } from "./lithology-profile";

export type LithologyFamily =
  | "UNCONSOLIDATED"
  | "SANDSTONE"
  | "SANDSTONE_WITH_INTERBEDS"
  | "CONGLOMERATIC_SEDIMENT"
  | "CONGLOMERATE"
  | "FINE_SEDIMENT"
  | "GNEISS"
  | "AMPHIBOLITE_GNEISS"
  | "AMPHIBOLITE"
  | "SCHIST"
  | "GRANITIC"
  | "DIORITIC"
  | "CRYSTALLINE_UNSPECIFIED"
  | "MIXED_SEDIMENTARY"
  | "MIXED_CRYSTALLINE"
  | "OTHER";

export function normalizeLithologyFamily(
  material: string | null | undefined
): LithologyFamily {
  const t = (material || "").toLocaleLowerCase("bg-BG");

  const has = (...terms: string[]) =>
    terms.some(term => t.includes(term));

  if (
    has("алувиал", "делувиал", "пролувиал", "кватернер") ||
    (has("чакъл", "чакъли", "пясъци") &&
      !has("пясъчник", "пясъчници", "конгломерат", "конгломерати"))
  ) {
    return "UNCONSOLIDATED";
  }

  const sandstone = has("пясъчник", "пясъчници");
  const conglomerate = has("конгломерат", "конгломерати");
  const interbeds = has(
    "прослойка",
    "прослойки",
    "редуващи",
    "редуване"
  );

  /*
   * Sedimentary rock/matrix terminology takes precedence over
   * clast composition. Gneiss/granite fragments inside a
   * conglomerate do not make the interval crystalline basement.
   */
  if (sandstone && conglomerate) {
    const sandstoneIndex = t.search(/пясъчниц?/);
    const conglomerateIndex = t.indexOf("конгломерат");

    if (
      sandstoneIndex >= 0 &&
      conglomerateIndex >= 0 &&
      sandstoneIndex < conglomerateIndex
    ) {
      return "SANDSTONE_WITH_INTERBEDS";
    }

    return "CONGLOMERATIC_SEDIMENT";
  }

  if (sandstone) {
    return interbeds
      ? "SANDSTONE_WITH_INTERBEDS"
      : "SANDSTONE";
  }

  if (conglomerate) {
    return "CONGLOMERATE";
  }

  if (has("амфиболитов") && has("гнайс")) {
    return "AMPHIBOLITE_GNEISS";
  }

  if (has("гнайс") && has("амфиболит")) {
    return "MIXED_CRYSTALLINE";
  }

  if (has("гнайс")) return "GNEISS";
  if (has("амфиболит")) return "AMPHIBOLITE";
  if (has("шист")) return "SCHIST";

  if (has("плагиогранит", "гранит")) {
    return "GRANITIC";
  }

  if (has("диорит")) return "DIORITIC";

  if (
    has("кристалинни скали") ||
    has("кристалинна скала")
  ) {
    return "CRYSTALLINE_UNSPECIFIED";
  }

  if (
    has("аргилит", "алевролит", "глина", "глинест")
  ) {
    return "FINE_SEDIMENT";
  }

  return "OTHER";
}

export type LithologyComparisonFamily =
  | "UNCONSOLIDATED"
  | "SANDSTONE_COMPLEX"
  | "CONGLOMERATIC_COMPLEX"
  | "GNEISS"
  | "AMPHIBOLITE_GNEISS"
  | "AMPHIBOLITE"
  | "SCHIST"
  | "GRANITIC"
  | "DIORITIC"
  | "CRYSTALLINE_MIXED"
  | "OTHER";

export type LithologyPattern = {
  comparison_family: LithologyComparisonFamily;
  source_families: LithologyFamily[];
  analogue_count: number;
  analogue_ids: string[];
  support_level: "single_observation" | "supported" | "strongly_supported";
  confidence: "low" | "medium" | "high";
  eligible_for_target_projection: boolean;
  observed_from_m_range: [number, number];
  observed_to_m_range: [number, number];
  target_boundary_is_exact: false;
};

function comparisonFamily(
  family: LithologyFamily
): LithologyComparisonFamily {
  if (
    family === "SANDSTONE" ||
    family === "SANDSTONE_WITH_INTERBEDS" ||
    family === "FINE_SEDIMENT"
  ) return "SANDSTONE_COMPLEX";

  if (
    family === "CONGLOMERATE" ||
    family === "CONGLOMERATIC_SEDIMENT" ||
    family === "MIXED_SEDIMENTARY"
  ) return "CONGLOMERATIC_COMPLEX";

  if (
    family === "MIXED_CRYSTALLINE" ||
    family === "CRYSTALLINE_UNSPECIFIED"
  ) return "CRYSTALLINE_MIXED";

  if (family === "OTHER") return "OTHER";
  return family;
}

function intervalNumber(
  interval: any,
  key: "depth_from_m" | "depth_to_m"
): number | null {
  const value = interval?.[key];
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : null;
}

type PatternObservation = {
  borehole_id: string;
  family: LithologyFamily;
  comparison_family: LithologyComparisonFamily;
  from: number;
  to: number;
};

export function buildLithologyPatterns(
  analogues: LithologyAnalogue[]
): LithologyPattern[] {
  const observations: PatternObservation[] = [];

  for (const analogue of analogues) {
    const local: PatternObservation[] = [];

    for (const interval of analogue.lithology || []) {
      const material =
        (interval as any).expected_material_bg ??
        (interval as any).material_bg ??
        null;

      const family = normalizeLithologyFamily(material);
      if (family === "OTHER") continue;

      const from = intervalNumber(interval, "depth_from_m");
      const to = intervalNumber(interval, "depth_to_m");
      if (from === null || to === null || to <= from) continue;

      local.push({
        borehole_id: analogue.borehole_id,
        family,
        comparison_family: comparisonFamily(family),
        from,
        to,
      });
    }

    /*
     * Consecutive source intervals of the same normalized family inside
     * one borehole represent one local lithological occurrence, not
     * independent analogue observations.
     *
     * Merge only overlapping or exactly touching intervals. Do not bridge
     * real gaps and do not merge merely because comparison_family matches.
     */
    const sortedLocal = local.sort((a, b) =>
      a.from - b.from || a.to - b.to
    );

    const mergedLocal: PatternObservation[] = [];

    for (const item of sortedLocal) {
      const previous = mergedLocal[mergedLocal.length - 1];

      if (
        previous &&
        previous.family === item.family &&
        item.from <= previous.to
      ) {
        previous.to = Math.max(previous.to, item.to);
      } else {
        mergedLocal.push({ ...item });
      }
    }

    observations.push(...mergedLocal);
  }

  const groups = new Map<
    LithologyComparisonFamily,
    PatternObservation[]
  >();

  for (const obs of observations) {
    const list = groups.get(obs.comparison_family) || [];
    list.push(obs);
    groups.set(obs.comparison_family, list);
  }

  const result: LithologyPattern[] = [];

  for (const [family, items] of groups) {
    /*
     * Same rock family may occur at unrelated shallow/deep positions.
     * Cluster by overlapping or near-overlapping depth envelopes rather
     * than merging every occurrence into one artificial target layer.
     */
    const sorted = [...items].sort((a, b) => a.from - b.from);
    const clusters: PatternObservation[][] = [];

    for (const item of sorted) {
      let best: PatternObservation[] | null = null;

      for (const cluster of clusters) {
        /*
         * Use the central positional tendency of the cluster rather than
         * its full accumulated envelope. This prevents transitive bridging
         * between unrelated shallow and deep occurrences of the same family.
         */
        const froms = cluster.map(x => x.from).sort((a, b) => a - b);
        const tos = cluster.map(x => x.to).sort((a, b) => a - b);

        const median = (values: number[]) => {
          const mid = Math.floor(values.length / 2);
          return values.length % 2
            ? values[mid]
            : (values[mid - 1] + values[mid]) / 2;
        };

        const cFrom = median(froms);
        const cTo = median(tos);

        const representativeThickness = Math.max(0, cTo - cFrom);
        const tolerance = Math.max(
          10,
          Math.min(30, representativeThickness * 0.25)
        );

        if (
          item.from <= cTo + tolerance &&
          item.to >= cFrom - tolerance
        ) {
          best = cluster;
          break;
        }
      }

      if (best) best.push(item);
      else clusters.push([item]);
    }

    for (const cluster of clusters) {
      const ids = [...new Set(cluster.map(x => x.borehole_id))];
      const sourceFamilies = [
        ...new Set(cluster.map(x => x.family)),
      ];

      result.push({
        comparison_family: family,
        source_families: sourceFamilies,
        analogue_count: ids.length,
        analogue_ids: ids,
        support_level: ids.length >= 3 ? "strongly_supported" : ids.length >= 2 ? "supported" : "single_observation",
        confidence: ids.length >= 3 ? "high" : ids.length >= 2 ? "medium" : "low",
        eligible_for_target_projection: true,
        observed_from_m_range: [
          Math.min(...cluster.map(x => x.from)),
          Math.max(...cluster.map(x => x.from)),
        ],
        observed_to_m_range: [
          Math.min(...cluster.map(x => x.to)),
          Math.max(...cluster.map(x => x.to)),
        ],
        target_boundary_is_exact: false,
      });
    }
  }

  return result.sort((a, b) =>
    b.analogue_count - a.analogue_count ||
    a.observed_from_m_range[0] - b.observed_from_m_range[0]
  );
}
export type LithologyEvidenceLevel =
  | "DIRECT"
  | "STRONG_ANALOGUE_EVIDENCE"
  | "MODERATE_ANALOGUE_EVIDENCE"
  | "INSUFFICIENT_EVIDENCE";

export type TargetProbableLithologyInterval = {
  comparison_family: LithologyComparisonFamily;
  source_families: LithologyFamily[];
  probable_from_m_range: [number, number];
  probable_to_m_range: [number, number];
  confidence: "low" | "medium" | "high";
  support_level: "single_observation" | "supported" | "strongly_supported";
  analogue_count: number;
  analogue_ids: string[];
  interpretation_basis: "analogue_projection";
  target_boundary_is_exact: false;
  target_lithology_is_observed: false;
  interpretation_role: "sequence" | "competing" | "single_observation";
  competing_with_families: LithologyComparisonFamily[];
};

export type LithologyDepthProfilePoint = {
  depth_m: number;
  comparison_family: LithologyComparisonFamily | null;
  source_families: LithologyFamily[];
  confidence: "low" | "medium" | "high" | null;
  analogue_count: number;
  analogue_ids: string[];
  interpretation_role:
    | "sequence"
    | "competing"
    | "single_observation"
    | null;
  competing_with_families: LithologyComparisonFamily[];
  source: "target_projection" | "no_projection";
};

export type LithologySynthesis = {
  evidence_level: LithologyEvidenceLevel;
  direct_borehole_ids: string[];
  primary_analogue_ids: string[];
  supporting_analogue_ids: string[];
  interpretation_allowed: boolean;
  observed_lithology_is_not_target_lithology: true;
  regional_groundwater_context_is_not_depth_prediction: true;
  fracture_is_not_automatic_inflow: true;
  filter_is_not_automatic_inflow: true;
  notes_bg: string[];
  lithology_patterns: LithologyPattern[];
  target_probable_lithology_column: TargetProbableLithologyInterval[];
  depth_profile: LithologyDepthProfilePoint[];
};

function buildTargetProbableLithologyColumn(
  patterns: LithologyPattern[],
  evidenceLevel: LithologyEvidenceLevel
): TargetProbableLithologyInterval[] {
  if (
    evidenceLevel === "DIRECT" ||
    evidenceLevel === "INSUFFICIENT_EVIDENCE"
  ) {
    return [];
  }

  const base = patterns
    .filter(pattern => pattern.eligible_for_target_projection)
    .map(pattern => ({
      comparison_family: pattern.comparison_family,
      source_families: [...pattern.source_families],
      probable_from_m_range: [
        ...pattern.observed_from_m_range,
      ] as [number, number],
      probable_to_m_range: [
        ...pattern.observed_to_m_range,
      ] as [number, number],
      confidence: pattern.confidence,
      support_level: pattern.support_level,
      analogue_count: pattern.analogue_count,
      analogue_ids: [...pattern.analogue_ids],
      interpretation_basis: "analogue_projection" as const,
      target_boundary_is_exact: false as const,
      target_lithology_is_observed: false as const,
    }));

  /*
   * Target depth ranges express uncertainty in analogue boundaries.
   * Normal neighbouring layers may therefore touch or slightly overlap.
   *
   * Treat two different families as genuinely competing only when their
   * representative intervals have substantial overlap, not merely a
   * shared uncertain boundary.
   */
  const representativeInterval = (row: typeof base[number]) => {
    const from =
      (row.probable_from_m_range[0] +
        row.probable_from_m_range[1]) / 2;

    const to =
      (row.probable_to_m_range[0] +
        row.probable_to_m_range[1]) / 2;

    return { from, to };
  };

  const materiallyOverlaps = (
    a: typeof base[number],
    b: typeof base[number]
  ) => {
    if (a.comparison_family === b.comparison_family) {
      return false;
    }

    const ra = representativeInterval(a);
    const rb = representativeInterval(b);

    const overlap =
      Math.min(ra.to, rb.to) -
      Math.max(ra.from, rb.from);

    if (overlap <= 0) {
      return false;
    }

    const aThickness = Math.max(0, ra.to - ra.from);
    const bThickness = Math.max(0, rb.to - rb.from);
    const shorter = Math.min(aThickness, bThickness);

    if (shorter <= 0) {
      return false;
    }

    /*
     * Require both an absolute overlap (>2 m) and at least 25% of the
     * shorter representative interval. This prevents uncertain adjacent
     * boundaries from being mislabeled as competing lithologies.
     */
    return overlap > 2 && overlap / shorter >= 0.25;
  };

  return base
    .map(row => {
      if (row.analogue_count === 1) {
        return {
          ...row,
          interpretation_role: "single_observation" as const,
          competing_with_families: [],
        };
      }

      const competitors = base.filter(other =>
        other !== row &&
        other.analogue_count >= 2 &&
        materiallyOverlaps(row, other)
      );

      return {
        ...row,
        interpretation_role:
          competitors.length > 0
            ? "competing" as const
            : "sequence" as const,
        competing_with_families: [
          ...new Set(
            competitors.map(other => other.comparison_family)
          ),
        ],
      };
    })
    .sort((a, b) => {
      const aFrom =
        (a.probable_from_m_range[0] +
          a.probable_from_m_range[1]) / 2;

      const bFrom =
        (b.probable_from_m_range[0] +
          b.probable_from_m_range[1]) / 2;

      return aFrom - bFrom;
    });
}

function buildLithologyDepthProfile(
  column: TargetProbableLithologyInterval[],
  depths: number[] = [20, 50, 100, 150, 200, 300]
): LithologyDepthProfilePoint[] {
  const confidenceRank = {
    low: 1,
    medium: 2,
    high: 3,
  } as const;

  const roleRank = {
    single_observation: 1,
    competing: 2,
    sequence: 3,
  } as const;

  const representativeInterval = (
    row: TargetProbableLithologyInterval
  ) => ({
    from:
      (row.probable_from_m_range[0] +
        row.probable_from_m_range[1]) / 2,
    to:
      (row.probable_to_m_range[0] +
        row.probable_to_m_range[1]) / 2,
  });

  return depths.map(depth => {
    const candidates = column
      .filter(row => {
        const envelopeFrom = row.probable_from_m_range[0];
        const envelopeTo = row.probable_to_m_range[1];
        return depth >= envelopeFrom && depth <= envelopeTo;
      })
      .sort((a, b) => {
        return (
          confidenceRank[b.confidence] -
            confidenceRank[a.confidence] ||
          b.analogue_count - a.analogue_count ||
          roleRank[b.interpretation_role] -
            roleRank[a.interpretation_role] ||
          (
            representativeInterval(a).to -
            representativeInterval(a).from
          ) -
          (
            representativeInterval(b).to -
            representativeInterval(b).from
          )
        );
      });

    const best = candidates[0];

    if (!best) {
      return {
        depth_m: depth,
        comparison_family: null,
        source_families: [],
        confidence: null,
        analogue_count: 0,
        analogue_ids: [],
        interpretation_role: null,
        competing_with_families: [],
        source: "no_projection" as const,
      };
    }

    return {
      depth_m: depth,
      comparison_family: best.comparison_family,
      source_families: [...best.source_families],
      confidence: best.confidence,
      analogue_count: best.analogue_count,
      analogue_ids: [...best.analogue_ids],
      interpretation_role: best.interpretation_role,
      competing_with_families: [
        ...best.competing_with_families,
      ],
      source: "target_projection" as const,
    };
  });
}

function usableExactAnalogue(a: LithologyAnalogue): boolean {
  return (
    (a.coordinate_quality === "exact" || a.coordinate_quality === "documented") &&
    a.distance_km !== null &&
    a.distance_km <= 15 &&
    typeof a.analogue_score === "number"
  );
}

export function synthesizeLithologyEvidence(
  profile: LithologyProfile
): LithologySynthesis {
  const direct = Array.isArray(profile.direct_borehole_evidence)
    ? profile.direct_borehole_evidence
    : [];

  const exact = profile.exact_coordinate_analogues
    .filter(usableExactAnalogue)
    .filter(a => !direct.some(d => d.borehole_id === a.borehole_id));

  const strong = exact.filter(a =>
    a.distance_km !== null &&
    a.distance_km <= 5 &&
    (a.analogue_score ?? -Infinity) >= 60
  );

  const moderate = exact.filter(a =>
    a.distance_km !== null &&
    a.distance_km <= 15 &&
    (a.analogue_score ?? -Infinity) >= 25
  );

  let evidenceLevel: LithologyEvidenceLevel;

  if (direct.length > 0) {
    evidenceLevel = "DIRECT";
  } else if (strong.length >= 2) {
    evidenceLevel = "STRONG_ANALOGUE_EVIDENCE";
  } else if (strong.length >= 1 || moderate.length >= 1) {
    evidenceLevel = "MODERATE_ANALOGUE_EVIDENCE";
  } else {
    evidenceLevel = "INSUFFICIENT_EVIDENCE";
  }

  const primary =
    evidenceLevel === "STRONG_ANALOGUE_EVIDENCE"
      ? strong.slice(0, 4)
      : evidenceLevel === "MODERATE_ANALOGUE_EVIDENCE"
        ? (strong.length ? strong : moderate).slice(0, 3)
        : [];

  const supporting = exact
    .filter(a => (a.analogue_score ?? -Infinity) >= 25)
    .filter(a => !primary.some(p => p.borehole_id === a.borehole_id))
    .slice(0, 4);

  const patternAnalogues = evidenceLevel === "DIRECT" ? [] : primary;
  const lithologyPatterns = buildLithologyPatterns(patternAnalogues);
  const targetProbableLithologyColumn =
    buildTargetProbableLithologyColumn(
      lithologyPatterns,
      evidenceLevel
    );

  const depthProfile =
    buildLithologyDepthProfile(
      targetProbableLithologyColumn
    );

  const notes: string[] = [];

  if (direct.length > 0) {
    notes.push("В избраната точка има документирани сондажни данни. Те се третират като пряко наблюдение, а не като прогнозна аналогия.");
  }

  if (evidenceLevel === "STRONG_ANALOGUE_EVIDENCE") {
    notes.push("Налични са поне два силни локални аналога с точни или документирани координати.");
  }

  if (evidenceLevel === "MODERATE_ANALOGUE_EVIDENCE") {
    notes.push("Наличната пространствена аналогия позволява само предпазлива интерпретация на вероятната структура.");
  }

  if (evidenceLevel === "INSUFFICIENT_EVIDENCE") {
    notes.push("Няма достатъчно надеждни пространствени аналози за изграждане на целева литоложка колона.");
  }

  notes.push("Литоложките интервали на аналоговите сондажи са наблюдавани на техните местоположения и не се пренасят автоматично към избраната точка.");
  notes.push("Официалните подземни водни тела се използват само като регионален хидрогеоложки контекст и не определят дълбочина на водоносен хоризонт.");

  return {
    evidence_level: evidenceLevel,
    direct_borehole_ids: direct.map(a => a.borehole_id),
    primary_analogue_ids: primary.map(a => a.borehole_id),
    supporting_analogue_ids: supporting.map(a => a.borehole_id),
    interpretation_allowed: evidenceLevel !== "INSUFFICIENT_EVIDENCE",
    observed_lithology_is_not_target_lithology: true,
    regional_groundwater_context_is_not_depth_prediction: true,
    fracture_is_not_automatic_inflow: true,
    filter_is_not_automatic_inflow: true,
    notes_bg: notes,
    lithology_patterns: lithologyPatterns,
    target_probable_lithology_column: targetProbableLithologyColumn,
    depth_profile: depthProfile,
  };
}
