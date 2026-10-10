import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase-server";
import {
  getLithologyProfile,
  type LithologyProfile,
} from "@/lib/lithology-profile";
import { synthesizeLithologyEvidence } from "@/lib/lithology-synthesis";
import { buildUnifiedLithology } from "@/lib/lithology-unified-synthesis";

type SearchParams = Promise<{
  lat?: string;
  lng?: string;
  lon?: string;
  analysis_id?: string;
  location_label?: string;
  target?: string;
}>;

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

  const checkpoints =
    [20, 50, 80, 100, 150, 200, 300];


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
    const direct: Record<string, string> = {
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

  const rawRows = unified.map(point => {
    const material = point.material
      ? geologyTextBg(familyLabel(point.material))
      : point.alternatives.length > 0
        ? "Точният пласт не е установен"
        : "Недостатъчно геоложки данни";

    const simpleMaterial =
      /Neogene clay-sand|неогенски глинесто-песъчлив/i.test(material)
        ? "Глини и пясъци"
        : material;

    const evidence = point.evidence_kind;

    const description =
      !point.material && point.alternatives.length > 0
        ? "Възможни са: " +
          point.alternatives.slice(0, 2)
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

    const confidence =
      evidence === "DIRECT_BOREHOLE"
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
      description,
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
    depth: row.startDepth === row.endDepth
      ? String(row.startDepth)
      : `${row.startDepth}–${row.endDepth}`,
    material: row.material,
    description: row.checkpoints.length > 1
      ? `${row.description} Сходен резултат при проверените дълбочини: ${
          row.checkpoints.join(", ")
        } м. Това не доказва непрекъснат пласт между тях.`
      : row.description,
    confidence: row.confidence,
    analogueCount: row.analogueCount,
  }));
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
                  {row.depth} m
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