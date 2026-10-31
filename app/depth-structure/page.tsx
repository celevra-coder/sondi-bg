import { getRavnoPolePilot } from "../../lib/sondi-ravno-pole-local-pilot";
import { resolveNationalEvidence } from "../../lib/sondi-national-evidence-engine";
import { getNationalBoreholeIndex } from "../../lib/sondi-national-borehole-index";
import { assessGlimAlternatives } from "@/lib/glim-alternative-assessment";
import Link from "next/link";
import { getVratsaDocumentedColumns } from "@/lib/vratsa-documented-columns";
import { getVratsaRegionReport } from "@/lib/vratsa-region-report";
import { getSondiRegionalReport, getSondiWiderStudies } from "@/lib/sondi-regional-report";
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


function sondiMaterialExplanation(material: string): string {
  const m = material.toLocaleLowerCase("bg");

  if (m.trim() === "регионален геоложки анализ")
    return "За тези проверени дълбочини не е установен конкретен скален материал. Наличната регионална геоложка информация не доказва еднакъв пласт или непрекъсната последователност между тях.";



  // SONDI_MIXED_LITHOLOGY_EXPLANATIONS_63CX
  // More specific combinations take precedence over single-rock matches.
  if (/лозенецк|новиискърск/.test(m))
    return "Това са наименования на неогенски геоложки свити — комплекси от пластове, образувани през неогенския период. В отделни части могат да участват глини, пясъци и смесени седиментни материали. Точният им състав, дебелина и редуване на избраната точка не следват само от името на свитата.";

  if (/неоген/.test(m) && !/глин|пяс|чакъл|мергел|варовик/.test(m))
    return "Неогенските седименти са по-стари натрупани материали, които могат да включват глини, пясъци и други седиментни скали. Тяхната последователност, устойчивост и пропускливост зависят от местния геоложки строеж.";

  if (/пясъчниц/.test(m) && /мергел/.test(m))
    return "Основният описан материал включва пясъчници — споени пясъчни зърна — с прослойки от мергели, изградени от глинеста и карбонатна съставка. При напукани пясъчници пукнатините могат да влияят върху движението на водата; мергелните прослойки често са по-слабопропускливи. Това не доказва водоносен пласт.";

  if (/пясъчниц/.test(m) && /варовик/.test(m))
    return "Описани са пясъчници и варовици с различен състав и здравина. Пясъчниците са споени пясъчни зърна, а варовиците са карбонатни скали. При сондиране значение имат напукаността, спойката и границите между скалните разновидности.";

  if (/кварцдиорит|диорит/.test(m))
    return "Твърди магмени скали. Здравината им влияе върху пробиването, а натрошените и напукани участъци могат да имат различна пропускливост.";

  if (/гранит/.test(m))
    return "Твърда магмена скала. При сондиране са важни изветрянето и пукнатините, които могат да влияят върху движението на водата.";

  if (/гнайс|шист|амфиболит/.test(m))
    return "Метаморфни скали. Тяхната здравина, цепителност и напуканост определят поведението при сондиране.";

  if (/чакъл/.test(m) && /глин/.test(m))
    return "Едрозърнести чакъли с глинест материал между тях. Количеството глина влияе върху пропускливостта и устойчивостта на сондажа.";

  if (/чакъл/.test(m) && /пяс/.test(m))
    return "Смес от чакъли и пясъци. Пропускливостта зависи от уплътняването и фините примеси, а рохкавите участъци могат да бъдат неустойчиви.";

  if (/чакъл/.test(m))
    return "Едрозърнести наслаги от скални късове. Пропускливостта и устойчивостта им зависят от уплътняването и запълващия материал.";

  if (/мергел/.test(m))
    return "Седиментна скала със смесен глинест и карбонатен състав. Здравината и пропускливостта се изменят според състава и напукаността.";

  if (/варовик|доломит|карбонат/.test(m))
    return "Карбонатни скали, които могат да бъдат плътни, напукани или с кухини. Пукнатините имат значение за пробиването и движението на водата.";

  if (/пясъчник/.test(m))
    return "Скала от споени пясъчни зърна. Здравината и пропускливостта зависят от спойката, порестостта и напукаността.";

  if (/льос/.test(m))
    return "Финозърнеста праховидна наслага. Някои льосови почви могат да загубят устойчивост при овлажняване.";

  if (/туф|вулкан/.test(m))
    return "Вулканогенните материали могат да се различават по твърдост, спояване и напуканост, което влияе на условията за сондиране.";

  if (/пяс/.test(m) && /глин/.test(m))
    return "Редуването на пясъчни и глинести пластове създава различни условия за движение на водата. Глините обикновено са по-слабопропускливи.";

  if (/пяс/.test(m))
    return "Зърнести наслаги, чиято пропускливост зависи от едрината, уплътняването и наличието на фини глинести частици.";

  if (/глин|алевролит/.test(m))
    return "Финозърнести материали, които обикновено пропускат водата по-трудно. Поведението им зависи от влажността и уплътняването.";

  return "Практическите условия за сондиране зависят от действителния състав, здравината, уплътняването и напукаността на материала.";
}

function sondiMaterialConfidence(value: unknown): string {
  const text = String(value ?? "").trim();
  return /Прогноза по геоложки модел|Вероятен материал според геоложкия модел/i.test(text)
    ? ""
    : text;
}


