import Link from "next/link";
import { getGwbProfile } from "@/lib/gwb-profile";
import { getSpatialProfile } from "@/lib/spatial-profile";

type SearchParams = Promise<{
  gwb?: string;
  lat?: string;
  lng?: string;
}>;

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <section style={{
      background: "#fff",
      border: "1px solid #dce8eb",
      borderRadius: 18,
      padding: 20,
      boxShadow: "0 8px 28px rgba(16,62,73,.05)",
    }}>
      <h2 style={{
        margin: 0,
        color: "#123b46",
        fontSize: 19,
      }}>
        {title}
      </h2>

      {subtitle && (
        <p style={{
          margin: "6px 0 0",
          fontSize: 13,
          lineHeight: 1.5,
          color: "#708288",
        }}>
          {subtitle}
        </p>
      )}

      <div style={{ marginTop: 14 }}>
        {children}
      </div>
    </section>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "minmax(150px,220px) 1fr",
      gap: 12,
      padding: "8px 0",
      borderBottom: "1px solid #edf2f3",
      fontSize: 13,
    }}>
      <strong style={{ color: "#38535b" }}>
        {label}
      </strong>

      <div style={{ color: "#1f343a" }}>
        {value ?? "—"}
      </div>
    </div>
  );
}

function Status({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "good" | "bad" | "warn" | "neutral";
}) {
  const styles = {
    good: { bg: "#eaf7ef", fg: "#177344" },
    bad: { bg: "#fdecec", fg: "#b33434" },
    warn: { bg: "#fff4df", fg: "#9b6814" },
    neutral: { bg: "#edf3f4", fg: "#39555d" },
  };

  const s = styles[tone];

  return (
    <div style={{
      background: s.bg,
      borderRadius: 14,
      padding: 14,
    }}>
      <div style={{
        fontSize: 11,
        fontWeight: 800,
        opacity: .7,
        textTransform: "uppercase",
      }}>
        {label}
      </div>

      <div style={{
        marginTop: 5,
        fontSize: 17,
        fontWeight: 800,
        color: s.fg,
      }}>
        {value}
      </div>
    </div>
  );
}

