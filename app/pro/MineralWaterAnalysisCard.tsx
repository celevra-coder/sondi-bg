import type {
  MineralWaterProfile,
} from "@/lib/mineral-water-profile";

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(150px,220px) 1fr",
        gap: 12,
        padding: "8px 0",
        borderBottom: "1px solid #edf2f3",
        fontSize: 13,
      }}
    >
      <strong style={{ color: "#38535b" }}>
        {label}
      </strong>
      <div style={{ color: "#1f343a" }}>
        {value || "Няма публикувани данни"}
      </div>
    </div>
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

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const toRad = (value: number) =>
    value * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
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

function fmt(
  value: number | null,
  digits = 1
) {
  if (value === null) {
    return "няма данни";
  }

  return value.toLocaleString(
    "bg-BG",
    {
      maximumFractionDigits: digits,
    }
  );
}

function Box({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: "#fff",
        border: "1px solid #d9e7e9",
        borderRadius: 16,
        padding: 18,
        boxShadow:
          "0 5px 18px rgba(16,62,73,.035)",
      }}
    >
      <h2
        style={{
          margin: "0 0 12px",
          fontSize: 19,
          color: "#173f48",
        }}
      >
        {title}
      </h2>

      <div
        style={{
          color: "#365c65",
          fontSize: 14,
          lineHeight: 1.75,
        }}
      >
        {children}
      </div>
    </section>
  );
}

