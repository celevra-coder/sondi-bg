import type {
  MineralWaterProfile,
} from "@/lib/mineral-water-profile";

type Props = {
  profile: MineralWaterProfile;
  geology: any;
  faultSpatial: any;
};

function text(
  value: any,
  fallback = "—"
) {
  const result =
    String(value ?? "").trim();

  return result || fallback;
}

function fmt(
  value: number | null,
  digits = 1
) {
  if (value === null) {
    return "—";
  }

  return Number(value).toLocaleString(
    "bg-BG",
    {
      maximumFractionDigits: digits,
    }
  );
}

function deep(
  value: any,
  keys: string[]
): any {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = deep(item, keys);

      if (
        found !== null &&
        found !== undefined &&
        found !== ""
      ) {
        return found;
      }
    }

    return null;
  }

  if (typeof value !== "object") {
    return null;
  }

  for (const key of keys) {
    if (
      value[key] !== null &&
      value[key] !== undefined &&
      value[key] !== ""
    ) {
      return value[key];
    }
  }

  for (const child of Object.values(value)) {
    const found = deep(child, keys);

    if (
      found !== null &&
      found !== undefined &&
      found !== ""
    ) {
      return found;
    }
  }

  return null;
}

function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const rad = (v: number) =>
    v * Math.PI / 180;

  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) *
      Math.cos(rad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return (
    6371 *
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )
  );
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
      <td>{value ?? "—"}</td>
    </tr>
  );
}

