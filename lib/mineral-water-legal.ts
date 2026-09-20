import "server-only";

import fs from "node:fs";
import path from "node:path";

export type MineralLegalManagementStatus =
  | "DELEGATED_TO_MUNICIPALITY"
  | "STATE_BASIN_DIRECTORATE_MANAGED"
  | "MIXED_LEGAL_REGIME"
  | "SECTION_DEPENDENT"
  | "TO_RESEARCH"
  | string;

export type MineralLegalOwnershipStatus =
  | "EXCLUSIVE_STATE"
  | "PUBLIC_MUNICIPAL"
  | "TO_RESEARCH"
  | string;

export type MineralLegalTerm = {
  type?: string | null;
  years?: number | null;
  end_date?: string | null;
  active_on?: string | null;
  active_on_verified?: boolean | null;
};

export type MineralLegalEligibility = {
  status?: string | null;
  year?: number | null;
  official_list_date?: string | null;
  requires_municipal_application?: boolean | null;
  requires_ministerial_decision?: boolean | null;
  requires_new_ministerial_decision?: boolean | null;
  current_delegation_not_assumed?: boolean | null;
};

export type MineralLegalSection = {
  section_id?: string | null;
  name?: string | null;
  record_level?: string | null;
  official_number?: number | null;

  facility_ids?: string[];

  management_status?: MineralLegalManagementStatus | null;
  delegated_municipality?: string | null;
  management_term?: MineralLegalTerm | null;
  management_research_status?: string | null;
  management_current_caveat?: string | null;

  current_eligibility?: MineralLegalEligibility | null;

  historical_management?: Record<string, unknown> | null;

  official_handover_facilities?: string[];
  facility_mapping_note?: string | null;
  facility_assignment_basis?: string | null;
  management_review_note?: string | null;

  sources?: Array<Record<string, unknown>>;
};

export type MineralLegalConcession = {
  registerNumber: string | null;
  status: string | null;

  concessionaire: string | null;
  grantor: string | null;

  scope: string | null;

  waterSources: string[];

  startDate: string | null;
  endDate: string | null;

  sourceUrl: string | null;
  sourceAuthority: string | null;

  verifiedOn: string | null;

  [key: string]: unknown;
};

export type MineralLegalDeposit = {
  deposit_id: string;
  canonical_name: string;

  official_number?: number | null;
  aliases?: string[];

  facility_ids?: string[];

  ownership_status?: MineralLegalOwnershipStatus | null;

  management_status?: MineralLegalManagementStatus | null;
  managing_authority?: string | null;
  delegated_municipality?: string | null;

  management_term?: MineralLegalTerm | null;
  management_research_status?: string | null;
  management_current_caveat?: string | null;
  management_verified_on?: string | null;

  current_eligibility?: MineralLegalEligibility | null;

  sections?: MineralLegalSection[];

  art133_provision_history?: Array<Record<string, unknown>>;
  art133_non_listing_history?: Record<string, unknown> | null;

  concessions?: MineralLegalConcession[];
  historical_concessions?: MineralLegalConcession[];
  concession_projects?: MineralLegalConcession[];

  sources?: Array<Record<string, unknown>>;

  [key: string]: unknown;
};

type MineralLegalFile = {
  deposits: MineralLegalDeposit[];
};

export type MineralLegalFacilityMatch = {
  deposit: MineralLegalDeposit;
  section: MineralLegalSection | null;
};

export type MineralLegalDepositDetail = {
  depositId: string;
  canonicalName: string;
  officialNumber: number | null;
  aliases: string[];

  ownershipStatus: string | null;

  managementStatus: string | null;
  managingAuthority: string | null;
  delegatedMunicipality: string | null;

  managementTerm:
    MineralLegalTerm | null;

  currentEligibility:
    MineralLegalEligibility | null;

  researchStatus: string | null;
  managementCurrentCaveat: string | null;
  verifiedOn: string | null;

  facilityIds: string[];

  concessions: MineralLegalConcession[];
  historicalConcessions: MineralLegalConcession[];
  concessionProjects: MineralLegalConcession[];

  sections: Array<{
    sectionId: string | null;
    name: string | null;

    facilityIds: string[];

    managementStatus: string | null;
    delegatedMunicipality: string | null;

    managementTerm:
      MineralLegalTerm | null;

    currentEligibility:
      MineralLegalEligibility | null;

    researchStatus: string | null;
    managementCurrentCaveat: string | null;

    historicalManagement:
      Record<string, unknown> | null;
  }>;
};

