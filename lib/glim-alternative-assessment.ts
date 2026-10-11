import type { GlimSurfaceResult } from "./glim-surface";

export type GlimAlternativeAssessment = {
  compatible: string[];
  other: string[];
  surfaceMaterial: string;
};

export function assessGlimAlternatives(
  surface: GlimSurfaceResult,
  alternatives: readonly string[]
): GlimAlternativeAssessment | null {
  if (
    surface.status !== "OK" ||
    !surface.lithology_code ||
    !surface.material_bg ||
    alternatives.length === 0
  ) {
    return null;
  }

  const family = surface.lithology_code.slice(0, 2);

  // GLiM identifies a broad surface rock category,
  // not subsurface contacts or formation boundaries.
  // Similarity is descriptive, not a probability ranking.
  if (family !== "sc" && family !== "ss") {
    return null;
  }

  const compatible: string[] = [];
  const other: string[] = [];

  for (const alternative of alternatives) {
    const carbonate =
      /limestone|carbonate|ургон|варовик|карбонат/i.test(alternative);

    const siliciclastic =
      /sandstone|sand|claystone|clay|siltstone|пясъчник|пясък|глин|алевролит/i
        .test(alternative);

    // Marl is carbonate-clay mixed rock: do not automatically
    // equate it with pure carbonate surface lithology.
    const marl = /marl|мергел/i.test(alternative);

    const similar =
      family === "sc"
        ? carbonate && !marl
        : siliciclastic && !carbonate && !marl;

    if (similar) compatible.push(alternative);
    else other.push(alternative);
  }

  return {
    compatible,
    other,
    surfaceMaterial: surface.material_bg,
  };
}
