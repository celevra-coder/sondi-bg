import path from "node:path";
import fs from "node:fs";
import { NextRequest, NextResponse } from "next/server";
import { resolveGroundwaterBodiesAtPoint } from "@/lib/gwb-spatial-resolver";
import {
  getMineralWaterAreaProfile,
  getMineralWaterProfile,
} from "@/lib/mineral-water-profile";
import {
  getMineralLegalSummaryByFacilityId,
  getMineralNewFacilityGuidance,
  getMineralPermitContext,
  getMineralLegalDepositDetail,
  searchMineralLegalDeposits,
} from "@/lib/mineral-water-legal";

import {
  resolveMineralFacilityLegalContext,
} from "@/lib/mineral-facility-legal-context";

type LegalMineralFacilitySearchMatch = {
  mineralId: string;
  name: string | null;
  facilityType: string | null;
  settlement: string | null;
  deposit: string | null;
  section: string | null;
  registryNumber: string | null;
  score: number;
};

let legalMineralMasterCache:
  | Array<Record<string, any>>
  | null = null;

function getLegalMineralMasterRecords():
  Array<Record<string, any>> {
  if (legalMineralMasterCache) {
    return legalMineralMasterCache;
  }

  const filePath =
    path.join(
      process.cwd(),
      "data",
      "mineral-water",
      "mineral_water_master.json"
    );

  const raw =
    JSON.parse(
      fs.readFileSync(
        filePath,
        "utf8"
      )
    );

  const records =
    Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.records)
        ? raw.records
        : Array.isArray(raw?.facilities)
          ? raw.facilities
          : Array.isArray(raw?.items)
            ? raw.items
            : [];

  legalMineralMasterCache =
    records;

  return records;
}

function legalSearchText(
  value: unknown
): string {
  return String(
    value ?? ""
  )
    .trim()
    .toLocaleLowerCase("bg-BG")
    .replace(/[–—−]/g, "-")
    .replace(/\s*-\s*/g, "-")
    .replace(/№\s*/g, "№")
    .replace(/\s+/g, " ");
}

