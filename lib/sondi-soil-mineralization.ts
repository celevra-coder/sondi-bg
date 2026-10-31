// SONDI_78DY_SOIL_MINERALIZATION
// Only existing shallow or mapped surface evidence is used.
// Chemical/electrical/magnetic mineralization is not inferred
// from generic lithology names.

export type SoilSummary = {
  kind: string;
  description: string;
  mineralization: string;
  basis: string;
};

export function getSondiSoilSummary(
  mappedSurface: string | null | undefined,
  documentedShallowMaterials: string[]
): SoilSummary {
  const shallow = documentedShallowMaterials
    .filter(x => typeof x === "string" && x.trim().length > 0);

  const mapped =
    typeof mappedSurface === "string" &&
    !/друг тип|неопредел|неизвест|няма данни/iu.test(mappedSurface)
      ? mappedSurface.trim()
      : "";

  const evidence = shallow.length > 0
    ? shallow.join("; ")
    : mapped;

  const text = evidence.toLocaleLowerCase("bg-BG");
  const has = (pattern: RegExp) => pattern.test(text);

  const clay = has(/глин/iu);
  const sand = has(/пясък|пясъц|песъчлив|песъчлива/iu);
  const gravel = has(/чакъл|чакълест/iu);
  const loess = has(/льос/iu);
  const hardRock = has(
    /гранит|гнайс|кварцит|варовик|варовици|доломит|шист|скална основа/iu
  );

  let kind = "Неопределен по наличните данни";
  let description =
    "Наличните сведения не позволяват надеждно " +
    "определяне на вида на повърхностната почва.";

  if (loess) {
    kind = "Льосови и праховити материали";
    description =
      "Посочени са фини праховити наслаги. " +
      "Точният почвен състав и влажността не са измерени.";
  } else if (clay && (sand || gravel)) {
    kind = "Смесени глинести и песъчливо-чакълести материали";
    description =
      "Наличните сведения показват смесен състав " +
      "от фини и по-едри частици. " +
      "Съотношението между тях може да се изменя.";
  } else if (clay) {
    kind = "Предимно глинести материали";
    description =
      "Описани са фини глинести материали, " +
      "чиято плътност и влажност могат да се изменят.";
  } else if (sand || gravel) {
    kind = sand && gravel
      ? "Песъчливо-чакълести материали"
      : sand ? "Предимно песъчливи материали"
             : "Предимно чакълести материали";
    description =
      "Описани са зърнести материали. " +
      "Пропускливостта им зависи от състава, " +
      "уплътняването и влажността.";
  } else if (hardRock) {
    kind = "Скалиста геоложка основа";
    description =
      "Картографирана или документирана е скална основа. " +
      "Това не определя автоматично вида и дебелината " +
      "на почвения слой върху нея.";
  }

  return {
    kind,
    description,
    mineralization: "Неопределена по наличните данни",
    basis: shallow.length > 0
      ? "Документирани най-плитки сондажни материали"
      : mapped
        ? "Картографирана повърхностна геоложка характеристика"
        : "Няма достатъчно надеждни приповърхностни сведения"
  };
}


// SONDI_78EA_REGIONAL_SOIL_CONTEXT
// Regional descriptions can provide context for near-surface deposits,
// but do not prove a precise soil type at the selected coordinates.
export function getSondiSoilSummaryWithRegionalContext(
  mappedSurface: string | null | undefined,
  documentedShallowMaterials: string[],
  regionalParagraphs: string[]
): SoilSummary {
  const direct = getSondiSoilSummary(
    mappedSurface,
    documentedShallowMaterials
  );

  if (direct.kind !== "Неопределен по наличните данни") {
    return direct;
  }

  const contextualText = regionalParagraphs
    .filter(p => typeof p === "string")
    .join(" ")
    .toLocaleLowerCase("bg-BG");

  const quaternary =
    /кватернерн|четвъртичн|алувиалн|делувиалн|пролувиалн/iu
      .test(contextualText);

  if (quaternary) {
    return {
      kind: "Регионални приповърхностни наслаги",
      description:
        "В събраните геоложки сведения за района са " +
        "документирани сравнително млади наслаги. " +
        "Точният им състав при избраните координати " +
        "не е потвърден. Само от тези данни не може " +
        "да се определи дали местната почва е " +
        "глинеста, песъчлива или чакълеста.",
      mineralization: "Неопределена по наличните данни",
      basis:
        "Вече събрани регионални сведения за " +
        "кватернерни и приповърхностни отложения"
    };
  }

  return direct;
}