function sondiCleanDepthNote(value: unknown): string {
  return String(value ?? "")
    .replace(/Вероятен материал според геоложкия модел\.?/gi, "")
    .replace(/Прогноза по геоложки модел\.?/gi, "")
    .replace(/Условна прогноза по геоложки модел\.?/gi, "")
    .replace(/\s+/g, " ")
    .trim();
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

  // SONDI_PERNIK_SHALLOW_CLIENT_70CK
  const pernikShallowClient = profile.target_national_depth_model.some(
    item => typeof item.region_id === "string" &&
      item.region_id.startsWith("PER-M-")
  );

  const checkpoints = profile.target_national_depth_model.map(
    item => item.target.depth_m
  );


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
      "Регионален геоложки анализ",
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
  // SONDI_GLOBAL_REGIONAL_DEPTH_PRESENTATION_V2
  // This context is descriptive, never an invented borehole log.
  const regionalGeologyForEmptyDepth = [
    profile.target_glim_surface_context?.status === "OK"
      ? [
          profile.target_glim_surface_context.material_bg,
          profile.target_glim_surface_context.detail_bg
        ].filter(Boolean).join(". ")
      : "",
    ...profile.target_national_depth_model.flatMap(item =>
      item.surface_geology?.name_bg
        ? [item.surface_geology.name_bg]
        : []
    )
  ].filter((value): value is string =>
    typeof value === "string" && value.trim().length > 0
  );

  // SONDI_NATIONAL_HUMAN_REGIONAL_DESCRIPTION_V1
  // Explain the actual mapped surface unit, never invent depth contacts.
  const regionalSurfaceExplanation = (() => {
    const surface = profile.target_glim_surface_context;
    if (surface?.status !== "OK" || !surface.material_bg) return "";

    const name = surface.material_bg.trim();
    const lower = name.toLocaleLowerCase("bg");
    let meaning = "";

    if (/карбонат|варовиц|доломит/i.test(lower)) {
      meaning = "Това са скали, образувани главно от " +
        "натрупване на карбонатни материали. Те могат да " +
        "бъдат плътни, напукани или с кухини, което е " +
        "важно за условията при сондиране.";
    } else if (/териген|пясъчник|конгломерат/i.test(lower)) {
      meaning = "Тези седиментни скали са образувани от " +
        "натрупване на скални частици. В зависимост от " +
        "състава и спойката им твърдостта и устойчивостта " +
        "при сондиране могат да се различават.";
    } else if (/гнайс|шист|метаморф/i.test(lower)) {
      meaning = "Това са скали, преобразувани при висока " +
        "температура и налягане. Тяхната напуканост и " +
        "изветряне влияят върху условията за сондиране.";
    } else if (/гранит|магмен|вулкан/i.test(lower)) {
      meaning = "Тези скали са свързани с магмена дейност. " +
        "Могат да бъдат здрави или локално напукани " +
        "и изветрели.";
    } else if (/глин|пясъ|чакъл|алуви|делуви/i.test(lower)) {
      meaning = "Това са наслаги от частици с различна " +
        "големина. Пясъците и чакълите обикновено са " +
        "по-пропускливи от глините, а устойчивостта им " +
        "зависи от уплътняването и свързаността.";
    } else {
      meaning = "Това е регионална класификация на " +
        "скалния материал, а не измерена сондажна колонка.";
    }

    return "В района геоложката карта показва " +
      lower + ". " + meaning;
  })();

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
        : "Регионален геоложки анализ";

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
          ? [
              regionalSurfaceExplanation ||
                "Регионален геоложки анализ според наличната регионална геология.",
              "Точната литоложка последователност на избраната " +
              "дълбочина не е потвърдена от локална колонка."
            ].join(" ")
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

    // SONDI_UNRESOLVED_DEPTH_GROUPING_63DF
    // A shared absence of depth evidence is not a continuous rock layer.
    // Preserve distinct alternatives and all supported material records.
    const noSpecificMaterial =
      point.material === null &&
      point.alternatives.length === 0 &&
      (
        evidence === "UNRESOLVED" ||
        evidence === "REGIONAL_CONTEXT"
      );

    const groupable =
      noSpecificMaterial ||
      evidence === "SPATIAL_MODEL" ||
      evidence === "REGIONAL_CONTEXT";

    // Only the same underlying evidence may be grouped.
    // Display text alone is not a sufficient geological match.
    const signature = noSpecificMaterial
      ? "UNRESOLVED_DEPTH_CHECKPOINTS"
      : JSON.stringify({
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
  const sondiRegionalCards = getSondiRegionalReport(lat, lng);
  const sondiWiderStudies = getSondiWiderStudies(lat, lng);
  const selectedWiderStudies = sondiWiderStudies.slice(0, 3);

  const vratsaReportCards = [
    ...getVratsaRegionReport(
      profile.target_spatial_depth_model[0]?.zone.zone_id,
      profile.target_spatial_depth_model[0]?.target.municipality
    ),
    ...sondiRegionalCards,
  ];

  // SONDI_UNIFIED_REGIONAL_CARDS_63CB
  // Presentation only: preserve all original research cards.
  const regionalCardsForDisplay = (() => {
    const cards = [...vratsaReportCards];

    // A single reader-friendly regional description for Sofia.
    // Source cards and their records remain unchanged.
    const sofiaCards = cards.filter(card =>
      card.id.startsWith("SOF-CITY") &&
      (
        /геоложки единици|скални материали|регионална геоложка характеристика/i
          .test(card.title)
      )
    );

    if (sofiaCards.length > 0) {
      const combined = {
        ...sofiaCards[0],
        id: "SOF-CITY-reader-overview",
        title: "Регионален геоложки анализ — София-град",
        informationType: "Геоложки строеж и значение за сондирането",
        paragraphs: [
          "В района на София се срещат различни по възраст, произход и състав геоложки образувания. Софийската котловина е изградена от по-млади седиментни наслаги, под които в различните части на района се установяват по-стари седиментни, магмени и вулканогенно-седиментни скални комплекси.",
          "В повърхностните и близките до повърхността части са разпространени кватернерни наслаги, свързани с речни долини, склонови процеси и натрупване на материали от околните планински райони. Те включват пясъци, чакъли, глини и на места по-едри скални късове. Съставът и дебелината им се променят според местоположението.",
          "В котловината са разпространени и по-стари неогенски седименти. Те могат да включват редуване на глини, пясъци и чакълести материали. Тези различия са важни при сондиране, защото отделните пластове могат да имат различна твърдост, устойчивост и способност да пропускат вода.",
          "В някои части на района се срещат по-стари скални комплекси, включително магмени и вулканогенно-седиментни скали. Те обикновено имат различно поведение при пробиване в сравнение с по-рохкавите седиментни наслаги. Особено значение имат степента на изветряне, напукаността и наличието на раздробени скални зони.",
          "На отделни места се установяват и специфични инженерно-геоложки условия — техногенни насипи, блатни глини, торфени материали, свлачищни терени и участъци с нарушен естествен скален строеж. Тези особености могат да повлияят върху устойчивостта на сондажа и необходимостта от укрепване.",
          "Практическо значение за сондирането: Геоложкият строеж на София е разнообразен и не може да бъде представен с една обща последователност от пластове за цялата община. В една част могат да преобладават пясъци и чакъли, в друга — глини и уплътнени седименти, а на по-голяма дълбочина могат да се срещнат твърди скални комплекси. Затова прогнозата по дълбочини трябва да отчита местоположението и наличните сондажни сведения."
        ],
        sources: Array.from(new Set(
          sofiaCards.flatMap(card => card.sources)
        ))
      };

      return [
        combined,
        ...cards.filter(card =>
          !sofiaCards.includes(card) &&
          !(
            card.id.startsWith("SOF-CITY") &&
            /регионална геоложка характеристика/i.test(card.title)
          )
        )
      ];
    }



    const unitsIndex = cards.findIndex(card =>
      card.title.includes("???????? ???????")
    );
    const materialsIndex = cards.findIndex(card =>
      card.title.includes("?????? ?????????")
    );

    if (unitsIndex >= 0 && materialsIndex >= 0 &&
        unitsIndex !== materialsIndex) {
      const units = cards[unitsIndex];
      const materials = cards[materialsIndex];

      const merged = {
        ...units,
        id: units.id + "-combined",
        title: "???????? ??????? ? ?????? ????????? ? ????????",
        informationType: "?????????? ???????? ? ????????????? ?????????",
        paragraphs: Array.from(new Set([
          ...units.paragraphs,
          ...materials.paragraphs
        ].filter(text => text.trim().length > 0))),
        sources: Array.from(new Set([
          ...units.sources,
          ...materials.sources
        ]))
      };

      const first = Math.min(unitsIndex, materialsIndex);
      const second = Math.max(unitsIndex, materialsIndex);

      cards.splice(second, 1);
      cards.splice(first, 1, merged);
    }

    return cards.filter(card =>
      !(card.id.startsWith("SOF-CITY") &&
        card.title.includes("?????????? ???????? ??????????????"))
    );
  })();

  // Only SONDI regional models use this presentation.
  // Vratsa's verified depth rows remain unchanged.
  const isSondiRegional = sondiRegionalCards.length > 0;

  // Municipality-scale geology is not a measured vertical column.
  // Show one explanatory row and keep source-backed details below.
  // SONDI_GLOBAL_REGIONAL_FALLBACK_V1
  // A documented nearby borehole is not proof of local lithology.
  const nationalRegionalResults =
    profile.target_national_depth_model.filter(
      item => item.engine === "NATIONAL_REGIONAL"
    );

  const regionalFallback =
    nationalRegionalResults.length > 0 &&
    nationalRegionalResults.every(
      item => item.probable_lithology == null
    ) &&
    !profile.target_national_depth_model.some(
      item =>
        item.engine === "VRATSA_COMPATIBLE" &&
        item.probable_lithology != null
    );

  const nearbyNationalEvidence = nationalRegionalResults
    .flatMap(item => item.evidence)
    .filter(item =>
      item.type === "BOREHOLE" &&
      typeof item.distance_km === "number" &&
      Number.isFinite(item.distance_km) &&
      item.distance_km <= 5 &&
      typeof item.interval_material_bg === "string" &&
      item.interval_material_bg.trim().length > 0
    );

  // SONDI_READABLE_REGIONAL_NARRATIVE_V1
  // Geological families are grouped for display only.
  // No lithological boundary or spatial correlation is inferred.
  const regionalTexts = Array.from(new Set(
    nearbyNationalEvidence.map(item =>
      (item.interval_material_bg ?? "").trim()
    )
  ));

  const containsRock = (pattern: RegExp) =>
    regionalTexts.some(text => pattern.test(text));

  const hasQuaternary = containsRock(/кватернер/i);
  const hasNeogene = containsRock(/неоген/i);
  const hasSand = containsRock(/пяс/i);
  const hasGravel = containsRock(/чакъл/i);
  const hasClay = containsRock(/глин/i);
  const hasLimestone = containsRock(/варовиц|варовици/i);
  const hasDolomite = containsRock(/доломит/i);
  const hasSandstone = containsRock(/пясъчник/i);
  const hasMarl = containsRock(/мергел/i);
  const hasCrystalline = containsRock(
    /гнайс|шист|гранит|диорит|амфиболит/i
  );

  const rockFamilies = [
    hasSand || hasGravel
      ? [
          hasSand ? "пясъци" : "",
          hasGravel ? "чакъли" : ""
        ].filter(Boolean).join(" и ")
      : "",
    hasClay ? "глини и песъчливи глини" : "",
    hasLimestone || hasDolomite
      ? [
          hasLimestone ? "варовици" : "",
          hasDolomite ? "доломити" : ""
        ].filter(Boolean).join(" и ")
      : "",
    hasSandstone ? "пясъчници" : "",
    hasMarl ? "мергели" : "",
    hasCrystalline ? "по-стари кристалинни скали" : ""
  ].filter(Boolean);

  const regionalOverview = sondiRegionalCards.find(card =>
    card.id.endsWith("-overview")
  );

  const regionalDescription = hasQuaternary && hasNeogene
    ? [
        "Сондажните проучвания в района показват " +
          "повърхностни кватернерни наслаги, " +
          "включващи " +
          (hasSand && hasGravel
            ? "пясъци и чакъли"
            : hasSand ? "пясъци" : "различни наноси") +
          (hasClay ? ", както и глинести материали" : "") +
          ". Под тях в документираните разрези " +
          "се срещат неогенски седименти, " +
          "сред които " +
          (hasClay
            ? "глини и песъчливи глини"
            : "седиментни материали") +
          (hasSand ? " с пясъчни прослойки" : "") +
          ".",
        hasLimestone || hasDolomite || hasSandstone
          ? "В проучените разрези са описани и " +
            [
              hasLimestone ? "варовици" : "",
              hasDolomite ? "доломити" : "",
              hasSandstone ? "пясъчници" : ""
            ].filter(Boolean).join(", ") + "."
          : "",
        "Общата последователност дава представа " +
          "за геоложкия строеж на района, но " +
          "местните контакти не са определени " +
          "за избраните координати."
      ].filter(Boolean).join(" ")
    : rockFamilies.length > 0
      ? "В публикуваните сондажни проучвания " +
        "от по-близкия район са установени " +
        rockFamilies.join(", ") +
        ". Различните материали изграждат " +
        "геоложкия строеж на проучените места. " +
        "Тяхната последователност и границите " +
        "помежду им под избрания имот " +
        "не са установени."
      : regionalOverview?.paragraphs[0] ??
        "Наличните сведения не позволяват " +
        "подробно описание на местните пластове.";

  const regionalBoreholeIds = Array.from(new Set(
    nearbyNationalEvidence
      .map(item => item.borehole_id)
      .filter((id): id is string =>
        typeof id === "string" && id.length > 0
      )
  ));

  const regionalSourceIds = Array.from(new Set(
    sondiRegionalCards.flatMap(card => card.sources)
  ));

  const regionalEvidenceCard =
    regionalFallback && rockFamilies.length > 0
      ? {
          id: "sondi-national-regional-evidence-summary",
          title: "Геоложки строеж на проучения район",
          informationType:
            "Документиран регионален литоложки контекст",
          paragraphs: [
            hasQuaternary && hasNeogene
              ? "В проучените части на района се " +
                "разграничават кватернерни повърхностни " +
                "наслаги и по-дълбоки неогенски " +
                "седименти. Това са различни " +
                "геоложки комплекси, образувани " +
                "през различни периоди."
              : "Геоложките проучвания показват " +
                "разнообразен скален строеж, " +
                "включващ " +
                rockFamilies.join(", ") + ".",
            hasClay && hasSand
              ? "Пясъчните материали и глините " +
                "се различават по зърнометричния " +
                "си състав. В сондажите те могат " +
                "да се редуват или да образуват " +
                "смесени пластове, което е важно " +
                "при оценка на условията за сондиране."
              : "Съставът на скалите и наслагите " +
                "се изменя между проучените места.",
            "Разрезите са документирани в " +
              regionalBoreholeIds.length +
              " сондажа. Общите им особености " +
              "помагат за разбирането на района, " +
              "но не определят точната дълбочина " +
              "на всеки пласт под конкретния имот."
          ],
          sources: regionalSourceIds
        }
      : null;

  const isSofiaCityRegional = nationalRegionalResults.some(
    item => item.region_id === "SOF-CITY"
  );

  // Sofia uses the actual registered lithology card, not a missing -overview card.
  const sofiaRegionalSummary = isSofiaCityRegional
    ? sondiRegionalCards.find(card => card.id === "SOF-CITY-lithology")?.paragraphs[0]
      ?? sondiRegionalCards.find(card => card.id === "SOF-CITY-evidence-0")?.paragraphs[0]
      ?? null
    : null;

  const regionalFallbackRow = {
    depth: "Регионален контекст",
    material: isSofiaCityRegional || rockFamilies.length > 0 || regionalOverview
      ? "Регионални геоложки варианти"
      : "Регионален геоложки анализ",
    description:
      regionalSurfaceExplanation ||
      sofiaRegionalSummary ||
      regionalDescription,
    evidenceNote: "Не е установен надежден конкретен дълбочинен интервал за избраната точка.",
    confidence: "Не е доказан конкретен пласт",
    analogueCount: 0,
  };

  const ravnoPolePilot = getRavnoPolePilot(lat, lng);

  // A regional summary must not suppress actual depth evidence.
  const hasSpecificDepthEvidence = unified.some(
    point => point.material !== null
  );

  // Exact official borehole observations take precedence over
  // sampled checkpoints. Never use nearby holes as exact logs.
  const exactNationalBorehole = getNationalBoreholeIndex().find(
    hole =>
      (
        (
          hole.origin === "NATIONAL" &&
          hole.coordinate_status === "OFFICIAL_EXACT"
        ) ||
        (
          // SONDI_PERNIK_EXACT_CLIENT_70CM
          // Permit only the four documented Stomana boreholes
          // at their recorded coordinates, never nearby land.
          pernikShallowClient &&
          hole.origin === "REGIONAL" &&
          hole.coordinate_status === "REGIONAL_DOCUMENTED" &&
          /^PERNIK_STOMANA_MK[1-4]$/.test(hole.id)
        )
      ) &&
      hole.latitude !== null &&
      hole.longitude !== null &&
      Math.abs(hole.latitude - lat) <= 0.000001 &&
      Math.abs(hole.longitude - lng) <= 0.000001
  );

  const exactIntervalsCandidate = (
    exactNationalBorehole?.intervals ?? []
  )
    .filter(interval =>
      interval.interval_status === null &&
      (
        interval.evidence_level === "borehole_exact" ||
        interval.evidence_level === "documented_borehole_log" ||
        (
          pernikShallowClient &&
          exactNationalBorehole?.origin === "REGIONAL" &&
          /^PERNIK_STOMANA_MK[1-4]$/.test(
            exactNationalBorehole.id
          ) &&
          interval.evidence_level === "regional_documented_interval"
        )
      ) &&
      interval.from_m !== null &&
      interval.to_m !== null &&
      Number.isFinite(interval.from_m) &&
      Number.isFinite(interval.to_m) &&
      interval.to_m > interval.from_m &&
      interval.material_bg.trim().length > 0
    )
    .sort((a, b) =>
      (a.from_m ?? 0) - (b.from_m ?? 0)
    );

  // Conflicting overlapping logs are not silently merged.
  const exactIntervalsHaveOverlap =
    exactIntervalsCandidate.some((interval, index) =>
      index > 0 &&
      interval.from_m! <
        exactIntervalsCandidate[index - 1].to_m! - 0.001
    );

  const exactDocumentedIntervals =
    exactIntervalsHaveOverlap ? [] : exactIntervalsCandidate;

  const exactColumnHasGaps =
    exactDocumentedIntervals.some((interval, index) =>
      index > 0 &&
      interval.from_m! >
        exactDocumentedIntervals[index - 1].to_m! + 0.001
    );

  const nationalEvidence = resolveNationalEvidence(lat, lng);
  const nationalReferenceColumns = nationalEvidence.references;

  // National dynamic-interval migration:
  // No user-facing layer may be inferred from a sampled midpoint.
  // Exact documented borehole columns and nearby reference columns
  // are rendered separately. Spatially predicted intervals will
  // replace this regional fallback only after geological approval.

  // SONDI_78AR_DOCUMENTED_REGIONAL_DISPLAY
  // Regional context is not a measured depth column.
  // Keep the established single-row regional presentation.
  const documentedNationalSequence =
    profile.target_national_depth_model.find(
      item =>
        item.engine === "NATIONAL_REGIONAL" &&
        (item.regional_sequence_context?.units.length ?? 0) > 0
    )?.regional_sequence_context;

  const regionalNationalAlternatives = Array.from(new Set(
    profile.target_national_depth_model
      .filter(item => item.engine === "NATIONAL_REGIONAL")
      .flatMap(item => item.alternative_lithologies)
      .filter(value => value.trim().length > 0)
  ));

  const documentedSequenceTranslations: Record<string, string> = {
    Quaternary:
      "Кватернерни наслаги: алувиални, еолични и еолично-алувиални отложения; чакъли, пясъци, глини и льос според местната тераса.",
    Romanian:
      "Румънски етаж: плътни жълтеникави глини с варовити конкреции; на места песъчливи глини и прослойки от глинест пясък.",
    Dacian:
      "Дакийски етаж: сиво-синкави песъчливи глини и пясъци; на места въглищни прослойки и песъчливи глини."
  };

  const nationalRegionalDisplayDetails = [
    ...(documentedNationalSequence
      ? [
          "Документирана геоложка последователност за района: " +
          documentedNationalSequence.units.map(unit =>
            documentedSequenceTranslations[unit.unit] ??
            (geologyTextBg(unit.unit) + ": " +
              geologyTextBg(unit.probable_material))
          ).join(" Следват ") +
          ". Тази последователност е регионална. " +
          "Не са установени точните дълбочини на границите " +
          "под избраната точка."
        ]
      : []),
    ...(regionalNationalAlternatives.length > 0
      ? [
          "Документирани регионални геоложки варианти: " +
          regionalNationalAlternatives
            .map(value => geologyTextBg(familyLabel(value)))
            .join("; ") +
          ". Не е потвърдено кой от тях се среща " +
          "на избраните координати."
        ]
      : [])
  ];

  const displayRows = [{
        ...regionalFallbackRow,
        material: "Регионален геоложки анализ",
        description: [
          regionalSurfaceExplanation ||
            sofiaRegionalSummary ||
            regionalDescription,
          "Това е регионална геоложка интерпретация, " +
          "а не доказателство за конкретен пласт " +
          "или точна дълбочина на геоложки контакт.",
          ...nationalRegionalDisplayDetails
        ].filter(Boolean).filter((value, index, all) =>
          all.indexOf(value) === index
        ).join(" ")
      }];

  // National documented contacts, independent of raster coverage.
  // These are measurements at neighbouring boreholes, NOT
  // a predicted contact beneath the selected coordinate.
  const nearbyDocumentedContactGroups =
    profile.target_national_depth_model.find(
      entry =>
        (entry.documented_contact_context?.length ?? 0) > 0
    )?.documented_contact_context ?? [];

  // At an actual documented borehole, the exact interval
  // presentation remains the primary information.
  const showNeighbourContactContext =
    nearbyDocumentedContactGroups.length > 0 &&
    nearbyDocumentedContactGroups.every(
      group => group.controls.every(
        control => control.distance_km > 0.001
      )
    );

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
  ).slice(0, Math.max(0, 3 - selectedWiderStudies.length));

  // SONDI_SOFIA_THREE_CARD_VIEW_V1
  // Regional fallback only; exact borehole evidence is preserved.
  // Use the complete shared geological report for Sofia too.
  // Keep the special summary code available for future review.
  const sofiaThreeCardView = false;

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

        {sofiaThreeCardView ? (
          <div
            data-sondi-sofia-three-cards="true"
            style={{ display: "grid", gap: 18, marginTop: 24 }}
          >
            <section
              style={{
                padding: 22,
                border: "1px solid #d9e7e9",
                borderRadius: 14,
                background: "#f8fbfa"
              }}
            >
              <div style={{
                color: "#0d8055",
                fontSize: 16,
                fontWeight: 800,
                marginBottom: 9
              }}>
                Регионален геоложки контекст
              </div>
              <h2 style={{
                margin: "0 0 12px",
                fontSize: 21,
                color: "#173f49"
              }}>
                Регионални геоложки варианти
              </h2>
              <p style={{ color: "#405a61", lineHeight: 1.7 }}>
                За избраната точка няма доказана непрекъсната
                литоложка колонка за избраните координати. Проучванията
                в София показват, че в различни части на града
                се срещат глини, пясъци, чакъли и по-стари,
                по-твърди скали.
              </p>
              <p style={{
                color: "#405a61",
                lineHeight: 1.7,
                marginBottom: 0
              }}>
                Дебелината и подредбата на тези материали
                не са еднакви навсякъде. Данните ни помагат
                да разберем какви пластове са възможни,
                но не доказват точно кой материал ще се
                срещне на дадена дълбочина под имота.
              </p>
            </section>

            <section
              style={{
                padding: 22,
                border: "1px solid #d9e7e9",
                borderRadius: 14,
                background: "#f8fbfa"
              }}
            >
              <h2 style={{
                margin: "0 0 12px",
                fontSize: 21,
                color: "#173f49"
              }}>
                Регионален геоложки анализ
              </h2>
              <p style={{ color: "#405a61", lineHeight: 1.7 }}>
                Софийската котловина има разнообразен геоложки
                строеж. В проучените части са описани речни
                и други наслаги от пясъци, чакъли и глини.
                Срещат се също по-стари седименти и твърди
                скални комплекси, като разпространението
                им се различава между отделните райони.
              </p>
              <p style={{ color: "#405a61", lineHeight: 1.7 }}>
                Глините обикновено пропускат водата
                по-трудно, докато пясъците и чакълите
                могат да я пропускат по-лесно.
                Това обаче не означава, че всеки
                песъчлив или чакълест пласт съдържа
                достатъчно подземна вода.
              </p>
              <p style={{
                color: "#405a61",
                lineHeight: 1.7,
                marginBottom: 0
              }}>
                При сондиране е възможно да се премине
                през материали с различна твърдост.
                Наличните карти и регионални проучвания
                дават полезна представа за условията,
                но точните граници между пластовете
                зависят от конкретното място.
              </p>
            </section>

            <section
              style={{
                padding: 22,
                border: "1px solid #d9e7e9",
                borderRadius: 14,
                background: "#f8fbfa"
              }}
            >
              <h2 style={{
                margin: "0 0 12px",
                fontSize: 21,
                color: "#173f49"
              }}>
                По-широк регионален геоложки анализ
              </h2>
              <p style={{ color: "#405a61", lineHeight: 1.7 }}>
                Документираните сондажи в различни части
                на София ни позволяват да сравним
                геоложкия строеж на отделни райони.
                Някои от тези проучвания достигат
                на повече от 500 метра дълбочина.
              </p>
              {selectedWiderStudies.map(study => (
                <div
                  key={study.id}
                  style={{
                    marginTop: 15,
                    paddingTop: 13,
                    borderTop: "1px solid #d9e7e9"
                  }}
                >
                  <h3 style={{
                    margin: "0 0 8px",
                    fontSize: 16,
                    color: "#173f49"
                  }}>
                    {study.title}
                  </h3>
                  {study.paragraphs.slice(0, 3).map(
                    (paragraph, index) => (
                      <p
                        key={index}
                        style={{
                          margin: "0 0 9px",
                          color: "#405a61",
                          lineHeight: 1.65
                        }}
                      >
                        {paragraph}
                      </p>
                    )
                  )}
                </div>
              ))}
              <p style={{
                margin: "17px 0 0",
                color: "#587179",
                lineHeight: 1.65
              }}>
                <strong>Общ извод:</strong> Разликите между
                проучените места показват защо не е
                правилно една сондажна колонка да се
                приема за цяла София. Сравнителните
                данни разширяват представата ни за
                геологията, но не доказват същата
                последователност под избраната точка.
              </p>
            </section>
          </div>
        ) : (
          <>

        {exactDocumentedIntervals.length === 0 &&
         nationalReferenceColumns.length > 0 && (
          <section style={{
            marginTop: 22,
            padding: 18,
            borderRadius: 14,
            background: "#f3f9fb",
            border: "1px solid #d9e7ea"
          }}>
            <h2 style={{
              margin: "0 0 9px",
              color: "#173f49",
              fontSize: 19
            }}>
              Документирани интервали в близки сондажи
            </h2>
            <p style={{
              color: "#405963",
              lineHeight: 1.6,
              margin: "0 0 14px"
            }}>
              Това са действителни наблюдения на местата
              на посочените сондажи. Не представляват
              измерена или потвърдена геоложка колонка
              под избраните координати.
            </p>
            {nationalReferenceColumns.map(column => (
              <details key={column.borehole_id} style={{
                marginBottom: 9,
                padding: 12,
                background: "#fff",
                border: "1px solid #d9e7ea",
                borderRadius: 9
              }}>
                <summary style={{
                  cursor: "pointer",
                  fontWeight: 700,
                  color: "#173f49"
                }}>
                  {column.borehole_id}
                  {" — "}
                  {column.distance_km.toFixed(2)} км
                  {" — "}
                  {column.intervals.length} интервала
                </summary>
                <div style={{ marginTop: 12 }}>
                  {column.intervals.map((interval, index) => (
                    <div key={index} style={{
                      padding: "8px 0",
                      borderTop: "1px solid #e4edef",
                      lineHeight: 1.5
                    }}>
                      <strong>
                        {interval.from_m.toLocaleString("bg-BG")}
                        {"–"}
                        {interval.to_m.toLocaleString("bg-BG")} м
                      </strong>
                      {" — "}{interval.material}
                      {interval.stratigraphy &&
                        <span>
                          {" ("}{interval.stratigraphy}{")"}
                        </span>
                      }
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </section>
        )}
        {exactDocumentedIntervals.length > 0 ? (
          <section
            data-sondi-exact-borehole-column="true"
            style={{
              marginTop: 24,
              padding: 20,
              borderRadius: 16,
              background: "#f3f9fb",
              border: "1px solid #bfd7de",
            }}
          >
            <h2 style={{
              margin: "0 0 8px",
              color: "#173f49",
              fontSize: 21,
            }}>
              Действителна литоложка колонка
            </h2>

            <p style={{
              margin: "0 0 8px",
              lineHeight: 1.65,
              color: "#405963",
            }}>
              Избраните координати съвпадат с официално
              документиран сондаж:{" "}
              <strong>{exactNationalBorehole?.id}</strong>.
              Дълбочините по-долу са от оригиналното сондажно
              описание, а не интерполация от съседни сондажи.
            </p>

            {exactColumnHasGaps && (
              <p style={{
                color: "#8a5b27",
                fontSize: 13,
                lineHeight: 1.6,
              }}>
                В документацията има непокрити интервали.
                Не приемаме, че материалите са непрекъснати
                през тези липсващи участъци.
              </p>
            )}

            <div style={{
              display: "grid",
              gap: 9,
              marginTop: 16,
            }}>
              {exactDocumentedIntervals.map((interval, index) => (
                <div
                  key={
                    interval.from_m + ":" +
                    interval.to_m + ":" + index
                  }
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(110px, 135px) minmax(0, 1fr)",
                    gap: 12,
                    borderRadius: 11,
                    padding: "13px 15px",
                    background: "#fff",
                    border: "1px solid #d9e7ea",
                  }}
                >
                  <div style={{
                    color: "#087452",
                    fontWeight: 800,
                    fontSize: 16,
                  }}>
                    {interval.from_m!.toLocaleString("bg-BG")}
                    {"–"}
                    {interval.to_m!.toLocaleString("bg-BG")} м
                  </div>

                  <div>
                    <div style={{
                      color: "#173f49",
                      fontWeight: 750,
                      overflowWrap: "anywhere",
                    }}>
                      {interval.material_bg}
                    </div>

                    {interval.stratigraphy && (
                      <div style={{
                        marginTop: 5,
                        fontSize: 12,
                        color: "#627984",
                      }}>
                        Геоложко означение:{" "}
                        {interval.stratigraphy}
                      </div>
                    )}

                    {interval.source_ids.length > 0 && (
                      <div style={{
                        marginTop: 6,
                        fontSize: 12,
                        color: "#627984",
                        overflowWrap: "anywhere",
                      }}>
                        Източник:{" "}
                        {interval.source_ids.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p style={{
              margin: "14px 0 0",
              fontSize: 13,
              lineHeight: 1.65,
              color: "#5e6f77",
            }}>
              Колонката описва геоложките материали в този
              сондаж. Тя не доказва наличието или дебита
              на подземна вода.
            </p>
          </section>
        ) : displayRows.length > 0 ? (
          <div
            style={{
              display: "grid",
              gap: 10,
              marginTop: 24,
            }}
          >
            <p style={{
              gridColumn: "1 / -1",
              margin: "0 0 12px",
              fontSize: 13,
              lineHeight: 1.6,
              color: "#52666c"
            }}>
              Посочените материали по дълбочини са прогноза
              според наличния геоложки модел, освен когато
              е представена действителна сондажна колонка.
              Те не доказват наличие на подземна вода.
            </p>
            {/* Unified national lithology display */}
            {displayRows.map((row: any) => (
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

                  {row.material && (
                    <div
                      style={{
                        marginTop: 5,
                        fontSize: 13,
                        lineHeight: 1.45,
                        color: "#4f666d",
                      }}
                    >
                      {sondiMaterialExplanation(String(row.material))}
                    </div>
                  )}

                  {sondiCleanDepthNote(row.evidenceNote) && (
                    <div
                      style={{
                        marginTop: 7,
                        fontSize: 11,
                        lineHeight: 1.45,
                        color: "#71858b",
                      }}
                    >
                      {sondiCleanDepthNote(row.evidenceNote)}
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: 5,
                      fontSize: 12,
                      color: "#71858b",
                    }}
                  >
                    {sondiMaterialConfidence(row.confidence)}
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
            Представен е регионален геоложки анализ.
            Местните сондажни данни не доказват
            конкретна вертикална колонка за избраната точка.
          </div>
        )}

        {showNeighbourContactContext && (
          <section
            data-sondi-national-contact-context="true"
            style={{
              marginTop: 24,
              marginBottom: 24,
              padding: 22,
              borderRadius: 16,
              border: "1px solid #bfd7de",
              background: "#f3f9fb",
            }}
          >
            <h2 style={{
              margin: "0 0 12px",
              fontSize: 21,
              color: "#173d49",
            }}>
              Какво показват сондажите в района?
            </h2>

            <p style={{
              color: "#405963",
              lineHeight: 1.7,
              margin: "0 0 18px",
            }}>
              В близките проучвателни сондажи са установени
              различни геоложки пластове и границите между тях.
              Данните дават представа за възможния строеж на
              района, но не доказват същите дълбочини под
              избрания имот.
            </p>

            <div style={{ display: "grid", gap: 14 }}>
              {nearbyDocumentedContactGroups.map(group => {
                const names: Record<string, string> = {
                  Q: "кватернерни наслаги",
                  N2: "неогенски седименти",
                  N1: "неогенски седименти",
                  J1: "долноюрски скали",
                  J2: "средноюрски скали",
                  J3: "горноюрски скали",
                  T1: "долнотриаски скали",
                  T2: "среднотриаски скали",
                  T3: "горнотриаски скали",
                };

                const upper =
                  names[group.upper_stratigraphy] ??
                  `геоложки комплекс ${group.upper_stratigraphy}`;

                const lower =
                  names[group.lower_stratigraphy] ??
                  `геоложки комплекс ${group.lower_stratigraphy}`;

                // National geological vocabulary: explanations of
                // complexes, not inferred lithology at the target.
                const geologicalExplanations: Record<string, string> = {
                  Q: "Кватернерните наслаги са сравнително млади материали. Могат да включват почви, пясъци, чакъли, глини и техни смеси.",
                  N2: "Неогенските седименти са по-стари наслаги. Могат да включват глини, пясъци и редуващи се глинести и песъчливи пластове.",
                  N1: "Неогенските седименти са по-стари наслаги. Могат да включват глини, пясъци и редуващи се глинести и песъчливи пластове.",
                  J1: "Долноюрските скали могат да включват пясъчници, глинести скали и други седиментни разновидности.",
                  J2: "Средноюрските скали могат да включват варовици, пясъчници и други седиментни разновидности според района.",
                  J3: "Горноюрските скали могат да включват варовици и други седиментни скали според района.",
                  T1: "Долнотриаските скали могат да включват пясъчници и други седиментни скали.",
                  T2: "Среднотриаските скали са значително по-стари. В много райони включват варовици и доломити, но точният състав зависи от конкретния геоложки разрез.",
                  T3: "Горнотриаските скали могат да включват карбонатни и други седиментни скали според района.",
                };

                const upperExplanation =
                  geologicalExplanations[group.upper_stratigraphy] ??
                  "Това е геоложки комплекс, определен по стратиграфската принадлежност на скалите. Точният му състав зависи от местния разрез.";

                const lowerExplanation =
                  geologicalExplanations[group.lower_stratigraphy] ??
                  "Това е различен геоложки комплекс. Конкретните скали и тяхната здравина трябва да се определят от местните геоложки данни.";

                return (
                  <div
                    key={
                      group.upper_stratigraphy + ":" +
                      group.lower_stratigraphy
                    }
                    style={{
                      padding: 18,
                      background: "#fff",
                      border: "1px solid #d9e7ea",
                      borderRadius: 13,
                    }}
                  >
                    <div style={{
                      fontWeight: 800,
                      fontSize: 17,
                      color: "#173d49",
                      lineHeight: 1.5,
                    }}>
                      Преход от {upper} към {lower}
                    </div>

                    <div style={{
                      marginTop: 5,
                      fontSize: 12,
                      color: "#617780",
                    }}>
                      Геоложко означение:{" "}
                      {group.upper_stratigraphy} →{" "}
                      {group.lower_stratigraphy}
                    </div>

                    <div style={{
                      marginTop: 14,
                      padding: "14px 16px",
                      borderRadius: 10,
                      background: "#f4f8f9",
                      color: "#405963",
                      lineHeight: 1.7,
                      fontSize: 14,
                    }}>
                      <strong>Какво означава това?</strong>
                      <p style={{margin: "7px 0"}}>
                        {upperExplanation}
                      </p>
                      <p style={{margin: "7px 0"}}>
                        {lowerExplanation}
                      </p>
                      <p style={{margin: "10px 0 0"}}>
                        <strong>За сондирането:</strong>{" "}
                        При преминаване между тези комплекси
                        е възможна промяна в състава, здравината
                        и поведението на скалите при пробиване.
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>

          </section>
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
            {sofiaRegionalSummary && (
              <p style={{ color: "#405a61", fontSize: 13, lineHeight: 1.65 }}>
                {sofiaRegionalSummary}
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
              {[
                  ...regionalCardsForDisplay.filter(card =>
                    // SONDI_HIDE_WELL_DEPTH_ONLY_CARDS_63DG
                    // Bare drilling depths are not geological studies.
                    !card.id.endsWith("-reference-intervals") &&
                    !card.id.endsWith("-well-depths")
                  ),
                  ...(regionalEvidenceCard
                    ? [regionalEvidenceCard]
                    : [])
                ].map((card, cardIndex) => (
                <div key={`${card.id}-${cardIndex}`} style={{ marginTop: 14, padding: 14, border: "1px solid #d9e7e9", borderRadius: 10, background: "#ffffff" }}>
                  <h3 style={{ margin: "0 0 7px", fontSize: 16, color: "#173f49" }}>{card.title}</h3>
                  {!card.id.endsWith("-reader-overview") && (<p style={{ margin: "0 0 8px", fontSize: 12, color: "#405a61" }}>Вид информация: {card.informationType}</p>)}
                  {card.id.endsWith("-reader-overview") ? (
                    <div style={{
                      marginTop: 12,
                      color: "#344f55",
                      fontSize: 14,
                      lineHeight: 1.75
                    }}>
                      {card.paragraphs.map((paragraph, index) => (
                        <p key={index} style={{ margin: "0 0 13px" }}>
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  ) : (
<details open={card.id.endsWith("-overview")}>
                    <summary style={{ cursor: "pointer", color: "#176c72", fontSize: 13, fontWeight: 700 }}>Покажи геоложките сведения</summary>
                    <ul style={{ margin: "12px 0 0", paddingLeft: 21, color: "#344f55", fontSize: 13, lineHeight: 1.8 }}>
                      {card.paragraphs.filter(item => item.trim().length > 0).map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                  </details>
                  )}
                  {!card.id.endsWith("-reader-overview") && (<p style={{ margin: "10px 0 0", fontSize: 11, color: "#71858b" }}>Източници: {card.sources.length ? card.sources.join(", ") : "Регионален геоложки модел"}</p>)}
                </div>
              ))}

              {/* SONDI_WIDER_STUDIES_V1 */}
              {sondiWiderStudies.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <h3 style={{
                    margin: "0 0 8px",
                    fontSize: 16,
                    color: "#173f49"
                  }}>
                    Допълнителни геоложки проучвания от по-широкия район
                  </h3>
                  <p style={{
                    color: "#587179",
                    fontSize: 12,
                    lineHeight: 1.6
                  }}>
                    Документирани сравнителни проучвания,
                    които допълват знанията за геоложкия
                    строеж на района.
                  </p>
                  {selectedWiderStudies.map(card => (
                    <div
                      key={card.id}
                      style={{
                        marginTop: 14,
                        padding: 14,
                        border: "1px solid #d9e7e9",
                        borderRadius: 10,
                        background: "#ffffff"
                      }}
                    >
                      <h3 style={{
                        margin: "0 0 7px",
                        fontSize: 16,
                        color: "#173f49"
                      }}>{card.title}</h3>
                      <p style={{
                        fontSize: 12,
                        color: "#405a61"
                      }}>
                        Вид информация: {card.informationType}
                      </p>
                      <details>
                        <summary style={{
                          cursor: "pointer",
                          color: "#176c72",
                          fontWeight: 700,
                          fontSize: 13
                        }}>
                          Покажи геоложките сведения
                        </summary>
                        <ul style={{
                          paddingLeft: 21,
                          color: "#344f55",
                          fontSize: 13,
                          lineHeight: 1.8
                        }}>
                          {card.paragraphs.map((paragraph, index) => (
                            <li key={index}>{paragraph}</li>
                          ))}
                        </ul>
                      </details>
                      <p style={{
                        marginTop: 10,
                        fontSize: 11,
                        color: "#71858b"
                      }}>
                        Източници: {card.sources.join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              )}

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


          </>
        )}

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