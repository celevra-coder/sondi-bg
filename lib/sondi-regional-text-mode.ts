
// SONDI_78DA_READER_GEOLOGY
// Presentation-only: use the nationally approved depth
// evidence to explain materials, never to infer new contacts.

type RegionalTextCard = {
  informationType: string;
  paragraphs: string[];
};

function explainMaterials(materials: string[]): string[] {
  const text = materials.join(" ").toLocaleLowerCase("bg-BG");
  const explanations: string[] = [];

  if (/глин/iu.test(text)) {
    explanations.push(
      "Глините са фини земни материали, които обикновено " +
      "пропускат водата по-трудно и могат да създават " +
      "особености при укрепване на сондажния ствол."
    );
  }

  if (/пяс|чакъл|чакълест/iu.test(text)) {
    explanations.push(
      "Пясъците и чакълите са зърнести материали. " +
      "По-едрите и добре свързани порови пространства " +
      "могат да улесняват движението на вода, " +
      "но това не доказва водоносен пласт."
    );
  }

  if (/гранит|гранодиорит|гнайс/iu.test(text)) {
    explanations.push(
      "Гранитите, гранодиоритите и гнайсите са твърди " +
      "скали. При пробиване значение имат здравината " +
      "им и наличието на пукнатини, по които " +
      "при определени условия може да се движи вода."
    );
  }

  if (/варовик|варовиц|доломит/iu.test(text)) {
    explanations.push(
      "Варовиците и доломитите са карбонатни скали. " +
      "На някои места в тях могат да се развиват " +
      "пукнатини и разтворени кухини, но наличието " +
      "им не може да се предполага само по вида скала."
    );
  }

  if (/мергел/iu.test(text)) {
    explanations.push(
      "Мергелите са скали с глинести и карбонатни " +
      "съставки. Тяхната здравина и пропускливост " +
      "зависят от конкретния състав и напуканост."
    );
  }

  return explanations;
}

export function formatRegionalParagraphsForDepthMode(
  card: RegionalTextCard,
  hasDepthEvidence: boolean,
  depthMaterials: string[] = []
): string[] {
  if (
    !hasDepthEvidence ||
    card.informationType !==
      "Автоматичен регионален геоложки анализ"
  ) {
    return card.paragraphs;
  }

  const combined = card.paragraphs.join(" ");
  const result: string[] = [];

  const mapped = combined.match(
    /геоложка единица „([^“]+)“/iu
  );

  if (mapped) {
    const name = mapped[1];

    result.push(
      "Геоложката карта обозначава района с единица „" +
      name + "“. " +
      (/камбрий/iu.test(name)
        ? "Камбрий е название на много стар геоложки период. " +
          "То показва възрастта на картографирания " +
          "геоложки комплекс, а не само по себе си " +
          "конкретен вид скала."
        : "Това означение описва част от геоложкия " +
          "строеж на района и допълва сведенията " +
          "от сондажните проучвания.")
    );
  }

  const hasAlluvial = /алувиал|речн/iu.test(combined);
  const hasDepression = /грабен|депреси/iu.test(combined);

  if (hasAlluvial || hasDepression) {
    const parts: string[] = [];

    if (hasAlluvial) {
      parts.push(
        "речни наноси, образувани от натрупване " +
        "на пясъци, чакъли и други материали"
      );
    }

    if (hasDepression) {
      parts.push(
        "понижени участъци от земната кора, " +
        "които могат да бъдат запълнени " +
        "с различни наслаги"
      );
    }

    result.push(
      "Регионалните проучвания разглеждат и " +
      parts.join(", както и ") + ". " +
      "Тези особености помагат да се разбере " +
      "защо геоложките условия могат да се " +
      "различават между отделните места."
    );
  }

  const explanations = explainMaterials(depthMaterials);

  if (explanations.length > 0) {
    result.push(
      "За по-доброто разбиране на материалите, " +
      "посочени в дълбочинния анализ по-горе, " +
      "е важно да се знае следното. " +
      explanations.join(" ")
    );
  }

  result.push(
    "При планиране на сондаж тази информация " +
    "помага да се преценят възможните условия " +
    "за пробиване и укрепване. " +
    "Прогнозите по дълбочини са представени " +
    "отделно по-горе и запазват своята " +
    "степен на увереност. Описанието тук " +
    "не добавя нови прогнозни пластове или " +
    "нови граници между тях."
  );

  return result;
}
