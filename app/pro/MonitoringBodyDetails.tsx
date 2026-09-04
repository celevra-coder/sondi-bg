"use client";

import { useMemo, useState } from "react";

type MonitoringAssessment = {
  code: string;
  name?: string | null;
  chemicalStatus?: unknown;
  quantitativeStatus?: unknown;
  problemIndicators?: unknown;
  chemicalRisk?: unknown;
  quantitativeRisk?: unknown;
  upwardTrend?: unknown;
  chemicalMonitoring?: any[];
  quantitativeMonitoring?: any[];
  drinkingMonitoring?: any[];
  trendSeries?: any[];
  thresholds?: any[];
  exceedances?: any[];
  exceedanceStationCount?: number;
  exceedanceIndicators?: string[];
};

function asText(value: unknown) {
  return String(value ?? "").trim();
}

function normalized(value: unknown) {
  return asText(value).toLowerCase();
}

function atRisk(value: unknown) {
  const v = normalized(value);

  return (
    v.includes("\u0432 \u0440\u0438\u0441\u043a") &&
    !v.includes("\u043d\u0435 \u0432 \u0440\u0438\u0441\u043a") &&
    !v.includes("\u043d\u0435 \u0435 \u0432 \u0440\u0438\u0441\u043a")
  );
}

function problematic(item: MonitoringAssessment) {
  return (
    normalized(item.chemicalStatus) === "\u043b\u043e\u0448\u043e" ||
    normalized(item.quantitativeStatus) === "\u043b\u043e\u0448\u043e" ||
    atRisk(item.chemicalRisk) ||
    atRisk(item.quantitativeRisk) ||
    asText(item.problemIndicators).length > 0 ||
    Number(item.exceedanceStationCount || 0) > 0 ||
    (item.exceedances?.length || 0) > 0 ||
    normalized(item.upwardTrend) === "\u0434\u0430"
  );
}

function formatNumber(
  value: unknown,
  maximumFractionDigits = 6
) {
  if (
    value === null ||
    value === undefined ||
    (
      typeof value === "string" &&
      value.trim() === ""
    )
  ) {
    return "\u2014";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "\u2014";
  }

  return number.toLocaleString("bg-BG", {
    maximumFractionDigits,
  });
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns:
        "minmax(190px,1fr) minmax(70px,auto)",
      gap: 12,
      padding: "7px 0",
      borderBottom: "1px solid #e5edef",
      fontSize: 12,
    }}>
      <div style={{ color: "#587078" }}>
        {label}
      </div>

      <div style={{
        textAlign: "right",
        fontWeight: 800,
        color: "#214952",
      }}>
        {value}
      </div>
    </div>
  );
}

