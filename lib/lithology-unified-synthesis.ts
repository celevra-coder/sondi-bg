import type { LithologyProfile } from "./lithology-profile";
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
  depths: number[] = [20, 50, 100, 150, 200, 300, 500]
): UnifiedLithologyPoint[] {
  return depths.map((depth) => {
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

    if (projected && spatial?.status !== "OK") {
      return {
        depth_m: depth,
        material: String(projected.comparison_family),
        evidence_kind: "BOREHOLE_PROJECTION" as const,
        confidence: projected.confidence,
        alternatives: spatialAlternatives.filter(
          (value) => value !== String(projected.comparison_family)
        ),
        borehole_ids: projected.analogue_ids,
        source_ids: lithology?.source_ids || [],
        limitations: [
          "Прогноза от сондажни аналози, не пряко наблюдение.",
          "Геоложката съвместимост с пространствения модел още не е потвърдена.",
          ...(spatialAlternatives.length > 0
            ? ["Показани са и алтернативите от пространствения модел; съвпадението им със сондажната прогноза не е доказано."]
            : []),
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
