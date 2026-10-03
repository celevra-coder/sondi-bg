import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase-server";
import {
  getLithologyProfile,
  type LithologyProfile,
} from "@/lib/lithology-profile";
import { synthesizeLithologyEvidence } from "@/lib/lithology-synthesis";

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
    [20, 50, 100, 150, 200, 300];

  const rows =
    synthesis.evidence_level === "DIRECT"
      ? (() => {
          const direct =
            profile.direct_borehole_evidence?.[0];

          if (!direct) {
            return [];
          }

          return checkpoints
            .map(depth => {
              const interval =
                direct.lithology.find(
                  item => {
                    const from =
                      Number(item.depth_from_m);

                    const to =
                      Number(item.depth_to_m);

                    return (
                      Number.isFinite(from) &&
                      Number.isFinite(to) &&
                      depth >= from &&
                      depth <= to
                    );
                  }
                );

              if (!interval) {
                return null;
              }

              return {
                depth,
                material:
                  interval.expected_material_bg ||
                  "Документиран литоложки интервал",
                description:
                  "Материалът е установен в документиран сондажен разрез на тази точка.",
                confidence:
                  "документиран сондаж",
                analogueCount: 1,
              };
            })
            .filter(Boolean);
        })()
      : synthesis.depth_profile
          .filter(
            item =>
              item.comparison_family != null
          )
          .map(item => ({
            depth: item.depth_m,
            material: familyLabel(
              item.comparison_family!
            ),
            description: familyDescription(
              item.comparison_family!
            ),
            confidence:
              confidenceLabel(
                item.confidence
              ),
            analogueCount:
              item.analogue_count,
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