export default function MineralWaterPrintReport({
  profile,
  geology,
  faultSpatial,
}: Props) {
  const related =
    profile.relatedFacilities || [];

  const located =
    related.filter(
      item => item.hasCoordinates
    );

  const relatedDistances =
    profile.latitude !== null &&
    profile.longitude !== null
      ? located
          .map(item => ({
            ...item,
            distanceKm:
              item.latitude !== null &&
              item.longitude !== null
                ? distanceKm(
                    profile.latitude as number,
                    profile.longitude as number,
                    item.latitude,
                    item.longitude
                  )
                : null,
          }))
          .filter(
            item =>
              item.distanceKm !== null
          )
          .sort(
            (a, b) =>
              Number(a.distanceKm) -
              Number(b.distanceKm)
          )
      : [];

  const nearestFault =
    faultSpatial?.nearestGem ??
    faultSpatial?.nearestFault ??
    null;

  const rawFaultDistance =
    deep(
      nearestFault,
      [
        "distanceKm",
        "distance_km",
        "distance",
      ]
    );

  const fd = Number(rawFaultDistance);

  const faultDistance =
    Number.isFinite(fd)
      ? fd
      : null;

  const faultName =
    deep(
      nearestFault,
      [
        "name",
        "fault_name",
        "faultName",
        "catalog_id",
        "fault_id",
      ]
    );

  const lithology =
    geology?.lithology ?? null;

  const horizon =
    geology?.hydrogeological_horizon ??
    null;

  const collector =
    geology?.water_type ??
    geology?.collector_type ??
    null;

  const tectonics =
    geology?.tectonics ??
    geology?.tectonic_unit ??
    null;

  const permit =
    deep(
      profile.existingProperties,
      [
        "permit_number",
        "permit_no",
        "bddr_permit_reference",
      ]
    );

  const ownership =
    deep(
      profile.existingProperties,
      [
        "ownership_regime",
        "ownership",
      ]
    );

  const flow =
    deep(
      profile.existingProperties,
      [
        "technical_possible_flow_l_s",
        "flow_l_s",
        "discharge_l_s",
      ]
    );

  const temperatureText =
    profile.temperatureC !== null
      ? (
          profile.temperatureMin !== null &&
          profile.temperatureMax !== null &&
          profile.temperatureMin !==
            profile.temperatureMax
            ? `За избрания обект е публикувана температура ${fmt(profile.temperatureC)} °C. В свързаната минерална система наличните температурни стойности са приблизително ${fmt(profile.temperatureMin)}–${fmt(profile.temperatureMax)} °C. Разликите могат да отразяват различна дълбочина на циркулация, смесване със студени води и различно положение спрямо водопроводящите структури.`
            : `За избрания обект е публикувана температура ${fmt(profile.temperatureC)} °C.`
        )
      : (
          profile.temperatureMin !== null &&
          profile.temperatureMax !== null
            ? `За конкретното съоръжение няма публикувана температура, но за свързаната минерална система са налични стойности приблизително ${fmt(profile.temperatureMin)}–${fmt(profile.temperatureMax)} °C. Те са системен контекст и не трябва да се приписват директно на този обект.`
            : "За обекта и свързаната минерална система няма достатъчно публикувани температурни данни."
        );

  const depthText =
    profile.depthM !== null
      ? (
          profile.depthMin !== null &&
          profile.depthMax !== null &&
          profile.depthMin !==
            profile.depthMax
            ? `Публикуваната дълбочина на избрания обект е ${fmt(profile.depthM)} m. В свързаната система известните дълбочини са приблизително ${fmt(profile.depthMin)}–${fmt(profile.depthMax)} m, което показва, че минералната система може да се проявява на повече от едно дълбочинно ниво.`
            : `Публикуваната дълбочина на избрания обект е ${fmt(profile.depthM)} m.`
        )
      : (
          profile.depthMin !== null &&
          profile.depthMax !== null
            ? `За избрания обект няма публикувана дълбочина. При свързаните съоръжения са известни стойности приблизително ${fmt(profile.depthMin)}–${fmt(profile.depthMax)} m, които показват общия дълбочинен мащаб на системата.`
            : "За избрания обект няма достатъчно публикувани данни за дълбочината."
        );

  const geologyMeaning =
    `Геоложката и хидрогеоложката среда определят през какви скали и пластове циркулира водата, къде могат да съществуват пропускливи колектори и по-слабо пропускливи покривни слоеве и доколко е възможна дълбока циркулация. По-продължителният контакт със скалите и по-дълбоката циркулация могат да влияят върху температурата и минералния състав на водата.`;

  const faultMeaning =
    faultDistance !== null
      ? `Най-близката картографирана разломна структура${faultName ? ` (${String(faultName)})` : ""} е приблизително на ${fmt(faultDistance, 2)} km. Разломите и силно напуканите зони са важни при минералните води, защото могат да осигуряват пътища за дълбока циркулация и за възходящо движение на затоплена и минерализирана вода. Самата близост до разлом обаче не доказва пряка хидравлична връзка.`
      : `В наличния модел не е установена достатъчно ясно определена близка разломна структура. Това не изключва структурен контрол, а означава, че наличните картографски данни не позволяват той да бъде използван като силен аргумент.`;

  const conclusion =
    `Обектът „${profile.name}“ трябва да се разглежда като част от минерална водоносна система, а не като изолиран регистров запис. Най-надеждната оценка се получава от съвместното разглеждане на температурата и дълбочината, пространственото разпределение на свързаните съоръжения, геоложката и хидрогеоложката среда и разломния контекст. Когато няколко независими признака сочат към една и съща зона, увереността за обща минерална система е по-висока.`;

  return (
    <>
      <style>{`

        .sondi-mineral-water-print-report {
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

          .sondi-mineral-water-print-report,
          .sondi-mineral-water-print-report * {
            visibility: visible !important;
          }

          .sondi-mineral-water-print-report {
            display: block !important;
            position: absolute !important;
            inset: 0 auto auto 0 !important;
            width: 100% !important;
            background: #fff !important;
            color: #172c31 !important;
            font-family: Arial, Helvetica, sans-serif !important;
            font-size: 10.5pt !important;
            line-height: 1.48 !important;
          }

          .sondi-mineral-water-print-report h1 {
            margin: 0 0 4mm;
            color: #123f47;
            font-size: 23pt;
            line-height: 1.15;
          }

          .sondi-mineral-water-print-report h2 {
            margin: 0 0 3mm;
            padding-bottom: 2mm;
            border-bottom: 1px solid #cbdadc;
            color: #14596a;
            font-size: 14pt;
          }

          .mineral-print-section {
            margin-top: 7mm;
            break-inside: avoid;
          }

          .mineral-print-section.allow-break {
            break-inside: auto;
          }

          .mineral-print-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 2mm;
          }

          .mineral-print-table th,
          .mineral-print-table td {
            border-bottom: 1px solid #dce5e6;
            padding: 2.2mm 2mm;
            vertical-align: top;
            text-align: left;
          }

          .mineral-print-table th {
            width: 35%;
            color: #456068;
            font-weight: 700;
          }

          .mineral-print-lead {
            padding: 4mm;
            margin: 3mm 0;
            background: #f1f6f6;
            border-left: 3px solid #16825c;
          }

          .mineral-print-context {
            padding: 4mm;
            margin: 3mm 0;
            background: #eef7fa;
            border-left: 3px solid #167d96;
          }

          .mineral-print-warning {
            padding: 4mm;
            margin: 3mm 0;
            background: #fff7e7;
            border-left: 3px solid #d59a28;
          }

          .mineral-print-card {
            margin-top: 3mm;
            padding: 3mm;
            border: 1px solid #d5e0e2;
            border-radius: 2mm;
            break-inside: avoid;
          }

          .mineral-print-small {
            color: #60747a;
            font-size: 8.5pt;
          }

          .mineral-print-footer {
            margin-top: 8mm;
            padding-top: 3mm;
            border-top: 1px solid #bfcfd2;
            color: #60747a;
            font-size: 8.5pt;
          }

          .sondi-pro-screen {
            display: none !important;
          }
        }

      `}</style>

      <article className="sondi-mineral-water-print-report">
        <header>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4mm",
              marginBottom: "4mm",
            }}
          >
            <img
              src="/sondi-mark.png"
              alt="SONDI.BG"
              style={{
                width: "22mm",
                height: "22mm",
                objectFit: "contain",
              }}
            />

            <div>
              <div
                style={{
                  fontWeight: 800,
                  letterSpacing: ".12em",
                  color: "#167d96",
                  fontSize: "9pt",
                }}
              >
                SONDI.BG · SONDI EXPERT
              </div>

              <div
                style={{
                  marginTop: "1mm",
                  color: "#60747a",
                  fontSize: "9pt",
                }}
              >
                Минерални води
              </div>
            </div>
          </div>

          <h1>
            Подробен анализ на минерален водоизточник
          </h1>

          <div className="mineral-print-lead">
            <strong>{profile.name}</strong>
            <br />
            {profile.settlement
              ? `${profile.settlement} · `
              : ""}
            {profile.facilityType || "Минерално водовземно съоръжение"}
          </div>
        </header>

        <section className="mineral-print-section">
          <h2>1. Основни данни за обекта</h2>

          <table className="mineral-print-table">
            <tbody>
              <Row
                label="Име"
                value={profile.name}
              />
              <Row
                label="Тип"
                value={profile.facilityType}
              />
              <Row
                label="Населено място"
                value={profile.settlement}
              />
              <Row
                label="Находище"
                value={profile.deposit}
              />
              <Row
                label="Температура"
                value={
                  profile.temperatureC !== null
                    ? `${fmt(profile.temperatureC)} °C`
                    : "—"
                }
              />
              <Row
                label="Дълбочина"
                value={
                  profile.depthM !== null
                    ? `${fmt(profile.depthM)} m`
                    : "—"
                }
              />
              <Row
                label="Координати"
                value={
                  profile.latitude !== null &&
                  profile.longitude !== null
                    ? `${Number(profile.latitude).toFixed(7)}, ${Number(profile.longitude).toFixed(7)}`
                    : "—"
                }
              />
              <Row
                label="Координатен статус"
                value={profile.coordinateStatus}
              />
              <Row
                label="Разрешително / регистрова референция"
                value={text(permit)}
              />
              <Row
                label="Режим / собственост"
                value={text(ownership)}
              />
              <Row
                label="Публикуван дебит"
                value={
                  flow !== null &&
                  flow !== undefined
                    ? `${text(flow)} l/s`
                    : "—"
                }
              />
            </tbody>
          </table>
        </section>

        <section className="mineral-print-section">
          <h2>2. Температурен и дълбочинен профил</h2>

          <div className="mineral-print-context">
            {temperatureText}
          </div>

          <div className="mineral-print-context">
            {depthText}
          </div>
        </section>

        <section className="mineral-print-section allow-break">
          <h2>3. Свързани минерални съоръжения</h2>

          <p>
            Към същата минерална система са свързани{" "}
            <strong>{related.length}</strong>{" "}
            допълнителни съоръжения, от които{" "}
            <strong>{located.length}</strong>{" "}
            имат координати, подходящи за пространствено сравнение.
          </p>

          {relatedDistances.slice(0, 15).map(
            item => (
              <div
                className="mineral-print-card"
                key={item.mineralId}
              >
                <strong>{item.name}</strong>

                <div className="mineral-print-small">
                  {item.facilityType || "Минерално съоръжение"}
                  {" · "}
                  {fmt(
                    Number(item.distanceKm),
                    2
                  )} km
                  {item.temperatureC !== null
                    ? ` · ${fmt(item.temperatureC)} °C`
                    : ""}
                  {item.depthM !== null
                    ? ` · ${fmt(item.depthM)} m`
                    : ""}
                </div>
              </div>
            )
          )}

          {related.length > located.length && (
            <p className="mineral-print-small">
              Част от свързаните записи нямат достатъчно
              сигурна точна координата. Те участват в
              системния температурен и дълбочинен контекст,
              но не се използват за изчисляване на разстояния.
            </p>
          )}
        </section>

        <section className="mineral-print-section">
          <h2>4. Геоложка и хидрогеоложка среда</h2>

          <div className="mineral-print-lead">
            {geologyMeaning}
          </div>

          <table className="mineral-print-table">
            <tbody>
              <Row
                label="Литология"
                value={text(lithology)}
              />
              <Row
                label="Хидрогеоложки хоризонт"
                value={text(horizon)}
              />
              <Row
                label="Колектор / водоносна среда"
                value={text(collector)}
              />
              <Row
                label="Тектонски контекст"
                value={text(tectonics)}
              />
            </tbody>
          </table>
        </section>

        <section className="mineral-print-section">
          <h2>5. Разломи и структурен контекст</h2>

          <div className="mineral-print-context">
            {faultMeaning}
          </div>
        </section>

        <section className="mineral-print-section allow-break">
          <h2>6. Аналитично обобщение</h2>

          <p>{conclusion}</p>
        </section>

        <div className="mineral-print-footer">
          <strong>SONDI.BG</strong>
          <br />
          Отчетът обобщава налични регистрови,
          геоложки, хидрогеоложки и пространствени
          данни. Той не представлява доказателство
          за идентични характеристики извън
          конкретно документираните съоръжения и
          не заменя специализирано проучване на място.
        </div>
      </article>
    </>
  );
}
