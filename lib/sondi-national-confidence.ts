import "server-only";

/**
 * National conservative confidence combination.
 * The weaker independent assessment always wins.
 * Neither regional fallback nor lithological description
 * may upgrade confidence on its own.
 */
export type NationalEvidenceConfidence =
  | "VERY_HIGH"
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "UNRESOLVED";

const order: Record<NationalEvidenceConfidence,number> = {
  UNRESOLVED: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  VERY_HIGH: 4
};

export function combineNationalConfidence(
  a: NationalEvidenceConfidence,
  b: NationalEvidenceConfidence
): NationalEvidenceConfidence {
  return order[a] <= order[b] ? a : b;
}
