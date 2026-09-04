type Props = {
  data: any;
  professional: any;
  geologyProfile: any;
  drillingRiskItems: string[];
  drillingFieldControlItems: string[];
  filterRecommendation: string;
  cementationRecommendation: string;
};

function text(value: any, fallback = "\u2014") {
  const v = String(value ?? "").trim();
  return v || fallback;
}

function num(value: any, digits = 1) {
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

function Row({
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

export default function DrillingPrintReport({
  data,
  professional,
  geologyProfile,
  drillingRiskItems,
  drillingFieldControlItems,
  filterRecommendation,
  cementationRecommendation,
}: Props) {
  const nearestOrdinary =
    professional?.nearestOrdinary ?? null;

  const nearestFault =
    professional?.nearestFault ?? null;

  const gwbCode =
    text(
      professional?.selectedGwbCode ??
      professional?.gwbCode ??
      data?.gwbCode ??
      data?.gwb?.code,
      "\u2014"
    );

  const gwbName =
    text(
      professional?.gwbName ??
      data?.gwbName ??
      data?.gwb?.name ??
      geologyProfile?.name,
      "\u2014"
    );

  return (
    <>
      <style>{`
        .sondi-drilling-print-report {
          display: none;
        }

        @page {
          size: A4;
          margin: 13mm 13mm 15mm;
        }

        @media print {
          body * {
            visibility: hidden !important;
          }

          .sondi-drilling-print-report,
          .sondi-drilling-print-report * {
            visibility: visible !important;
          }

          .sondi-drilling-print-report {
            display: block !important;
            position: absolute !important;
            inset: 0 auto auto 0 !important;
            width: 100% !important;
            background: white !important;
            color: #172c31 !important;
            font-family:
              Arial, Helvetica, sans-serif !important;
            font-size: 10.5pt !important;
            line-height: 1.45 !important;
          }

          .sondi-drilling-print-report h1 {
            font-size: 23pt;
            line-height: 1.15;
            margin: 0 0 4mm;
            color: #123f47;
          }

          .sondi-drilling-print-report h2 {
            font-size: 14pt;
            color: #14596a;
            border-bottom: 1px solid #cbdadc;
            padding-bottom: 2mm;
            margin: 0 0 3mm;
          }

          .sondi-drilling-print-report h3 {
            font-size: 11.5pt;
            color: #233f45;
            margin: 4mm 0 2mm;
          }

          .drill-print-section {
            margin-top: 7mm;
            break-inside: avoid;
          }

          .drill-print-section.allow-break {
            break-inside: auto;
          }

          .drill-print-table {
            width: 100%;
            border-collapse: collapse;
          }

          .drill-print-table th,
          .drill-print-table td {
            padding: 2.2mm 2mm;
            border-bottom: 1px solid #dce5e6;
            vertical-align: top;
            text-align: left;
          }

          .drill-print-table th {
            width: 36%;
            color: #456068;
          }

          .drill-print-note {
            padding: 4mm;
            border-left: 3px solid #16825c;
            background: #f1f6f6;
            margin-top: 3mm;
          }

          .drill-print-warning {
            padding: 4mm;
            border-left: 3px solid #d59a28;
            background: #fff7e7;
            margin-top: 3mm;
          }

          .drill-print-footer {
            margin-top: 8mm;
            padding-top: 3mm;
            border-top: 1px solid #bfcfd2;
            color: #60747a;
            font-size: 8.5pt;
          }

          .sondi-drilling-screen {
            display: none !important;
          }
        }
      `}</style>

      <article className="sondi-drilling-print-report">
        <header>
          <div style={{
            fontWeight: 800,
            letterSpacing: ".12em",
            color: "#16825c",
            fontSize: "9pt",
            marginBottom: "2mm",
          }}>
            SONDI EXPERT
          </div>

          <h1>
            {
              "\u0421\u043e\u043d\u0434\u0430\u0436\u0435\u043d \u0438 \u0433\u0435\u043e\u043b\u043e\u0436\u043a\u0438 \u043e\u0442\u0447\u0435\u0442"
            }
          </h1>

          <table className="drill-print-table">
            <tbody>
              <Row
                label={"\u041a\u043e\u043e\u0440\u0434\u0438\u043d\u0430\u0442\u0438"}
                value={
                  `${Number(data.lat).toFixed(6)}, ${Number(data.lon).toFixed(6)}`
                }
              />

              <Row
                label={"\u041f\u043e\u0434\u0437\u0435\u043c\u043d\u043e \u0432\u043e\u0434\u043d\u043e \u0442\u044f\u043b\u043e"}
                value={gwbName}
              />

              <Row
                label={"\u041a\u043e\u0434"}
                value={gwbCode}
              />
            </tbody>
          </table>
        </header>

        <section className="drill-print-section">
          <h2>
            {"1. \u0413\u0435\u043e\u043b\u043e\u0436\u043a\u0430 \u0438 \u0445\u0438\u0434\u0440\u043e\u0433\u0435\u043e\u043b\u043e\u0436\u043a\u0430 \u0441\u0440\u0435\u0434\u0430"}
          </h2>

          <table className="drill-print-table">
            <tbody>
              <Row
                label={"\u041b\u0438\u0442\u043e\u043b\u043e\u0433\u0438\u044f"}
                value={text(
                  geologyProfile?.lithology ??
                  geologyProfile?.main_lithology
                )}
              />

              <Row
                label={"\u0422\u0438\u043f \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0430 \u0441\u0440\u0435\u0434\u0430"}
                value={text(
                  geologyProfile?.aquifer_type ??
                  geologyProfile?.water_bearing_environment ??
                  geologyProfile?.hydrogeological_environment
                )}
              />

              <Row
                label={"\u0425\u0438\u0434\u0440\u043e\u0433\u0435\u043e\u043b\u043e\u0436\u043a\u0438 \u0445\u043e\u0440\u0438\u0437\u043e\u043d\u0442"}
                value={text(
                  geologyProfile?.hydrogeological_horizon ??
                  geologyProfile?.horizon
                )}
              />

              <Row
                label={"\u0425\u0430\u0440\u0430\u043a\u0442\u0435\u0440 \u043d\u0430 \u0432\u043e\u0434\u0438\u0442\u0435"}
                value={text(
                  geologyProfile?.water_character ??
                  geologyProfile?.pressure_character
                )}
              />

              <Row
                label={"\u0414\u0435\u0431\u0435\u043b\u0438\u043d\u0430 \u043d\u0430 \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0438\u044f \u043f\u043b\u0430\u0441\u0442"}
                value={
                  geologyProfile?.aquifer_thickness_m != null
                    ? (
                        text(
                          geologyProfile.aquifer_thickness_m
                        ) + " m"
                      )
                    : "\u2014"
                }
              />
            </tbody>
          </table>
        </section>

        <section className="drill-print-section">
          <h2>
            {"2. \u041b\u043e\u043a\u0430\u043b\u043d\u0438 \u0441\u043e\u043d\u0434\u0430\u0436\u043d\u0438 \u043e\u0440\u0438\u0435\u043d\u0442\u0438\u0440\u0438"}
          </h2>

          <table className="drill-print-table">
            <tbody>
              <Row
                label={"\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u0430\u043d\u0438 \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u044f \u0434\u043e 1 km"}
                value={professional?.ordinaryCount1Km ?? 0}
              />

              <Row
                label={"\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u0430\u043d\u0438 \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u044f \u0434\u043e 3 km"}
                value={professional?.ordinaryCount3Km ?? 0}
              />

              <Row
                label={"\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u0430\u043d\u0438 \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u044f \u0434\u043e 5 km"}
                value={professional?.ordinaryCount5Km ?? 0}
              />

              <Row
                label={"\u041d\u0430\u0439-\u0431\u043b\u0438\u0437\u043a\u043e \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u0430\u043d\u043e \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u0435"}
                value={
                  nearestOrdinary
                    ? (
                        text(
                          nearestOrdinary?.properties?.name ??
                          nearestOrdinary?.properties?.object_name
                        ) +
                        " \u2014 " +
                        num(
                          nearestOrdinary.distanceKm,
                          2
                        ) +
                        " km"
                      )
                    : "\u2014"
                }
              />

              <Row
                label={"\u0414\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0438 \u043d\u0430 \u0431\u043b\u0438\u0437\u043a\u0438 \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u044f"}
                value={
                  professional?.depthMin != null &&
                  professional?.depthMax != null
                    ? (
                        `${num(professional.depthMin, 0)} \u2013 ${num(professional.depthMax, 0)} m`
                      )
                    : "\u2014"
                }
              />

              <Row
                label={"\u041c\u0435\u0434\u0438\u0430\u043d\u043d\u0430 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430"}
                value={
                  professional?.depthMedian != null
                    ? num(
                        professional.depthMedian,
                        0
                      ) + " m"
                    : "\u2014"
                }
              />

              <Row
                label={"\u041d\u0430\u0439-\u0431\u043b\u0438\u0437\u044a\u043a \u043a\u0430\u0440\u0442\u043e\u0433\u0440\u0430\u0444\u0438\u0440\u0430\u043d \u0440\u0430\u0437\u043b\u043e\u043c"}
                value={
                  nearestFault?.distanceKm != null
                    ? (
                        num(
                          nearestFault.distanceKm,
                          2
                        ) + " km"
                      )
                    : "\u2014"
                }
              />
            </tbody>
          </table>

          <div className="drill-print-note">
            {
              "\u0414\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0438\u0442\u0435 \u043d\u0430 \u0441\u044a\u0441\u0435\u0434\u043d\u0438 \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u044f \u0441\u0430 \u0440\u0435\u0433\u0438\u043e\u043d\u0430\u043b\u0435\u043d \u043e\u0440\u0438\u0435\u043d\u0442\u0438\u0440, \u0430 \u043d\u0435 \u043f\u0440\u0435\u0434\u043f\u0438\u0441\u0430\u043d\u0430 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430 \u0437\u0430 \u043a\u043e\u043d\u043a\u0440\u0435\u0442\u043d\u0438\u044f \u0441\u043e\u043d\u0434\u0430\u0436."
            }
          </div>
        </section>

        <section className="drill-print-section allow-break">
          <h2>
            {"3. \u0422\u0435\u0445\u043d\u0438\u0447\u0435\u0441\u043a\u0438 \u0440\u0438\u0441\u043a\u043e\u0432\u0435"}
          </h2>

          <ul>
            {drillingRiskItems.map(
              (item, index) => (
                <li
                  key={index}
                  style={{ marginBottom: "2mm" }}
                >
                  {item}
                </li>
              )
            )}
          </ul>
        </section>

        <section className="drill-print-section">
          <h2>
            {"4. \u041e\u0431\u0441\u0430\u0436\u0434\u0430\u043d\u0435, \u0444\u0438\u043b\u0442\u044a\u0440 \u0438 \u0438\u0437\u043e\u043b\u0438\u0440\u0430\u043d\u0435"}
          </h2>

          <h3>
            {"\u0424\u0438\u043b\u0442\u044a\u0440\u0435\u043d \u0443\u0447\u0430\u0441\u0442\u044a\u043a"}
          </h3>

          <p>{filterRecommendation}</p>

          <h3>
            {"\u041e\u0431\u0441\u0430\u0436\u0434\u0430\u043d\u0435 \u0438 \u0446\u0438\u043c\u0435\u043d\u0442\u0430\u0446\u0438\u044f"}
          </h3>

          <p>{cementationRecommendation}</p>
        </section>

        <section className="drill-print-section allow-break">
          <h2>
            {"5. \u041a\u043e\u043d\u0442\u0440\u043e\u043b \u043f\u043e \u0432\u0440\u0435\u043c\u0435 \u043d\u0430 \u0441\u043e\u043d\u0434\u0438\u0440\u0430\u043d\u0435"}
          </h2>

          <ul>
            {drillingFieldControlItems.map(
              (item, index) => (
                <li
                  key={index}
                  style={{ marginBottom: "2mm" }}
                >
                  {item}
                </li>
              )
            )}
          </ul>
        </section>

        <section className="drill-print-section">
          <h2>
            {"6. \u041f\u0440\u0430\u043a\u0442\u0438\u0447\u0435\u0441\u043a\u0430 \u043f\u0440\u0435\u043f\u043e\u0440\u044a\u043a\u0430"}
          </h2>

          <div className="drill-print-warning">
            {
              "\u0422\u043e\u0447\u043d\u0438\u0442\u0435 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0438 \u043d\u0430 \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0438\u0442\u0435 \u0438\u043d\u0442\u0435\u0440\u0432\u0430\u043b\u0438, \u043a\u043e\u043d\u0441\u0442\u0440\u0443\u043a\u0446\u0438\u044f\u0442\u0430 \u0438 \u0444\u0438\u043b\u0442\u0440\u0438\u0440\u0430\u043d\u0435\u0442\u043e \u0441\u0435 \u043e\u043a\u043e\u043d\u0447\u0430\u0442\u0435\u043b\u043d\u043e \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u0442 \u043f\u043e \u0440\u0435\u0430\u043b\u043d\u0438\u044f \u0441\u043e\u043d\u0434\u0430\u0436\u0435\u043d \u0440\u0430\u0437\u0440\u0435\u0437 \u0438 \u043f\u043e\u0432\u0435\u0434\u0435\u043d\u0438\u0435\u0442\u043e \u043d\u0430 \u0432\u043e\u0434\u0430\u0442\u0430 \u043f\u0440\u0438 \u043f\u0440\u043e\u0431\u0438\u0432\u0430\u043d\u0435."
            }
          </div>
        </section>

        <div className="drill-print-footer">
          <strong>SONDI.BG</strong>
          <br />
          {
            "\u041e\u0442\u0447\u0435\u0442\u044a\u0442 \u0435 \u043f\u0440\u043e\u0444\u0435\u0441\u0438\u043e\u043d\u0430\u043b\u043d\u0430 \u0438\u043d\u0442\u0435\u0440\u043f\u0440\u0435\u0442\u0430\u0446\u0438\u044f \u043d\u0430 \u043d\u0430\u043b\u0438\u0447\u043d\u0438\u0442\u0435 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438 \u0438 \u043f\u0440\u043e\u0441\u0442\u0440\u0430\u043d\u0441\u0442\u0432\u0435\u043d\u0438 \u0434\u0430\u043d\u043d\u0438. \u041d\u0435 \u0437\u0430\u043c\u0435\u0441\u0442\u0432\u0430 \u0433\u0435\u043e\u0444\u0438\u0437\u0438\u0447\u043d\u043e, \u0445\u0438\u0434\u0440\u043e\u0433\u0435\u043e\u043b\u043e\u0436\u043a\u043e \u0438\u043b\u0438 \u0438\u043d\u0436\u0435\u043d\u0435\u0440\u043d\u043e \u043f\u0440\u043e\u0443\u0447\u0432\u0430\u043d\u0435 \u043d\u0430 \u043c\u044f\u0441\u0442\u043e."
          }
        </div>
      </article>
    </>
  );
}