function searchMineralFacilitiesForLegal(
  query: string,
  limit = 30
): LegalMineralFacilitySearchMatch[] {
  const wanted =
    legalSearchText(query);

  if (!wanted) {
    return [];
  }

  const matches:
    LegalMineralFacilitySearchMatch[] =
    [];

  for (
    const record
    of getLegalMineralMasterRecords()
  ) {
    const mineralId =
      String(
        record?.mineral_id || ""
      ).trim();

    if (!mineralId) {
      continue;
    }

    const profile =
      getMineralWaterProfile(
        mineralId
      );

    if (!profile) {
      continue;
    }

    const name =
      profile.name || null;

    const registryNumber =
      profile.registryNumber || null;

    const facilityType =
      profile.facilityType || null;

    const settlement =
      profile.settlement || null;

    const deposit =
      profile.deposit || null;

    const section =
      profile.section || null;

    const fields = [
      {
        value: name,
        weight: 100,
      },
      {
        value: registryNumber,
        weight: 95,
      },
      {
        value: mineralId,
        weight: 90,
      },
      {
        value:
          record?.identity?.name,
        weight: 85,
      },
      {
        value:
          record?.identity?.facility,
        weight: 85,
      },
      {
        value:
          record?.free?.facility,
        weight: 80,
      },
      {
        value:
          record?.free?.name,
        weight: 80,
      },
      {
        value:
          record?.pro
            ?.existing_properties
            ?.facility,
        weight: 80,
      },
      {
        value:
          record?.pro
            ?.existing_properties
            ?.registry_number,
        weight: 95,
      },
      {
        value: section,
        weight: 40,
      },
    ];

    let bestScore = 0;

    for (const field of fields) {
      const text =
        legalSearchText(
          field.value
        );

      if (!text) {
        continue;
      }

      if (text === wanted) {
        bestScore =
          Math.max(
            bestScore,
            field.weight + 100
          );

        continue;
      }

      if (text.startsWith(wanted)) {
        bestScore =
          Math.max(
            bestScore,
            field.weight + 50
          );

        continue;
      }

      if (text.includes(wanted)) {
        bestScore =
          Math.max(
            bestScore,
            field.weight
          );
      }
    }

    if (bestScore <= 0) {
      continue;
    }

    matches.push({
      mineralId,
      name,
      facilityType,
      settlement,
      deposit,
      section,
      registryNumber,
      score: bestScore,
    });
  }

  return matches
    .sort(
      (a, b) =>
        b.score - a.score ||
        String(a.name || "")
          .localeCompare(
            String(b.name || ""),
            "bg"
          )
    )
    .slice(
      0,
      limit
    );
}
function findMineralProfileValue(
  value: unknown,
  keys: string[]
): unknown {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found =
        findMineralProfileValue(
          item,
          keys
        );

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

  const objectValue =
    value as Record<string, any>;

  for (const key of keys) {
    const candidate =
      objectValue[key];

    if (
      candidate !== null &&
      candidate !== undefined &&
      candidate !== ""
    ) {
      return candidate;
    }
  }

  for (
    const child
    of Object.values(objectValue)
  ) {
    const found =
      findMineralProfileValue(
        child,
        keys
      );

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

function getMineralAnalysisAvailability(
  profile:
    ReturnType<
      typeof getMineralWaterProfile
    >
) {
  if (!profile) {
    return {
      hasPermitData: false,
      permitNumber: null,

      hasHolderData: false,
      holder: null,

      hasPurposeData: false,
      purpose: null,

      hasVolumeData: false,
      volume: null,

      hasPermitTermData: false,
      permitTerm: null,

      hasRegistryData: false,
      registryNumber: null,

      hasDepthData: false,
      depthM: null,

      hasTemperatureData: false,
      temperatureC: null,

      hasSectionData: false,
      section: null,

      hasOfficialSources: false,
      sourceCount: 0,
    };
  }

  const searchable = {
    existingProperties:
      profile.existingProperties || {},

    researchEnrichment:
      profile.researchEnrichment || {},
  };

  const permitNumber =
    findMineralProfileValue(
      searchable,
      [
        "permit_number",
        "permit_no",
        "permit_id",
      ]
    );

  const holder =
    findMineralProfileValue(
      searchable,
      [
        "permit_holder",
        "holder",
        "titular",
        "beneficiary",
      ]
    );

  const purpose =
    findMineralProfileValue(
      searchable,
      [
        "purpose",
        "use_purpose",
        "water_use_purpose",
      ]
    );

  const volume =
    findMineralProfileValue(
      searchable,
      [
        "permitted_volume",
        "permitted_total_lps",
        "permitted_abstraction_l_s",
        "annual_limit_m3_year",
        "flow_l_s",
        "discharge_l_s",
        "debit",
        "resource",
      ]
    );

  const permitTerm =
    findMineralProfileValue(
      searchable,
      [
        "permit_end",
        "permit_end_date",
        "end_date_raw",
        "valid_to",
        "expiry_date",
      ]
    );

  const registryNumber =
    profile.registryNumber ||
    findMineralProfileValue(
      searchable,
      [
        "registry_number",
        "register_number",
      ]
    );

  return {
    hasPermitData:
      Boolean(permitNumber),

    permitNumber:
      permitNumber !== null &&
      permitNumber !== undefined
        ? String(permitNumber)
        : null,

    hasHolderData:
      Boolean(holder),

    holder:
      holder !== null &&
      holder !== undefined
        ? String(holder)
        : null,

    hasPurposeData:
      Boolean(purpose),

    purpose:
      purpose !== null &&
      purpose !== undefined
        ? String(purpose)
        : null,

    hasVolumeData:
      Boolean(volume),

    volume:
      volume !== null &&
      volume !== undefined
        ? String(volume)
        : null,

    hasPermitTermData:
      Boolean(permitTerm),

    permitTerm:
      permitTerm !== null &&
      permitTerm !== undefined
        ? String(permitTerm)
        : null,

    hasRegistryData:
      Boolean(registryNumber),

    registryNumber:
      registryNumber
        ? String(registryNumber)
        : null,

    hasDepthData:
      profile.depthM !== null,

    depthM:
      profile.depthM,

    hasTemperatureData:
      profile.temperatureC !== null,

    temperatureC:
      profile.temperatureC,

    hasSectionData:
      Boolean(profile.section),

    section:
      profile.section || null,

    hasOfficialSources:
      Array.isArray(profile.sources) &&
      profile.sources.length > 0,

    sourceCount:
      Array.isArray(profile.sources)
        ? profile.sources.length
        : 0,
  };
}
const basinMeta = {
  BG1: {
    directorate: "danube",
    name: "\u0411\u0430\u0441\u0435\u0439\u043d\u043e\u0432\u0430 \u0434\u0438\u0440\u0435\u043a\u0446\u0438\u044f \u201e\u0414\u0443\u043d\u0430\u0432\u0441\u043a\u0438 \u0440\u0430\u0439\u043e\u043d\u201c",
    formsUrl:
      "https://www.bd-dunav.bg/content/razreshitelen-rejim/registraciia-na-vodovzemni-saorajeniia/",
    existingRegisterUrl: null,
    existingRegisterSearchable: false,

    formExistingWellPermitUrl:
      "https://www.bd-dunav.org/uploads/content/files/Razreshitelen%20rejim/Blanki%20za%20zaiavlenia%20za%20izdavane%20na%20razreshitelni/korigirani%20blanki%20-%2016.04.2020/podzemni/15%20%D0%9E%D0%B1%D1%80%D0%B0%D0%B7%D0%B5%D1%86%20%D0%BA%D1%8A%D0%BC%20%D0%B7%D0%B0%D0%BF%D0%BE%D0%B2%D0%B5%D0%B4%20%D0%BE%D0%B1%D1%80%D0%B0%D0%B7%D1%86%D0%B8%20%D0%97%D0%92-2.docx",
    formAmendGroundwaterPermitUrl:
      "https://www.bd-dunav.org/uploads/content/files/Razreshitelen%20rejim/Blanki%20za%20zaiavlenia%20za%20izdavane%20na%20razreshitelni/korigirani%20blanki%20-%2016.04.2020/podzemni/32%20%D0%9E%D0%B1%D1%80%D0%B0%D0%B7%D0%B5%D1%86%20%D0%BA%D1%8A%D0%BC%20%D0%B7%D0%B0%D0%BF%D0%BE%D0%B2%D0%B5%D0%B4%20%D0%BE%D0%B1%D1%80%D0%B0%D0%B7%D1%86%D0%B8%20%D0%97%D0%92-2.docx",

    formOldOwnUseRg2Url:
      "https://www.bd-dunav.bg/uploads/content/files/Razreshitelen%20rejim/Uvedomlenie%20i%20zayavlenie%20za%20Kl%20sobstv%20potr/Registracia_Kladenci_fizicheski%20lica%202%20-%20fin.doc",

    formNormalOwnUseRg1Url:
      "https://www.bd-dunav.bg/uploads/content/files/Razreshitelen%20rejim/Uvedomlenie%20i%20zayavlenie%20za%20Kl%20sobstv%20potr/Registracia_Kladenci_fizicheski%20lica%201-%20fin.doc",

    existingRegisterLookupNote:
      "\u0411\u0414\u0414\u0420 \u043d\u0435 \u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0432\u0430 \u043e\u0442\u0434\u0435\u043b\u0435\u043d \u043e\u043d\u043b\u0430\u0439\u043d \u0440\u0435\u0433\u0438\u0441\u0442\u044a\u0440 \u0441 \u0442\u044a\u0440\u0441\u0430\u0447\u043a\u0430 \u0437\u0430 \u0442\u0435\u0437\u0438 \u043a\u043b\u0430\u0434\u0435\u043d\u0446\u0438. \u0417\u0430 \u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0430 \u0441\u0435 \u043f\u043e\u0434\u0430\u0432\u0430 \u0437\u0430\u043f\u0438\u0442\u0432\u0430\u043d\u0435 \u0434\u043e \u0411\u0430\u0441\u0435\u0439\u043d\u043e\u0432\u0430 \u0434\u0438\u0440\u0435\u043a\u0446\u0438\u044f \u201e\u0414\u0443\u043d\u0430\u0432\u0441\u043a\u0438 \u0440\u0430\u0439\u043e\u043d\u201c \u0441 \u0434\u0430\u043d\u043d\u0438 \u0437\u0430 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438\u043a\u0430, \u0438\u043c\u043e\u0442\u0430 \u0438 \u043c\u0435\u0441\u0442\u043e\u043f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u0435\u0442\u043e \u043d\u0430 \u0441\u043e\u043d\u0434\u0430\u0436\u0430.",

    formOwnUseUg1Url:
      "https://bsbd.bg/ObrazciZayawleniq/Uvedomlenie_Kladenci_fizicheski%20lica.doc",

    formNewWellPermitUrl:
      "https://bsbd.bg/ObrazciZayawleniq/14%20%D0%9E%D0%B1%D1%80%D0%B0%D0%B7%D0%B5%D1%86%20%D0%BA%D1%8A%D0%BC%20%D0%B7%D0%B0%D0%BF%D0%BE%D0%B2%D0%B5%D0%B4%20%D0%BE%D0%B1%D1%80%D0%B0%D0%B7%D1%86%D0%B8%20%D0%97%D0%92%20%2840%29.docx",
},
  BG2: {
    directorate: "black-sea",
    name: "\u0411\u0430\u0441\u0435\u0439\u043d\u043e\u0432\u0430 \u0434\u0438\u0440\u0435\u043a\u0446\u0438\u044f \u201e\u0427\u0435\u0440\u043d\u043e\u043c\u043e\u0440\u0441\u043a\u0438 \u0440\u0430\u0439\u043e\u043d\u201c",
    formsUrl: "https://www.bsbd.bg/bg/formulqri.html",
    existingRegisterUrl:
      "https://www.bsbd.bg/bg/register.html",
    existingRegisterSearchable: true,
    existingRegisterLookupNote: null,

    formExistingWellPermitUrl:
      "https://www.bsbd.bg/ObrazciZayawleniq/15%20%D0%9E%D0%B1%D1%80%D0%B0%D0%B7%D0%B5%D1%86%20%D0%BA%D1%8A%D0%BC%20%D0%B7%D0%B0%D0%BF%D0%BE%D0%B2%D0%B5%D0%B4%20%D0%BE%D0%B1%D1%80%D0%B0%D0%B7%D1%86%D0%B8%20%D0%97%D0%92%20%2814%29.docx",
    formAmendGroundwaterPermitUrl:
      "https://www.bsbd.bg/ObrazciZayawleniq/32%20%D0%9E%D0%B1%D1%80%D0%B0%D0%B7%D0%B5%D1%86%20%D0%BA%D1%8A%D0%BC%20%D0%B7%D0%B0%D0%BF%D0%BE%D0%B2%D0%B5%D0%B4%20%D0%BE%D0%B1%D1%80%D0%B0%D0%B7%D1%86%D0%B8%20%D0%97%D0%92%20%289%29.docx",

    formOldOwnUseRg2Url:
      "https://www.bsbd.bg/ObrazciZayawleniq/Registracia_Kladenci_fizicheski%20lica%202.doc",

    formNormalOwnUseRg1Url:
      "https://www.bsbd.bg/ObrazciZayawleniq/Registracia_Kladenci_fizicheski%20lica%201.doc",

    formOwnUseUg1Url:
      "https://bsbd.bg/ObrazciZayawleniq/Uvedomlenie_Kladenci_fizicheski%20lica.doc",

    formNewWellPermitUrl:
      "https://bsbd.bg/ObrazciZayawleniq/14%20%D0%9E%D0%B1%D1%80%D0%B0%D0%B7%D0%B5%D1%86%20%D0%BA%D1%8A%D0%BC%20%D0%B7%D0%B0%D0%BF%D0%BE%D0%B2%D0%B5%D0%B4%20%D0%BE%D0%B1%D1%80%D0%B0%D0%B7%D1%86%D0%B8%20%D0%97%D0%92%20%2840%29.docx",
},
  BG3: {
    directorate: "east-aegean",
    name: "\u0411\u0430\u0441\u0435\u0439\u043d\u043e\u0432\u0430 \u0434\u0438\u0440\u0435\u043a\u0446\u0438\u044f \u201e\u0418\u0437\u0442\u043e\u0447\u043d\u043e\u0431\u0435\u043b\u043e\u043c\u043e\u0440\u0441\u043a\u0438 \u0440\u0430\u0439\u043e\u043d\u201c",
    formsUrl: "https://earbd.bg/indexdetails.php?menu_id=285",
    existingRegisterUrl:
      "https://earbd.bg/Vodovzemni_syorzheniya-p2452",
    existingRegisterSearchable: true,
    existingRegisterLookupNote: null,

    formExistingWellPermitUrl:
      "https://www.moew.government.bg/static/media/ups/tiny/filebase/Water/Zaiavlenia_obraztsi_vodi/obrazci%202020/15%20%D0%9E%D0%B1%D1%80%D0%B0%D0%B7%D0%B5%D1%86%20%D0%BA%D1%8A%D0%BC%20%D0%B7%D0%B0%D0%BF%D0%BE%D0%B2%D0%B5%D0%B4%20%D0%BE%D0%B1%D1%80%D0%B0%D0%B7%D1%86%D0%B8%20%D0%97%D0%92.docx",
    formAmendGroundwaterPermitUrl:
      "https://www.moew.government.bg/static/media/ups/tiny/filebase/Water/Zaiavlenia_obraztsi_vodi/obrazci%202020/32%20%D0%9E%D0%B1%D1%80%D0%B0%D0%B7%D0%B5%D1%86%20%D0%BA%D1%8A%D0%BC%20%D0%B7%D0%B0%D0%BF%D0%BE%D0%B2%D0%B5%D0%B4%20%D0%BE%D0%B1%D1%80%D0%B0%D0%B7%D1%86%D0%B8%20%D0%97%D0%92.docx",

    formOldOwnUseRg2Url:
      "https://www.bd-dunav.bg/uploads/content/files/Razreshitelen%20rejim/Uvedomlenie%20i%20zayavlenie%20za%20Kl%20sobstv%20potr/Registracia_Kladenci_fizicheski%20lica%202%20-%20fin.doc",

    formNormalOwnUseRg1Url:
      "https://earbd.bg/files/File/Razreshitelni/Obrazci%20Razreshitelni/novi-zapoved%20direktor/2021/Uvedomlenie_Registracia_Kladenci_fizicheski%20lica%20%D0%A0%D0%931-%20fin.doc",

    formOwnUseUg1Url:
      "https://bsbd.bg/ObrazciZayawleniq/Uvedomlenie_Kladenci_fizicheski%20lica.doc",

    formNewWellPermitUrl:
      "https://bsbd.bg/ObrazciZayawleniq/14%20%D0%9E%D0%B1%D1%80%D0%B0%D0%B7%D0%B5%D1%86%20%D0%BA%D1%8A%D0%BC%20%D0%B7%D0%B0%D0%BF%D0%BE%D0%B2%D0%B5%D0%B4%20%D0%BE%D0%B1%D1%80%D0%B0%D0%B7%D1%86%D0%B8%20%D0%97%D0%92%20%2840%29.docx",
},
  BG4: {
    directorate: "west-aegean",
    name: "\u0411\u0430\u0441\u0435\u0439\u043d\u043e\u0432\u0430 \u0434\u0438\u0440\u0435\u043a\u0446\u0438\u044f \u201e\u0417\u0430\u043f\u0430\u0434\u043d\u043e\u0431\u0435\u043b\u043e\u043c\u043e\u0440\u0441\u043a\u0438 \u0440\u0430\u0439\u043e\u043d\u201c",
    formsUrl:
      "https://wabd.bg/content/%D0%B7%D0%B0%D1%8F%D0%B2%D0%BB%D0%B5%D0%BD%D0%B8%D1%8F-%D0%B8-%D0%B4%D0%B5%D0%BA%D0%BB%D0%B0%D1%80%D0%B0%D1%86%D0%B8%D0%B8/%D0%BE%D0%B1%D1%80%D0%B0%D0%B7%D1%86%D0%B8-%D0%BD%D0%B0-%D0%B7%D0%B0%D1%8F%D0%B2%D0%BB%D0%B5%D0%BD%D0%B8%D1%8F/",
    existingRegisterUrl:
      "https://wabd.bg/content/%D1%80%D0%B5%D0%B3%D0%B8%D1%81%D1%82%D1%80%D0%B8-%D0%B8-%D0%BF%D1%80%D0%BE%D1%86%D0%B5%D0%B4%D1%83%D1%80%D0%B8/%D1%80%D0%B5%D0%B3%D0%B8%D1%81%D1%82%D1%80%D0%B8-%D0%BF%D0%BE-%D0%B7%D0%B0%D0%BA%D0%BE%D0%BD%D0%B0-%D0%B7%D0%B0-%D0%B2%D0%BE%D0%B4%D0%B8%D1%82%D0%B5/%D1%80%D0%B5%D0%B3%D0%B8%D1%81%D1%82%D1%8A%D1%80-%D0%BD%D0%B0-%D0%BA%D0%BB%D0%B0%D0%B4%D0%B5%D0%BD%D1%86%D0%B8%D1%82%D0%B5-%D0%B7%D0%B0-%D0%B7%D0%B0%D0%B4%D0%BE%D0%B2%D0%BE%D0%BB%D1%8F%D0%B2%D0%B0/",
    existingRegisterSearchable: true,
    existingRegisterLookupNote: null,

    formExistingWellPermitUrl:
      "https://wabd.bg/content/wp-content/uploads/2020/04/15-%D0%9E%D0%B1%D1%80%D0%B0%D0%B7%D0%B5%D1%86-%D0%BA%D1%8A%D0%BC-%D0%B7%D0%B0%D0%BF%D0%BE%D0%B2%D0%B5%D0%B4-%D0%BE%D0%B1%D1%80%D0%B0%D0%B7%D1%86%D0%B8-%D0%97%D0%92.docx",
    formAmendGroundwaterPermitUrl:
      "https://wabd.bg/content/wp-content/uploads/2020/04/32-%D0%9E%D0%B1%D1%80%D0%B0%D0%B7%D0%B5%D1%86-%D0%BA%D1%8A%D0%BC-%D0%B7%D0%B0%D0%BF%D0%BE%D0%B2%D0%B5%D0%B4-%D0%BE%D0%B1%D1%80%D0%B0%D0%B7%D1%86%D0%B8-%D0%97%D0%92.docx",

    formOldOwnUseRg2Url:
      "https://wabd.bg/content/wp-content/uploads/2020/05/Registracia_Kladenci_fizicheski-lica_%D0%A0%D0%932-fin.doc",

    formNormalOwnUseRg1Url:
      "https://wabd.bg/content/wp-content/uploads/2020/05/Registracia_Kladenci_fizicheski-lica_%D0%A0%D0%931.doc",

    formOwnUseUg1Url:
      "https://bsbd.bg/ObrazciZayawleniq/Uvedomlenie_Kladenci_fizicheski%20lica.doc",

    formNewWellPermitUrl:
      "https://bsbd.bg/ObrazciZayawleniq/14%20%D0%9E%D0%B1%D1%80%D0%B0%D0%B7%D0%B5%D1%86%20%D0%BA%D1%8A%D0%BC%20%D0%B7%D0%B0%D0%BF%D0%BE%D0%B2%D0%B5%D0%B4%20%D0%BE%D0%B1%D1%80%D0%B0%D0%B7%D1%86%D0%B8%20%D0%97%D0%92%20%2840%29.docx",
},
} as const;

async function resolvePoint(
  lat: number,
  lng: number
) {
  const groundwaterBodies =
    resolveGroundwaterBodiesAtPoint(lat, lng);

  const mineralArea =
    getMineralWaterAreaProfile(
      lat,
      lng
    );

  const mineralNearby =
    mineralArea.nearbyFacilities
      .filter(
        (facility) =>
          Number.isFinite(
            facility.distanceKm
          ) &&
          facility.distanceKm <= 25
      )
      .slice(0, 20)
      .map((facility) => {
        const legal =
          getMineralLegalSummaryByFacilityId(
            facility.mineralId
          );

        return {
          mineralId:
            facility.mineralId,

          name:
            facility.name,

          facilityType:
            facility.facilityType,

          settlement:
            facility.settlement,

          deposit:
            facility.deposit,

          latitude:
            facility.latitude,

          longitude:
            facility.longitude,

          distanceKm:
            facility.distanceKm,

          legal,

          newFacilityGuidance:
            legal
              ? getMineralNewFacilityGuidance(
                  legal
                )
              : null,
        };
      });

  const basinCode =
    groundwaterBodies[0]?.basin || null;

  const meta =
    basinCode &&
    basinCode in basinMeta
      ? basinMeta[
          basinCode as keyof typeof basinMeta
        ]
      : null;

  return {
    lat,
    lng,
    basinCode,
    basinDirectorate:
      meta?.directorate || null,
    basinName:
      meta?.name || null,
    formsUrl:
      meta?.formsUrl || null,
    existingRegisterUrl:
      meta?.existingRegisterUrl || null,
    existingRegisterSearchable:
      meta?.existingRegisterSearchable || false,
    existingRegisterLookupNote:
      meta?.existingRegisterLookupNote || null,
    formExistingWellPermitUrl:
      meta?.formExistingWellPermitUrl || null,
    formAmendGroundwaterPermitUrl:
      meta?.formAmendGroundwaterPermitUrl || null,
    formOldOwnUseRg2Url:
      meta?.formOldOwnUseRg2Url || null,
    formNormalOwnUseRg1Url:
      meta?.formNormalOwnUseRg1Url || null,
    formOwnUseUg1Url:
      meta?.formOwnUseUg1Url || null,
    formNewWellPermitUrl:
      meta?.formNewWellPermitUrl || null,

    groundwaterBodies,

    mineralContext: {
      nearbyFacilities:
        mineralNearby,

      nearestFacility:
        mineralNearby[0] || null,

      within1Km:
        mineralArea.within1Km,

      within5Km:
        mineralArea.within5Km,

      within10Km:
        mineralArea.within10Km,

      within25Km:
        mineralArea.within25Km,

      representedDeposits:
        mineralArea.representedDeposits,
    },
  };
}

export async function GET(request: NextRequest) {
  const requestUrl =
    new URL(request.url);

  const mineralFacilityId =
    String(
      requestUrl.searchParams.get(
        "mineral_facility_id"
      ) || ""
    ).trim();

  if (mineralFacilityId) {
    const context =
      resolveMineralFacilityLegalContext(
        mineralFacilityId
      );

    if (!context) {
      return NextResponse.json(
        {
          error:
            "Mineral facility not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      type:
        "mineral-facility-legal-context",

      facility:
        context,
    });
  }
  const url = new URL(request.url);

  const mineralPermitQuery =
    String(
      url.searchParams.get(
        "mineral_permit_query"
      ) || ""
    ).trim();

  if (mineralPermitQuery) {
    const matches =
      searchMineralLegalDeposits(
        mineralPermitQuery,
        20
      );

    const results =
      matches.map((match) => {
        const permitContext =
          getMineralPermitContext(
            match.depositId
          );

        const sectionByFacilityId =
          new Map<
            string,
            {
              sectionId: string | null;
              sectionName: string | null;
            }
          >();

        for (
          const section
          of permitContext?.sections || []
        ) {
          for (
            const facilityId
            of section.facilityIds
          ) {
            sectionByFacilityId.set(
              facilityId,
              {
                sectionId:
                  section.sectionId,

                sectionName:
                  section.name,
              }
            );
          }
        }

        const permitFacilities =
          (
            permitContext?.facilityIds ||
            []
          ).map((facilityId) => {
            const profile =
              getMineralWaterProfile(
                facilityId
              );

            const legalSection =
              sectionByFacilityId.get(
                facilityId
              );

            const verifiedMasterSection =
              !legalSection &&
              profile?.section &&
              profile.sectionVerified
                ? (
                    permitContext?.sections ||
                    []
                  ).find(
                    (section) =>
                      section.name
                        ?.trim()
                        .toLocaleLowerCase(
                          "bg"
                        ) ===
                      profile.section
                        ?.trim()
                        .toLocaleLowerCase(
                          "bg"
                        )
                  )
                : undefined;

            const effectiveSection =
              legalSection ||
              (
                verifiedMasterSection
                  ? {
                      sectionId:
                        verifiedMasterSection.sectionId,

                      sectionName:
                        verifiedMasterSection.name,
                    }
                  : undefined
              );

            return {
              mineralId:
                facilityId,

              name:
                profile?.name || null,

              facilityType:
                profile?.facilityType || null,

              settlement:
                profile?.settlement || null,

              deposit:
                profile?.deposit || null,

              sectionId:
                effectiveSection
                  ?.sectionId ||
                null,

              sectionName:
                effectiveSection
                  ?.sectionName ||
                null,

              sectionSource:
                legalSection
                  ? "LEGAL_SECTION"
                  : verifiedMasterSection
                    ? "MASTER_REGISTER_VERIFIED"
                    : null,

              registryNumber:
                profile?.registryNumber ||
                null,
            };
          });

        return {
          ...match,

          permitContext,

          permitFacilities,
        };
      });

    return NextResponse.json({
      type:
        "mineral-permit-search",

      query:
        mineralPermitQuery,

      results,
    });
  }

  const mineralDepositId =
    String(
      url.searchParams.get(
        "mineral_deposit_id"
      ) || ""
    ).trim();

  if (mineralDepositId) {
    const deposit =
      getMineralLegalDepositDetail(
        mineralDepositId
      );

    if (!deposit) {
      return NextResponse.json(
        {
          error:
            "Mineral deposit not found.",
        },
        {
          status: 404,
        }
      );
    }

    const depositFacilities =
      deposit.facilityIds.map(
        (facilityId) => {
          const profile =
            getMineralWaterProfile(
              facilityId
            );

          const section =
            deposit.sections.find(
              (item) =>
                item.facilityIds.includes(
                  facilityId
                )
            ) || null;

          const latitude =
            profile?.latitude ?? null;

          const longitude =
            profile?.longitude ?? null;

          const hasCoordinates =
            typeof latitude === "number" &&
            Number.isFinite(latitude) &&
            typeof longitude === "number" &&
            Number.isFinite(longitude);

          const mapParams =
            hasCoordinates
              ? new URLSearchParams({
                  lat:
                    latitude.toFixed(7),
                  lng:
                    longitude.toFixed(7),
                  label:
                    profile?.name ||
                    facilityId,
                  mineral_id:
                    facilityId,
                  mode:
                    "legal",
                  return:
                    "/legal",
                })
              : null;

          if (mapParams) {
            const legalMapValues = {
              legal_name:
                profile?.name || null,

              legal_type:
                profile?.facilityType || null,

              legal_deposit:
                profile?.deposit || null,

              legal_section:
                profile?.section ||
                section?.name ||
                null,

              legal_settlement:
                profile?.settlement || null,

              legal_registry:
                profile?.registryNumber || null,

              legal_coord_status:
                profile?.coordinateStatus || null,

              legal_source:
                profile?.sources?.[0] ||
                profile?.existingProperties?.source ||
                null,

              legal_source_date:
                profile?.existingProperties?.source_date ||
                profile?.researchEnrichment?.source_date ||
                null,
            };

            for (
              const [
                key,
                value
              ] of Object.entries(
                legalMapValues
              )
            ) {
              if (
                typeof value === "string" &&
                value.trim()
              ) {
                mapParams.set(
                  key,
                  value.trim()
                );
              }
            }
          }


          return {
            facilityId,

            mineralId:
              profile?.mineralId ||
              facilityId,

            name:
              profile?.name || null,

            facilityType:
              profile?.facilityType ||
              null,

            settlement:
              profile?.settlement ||
              null,

            deposit:
              profile?.deposit || null,

            latitude,

            longitude,

            hasCoordinates,

            coordinateStatus:
              profile?.coordinateStatus ||
              null,

            sectionName:
              section?.name || null,

            analysisAvailability:
              getMineralAnalysisAvailability(
                profile
              ),

            mapUrl:
              mapParams
                ? `/map?${mapParams.toString()}`
                : null,
          };
        }
      );

    return NextResponse.json({
      type:
        "mineral-deposit-detail",

      deposit: {
        ...deposit,
        facilities:
          depositFacilities,
      },
    });
  }

  const mineralQuery =
    String(
      url.searchParams.get(
        "mineral_query"
      ) || ""
    ).trim();

  if (mineralQuery) {
    const depositMatches =
      searchMineralLegalDeposits(
        mineralQuery,
        20
      );

    /*
     * MINERAL_QUERY_FACILITY_FALLBACK_V1
     *
     * The deposit search must remain usable even when one
     * record from the mineral facility master cannot be
     * normalized or profiled.
     *
     * Deposit matches come from the legal deposit registry
     * and are preserved independently.
     */
    let facilityMatches:
      LegalMineralFacilitySearchMatch[] = [];

    try {
      facilityMatches =
        searchMineralFacilitiesForLegal(
          mineralQuery,
          30
        );
    } catch (error) {
      console.error(
        "MINERAL_FACILITY_SEARCH_FAILED",
        {
          mineralQuery,
          error,
        }
      );

      facilityMatches = [];
    }

    const resultMap =
      new Map<
        string,
        Record<string, any>
      >();

    for (
      const match
      of depositMatches
    ) {
      resultMap.set(
        match.depositId,
        {
          ...match,
          matchedFacility: null,
          matchType: "deposit",
        }
      );
    }

    for (
      const facility
      of facilityMatches
    ) {
      /*
       * MINERAL_QUERY_PER_FACILITY_GUARD_V1
       *
       * One malformed/incomplete facility record must not
       * destroy the complete mineral deposit search.
       */
      try {
      const legal =
        getMineralLegalSummaryByFacilityId(
          facility.mineralId
        );

      if (!legal) {
        continue;
      }

      const detail =
        getMineralLegalDepositDetail(
          legal.depositId
        );

      if (!detail) {
        continue;
      }

      const effectiveManagementStatus =
        legal.section
          ?.managementStatus ||
        legal.managementStatus ||
        null;

      const effectiveDelegatedMunicipality =
        legal.section
          ?.delegatedMunicipality ||
        legal.delegatedMunicipality ||
        null;

      const facilityMatch = {
        mineralId:
          facility.mineralId,

        name:
          facility.name,

        registryNumber:
          facility.registryNumber,

        facilityType:
          facility.facilityType,

        settlement:
          facility.settlement,

        deposit:
          facility.deposit,

        section:
          facility.section,

        effectiveManagementStatus,

        effectiveDelegatedMunicipality,

        effectiveSource:
          legal.section
            ? "section"
            : "deposit",
      };

      /*
       * A facility search must preserve every matching facility,
       * even when several facilities belong to the same deposit.
       *
       * Remove the generic deposit-level card once at least one
       * concrete facility in that deposit matched.
       */
      resultMap.delete(
        detail.depositId
      );

      const facilityResultKey =
        `${detail.depositId}::${facility.mineralId}`;

      resultMap.set(
        facilityResultKey,
        {
          depositId:
            detail.depositId,

          canonicalName:
            detail.canonicalName,

          officialNumber:
            detail.officialNumber,

          aliases:
            detail.aliases,

          ownershipStatus:
            detail.ownershipStatus,

          managementStatus:
            detail.managementStatus,

          delegatedMunicipality:
            detail.delegatedMunicipality,

          currentEligibility:
            detail.currentEligibility,

          researchStatus:
            detail.researchStatus,

          facilityCount:
            detail.facilityIds.length,

          sectionCount:
            detail.sections.length,

          matchedFacility:
            facilityMatch,

          matchType:
            "facility",
        }
      );
      } catch (error) {
        console.error(
          "MINERAL_QUERY_FACILITY_ITEM_FAILED",
          {
            mineralQuery,
            mineralId:
              facility?.mineralId || null,
            error,
          }
        );

        continue;
      }
    }

    const results =
      Array.from(
        resultMap.values()
      ).slice(
        0,
        20
      );

    return NextResponse.json({
      type:
        "mineral-deposit-or-facility-search",

      query:
        mineralQuery,

      results,
    });
  }

  const query =
    String(
      url.searchParams.get("query") || ""
    ).trim();

  if (query) {
    const params =
      new URLSearchParams({
        format: "jsonv2",
        countrycodes: "bg",
        limit: "6",
        addressdetails: "1",
        namedetails: "1",
        dedupe: "1",
        q: query,
      });

    const response = await fetch(
      "https://nominatim.openstreetmap.org/search?" +
        params.toString(),
      {
        headers: {
          "Accept-Language": "bg",
          "User-Agent":
            "SONDI.BG legal settlement resolver",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            "Settlement search failed.",
        },
        { status: 502 }
      );
    }

    const raw = await response.json();

    const candidates =
      Array.isArray(raw)
        ? raw
            .map((item: any) => {
              const lat = Number(item.lat);
              const lng = Number(item.lon);

              if (
                !Number.isFinite(lat) ||
                !Number.isFinite(lng)
              ) {
                return null;
              }

              return {
                lat,
                lng,
                label:
                  String(
                    item.display_name || query
                  ),
                type:
                  String(
                    item.type || ""
                  ),
              };
            })
            .filter(Boolean)
        : [];

    /*
     * LEGAL_LOCATION_ENRICHMENT_FALLBACK_V2
     *
     * A valid settlement search result must survive even if
     * additional legal/spatial enrichment fails.
     *
     * One resolvePoint() failure must not turn the complete
     * settlement search into HTTP 500.
     */
    const enriched = await Promise.all(
      candidates.map(async (candidate: any) => {
        try {
          const pointData =
            await resolvePoint(
              candidate.lat,
              candidate.lng
            );

          return {
            ...candidate,
            ...pointData,
          };
        } catch (error) {
          console.error(
            "LEGAL_LOCATION_ENRICHMENT_FAILED",
            {
              query,
              lat: candidate.lat,
              lng: candidate.lng,
              error,
            }
          );

          return candidate;
        }
      })
    );

    return NextResponse.json({
      query,
      candidates: enriched,
    });
  }

  const lat =
    Number(
      url.searchParams.get("lat")
    );

  const lng =
    Number(
      url.searchParams.get("lng")
    );

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return NextResponse.json(
      { error: "Invalid coordinates." },
      { status: 400 }
    );
  }

  return NextResponse.json(
    await resolvePoint(lat, lng)
  );
}
