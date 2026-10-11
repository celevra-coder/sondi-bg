import { assessGlimAlternatives } from "@/lib/glim-alternative-assessment";
import Link from "next/link";
import { getVratsaDocumentedColumns } from "@/lib/vratsa-documented-columns";
import { getVratsaRegionReport } from "@/lib/vratsa-region-report";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase-server";
import {
  getLithologyProfile,
  type LithologyProfile,
} from "@/lib/lithology-profile";
import { synthesizeLithologyEvidence } from "@/lib/lithology-synthesis";
import { buildUnifiedLithology } from "@/lib/lithology-unified-synthesis";
import { explainDepthLithology } from "@/lib/lithology-depth-display";

type SearchParams = Promise<{
  lat?: string;
  lng?: string;
  lon?: string;
  analysis_id?: string;
  location_label?: string;
  target?: string;
}>;

// Reader-friendly explanations are integrated directly into the regional text.
function familyLabel(value: string) {
  const labels: Record<string, string> = {
    UNCONSOLIDATED: "Рохкави повърхностни наслаги",
    SANDSTONE_COMPLEX: "Пясъчников комплекс",
    CONGLOMERATIC_COMPLEX: "Конгломератен комплекс",
    GNEISS: "Гнайси",
    AMPHIBOLITE_GNEISS: "Амфиболит-гнайсов комплекс",
    AMPHIBOLITE: "Амфиболити",
    SCHIST: "Шисти",
    GRANITIC: "Гранитни скали",
    DIORITIC: "Диоритови скали",
    CRYSTALLINE_MIXED: "Смесен кристалинен комплекс",
    OTHER: "Други скали",
  };

  return labels[value] || value;
}

function familyDescription(value: string) {
  const descriptions: Record<string, string> = {
    UNCONSOLIDATED:
      "Почви, пясъци, чакъли и други рохкави наслаги близо до повърхността.",

    SANDSTONE_COMPLEX:
      "Пластове от пясъчници и сродни седиментни скали; могат да пропускат вода по пори и пукнатини.",

    CONGLOMERATIC_COMPLEX:
      "Смес от едри чакъли и скални късове, свързани в по-плътен пласт; пропускливостта може да е различна.",

    GNEISS:
      "Твърди метаморфни скали, често напукани; водата обикновено се среща по пукнатини и структурни зони.",

    AMPHIBOLITE_GNEISS:
      "Редуване или смесване на гнайси и амфиболити; водопропускливостта е свързана главно с напукване.",

    AMPHIBOLITE:
      "Много твърди кристалинни скали; водоносността зависи основно от пукнатини и разломни зони.",

    SCHIST:
      "Слоести метаморфни скали, които могат да пропускат вода по цепнатини и по посоката на разсланяване.",

    GRANITIC:
      "Плътни гранитни скали; водата обикновено не е в самата скала, а в пукнатини и разломни участъци.",

    DIORITIC:
      "Твърди магмени скали, подобни по поведение на гранитите; водата е свързана предимно с напукване.",

    CRYSTALLINE_MIXED:
      "Смесен комплекс от твърди кристалинни скали; условията за вода зависят най-вече от пукнатини и структурни нарушения.",

    OTHER:
      "Геоложки материал, който не попада в основните групи; характеристиките зависят от конкретния състав.",
  };

  return descriptions[value] || "";
}

function confidenceLabel(
  value: "low" | "medium" | "high" | null
) {
  if (value === "high") return "висока";
  if (value === "medium") return "добра";
  if (value === "low") return "ориентировъчна";
  return "—";
}