export type MineralLegalDepositSearchResult = {
  depositId: string;
  canonicalName: string;
  officialNumber: number | null;
  aliases: string[];

  ownershipStatus: string | null;

  managementStatus: string | null;
  delegatedMunicipality: string | null;

  currentEligibility:
    MineralLegalEligibility | null;

  researchStatus: string | null;

  facilityCount: number;
  sectionCount: number;
};

export type MineralNewFacilityGuidanceCode =
  | "MUNICIPAL_DEPOSIT"
  | "STATE_DELEGATED"
  | "STATE_LISTED_FOR_PROVISION"
  | "STATE_STATUS_RESEARCH"
  | "SECTION_SPECIFIC"
  | "MUNICIPAL_STATUS_RESEARCH"
  | "UNRESOLVED";

export type MineralPermitContext = {
  depositId: string;
  canonicalName: string;
  officialNumber: number | null;

  ownershipStatus: string | null;
  managementStatus: string | null;
  managementCurrentCaveat: string | null;

  delegatedMunicipality: string | null;

  facilityIds: string[];

  requiresSectionIdentification: boolean;

  sections: Array<{
    sectionId: string | null;
    name: string | null;
    managementStatus: string | null;
    managementCurrentCaveat: string | null;
    delegatedMunicipality: string | null;
    facilityIds: string[];
  }>;
};

export type MineralNewFacilityGuidance = {
  code: MineralNewFacilityGuidanceCode;

  title: string;
  summary: string;
  nextStep: string;
  caution: string;

  authorityLabel: string | null;
  authorityName: string | null;

  currentStatusVerified: boolean;
  requiresSectionIdentification: boolean;
  requiresAdditionalOfficialCheck: boolean;
};

export type MineralLegalSummary = {
  depositId: string;
  canonicalName: string;
  officialNumber: number | null;

  ownershipStatus: string | null;

  managementStatus: string | null;
  delegatedMunicipality: string | null;

  managementTerm: MineralLegalTerm | null;

  currentEligibility: MineralLegalEligibility | null;

  researchStatus: string | null;

  section: {
    sectionId: string | null;
    name: string | null;
    managementStatus: string | null;
    delegatedMunicipality: string | null;
    managementTerm: MineralLegalTerm | null;
    currentEligibility: MineralLegalEligibility | null;
    researchStatus: string | null;
  } | null;
};

let cached:
  | {
      mtimeMs: number;
      data: MineralLegalFile;
    }
  | null = null;

function legalFilePath() {
  return path.join(
    process.cwd(),
    "data",
    "mineral-water",
    "legal",
    "mineral_deposits_legal.json"
  );
}

function loadMineralLegalFile(): MineralLegalFile {
  const file = legalFilePath();

  const stat = fs.statSync(file);

  if (
    cached &&
    cached.mtimeMs === stat.mtimeMs
  ) {
    return cached.data;
  }

  const raw = fs.readFileSync(
    file,
    "utf8"
  );

  const parsed =
    /* MINERAL_LEGAL_JSON_BOM_FIX_V1 */
JSON.parse(
  raw.replace(/^\uFEFF/, "")
) as MineralLegalFile;

  if (
    !parsed ||
    !Array.isArray(parsed.deposits)
  ) {
    throw new Error(
      "Invalid mineral legal data file."
    );
  }

  cached = {
    mtimeMs: stat.mtimeMs,
    data: parsed,
  };

  return parsed;
}

export function getMineralLegalDeposits() {
  return loadMineralLegalFile().deposits;
}

