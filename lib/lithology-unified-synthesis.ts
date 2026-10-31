import type { LithologyProfile } from "./lithology-profile";
import { getNationalBoreholeIndex } from "./sondi-national-borehole-index";
import type { LithologySynthesis } from "./lithology-synthesis";

export type UnifiedEvidenceKind =
  | "DIRECT_BOREHOLE"
  | "BOREHOLE_PROJECTION"
  | "SPATIAL_MODEL"
  | "REGIONAL_CONTEXT"
  | "UNRESOLVED";

export type UnifiedLithologyPoint = {
  depth_m: number;
  material: string | null;
  evidence_kind: UnifiedEvidenceKind;
  confidence: string | null;
  alternatives: string[];
  borehole_ids: string[];
  source_ids: string[];
  limitations: string[];
};

export function buildUnifiedLithology(
  profile: LithologyProfile,
  synthesis: LithologySynthesis,
  depths: number[] = profile.target_national_depth_model.map(item => item.target.depth_m)
): UnifiedLithologyPoint[] {
  return depths.map((depth) => {
    // SONDI_DOCUMENTED_EXACT_COORDINATE_V1
    // Use the documented interval ONLY at its borehole coordinates.
    // Never turn nearby evidence into a measured local column.
    const exactIntervals = getNationalBoreholeIndex()
      .filter(hole =>
        hole.origin === "NATIONAL" &&
        hole.coordinate_status === "OFFICIAL_EXACT" &&
        hole.latitude !== null &&
        hole.longitude !== null &&
        Math.abs(hole.latitude - profile.target.latitude) <= 0.000001 &&
        Math.abs(hole.longitude - profile.target.longitude) <= 0.000001
      )
      .flatMap(hole =>
        hole.intervals
          .filter(interval =>
            interval.from_m !== null &&
            interval.to_m !== null &&
            interval.from_m <= depth &&
            depth < interval.to_m &&
            !interval.interval_status &&
            (
              interval.evidence_level === "borehole_exact" ||
              interval.evidence_level === "documented_borehole_log"
            ) &&
            interval.material_bg.trim().length > 0
          )
          .map(interval => ({ hole, interval }))
      );

    if (exactIntervals.length > 0) {
      const materials = [...new Set(
        exactIntervals.map(item => item.interval.material_bg.trim())
      )];

      const ids = [...new Set(
        exactIntervals.map(item => item.hole.id)
      )];

      const sources = [...new Set(
        exactIntervals.flatMap(item => item.interval.source_ids)
      )];

      const unambiguous = materials.length === 1;

      return {
        depth_m: depth,
        material: unambiguous ? materials[0] : null,
        evidence_kind: unambiguous
          ? "DIRECT_BOREHOLE" as const
          : "UNRESOLVED" as const,
        confidence: unambiguous
          ? "DOCUMENTED"
          : "UNRESOLVED",
        alternatives: unambiguous ? [] : materials,
        borehole_ids: ids,
        source_ids: sources,
        limitations: unambiguous
          ? [
              "Документиран литоложки интервал на същите сондажни координати.",
              "Не се пренася автоматично към съседни имоти."
            ]
          : [
              "Противоречащи си документирани материали на същите координати.",
              "Няма автоматично избран материал."
            ]
      };
    }

    const direct = profile.direct_borehole_evidence.flatMap(
      (borehole) =>
        borehole.lithology
          .filter(
            (interval) =>
              depth >= Number(interval.depth_from_m) &&
              depth < Number(interval.depth_to_m)
          )
          .map((interval) => ({ borehole, interval }))
    );

    if (direct.length > 0) {
      const materials = direct
        .map(item => item.interval.expected_material_bg)
        .filter((value): value is string => Boolean(value));

      return {
        depth_m: depth,
        material: materials[0] || null,
        evidence_kind: "BOREHOLE_PROJECTION" as const,
        confidence: "DOCUMENTED_NEAR_TARGET_NOT_EXACT",
        alternatives: [...new Set(materials.slice(1))],
        borehole_ids: [
          ...new Set(direct.map(item => item.borehole.borehole_id))
        ],
        source_ids: [],
        limitations: [
          "???????????? ?????? ? ?????????????? ???????.",
          "?????????? ???????? ?? ??????? ??????????? ?????? ????????? ????? ??? ????????? ?????."
        ]
      };
    }

    // SONDI_NATIONAL_OUTPUT_BRIDGE_V1
    // The national engine has already evaluated the evidence.
    // Only its depth-specific results can supply a material.
    // GLiM and regional context never become a depth interval.
    const national = profile.target_national_depth_model.find(
      (item) => item.target.depth_m === depth
    );

    if (
      national?.engine === "NATIONAL_REGIONAL" &&
      national.status === "CONDITIONAL" &&
      national.probable_lithology &&
      (
        national.evidence_tier === "DOCUMENTED_BOREHOLE" ||
        national.evidence_tier === "GEOLOGICAL_CORRELATION"
      )
    ) {
      const documented =
        national.evidence_tier === "DOCUMENTED_BOREHOLE";

      const referenceIds = documented
        ? national.evidence
            .filter((item) =>
              item.type === "BOREHOLE" &&
              item.site_relation === "COLOCATED_COORDINATES" &&
              typeof item.borehole_id === "string"
            )
            .map((item) => item.borehole_id!)
        : [];

      return {
        depth_m: depth,
        material: national.probable_lithology,
        evidence_kind: documented
          ? "DIRECT_BOREHOLE" as const
          : "SPATIAL_MODEL" as const,
        confidence: national.confidence,
        alternatives: national.alternative_lithologies,
        borehole_ids: [...new Set(referenceIds)],
        source_ids: national.source_ids,
        limitations: documented
          ? [
              "Документирана литология на референтен сондаж.",
              "Важи за документирания интервал и координатите на сондажа."
            ]
          : national.interpretation_scope ===
              "NEARBY_BOREHOLE_ANALOG_UNVERIFIED"
            ? [
                "Условна прогноза по близък сондажен аналог.",
                "Геоложката съвместимост с избраната точка не е потвърдена.",
                "Ниска увереност. Не е доказан пласт под избраните координати."
              ]
            : [
                "Условна национална геоложка корелация.",
                "Не е пряко измерен пласт под избраната точка."
              ]
      };
    }

    const projected = synthesis.depth_profile.find(
      (item) =>
        item.depth_m === depth &&
        item.source === "target_projection" &&
        item.comparison_family !== null
    );

    const spatial = profile.target_spatial_depth_model.find(
      (item) => item.target.depth_m === depth
    );

    const lithology = spatial?.depth_lithology;

    const structuralLimitations = spatial
      ? [
          ...(spatial.depth_model.structural_guards || []),
          ...(spatial.depth_model.limitations || []),
          ...(spatial.scientific_guards || []),
        ]
      : [];

    const spatialMaterials = [
      ...(lithology?.probable_lithology
        ? [lithology.probable_lithology]
        : []),
      ...(lithology?.alternative_lithologies || []),
    ];

    const spatialAlternatives = [
      ...new Set(spatialMaterials.filter(Boolean)),
    ];

    if (
      spatial?.status === "OK" &&
      lithology?.status === "OK" &&
      lithology.probable_lithology
    ) {
      return {
        depth_m: depth,
        material: lithology.probable_lithology,
        evidence_kind: "SPATIAL_MODEL" as const,
        confidence: lithology.confidence,
        alternatives: lithology.alternative_lithologies,
        borehole_ids: [],
        source_ids: lithology.source_ids,
        limitations: [
          "Геоложка интерпретация, не доказан сондажен интервал.",
          ...lithology.limitations,
          ...structuralLimitations,
        ],
      };
    }

    // Unverified analogues are evidence, not a confirmed
    // depth-specific material at the selected coordinates.
    if (projected && spatial?.status !== "OK") {
      return {
        depth_m: depth,
        material: null,
        evidence_kind: "REGIONAL_CONTEXT" as const,
        confidence: null,
        alternatives: spatialAlternatives,
        borehole_ids: projected.analogue_ids,
        source_ids: lithology?.source_ids || [],
        limitations: [
          "Налични са сондажни аналози, но геоложката им приложимост на избраната дълбочина не е потвърдена.",
          "Не се определя конкретен пласт само по близост.",
          ...structuralLimitations,
          ...(lithology?.limitations || []),
        ],
      };
    }

    if (spatial?.status === "OK") {
      return {
        depth_m: depth,
        material: null,
        evidence_kind: "REGIONAL_CONTEXT" as const,
        confidence: null,
        alternatives: lithology?.alternative_lithologies || [],
        borehole_ids: [],
        source_ids: lithology?.source_ids || [],
        limitations: [
          "Наличен е регионален геоложки контекст, но конкретният материал не е определен.",
          "Посочената увереност характеризира регионалния контекст, а не доказан конкретен пласт.",
          ...(lithology?.limitations || []),
          ...structuralLimitations,
        ],
      };
    }

    // SONDI_78AO_NATIONAL_REGIONAL_CONTEXT
    // Only reached after all documented, spatial and projected
    // results have been evaluated. Never infer a local depth contact.
    if (
      national?.engine === "NATIONAL_REGIONAL" &&
      (
        national.alternative_lithologies.length > 0 ||
        (national.regional_sequence_context?.units.length ?? 0) > 0
      )
    ) {
      const sequence = national.regional_sequence_context;
      const sequenceDescription = sequence?.units
        .map(unit =>
          unit.unit + ": " + unit.probable_material
        )
        .join("; ");

      return {
        depth_m: depth,
        material: null,
        evidence_kind: "REGIONAL_CONTEXT" as const,
        confidence: null,
        alternatives: [...new Set(
          national.alternative_lithologies
        )],
        borehole_ids: [],
        source_ids: [...new Set([
          ...national.source_ids,
          ...(sequence?.source_ids ?? [])
        ])],
        limitations: [
          "Регионална геоложка информация, а не установен пласт на посочената дълбочина.",
          ...(sequenceDescription
            ? ["Документирана регионална последователност: " + sequenceDescription + "."]
            : []),
          ...(national.alternative_lithologies.length > 0
            ? ["Възможни регионални геоложки материали; не е определено кой се намира под избраната точка."]
            : []),
          "Точните граници между пластовете не са потвърдени за избраните координати."
        ]
      };
    }

    return {
      depth_m: depth,
      material: null,
      evidence_kind: "UNRESOLVED" as const,
      confidence: null,
      alternatives: [],
      borehole_ids: [],
      source_ids: [],
      limitations: [
        "Няма достатъчно приложими литоложки доказателства за тази дълбочина.",
      ],
    };
  });
}
