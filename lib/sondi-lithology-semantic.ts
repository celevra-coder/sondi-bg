export type LithologySemanticAssessment = {
  material: string;
  category: "PRIMARY" | "INTERBEDDED" | "MIXED" | "CLAST_BEARING" | "TRANSITION" | "REGIONAL" | "UNRESOLVED";
  spatial_material_candidate: boolean;
  modifiers: string[];
};

export function assessLithologySemantic(material: string): LithologySemanticAssessment {
  const original = material.trim();
  const text = original.toLocaleLowerCase("bg-BG");
  const modifiers: string[] = [];

  if (/(жили|жила|пегматитов|аплитов)/iu.test(text))
    modifiers.push("VEINS");
  if (/разлом|тектон|натрош|напукан/iu.test(text))
    modifiers.push("TECTONIC_OR_FRACTURED");
  if (/изветр/iu.test(text))
    modifiers.push("WEATHERING");

  let category: LithologySemanticAssessment["category"] = "PRIMARY";

  if (!original || /^(няма данни|неизвестно|неопределено|[-–—])$/iu.test(text)) {
    category = "UNRESOLVED";
  } else if (/алтернаци|редуван|редуващи|прослойки от|преплитан/iu.test(text)) {
    category = "INTERBEDDED";
  } else if (/валуни|късове от|отломки от|блокове от/iu.test(text)) {
    category = "CLAST_BEARING";
  } else if (/преминава|преход към|до чаклеста|до глинеста/iu.test(text)) {
    category = "TRANSITION";
  } else if (/регионал|различни скали|неуточнени материали/iu.test(text)) {
    category = "REGIONAL";
  } else if (/\b(пясъци и глини|глини и пясъци|пясъци, глини|глини, пясъци|пясъчници и конгломерати|дацити и риодацити)/iu.test(text)) {
    category = "MIXED";
  }

  if (category === "PRIMARY" && text.includes("пясъци и глини")) {
    category = "MIXED";
  }
  return {
    material: original,
    category,
    spatial_material_candidate: category === "PRIMARY",
    modifiers
  };
}

// SONDI_78CI_CONSERVATIVE_EQUIVALENCE
// Conservative equivalence for unmodified, homogeneous,
// explicitly named lithological materials only.
// Mixed, fractured, weathered and transitional descriptions
// are not automatically transferable as the same material.
const simpleMaterialNames: Record<string,string> = {
  "варовик":"варовик",
  "варовици":"варовик",
  "гранит":"гранит",
  "гранити":"гранит",
  "гнайс":"гнайс",
  "гнайси":"гнайс",
  "пясък":"пясък",
  "пясъци":"пясък",
  "глина":"глина",
  "глини":"глина",
  "чакъл":"чакъл",
  "чакъли":"чакъл",
  "мергел":"мергел",
  "мергели":"мергел",
  "доломит":"доломит",
  "доломити":"доломит",
  "пясъчник":"пясъчник",
  "пясъчници":"пясъчник",
  "конгломерат":"конгломерат",
  "конгломерати":"конгломерат",
  "андезит":"андезит",
  "андезити":"андезит",
  "базалт":"базалт",
  "базалти":"базалт",
  "риолит":"риолит",
  "риолити":"риолит"
};

export function getSpatialLithologyKey(
  material: string
): string | null {
  const assessment = assessLithologySemantic(material);

  if (
    !assessment.spatial_material_candidate ||
    assessment.modifiers.length > 0
  ) return null;

  const normalized = material
    .trim()
    .toLocaleLowerCase("bg-BG")
    .replace(/\s+/g," ")
    .replace(/[.]+$/u,"")
    .trim();

  if (!normalized) return null;

  const simple = simpleMaterialNames[normalized];

  // Complex descriptions are kept distinct, not reduced
  // to a guessed lithological family.
  return simple
    ? "simple:" + simple
    : "description:" + normalized;
}
