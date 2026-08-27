import "server-only";

import fs from "node:fs";
import path from "node:path";

export type GwbProfile = {
  gwbCode: string;
  identity: {
    nameBg?: string | null;
  };

  pointPressure?: any;
  diffusePressure?: any;
  pollutionRisk?: any;
  significantPressure?: any;

  abstraction?: any;
  quantitativeRisk?: any;

  integratedRisk?: any;

  climate?: any;

  section4?: any;

  section5?: any;

  section7?: any;

  geology?: any;

  blackSeaSection1?: any;

  blackSeaSection2?: any;

  blackSeaSection3?: any;

  blackSeaSection4?: any;

  blackSeaSection5?: any;

  blackSeaSection7?: any;

  blackSeaCurrentRegisters?: any;

  blackSeaAdditionalRegisters?: any;

  danubeSection1?: any;

  westernAegeanSection1?: any;

  westernAegeanSection2?: any;

  westernAegeanSection3?: any;

  westernAegeanSection4?: any;

  westernAegeanSection5?: any;

  westernAegeanSection7?: any;

  westernAegeanCurrentRegisters?: any;

  westernAegeanAdditionalRegisters?: any;

  sources: string[];
};

function normalizeCode(value: unknown) {
  return String(value ?? "")
    .trim()
    .toUpperCase();
}

function readJsonOptional(filename: string): any | null {
  const filepath = path.join(
    process.cwd(),
    "public",
    "geology-map",
    "data",
    filename
  );

  if (!fs.existsSync(filepath)) {
    return null;
  }

  try {
    return JSON.parse(
      fs.readFileSync(filepath, "utf8")
    );
  } catch (error) {
    console.error(
      `[Sondi PRO] Не може да се прочете ${filename}`,
      error
    );
    return null;
  }
}

function findRecord(
  data: any,
  gwbCode: string
): any | null {
  if (!data) return null;

  const wanted = normalizeCode(gwbCode);

  if (
    data.profiles &&
    !Array.isArray(data.profiles) &&
    typeof data.profiles === "object"
  ) {
    const direct = data.profiles[wanted];

    if (direct) return direct;

    const matchingKey = Object.keys(
      data.profiles
    ).find(
      (key) => normalizeCode(key) === wanted
    );

    return matchingKey
      ? data.profiles[matchingKey]
      : null;
  }

  const records =
    Array.isArray(data)
      ? data
      : Array.isArray(data.records)
        ? data.records
        : Array.isArray(data.profiles)
          ? data.profiles
          : [];

  return (
    records.find((record: any) => {
      const code =
        record?.gwb_code ??
        record?.gwbCode ??
        record?.localId ??
        record?.code;

      return normalizeCode(code) === wanted;
    }) ?? null
  );
}