export default async function ProPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const gwb =
    params.gwb?.trim() ||
    "BG3G00000NQ018";

  const lat = params.lat ?? null;
  const lng = params.lng ?? null;

  const spatial =
    getSpatialProfile(lat, lng);

  const profile = getGwbProfile(gwb);

  const climate = profile.climate;

  const formatClimatePercent = (
    value: unknown
  ) => {
    const n = Number(value);

    if (!Number.isFinite(n)) {
      return "—";
    }

    return `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;
  };

  const climateLongTerm45 =
    Number(climate?.rcp45?.["2071_2100"]);

  const climateLongTerm85 =
    Number(climate?.rcp85?.["2071_2100"]);

  const climateConclusion =
    Number.isFinite(climateLongTerm45) &&
    Number.isFinite(climateLongTerm85)
      ? (
          climateLongTerm45 < 0 &&
          climateLongTerm85 < 0
            ? "В дългосрочен план и двата климатични сценария прогнозират намаляване на естествения ресурс на подземното водно тяло."
            : climateLongTerm45 > 0 &&
              climateLongTerm85 > 0
              ? "В дългосрочен план и двата климатични сценария прогнозират увеличение на естествения ресурс на подземното водно тяло."
              : "Двата климатични сценария дават различна посока на дългосрочната промяна на естествения ресурс."
        )
      : "Няма достатъчно данни за дългосрочно заключение.";

  const significant =
    profile.significantPressure;

  const abstraction =
    profile.abstraction;

  const quantitative =
    profile.quantitativeRisk;

  const integrated =
    profile.integratedRisk;

  const chemical =
    significant?.chemical_status ??
    "Няма данни";

  const quantitativeStatus =
    significant?.quantitative_status ??
    "Няма данни";

  const quantRisk =
    quantitative?.final_quantitative_risk_label_bg ??
    "Няма данни";

  const exploitation =
    abstraction?.exploitation_index;

  const pollutants =
    integrated?.monitoring_2015_2020?.pollutants ??
    significant?.quality_parameters_outside_standard ??
    "Няма посочени";

  return (
    <main style={{
      minHeight: "100vh",
      background:
        "linear-gradient(180deg,#edf7f8 0,#f8fbfc 340px)",
      padding: "34px 18px 70px",
      color: "#20383f",
    }}>
      <div style={{
        maxWidth: 1180,
        margin: "0 auto",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}>
          <div>
            <div style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: ".12em",
              color: "#16825c",
            }}>
              SONDI PRO
            </div>

            <h1 style={{
              margin: "5px 0 0",
              fontSize: "clamp(28px,4vw,44px)",
              color: "#103944",
            }}>
              Анализ на избрана точка
            </h1>
          </div>

          <Link
            href="/map"
            style={{
              textDecoration: "none",
              background: "#0d8055",
              color: "#fff",
              padding: "10px 15px",
              borderRadius: 11,
              fontWeight: 700,
            }}
          >
            ← Към картата
          </Link>
        </div>

        <section style={{
          marginTop: 24,
          background: "#103e49",
          borderRadius: 22,
          padding: "24px clamp(18px,4vw,34px)",
          color: "#fff",
        }}>
          <div style={{
            fontSize: 12,
            opacity: .72,
            fontWeight: 700,
          }}>
            АНАЛИЗИРАНА ТОЧКА
          </div>

          <div style={{
            marginTop: 8,
            fontSize: 26,
            fontWeight: 800,
          }}>
            {lat && lng
              ? `${lat}, ${lng}`
              : "Точката ще бъде подадена от картата"}
          </div>

          <div style={{
            marginTop: 16,
            fontSize: 12,
            opacity: .68,
          }}>
            Подземно водно тяло
          </div>

          <div style={{
            marginTop: 3,
            fontSize: 18,
            fontWeight: 700,
          }}>
            {profile.identity.nameBg ||
              "Наименование не е намерено"}
          </div>

          <div style={{
            marginTop: 5,
            opacity: .75,
            fontFamily: "monospace",
          }}>
            {profile.gwbCode}
          </div>
        </section>

        <div style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(190px,1fr))",
          gap: 12,
          marginTop: 16,
        }}>
          <Status
            label="Химично състояние"
            value={chemical}
            tone={
              String(chemical).toLowerCase() === "лошо"
                ? "bad"
                : "good"
            }
          />

          <Status
            label="Количествено състояние"
            value={quantitativeStatus}
            tone={
              String(quantitativeStatus).toLowerCase() === "добро"
                ? "good"
                : "warn"
            }
          />

          <Status
            label="Количествен риск"
            value={quantRisk}
            tone={
              String(quantRisk)
                .toLowerCase()
                .includes("не в риск")
                ? "good"
                : String(quantRisk)
                    .toLowerCase()
                    .includes("в риск")
                  ? "bad"
                  : "neutral"
            }
          />

          <Status
            label="Експлоатационен индекс"
            value={
              exploitation == null
                ? "Няма данни"
                : Number(exploitation)
                    .toLocaleString("bg-BG", {
                      maximumFractionDigits: 2,
                    })
            }
            tone={
              exploitation >= .75
                ? "bad"
                : exploitation >= .5
                  ? "warn"
                  : "neutral"
            }
          />
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(340px,1fr))",
          gap: 16,
          marginTop: 26,
        }}>
          <Card
            title="1. Местоположение и подземно водно тяло"
            subtitle="Основна идентификация на анализираната точка."
          >
            <Row
              label="Координати"
              value={
                lat && lng
                  ? `${lat}, ${lng}`
                  : "Ще се подадат от картата"
              }
            />
            <Row
              label="ПВТ"
              value={profile.identity.nameBg}
            />
            <Row
              label="Код"
              value={profile.gwbCode}
            />
          </Card>

          <Card
            title="2. Геология и хидрогеология"
            subtitle="Ще се обогатява с данните от следващите раздели."
          >
            <div style={{
              padding: 12,
              background: "#f5f8f9",
              borderRadius: 10,
              color: "#708187",
              fontSize: 13,
            }}>
              Очаква допълнителни данни.
            </div>
          </Card>

          <Card
            title="3. Количествен ресурс"
            subtitle="Ресурс, водовземане и официален количествен риск."
          >
            <Row
              label="Разполагаем ресурс"
              value={
                abstraction?.available_resource_lps != null
                  ? `${Number(
                      abstraction.available_resource_lps
                    ).toLocaleString("bg-BG", {
                      maximumFractionDigits: 2,
                    })} l/s`
                  : "—"
              }
            />

            <Row
              label="Разрешено водовземане"
              value={
                abstraction?.permitted_total_lps != null
                  ? `${Number(
                      abstraction.permitted_total_lps
                    ).toLocaleString("bg-BG", {
                      maximumFractionDigits: 2,
                    })} l/s`
                  : "—"
              }
            />

            <Row
              label="Експлоатационен индекс"
              value={
                exploitation == null
                  ? "—"
                  : Number(exploitation)
                      .toLocaleString("bg-BG", {
                        maximumFractionDigits: 3,
                      })
              }
            />

            <Row
              label="Официален количествен риск"
              value={quantRisk}
            />
          </Card>

          <Card
            title="4. Натиск и риск от замърсяване"
            subtitle="Точков, дифузен и значим натиск."
          >
            <Row
              label="Точков натиск"
              value={
                profile.pointPressure
                  ?.potential_impact_percent != null
                  ? `${profile.pointPressure
                      .potential_impact_percent}%`
                  : "Налични подробни данни"
              }
            />

            <Row
              label="Дифузен натиск"
              value={
                profile.diffusePressure
                  ?.potential_impact_percent != null
                  ? `${profile.diffusePressure
                      .potential_impact_percent}%`
                  : "Налични подробни данни"
              }
            />

            <Row
              label="Риск от замърсяване"
              value={
                profile.pollutionRisk
                  ? "Налична официална оценка"
                  : "—"
              }
            />

            <Row
              label="Значим натиск"
              value={
                significant?.significant_pressures?.length
                  ? significant.significant_pressures.join(", ")
                  : "Не е посочен"
              }
            />
          </Card>

          <Card
            title="5. Химично състояние"
            subtitle="Проблемни показатели и интегрирана оценка."
          >
            <Row
              label="Химично състояние"
              value={chemical}
            />

            <Row
              label="Проблемни показатели"
              value={String(pollutants)}
            />

            <Row
              label="Мониторинг + дифузен натиск"
              value={
                integrated
                  ?.risk_assessment
                  ?.chemical_monitoring_plus_diffuse_pressure
                  ?.label_bg ??
                "—"
              }
            />

            <div style={{
              marginTop: 12,
              padding: 11,
              borderRadius: 10,
              background: "#eef7f5",
              color: "#47645d",
              fontSize: 12,
              lineHeight: 1.5,
            }}>
              Раздел 4 ще добави конкретните
              химични анализи и стойности.
            </div>
          </Card>

          <Card
            title="6. Мониторинг"
            subtitle="Химични и количествени пунктове около точката."
          >
            <div style={{
              padding: 12,
              background: "#f5f8f9",
              borderRadius: 10,
              color: "#708187",
              fontSize: 13,
            }}>
              Ще бъде свързано с мониторинговите
              данни и пространствения анализ.
            </div>
          </Card>

          <Card
            title="7. Климатична устойчивост"
            subtitle="Прогнозна промяна на естествения ресурс на подземното водно тяло — PRO."
          >
            {climate ? (
              <>
                <div style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(250px,1fr))",
                  gap: 14,
                }}>
                  <div style={{
                    padding: 14,
                    border: "1px solid #dce8eb",
                    borderRadius: 12,
                    background: "#f8fbfc",
                  }}>
                    <div style={{
                      fontWeight: 800,
                      color: "#123b46",
                      marginBottom: 6,
                    }}>
                      Сценарий RCP4.5
                    </div>

                    <Row
                      label="2013–2042"
                      value={formatClimatePercent(
                        climate.rcp45?.["2013_2042"]
                      )}
                    />
                    <Row
                      label="2021–2050"
                      value={formatClimatePercent(
                        climate.rcp45?.["2021_2050"]
                      )}
                    />
                    <Row
                      label="2071–2100"
                      value={formatClimatePercent(
                        climate.rcp45?.["2071_2100"]
                      )}
                    />
                  </div>

                  <div style={{
                    padding: 14,
                    border: "1px solid #dce8eb",
                    borderRadius: 12,
                    background: "#f8fbfc",
                  }}>
                    <div style={{
                      fontWeight: 800,
                      color: "#123b46",
                      marginBottom: 6,
                    }}>
                      Сценарий RCP8.5
                    </div>

                    <Row
                      label="2013–2042"
                      value={formatClimatePercent(
                        climate.rcp85?.["2013_2042"]
                      )}
                    />
                    <Row
                      label="2021–2050"
                      value={formatClimatePercent(
                        climate.rcp85?.["2021_2050"]
                      )}
                    />
                    <Row
                      label="2071–2100"
                      value={formatClimatePercent(
                        climate.rcp85?.["2071_2100"]
                      )}
                    />
                  </div>
                </div>

                <div style={{
                  marginTop: 14,
                  padding: 13,
                  borderRadius: 11,
                  background: "#eef7f5",
                  color: "#385b53",
                  fontSize: 13,
                  lineHeight: 1.55,
                }}>
                  <strong>Дългосрочна тенденция:</strong>{" "}
                  {climateConclusion}
                </div>


                <div style={{
                  marginTop: 8,
                  color: "#7b8b90",
                  fontSize: 11,
                }}>
                  Източник: Приложение 2.3.4.1 —
                  Източнобеломорски район.
                </div>
              </>
            ) : (
              <div style={{
                padding: 12,
                background: "#f5f8f9",
                borderRadius: 10,
                color: "#708187",
                fontSize: 13,
              }}>
                Няма налична климатична прогноза за
                избраното подземно водно тяло.
              </div>
            )}
          </Card>

          <Card
            title="8. Какво има около точката"
            subtitle="Официални сондажи, извори и мониторингови пунктове около избраните координати."
          >
            {spatial ? (
              <>
                <div style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(220px,1fr))",
                  gap: 12,
                }}>
                  <div style={{
                    padding: 14,
                    borderRadius: 12,
                    background: "#f8fbfc",
                    border: "1px solid #dce8eb",
                  }}>
                    <strong>
                      Сондажи около точката
                    </strong>

                    <Row
                      label="до 1 km"
                      value={spatial.counts.wells.km1}
                    />
                    <Row
                      label="до 5 km"
                      value={spatial.counts.wells.km5}
                    />
                    <Row
                      label="до 10 km"
                      value={spatial.counts.wells.km10}
                    />
                  </div>

                  <div style={{
                    padding: 14,
                    borderRadius: 12,
                    background: "#f8fbfc",
                    border: "1px solid #dce8eb",
                  }}>
                    <strong>
                      Извори и каптажи
                    </strong>

                    <Row
                      label="до 1 km"
                      value={spatial.counts.springs.km1}
                    />
                    <Row
                      label="до 5 km"
                      value={spatial.counts.springs.km5}
                    />
                    <Row
                      label="до 10 km"
                      value={spatial.counts.springs.km10}
                    />
                  </div>
                </div>

                {spatial.nearestWell && (
                  <div style={{
                    marginTop: 14,
                    padding: 14,
                    borderRadius: 12,
                    background: "#eef7f5",
                  }}>
                    <strong>
                      Най-близък сондаж
                    </strong>

                    <Row
                      label="Обект"
                      value={
                        spatial.nearestWell
                          .properties.facility ||
                        "—"
                      }
                    />

                    <Row
                      label="Разстояние"
                      value={
                        spatial.nearestWell
                          .distanceKm.toFixed(2) +
                        " km"
                      }
                    />

                    <Row
                      label="Дълбочина"
                      value={
                        spatial.nearestWell
                          .properties.depth_m
                          ? spatial.nearestWell
                              .properties.depth_m +
                            " m"
                          : "—"
                      }
                    />

                    <Row
                      label="Температура"
                      value={
                        spatial.nearestWell
                          .properties.temperature_c
                          ? spatial.nearestWell
                              .properties.temperature_c +
                            " °C"
                          : "—"
                      }
                    />

                    <Row
                      label="Находище"
                      value={
                        spatial.nearestWell
                          .properties.deposit ||
                        "—"
                      }
                    />
                  </div>
                )}

                {spatial.nearestSpring && (
                  <div style={{
                    marginTop: 12,
                    padding: 14,
                    borderRadius: 12,
                    background: "#eef6fa",
                  }}>
                    <strong>
                      Най-близък извор / каптаж
                    </strong>

                    <Row
                      label="Обект"
                      value={
                        spatial.nearestSpring
                          .properties.facility ||
                        "—"
                      }
                    />

                    <Row
                      label="Разстояние"
                      value={
                        spatial.nearestSpring
                          .distanceKm.toFixed(2) +
                        " km"
                      }
                    />

                    <Row
                      label="Находище"
                      value={
                        spatial.nearestSpring
                          .properties.deposit ||
                        "—"
                      }
                    />
                  </div>
                )}

                {spatial.nearestFault && (
                  <div style={{
                    marginTop: 12,
                    padding: 14,
                    borderRadius: 12,
                    background: "#fff6f1",
                    border: "1px solid #efd8ca",
                  }}>
                    <strong>
                      Най-близък активен разлом
                    </strong>

                    <Row
                      label="Разстояние"
                      value={
                        spatial.nearestFault
                          .distanceKm < 1
                          ? Math.round(
                              spatial.nearestFault
                                .distanceKm * 1000
                            ) + " m"
                          : spatial.nearestFault
                              .distanceKm.toFixed(2) +
                            " km"
                      }
                    />

                    <Row
                      label="Код"
                      value={
                        spatial.nearestFault
                          .properties.catalog_id ||
                        "—"
                      }
                    />

                    <Row
                      label="Каталог"
                      value={
                        spatial.nearestFault
                          .properties.catalog_name ||
                        "—"
                      }
                    />

                    <Row
                      label="Тип движение"
                      value={
                        spatial.nearestFault
                          .properties.slip_type ||
                        "—"
                      }
                    />

                    <Row
                      label="Качество на данните"
                      value={
                        spatial.nearestFault
                          .properties.epistemic_quality ||
                        "—"
                      }
                    />

                    <div style={{
                      marginTop: 10,
                      fontSize: 12,
                      lineHeight: 1.55,
                      color: "#715342",
                    }}>
                      Близостта до активен разлом
                      показва наличие на значима
                      структурна зона. Това може да
                      е важно за движението на
                      подземните води, но само по
                      себе си не доказва наличие
                      или дебит на вода в конкретната
                      точка.
                    </div>
                  </div>
                )}

                {spatial.nearestOfficialMonitoring && (
                  <div style={{
                    marginTop: 12,
                    padding: 14,
                    borderRadius: 12,
                    background: "#f4f1fb",
                  }}>
                    <strong>
                      Най-близък количествен мониторингов пункт
                    </strong>

                    <Row
                      label="Пункт"
                      value={
                        spatial
                          .nearestOfficialMonitoring
                          .properties.station_no ||
                        "—"
                      }
                    />

                    <Row
                      label="Местоположение"
                      value={
                        spatial
                          .nearestOfficialMonitoring
                          .properties.location ||
                        "—"
                      }
                    />

                    <Row
                      label="Разстояние"
                      value={
                        spatial
                          .nearestOfficialMonitoring
                          .distanceKm.toFixed(2) +
                        " km"
                      }
                    />

                    <Row
                      label="Дълбочина"
                      value={
                        spatial
                          .nearestOfficialMonitoring
                          .properties.depth_m != null
                          ? spatial
                              .nearestOfficialMonitoring
                              .properties.depth_m +
                            " m"
                          : "—"
                      }
                    />

                    <Row
                      label="Отчетено ниво 2019"
                      value={
                        spatial
                          .nearestOfficialMonitoring
                          .properties.level_2019_cm != null
                          ? spatial
                              .nearestOfficialMonitoring
                              .properties.level_2019_cm +
                            " cm"
                          : "—"
                      }
                    />

                    <Row
                      label="Отчетено ниво 2020"
                      value={
                        spatial
                          .nearestOfficialMonitoring
                          .properties.level_2020_cm != null
                          ? spatial
                              .nearestOfficialMonitoring
                              .properties.level_2020_cm +
                            " cm"
                          : "—"
                      }
                    />

                    <Row
                      label="ПВТ на пункта"
                      value={
                        spatial
                          .nearestOfficialMonitoring
                          .properties.gwb_code ||
                        "—"
                      }
                    />
                  </div>
                )}

                <div style={{
                  marginTop: 10,
                  color: "#708187",
                  fontSize: 11,
                  lineHeight: 1.5,
                }}>
                  Пространственият анализ използва
                  408 официално картографирани
                  водовземни и мониторингови
                  съоръжения и 107 пункта от
                  количествения мониторинг.
                </div>
              </>
            ) : (
              <div style={{
                padding: 12,
                background: "#f5f8f9",
                borderRadius: 10,
                color: "#708187",
              }}>
                За този анализ са необходими
                координати на избрана точка.
              </div>
            )}
          </Card>

          <Card
            title="9. Сондажна перспектива"
            subtitle="Оценка на локалния потенциал за проучване."
          >
            <div style={{
              padding: 12,
              background: "#fff7e8",
              borderRadius: 10,
              color: "#755e2b",
              fontSize: 13,
              lineHeight: 1.55,
            }}>
              Тази секция ще използва геологията,
              разломите, известните водоизточници,
              мониторинга и други локални данни.
            </div>
          </Card>

          <Card
            title="10. Препоръка за сондаж"
            subtitle="Практическа оценка за сондиране на същата анализирана точка."
          >
            {lat && lng ? (
              <>
                <div style={{
                  padding: 12,
                  background: "#eef7f5",
                  borderRadius: 10,
                  color: "#47645d",
                  fontSize: 13,
                  lineHeight: 1.55,
                }}>
                  Препоръката използва същите координати
                  като настоящия PRO анализ.
                </div>

                <Link
                  href={`/geology/report?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`}
                  style={{
                    display: "block",
                    marginTop: 12,
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: "#173f32",
                    color: "#ffffff",
                    textDecoration: "none",
                    textAlign: "center",
                    fontWeight: 800,
                  }}
                >
                  Отвори препоръките за сондиране →
                </Link>
              </>
            ) : (
              <div style={{
                padding: 12,
                background: "#f5f8f9",
                borderRadius: 10,
                color: "#708187",
                fontSize: 13,
              }}>
                За препоръка за сондаж първо трябва
                да бъде избрана точка от картата.
              </div>
            )}
          </Card>

          <Card
            title="11. Професионално заключение"
            subtitle="Обобщение на всички налични официални и пространствени данни."
          >
            <div style={{
              padding: 12,
              background: "#f5f8f9",
              borderRadius: 10,
              color: "#708187",
              fontSize: 13,
            }}>
              Ще се генерира след като свържем
              всички компоненти на анализа.
            </div>
          </Card>
        </div>

        <div style={{
          marginTop: 26,
          padding: 16,
          borderRadius: 14,
          border: "1px solid #ead9a8",
          background: "#fff8e6",
          color: "#665422",
          fontSize: 13,
          lineHeight: 1.6,
        }}>
          <strong>Важно:</strong>{" "}
          Регионалните данни за подземното водно
          тяло не доказват сами по себе си
          наличието, дълбочината, дебита или
          качеството на вода в конкретната точка.
          Сондажната препоръка ще използва и
          локалните данни около избраните координати.
        </div>
      </div>
    </main>
  );
}