export default async function DepthStructurePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const lat = Number(params.lat);
  const lng = Number(params.lng ?? params.lon);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    redirect("/geology-map");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hasAccess = false;

  if (user) {
    const { data: adminRow } =
      await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (adminRow) {
      hasAccess = true;
    } else if (params.analysis_id) {
      const { data: analysis } =
        await supabase
          .from("expert_analyses")
          .select("id, latitude, longitude")
          .eq("id", params.analysis_id)
          .eq("user_id", user.id)
          .maybeSingle();

      if (analysis) {
        const savedLat =
          Number(analysis.latitude);

        const savedLng =
          Number(analysis.longitude);

        hasAccess =
          Number.isFinite(savedLat) &&
          Number.isFinite(savedLng) &&
          savedLat.toFixed(6) ===
            lat.toFixed(6) &&
          savedLng.toFixed(6) ===
            lng.toFixed(6);
      }
    }
  }

  if (!hasAccess) {
    const accessParams =
      new URLSearchParams();

    accessParams.set("lat", String(lat));
    accessParams.set("lng", String(lng));
    accessParams.set(
      "target",
      "depth-structure"
    );

    if (params.location_label) {
      accessParams.set(
        "location_label",
        params.location_label
      );
    }

    redirect(
      `/expert-access?${accessParams.toString()}`
    );
  }

  const profile =
    await getLithologyProfile(
      lat,
      lng
    ) as LithologyProfile;

  const synthesis =
    synthesizeLithologyEvidence(profile);

  const checkpoints = [20, 50, 80, 100, 150, 200, 300, 500];


  const unified = buildUnifiedLithology(
    profile,
    synthesis,
    checkpoints
  );

  /*
   * User-facing lithology translation.
   * Source evidence and geological calculations remain unchanged.
   */
  const geologyTextBg = (value: string): string => {
    // VRATSA_MUNICIPALITY_BG_TRANSLATIONS_V1
    // Display translations only. Geological evidence is unchanged.
    const vratsaMunicipalityBg: Record<string, string> = {
      "Quaternary loess/alluvium; locally transition toward Neogene":
        "Кватернерни льосови и речни наслаги; на места преход към неогенски пластове",
      "Quaternary in thick-cover sectors OR Neogene where cover is thinner":
        "Кватернерни наслаги при по-дебела повърхностна покривка или неогенски пластове, където тя е по-тънка",
      "commonly Neogene":
        "Най-често неогенски наслаги",
      "Neogene":
        "Неогенски наслаги",
      "Neogene or approaching older substrate":
        "Неогенски наслаги или приближаване към по-старата скална основа",
      "older substrate possible; structural control required":
        "Възможна по-стара скална основа; конкретният материал зависи от геоложката структура",
      "loess complex":
        "Льосов комплекс",
      "red clay or Neogene depending on local loess thickness":
        "Червени глини или неогенски наслаги според местната дебелина на льоса",
      "Neogene basin fill":
        "Неогенски наслаги, запълващи геоложкия басейн",
      "loess/red clay OR Neogene depending on local cover":
        "Льос и червени глини или неогенски наслаги според местната повърхностна покривка",
      "Neogene likely":
        "Вероятни неогенски наслаги",
      "Neogene or locally older substrate":
        "Неогенски наслаги или на места по-стара скална основа",
      "Neogene OR Cretaceous depending on structure":
        "Неогенски или кредни скали според местната геоложка структура",
      "older platform cover; exact unit unresolved":
        "По-стари платформени седиментни скали; конкретната геоложка единица не е определена"
    };

    const translatedVratsaMaterial = vratsaMunicipalityBg[value];
    if (translatedVratsaMaterial) {
      return translatedVratsaMaterial;
    }
    const direct: Record<string, string> = {
      "Sumer marl": "Мергели на Сумерската свита",
      "Mramoren marl": "Мергели на Мраморенската свита",
      "Vratsa Urgonian carbonate complex": "Ургонски карбонатен комплекс — варовици",
      "Pastrina limestone/calcareous marl": "Пастрински варовици и варовити мергели",
      "Darmantsi sandstone/sandy limestone": "Пясъчници и песъчливи варовици на Дарманската свита",
      "Kunino micritic/argillaceous limestone": "Микритни и глинести варовици на Кунинската свита",
      "Mezdra flint-bearing limestone": "Кременосъдържащи варовици на Мездренската свита",
      "Kaylaka organogenic limestone": "Органогенни варовици на Кайлъшката свита",
      "Quaternary: alluvial deposits and loess": "Кватернерни алувиални и льосови наслаги",
      "Sarmatian: sandstones, dark-bedded limestones and calcareous clays": "Сарматски пясъчници, тъмнослоести варовици и варовити глини",
      "Neogene clay-sand sedimentary sequence":
        "Неогенски глинесто-песъчлив седиментен комплекс",

      "Quaternary loess/alluvial deposits":
        "Кватернерни льосови и алувиални наслаги",

      "Brusartsi Formation clay/sand sequence":
        "Глинесто-песъчлив комплекс на Брусарската свита",

      "Sarmatian clay-sand sequence":
        "Сарматски глинесто-песъчлив комплекс",

      "Pliocene clay":
        "Плиоценска глина",

      "loess":
        "льос",

      "clay":
        "глина",

      "sand":
        "пясък",

      "gravel":
        "чакъл",

      "sandstone":
        "пясъчник",

      "limestone":
        "варовик",

      "marl":
        "мергел",

      "dolomite":
        "доломит",

      "conglomerate":
        "конгломерат",
    };

    const trimmed = value.trim();

    if (direct[trimmed]) {
      return direct[trimmed];
    }

    let result = trimmed;

    const replacements: Array<[RegExp, string]> = [
      [
        /Quaternary loess\/alluvial deposits/gi,
        "кватернерни льосови и алувиални наслаги"
      ],
      [
        /Brusartsi Formation clay\/sand sequence/gi,
        "глинесто-песъчлив комплекс на Брусарската свита"
      ],
      [
        /Neogene clay-sand sedimentary sequence/gi,
        "неогенски глинесто-песъчлив седиментен комплекс"
      ],
      [
        /Romanian: dense yellowish clays with calcareous concretions/gi,
        "Романски етаж: плътни жълтеникави глини с варовити конкреции"
      ],
      [
        /locally sandy with clayey-sand intercalations/gi,
        "на места песъчливи, с глинесто-песъчливи прослойки"
      ],
      [
        /Dacian: grey-bluish sandy clays and sands/gi,
        "Дакийски етаж: сиво-синкави песъчливи глини и пясъци"
      ],
      [
        /locally lignitic coal horizons and sandy clays/gi,
        "на места лигнитни въглищни хоризонти и песъчливи глини"
      ],
      [
        /Exact local Romanian\/Dacian contact depth is not machine-resolved/gi,
        "Точната дълбочина на местния контакт между романския и дакийския етаж не е определена"
      ],
      [
        /Local shallow 3D model must override this regional fallback where its geometry is resolved/gi,
        "При установена локална 3D геометрия регионалният модел трябва да бъде уточнен според нея"
      ],
      [
        /lithology depends strongly on local terrace\/3D-model geometry/gi,
        "литологията зависи силно от местната терасова и триизмерна геоложка структура"
      ],
      [
        /Romanian\b/g,
        "романски етаж"
      ],
      [
        /Dacian\b/g,
        "дакийски етаж"
      ],
    ];

    for (const [pattern, replacement] of replacements) {
      result = result.replace(pattern, replacement);
    }

    return familyLabel(result);
  };

  const evidenceLabels = {
    DIRECT_BOREHOLE:
      "Документирани сондажни данни",

    BOREHOLE_PROJECTION:
      "Прогноза по сондажен аналог",

    SPATIAL_MODEL:
      "Пространствен геоложки модел",

    REGIONAL_CONTEXT:
      "Регионален геоложки контекст",

    UNRESOLVED:
      "Недостатъчно данни за конкретната дълбочина",
  } as const;

  const confidenceLabel = (value: string | null) => {
    const labels: Record<string, string> = {
      HIGH: "Висока",
      MEDIUM: "Средна",
      LOW: "Ниска",
      VERY_LOW: "Много ниска",
      UNRESOLVED: "Неопределена",
      DOCUMENTED: "Документирана",
      DOCUMENTED_NEAR_TARGET_NOT_EXACT:
        "Документиран близък аналог, не точно в избраната точка",
    };

    if (!value) return "Неопределена";

    return labels[value] || value;
  };

  // VRATSA_CONDITIONAL_MATERIAL_DISPLAY_V2
  // Presentation only: do not modify source evidence.
  const conditionalVratsaMaterials = new Set([
    "Quaternary in thick-cover sectors OR Neogene where cover is thinner",
    "Neogene or approaching older substrate",
    "older substrate possible; structural control required",
    "red clay or Neogene depending on local loess thickness",
    "loess/red clay OR Neogene depending on local cover",
    "Neogene or locally older substrate",
    "Neogene OR Cretaceous depending on structure",
    "older platform cover; exact unit unresolved"
  ]);
  const rawRows = unified.map(point => {
        const isConditionalVratsaMaterial =
      typeof point.material === "string" &&
      conditionalVratsaMaterials.has(point.material);
const material = point.material
      ? geologyTextBg(familyLabel(point.material))
      : point.alternatives.length > 0
        ? (profile.target_glim_surface_context.status === "OK"
            ? "Регионални геоложки варианти"
            : "Точният пласт не е установен")
        : "Недостатъчно геоложки данни";

    const simpleMaterialBase =
      /Neogene clay-sand|неогенски глинесто-песъчлив/i.test(material)
        ? "Глини и пясъци"
        : material;

    const simpleMaterial = simpleMaterialBase;

    // A unified plain-language explanation for every municipality and province.
    // It is generated from the reported material, not a replacement for it.
    const depthPlainLanguage = point.material
      ? explainDepthLithology(simpleMaterialBase).explanation
      : "";

    const evidence = point.evidence_kind;

    const baseDescription =
      !point.material && point.alternatives.length > 0
        ? "За района са документирани следните геоложки варианти, но не е доказано кой от тях се среща точно на тази дълбочина: " +
          point.alternatives
            .map(x => geologyTextBg(familyLabel(x)))
            .join(" или ") + "."
        : !point.material
          ? "Няма достатъчно данни за този пласт."
          : evidence === "DIRECT_BOREHOLE"
            ? "Данни от документиран сондаж."
            : evidence === "BOREHOLE_PROJECTION"
              ? "Прогноза по сондажен аналог."
              : evidence === "SPATIAL_MODEL"
                ? "Вероятен материал според геоложкия модел."
                : "Ориентировъчна геоложка информация за района.";

    const glimAssessment =
      !point.material &&
      point.alternatives.length > 0 &&
      (point.evidence_kind === "SPATIAL_MODEL" ||
        point.evidence_kind === "REGIONAL_CONTEXT")
        ? assessGlimAlternatives(
            profile.target_glim_surface_context,
            point.alternatives
          )
        : null;

    const description = glimAssessment
      ? `${baseDescription} Повърхностната геоложка основа е определена като ${
          glimAssessment.surfaceMaterial.toLowerCase()
        }. ${
          glimAssessment.compatible.length > 0
            ? "Сходни по общ скален тип с нея: " +
              glimAssessment.compatible
                .map(x => geologyTextBg(familyLabel(x)))
                .join("; ") + ". "
            : ""
        }Другите изброени формации остават възможни в дълбочина. Точната им последователност и дълбочините на контактите не са установени.`      : isConditionalVratsaMaterial
        ? "Условна геоложка прогноза. Конкретният пласт зависи от местната геоложка структура и не е доказан точно под избраната точка."
        : baseDescription;

    // Reader explanation first; evidence conditions are rendered separately in small type.
    const readerDescription = depthPlainLanguage || (!point.material ? description : "");
    const evidenceNote = point.material ? description : "";

    const confidence =
      isConditionalVratsaMaterial ? "Условна прогноза по геоложки модел" : evidence === "DIRECT_BOREHOLE"
        ? "Документирани данни"
        : evidence === "BOREHOLE_PROJECTION"
          ? "Прогноза по сондажен аналог"
          : evidence === "SPATIAL_MODEL"
            ? "Прогноза по геоложки модел"
            : "Не е доказан конкретен пласт";

    const groupable =
      evidence === "SPATIAL_MODEL" ||
      evidence === "REGIONAL_CONTEXT";

    // Only the same underlying evidence may be grouped.
    // Display text alone is not a sufficient geological match.
    const signature = JSON.stringify({
      material: point.material,
      alternatives: point.alternatives,
      evidence: point.evidence_kind,
      confidence: point.confidence,
      boreholes: point.borehole_ids,
      sources: point.source_ids,
      limitations: point.limitations,
    });

    return {
      startDepth: point.depth_m,
      endDepth: point.depth_m,
      checkpoints: [point.depth_m],
      signature,
      groupable,
      material: simpleMaterial,
      description: readerDescription,
      evidenceNote,
      confidence,
      analogueCount: 0,
    };
  });

  const groupedRows: typeof rawRows = [];

  for (const row of rawRows) {
    const previous = groupedRows[groupedRows.length - 1];

    if (
      previous &&
      previous.groupable &&
      row.groupable &&
      previous.signature === row.signature
    ) {
      previous.endDepth = row.endDepth;
      previous.checkpoints.push(...row.checkpoints);
    } else {
      groupedRows.push({
        ...row,
        checkpoints: [...row.checkpoints],
      });
    }
  }

  const rows = groupedRows.map(row => ({
    depth: row.checkpoints.length > 1
      ? `${row.startDepth}–${row.checkpoints[row.checkpoints.length - 1]} м`
      : `${row.startDepth} м`,
    material: row.material,
    description: row.description,
    evidenceNote: [
      row.evidenceNote,
      row.checkpoints.length > 1
        ? `Сходен резултат при проверените дълбочини: ${row.checkpoints.join(", ")} м. Това не доказва непрекъснат пласт между тях.`
        : "",
    ].filter(Boolean).join(" "),
    confidence: row.confidence,
    analogueCount: row.analogueCount,
  }));
  const regionalColumns = getVratsaDocumentedColumns(profile);
  const vratsaReportCards = getVratsaRegionReport(
    profile.target_spatial_depth_model[0]?.zone.zone_id,
    profile.target_spatial_depth_model[0]?.target.municipality
  );

  // Presentation-only grouping. An unverified regional source is never
  // silently promoted to a local borehole or local geological profile.
  const selectedVratsaMunicipality =
    profile.target_spatial_depth_model[0]?.target.municipality ?? null;
  const documentedContextRecords =
    profile.target_documented_geological_context?.records ?? [];
  const normalizedMunicipality = (selectedVratsaMunicipality ?? "").toLocaleLowerCase("bg");
  const localDocumentedRecords = documentedContextRecords.filter(record => {
    if (!normalizedMunicipality) return false;
    const locality = (record.locality ?? "").toLocaleLowerCase("bg");
    // Only explicit municipality name matches; nearby studies are analogues.
    return locality.includes(normalizedMunicipality);
  });
  const comparativeDocumentedRecords = documentedContextRecords.filter(
    record => !localDocumentedRecords.includes(record)
  );

  const title =
    params.location_label?.trim() ||
    `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f2f8f8",
        padding: "36px 16px 60px",
      }}
    >
      <section
        style={{
          maxWidth: 900,
          margin: "0 auto",
          background: "#fff",
          border: "1px solid #d9e7e9",
          borderRadius: 24,
          padding: 26,
          boxShadow:
            "0 18px 60px rgba(20,63,73,.08)",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: ".12em",
            color: "#56858e",
          }}
        >
          SONDI EXPERT
        </div>

        <h1
          style={{
            margin: "8px 0 4px",
            color: "#123b46",
            fontSize: 30,
          }}
        >
          Структура в дълбочина
        </h1>

        <p
          style={{
            margin: 0,
            color: "#60757b",
          }}
        >
          {title}
        </p>

        <p
          style={{
            marginTop: 18,
            color: "#405a61",
            lineHeight: 1.6,
          }}
        >
          Прогнозна структура на земните
          пластове по дълбочина за избраната
          точка, изведена от най-близките
          надеждни сондажни разрези и
          локалната геоложка обстановка.
        </p>

        {rows.length > 0 ? (
          <div
            style={{
              display: "grid",
              gap: 10,
              marginTop: 24,
            }}
          >
            {rows.map((row: any) => (
              <div
                key={row.depth}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "90px minmax(0,1fr)",
                  gap: 14,
                  padding: "14px 16px",
                  border:
                    "1px solid #dce9e5",
                  borderRadius: 12,
                  background: "#f8fbfa",
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: "#0d8055",
                  }}
                >
                  {row.depth}
                </div>

                <div>
                  <div
                    style={{
                      fontWeight: 800,
                      color: "#173f49",
                    }}
                  >
                    {row.material}
                  </div>

                  {row.description && (
                    <div
                      style={{
                        marginTop: 5,
                        fontSize: 13,
                        lineHeight: 1.45,
                        color: "#4f666d",
                      }}
                    >
                      {row.description}
                    </div>
                  )}

                  {row.evidenceNote && (
                    <div
                      style={{
                        marginTop: 7,
                        fontSize: 11,
                        lineHeight: 1.45,
                        color: "#71858b",
                      }}
                    >
                      {row.evidenceNote}
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: 5,
                      fontSize: 12,
                      color: "#71858b",
                    }}
                  >
                    {row.confidence}
                    {row.analogueCount > 1
                      ? ` · ${row.analogueCount} близки аналога`
                      : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              marginTop: 24,
              padding: 16,
              borderRadius: 12,
              background: "#f5f7f8",
              color: "#52666c",
            }}
          >
            За тази точка няма достатъчно
            надежден локален сондажен аналог за
            изграждане на профил.
          </div>
        )}

        {profile.target_glim_surface_context?.status === "OK" && (
          <section
            style={{
              marginTop: 24,
              padding: 18,
              border: "1px solid #d9e7e9",
              borderRadius: 14,
              background: "#f8fbfa",
            }}
          >
            <h2
              style={{
                margin: "0 0 10px",
                fontSize: 19,
                color: "#173f49",
              }}
            >
              Геоложка основа в района
            </h2>
            <p style={{ margin: "0 0 8px", fontWeight: 700 }}>
              {profile.target_glim_surface_context.material_bg}
            </p>
            {profile.target_glim_surface_context.detail_bg && (
              <p style={{ margin: "0 0 8px" }}>
                {profile.target_glim_surface_context.detail_bg}
              </p>
            )}
            <p style={{ color: "#657c80", fontSize: 13 }}>
              Ориентировъчна информация за общия тип скали в района.
              Точната последователност на пластовете в дълбочина
              не е установена само от тези данни.
            </p>

          </section>
        )}
        {/* Единна регионална геоложка основа, когато GLIM няма локален отговор. */}
        {vratsaReportCards.length > 0 && profile.target_glim_surface_context?.status !== "OK" && (
          <section style={{ marginTop: 24, padding: 18, border: "1px solid #d9e7e9", borderRadius: 14, background: "#f8fbfa" }}>
            <h2 style={{ margin: "0 0 14px", fontSize: 21, color: "#173f49" }}>Геоложка основа в района</h2>
            <p style={{ margin: "0 0 7px", fontWeight: 700, color: "#173f49" }}>{vratsaReportCards[0].title}</p>
            <p style={{ margin: 0, color: "#405a61", lineHeight: 1.6 }}>{vratsaReportCards[0].paragraphs[0]}</p>
            <p style={{ margin: "9px 0 0", fontSize: 12, color: "#657c80" }}>Регионална геоложка основа, не доказан пласт на конкретна дълбочина.</p>
          </section>
        )}
        {regionalColumns.length > 0 && (
          <section style={{ marginTop: 26, padding: 18, border: "1px solid #d9e7e9", borderRadius: 14, background: "#f8fbfa" }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 19, color: "#173f49" }}>Регионална геоложка информация — документирани сондажни разрези</h2>
            <p style={{ color: "#405a61", fontSize: 13, lineHeight: 1.6 }}>
              Представени са публикувани литоложки разрези от региона, които дават допълнителна информация за геоложкия строеж в дълбочина.
            </p>
            {regionalColumns.map(column => (
              <div key={column.record_id} style={{ marginTop: 15, borderTop: "1px solid #d9e7e9", paddingTop: 12 }}>
                <div style={{ color: "#173f49", fontWeight: 800 }}>{column.name}{column.site ? ` — ${column.site}` : ""}</div>
                <div style={{ color: "#687e83", fontSize: 12, marginTop: 3 }}>
                  {column.basis === "REGIONAL_COMPARISON" ? "Регионален сравнителен разрез" : "Локален сравнителен профил"} · Посочена община: {column.municipality} · Без точни координати
                </div>
                {column.applicability_note && (
                  <p style={{ color: "#657c80", fontSize: 12, lineHeight: 1.5 }}>
                    {column.applicability_note}
                  </p>
                )}
                <div style={{ marginTop: 9, display: "grid", gap: 5 }}>
                  {column.intervals.map((interval, index) => (
                    <div key={`${column.record_id}-${index}`} style={{ display: "grid", gridTemplateColumns: "minmax(100px, 120px) minmax(0, 1fr)", gap: 10, fontSize: 13, color: "#344f55" }}>
                      <strong style={{ color: "#0d8055" }}>{interval.from_m}–{interval.to_m ?? "?"} м</strong>
                      <span>{
  ({
    "Loess; basal sands": "Льос — фин праховиден материал с пясъци в основата",
    "Clays with sand seams": "Глини с прослойки от пясък",
    "Clays with thin sand seams": "Глини с тънки прослойки от пясък",
    "Sands": "Пясъци — несвързани зърнести наслаги",
    "Clays with sand seams and marls": "Глини с пясъчни прослойки и мергели (глинесто-варовикови скали)",
    "Marls": "Мергели — глинесто-варовикови скали",
    "Limestones": "Варовици — твърди карбонатни скали",
    "Clayey limestones": "Глинести варовици — варовици с глинеста примес",
    "Sandy limestones and marls": "Песъчливи варовици и мергели — карбонатни скали с пясъчна и глинеста съставка",
    "Silty limestones and marls": "Праховити варовици и мергели — карбонатни скали с фина праховита и глинеста съставка",
  } as Record<string, string>)[interval.material] ?? interval.material
}{interval.to_m == null ? " (долна граница не е документирана)" : ""}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: "#71858b", marginTop: 7 }}>Източници: {column.source_ids.join(", ")} · {column.record_id}</div>
              </div>
            ))}
          </section>
        )}
                {/* VRATSA_DOCUMENTED_CONTEXT_UI_START */}
        {(vratsaReportCards.length > 0 ||
          (profile.target_documented_geological_context?.records.length ?? 0) > 0) && (
            <section
              aria-label="Документиран регионален геоложки контекст"
              style={{
                marginTop: 26,
                padding: 18,
                border: "1px solid #d9e7e9",
                borderRadius: 14,
                background: "#f8fbfa",
              }}
            >
              <h2 style={{
                margin: "0 0 10px",
                fontSize: 19,
                color: "#173f49",
              }}>
                Регионална геоложка информация — документирани геоложки сведения
              </h2>

              <p style={{
                color: "#405a61",
                fontSize: 13,
                lineHeight: 1.6,
              }}>
                Геоложки сведения от публикувани проучвания
                за съответния район.
              </p>

              {vratsaReportCards.length > 0 && (
                <h3 style={{ margin: "18px 0 8px", fontSize: 16, color: "#173f49" }}>
                  Геоложка информация за избраната община
                </h3>
              )}
              {vratsaReportCards.map(card => (
                <div key={card.id} style={{ marginTop: 14, padding: 14, border: "1px solid #d9e7e9", borderRadius: 10, background: "#ffffff" }}>
                  <h3 style={{ margin: "0 0 7px", fontSize: 16, color: "#173f49" }}>{card.title}</h3>
                  <p style={{ margin: "0 0 8px", fontSize: 12, color: "#405a61" }}>Вид информация: {card.informationType}</p>
                  <details>
                    <summary style={{ cursor: "pointer", color: "#176c72", fontSize: 13, fontWeight: 700 }}>Покажи геоложките сведения</summary>
                    <ul style={{ margin: "12px 0 0", paddingLeft: 21, color: "#344f55", fontSize: 13, lineHeight: 1.8 }}>
                      {card.paragraphs.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                  </details>
                  <p style={{ margin: "10px 0 0", fontSize: 11, color: "#71858b" }}>Източници: {card.sources.length ? card.sources.join(", ") : "Регионален геоложки модел"}</p>
                </div>
              ))}

              {[
                { id: "local", records: localDocumentedRecords, heading: "Допълнителни документирани сведения за избраната община" },
                { id: "analogues", records: comparativeDocumentedRecords, heading: "Допълнителни геоложки проучвания от по-широкия район" }
              ].filter(group => group.records.length > 0).map(group => (
                <div key={group.id} style={{ marginTop: 22 }}>
                  <h3 style={{ margin: "0 0 6px", fontSize: 16, color: "#173f49" }}>{group.heading}</h3>
                  <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.6, color: "#587179" }}>
                    {group.id === "analogues"
                      ? "Сравнителни регионални проучвания. Те не са сондажи или доказани геоложки разрези точно под избраната точка."
                      : "Допълнителни източници, в чието наименование е посочена избраната община. Приложимостта им към конкретната точка не е автоматично доказана."}
                  </p>
                  {group.records.map((record, index) => (
                  <div
                    key={`${record.source_id ?? "source"}-${index}`}
                    style={{
                      marginTop: 14,
                      padding: 14,
                      border: "1px solid #d9e7e9",
                      borderRadius: 10,
                      background: "#ffffff",
                    }}
                  >
                    <h3 style={{
                      margin: "0 0 7px",
                      fontSize: 16,
                      color: "#173f49",
                    }}>
                      {record.locality || "Геоложко проучване"}
                    </h3>

                    {record.evidence_type && (
                      <p style={{
                        margin: "0 0 8px",
                        fontSize: 12,
                        color: "#405a61",
                      }}>
                        Вид информация: {({
  REGIONAL_LITHOLOGICAL_CONTEXT:
    "Регионална литоложка информация",
  DEPOSIT_AND_REGIONAL_GEOLOGY:
    "Геология на находището и района",
} as Record<string, string>)[record.evidence_type] ??
  "Документирана геоложка информация"}
                      </p>
                    )}

                                        {/* DOCUMENTED_GEOLOGY_BG_SUMMARIES */}
                    <details>
                      <summary style={{
                        cursor: "pointer",
                        color: "#176c72",
                        fontSize: 13,
                        fontWeight: 700,
                      }}>
                        Покажи геоложките сведения
                      </summary>

                      {(() => {
                        const source = (record.source_id ?? "").toUpperCase();

                                                // VRATSA_SOURCE_BASED_DESCRIPTIONS
                        const evidence = record.source_evidence as
                          Record<string, unknown>;

                        const descriptions: string[] = [];

                                                // VRATSA_FRIENDLY_GEOLOGY_V1
                        if (source.includes("CHIREN")) {
                          descriptions.push(
                            "Проучванията около Чирен показват последователност от дебели седиментни пластове — скали, образувани чрез натрупване и уплътняване на материали.",
                            "Сондажите са установили различни групи скални пластове (свити), сред които Вранска, Риковска, Милинкамъкска, Костенска, Оризовска, Гложенска и Мраморенска.",
                            "Някои от тези пластове имат голяма дебелина. Например в сондаж Р-19 Чирен е установена мощност 1888 м на Вранската свита.",
                            "В по-плитката част на проучвания район са описани льос, глини, песъчливи глини и пясъци.",
                            "На проучваната площадка е установена льосова покривка с дебелина до 6 м."
                          );
                        } else if (source.includes("GLORIA")) {
                          descriptions.push(
                            "Най-горе в находището има покривка от льос и глинести материали с дебелина около 1–4 м, а на места и повече.",
                            "Под нея са разположени скали от Малопещенската свита (група сходни пластове). Тук те са предимно зелени пясъчници с глауконит (зеленикав минерал).",
                            "Горният пласт е с приблизителна дебелина 20 м и е изграден от зелени средно- и едрозърнести пясъчници.",
                            "Долният пласт е с установена дебелина най-малко 20–25 м. Състои се от по-плътни тъмнозелени и сивозелени пясъчници, на места с глинести прослойки.",
                            "Средната отчетена обща полезна дебелина на двата пласта в находището е около 33,5 м.",
                            "В района са описани геоложки разломи — зони, по които скалните пластове са били размествани."
                          );
                        } else if (source.includes("ORYAHOVO")) {
                          descriptions.push(
                            "Льосов комплекс (фин прахов материал, натрупан от вятъра) — дебелина за района около 80–100 м.",
                            "По-стари чакъли под льоса — установена дебелина до около 1 м.",
                            "Червеникави глини, натрупани под влияние на вятър и вода — под льоса, обикновено над чакълите."
                          );
                        } else if (source.includes("DALBOKI")) {
                          descriptions.push(
                            "Геоложка информация за района на Дълбоки дол, Мишовец и Синия бряг."
                          );
                        }

                        if (descriptions.length === 0) {
                          descriptions.push(
                            "Няма извлечено подробно литоложко описание за този източник."
                          );
                        }
return (
                          <ul style={{
                            margin: "12px 0 0",
                            paddingLeft: 21,
                            color: "#344f55",
                            fontSize: 13,
                            lineHeight: 1.8,
                          }}>
                            {descriptions.map((description, i) => (
                              <li key={i}>{description}</li>
                            ))}
                                                      <li style={{
                              marginTop: 12,
                              listStyle: "none",
                            }}>
                                      </li>
                          </ul>
                        );
                      })()}
                    </details>

                    <p style={{
                      margin: "10px 0 0",
                      fontSize: 11,
                      color: "#71858b",
                    }}>
                      Източник: {record.source_id ?? "неуточнен"}
                    </p>
                  </div>
                  ))}
                </div>
              ))}
            </section>
          )}
        {/* VRATSA_DOCUMENTED_CONTEXT_UI_END */}
{/* MARICHIN_LOCAL_EVIDENCE_START */}
        {profile.marichin_local_context != null && (
            <section
              aria-label="Локална геоложка информация"
              style={{
                marginTop: 28,
                padding: 20,
                border: "1px solid #b9d8cf",
                borderRadius: 14,
                background: "#f5faf8",
              }}
            >
              <h2
                style={{
                  margin: "0 0 12px",
                  fontSize: 20,
                  color: "#173f49",
                }}
              >
                Локална геоложка информация — Маричин валог
              </h2>

              <p
                style={{
                  margin: 0,
                  lineHeight: 1.65,
                  color: "#344f55",
                  fontSize: 14,
                }}
              >
                В района са установени льосови наслаги,
                червени глини, а на отделни места —
                пясък и чакъл. Под плитките наслаги
                е установена и плиоценска глина.
              </p>

              <p
                style={{
                  margin: "12px 0 0",
                  lineHeight: 1.55,
                  color: "#657c80",
                  fontSize: 12,
                }}
              >
                Дебелината на пластовете се различава между
                изследваните места. Точната им последователност
                под избраната точка не е доказана.
              </p>
            </section>
          )}
        {/* MARICHIN_LOCAL_EVIDENCE_END */}


        <div
          style={{
            marginTop: 26,
            fontSize: 12,
            lineHeight: 1.55,
            color: "#72858a",
          }}
        >
          Посочените дълбочини са прогнозни за
          избраната точка, освен когато анализът
          съвпада с документиран сондаж.
        </div>

        <div style={{ marginTop: 24 }}>
          <Link
            href="/geology-map"
            style={{
              color: "#0d8055",
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            ← Назад към картата
          </Link>
        </div>
      </section>
    </main>
  );
}