export default function MineralWaterAnalysisCard({
  profile,
  geology,
  faultSpatial,
}: {
  profile: MineralWaterProfile;
  geology: any;
  faultSpatial: any;
}) {
  const related =
    profile.relatedFacilities || [];

  const located =
    related.filter(
      item => item.hasCoordinates
    );

  const selectedHasCoordinates =
    profile.latitude !== null &&
    profile.longitude !== null;

  const relatedWithDistance =
    selectedHasCoordinates
      ? located
          .map(item => ({
            ...item,
            distanceKm:
              item.latitude !== null &&
              item.longitude !== null
                ? haversineKm(
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

  const within1Km =
    relatedWithDistance.filter(
      item =>
        Number(item.distanceKm) <= 1
    );

  const within5Km =
    relatedWithDistance.filter(
      item =>
        Number(item.distanceKm) <= 5
    );

  const nearestRelated =
    relatedWithDistance[0] || null;

  const nearestFault =
    faultSpatial?.nearestGem ??
    faultSpatial?.nearestFault ??
    null;

  const faultName =
    deep(
      nearestFault,
      [
        "name",
        "fault_name",
        "faultName",
        "fault_id",
        "faultId",
      ]
    );

  const rawFaultDistance =
    deep(
      nearestFault,
      [
        "distance_km",
        "distanceKm",
        "distance",
      ]
    );

  const parsedFaultDistance =
    Number(rawFaultDistance);

  const faultDistance =
    Number.isFinite(parsedFaultDistance)
      ? parsedFaultDistance
      : null;

  const lithology =
    geology?.lithology ?? null;

  const horizon =
    geology?.hydrogeological_horizon ??
    null;

  const waterType =
    geology?.water_type ??
    geology?.collector_type ??
    null;

  const tectonics =
    geology?.tectonics ??
    geology?.tectonic_unit ??
    null;

  const geologyJoined =
    [
      lithology,
      horizon,
      waterType,
      tectonics,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("bg");

  let geologyInterpretation =
    "Наличните геоложки данни не са достатъчни за по-конкретно описание на колектора.";

  if (
    geologyJoined.includes("карст") ||
    geologyJoined.includes("варовик") ||
    geologyJoined.includes("доломит")
  ) {
    geologyInterpretation =
      "Наличните данни сочат карбонатна или карстово-пукнатинна среда. При такава среда движението на минералната вода обикновено се контролира силно от пукнатини, карстови канали и тектонски нарушения, поради което отделни съоръжения в едно находище могат да показват различни температури и дебити.";
  } else if (
    geologyJoined.includes("пукнат") ||
    geologyJoined.includes("fractur") ||
    geologyJoined.includes("магм") ||
    geologyJoined.includes("гранит")
  ) {
    geologyInterpretation =
      "Средата е съвместима с пукнатинен тип циркулация. В такъв контекст разломите и зоните на интензивна напуканост са особено важни за дълбоката циркулация и възходящото движение на минералната вода.";
  } else if (
    geologyJoined.includes("пор") ||
    geologyJoined.includes("алув") ||
    geologyJoined.includes("пясък") ||
    geologyJoined.includes("чакъл")
  ) {
    geologyInterpretation =
      "Средата има поров компонент. При минералните води това може да означава, че по-дълбока минерализирана вода достига до по-проницаем пласт и впоследствие се разпространява странично в него; затова структурният контекст остава важен.";
  } else if (geology) {
    geologyInterpretation =
      "Наличните геоложки и хидрогеоложки данни дават регионален контекст на минералната система. За интерпретацията имат значение едновременно колекторът, дълбочината на циркулация и връзката със структурни нарушения.";
  }

  const selectedTemp =
    profile.temperatureC;

  let temperatureInterpretation =
    "За конкретното съоръжение няма публикувана температура, затова температурният режим не може да бъде оценен директно.";

  if (selectedTemp !== null) {
    if (
      profile.temperatureMin !== null &&
      profile.temperatureMax !== null &&
      profile.temperatureMin !==
        profile.temperatureMax
    ) {
      const span =
        profile.temperatureMax -
        profile.temperatureMin;

      temperatureInterpretation =
        `За избраното съоръжение е публикувана температура ${fmt(selectedTemp)} °C. В свързаната група стойностите са от ${fmt(profile.temperatureMin)} до ${fmt(profile.temperatureMax)} °C. Температурният диапазон е ${fmt(span)} °C и показва, че отделните съоръжения не прихващат напълно еднакви условия на циркулация. Разликите могат да се дължат на различна дълбочина, смесване със студени води или различна позиция спрямо водопроводящата структура.`;
    } else {
      temperatureInterpretation =
        `За избраното съоръжение е публикувана температура ${fmt(selectedTemp)} °C. В наличните свързани записи няма достатъчно различни температурни стойности за надеждно пространствено сравнение.`;
    }
  } else if (
    profile.temperatureMin !== null &&
    profile.temperatureMax !== null
  ) {
    temperatureInterpretation =
      `За конкретното съоръжение няма публикувана температура, но за свързаната минерална система са налични стойности от ${fmt(profile.temperatureMin)} до ${fmt(profile.temperatureMax)} °C. Те могат да се използват като контекст за находището, но не трябва да се приписват директно на избраната точка.`;
  }

  const selectedDepth =
    profile.depthM;

  let depthInterpretation =
    "За конкретното съоръжение няма достатъчно публикувани данни за дълбочината.";

  if (selectedDepth !== null) {
    if (
      profile.depthMin !== null &&
      profile.depthMax !== null &&
      profile.depthMin !==
        profile.depthMax
    ) {
      depthInterpretation =
        `Публикуваната дълбочина на избраното съоръжение е ${fmt(selectedDepth)} m. В свързаната група дълбочините са от ${fmt(profile.depthMin)} до ${fmt(profile.depthMax)} m. Такъв диапазон показва, че минералната система се наблюдава на повече от едно дълбочинно ниво и не бива да се разглежда като един-единствен хоризонт.`;
    } else {
      depthInterpretation =
        `Публикуваната дълбочина на избраното съоръжение е ${fmt(selectedDepth)} m. Наличните свързани записи не дават достатъчно разнообразни стойности за надеждно сравнение на дълбочините.`;
    }
  } else if (
    profile.depthMin !== null &&
    profile.depthMax !== null
  ) {
    depthInterpretation =
      `За избрания обект няма публикувана дълбочина. За свързаните съоръжения са известни стойности от ${fmt(profile.depthMin)} до ${fmt(profile.depthMax)} m, които показват общия дълбочинен мащаб на системата, но не определят дълбочината на конкретния обект.`;
  }

  let structuralInterpretation =
    "В наличния модел не е установена достатъчно ясно определена близка разломна структура.";

  if (faultDistance !== null) {
    const relation =
      faultDistance <= 0.5
        ? "много силна пространствена близост"
        : faultDistance <= 2
          ? "ясна локална пространствена близост"
          : faultDistance <= 5
            ? "регионална пространствена близост"
            : "по-отдалечена структурна връзка";

    structuralInterpretation =
      `Най-близката картографирана разломна структура${faultName ? ` (${String(faultName)})` : ""} е на приблизително ${fmt(faultDistance, 2)} km. Това представлява ${relation}. При минералните системи разломите могат да действат като пътища за по-дълбока циркулация и възходящо движение на вода, но пространствената близост сама по себе си не доказва пряка хидравлична връзка.`;
  }

  let clusterInterpretation =
    "Няма достатъчно локализирани свързани съоръжения за надеждна пространствена оценка на групирането.";

  if (relatedWithDistance.length > 0) {
    clusterInterpretation =
      `Към същата минерална система са свързани ${related.length} допълнителни съоръжения, от които ${located.length} имат потвърдена координата. ${within1Km.length > 0 ? `${within1Km.length} са в радиус до 1 km от избраната точка. ` : ""}${within5Km.length > 0 ? `${within5Km.length} са в радиус до 5 km. ` : ""}${nearestRelated ? `Най-близкият локализиран свързан обект е „${nearestRelated.name}“ на приблизително ${fmt(Number(nearestRelated.distanceKm), 2)} km. ` : ""}Пространственото групиране на няколко минерални проявления е по-силен аргумент за обща хидрогеоложка система от единично изолирано съоръжение.`;
  }

  const technicalFlow =
    deep(
      profile.existingProperties,
      [
        "technical_possible_flow_l_s",
        "flow_l_s",
        "discharge_l_s",
      ]
    );

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

  const professionalInterpretation =
    [
      `Избраният обект „${profile.name}“ се разглежда като част от минерална водоносна система, а не като изолиран регистров запис.`,
      temperatureInterpretation,
      depthInterpretation,
      clusterInterpretation,
      geologyInterpretation,
      structuralInterpretation,
      "Най-надеждната интерпретация идва от съвпадението между техническите характеристики на съоръженията, пространственото им разпределение, геоложката среда и структурния контрол. Когато тези независими признаци сочат една и съща зона, увереността, че обектите принадлежат към обща минерална система, е по-висока.",
    ].join(" ");

  return (
    <div
      style={{
        display: "grid",
        gap: 18,
      }}
    >
      <section
        style={{
          background:
            "linear-gradient(135deg,#123f4a,#176d78)",
          color: "#fff",
          borderRadius: 20,
          padding: 22,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: ".1em",
            opacity: .8,
          }}
        >
          МИНЕРАЛНИ ВОДИ · SONDI EXPERT
        </div>

        <h1
          style={{
            margin: "8px 0 6px",
            fontSize:
              "clamp(25px,4vw,38px)",
          }}
        >
          {profile.name}
        </h1>

        <div
          style={{
            opacity: .9,
            lineHeight: 1.6,
          }}
        >
          Професионален анализ на минералния
          водоизточник, свързаните съоръжения,
          температурно-дълбочинния профил,
          геоложката среда и разломния контекст.
        </div>
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(190px,1fr))",
          gap: 12,
        }}
      >
        {[
          [
            "Температура",
            profile.temperatureC !== null
              ? `${fmt(profile.temperatureC)} °C`
              : "няма данни",
          ],
          [
            "Дълбочина",
            profile.depthM !== null
              ? `${fmt(profile.depthM)} m`
              : "няма данни",
          ],
          [
            "Свързани обекти",
            String(related.length),
          ],
          [
            "Локализирани",
            String(located.length),
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              background: "#fff",
              border: "1px solid #d9e7e9",
              borderRadius: 14,
              padding: 15,
            }}
          >
            <div
              style={{
                color: "#688087",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {label}
            </div>

            <div
              style={{
                marginTop: 5,
                color: "#173f48",
                fontSize: 20,
                fontWeight: 850,
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      <Box title="1. Температурен профил">
        <p style={{ margin: 0 }}>
          {temperatureInterpretation}
        </p>
      </Box>

      <Box title="2. Дълбочинен профил">
        <p style={{ margin: 0 }}>
          {depthInterpretation}
        </p>
      </Box>

      <Box title="3. Минерални обекти около точката">
        <p style={{ margin: 0 }}>
          {clusterInterpretation}
        </p>

        {relatedWithDistance.length > 0 && (
          <div
            style={{
              display: "grid",
              gap: 8,
              marginTop: 14,
            }}
          >
            {relatedWithDistance
              .slice(0, 12)
              .map(item => (
                <div
                  key={item.mineralId}
                  style={{
                    padding: "10px 12px",
                    background: "#f7fafb",
                    border:
                      "1px solid #e2eaec",
                    borderRadius: 10,
                  }}
                >
                  <strong>
                    {item.name}
                  </strong>

                  <div
                    style={{
                      marginTop: 4,
                      color: "#607b82",
                      fontSize: 13,
                    }}
                  >
                    {item.facilityType ||
                      "Минерално съоръжение"}
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
              ))}
          </div>
        )}
      </Box>

      <Box title="4. Геоложка и хидрогеоложка среда">
        {lithology && (
          <Row
            label="Литология"
            value={String(lithology)}
          />
        )}

        {horizon && (
          <Row
            label="Хидрогеоложки хоризонт"
            value={String(horizon)}
          />
        )}

        {waterType && (
          <Row
            label="Тип колектор / водоносна среда"
            value={String(waterType)}
          />
        )}

        {tectonics && (
          <Row
            label="Тектонски контекст"
            value={String(tectonics)}
          />
        )}

        <p
          style={{
            margin:
              "14px 0 0",
          }}
        >
          {geologyInterpretation}
        </p>
      </Box>

      <Box title="5. Разломи и структурен контекст">
        <p style={{ margin: 0 }}>
          {structuralInterpretation}
        </p>
      </Box>

      <section
        style={{
          background: "#eef7f5",
          border: "1px solid #cfe5de",
          borderRadius: 18,
          padding: 20,
        }}
      >
        <h2
          style={{
            margin: "0 0 10px",
            color: "#205b4b",
            fontSize: 21,
          }}
        >
          6. Аналитично обобщение
        </h2>

        <p
          style={{
            margin: 0,
            color: "#315861",
            fontSize: 14,
            lineHeight: 1.8,
          }}
        >
          {professionalInterpretation}
        </p>
      </section>

      <details
        style={{
          background: "#fff",
          border: "1px solid #d9e7e9",
          borderRadius: 14,
          padding: 16,
        }}
      >
        <summary
          style={{
            cursor: "pointer",
            fontWeight: 850,
            color: "#315861",
          }}
        >
          Официални и регистрови данни
        </summary>

        <div style={{ marginTop: 12 }}>
          <Row
            label="Тип"
            value={
              profile.facilityType ||
              "Няма публикувани данни"
            }
          />

          <Row
            label="Населено място"
            value={
              profile.settlement ||
              "Няма публикувани данни"
            }
          />

          <Row
            label="Находище"
            value={
              profile.deposit ||
              "Няма публикувани данни"
            }
          />

          <Row
            label="Координатна точност"
            value={
              profile.coordinateStatus ||
              "Няма публикувани данни"
            }
          />

          <Row
            label="Технически дебит"
            value={
              technicalFlow
                ? `${String(technicalFlow)} l/s`
                : "Няма публикувани данни"
            }
          />

          <Row
            label="Разрешително"
            value={
              permit ||
              "Няма публикувани данни"
            }
          />

          <Row
            label="Собственост"
            value={
              ownership ||
              "Няма публикувани данни"
            }
          />
        </div>
      </details>

      {profile.sources.length > 0 && (
        <details
          style={{
            background: "#fff",
            border: "1px solid #d9e7e9",
            borderRadius: 14,
            padding: 16,
          }}
        >
          <summary
            style={{
              cursor: "pointer",
              fontWeight: 850,
              color: "#315861",
            }}
          >
            Използвани източници
          </summary>

          <ul
            style={{
              lineHeight: 1.65,
            }}
          >
            {profile.sources.map(
              (source, index) => (
                <li
                  key={`${index}-${source}`}
                >
                  {source}
                </li>
              )
            )}
          </ul>
        </details>
      )}
    </div>
  );
}
