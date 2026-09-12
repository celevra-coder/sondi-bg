import type {
  MineralWaterAreaProfile,
} from "@/lib/mineral-water-profile";

type Props = {
  profile: MineralWaterAreaProfile;
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

export default function MineralAreaPrintReport({
  profile,
  geology,
  faultSpatial,
}: Props) {
  const nearest =
    profile.nearestFacility;

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

  const geologyText =
    [
      lithology,
      horizon,
      collector,
      tectonics,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("bg");

  let score = 0;

  if (nearest) {
    if (nearest.distanceKm <= 1) {
      score += 4;
    } else if (nearest.distanceKm <= 5) {
      score += 3;
    } else if (nearest.distanceKm <= 10) {
      score += 2;
    } else {
      score += 1;
    }
  }

  if (profile.within5Km >= 3) {
    score += 2;
  } else if (profile.within5Km > 0) {
    score += 1;
  }

  if (profile.within10Km >= 5) {
    score += 1;
  }

  if (faultDistance !== null) {
    if (faultDistance <= 1) {
      score += 2;
    } else if (faultDistance <= 5) {
      score += 1;
    }
  }

  if (
    geologyText.includes("карст") ||
    geologyText.includes("варовик") ||
    geologyText.includes("доломит") ||
    geologyText.includes("пукнат") ||
    geologyText.includes("fractur") ||
    geologyText.includes("гранит") ||
    geologyText.includes("тектон")
  ) {
    score += 1;
  }

  const potential =
    score >= 7
      ? "Повишен"
      : score >= 4
        ? "Умерен"
        : score >= 2
          ? "Локално проявен"
          : "Ограничен";

  const geologyMeaning =
    `При минералните води геоложката среда има пряко значение за начина на циркулация. Тя определя какви скали и пластове изграждат системата, къде могат да съществуват пропускливи колектори, дали има по-слабо пропускливи покривни слоеве и доколко е възможна продължителна дълбока циркулация. По-дългият контакт със скалите и по-голямата дълбочина могат да влияят върху температурата и минерализацията на водата.`;

  const surfaceContext =
    geologyText.includes("алув")
      ? `В геоложкия контекст присъства алувиална среда. Такива наслаги могат да включват чакъли, пясъци, прах и глини и често формират порови водоносни хоризонти. При минералните води плитката алувиална среда сама по себе си не е доказателство за минерален произход, но може да приема и разпространява вода, постъпваща от по-дълбока структурна система.`
      : geologyText.includes("глин")
        ? `Наличието на глинести или по-слабо пропускливи материали може да разделя отделни водоносни нива и локално да ограничава вертикалното движение на вода. Значението им зависи от дебелината и непрекъснатостта на слоя.`
        : `За повърхностните и покривните наслаги няма достатъчно детайлна точкова информация, затова те не се използват като самостоятелен индикатор за минерална вода.`;

  const faultMeaning =
    faultDistance !== null
      ? `Най-близката картографирана разломна структура${faultName ? ` (${String(faultName)})` : ""} е приблизително на ${fmt(faultDistance, 2)} km. Разломите и силно напуканите зони са важни, защото могат да осигуряват пътища за по-дълбока циркулация и за възходящо движение на затоплена и минерализирана вода към по-плитки нива. Най-силен е аргументът, когато близка разломна структура съвпада пространствено с доказани минерални проявления и подходяща геоложка среда. Самото наличие на разлом не доказва минерална вода.`
      : `В наличния картографски модел не е установена достатъчно ясно определена близка разломна структура. Това намалява структурната подкрепа на оценката, но не изключва некартографирани или по-слабо проучени нарушения.`;

  const objectsText =
    nearest
      ? `Най-близкият известен минерален обект е „${nearest.name}“ на приблизително ${fmt(nearest.distanceKm, 2)} km. В радиус до 1 km има ${profile.within1Km} локализирани обекта, до 5 km — ${profile.within5Km}, до 10 km — ${profile.within10Km}, а до 25 km — ${profile.within25Km}.`
      : `В радиус до 25 km в наличната база не е намерено локализирано минерално съоръжение.`;

  const temperatureText =
    profile.temperatureMin !== null &&
    profile.temperatureMax !== null
      ? (
          profile.temperatureMin ===
          profile.temperatureMax
            ? `Наличната температура за минералните съоръжения в системата е ${fmt(profile.temperatureMin)} °C.`
            : `Публикуваните температури за минералните съоръжения, свързани с района, са приблизително ${fmt(profile.temperatureMin)}–${fmt(profile.temperatureMax)} °C.`
        )
      : `Няма достатъчно публикувани температурни данни за близките минерални обекти.`;

  const depthText =
    profile.depthMin !== null &&
    profile.depthMax !== null
      ? (
          profile.depthMin ===
          profile.depthMax
            ? `Наличната публикувана дълбочина е ${fmt(profile.depthMin)} m.`
            : `Известните дълбочини на свързаните минерални съоръжения са приблизително ${fmt(profile.depthMin)}–${fmt(profile.depthMax)} m.`
        )
      : `Няма достатъчно публикувани данни за дълбочината на близките минерални съоръжения.`;

  const conclusion =
    potential === "Повишен"
      ? `Съвкупността от наличните данни показва повишен минерален потенциал на района. Оценката се подкрепя от пространствената близост и групиране на известни минерални обекти, както и от геоложки и структурни фактори, съвместими с по-дълбока циркулация. При минералните системи най-силен аргумент е съвпадението между доказани минерални проявления, подходящи водоносни и покривни пластове и разломни или силно напукани зони, които могат да осигурят възходящ път на водата. Това остава районна оценка и не доказва минерална вода точно под избраната координата.`
      : potential === "Умерен"
        ? `Районът показва реални признаци за минерален потенциал, но те не се припокриват достатъчно силно около самата точка. Известните минерални обекти доказват минерална активност в по-широката зона, докато геоложката среда и разломният контекст определят доколко е вероятно избраната координата да принадлежи към същата система. При настоящите данни тази връзка не може да бъде потвърдена с висока увереност.`
        : potential === "Локално проявен"
          ? `В по-широката зона има минерални проявления, но връзката им с избраната точка е ограничена. Наличните данни показват регионален минерален контекст, но няма достатъчно силно пространствено съвпадение между минерални обекти, подходяща геоложка среда и близки разломни структури.`
          : `Наличните данни показват ограничен минерален потенциал около избраната точка. Това не изключва неизвестни или некартографирани минерални води. Означава, че текущото съчетание от известни минерални обекти, геоложка среда и разломна информация не е достатъчно за по-силна районна оценка.`;

  return (
    <>
      <style>{`

        .sondi-mineral-area-print-report {
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

          .sondi-mineral-area-print-report,
          .sondi-mineral-area-print-report * {
            visibility: visible !important;
          }

          .sondi-mineral-area-print-report {
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

          .sondi-mineral-area-print-report h1 {
            margin: 0 0 4mm;
            color: #123f47;
            font-size: 23pt;
            line-height: 1.15;
          }

          .sondi-mineral-area-print-report h2 {
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

      <article className="sondi-mineral-area-print-report">
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
                Районна оценка на минерални води
              </div>
            </div>
          </div>

          <h1>
            Анализ на минералния потенциал на района
          </h1>

          <div className="mineral-print-lead">
            <strong>Оценка: {potential} минерален потенциал</strong>
            <br />
            Координати:{" "}
            {Number(profile.latitude).toFixed(7)},{" "}
            {Number(profile.longitude).toFixed(7)}
          </div>
        </header>

        <section className="mineral-print-section">
          <h2>1. Пространствен контекст</h2>

          <div className="mineral-print-context">
            {objectsText}
          </div>

          <table className="mineral-print-table">
            <tbody>
              <Row
                label="Обекти до 1 km"
                value={profile.within1Km}
              />
              <Row
                label="Обекти до 5 km"
                value={profile.within5Km}
              />
              <Row
                label="Обекти до 10 km"
                value={profile.within10Km}
              />
              <Row
                label="Обекти до 25 km"
                value={profile.within25Km}
              />
              <Row
                label="Свързани находища"
                value={
                  profile.representedDeposits.length > 0
                    ? profile.representedDeposits.join(", ")
                    : "—"
                }
              />
              <Row
                label="Допълнителни обекти без точна координата"
                value={profile.contextualUnlocated.length}
              />
            </tbody>
          </table>
        </section>

        <section className="mineral-print-section allow-break">
          <h2>2. Известни минерални обекти</h2>

          {profile.nearbyFacilities.length > 0 ? (
            profile.nearbyFacilities
              .slice(0, 15)
              .map(item => (
                <div
                  className="mineral-print-card"
                  key={item.mineralId}
                >
                  <strong>{item.name}</strong>

                  <div className="mineral-print-small">
                    {fmt(item.distanceKm, 2)} km
                    {item.deposit
                      ? ` · ${item.deposit}`
                      : ""}
                    {item.temperatureC !== null
                      ? ` · ${fmt(item.temperatureC)} °C`
                      : ""}
                    {item.depthM !== null
                      ? ` · ${fmt(item.depthM)} m`
                      : ""}
                  </div>
                </div>
              ))
          ) : (
            <p>
              В анализирания радиус няма локализирани
              минерални съоръжения в наличната база.
            </p>
          )}
        </section>

        <section className="mineral-print-section">
          <h2>3. Температурен и дълбочинен контекст</h2>

          <div className="mineral-print-context">
            {temperatureText}
          </div>

          <div className="mineral-print-context">
            {depthText}
          </div>
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

          <div className="mineral-print-context">
            <strong>
              Значение на повърхностните и покривните наслаги
            </strong>
            <br />
            {surfaceContext}
          </div>
        </section>

        <section className="mineral-print-section">
          <h2>5. Разломи и структурен контекст</h2>

          <div className="mineral-print-context">
            {faultMeaning}
          </div>
        </section>

        <section className="mineral-print-section allow-break">
          <h2>6. Аналитично обобщение</h2>

          <div className="mineral-print-warning">
            <strong>
              {potential} минерален потенциал
            </strong>
          </div>

          <p>{conclusion}</p>
        </section>

        <div className="mineral-print-footer">
          <strong>SONDI.BG</strong>
          <br />
          Оценката е изградена от наличните
          картографирани минерални съоръжения,
          температурно-дълбочинни данни,
          геоложка и хидрогеоложка информация
          и разломен контекст. Тя описва
          потенциала на района и не доказва
          наличие на минерална вода точно
          под избраната координата.
        </div>
      </article>
    </>
  );
}