export default function MonitoringBodyDetails({
  assessments,
  initialCode,
}: {
  assessments: MonitoringAssessment[];
  initialCode: string;
}) {
  const initial =
    assessments.find(
      (item) =>
        item.code.toUpperCase() ===
        String(initialCode || "").toUpperCase()
    ) ??
    assessments[0] ??
    null;

  const [selectedCode, setSelectedCode] =
    useState(initial?.code ?? "");

  const selected = useMemo(
    () =>
      assessments.find(
        (item) =>
          item.code.toUpperCase() ===
          selectedCode.toUpperCase()
      ) ??
      initial,
    [assessments, selectedCode, initial]
  );

  if (!selected) {
    return null;
  }

  const trends =
    Array.isArray(selected.trendSeries)
      ? selected.trendSeries
      : [];

  const thresholds =
    Array.isArray(selected.thresholds)
      ? selected.thresholds
      : [];

  const exceedances =
    Array.isArray(selected.exceedances)
      ? selected.exceedances
      : [];

  const chemicalMonitoring =
    Array.isArray(selected.chemicalMonitoring)
      ? selected.chemicalMonitoring
      : [];

  const quantitativeMonitoring =
    Array.isArray(selected.quantitativeMonitoring)
      ? selected.quantitativeMonitoring
      : [];

  const drinkingMonitoring =
    Array.isArray(selected.drinkingMonitoring)
      ? selected.drinkingMonitoring
      : [];

  const isProblem =
    problematic(selected);

  return (
    <div style={{ marginTop: 14 }}>
      {assessments.length > 1 ? (
        <div style={{
          padding: 13,
          marginBottom: 12,
          borderRadius: 11,
          border: "1px solid #d3e1e4",
          background: "#f5f9fa",
        }}>
          <label
            htmlFor="monitoring-gwb-selector"
            style={{
              display: "block",
              marginBottom: 7,
              fontWeight: 900,
              fontSize: 13,
              color: "#214c56",
            }}
          >
            {
              "\u0418\u0437\u0431\u0435\u0440\u0438 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u043e \u0432\u043e\u0434\u043d\u043e \u0442\u044f\u043b\u043e \u0437\u0430 \u043f\u043e\u0434\u0440\u043e\u0431\u0435\u043d \u043c\u043e\u043d\u0438\u0442\u043e\u0440\u0438\u043d\u0433"
            }
          </label>

          <select
            id="monitoring-gwb-selector"
            value={selected.code}
            onChange={(event) =>
              setSelectedCode(event.target.value)
            }
            style={{
              width: "100%",
              minHeight: 46,
              padding: "8px 10px",
              borderRadius: 9,
              border: "1px solid #b9ccd1",
              background: "#fff",
              color: "#173f49",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {assessments.map((item) => {
              const isProblem =
                problematic(item);

              const status =
                asText(item.chemicalStatus);

              const indicators =
                asText(item.problemIndicators);

              const optionLabel =
                (isProblem ? "\u26a0 " : "") +
                item.code +
                " \u2014 " +
                (item.name || item.code) +
                (status
                  ? " \u2014 " + status
                  : "") +
                (indicators
                  ? " \u2014 " + indicators
                  : "");

              return (
                <option
                  key={item.code}
                  value={item.code}
                >
                  {optionLabel}
                </option>
              );
            })}
          </select>

          <div style={{
            marginTop: 8,
            fontSize: 11,
            lineHeight: 1.5,
            color: "#667a80",
          }}>
            {
              "\u0418\u0437\u0431\u043e\u0440\u044a\u0442 \u043f\u0440\u043e\u043c\u0435\u043d\u044f \u0441\u0430\u043c\u043e \u043f\u043e\u0434\u0440\u043e\u0431\u043d\u0438\u0442\u0435 \u043c\u043e\u043d\u0438\u0442\u043e\u0440\u0438\u043d\u0433\u043e\u0432\u0438 \u0434\u0430\u043d\u043d\u0438. \u041e\u0441\u043d\u043e\u0432\u043d\u043e\u0442\u043e \u041f\u0412\u0422 \u043d\u0430 PRO \u0430\u043d\u0430\u043b\u0438\u0437\u0430 \u043d\u0435 \u0441\u0435 \u043f\u0440\u043e\u043c\u0435\u043d\u044f."
            }
          </div>
        </div>
      ) : null}

      <div style={{
        padding: "11px 12px",
        marginBottom: 12,
        borderRadius: 10,
        background:
          isProblem
            ? "#fff4e5"
            : "#eef7f5",
        border:
          isProblem
            ? "1px solid #efc27b"
            : "1px solid #cfe5de",
      }}>
        <div style={{
          fontWeight: 900,
          color:
            isProblem
              ? "#8a4f00"
              : "#285d4d",
        }}>
          {isProblem
            ? "\u26a0 \u041f\u0440\u043e\u0431\u043b\u0435\u043c\u043d\u043e \u041f\u0412\u0422"
            : "\u0418\u0437\u0431\u0440\u0430\u043d\u043e \u041f\u0412\u0422"}
        </div>

        <div style={{
          marginTop: 5,
          fontWeight: 800,
          color: "#244951",
        }}>
          {selected.name || selected.code}
        </div>

        <div style={{
          marginTop: 2,
          fontFamily: "monospace",
          fontSize: 12,
          color: "#65777c",
        }}>
          {selected.code}
        </div>

        <div style={{
          marginTop: 8,
          fontSize: 12,
          lineHeight: 1.55,
          color: "#455f65",
        }}>
          {"\u0425\u0438\u043c\u0438\u0447\u043d\u043e \u0441\u044a\u0441\u0442\u043e\u044f\u043d\u0438\u0435: "}
          <strong>
            {asText(selected.chemicalStatus) || "\u2014"}
          </strong>

          <br />

          {"\u041a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u0435\u043d\u043e \u0441\u044a\u0441\u0442\u043e\u044f\u043d\u0438\u0435: "}
          <strong>
            {asText(selected.quantitativeStatus) || "\u2014"}
          </strong>

          {asText(selected.problemIndicators) ? (
            <>
              <br />
              {"\u041f\u0440\u043e\u0431\u043b\u0435\u043c\u043d\u0438 \u043f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u0438: "}
              <strong>
                {asText(selected.problemIndicators)}
              </strong>
            </>
          ) : null}
        </div>
      </div>

      <details style={{
        border: "1px solid #dce8eb",
        borderRadius: 11,
        padding: 12,
        background: "#f8fbfc",
      }}>
        <summary style={{
          cursor: "pointer",
          fontWeight: 900,
          color: "#245663",
        }}>
          {
            "\u0412\u0438\u0436 \u043f\u043e\u0434\u0440\u043e\u0431\u043d\u0438\u0442\u0435 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438 \u0434\u0430\u043d\u043d\u0438"
          }
        </summary>

        <div style={{
          marginTop: 14,
          display: "grid",
          gap: 16,
        }}>
          <section>
            <div style={{
              fontWeight: 900,
              marginBottom: 7,
            }}>
              {
                "\u041e\u0431\u043e\u0431\u0449\u0435\u043d\u0438 \u0441\u0442\u043e\u0439\u043d\u043e\u0441\u0442\u0438"
              }
            </div>

            <Row
              label={"\u0425\u0438\u043c\u0438\u0447\u043d\u0438 \u043c\u043e\u043d\u0438\u0442\u043e\u0440\u0438\u043d\u0433\u043e\u0432\u0438 \u043f\u0443\u043d\u043a\u0442\u043e\u0432\u0435"}
              value={String(chemicalMonitoring.length)}
            />

            <Row
              label={"\u041a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u0435\u043d\u0438 \u043c\u043e\u043d\u0438\u0442\u043e\u0440\u0438\u043d\u0433\u043e\u0432\u0438 \u043f\u0443\u043d\u043a\u0442\u043e\u0432\u0435"}
              value={String(quantitativeMonitoring.length)}
            />

            <Row
              label={"\u0412\u0440\u0435\u043c\u0435\u0432\u0438 \u0441\u0435\u0440\u0438\u0438"}
              value={String(trends.length)}
            />

            <Row
              label={"\u041f\u0438\u0442\u0435\u0439\u043d\u0438/\u0437\u0430\u0449\u0438\u0442\u043d\u0438 \u043c\u043e\u043d\u0438\u0442\u043e\u0440\u0438\u043d\u0433\u043e\u0432\u0438 \u043f\u0443\u043d\u043a\u0442\u043e\u0432\u0435"}
              value={String(drinkingMonitoring.length)}
            />

            <Row
              label={"\u041f\u0443\u043d\u043a\u0442\u043e\u0432\u0435 \u0441 \u043f\u0440\u0435\u0432\u0438\u0448\u0435\u043d\u0438\u044f"}
              value={String(
                selected.exceedanceStationCount ?? 0
              )}
            />

            <Row
              label={"\u0423\u0441\u0442\u0430\u043d\u043e\u0432\u0435\u043d\u0438 \u043f\u0440\u0435\u0432\u0438\u0448\u0435\u043d\u0438\u044f"}
              value={String(exceedances.length)}
            />

            <Row
              label={"\u041f\u0440\u0430\u0433\u043e\u0432\u0438 \u043f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u0438"}
              value={String(thresholds.length)}
            />
          </section>

          {trends.length > 0 ? (
            <section>
              <div style={{
                fontWeight: 900,
                marginBottom: 7,
              }}>
                {"\u0422\u0435\u043d\u0434\u0435\u043d\u0446\u0438\u0438"}
              </div>

              <div style={{
                display: "grid",
                gap: 8,
              }}>
                {trends.map(
                  (trend: any, index: number) => {
                    const points =
                      Array.isArray(trend?.points)
                        ? trend.points
                        : [];

                    const firstYear =
                      points[0]?.year ??
                      "\u2014";

                    const lastYear =
                      points[
                        points.length - 1
                      ]?.year ??
                      "\u2014";

                    const station =
                      trend?.station_name ??
                      trend?.monitoring_point ??
                      trend?.station_code ??
                      "\u2014";

                    const indicator =
                      trend?.indicator ??
                      trend?.pollutant ??
                      "\u2014";

                    const period =
                      trend?.period ??
                      (
                        points.length > 0
                          ? `${firstYear}\u2013${lastYear}`
                          : "\u2014"
                      );

                    return (
                      <div
                        key={`${trend?.station_code ?? trend?.monitoring_point ?? index}-${indicator}-${index}`}
                        style={{
                          padding: 10,
                          borderRadius: 9,
                          background: "#eef3f5",
                          fontSize: 12,
                          lineHeight: 1.5,
                        }}
                      >
                        <strong>
                          {station}
                        </strong>

                        <div>
                          {"\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b: "}
                          {indicator}
                        </div>

                        <div>
                          {"\u041f\u0435\u0440\u0438\u043e\u0434: "}
                          {period}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </section>
          ) : null}

          <section>
            <div style={{
              fontWeight: 900,
              marginBottom: 7,
            }}>
              {
                "\u0423\u0441\u0442\u0430\u043d\u043e\u0432\u0435\u043d\u0438 \u043f\u0440\u0435\u0432\u0438\u0448\u0435\u043d\u0438\u044f"
              }
            </div>

            {exceedances.length > 0 ? (
              <div style={{
                display: "grid",
                gap: 8,
              }}>
                {exceedances.map(
                  (item: any, index: number) => (
                    <div
                      key={`${item?.stationCode ?? index}-${item?.indicator ?? index}`}
                      style={{
                        padding: 10,
                        borderRadius: 9,
                        background: "#fff1f1",
                        border:
                          "1px solid #f1cccc",
                        fontSize: 12,
                        lineHeight: 1.5,
                      }}
                    >
                      <strong>
                        {
                          item?.stationName ??
                          item?.stationCode ??
                          "\u2014"
                        }
                      </strong>

                      <div>
                        {item?.indicator ?? "\u2014"}
                        :{" "}
                        {formatNumber(
                          item?.mean_value,
                          6
                        )}
                        {" / "}
                        {formatNumber(
                          item?.quality_standard,
                          6
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div style={{
                padding: 10,
                borderRadius: 9,
                background:
                  isProblem
                    ? "#fff4e5"
                    : "#eef7f5",
                color:
                  isProblem
                    ? "#7b5715"
                    : "#47645d",
                fontSize: 12,
                lineHeight: 1.55,
              }}>
                {
                  isProblem
                    ? "\u0412 \u043d\u0430\u043b\u0438\u0447\u043d\u0438\u0442\u0435 \u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0438\u0440\u0430\u043d\u0438 \u0437\u0430\u043f\u0438\u0441\u0438 \u043d\u044f\u043c\u0430 \u043e\u0442\u0434\u0435\u043b\u043d\u043e \u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0432\u0430\u043d\u043e \u0447\u0438\u0441\u043b\u043e\u0432\u043e \u043f\u0440\u0435\u0432\u0438\u0448\u0435\u043d\u0438\u0435 \u043f\u043e \u043c\u043e\u043d\u0438\u0442\u043e\u0440\u0438\u043d\u0433\u043e\u0432 \u043f\u0443\u043d\u043a\u0442. \u041e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0430\u0442\u0430 \u043e\u0446\u0435\u043d\u043a\u0430 \u0437\u0430 \u0446\u044f\u043b\u043e\u0442\u043e \u041f\u0412\u0422 \u043e\u0431\u0430\u0447\u0435 \u0435 \u043d\u0435\u0431\u043b\u0430\u0433\u043e\u043f\u0440\u0438\u044f\u0442\u043d\u0430 \u0438 \u0441\u043b\u0435\u0434\u0432\u0430 \u0434\u0430 \u0441\u0435 \u0440\u0430\u0437\u0433\u043b\u0435\u0436\u0434\u0430 \u043a\u0430\u0442\u043e \u0432\u043e\u0434\u0435\u0449\u0430."
                    : "\u041d\u044f\u043c\u0430 \u0443\u0441\u0442\u0430\u043d\u043e\u0432\u0435\u043d\u0438 \u043f\u0440\u0435\u0432\u0438\u0448\u0435\u043d\u0438\u044f \u0432 \u043d\u0430\u043b\u0438\u0447\u043d\u0438\u0442\u0435 \u0437\u0430\u043f\u0438\u0441\u0438."
                }
              </div>
            )}
          </section>

          <section>
            <div style={{
              fontWeight: 900,
              marginBottom: 7,
            }}>
              {
                "\u041f\u0440\u0430\u0433\u043e\u0432\u0438 \u0438 \u0444\u043e\u043d\u043e\u0432\u0438 \u0441\u0442\u043e\u0439\u043d\u043e\u0441\u0442\u0438"
              }
            </div>

            {thresholds.length > 0 ? (
              <div style={{
                display: "grid",
                gap: 8,
              }}>
                {thresholds.map(
                  (threshold: any, index: number) => (
                    <div
                      key={`${threshold?.indicator ?? index}-${index}`}
                      style={{
                        padding: 10,
                        borderRadius: 9,
                        background: "#eef3f5",
                        fontSize: 12,
                        lineHeight: 1.5,
                      }}
                    >
                      <strong>
                        {
                          threshold?.indicator ??
                          "\u2014"
                        }
                      </strong>

                      <div>
                        {"\u041f\u0440\u0430\u0433: "}
                        {formatNumber(
                          threshold?.threshold_value,
                          6
                        )}{" "}
                        {threshold?.unit ?? ""}
                      </div>

                      <div>
                        {"\u0424\u043e\u043d\u043e\u0432\u0430 \u0441\u0442\u043e\u0439\u043d\u043e\u0441\u0442: "}
                        {formatNumber(
                          threshold?.background_value,
                          6
                        )}{" "}
                        {threshold?.unit ?? ""}
                      </div>

                      <div>
                        {"\u0421\u0442\u0430\u043d\u0434\u0430\u0440\u0442: "}
                        {formatNumber(
                          threshold?.quality_standard,
                          6
                        )}{" "}
                        {threshold?.unit ?? ""}
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div style={{
                padding: 10,
                borderRadius: 9,
                background: "#fff7e5",
                color: "#765b20",
                fontSize: 12,
                lineHeight: 1.5,
              }}>
                {
                  "\u0417\u0430 \u0442\u043e\u0432\u0430 \u0432\u043e\u0434\u043d\u043e \u0442\u044f\u043b\u043e \u043d\u044f\u043c\u0430 \u043d\u0430\u0434\u0435\u0436\u0434\u043d\u043e \u0441\u0432\u044a\u0440\u0437\u0430\u043d\u0438 \u043f\u0440\u0430\u0433\u043e\u0432\u0438 \u0441\u0442\u043e\u0439\u043d\u043e\u0441\u0442\u0438."
                }
              </div>
            )}
          </section>
        </div>
      </details>
    </div>
  );
}