function normalizeMineralLegalSearch(
  value: unknown
) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("bg")
    .replace(/[„“"'`]/g, "")
    .replace(/\s+/g, " ");
}

/*
 * MINERAL_LEGAL_DEPOSIT_SEARCH_SAFE_V2
 *
 * Defensive search for existing mineral-water deposits.
 * One incomplete record must never crash the complete search.
 *
 * Source data remain unchanged.
 */
export function searchMineralLegalDeposits(
  query: string,
  limit = 20
) {
  const normalize = (
    value: unknown
  ): string =>
    String(value ?? "")
      .trim()
      .toLocaleLowerCase("bg-BG")
      .replace(/[–—−]/g, "-")
      .replace(/\s*-\s*/g, "-")
      .replace(/\s+/g, " ");

  const wanted =
    normalize(query);

  if (!wanted) {
    return [];
  }

  const results: Array<
    Record<string, any>
  > = [];

  for (
    const deposit
    of getMineralLegalDeposits()
  ) {
    try {
      const canonicalName =
        String(
          deposit?.canonical_name ?? ""
        ).trim();

      const aliases =
        Array.isArray(deposit?.aliases)
          ? deposit.aliases
              .map((value) =>
                String(value ?? "").trim()
              )
              .filter(Boolean)
          : [];

      const officialNumber =
        deposit?.official_number == null
          ? null
          : Number(
              deposit.official_number
            );

      const officialText =
        Number.isFinite(officialNumber)
          ? String(officialNumber)
          : "";

      const canonicalNormalized =
        normalize(canonicalName);

      const aliasNormalized =
        aliases.map(normalize);

      let locationText = "";

      try {
        locationText =
          normalize(
            JSON.stringify(
              deposit?.location_context ??
                {}
            )
          );
      } catch {
        locationText = "";
      }

      let score = 0;

      if (
        canonicalNormalized ===
        wanted
      ) {
        score = 1000;
      } else if (
        aliasNormalized.some(
          (value) =>
            value === wanted
        )
      ) {
        score = 950;
      } else if (
        officialText === wanted
      ) {
        score = 900;
      } else if (
        canonicalNormalized.startsWith(
          wanted
        )
      ) {
        score = 850;
      } else if (
        aliasNormalized.some(
          (value) =>
            value.startsWith(wanted)
        )
      ) {
        score = 800;
      } else if (
        canonicalNormalized.includes(
          wanted
        )
      ) {
        score = 700;
      } else if (
        aliasNormalized.some(
          (value) =>
            value.includes(wanted)
        )
      ) {
        score = 650;
      } else if (
        locationText.includes(
          wanted
        )
      ) {
        score = 400;
      }

      if (score <= 0) {
        continue;
      }

      results.push({
        depositId:
          String(
            deposit?.deposit_id ?? ""
          ),

        canonicalName,

        officialNumber:
          Number.isFinite(
            officialNumber
          )
            ? officialNumber
            : null,

        aliases,

        ownershipStatus:
          deposit?.ownership_status ??
          null,

        managementStatus:
          deposit?.management_status ??
          null,

        managingAuthority:
          deposit?.managing_authority ??
          null,

        delegatedMunicipality:
          deposit?.delegated_municipality ??
          null,

        currentEligibility:
          deposit?.current_eligibility ??
          null,

        researchStatus:
          deposit?.management_research_status ??
          deposit?.research_status ??
          null,

        facilityCount:
          Array.isArray(
            deposit?.facility_ids
          )
            ? deposit.facility_ids.length
            : 0,

        sectionCount:
          Array.isArray(
            deposit?.sections
          )
            ? deposit.sections.length
            : 0,

        score,
      });
    } catch (error) {
      console.error(
        "MINERAL_DEPOSIT_SEARCH_ITEM_FAILED",
        {
          depositId:
            deposit?.deposit_id ??
            null,
          error,
        }
      );
    }
  }

  results.sort(
    (a, b) => {
      const scoreDiff =
        Number(b.score || 0) -
        Number(a.score || 0);

      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      return String(
        a.canonicalName || ""
      ).localeCompare(
        String(
          b.canonicalName || ""
        ),
        "bg"
      );
    }
  );

  return results.slice(
    0,
    Math.max(
      1,
      Number(limit) || 20
    )
  );
}

export function getMineralLegalDepositById(
  depositId: string
): MineralLegalDeposit | null {
  const id = depositId.trim();

  if (!id) {
    return null;
  }

  return (
    getMineralLegalDeposits().find(
      (deposit) =>
        deposit.deposit_id === id
    ) || null
  );
}

export function getMineralLegalDepositDetail(
  depositId: string
): MineralLegalDepositDetail | null {
  const deposit =
    getMineralLegalDepositById(
      depositId
    );

  if (!deposit) {
    return null;
  }

  return {
    depositId:
      deposit.deposit_id,

    canonicalName:
      deposit.canonical_name,

    officialNumber:
      deposit.official_number ??
      null,

    aliases:
      deposit.aliases || [],

    ownershipStatus:
      deposit.ownership_status ??
      null,

    managementStatus:
      deposit.management_status ??
      null,

    managingAuthority:
      deposit.managing_authority ??
      null,

    delegatedMunicipality:
      deposit.delegated_municipality ??
      null,

    managementTerm:
      deposit.management_term ??
      null,

    currentEligibility:
      deposit.current_eligibility ??
      null,

    researchStatus:
      deposit.management_research_status ??
      null,

    managementCurrentCaveat:
      deposit.management_current_caveat ??
      null,

    verifiedOn:
      deposit.management_verified_on ??
      null,

    facilityIds:
      deposit.facility_ids || [],

    concessions:
      deposit.concessions || [],

    historicalConcessions:
      deposit.historical_concessions || [],

    concessionProjects:
      deposit.concession_projects || [],

    sections:
      (deposit.sections || [])
        .map((section) => ({
          sectionId:
            section.section_id ??
            null,

          name:
            section.name ??
            null,

          facilityIds:
            section.facility_ids ||
            [],

          managementStatus:
            section.management_status ??
            null,

          delegatedMunicipality:
            section.delegated_municipality ??
            null,

          managementTerm:
            section.management_term ??
            null,

          currentEligibility:
            section.current_eligibility ??
            null,

          researchStatus:
            section.management_research_status ??
            null,

          managementCurrentCaveat:
            section.management_current_caveat ??
            null,

          historicalManagement:
            section.historical_management ??
            null,
        })),
  };
}

export function getMineralLegalDepositByOfficialNumber(
  officialNumber: number
): MineralLegalDeposit | null {
  if (
    !Number.isFinite(officialNumber)
  ) {
    return null;
  }

  return (
    getMineralLegalDeposits().find(
      (deposit) =>
        deposit.official_number ===
        officialNumber
    ) || null
  );
}

export function getMineralLegalByFacilityId(
  facilityId: string
): MineralLegalFacilityMatch | null {
  const id = facilityId.trim();

  if (!id) {
    return null;
  }

  for (
    const deposit
    of getMineralLegalDeposits()
  ) {
    const parentFacilityIds =
      deposit.facility_ids || [];

    if (
      !parentFacilityIds.includes(id)
    ) {
      continue;
    }

    const sections =
      deposit.sections || [];

    const section =
      sections.find((item) =>
        (item.facility_ids || [])
          .includes(id)
      ) || null;

    return {
      deposit,
      section,
    };
  }

  return null;
}

export function summarizeMineralLegalMatch(
  match: MineralLegalFacilityMatch
): MineralLegalSummary {
  const {
    deposit,
    section,
  } = match;

  return {
    depositId:
      deposit.deposit_id,

    canonicalName:
      deposit.canonical_name,

    officialNumber:
      deposit.official_number ?? null,

    ownershipStatus:
      deposit.ownership_status ?? null,

    managementStatus:
      deposit.management_status ?? null,

    delegatedMunicipality:
      deposit.delegated_municipality ?? null,

    managementTerm:
      deposit.management_term ?? null,

    currentEligibility:
      deposit.current_eligibility ?? null,

    researchStatus:
      deposit.management_research_status ??
      null,

    section: section
      ? {
          sectionId:
            section.section_id ?? null,

          name:
            section.name ?? null,

          managementStatus:
            section.management_status ??
            null,

          delegatedMunicipality:
            section.delegated_municipality ??
            null,

          managementTerm:
            section.management_term ??
            null,

          currentEligibility:
            section.current_eligibility ??
            null,

          researchStatus:
            section.management_research_status ??
            null,
        }
      : null,
  };
}

export function getMineralPermitContext(
  depositId: string
): MineralPermitContext | null {
  const deposit =
    getMineralLegalDepositById(
      depositId
    );

  if (!deposit) {
    return null;
  }

  const sections =
    (deposit.sections || [])
      .map((section) => ({
        sectionId:
          section.section_id ?? null,

        name:
          section.name ?? null,

        managementStatus:
          section.management_status ?? null,

        managementCurrentCaveat:
          section.management_current_caveat ?? null,

        delegatedMunicipality:
          section.delegated_municipality ?? null,

        facilityIds:
          section.facility_ids || [],
      }));

  return {
    depositId:
      deposit.deposit_id,

    canonicalName:
      deposit.canonical_name,

    officialNumber:
      deposit.official_number ?? null,

    ownershipStatus:
      deposit.ownership_status ?? null,

    managementStatus:
      deposit.management_status ?? null,

    managementCurrentCaveat:
      deposit.management_current_caveat ?? null,

    delegatedMunicipality:
      deposit.delegated_municipality ?? null,

    facilityIds:
      deposit.facility_ids || [],

    requiresSectionIdentification:
      deposit.management_status ===
        "SECTION_DEPENDENT",

    sections,
  };
}

export function getMineralNewFacilityGuidance(
  legal: MineralLegalSummary
): MineralNewFacilityGuidance {
  const ownership =
    legal.ownershipStatus;

  const section =
    legal.section;

  const management =
    section?.managementStatus ||
    legal.managementStatus;

  const municipality =
    section?.delegatedMunicipality ||
    legal.delegatedMunicipality;

  const eligibility =
    section?.currentEligibility ||
    legal.currentEligibility;

  /*
   * IMPORTANT:
   * This function does not decide whether a coordinate
   * belongs to a mineral deposit.
   *
   * It interprets only an already matched legal record.
   * Geographic proximity must never be treated as proof
   * that the planned facility is inside that deposit.
   */

  if (
    ownership === "PUBLIC_MUNICIPAL" &&
    management === "MUNICIPAL"
  ) {
    return {
      code:
        "MUNICIPAL_DEPOSIT",

      title:
        "Общинско минерално находище",

      summary:
        "Правният слой определя находището като публична общинска собственост с общинско управление.",

      nextStep:
        "Преди планиране на ново съоръжение трябва да се установи дали точният имот и проектът попадат в това находище и каква процедура прилага съответната община.",

      caution:
        "Близостта до съоръжение или находище не доказва принадлежност на имота и не представлява разрешение за сондиране.",

      authorityLabel:
        "Компетентност",

      authorityName:
        "съответната община",

      currentStatusVerified:
        true,

      requiresSectionIdentification:
        false,

      requiresAdditionalOfficialCheck:
        true,
    };
  }

  if (
    ownership === "EXCLUSIVE_STATE" &&
    management ===
      "DELEGATED_TO_MUNICIPALITY"
  ) {
    return {
      code:
        "STATE_DELEGATED",

      title:
        "Държавно находище с установено предоставяне на община",

      summary:
        municipality
          ? `Правният слой съдържа акт за предоставяне на управлението на община ${municipality}.`
          : "Правният слой съдържа данни за предоставяне на управлението на община.",

      nextStep:
        municipality
          ? `Следва да се провери при община ${municipality} дали предоставянето се упражнява към момента и какъв режим е приложим за конкретния проект.`
          : "Следва да се установят общината и актуалното действие на предоставянето преди определяне на процедурата.",

      caution:
        "Наличен акт за предоставяне и посочен срок не означават автоматично потвърдено текущо упражняване и не дават право за нов сондаж.",

      authorityLabel:
        municipality
          ? "Предоставено на"
          : "Управление",

      authorityName:
        municipality,

      currentStatusVerified:
        false,

      requiresSectionIdentification:
        false,

      requiresAdditionalOfficialCheck:
        true,
    };
  }

  if (
    ownership === "EXCLUSIVE_STATE" &&
    management === "SECTION_DEPENDENT"
  ) {
    return {
      code:
        "SECTION_SPECIFIC",

      title:
        "Правният режим е различен по участъци",

      summary:
        "За това държавно находище управлението не може да се определи само от статуса на находището като цяло.",

      nextStep:
        "Преди определяне на процедурата трябва да се установи точният участък, в който попада проектът, и да се използва правният статус именно на този участък.",

      caution:
        "Не трябва да се пренася статусът на един участък върху останалите части на находището.",

      authorityLabel:
        null,

      authorityName:
        null,

      currentStatusVerified:
        false,

      requiresSectionIdentification:
        true,

      requiresAdditionalOfficialCheck:
        true,
    };
  }

  if (
    ownership === "EXCLUSIVE_STATE" &&
    management === "MIXED_LEGAL_REGIME"
  ) {
    return {
      code:
        "STATE_STATUS_RESEARCH",

      title:
        "Държавно находище със смесен правен режим",

      summary:
        "Правният слой потвърждава различни режими за отделни водоизточници или части от находището, например концесии и други държавни съоръжения.",

      nextStep:
        "Преди определяне на процедурата трябва да се установи към кой конкретен водоизточник или част от находището се отнася проектът и кой правен режим е приложим именно там.",

      caution:
        "Смесеният режим не позволява един общ управител или разрешителен орган да бъде приложен автоматично към цялото находище.",

      authorityLabel:
        null,

      authorityName:
        null,

      currentStatusVerified:
        true,

      requiresSectionIdentification:
        false,

      requiresAdditionalOfficialCheck:
        true,
    };
  }

  if (
    ownership === "EXCLUSIVE_STATE" &&
    management === "TO_RESEARCH" &&
    eligibility?.status ===
      "LISTED_FOR_PROVISION"
  ) {
    return {
      code:
        "STATE_LISTED_FOR_PROVISION",

      title:
        "Държавно находище, включено в списък по §133",

      summary:
        eligibility.year
          ? `Находището е включено в списък за предоставяне през ${eligibility.year} г., но това не доказва извършено предоставяне.`
          : "Находището е включено в списък за предоставяне по §133, но това не доказва извършено предоставяне.",

      nextStep:
        "Трябва да се провери дали след включването в списъка има последващо решение на министъра за предоставяне на конкретна община.",

      caution:
        "Самото присъствие в годишния списък не е решение за предоставяне и не определя автоматично компетентна община.",

      authorityLabel:
        null,

      authorityName:
        null,

      currentStatusVerified:
        false,

      requiresSectionIdentification:
        false,

      requiresAdditionalOfficialCheck:
        true,
    };
  }

  if (
    ownership === "EXCLUSIVE_STATE" &&
    management === "TO_RESEARCH"
  ) {
    return {
      code:
        "STATE_STATUS_RESEARCH",

      title:
        "Текущият управител не е потвърден",

      summary:
        "Собствеността е установена като изключителна държавна, но наличните официални данни не са достатъчни за категорично определяне на текущия управител.",

      nextStep:
        "Преди определяне на компетентния орган за конкретна процедура е необходима допълнителна официална проверка на актуалния управленски акт и конкретния водоизточник.",

      caution:
        "Находището е проучено в правния слой, но липсва достатъчно официално доказателство за категоричен текущ управител. Това не означава, че такъв акт или управление не съществува.",

      authorityLabel:
        null,

      authorityName:
        null,

      currentStatusVerified:
        false,

      requiresSectionIdentification:
        false,

      requiresAdditionalOfficialCheck:
        true,
    };
  }

  if (
    ownership === "PUBLIC_MUNICIPAL" &&
    management === "TO_RESEARCH"
  ) {
    return {
      code:
        "MUNICIPAL_STATUS_RESEARCH",

      title:
        "Текущият управленски режим не е потвърден",

      summary:
        "Собствеността е класифицирана като публична общинска, но конкретният управленски статус още не е потвърден.",

      nextStep:
        "Трябва да се установи конкретната община и актуалният режим за управление преди определяне на процедурата за ново съоръжение.",

      caution:
        "Статусът на собствеността сам по себе си не е достатъчен за извод кой може да разреши или възложи конкретна дейност.",

      authorityLabel:
        null,

      authorityName:
        null,

      currentStatusVerified:
        false,

      requiresSectionIdentification:
        false,

      requiresAdditionalOfficialCheck:
        true,
    };
  }

  return {
    code:
      "UNRESOLVED",

    title:
      "Необходима е допълнителна правна проверка",

    summary:
      "Наличните структурирани данни не позволяват еднозначно определяне на приложимия управленски режим.",

    nextStep:
      "Следва да се направи проверка по официалните актове за конкретното находище или участък.",

    caution:
      "До приключване на проверката не трябва да се прави извод за компетентен орган или право за изграждане на ново съоръжение.",

    authorityLabel:
      null,

    authorityName:
      null,

    currentStatusVerified:
      false,

    requiresSectionIdentification:
      Boolean(section),

    requiresAdditionalOfficialCheck:
      true,
  };
}

export function getMineralLegalSummaryByFacilityId(
  facilityId: string
): MineralLegalSummary | null {
  const match =
    getMineralLegalByFacilityId(
      facilityId
    );

  if (!match) {
    return null;
  }

  return summarizeMineralLegalMatch(
    match
  );
}
