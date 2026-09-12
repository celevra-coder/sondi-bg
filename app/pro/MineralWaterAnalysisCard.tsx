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
        gridTemplateColumns:
          "minmax(150px,220px) 1fr",
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

function formatValue(
  value: unknown,
  suffix = ""
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Няма публикувани данни";
  }

  return `${String(value)}${suffix}`;
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

export default function MineralWaterAnalysisCard({
  profile,
  geology,
  faultSpatial,
}: {
  profile: MineralWaterProfile;
  geology: any;
  faultSpatial: any;
}) {
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

  const faultDistance =
    Number(rawFaultDistance);

  const validFaultDistance =
    Number.isFinite(faultDistance)
      ? faultDistance
      : null;

  const lithology =
    geology?.lithology ??
    null;

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

  const related =
    profile.relatedFacilities;

  const located =
    related.filter(
      item => item.hasCoordinates
    );

  const unlocated =
    related.filter(
      item => !item.hasCoordinates
    );

  const depthText =
    profile.depthMin !== null &&
    profile.depthMax !== null
      ? (
          profile.depthMin ===
          profile.depthMax
            ? `Наличната публикувана дълбочина е ${profile.depthMin} m.`
            : `Известните дълбочини в свързаните съоръжения са приблизително от ${profile.depthMin} до ${profile.depthMax} m. Това показва, че минералната система може да обхваща повече от един водоносен интервал и не трябва да се разглежда само като единичен плитък хоризонт.`
        )
      : "Няма достатъчно публикувани данни за надеждно определяне на общ дълбочинен диапазон.";

  const tempText =
    profile.temperatureMin !== null &&
    profile.temperatureMax !== null
      ? (
          profile.temperatureMin ===
          profile.temperatureMax
            ? `Наличната публикувана температура е ${profile.temperatureMin} °C.`
            : `Публикуваните температури в свързаните съоръжения са в диапазона ${profile.temperatureMin}–${profile.temperatureMax} °C. Разликите могат да бъдат свързани с различна дълбочина, смесване с по-студени води и различна позиция спрямо водопроводящи структури.`
        )
      : "Няма достатъчно публикувани температурни стойности за надеждно сравнение.";

  const geologyText =
    geology
      ? [
          lithology
            ? `Литоложкият контекст е: ${String(lithology)}.`
            : null,

          horizon
            ? `Хидрогеоложкият хоризонт е: ${String(horizon)}.`
            : null,

          waterType
            ? `Водоносната среда/колекторът е описан като: ${String(waterType)}.`
            : null,

          tectonics
            ? `Тектонският контекст е: ${String(tectonics)}.`
            : null,
        ]
          .filter(Boolean)
          .join(" ")
      : "За точката няма достатъчно детайлни геоложки данни.";

  const faultText =
    nearestFault
      ? (
          validFaultDistance !== null
            ? `Най-близката анализирана разломна структура${faultName ? ` (${String(faultName)})` : ""} е приблизително на ${validFaultDistance.toFixed(2)} km. Разломните и силно напукани зони могат да подпомагат вертикалната циркулация на минерални води, но само пространствената близост не доказва пряка хидравлична връзка.`
            : `В района е установена близка разломна структура${faultName ? ` (${String(faultName)})` : ""}. Тя е важна част от структурния контекст, но сама по себе си не доказва водоносност или термален приток.`
        )
      : "В наличния разломен модел не е установена достатъчно близка структура, която сама по себе си да обяснява минералното проявление.";

  const unlocatedText =
    unlocated.length > 0
      ? `Установени са още ${unlocated.length} свързани съоръжения, за които има идентификационна и/или техническа информация, но няма достатъчно сигурна точна координата. Те не се поставят като измислени точки на картата. Данните им се използват единствено като контекст за находището и за сравнение на дълбочини, температури и други характеристики.`
      : "Няма допълнителни свързани съоръжения без потвърдена координата.";

  const interpretation =
    `Избраното съоръжение се разглежда като част от цялостна минерална водоносна система, а не като изолиран обект. ${depthText} ${tempText} ${geologyText} ${faultText} ${unlocatedText}`;

  const conclusion =
    "Най-силната оценка за минералната система идва от съвкупността между доказаните съоръжения, техническите им параметри, геоложката среда и разломната обстановка. За избор на нова сондажна точка тези данни трябва да се комбинират с локално проучване на конкретния имот и детайлна оценка на разломно-пукнатинната мрежа.";

  return (
    <section
      style={{
        background: "#fff",
        border: "1px solid #d8e6e9",
        borderRadius: 18,
        padding: 20,
        boxShadow:
          "0 8px 28px rgba(16,62,73,.05)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: "#177f98",
          marginBottom: 8,
        }}
      >
        Минерални води · EXPERT
      </div>

      <h2
        style={{
          margin: 0,
          fontSize: 23,
          color: "#173f48",
        }}
      >
        {profile.name}
      </h2>

      <p
        style={{
          marginTop: 10,
          color: "#607b82",
          lineHeight: 1.65,
          fontSize: 14,
        }}
      >
        Цялостен анализ на съоръжението,
        свързаните минерални проявления,
        геоложката среда и разломната обстановка.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(260px,1fr))",
          gap: 18,
          marginTop: 18,
        }}
      >
        <div>
          <h3 style={{ color: "#173f48" }}>
            Съоръжение
          </h3>

          <Row
            label="Тип"
            value={formatValue(profile.facilityType)}
          />

          <Row
            label="Населено място"
            value={formatValue(profile.settlement)}
          />

          <Row
            label="Находище"
            value={formatValue(profile.deposit)}
          />

          <Row
            label="Дълбочина"
            value={
              profile.depthM !== null
                ? `${profile.depthM} m`
                : "Няма публикувани данни"
            }
          />

          <Row
            label="Температура"
            value={
              profile.temperatureC !== null
                ? `${profile.temperatureC} °C`
                : "Няма публикувани данни"
            }
          />

          <Row
            label="Точност на позицията"
            value={formatValue(profile.coordinateStatus)}
          />
        </div>

        <div>
          <h3 style={{ color: "#173f48" }}>
            Технически и регистрови данни
          </h3>

          <Row
            label="Собственост"
            value={
              formatValue(
                deep(
                  profile.existingProperties,
                  [
                    "ownership_regime",
                    "ownership",
                  ]
                )
              )
            }
          />

          <Row
            label="Технически дебит"
            value={
              formatValue(
                deep(
                  profile.existingProperties,
                  [
                    "technical_possible_flow_l_s",
                    "flow_l_s",
                    "discharge_l_s",
                  ]
                ),
                " l/s"
              )
            }
          />

          <Row
            label="Разрешително"
            value={
              formatValue(
                deep(
                  profile.existingProperties,
                  [
                    "permit_number",
                    "permit_no",
                  ]
                )
              )
            }
          />

          <Row
            label="Допълнителни данни"
            value={
              Object.keys(
                profile.researchEnrichment || {}
              ).length > 0
                ? "Налични"
                : "Няма публикувани данни"
            }
          />
        </div>
      </div>

      <div
        style={{
          marginTop: 22,
          borderRadius: 16,
          background: "#f3f8f8",
          border: "1px solid #d9e7e9",
          padding: 18,
        }}
      >
        <h3
          style={{
            margin: "0 0 10px 0",
            color: "#173f48",
          }}
        >
          Хидрогеоложка интерпретация
        </h3>

        <p
          style={{
            margin: 0,
            lineHeight: 1.75,
            color: "#365c65",
            fontSize: 14,
          }}
        >
          {interpretation}
        </p>
      </div>

      {related.length > 0 && (
        <div style={{ marginTop: 22 }}>
          <h3 style={{ color: "#173f48" }}>
            Свързани съоръжения
          </h3>

          <p
            style={{
              fontSize: 13,
              color: "#6a8288",
            }}
          >
            {located.length} с установена координата ·{" "}
            {unlocated.length} без потвърдена точна координата
          </p>

          <div
            style={{
              display: "grid",
              gap: 8,
            }}
          >
            {related
              .slice(0, 20)
              .map(item => (
                <div
                  key={item.mineralId}
                  style={{
                    border: "1px solid #e1eaec",
                    borderRadius: 12,
                    padding: "10px 12px",
                    fontSize: 13,
                  }}
                >
                  <strong>
                    {item.name}
                  </strong>

                  <div
                    style={{
                      marginTop: 4,
                      color: "#637d84",
                    }}
                  >
                    {item.facilityType ||
                      "Минерално съоръжение"}

                    {item.depthM !== null
                      ? ` · ${item.depthM} m`
                      : ""}

                    {item.temperatureC !== null
                      ? ` · ${item.temperatureC} °C`
                      : ""}
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      fontWeight: 700,
                      color:
                        item.hasCoordinates
                          ? "#37745d"
                          : "#9a681f",
                    }}
                  >
                    {item.hasCoordinates
                      ? "Точката е локализирана"
                      : "Точната позиция не е потвърдена — използва се само като контекст"}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: 22,
          borderRadius: 16,
          background: "#eef6f3",
          border: "1px solid #cfe2da",
          padding: 18,
        }}
      >
        <h3
          style={{
            margin: "0 0 8px 0",
            color: "#173f48",
          }}
        >
          Заключение
        </h3>

        <p
          style={{
            margin: 0,
            lineHeight: 1.75,
            color: "#315861",
            fontSize: 14,
          }}
        >
          {conclusion}
        </p>
      </div>

      {profile.sources.length > 0 && (
        <details style={{ marginTop: 18 }}>
          <summary
            style={{
              cursor: "pointer",
              fontWeight: 800,
              color: "#456c74",
            }}
          >
            Използвани официални източници
          </summary>

          <ul>
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
    </section>
  );
}
