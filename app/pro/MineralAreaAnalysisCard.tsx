import type {
  MineralWaterAreaProfile,
} from "@/lib/mineral-water-profile";

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

function Panel({
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
          margin: "0 0 11px",
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

export default function MineralAreaAnalysisCard({
  profile,
  geology,
  faultSpatial,
}: {
  profile: MineralWaterAreaProfile;
  geology: any;
  faultSpatial: any;
}) {
  const nearest =
    profile.nearestFacility;

  const regionalModel =
    profile.regionalModel;

  const isOgnyanovoGarmen =
    regionalModel?.regional_model_id ===
    "ognyanovo-garmen";

  const regionalEvidenceCount =
    regionalModel?.evidence_base?.facility_count ??
    regionalModel?.evidence_base?.facility_ids?.length ??
    0;

  const regionalScope =
    regionalModel?.regional_model_scope;

  const nearestFault =
    faultSpatial?.nearestGem ??
    faultSpatial?.nearestFault ??
    null;

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
    Number.isFinite(
      parsedFaultDistance
    )
      ? parsedFaultDistance
      : null;

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
  const reasons: string[] = [];

  if (nearest) {
    if (nearest.distanceKm <= 1) {
      score += 4;
      reasons.push(
        "доказан минерален обект е на по-малко от 1 km"
      );
    } else if (nearest.distanceKm <= 5) {
      score += 3;
      reasons.push(
        "доказан минерален обект е в радиус до 5 km"
      );
    } else if (nearest.distanceKm <= 10) {
      score += 2;
      reasons.push(
        "има доказано минерално проявление в радиус до 10 km"
      );
    } else {
      score += 1;
      reasons.push(
        "има известни минерални обекти в регионален радиус до 25 km"
      );
    }
  }

  if (profile.within5Km >= 3) {
    score += 2;
    reasons.push(
      "няколко локализирани минерални съоръжения образуват близко пространствено групиране"
    );
  } else if (profile.within5Km > 0) {
    score += 1;
  }

  if (profile.within10Km >= 5) {
    score += 1;
    reasons.push(
      "районът съдържа по-широка група доказани минерални проявления"
    );
  }

  if (faultDistance !== null) {
    if (faultDistance <= 1) {
      score += 2;
      reasons.push(
        "точката е много близо до картографирана разломна структура"
      );
    } else if (faultDistance <= 5) {
      score += 1;
      reasons.push(
        "в близост има картографирана разломна структура"
      );
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
    reasons.push(
      "геоложката среда съдържа признаци, съвместими със структурно или пукнатинно контролирана циркулация"
    );
  }

  let potential =
    "ограничен";

  let potentialText =
    "В наличните данни около точката няма достатъчно силно съчетание от доказани минерални проявления и структурни признаци.";

  const strongMineralConcentration =
    profile.within5Km >= 5 ||
    profile.within10Km >= 10;

  if (strongMineralConcentration || score >= 7) {
    potential = "висок";
    potentialText =
      strongMineralConcentration
        ? `Районът показва висок минерален потенциал. В близост до избраната точка има силна концентрация на доказани минерални съоръжения — ${profile.within5Km} до 5 km и ${profile.within10Km} до 10 km. Това е силен районен признак за развита минерална водоносна система. Оценката не доказва наличие на минерална вода точно в избраната координата.`
        : "Около избраната точка съвпадат няколко независими положителни признака — известни минерални обекти, пространствено групиране и подходящ структурно-геоложки контекст. Съвкупността от данните показва висок минерален потенциал на района. Оценката не доказва наличие на минерална вода точно в избраната координата.";
  } else if (score >= 4) {
    potential = "умерен";
    potentialText =
      "Районът показва няколко положителни признака за минерална водоносна система, но наличните данни не са достатъчни за висока увереност точно в избраната точка.";
  } else if (score >= 2) {
    potential = "локално проявен";
    potentialText =
      "В по-широката зона има данни за минерални води или благоприятни структурни признаци, но връзката им с точно избраната точка е ограничена.";
  }

  let proximityText =
    "В радиус 25 km не е намерено локализирано минерално съоръжение в наличната база.";

  if (nearest) {
    proximityText =
      `Най-близкият известен минерален обект е „${nearest.name}“ на приблизително ${fmt(nearest.distanceKm, 2)} km. В радиус 1 km има ${profile.within1Km} локализирани обекта, до 5 km — ${profile.within5Km}, до 10 km — ${profile.within10Km}, а до 25 km — ${profile.within25Km}.`;
  }

  const systemContext =
    profile.contextualUnlocated.length > 0
      ? `Към установените близки находища са свързани и ${profile.contextualUnlocated.length} допълнителни съоръжения без достатъчно сигурна точна координата. Те участват в температурния и дълбочинния контекст на минералната система, но не се използват при изчисляване на разстоянията до избраната точка.`
      : "Не са установени допълнителни свързани съоръжения без точна координата, които да променят контекста на анализа.";

  let temperatureText =
    "Няма достатъчно публикувани температурни данни за близките минерални обекти.";

  if (
    profile.temperatureMin !== null &&
    profile.temperatureMax !== null
  ) {
    temperatureText =
      profile.temperatureMin ===
      profile.temperatureMax
        ? `За минералните съоръжения в анализираната система е налична температура ${fmt(profile.temperatureMin)} °C.`
        : isOgnyanovoGarmen
          ? `За минералните съоръжения в регионалния модел Огняново–Гърмен публикуваните температури са приблизително ${fmt(profile.temperatureMin)}–${fmt(profile.temperatureMax)} °C. Данните не показват проста зависимост „по-дълбоко = по-топло“ и не дават достатъчна основа за надежден числен температурен градиент. Разликите между отделните съоръжения се разглеждат в контекста на различната им позиция спрямо пукнатинно-жилната и тектонската система; смесване със студени води не е доказано като общо обяснение за регионалния температурен диапазон.`
          : `За минералните съоръжения, свързани с района, публикуваните температури са приблизително ${fmt(profile.temperatureMin)}–${fmt(profile.temperatureMax)} °C. Диапазонът може да отразява различна дълбочина на циркулация, смесване със студени води и различна позиция спрямо водопроводящите структури.`;
  }
  let depthText =
    "Няма достатъчно публикувани данни за дълбочината на близките минерални съоръжения.";

  if (
    profile.depthMin !== null &&
    profile.depthMax !== null
  ) {
    depthText =
      profile.depthMin ===
      profile.depthMax
        ? `Наличната публикувана дълбочина в системата е ${fmt(profile.depthMin)} m.`
        : `Известните дълбочини на свързаните минерални съоръжения са приблизително ${fmt(profile.depthMin)}–${fmt(profile.depthMax)} m. Това показва, че минералната система може да се проявява на повече от едно дълбочинно ниво.`;
  }

  const faultText =
    faultDistance !== null
      ? `Най-близката картографирана разломна структура${faultName ? ` (${String(faultName)})` : ""} е приблизително на ${fmt(faultDistance, 2)} km. Разломите и силно напуканите зони могат да подпомагат дълбоката циркулация и възходящото движение на минерални води, но близостта до разлом сама по себе си не доказва наличие на минерална вода в точката.`
      : "В наличния разломен модел няма достатъчно ясно определена близка структура, която да бъде използвана като силен положителен индикатор.";

  const geologySummary =
    [
      lithology
        ? `Литология: ${String(lithology)}.`
        : null,
      horizon
        ? `Хидрогеоложки хоризонт: ${String(horizon)}.`
        : null,
      collector
        ? `Водоносна среда/колектор: ${String(collector)}.`
        : null,
      tectonics
        ? `Тектонски контекст: ${String(tectonics)}.`
        : null,
    ]
      .filter(Boolean)
      .join(" ");

  const objectsAnalysis =
    nearest
      ? `Най-близкият известен минерален обект е „${nearest.name}“ на приблизително ${fmt(nearest.distanceKm, 2)} km. В радиус до 1 km има ${profile.within1Km} локализирани минерални обекта, до 5 km — ${profile.within5Km}, до 10 km — ${profile.within10Km}, а до 25 km — ${profile.within25Km}. Пространственото групиране на няколко доказани минерални проявления е по-силен аргумент за обща хидрогеоложка система от единичен изолиран обект.`
      : "В радиус до 25 km в наличната база не е намерено локализирано минерално съоръжение. Това отслабва пространствения аргумент за минерална система около избраната точка, но не изключва неизвестни или некартографирани проявления.";

  const thermalDepthAnalysis =
    isOgnyanovoGarmen
      ? `Регионалният модел Огняново–Гърмен показва, че термалните проявления не следват проста зависимост между дълбочина и температура. Документирани са както плитки термални проявления, така и значително по-дълбоки сондажи със сходни или по-ниски температури. При №1ВКП на 26 m е документиран плитък студен приток около 14 °C, който е изолиран с обсадна колона, а първият термален приток е установен около 33 m при приблизително 39 °C. По-дълбоките пукнатинни интервали увеличават историческия дебит значително, без съответстващо съществено увеличение на температурата. Поради това за района не се извежда надежден числен температурен градиент и регионалните дълбочини не трябва да се превръщат автоматично в препоръчителна дълбочина за избраната координата.`
      : profile.temperatureMin !== null &&
        profile.temperatureMax !== null
        ? (
            profile.depthMin !== null &&
            profile.depthMax !== null
              ? `За свързаните с района минерални съоръжения са известни температури приблизително ${fmt(profile.temperatureMin)}–${fmt(profile.temperatureMax)} °C и дълбочини приблизително ${fmt(profile.depthMin)}–${fmt(profile.depthMax)} m. Тези стойности показват мащаба на известната минерална система. Разликите между отделните съоръжения могат да отразяват различна дълбочина на циркулация, смесване със студени води и различна позиция спрямо водопроводящите структури. Данните са районен контекст и не трябва автоматично да се приписват на самата избрана точка.`
              : `За минералните съоръжения, свързани с района, са известни температури приблизително ${fmt(profile.temperatureMin)}–${fmt(profile.temperatureMax)} °C. Температурният диапазон показва, че отделните проявления могат да прихващат различни части на една по-сложна система. За дълбочината няма достатъчно данни за надеждно районно сравнение.`
          )
        : (
            profile.depthMin !== null &&
            profile.depthMax !== null
              ? `За свързаните с района минерални съоръжения са известни дълбочини приблизително ${fmt(profile.depthMin)}–${fmt(profile.depthMax)} m. Това показва общия дълбочинен мащаб на известната система, но липсват достатъчно температурни данни за по-пълна оценка на термалния режим.`
              : "Няма достатъчно публикувани температурни и дълбочинни данни за близките минерални съоръжения, затова този фактор не може да има голяма тежест в оценката."
          );
  const geologyAnalysis =
    geologySummary
      ? `${geologySummary} При минералните води тази информация е важна, защото геоложката среда определя през какви скали и пластове може да циркулира водата, къде могат да съществуват пропускливи колектори и по-слабо пропускливи покривни слоеве и доколко е възможна продължителна дълбока циркулация. По-дългият контакт със скалите и по-дълбоката циркулация могат да влияят върху температурата и минералния състав на водата.`
      : "За избраната точка няма достатъчно детайлни геоложки данни за конкретна интерпретация. Поради това геоложкият фактор не може да бъде използван като силен положителен или отрицателен аргумент.";

  const surfaceContext =
    geologyText.includes("алув")
      ? "В геоложкия контекст присъства алувиална среда. Такива наслаги могат да включват чакъли, пясъци, прах и глини и често формират порови водоносни хоризонти. При минералните води плитката алувиална среда сама по себе си не доказва минерален произход, но може да приема и разпространява вода, постъпваща от по-дълбока структурна система."
      : geologyText.includes("глин")
        ? "Наличието на глинести или други по-слабо пропускливи материали може да разделя отделни водоносни нива и локално да ограничава вертикалното движение на вода. При минералните системи такива покривни слоеве могат да имат значение за задържането и насочването на по-дълбоко циркулиращите води."
        : geologyText.includes("пяс")
          ? "Пясъчните и други порови материали могат да позволяват по-свободно странично движение на вода. При минералните системи те могат да бъдат приемна среда за вода, постъпваща от по-дълбоки структури, но сами по себе си не доказват минерален произход."
          : "За повърхностните и покривните наслаги няма достатъчно детайлна точкова информация, затова те не се използват като самостоятелен индикатор за минерална вода.";

  const faultAnalysis =
    faultDistance !== null
      ? `Най-близката картографирана разломна структура${faultName ? ` (${String(faultName)})` : ""} е приблизително на ${fmt(faultDistance, 2)} km. Разломите и силно напуканите зони могат да осигуряват пътища за по-дълбока циркулация и за възходящо движение на затоплена и минерализирана вода към по-плитки нива. В зависимост от строежа и запълването си отделни разломни зони могат и да ограничават потока, затова най-силен е аргументът, когато близостта до разлом съвпада с доказани минерални проявления и подходяща геоложка среда. Самото наличие на разлом не доказва минерална вода.`
      : "В наличния разломен модел няма достатъчно ясно определена близка структура, която да се използва като силен положителен индикатор. Това не изключва структурен контрол, а означава, че той не е достатъчно добре представен в наличните картографски данни.";

  const regionalModelInterpretation =
    isOgnyanovoGarmen
      ? `Избраната координата попада в официалния външен пояс III на санитарно-охранителната зона на находище „Огняново–Гърмен“, определен със Заповед № РД-580/08.08.2023 г. Регионалният модел е изграден върху ${regionalEvidenceCount} проверени минерални съоръжения и официална хидрогеоложка документация. Данните характеризират пукнатинно-жилна напорна термална система в кристалинния комплекс на Западните Родопи. Повтарящият се колектор е представен от напукани и силно напукани амфиболитови гнайси с кварцови и пегматитови жили и локална силицификация. Документираният структурен контрол е преимуществено по направление ЗСЗ–ИЮИ, с източна и западна дренажна зона и връзка с долината на р. Канина. Артезианският характер е пряко документиран при №2ВКП, където статичното водно ниво е над терена. При №1ВКП е документирано отделяне на плитък студен приток от по-дълбоката термална система. Историческите дебити при сондиране се разграничават от съвременните технически или експлоатационни дебити. Наличните данни не са достатъчни за доказване на един и същ локален колектор във всички съоръжения, точен регионален водоупор или общо смесване между студени и термални води.`
      : null;

  const regionalScopeCaveat =
    isOgnyanovoGarmen
      ? `Попадането на точката в официалния пояс III означава, че регионалният хидрогеоложки контекст е приложим към анализа. То не доказва наличие на минерална вода точно под имота и не определя автоматично локална дълбочина на приток, температура, дебит или конкретен водоносен колектор.`
      : null;
  const finalSummary =
    potential === "висок"
      ? strongMineralConcentration
        ? `Съвкупността от наличните данни показва висок минерален потенциал на района. Особено силен аргумент е концентрацията на доказани минерални съоръжения — ${profile.within5Km} до 5 km и ${profile.within10Km} до 10 km от избраната точка. Тази концентрация показва добре проявена минерална водоносна система в района. Геоложкият, температурният и структурният контекст допълват оценката там, където са налични надеждни данни. Това е районна оценка и не доказва минерална вода точно под избраната координата, нито определя локална дълбочина, температура или дебит.`
        : "Съвкупността от наличните данни показва висок минерален потенциал на района. Оценката се подкрепя от съвпадението на няколко независими признака — близост и групиране на известни минерални проявления, геоложки контекст и структурни фактори, съвместими с по-дълбока циркулация. Това е районна оценка и не доказва минерална вода точно под избраната координата."
      : potential === "умерен"
        ? "Районът показва реални признаци за минерален потенциал, но те не се припокриват достатъчно силно около самата избрана точка. Наличието на известни минерални обекти потвърждава минерална активност в по-широката зона, докато геологията и разломният контекст показват доколко е възможно точката да принадлежи към същата система. При настоящите данни тази връзка остава вероятна, но не достатъчно силно потвърдена."
        : potential === "локално проявен"
          ? "В по-широката зона има доказани минерални проявления или структурно-геоложки признаци, но връзката им с избраната координата е ограничена. Това означава, че районът не е безинтересен, но наличните данни по-скоро показват регионален минерален контекст, отколкото ясно оформена минерална система около самата точка."
          : "Наличните данни показват ограничен минерален потенциал около избраната точка. Не се наблюдава достатъчно силно пространствено съвпадение между известни минерални обекти, подходяща геоложка среда и близки разломни структури. Това не изключва неизвестни или некартографирани минерални води, а означава, че текущите данни не подкрепят по-силна районна оценка.";

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
            opacity: .82,
          }}
        >
          МИНЕРАЛЕН ПОТЕНЦИАЛ · SONDI EXPERT
        </div>

        <h1
          style={{
            margin: "8px 0 6px",
            fontSize:
              "clamp(25px,4vw,38px)",
          }}
        >
          Анализ на минералния потенциал на района
        </h1>

        <p
          style={{
            margin: 0,
            lineHeight: 1.65,
            opacity: .92,
          }}
        >
          Оценката е за района около избраната
          точка и не представлява твърдение,
          че точно в координатата има минерална
          вода.
        </p>
      </section>

      <section
        style={{
          background:
            potential === "висок"
              ? "#eaf6f1"
              : potential === "умерен"
                ? "#fff7e5"
                : "#f3f6f7",
          border:
            potential === "висок"
              ? "1px solid #bddfce"
              : potential === "умерен"
                ? "1px solid #ecd7a6"
                : "1px solid #dae3e5",
          borderRadius: 18,
          padding: 20,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: "#60787e",
            textTransform: "uppercase",
            letterSpacing: ".08em",
          }}
        >
          Оценка на района
        </div>

        <div
          style={{
            marginTop: 5,
            fontSize: 28,
            fontWeight: 900,
            color: "#173f48",
            textTransform: "capitalize",
          }}
        >
          {potential} минерален потенциал
        </div>

        <p
          style={{
            margin: "10px 0 0",
            lineHeight: 1.75,
            color: "#365c65",
          }}
        >
          {potentialText}
        </p>
      </section>

      <Panel title="1. Пространствен контекст">
        <p style={{ marginTop: 0 }}>
          {nearest
            ? `Най-близкият известен минерален обект е „${nearest.name}“ на приблизително ${fmt(nearest.distanceKm, 2)} km. В радиус до 1 km има ${profile.within1Km} локализирани обекта, до 5 km — ${profile.within5Km}, до 10 km — ${profile.within10Km}, а до 25 km — ${profile.within25Km}.`
            : "В радиус до 25 km в наличната база не е намерено локализирано минерално съоръжение."}
        </p>

        <div
          style={{
            marginTop: 14,
            borderTop: "1px solid #e2eaec",
          }}
        >
          {[
            ["Обекти до 1 km", String(profile.within1Km)],
            ["Обекти до 5 km", String(profile.within5Km)],
            ["Обекти до 10 km", String(profile.within10Km)],
            ["Обекти до 25 km", String(profile.within25Km)],
            [
              "Свързани находища",
              profile.representedDeposits.length > 0
                ? profile.representedDeposits.join(", ")
                : "—",
            ],
            [
              "Допълнителни обекти без точна координата",
              String(profile.contextualUnlocated.length),
            ],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(190px,260px) 1fr",
                gap: 14,
                padding: "10px 0",
                borderBottom:
                  "1px solid #e2eaec",
              }}
            >
              <strong
                style={{
                  color: "#456068",
                }}
              >
                {label}
              </strong>

              <div>
                {value}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="2. Известни минерални обекти">
        {profile.nearbyFacilities.length > 0 ? (
          <details
            style={{
              background: "#f7fafb",
              border: "1px solid #e2eaec",
              borderRadius: 12,
              padding: 14,
            }}
          >
            <summary
              style={{
                cursor: "pointer",
                fontWeight: 800,
                color: "#315861",
                listStylePosition: "inside",
              }}
            >
              Покажи близките минерални обекти
              {" · "}
              {profile.nearbyFacilities.length}
            </summary>

            <div
              style={{
                display: "grid",
                gap: 8,
                marginTop: 14,
              }}
            >
              {profile.nearbyFacilities
                .slice(0, 15)
                .map(item => (
                  <div
                    key={item.mineralId}
                    style={{
                      background: "#fff",
                      border:
                        "1px solid #e2eaec",
                      borderRadius: 10,
                      padding: "11px 13px",
                    }}
                  >
                    <strong>
                      {item.name}
                    </strong>

                    <div
                      style={{
                        marginTop: 4,
                        color: "#637d84",
                        fontSize: 13,
                      }}
                    >
                      {fmt(
                        item.distanceKm,
                        2
                      )} km
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
                ))}
            </div>
          </details>
        ) : (
          <p style={{ margin: 0 }}>
            В анализирания радиус няма
            локализирани минерални
            съоръжения в наличната база.
          </p>
        )}
      </Panel>

      <Panel title="3. Температурен и дълбочинен контекст">
        <div
          style={{
            padding: 14,
            background: "#eef7fa",
            borderLeft: "3px solid #167d96",
            marginBottom: 12,
          }}
        >
          {temperatureText}
        </div>

        <div
          style={{
            padding: 14,
            background: "#eef7fa",
            borderLeft: "3px solid #167d96",
          }}
        >
          {depthText}
        </div>
      </Panel>

      <Panel title="4. Геоложка и хидрогеоложка среда">
        <div
          style={{
            padding: 14,
            background: "#f1f6f6",
            borderLeft: "3px solid #16825c",
            marginBottom: 14,
          }}
        >
          При минералните води геоложката
          среда има пряко значение за начина
          на циркулация. Тя определя какви
          скали и пластове изграждат системата,
          къде могат да съществуват пропускливи
          колектори, дали има по-слабо
          пропускливи покривни слоеве и
          доколко е възможна продължителна
          дълбока циркулация. По-дългият
          контакт със скалите и по-голямата
          дълбочина могат да влияят върху
          температурата и минерализацията
          на водата.
        </div>

        <div
          style={{
            borderTop: "1px solid #e2eaec",
          }}
        >
          {[
            [
              "Литология",
              lithology
                ? String(lithology)
                : "—",
            ],
            [
              "Хидрогеоложки хоризонт",
              horizon
                ? String(horizon)
                : "—",
            ],
            [
              "Колектор / водоносна среда",
              collector
                ? String(collector)
                : "—",
            ],
            [
              "Тектонски контекст",
              tectonics
                ? String(tectonics)
                : "—",
            ],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(190px,260px) 1fr",
                gap: 14,
                padding: "10px 0",
                borderBottom:
                  "1px solid #e2eaec",
              }}
            >
              <strong
                style={{
                  color: "#456068",
                }}
              >
                {label}
              </strong>

              <div>
                {value}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 14,
            padding: 14,
            background: "#eef7fa",
            borderLeft: "3px solid #167d96",
          }}
        >
          <strong>
            Значение на повърхностните и
            покривните наслаги
          </strong>

          <div style={{ marginTop: 6 }}>
            {surfaceContext}
          </div>
        </div>
      </Panel>

      <Panel title="5. Разломи и структурен контекст">
        <div
          style={{
            padding: 14,
            background: "#eef7fa",
            borderLeft: "3px solid #167d96",
          }}
        >
          {faultAnalysis}
        </div>
      </Panel>

      {isOgnyanovoGarmen &&
        regionalModelInterpretation && (
          <Panel title="6. Регионален хидрогеоложки модел">
            <div
              style={{
                padding: 14,
                background: "#eef7fa",
                borderLeft: "3px solid #167d96",
                lineHeight: 1.75,
              }}
            >
              {regionalModelInterpretation}
            </div>

            {regionalScopeCaveat && (
              <div
                style={{
                  marginTop: 12,
                  padding: 14,
                  background: "#fff8e8",
                  border: "1px solid #ead9a6",
                  borderRadius: 12,
                  lineHeight: 1.7,
                }}
              >
                <strong>
                  Обхват на регионалния модел:
                </strong>{" "}
                {regionalScopeCaveat}
              </div>
            )}

            <div
              style={{
                marginTop: 10,
                color: "#5a6d72",
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              Пространственият обхват е определен по
              официалния пояс III на СОЗ
              {regionalScope?.official_area_m2
                ? ` с площ ${Math.round(
                    regionalScope.official_area_m2
                  ).toLocaleString("bg-BG")} m²`
                : ""}
              .
            </div>
          </Panel>
        )}
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
            margin: "0 0 12px",
            color: "#205b4b",
            fontSize: 21,
          }}
        >
          {isOgnyanovoGarmen
            ? "7. Аналитично обобщение"
            : "6. Аналитично обобщение"}
        </h2>

        <div
          style={{
            padding: 14,
            background:
              potential === "висок"
                ? "#eaf6f1"
                : potential === "умерен"
                  ? "#fff7e5"
                  : "#f3f6f7",
            borderLeft:
              potential === "висок"
                ? "3px solid #16825c"
                : potential === "умерен"
                  ? "3px solid #d59a28"
                  : "3px solid #8aa0a6",
            marginBottom: 14,
          }}
        >
          <strong>
            {potential.charAt(0).toUpperCase() +
              potential.slice(1)}{" "}
            минерален потенциал
          </strong>
        </div>

        <p
          style={{
            margin: 0,
            color: "#315861",
            fontSize: 14,
            lineHeight: 1.8,
          }}
        >
          {finalSummary}
        </p>
      </section>
    </div>
  );
}
