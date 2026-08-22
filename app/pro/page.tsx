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
  knowledgeHref,
  children,
}: {
  title: string;
  subtitle?: string;
  knowledgeHref: string;
  children?: React.ReactNode;
}) {
  return (
    <section style={{
      position: "relative",
      background: "#fff",
      border: "1px solid #dce8eb",
      borderRadius: 18,
      padding: 20,
      boxShadow: "0 8px 28px rgba(16,62,73,.05)",
    }}>
      <Link
        href={knowledgeHref}
        aria-label={`Прочети повече за ${title} в Знания`}
        title="Прочети повече в Знания"
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          width: 30,
          height: 30,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid #0d8055",
          background: "#eef8f4",
          color: "#0d8055",
          textDecoration: "none",
          fontSize: 18,
          lineHeight: 1,
          fontWeight: 900,
          boxShadow: "0 3px 10px rgba(13,128,85,.12)",
        }}
      >
        !
      </Link>

      <h2 style={{
        margin: 0,
        paddingRight: 42,
        color: "#123b46",
        fontSize: 19,
      }}>
        {title}
      </h2>

      {subtitle && (
        <p style={{
          margin: "6px 0 0",
          paddingRight: 34,
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
  help,
}: {
  label: string;
  value: string;
  tone?: "good" | "bad" | "warn" | "neutral";
  help?: string;
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
      position: "relative",
      background: s.bg,
      borderRadius: 14,
      padding: 14,
    }}>
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 8,
      }}>
        <div style={{
          fontSize: 11,
          fontWeight: 800,
          opacity: .7,
          textTransform: "uppercase",
        }}>
          {label}
        </div>

        {help ? (
          <details style={{
            position: "relative",
            flexShrink: 0,
          }}>
            <summary
              aria-label={`Пояснение: ${label}`}
              style={{
                display: "grid",
                placeItems: "center",
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "rgba(255,255,255,.72)",
                border: "1px solid rgba(31,52,58,.18)",
                color: "#294950",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 900,
                listStyle: "none",
                userSelect: "none",
              }}
            >
              ?
            </summary>

            <div style={{
              position: "absolute",
              zIndex: 30,
              top: 28,
              right: 0,
              width: "min(280px,calc(100vw - 54px))",
              padding: 12,
              borderRadius: 11,
              background: "#fff",
              border: "1px solid #d6e3e6",
              boxShadow:
                "0 10px 30px rgba(16,62,73,.18)",
              color: "#334f56",
              fontSize: 12,
              fontWeight: 500,
              lineHeight: 1.55,
              textTransform: "none",
            }}>
              {help}
            </div>
          </details>
        ) : null}
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

  const section4 =
    profile.section4;

  const section5 =
    profile.section5;

  const section5GoalCategory =
    String(section5?.goal_category ?? "");

  const section5GoalTone =
    section5GoalCategory === "goal_achieved" ||
    section5GoalCategory === "maintain_good_status"
      ? "good"
      : section5GoalCategory === "extended_after_2027" ||
        section5GoalCategory === "less_strict_goal"
        ? "warn"
        : "neutral";

  const section5GoalTitle =
    section5?.goal_label_bg ??
    "Няма налична официална цел";

  const section5ProblemIndicators =
    section5?.purb3?.parameters_outside_standard ??
    "Няма посочени";

  const section5GoalSummary =
    section5GoalCategory === "goal_achieved"
      ? "Целта от предходния план е постигната. Текущата официална цел е запазване на доброто химично състояние."
      : section5GoalCategory === "less_strict_goal"
        ? `Определена е по-малко строга цел. Проблемни показатели: ${section5ProblemIndicators}.`
        : section5GoalCategory === "extended_after_2027"
          ? `Доброто химично състояние трябва да бъде постигнато след 2027 г. Проблемни показатели: ${section5ProblemIndicators}.`
          : section5GoalCategory === "maintain_good_status"
            ? "Химичното състояние е добро. Официалната цел е то да бъде запазено."
            : "Няма достатъчно данни за официалната екологична цел.";

  const comparison =
    section4?.comparison;

  const waterBalance =
    section4?.water_balance;

  const abstractionByUse =
    section4?.abstraction_by_use;

  const thresholds =
    Array.isArray(section4?.thresholds)
      ? section4.thresholds
      : [];

  const trendSeries =
    Array.isArray(section4?.trend_series)
      ? section4.trend_series
      : [];

  const drinkingMonitoring =
    Array.isArray(section4?.drinking_monitoring)
      ? section4.drinking_monitoring
      : [];

  const exceedances =
    drinkingMonitoring.flatMap((station: any) =>
      Array.isArray(station?.indicators)
        ? station.indicators
            .filter(
              (indicator: any) =>
                indicator?.exceeds_standard === true
            )
            .map((indicator: any) => ({
              stationCode:
                station?.station_code ?? null,
              stationName:
                station?.station_name ?? "—",
              ...indicator,
            }))
        : []
    );

  const exceedanceStationCount =
    new Set(
      exceedances.map(
        (item: any) =>
          item?.stationCode ??
          item?.stationName
      )
    ).size;

  const exceedanceIndicatorCounts =
    exceedances.reduce(
      (
        counts: Record<string, number>,
        item: any
      ) => {
        const indicator =
          String(item?.indicator ?? "").trim();

        if (indicator) {
          counts[indicator] =
            (counts[indicator] ?? 0) + 1;
        }

        return counts;
      },
      {}
    );

  const mainExceedanceIndicators =
    Object.entries(
      exceedanceIndicatorCounts as Record<string, number>
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([indicator]) => indicator)
      .join(", ");

  const hasUpwardTrend =
    String(section4?.upward_trend)
      .toLowerCase() === "да";

  const monitoringSummary =
    !section4
      ? "За това подземно водно тяло няма налични данни от Раздел 4."
      : exceedances.length > 0
        ? (
            `Официалният мониторинг показва превишения в ${exceedanceStationCount} мониторингови пункта. ` +
            (
              mainExceedanceIndicators
                ? `Основни проблемни показатели: ${mainExceedanceIndicators}. `
                : ""
            ) +
            (
              hasUpwardTrend
                ? "Отчетена е и възходяща тенденция."
                : "Не е отчетена обща възходяща тенденция."
            )
          )
        : (
            "В наличните официални мониторингови записи няма установени превишения. " +
            (
              hasUpwardTrend
                ? "Въпреки това е отчетена възходяща тенденция."
                : "Не е отчетена възходяща тенденция."
            )
          );
  const chemical =
    section4?.chemical_status ??
    significant?.chemical_status ??
    "Няма данни";

  const chemicalRisk =
    comparison?.risk_2022_2027 ??
    "Няма данни";

  const pointPressurePercent =
    Number(
      profile.pointPressure
        ?.potential_impact_percent
    );

  const diffusePressurePercent =
    Number(
      profile.diffusePressure
        ?.potential_impact_percent
    );

  const hasPointPressure =
    Number.isFinite(pointPressurePercent) &&
    pointPressurePercent > 0;

  const hasDiffusePressure =
    Number.isFinite(diffusePressurePercent) &&
    diffusePressurePercent > 0;

  const significantPressureItems =
    Array.isArray(
      significant?.significant_pressures
    )
      ? significant.significant_pressures
      : [];

  const hasSignificantPressure =
    significantPressureItems.length > 0;

  const hasPressureInformation =
    Number.isFinite(pointPressurePercent) ||
    Number.isFinite(diffusePressurePercent) ||
    hasSignificantPressure ||
    Boolean(profile.pollutionRisk);

  const pressureNeedsAttention =
    hasPointPressure ||
    hasDiffusePressure ||
    hasSignificantPressure;

  const pressureSummaryTone =
    pressureNeedsAttention
      ? "warn"
      : hasPressureInformation
        ? "good"
        : "neutral";

  const pressureSummaryTitle =
    pressureNeedsAttention
      ? "Има данни за натиск върху подземното водно тяло"
      : hasPressureInformation
        ? "Не е установен съществен натиск в показаните данни"
        : "Няма достатъчно данни за оценка на натиска";

  const pressureTypes = [
    hasPointPressure
      ? "точков натиск"
      : null,
    hasDiffusePressure
      ? "дифузен натиск"
      : null,
    hasSignificantPressure
      ? "значим натиск"
      : null,
  ].filter(
    (item): item is string =>
      item !== null
  );

  const pressureSummaryText =
    pressureNeedsAttention
      ? (
          "Официалните данни показват " +
          pressureTypes.join(", ") +
          ". Това е оценка за цялото подземно водно тяло, а не доказателство за замърсяване в конкретния имот."
        )
      : hasPressureInformation
        ? "В показаните официални данни не се откроява съществен натиск. Оценката се отнася за цялото подземно водно тяло."
        : "Липсват достатъчно официални данни за просто и надеждно заключение.";

  const quantitativeStatus =
    waterBalance?.quantitative_status ??
    significant?.quantitative_status ??
    "Няма данни";

  const quantRisk =
    quantitative?.final_quantitative_risk_label_bg ??
    "Няма данни";

  const exploitation =
    waterBalance?.exploitation_index ??
    abstraction?.exploitation_index;

  const pollutants =
    section4?.pollutants ??
    integrated?.monitoring_2015_2020?.pollutants ??
    significant?.quality_parameters_outside_standard ??
    "Няма посочени";

  const formatNumber = (
    value: unknown,
    maximumFractionDigits = 2
  ) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "—";
    }

    return number.toLocaleString("bg-BG", {
      maximumFractionDigits,
    });
  };

  const chemicalIsBad =
    String(chemical).toLowerCase() === "лошо";

  const chemicalIsAtRisk =
    String(chemicalRisk)
      .toLowerCase()
      .includes("в риск") &&
    !String(chemicalRisk)
      .toLowerCase()
      .includes("не в риск");

  const chemicalSummaryTone =
    chemicalIsBad ||
    chemicalIsAtRisk ||
    hasUpwardTrend ||
    exceedances.length > 0
      ? "warn"
      : String(chemical)
          .toLowerCase() === "добро"
        ? "good"
        : "neutral";

  const chemicalSummaryTitle =
    chemicalIsBad
      ? "Необходимо е внимание към качеството на водата"
      : chemicalIsAtRisk
        ? "Има риск за бъдещото химично състояние"
        : String(chemical)
            .toLowerCase() === "добро"
          ? "Химичното състояние е оценено като добро"
          : "Няма достатъчно данни за химична оценка";

  const chemicalSummaryText =
    chemicalIsBad
      ? (
          "Подземното водно тяло е с лошо химично състояние" +
          (
            String(pollutants) !==
            "Няма посочени"
              ? `. Посочени проблемни показатели: ${String(
                  pollutants
                )}.`
              : "."
          )
        )
      : chemicalIsAtRisk
        ? "Текущото състояние не е оценено като лошо, но има официално установен риск да не бъде постигнато или запазено добро химично състояние."
        : String(chemical)
            .toLowerCase() === "добро"
          ? (
              "Общата официална оценка е благоприятна." +
              (
                hasUpwardTrend
                  ? " Въпреки това е отчетена възходяща тенденция, която изисква наблюдение."
                  : ""
              )
            )
          : "Липсват достатъчно официални данни за ясно заключение.";



  const quantitativeIsBad =
    String(quantitativeStatus)
      .toLowerCase() === "лошо";

  const quantitativeIsAtRisk =
    String(quantRisk)
      .toLowerCase()
      .includes("в риск") &&
    !String(quantRisk)
      .toLowerCase()
      .includes("не в риск");

  const exploitationNumber =
    Number(exploitation);

  const exploitationIsHigh =
    Number.isFinite(exploitationNumber) &&
    exploitationNumber >= 0.75;

  const exploitationPercent =
    Number.isFinite(exploitationNumber)
      ? exploitationNumber * 100
      : null;

  const quantityLoad =
    exploitationPercent == null
      ? "неизвестно"
      : exploitationPercent >= 75
        ? "високо"
        : exploitationPercent >= 50
          ? "умерено"
          : "ниско";

  const quantitySummaryTone =
    quantitativeIsBad ||
    quantitativeIsAtRisk ||
    exploitationIsHigh
      ? "warn"
      : String(quantitativeStatus)
          .toLowerCase() === "добро"
        ? "good"
        : "neutral";

  const quantitySummaryTitle =
    quantitySummaryTone === "warn"
      ? "Необходимо е внимание към количествения ресурс"
      : quantitySummaryTone === "good"
        ? "Количественият ресурс е в добро състояние"
        : "Няма достатъчно данни за количествена оценка";

  const quantityStateText =
    String(quantitativeStatus)
      .toLowerCase() === "добро"
      ? "Количественото състояние е оценено като добро."
      : quantitativeIsBad
        ? "Количественото състояние е оценено като лошо."
        : "Няма достатъчно данни за количественото състояние.";

  const quantityRiskText =
    quantitativeIsAtRisk
      ? "Официалната оценка показва количествен риск."
      : String(quantRisk)
          .toLowerCase()
          .includes("не в риск")
        ? "Не е установен официален количествен риск."
        : "Няма достатъчно данни за количествения риск.";

  const quantityUseText =
    exploitationPercent == null
      ? "Няма изчислен експлоатационен индекс."
      : (
          `Използват се приблизително ${formatNumber(
            exploitationPercent,
            0
          )}% от разполагаемия ресурс, което показва ${quantityLoad} натоварване.`
        );

  const quantitySummaryText =
    `${quantityStateText} ${quantityRiskText} ${quantityUseText}`;

  const quantitySummaryColors = {
    good: {
      background: "#eef7f5",
      border: "#cfe5de",
      title: "#27644f",
    },
    warn: {
      background: "#fff7e5",
      border: "#ecd7a6",
      title: "#876018",
    },
    neutral: {
      background: "#f1f5f6",
      border: "#d7e1e3",
      title: "#476168",
    },
  }[quantitySummaryTone];
  const proConclusionTone =
    chemicalIsBad ||
    chemicalIsAtRisk ||
    exceedances.length > 0
      ? "bad"
      : quantitativeIsBad ||
          quantitativeIsAtRisk ||
          exploitationIsHigh ||
          hasUpwardTrend
        ? "warn"
        : "good";

  const proConclusionTitle =
    proConclusionTone === "bad"
      ? "Необходимо е повишено внимание към качеството"
      : proConclusionTone === "warn"
        ? "Има показатели, които трябва да се проследяват"
        : "Официалните показатели са благоприятни";

  const conclusionParts: string[] = [];

  if (chemicalIsBad) {
    conclusionParts.push(
      "Химичното състояние на водното тяло е оценено като лошо"
    );
  } else if (
    String(chemical).toLowerCase() === "добро"
  ) {
    conclusionParts.push(
      "Химичното състояние е оценено като добро"
    );
  }

  if (chemicalIsAtRisk) {
    conclusionParts.push(
      "водното тяло е определено в химичен риск"
    );
  }

  if (exceedances.length > 0) {
    conclusionParts.push(
      `установени са превишения в ${exceedanceStationCount} мониторингови пункта`
    );
  }

  if (mainExceedanceIndicators) {
    conclusionParts.push(
      `основните проблемни показатели са ${mainExceedanceIndicators}`
    );
  }

  if (hasUpwardTrend) {
    conclusionParts.push(
      "отчетена е възходяща тенденция"
    );
  }

  if (
    String(quantitativeStatus)
      .toLowerCase() === "добро"
  ) {
    conclusionParts.push(
      "количественото състояние е добро"
    );
  } else if (quantitativeIsBad) {
    conclusionParts.push(
      "количественото състояние е лошо"
    );
  }

  if (exploitationIsHigh) {
    conclusionParts.push(
      "експлоатационният индекс е висок"
    );
  }

  const proConclusionText =
    conclusionParts.length > 0
      ? `${conclusionParts.join(". ")}.`
      : "Няма достатъчно официални данни за общо заключение.";

  const proConclusionColors = {
    good: {
      background: "#eaf7ef",
      border: "#bfe1cc",
      title: "#176a42",
    },
    warn: {
      background: "#fff7e5",
      border: "#ecd7a6",
      title: "#876018",
    },
    bad: {
      background: "#fff0f0",
      border: "#edc7c7",
      title: "#9c3030",
    },
  }[proConclusionTone];

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
            help="Официална обща оценка за качеството на цялото подземно водно тяло. Не е лабораторен резултат за конкретен имот."
            value={chemical}
            tone={
              String(chemical).toLowerCase() === "лошо"
                ? "bad"
                : "good"
            }
          />

          <Status
            label="Химичен риск"
            help="Показва дали има риск водното тяло да не постигне или запази добро химично състояние през периода на ПУРБ."
            value={chemicalRisk}
            tone={
              String(chemicalRisk)
                .toLowerCase()
                .includes("не в риск")
                ? "good"
                : String(chemicalRisk)
                    .toLowerCase()
                    .includes("в риск")
                  ? "bad"
                  : "neutral"
            }
          />

          <Status
            label="Количествено състояние"
            help="Оценява общия баланс между наличния подземен воден ресурс и водовземането. Не показва очаквания дебит в конкретната точка."
            value={quantitativeStatus}
            tone={
              String(quantitativeStatus).toLowerCase() === "добро"
                ? "good"
                : "warn"
            }
          />

          <Status
            label="Количествен риск"
            help="Показва дали има риск водното тяло да не постигне или запази добро количествено състояние."
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
            help="Показва каква част от разполагаемия ресурс се използва. Например стойност 0,58 означава приблизително 58% използван ресурс."
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
            knowledgeHref="/knowledge/water-quality/regional-vs-water-sample"
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
            knowledgeHref="/knowledge/water-quality"
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
            knowledgeHref="/knowledge/water-quality/quantitative-status"
            subtitle="Разбираемо обобщение на водния баланс и използването на ресурса."
          >
            <div style={{
              padding: 14,
              borderRadius: 12,
              background:
                quantitySummaryColors.background,
              border:
                `1px solid ${quantitySummaryColors.border}`,
              color: "#38535b",
              fontSize: 14,
              lineHeight: 1.65,
            }}>
              <div style={{
                fontWeight: 900,
                color: quantitySummaryColors.title,
                marginBottom: 6,
              }}>
                {quantitySummaryTitle}
              </div>

              {quantitySummaryText}
            </div>

            <div style={{
              marginTop: 12,
              padding: 11,
              borderRadius: 10,
              background: "#f5f8f9",
              color: "#61767c",
              fontSize: 12,
              lineHeight: 1.55,
            }}>
              Оценката е за цялото подземно водно
              тяло и не определя очаквания дебит
              в конкретния имот.
            </div>

            <details style={{
              marginTop: 14,
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
                Виж подробните данни за ресурса
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
                    Воден баланс
                  </div>

                  <Row
                    label="Разполагаем ресурс"
                    value={
                      waterBalance?.available_resource_l_s != null
                        ? `${formatNumber(
                            waterBalance.available_resource_l_s
                          )} l/s`
                        : abstraction?.available_resource_lps != null
                          ? `${formatNumber(
                              abstraction.available_resource_lps
                            )} l/s`
                          : "—"
                    }
                  />

                  <Row
                    label="Общо водовземане"
                    value={
                      waterBalance?.total_abstraction_m3_y != null
                        ? `${formatNumber(
                            waterBalance.total_abstraction_m3_y
                          )} m³/год.`
                        : abstraction?.permitted_total_lps != null
                          ? `${formatNumber(
                              abstraction.permitted_total_lps
                            )} l/s`
                          : "—"
                    }
                  />

                  <Row
                    label="Самоснабдяване на населението"
                    value={
                      waterBalance?.citizen_self_supply_m3_y != null
                        ? `${formatNumber(
                            waterBalance.citizen_self_supply_m3_y
                          )} m³/год.`
                        : "—"
                    }
                  />

                  <Row
                    label="Количествено състояние"
                    value={quantitativeStatus}
                  />

                  <Row
                    label="Експлоатационен индекс"
                    value={
                      exploitation == null
                        ? "—"
                        : formatNumber(
                            exploitation,
                            3
                          )
                    }
                  />

                  <Row
                    label="Използван ресурс"
                    value={
                      exploitationPercent == null
                        ? "—"
                        : `${formatNumber(
                            exploitationPercent,
                            0
                          )}% — ${quantityLoad} натоварване`
                    }
                  />

                  <Row
                    label="Официален количествен риск"
                    value={quantRisk}
                  />
                </section>

                {abstractionByUse ? (
                  <section>
                    <div style={{
                      fontWeight: 900,
                      marginBottom: 7,
                    }}>
                      Водовземане по предназначение
                    </div>

                    <Row
                      label="Обществено водоснабдяване"
                      value={`${formatNumber(
                        abstractionByUse.public_water_supply_l_s
                      )} l/s`}
                    />
                    <Row
                      label="Земеделие"
                      value={`${formatNumber(
                        abstractionByUse.agriculture_l_s
                      )} l/s`}
                    />
                    <Row
                      label="Промишленост"
                      value={`${formatNumber(
                        abstractionByUse.industry_l_s
                      )} l/s`}
                    />
                    <Row
                      label="Аквакултури"
                      value={`${formatNumber(
                        abstractionByUse.aquaculture_l_s
                      )} l/s`}
                    />
                    <Row
                      label="Битово самоснабдяване"
                      value={`${formatNumber(
                        abstractionByUse.household_self_supply_l_s
                      )} l/s`}
                    />
                    <Row
                      label="Туризъм и рекреация"
                      value={`${formatNumber(
                        abstractionByUse.tourism_recreation_l_s
                      )} l/s`}
                    />
                    <Row
                      label="Други цели"
                      value={`${formatNumber(
                        abstractionByUse.other_l_s
                      )} l/s`}
                    />
                  </section>
                ) : null}
              </div>
            </details>
          </Card>
          <Card
            title="4. Натиск и риск от замърсяване"
            knowledgeHref="/knowledge/water-quality/chemical-risk"
            subtitle="Ясно заключение и подробни официални данни в падащо меню."
          >
            <div style={{
              padding: 14,
              borderRadius: 12,
              background:
                pressureSummaryTone === "warn"
                  ? "#fff4e5"
                  : pressureSummaryTone === "good"
                    ? "#eaf7ef"
                    : "#f1f5f6",
              border:
                pressureSummaryTone === "warn"
                  ? "1px solid #efc27b"
                  : pressureSummaryTone === "good"
                    ? "1px solid #aad8ba"
                    : "1px solid #d4dfe2",
            }}>
              <div style={{
                fontSize: 17,
                fontWeight: 800,
                color:
                  pressureSummaryTone === "warn"
                    ? "#8a4f00"
                    : pressureSummaryTone === "good"
                      ? "#25633a"
                      : "#45616a",
              }}>
                {pressureSummaryTitle}
              </div>

              <div style={{
                marginTop: 7,
                color: "#314d55",
                fontSize: 14,
                lineHeight: 1.6,
              }}>
                {pressureSummaryText}
              </div>
            </div>

            <details style={{
              marginTop: 14,
              borderTop: "1px solid #e1eaec",
              paddingTop: 12,
            }}>
              <summary style={{
                cursor: "pointer",
                color: "#245663",
                fontWeight: 800,
              }}>
                Виж подробните официални данни
              </summary>

              <div style={{ marginTop: 10 }}>
                <Row
                  label="Точков натиск"
                  value={
                    Number.isFinite(
                      pointPressurePercent
                    )
                      ? `${formatNumber(
                          pointPressurePercent
                        )}%`
                      : "Няма числова стойност"
                  }
                />

                <Row
                  label="Дифузен натиск"
                  value={
                    Number.isFinite(
                      diffusePressurePercent
                    )
                      ? `${formatNumber(
                          diffusePressurePercent
                        )}%`
                      : "Няма числова стойност"
                  }
                />

                <Row
                  label="Риск от замърсяване"
                  value={
                    profile.pollutionRisk
                      ? "Налична официална оценка"
                      : "Няма налична оценка"
                  }
                />

                <Row
                  label="Значим натиск"
                  value={
                    hasSignificantPressure
                      ? significantPressureItems.join(", ")
                      : "Не е посочен"
                  }
                />
              </div>
            </details>
          </Card>

          <Card
            title="5. Химично състояние"
            knowledgeHref="/knowledge/water-quality/chemical-status"
            subtitle="Ясно заключение и подробни официални данни в падащо меню."
          >
            <div style={{
              padding: 14,
              borderRadius: 12,
              background:
                chemicalSummaryTone === "warn"
                  ? "#fff4e5"
                  : chemicalSummaryTone === "good"
                    ? "#eaf7ef"
                    : "#f1f5f6",
              border:
                chemicalSummaryTone === "warn"
                  ? "1px solid #efc27b"
                  : chemicalSummaryTone === "good"
                    ? "1px solid #aad8ba"
                    : "1px solid #d4dfe2",
            }}>
              <div style={{
                fontSize: 17,
                fontWeight: 800,
                color:
                  chemicalSummaryTone === "warn"
                    ? "#8a4f00"
                    : chemicalSummaryTone === "good"
                      ? "#25633a"
                      : "#45616a",
              }}>
                {chemicalSummaryTitle}
              </div>

              <div style={{
                marginTop: 7,
                color: "#314d55",
                fontSize: 14,
                lineHeight: 1.6,
              }}>
                {chemicalSummaryText}
              </div>

              <div style={{
                marginTop: 9,
                color: "#64777d",
                fontSize: 12,
                lineHeight: 1.5,
              }}>
                Оценката се отнася за цялото подземно
                водно тяло, а не за водна проба от
                конкретния имот.
              </div>
            </div>

            <details style={{
              marginTop: 14,
              borderTop: "1px solid #e1eaec",
              paddingTop: 12,
            }}>
              <summary style={{
                cursor: "pointer",
                color: "#245663",
                fontWeight: 800,
              }}>
                Виж подробните официални данни
              </summary>

              <div style={{ marginTop: 10 }}>
                <Row
                  label="Химично състояние"
                  value={chemical}
                />

                <Row
                  label="Химичен риск"
                  value={chemicalRisk}
                />

                <Row
                  label="Възходяща тенденция"
                  value={
                    section4?.upward_trend ?? "—"
                  }
                />

                <Row
                  label="Проблемни показатели"
                  value={String(pollutants)}
                />

                <Row
                  label="Риск ПУРБ 2"
                  value={
                    comparison?.risk_2016_2021 ??
                    "—"
                  }
                />

                <Row
                  label="Състояние ПУРБ 2"
                  value={
                    comparison?.status_2016_2021 ??
                    "—"
                  }
                />

                <Row
                  label="Риск ПУРБ 3"
                  value={
                    comparison?.risk_2022_2027 ??
                    "—"
                  }
                />

                <Row
                  label="Състояние ПУРБ 3"
                  value={
                    comparison?.status_2022_2027 ??
                    "—"
                  }
                />

                {section4?.tests ? (
                  <details style={{
                    marginTop: 14,
                    borderTop:
                      "1px solid #e1eaec",
                    paddingTop: 12,
                  }}>
                    <summary style={{
                      cursor: "pointer",
                      color: "#245663",
                      fontWeight: 800,
                    }}>
                      Резултати от химичните тестове
                    </summary>

                    <div style={{ marginTop: 8 }}>
                      <Row
                        label="Обща оценка"
                        value={
                          section4.tests.general ??
                          "—"
                        }
                      />

                      <Row
                        label="Солен или замърсяващ интрузивен натиск"
                        value={
                          section4.tests
                            .saline_or_polluted_intrusion ??
                          "—"
                        }
                      />

                      <Row
                        label="Въздействие върху повърхностни води"
                        value={
                          section4.tests
                            .surface_water_impact ??
                          "—"
                        }
                      />

                      <Row
                        label="Зависими екосистеми"
                        value={
                          section4.tests
                            .groundwater_dependent_ecosystems ??
                          "—"
                        }
                      />

                      <Row
                        label="Влошаване на питейни води"
                        value={
                          section4.tests
                            .drinking_water_deterioration ??
                          "—"
                        }
                      />
                    </div>
                  </details>
                ) : null}
              </div>
            </details>
          </Card>

          <Card
            title="6. Мониторинг"
            knowledgeHref="/knowledge/water-quality/monitoring-exceedances"
            subtitle="Разбираемо обобщение на официалните данни за качеството на водата."
          >
            <section style={{
              marginTop: 0,
              padding: "18px 20px",
              borderRadius: 16,
              background:
                proConclusionColors.background,
              border:
                `1px solid ${proConclusionColors.border}`,
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                flexWrap: "wrap",
              }}>
                <div style={{
                  padding: "4px 8px",
                  borderRadius: 7,
                  background: "#0d8055",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: ".08em",
                }}>
                  PRO
                </div>

                <div style={{
                  fontSize: 12,
                  fontWeight: 900,
                  color: proConclusionColors.title,
                  textTransform: "uppercase",
                  letterSpacing: ".05em",
                }}>
                  Общо заключение
                </div>
              </div>

              <h2 style={{
                margin: "10px 0 0",
                fontSize: 20,
                color: proConclusionColors.title,
              }}>
                {proConclusionTitle}
              </h2>

              <p style={{
                margin: "8px 0 0",
                color: "#334f56",
                fontSize: 14,
                lineHeight: 1.65,
              }}>
                {proConclusionText}
              </p>

              <p style={{
                margin: "9px 0 0",
                color: "#6b7d82",
                fontSize: 11,
                lineHeight: 1.5,
              }}>
                Заключението е автоматично обобщение на
                официалните данни за подземното водно тяло,
                а не оценка на водата в конкретния имот.
              </p>
            </section>

            <div style={{
              padding: 14,
              borderRadius: 12,
              background:
                exceedances.length > 0
                  ? "#fff1f1"
                  : "#eef7f5",
              border:
                exceedances.length > 0
                  ? "1px solid #efcaca"
                  : "1px solid #cfe5de",
              color:
                exceedances.length > 0
                  ? "#7d3030"
                  : "#365f55",
              fontSize: 14,
              lineHeight: 1.65,
            }}>
              <div style={{
                fontWeight: 900,
                marginBottom: 6,
              }}>
                {exceedances.length > 0
                  ? "Има данни за проблем с качеството"
                  : "Няма установени превишения"}
              </div>

              {monitoringSummary}
            </div>

            <div style={{
              marginTop: 12,
              padding: 11,
              borderRadius: 10,
              background: "#fff8e8",
              color: "#705a27",
              fontSize: 12,
              lineHeight: 1.55,
            }}>
              Данните се отнасят за цялото подземно
              водно тяло. Те не доказват автоматично
              същото качество на водата в конкретния
              имот.
            </div>

            <details style={{
              marginTop: 14,
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
                Виж подробните официални данни
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
                    Обобщени стойности
                  </div>

                  <Row
                    label="Времеви серии"
                    value={String(trendSeries.length)}
                  />
                  <Row
                    label="Питейни мониторингови пунктове"
                    value={String(drinkingMonitoring.length)}
                  />
                  <Row
                    label="Пунктове с превишения"
                    value={String(exceedanceStationCount)}
                  />
                  <Row
                    label="Установени превишения"
                    value={String(exceedances.length)}
                  />
                  <Row
                    label="Прагови показатели"
                    value={String(thresholds.length)}
                  />
                </section>

                {trendSeries.length > 0 ? (
                  <section>
                    <div style={{
                      fontWeight: 900,
                      marginBottom: 7,
                    }}>
                      Тенденции
                    </div>

                    <div style={{
                      display: "grid",
                      gap: 8,
                    }}>
                      {trendSeries.map(
                        (trend: any, index: number) => {
                          const points =
                            Array.isArray(trend?.points)
                              ? trend.points
                              : [];

                          const firstYear =
                            points[0]?.year ?? "—";

                          const lastYear =
                            points[points.length - 1]
                              ?.year ?? "—";

                          return (
                            <div
                              key={`${trend?.station_code ?? index}-${trend?.indicator ?? index}`}
                              style={{
                                padding: 10,
                                borderRadius: 9,
                                background: "#eef3f5",
                                fontSize: 12,
                                lineHeight: 1.5,
                              }}
                            >
                              <strong>
                                {trend?.station_name ?? "—"}
                              </strong>
                              <div>
                                Показател:{" "}
                                {trend?.indicator ?? "—"}
                              </div>
                              <div>
                                Период: {firstYear}–{lastYear}
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
                    Установени превишения
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
                              border: "1px solid #f1cccc",
                              fontSize: 12,
                              lineHeight: 1.5,
                            }}
                          >
                            <strong>
                              {item?.stationName ?? "—"}
                            </strong>
                            <div>
                              {item?.indicator ?? "—"}:{" "}
                              {formatNumber(
                                item?.mean_value,
                                6
                              )}
                              {" при норма "}
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
                      background: "#eef7f5",
                      color: "#47645d",
                      fontSize: 12,
                    }}>
                      Няма установени превишения
                      в наличните записи.
                    </div>
                  )}
                </section>

                <section>
                  <div style={{
                    fontWeight: 900,
                    marginBottom: 7,
                  }}>
                    Прагови и фонови стойности
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
                              {threshold?.indicator ?? "—"}
                            </strong>
                            <div>
                              Праг:{" "}
                              {formatNumber(
                                threshold?.threshold_value,
                                6
                              )}{" "}
                              {threshold?.unit ?? ""}
                            </div>
                            <div>
                              Фонова стойност:{" "}
                              {formatNumber(
                                threshold?.background_value,
                                6
                              )}{" "}
                              {threshold?.unit ?? ""}
                            </div>
                            <div>
                              Стандарт:{" "}
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
                      За това водно тяло няма надеждно
                      свързани прагови стойности.
                      Не е правено предположително
                      свързване със стари кодове.
                    </div>
                  )}
                </section>
              </div>
            </details>
          </Card>
          <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          <Card
            title="7. Климатична устойчивост"
            knowledgeHref="/knowledge/water-quality/water-balance"
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
            title="8. Екологични цели и срокове"
            knowledgeHref="/knowledge/water-quality/environmental-objectives-exemptions"
            subtitle="Официални цели, срокове и защита на питейните води."
          >
            {section5 ? (
              <>
                <div style={{
                  padding: 14,
                  borderRadius: 12,
                  background:
                    section5GoalTone === "warn"
                      ? "#fff4e5"
                      : section5GoalTone === "good"
                        ? "#eaf7ef"
                        : "#f1f5f6",
                  border:
                    section5GoalTone === "warn"
                      ? "1px solid #efc27b"
                      : section5GoalTone === "good"
                        ? "1px solid #aad8ba"
                        : "1px solid #d4dfe2",
                }}>
                  <div style={{
                    fontSize: 17,
                    fontWeight: 800,
                    color:
                      section5GoalTone === "warn"
                        ? "#8a4f00"
                        : section5GoalTone === "good"
                          ? "#25633a"
                          : "#45616a",
                  }}>
                    {section5GoalTitle}
                  </div>

                  <div style={{
                    marginTop: 7,
                    color: "#314d55",
                    fontSize: 14,
                    lineHeight: 1.6,
                  }}>
                    {section5GoalSummary}
                  </div>
                </div>

                <details style={{
                  marginTop: 14,
                  paddingTop: 12,
                  borderTop: "1px solid #e1eaec",
                }}>
                  <summary style={{
                    cursor: "pointer",
                    color: "#245663",
                    fontWeight: 800,
                  }}>
                    Виж официалните цели и срокове
                  </summary>

                  <div style={{ marginTop: 10 }}>
                    <Row
                      label="Състояние ПУРБ 2"
                      value={section5.purb2?.chemical_status ?? "—"}
                    />

                    <Row
                      label="Цел ПУРБ 2"
                      value={section5.purb2?.objective ?? "—"}
                    />

                    <Row
                      label="Състояние ПУРБ 3"
                      value={section5.purb3?.chemical_status ?? "—"}
                    />

                    <Row
                      label="Проблемни показатели"
                      value={section5ProblemIndicators}
                    />

                    <Row
                      label="Цел ПУРБ 3"
                      value={section5.purb3?.objective ?? "—"}
                    />

                    <Row
                      label="Срок"
                      value={
                        section5.purb3?.target_year ??
                        section5.exception_detail?.target_year_or_type ??
                        "Не е приложим"
                      }
                    />

                    <Row
                      label="Изключение"
                      value={
                        section5.purb3?.exception ??
                        "Няма приложено изключение"
                      }
                    />

                    {section5.exception_detail ? (
                      <>
                        <Row
                          label="Правно основание"
                          value={
                            section5.exception_detail.legal_basis ??
                            "—"
                          }
                        />

                        <div style={{
                          marginTop: 10,
                          padding: 12,
                          borderRadius: 10,
                          background: "#f5f8f9",
                          color: "#435b62",
                          fontSize: 13,
                          lineHeight: 1.65,
                        }}>
                          <strong>
                            Официална обосновка:
                          </strong>{" "}
                          {section5.exception_detail.justification ??
                            "Няма налична обосновка."}
                        </div>
                      </>
                    ) : null}

                    {section5.drinking_water_objective ? (
                      <>
                        <Row
                          label="Защитена питейна зона"
                          value={
                            section5.drinking_water_objective.zone_code ??
                            "—"
                          }
                        />

                        <Row
                          label="Цел за питейните води"
                          value={
                            section5.drinking_water_objective.objective ??
                            "—"
                          }
                        />
                      </>
                    ) : null}
                  </div>
                </details>

                <div style={{
                  marginTop: 12,
                  padding: 11,
                  borderRadius: 10,
                  background: "#eef7f5",
                  color: "#47645d",
                  fontSize: 12,
                  lineHeight: 1.5,
                }}>
                  Данните се отнасят за цялото подземно
                  водно тяло, а не за конкретен имот.
                </div>
              </>
            ) : (
              <div style={{
                padding: 12,
                borderRadius: 10,
                background: "#f5f8f9",
                color: "#708187",
                fontSize: 13,
              }}>
                Няма налични данни от Раздел 5.
              </div>
            )}
          </Card>
          </div>
          <Card
            title="9. Какво има около точката"
            knowledgeHref="/knowledge/water-quality/drinking-water-protection-zones"
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
            title="10. Сондажна перспектива"
            knowledgeHref="/knowledge/water-quality/exploitation-index"
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
            title="11. Препоръка за сондаж"
            knowledgeHref="/knowledge/water-quality/quantitative-status"
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
            title="12. Професионално заключение"
            knowledgeHref="/knowledge/water-quality/rbmp-comparison"
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