const DATASETS = {
  pointPressure:
    "bd_ibr_point_source_pressure.json",

  diffusePressure:
    "bd_ibr_diffuse_source_pressure.json",

  pollutionRisk:
    "bd_ibr_pollution_risk.json",

  significantPressure:
    "bd_ibr_significant_pressure.json",

  abstraction:
    "bd_ibr_abstraction_pressure.json",

  quantitativeRisk:
    "bd_ibr_quantitative_risk.json",

  integratedRisk:
    "bd_ibr_integrated_risk_assessment.json",

  climate:
    "bd_ibr_climate_resource_forecast.json",

  section4:
    "bd_ibr_section4_pro_profiles.json",

  section5:
    "bd_ibr_section5_environmental_objectives.json",

  section7:
    "bd_ibr_section7_groundwater_measures.json",

  geology:
    "groundwater_geology_profiles.json",

  blackSeaSection1:
    "bd_bs_section1_profiles.json",

  blackSeaSection2:
    "bd_bs_section2_pressure_risk.json",

  blackSeaSection3:
    "bd_bs_section3_protected_zones.json",

  blackSeaSection4:
    "bd_bs_section4_monitoring_status.json",

  blackSeaSection5:
    "bd_bs_section5_environmental_objectives.json",

  blackSeaSection7:
    "bd_bs_section7_groundwater_measures.json",

  blackSeaCurrentRegisters:
    "bd_bs_current_groundwater_registers.json",

  blackSeaAdditionalRegisters:
    "bd_bs_additional_groundwater_registers.json",

  danubeSection1:
    "bd_danube_section1_profiles.json",

  westernAegeanSection1:
    "bd_wabd_section1_profiles.json",

  westernAegeanSection2:
    "bd_wabd_section2_pressure_risk.json",

  westernAegeanSection3:
    "bd_wabd_section3_protected_zones.json",

  westernAegeanSection4:
    "bd_wabd_section4_monitoring_status.json",

  westernAegeanSection5:
    "bd_wabd_section5_environmental_objectives.json",

  westernAegeanSection7:
    "bd_wabd_section7_groundwater_measures.json",

  westernAegeanCurrentRegisters:
    "bd_wabd_current_groundwater_registers.json",

  westernAegeanAdditionalRegisters:
    "bd_wabd_additional_groundwater_registers.json",
} as const;

export function getGwbProfile(
  gwbCode: string
): GwbProfile {
  const records: Record<string, any> = {};
  const sources: string[] = [];

  for (const [key, filename] of Object.entries(DATASETS)) {
    const data = readJsonOptional(filename);

    if (!data) continue;

    const record = findRecord(
      data,
      gwbCode
    );

    if (record) {
      records[key] = record;
      sources.push(filename);
    }
  }

  const candidates = Object.values(records);

  const nameBg =
    candidates.find(
      (r: any) =>
        r?.name_bg ||
        r?.nameBg ||
        r?.name
    )?.name_bg ??
    candidates.find(
      (r: any) =>
        r?.name_bg ||
        r?.nameBg ||
        r?.name
    )?.nameBg ??
    candidates.find(
      (r: any) =>
        r?.name_bg ||
        r?.nameBg ||
        r?.name
    )?.name ??
    null;

  return {
    gwbCode,
    identity: {
      nameBg,
    },

    pointPressure:
      records.pointPressure,

    diffusePressure:
      records.diffusePressure,

    pollutionRisk:
      records.pollutionRisk,

    significantPressure:
      records.significantPressure,

    abstraction:
      records.abstraction,

    quantitativeRisk:
      records.quantitativeRisk,

    integratedRisk:
      records.integratedRisk,

    climate:
      records.climate,

    section4:
      records.section4,

    section5:
      records.section5,

    section7:
      records.section7,

    geology:
      records.geology,

    blackSeaSection1:
      records.blackSeaSection1,

    blackSeaSection2:
      records.blackSeaSection2,

    blackSeaSection3:
      records.blackSeaSection3,

    blackSeaSection4:
      records.blackSeaSection4,

    blackSeaSection5:
      records.blackSeaSection5,

    blackSeaSection7:
      records.blackSeaSection7,

    blackSeaCurrentRegisters:
      records.blackSeaCurrentRegisters,

    blackSeaAdditionalRegisters:
      records.blackSeaAdditionalRegisters,

    danubeSection1:
      records.danubeSection1,

    westernAegeanSection1:
      records.westernAegeanSection1,

    westernAegeanSection2:
      records.westernAegeanSection2,

    westernAegeanSection3:
      records.westernAegeanSection3,

    westernAegeanSection4:
      records.westernAegeanSection4,

    westernAegeanSection5:
      records.westernAegeanSection5,

    westernAegeanSection7:
      records.westernAegeanSection7,

    westernAegeanCurrentRegisters:
      records.westernAegeanCurrentRegisters,

    westernAegeanAdditionalRegisters:
      records.westernAegeanAdditionalRegisters,

    sources,
  };
}
