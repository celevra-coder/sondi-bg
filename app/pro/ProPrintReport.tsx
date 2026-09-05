import FaultActivityMap from "./FaultActivityMap";

type Props = {
  lat: string | null;
  lng: string | null;
  profile: any;
  assessments: any[];
  faultSpatial: any;
  spatial: any;
  exploitation: any;
  quantitySummaryTitle: string;
  quantitySummaryText: string;
  chemicalSummaryTitle: string;
  chemicalSummaryText: string;
  monitoringSummary: string | null;
  drillingPerspectiveTitle: string;
  drillingPerspectiveText: string;
  drillingRecommendationTitle: string;
  drillingRecommendationParts: string[];
  professionalConclusionText: string;
};

function text(value: any, fallback = "\u2014") {
  const v = String(value ?? "").trim();
  return v || fallback;
}

function numberText(value: any, digits = 2) {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return "\u2014";
  }

  const n = Number(value);

  if (!Number.isFinite(n)) {
    return "\u2014";
  }

  return n.toLocaleString("bg-BG", {
    maximumFractionDigits: digits,
  });
}

function TableRow({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  return (
    <tr>
      <th>{label}</th>
      <td>{value ?? "\u2014"}</td>
    </tr>
  );
}

export default function ProPrintReport({
  lat,
  lng,
  profile,
  assessments,
  faultSpatial,
  spatial,
  exploitation,
  quantitySummaryTitle,
  quantitySummaryText,
  chemicalSummaryTitle,
  chemicalSummaryText,
  monitoringSummary,
  drillingPerspectiveTitle,
  drillingPerspectiveText,
  drillingRecommendationTitle,
  drillingRecommendationParts,
  professionalConclusionText,
}: Props) {
  const primaryCode =
    text(profile?.gwbCode, "");

  const primary =
    assessments.find(
      (item) =>
        String(item?.code || "").toUpperCase() ===
        primaryCode.toUpperCase()
    ) ??
    assessments[0] ??
    null;

  const primaryName =
    text(
      profile?.identity?.nameBg ??
      primary?.name
    );

  const nearestGem =
    faultSpatial?.nearestGem ?? null;

  const nearestGemCode =
    text(
      nearestGem?.properties?.catalog_id,
      "\u041d\u044f\u043c\u0430 \u0434\u0430\u043d\u043d\u0438"
    );

  const nearestGemDistance =
    nearestGem?.distanceKm != null
      ? (
          Number(nearestGem.distanceKm) < 1
            ? Math.round(
                Number(nearestGem.distanceKm) * 1000
              ) + " m"
            : numberText(
                nearestGem.distanceKm,
                2
              ) + " km"
        )
      : "\u2014";

  const mrrbAtPoint =
    Array.isArray(faultSpatial?.mrrbAtPoint)
      ? faultSpatial.mrrbAtPoint
      : [];

  const validated =
    Array.isArray(nearestGem?.validatedCrosswalks)
      ? nearestGem.validatedCrosswalks
      : [];

  const nearestOrdinary =
    spatial?.nearestOrdinaryWell ?? null;

  const nearestMineral =
    spatial?.nearestWell ?? null;

  const nearestSpring =
    spatial?.nearestSpring ?? null;

  return (
    <>
      <style>{`
        .sondi-print-report {
          display: none;
        }

        @page {
          size: A4;
          margin: 13mm 13mm 15mm;
        }

        @media print {
          html,
          body {
            background: #fff !important;
          }

          body * {
            visibility: hidden !important;
          }

          .sondi-print-report,
          .sondi-print-report * {
            visibility: visible !important;
          }

          .sondi-print-report {
            display: block !important;
            position: absolute !important;
            inset: 0 auto auto 0 !important;
            width: 100% !important;
            background: #fff !important;
            color: #172c31 !important;
            font-family:
              Arial, Helvetica, sans-serif !important;
            font-size: 10.5pt !important;
            line-height: 1.45 !important;
          }

          .sondi-print-report h1 {
            font-size: 23pt;
            line-height: 1.15;
            margin: 0 0 4mm;
            color: #123f47;
          }

          .sondi-print-report h2 {
            font-size: 14pt;
            margin: 0 0 3mm;
            padding-bottom: 2mm;
            border-bottom: 1px solid #cbdadc;
            color: #14596a;
          }

          .sondi-print-report h3 {
            font-size: 11.5pt;
            margin: 0 0 2mm;
            color: #233f45;
          }

          .sondi-print-section {
            margin-top: 7mm;
            break-inside: avoid;
          }

          .sondi-print-section.allow-break {
            break-inside: auto;
          }

          .sondi-print-lead {
            padding: 4mm;
            background: #f1f6f6;
            border-left: 3px solid #16825c;
            margin: 3mm 0;
          }

          .sondi-print-warning {
            padding: 4mm;
            background: #fff7e7;
            border-left: 3px solid #d59a28;
            margin: 3mm 0;
          }

          .sondi-print-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 2mm;
          }

          .sondi-print-table th,
          .sondi-print-table td {
            border-bottom: 1px solid #dce5e6;
            padding: 2.2mm 2mm;
            vertical-align: top;
            text-align: left;
          }

          .sondi-print-table th {
            width: 34%;
            color: #456068;
            font-weight: 700;
          }

          .sondi-print-bodies {
            display: grid;
            gap: 3mm;
          }

          .sondi-print-body {
            border: 1px solid #d5e0e2;
            padding: 3mm;
            border-radius: 2mm;
            break-inside: avoid;
          }

          .sondi-print-fault {
            margin: 3mm 0;
          }

          .sondi-print-fault > div > :not(:first-child) {
            display: none !important;
          }

          .sondi-print-fault svg {
            max-height: 92mm !important;
          }

          .sondi-print-small {
            color: #60747a;
            font-size: 8.5pt;
          }

          .sondi-print-footer-note {
            margin-top: 8mm;
            padding-top: 3mm;
            border-top: 1px solid #bfcfd2;
            font-size: 8.5pt;
            color: #60747a;
          }

          .sondi-pro-screen {
            display: none !important;
          }
        }
      `}</style>

      <article className="sondi-print-report">
        <header>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "4mm",
            marginBottom: "4mm",
          }}>
            <img
              src="/sondi-mark.png"
              alt="SONDI.BG"
              style={{
                width: "22mm",
                height: "22mm",
                objectFit: "contain",
              }}
            />
            <div style={{
              fontSize: "9pt",
              fontWeight: 800,
              letterSpacing: ".12em",
              color: "#167d96",
            }}>
              SONDI EXPERT
            </div>
          </div>

          <h1>
            {
              "\u041f\u0440\u043e\u0444\u0435\u0441\u0438\u043e\u043d\u0430\u043b\u0435\u043d \u0430\u043d\u0430\u043b\u0438\u0437 \u043d\u0430 \u0438\u0437\u0431\u0440\u0430\u043d\u0430 \u0442\u043e\u0447\u043a\u0430"
            }
          </h1>

          <table className="sondi-print-table">
            <tbody>
              <TableRow
                label={"\u041a\u043e\u043e\u0440\u0434\u0438\u043d\u0430\u0442\u0438"}
                value={
                  lat && lng
                    ? `${lat}, ${lng}`
                    : "\u2014"
                }
              />

              <TableRow
                label={"\u041e\u0441\u043d\u043e\u0432\u043d\u043e \u041f\u0412\u0422"}
                value={primaryName}
              />

              <TableRow
                label={"\u041a\u043e\u0434"}
                value={primaryCode || "\u2014"}
              />

              <TableRow
                label={"\u0411\u0440\u043e\u0439 \u043f\u0440\u0435\u0441\u0438\u0447\u0430\u0449\u0438 \u041f\u0412\u0422"}
                value={assessments.length}
              />
            </tbody>
          </table>
        </header>

        <section className="sondi-print-section">
          <h2>
            {"1. \u041e\u0431\u043e\u0431\u0449\u0435\u043d\u0438\u0435"}
          </h2>

          <div className="sondi-print-lead">
            <strong>{chemicalSummaryTitle}</strong>
            <div style={{ marginTop: "2mm" }}>
              {chemicalSummaryText}
            </div>
          </div>

          <table className="sondi-print-table">
            <tbody>
              <TableRow
                label={"\u0425\u0438\u043c\u0438\u0447\u043d\u043e \u0441\u044a\u0441\u0442\u043e\u044f\u043d\u0438\u0435"}
                value={text(primary?.chemicalStatus)}
              />

              <TableRow
                label={"\u041a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u0435\u043d\u043e \u0441\u044a\u0441\u0442\u043e\u044f\u043d\u0438\u0435"}
                value={text(primary?.quantitativeStatus)}
              />

              <TableRow
                label={"\u0425\u0438\u043c\u0438\u0447\u0435\u043d \u0440\u0438\u0441\u043a"}
                value={text(primary?.chemicalRisk)}
              />

              <TableRow
                label={"\u041a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u0435\u043d \u0440\u0438\u0441\u043a"}
                value={text(primary?.quantitativeRisk)}
              />

              <TableRow
                label={"\u0415\u043a\u0441\u043f\u043b\u043e\u0430\u0442\u0430\u0446\u0438\u043e\u043d\u0435\u043d \u0438\u043d\u0434\u0435\u043a\u0441"}
                value={numberText(exploitation, 3)}
              />
            </tbody>
          </table>
        </section>

        <section className="sondi-print-section">
          <h2>
            {"2. \u041f\u043e\u0434\u0437\u0435\u043c\u043d\u0438 \u0432\u043e\u0434\u043d\u0438 \u0442\u0435\u043b\u0430"}
          </h2>

          <div className="sondi-print-bodies">
            {assessments.map((item) => (
              <div
                className="sondi-print-body"
                key={item.code}
              >
                <h3>
                  {text(item.name, item.code)}
                </h3>

                <div className="sondi-print-small">
                  {item.code}
                </div>

                <table className="sondi-print-table">
                  <tbody>
                    <TableRow
                      label={"\u0425\u0438\u043c\u0438\u0447\u043d\u043e \u0441\u044a\u0441\u0442\u043e\u044f\u043d\u0438\u0435"}
                      value={text(item.chemicalStatus)}
                    />
                    <TableRow
                      label={"\u041a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u0435\u043d\u043e \u0441\u044a\u0441\u0442\u043e\u044f\u043d\u0438\u0435"}
                      value={text(item.quantitativeStatus)}
                    />
                    <TableRow
                      label={"\u041f\u0440\u043e\u0431\u043b\u0435\u043c\u043d\u0438 \u043f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u0438"}
                      value={text(item.problemIndicators)}
                    />
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </section>

        {faultSpatial && lat && lng ? (
          <section className="sondi-print-section">
            <h2>
              {"3. \u0420\u0430\u0437\u043b\u043e\u043c\u043d\u0430 \u0434\u0435\u0439\u043d\u043e\u0441\u0442"}
            </h2>

            <div className="sondi-print-fault">
              <FaultActivityMap
                faultSpatial={faultSpatial}
                lat={Number(lat)}
                lng={Number(lng)}
              />
            </div>

            <table className="sondi-print-table">
              <tbody>
                <TableRow
                  label={"\u041d\u0430\u0439-\u0431\u043b\u0438\u0437\u044a\u043a GEM \u0440\u0430\u0437\u043b\u043e\u043c"}
                  value={nearestGemCode}
                />

                <TableRow
                  label={"\u0420\u0430\u0437\u0441\u0442\u043e\u044f\u043d\u0438\u0435"}
                  value={nearestGemDistance}
                />

                <TableRow
                  label="MRRB"
                  value={
                    mrrbAtPoint.length > 0
                      ? "\u0422\u043e\u0447\u043a\u0430\u0442\u0430 \u043f\u043e\u043f\u0430\u0434\u0430 \u0432 \u043a\u0430\u0440\u0442\u043e\u0433\u0440\u0430\u0444\u0438\u0440\u0430\u043d \u043a\u043e\u0440\u0438\u0434\u043e\u0440"
                      : "\u0422\u043e\u0447\u043a\u0430\u0442\u0430 \u0435 \u0438\u0437\u0432\u044a\u043d \u043a\u0430\u0440\u0442\u043e\u0433\u0440\u0430\u0444\u0438\u0440\u0430\u043d MRRB \u043a\u043e\u0440\u0438\u0434\u043e\u0440"
                  }
                />

                <TableRow
                  label={"\u0412\u0430\u043b\u0438\u0434\u0438\u0440\u0430\u043d\u0438 \u043a\u0430\u0442\u0430\u043b\u043e\u0433\u043e\u0432\u0438 \u0432\u0440\u044a\u0437\u043a\u0438"}
                  value={validated.length}
                />
              </tbody>
            </table>

            <div className="sondi-print-small" style={{
              marginTop: "2mm",
            }}>
              {
                "\u0411\u043b\u0438\u0437\u043e\u0441\u0442\u0442\u0430 \u0434\u043e \u0440\u0430\u0437\u043b\u043e\u043c\u043d\u0430 \u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0430 \u0435 \u0445\u0438\u0434\u0440\u043e\u0433\u0435\u043e\u043b\u043e\u0436\u043a\u0438 \u0444\u0430\u043a\u0442\u043e\u0440, \u043d\u043e \u0441\u0430\u043c\u0430 \u043f\u043e \u0441\u0435\u0431\u0435 \u0441\u0438 \u043d\u0435 \u0434\u043e\u043a\u0430\u0437\u0432\u0430 \u043d\u0430\u043b\u0438\u0447\u0438\u0435, \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430 \u0438\u043b\u0438 \u0434\u0435\u0431\u0438\u0442 \u043d\u0430 \u0432\u043e\u0434\u0430."
              }
            </div>
          </section>
        ) : null}

        <section className="sondi-print-section">
          <h2>
            {"4. \u041a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u0435\u043d \u0440\u0435\u0441\u0443\u0440\u0441"}
          </h2>

          <div className="sondi-print-lead">
            <strong>{quantitySummaryTitle}</strong>
            <div style={{ marginTop: "2mm" }}>
              {quantitySummaryText}
            </div>
          </div>
        </section>

        <section className="sondi-print-section allow-break">
          <h2>
            {"5. \u041c\u043e\u043d\u0438\u0442\u043e\u0440\u0438\u043d\u0433"}
          </h2>

          {monitoringSummary ? (
            <p>{monitoringSummary}</p>
          ) : null}

          <table className="sondi-print-table">
            <thead>
              <tr>
                <th>{"\u041f\u0412\u0422"}</th>
                <th>{"\u0425\u0438\u043c."}</th>
                <th>{"\u041a\u043e\u043b."}</th>
                <th>{"\u041f\u0438\u0442\u0435\u0439\u043d\u0438"}</th>
                <th>{"\u0422\u0435\u043d\u0434\u0435\u043d\u0446\u0438\u0438"}</th>
                <th>{"\u041f\u0440\u0435\u0432\u0438\u0448\u0435\u043d\u0438\u044f"}</th>
              </tr>
            </thead>

            <tbody>
              {assessments.map((item) => (
                <tr key={`m-${item.code}`}>
                  <td>
                    <strong>{item.code}</strong>
                    <br />
                    {text(item.name)}
                  </td>
                  <td>
                    {item.chemicalMonitoring?.length ?? 0}
                  </td>
                  <td>
                    {item.quantitativeMonitoring?.length ?? 0}
                  </td>
                  <td>
                    {item.drinkingMonitoring?.length ?? 0}
                  </td>
                  <td>
                    {item.trendSeries?.length ?? 0}
                  </td>
                  <td>
                    {item.exceedances?.length ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {assessments.map((item) =>
            Array.isArray(item.exceedances) &&
            item.exceedances.length > 0 ? (
              <div
                key={`e-${item.code}`}
                style={{ marginTop: "4mm" }}
              >
                <h3>
                  {
                    "\u0423\u0441\u0442\u0430\u043d\u043e\u0432\u0435\u043d\u0438 \u043f\u0440\u0435\u0432\u0438\u0448\u0435\u043d\u0438\u044f \u2014 "
                  }
                  {item.code}
                </h3>

                <table className="sondi-print-table">
                  <tbody>
                    {item.exceedances.map(
                      (entry: any, index: number) => (
                        <tr key={index}>
                          <td>
                            {text(
                              entry.stationName ??
                              entry.stationCode
                            )}
                          </td>
                          <td>
                            {text(entry.indicator)}
                          </td>
                          <td>
                            {numberText(
                              entry.mean_value,
                              6
                            )}
                            {" / "}
                            {numberText(
                              entry.quality_standard,
                              6
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            ) : null
          )}
        </section>

        <section className="sondi-print-section">
          <h2>
            {"6. \u041b\u043e\u043a\u0430\u043b\u043d\u0438 \u0434\u0430\u043d\u043d\u0438 \u043e\u043a\u043e\u043b\u043e \u0442\u043e\u0447\u043a\u0430\u0442\u0430"}
          </h2>

          <table className="sondi-print-table">
            <tbody>
              <TableRow
                label={"\u041e\u0431\u0438\u043a\u043d\u043e\u0432\u0435\u043d\u0438 \u0432\u043e\u0434\u043e\u0432\u0437\u0435\u043c\u043d\u0438 \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u044f \u0434\u043e 5 km"}
                value={
                  spatial?.counts
                    ?.ordinaryWells?.km5 ?? 0
                }
              />

              <TableRow
                label={"\u041d\u0430\u0439-\u0431\u043b\u0438\u0437\u043a\u043e \u043e\u0431\u0438\u043a\u043d\u043e\u0432\u0435\u043d\u043e \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u0435"}
                value={
                  nearestOrdinary
                    ? (
                        text(
                          nearestOrdinary?.properties?.name ??
                          nearestOrdinary?.properties?.object_name
                        ) +
                        " \u2014 " +
                        numberText(
                          nearestOrdinary.distanceKm,
                          2
                        ) +
                        " km"
                      )
                    : "\u2014"
                }
              />

              <TableRow
                label={"\u041d\u0430\u0439-\u0431\u0438\u0437\u044a\u043a \u043c\u0438\u043d\u0435\u0440\u0430\u043b\u0435\u043d \u0441\u043e\u043d\u0434\u0430\u0436"}
                value={
                  nearestMineral
                    ? (
                        text(
                          nearestMineral?.properties?.name ??
                          nearestMineral?.properties?.object_name
                        ) +
                        " \u2014 " +
                        numberText(
                          nearestMineral.distanceKm,
                          2
                        ) +
                        " km"
                      )
                    : "\u2014"
                }
              />

              <TableRow
                label={"\u041d\u0430\u0439-\u0431\u043b\u0438\u0437\u044a\u043a \u043c\u0438\u043d\u0435\u0440\u0430\u043b\u0435\u043d \u0438\u0437\u0432\u043e\u0440/\u043a\u0430\u043f\u0442\u0430\u0436"}
                value={
                  nearestSpring
                    ? (
                        text(
                          nearestSpring?.properties?.name ??
                          nearestSpring?.properties?.object_name
                        ) +
                        " \u2014 " +
                        numberText(
                          nearestSpring.distanceKm,
                          2
                        ) +
                        " km"
                      )
                    : "\u2014"
                }
              />
            </tbody>
          </table>
        </section>

        <section className="sondi-print-section">
          <h2>
            {"7. \u0421\u043e\u043d\u0434\u0430\u0436\u043d\u0430 \u043f\u0435\u0440\u0441\u043f\u0435\u043a\u0442\u0438\u0432\u0430"}
          </h2>

          <div className="sondi-print-warning">
            <strong>{drillingPerspectiveTitle}</strong>
            <div style={{ marginTop: "2mm" }}>
              {drillingPerspectiveText}
            </div>
          </div>

          <h3 style={{ marginTop: "4mm" }}>
            {drillingRecommendationTitle}
          </h3>

          {drillingRecommendationParts.length > 0 ? (
            <ul>
              {drillingRecommendationParts.map(
                (item, index) => (
                  <li key={index}>{item}</li>
                )
              )}
            </ul>
          ) : null}
        </section>

        <section className="sondi-print-section allow-break">
          <h2>
            {"8. \u0417\u0430\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u0435"}
          </h2>

          <p>{professionalConclusionText}</p>
        </section>

        <div className="sondi-print-footer-note">
          <strong>SONDI.BG</strong>
          <br />
          {
            "\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u044a\u0442 \u043e\u0431\u043e\u0431\u0449\u0430\u0432\u0430 \u043d\u0430\u043b\u0438\u0447\u043d\u0438 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438, \u0440\u0435\u0433\u0438\u043e\u043d\u0430\u043b\u043d\u0438 \u0438 \u043f\u0440\u043e\u0441\u0442\u0440\u0430\u043d\u0441\u0442\u0432\u0435\u043d\u0438 \u0434\u0430\u043d\u043d\u0438. \u0422\u0435 \u043d\u0435 \u0434\u043e\u043a\u0430\u0437\u0432\u0430\u0442 \u0441\u0430\u043c\u0438 \u043f\u043e \u0441\u0435\u0431\u0435 \u0441\u0438 \u043d\u0430\u043b\u0438\u0447\u0438\u0435\u0442\u043e, \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430\u0442\u0430, \u0434\u0435\u0431\u0438\u0442\u0430 \u0438\u043b\u0438 \u043a\u0430\u0447\u0435\u0441\u0442\u0432\u043e\u0442\u043e \u043d\u0430 \u0432\u043e\u0434\u0430\u0442\u0430 \u0432 \u043a\u043e\u043d\u043a\u0440\u0435\u0442\u0435\u043d \u0438\u043c\u043e\u0442."
          }
        </div>
      </article>
    </>
  );
}
