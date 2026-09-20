"use client";

import { useEffect, useRef, useState } from "react";

function formatLegalOwnershipStatus(
  value: string | null | undefined
) {
  if (!value || value === "TO_RESEARCH") {
    return "Собствеността не е потвърдена";
  }

  if (value === "EXCLUSIVE_STATE") {
    return "Изключителна държавна собственост";
  }

  if (value === "PUBLIC_MUNICIPAL") {
    return "Публична общинска собственост";
  }

  return value;
}

function formatLegalManagementStatus(
  value: string | null | undefined
) {
  if (!value || value === "TO_RESEARCH") {
    return "Текущият управител не е потвърден";
  }

  if (value === "DELEGATED_TO_MUNICIPALITY") {
    return "Предоставено за управление на община";
  }

  if (value === "MIXED_LEGAL_REGIME") {
    return "Смесен правен режим";
  }

  if (value === "MUNICIPAL") {
    return "Управлява се от общината";
  }

  if (value === "SECTION_DEPENDENT") {
    return "Режимът зависи от конкретния участък";
  }

  if (value === "STATE_BASIN_DIRECTORATE_MANAGED") {
    return "Управлява се от басейнова дирекция";
  }

  return value;
}
type WaterBranch =
  | null
  | "ordinary"
  | "mineral";

type OrdinaryStage =
  | "start"
  | "new"
  | "existing";

type MineralStage =
  | "start"
  | "existing-deposit"
  | "new-facility"
  | "has-permit"
  | "unknown-status"
  | "investment-denied";

type MineralDepositSearchResult = {
  depositId: string;
  canonicalName: string;
  officialNumber: number | null;
  aliases: string[];

  ownershipStatus: string | null;
  managementStatus: string | null;
  delegatedMunicipality: string | null;

  currentEligibility: {
    status?: string | null;
    year?: number | null;
    official_list_date?: string | null;
    requires_municipal_application?: boolean | null;
    requires_ministerial_decision?: boolean | null;
    requires_new_ministerial_decision?: boolean | null;
    current_delegation_not_assumed?: boolean | null;
  } | null;

  researchStatus: string | null;

  facilityCount: number;
  sectionCount: number;
  matchedFacility?: {
    mineralId: string;
    name: string | null;
    registryNumber: string | null;
    facilityType: string | null;
    settlement: string | null;
    deposit: string | null;
    section: string | null;
    effectiveManagementStatus: string | null;
    effectiveDelegatedMunicipality: string | null;
    effectiveSource: "section" | "deposit";
  } | null;

  matchType?: "deposit" | "facility";
};

type MineralPermitContext = {
  depositId: string;
  canonicalName: string;
  officialNumber: number | null;

  ownershipStatus: string | null;
  managementStatus: string | null;
  managementCurrentCaveat: string | null;

  delegatedMunicipality: string | null;

  requiresSectionIdentification: boolean;

  sections: Array<{
    sectionId: string | null;
    name: string | null;
    managementStatus: string | null;
    managementCurrentCaveat: string | null;
    delegatedMunicipality: string | null;
  }>;
};

type MineralPermitSearchResult =
  MineralDepositSearchResult & {
    permitContext:
      MineralPermitContext | null;

    permitFacilities: Array<{
      mineralId: string;
      name: string | null;
      facilityType: string | null;
      settlement: string | null;
      deposit: string | null;
      sectionId: string | null;
      sectionName: string | null;
    }>;
  };

type MineralDepositDetail = {
  depositId: string;
  canonicalName: string;
  officialNumber: number | null;
  aliases: string[];

  ownershipStatus: string | null;

  managementStatus: string | null;
  managingAuthority: string | null;
  delegatedMunicipality: string | null;

  managementTerm: {
    type?: string | null;
    years?: number | null;
    end_date?: string | null;
    active_on?: string | null;
    active_on_verified?: boolean | null;
  } | null;

  currentEligibility: {
    status?: string | null;
    year?: number | null;
    official_list_date?: string | null;
    requires_municipal_application?: boolean | null;
    requires_ministerial_decision?: boolean | null;
    requires_new_ministerial_decision?: boolean | null;
    current_delegation_not_assumed?: boolean | null;
  } | null;

  researchStatus: string | null;
  managementCurrentCaveat: string | null;
  verifiedOn: string | null;

  facilityIds: string[];
  facilities?: Array<{
    facilityId: string;
    mineralId: string;
    name: string | null;
    facilityType: string | null;
    settlement: string | null;
    deposit: string | null;
    latitude: number | null;
    longitude: number | null;
    hasCoordinates: boolean;
    coordinateStatus: string | null;
    sectionName: string | null;
    mapUrl: string | null;

    analysisAvailability?: {
      hasPermitData: boolean;
      permitNumber: string | null;

      hasHolderData: boolean;
      holder: string | null;

      hasPurposeData: boolean;
      purpose: string | null;

      hasVolumeData: boolean;
      volume: string | null;

      hasPermitTermData: boolean;
      permitTerm: string | null;

      hasRegistryData: boolean;
      registryNumber: string | null;

      hasDepthData: boolean;
      depthM: number | null;

      hasTemperatureData: boolean;
      temperatureC: number | null;

      hasSectionData: boolean;
      section: string | null;

      hasOfficialSources: boolean;
      sourceCount: number;
    };
  }>;

  sections: Array<{
    sectionId: string | null;
    name: string | null;

    facilityIds: string[];

    managementStatus: string | null;
    delegatedMunicipality: string | null;

    managementTerm: {
      type?: string | null;
      years?: number | null;
      end_date?: string | null;
      active_on?: string | null;
      active_on_verified?: boolean | null;
    } | null;

    currentEligibility: {
      status?: string | null;
      year?: number | null;
      official_list_date?: string | null;
      requires_municipal_application?: boolean | null;
      requires_ministerial_decision?: boolean | null;
      requires_new_ministerial_decision?: boolean | null;
      current_delegation_not_assumed?: boolean | null;
    } | null;

    researchStatus: string | null;

    historicalManagement:
      Record<string, unknown> | null;
  }>;
};

type MineralOfficialLink = {
  label: string;
  url: string;
  kind:
    | "register"
    | "procedure"
    | "official-act";
};

type MineralFacilityProcedureModel = {
  authorityName: string;
  serviceTitle: string;
  requiredDocuments: string[];
  procedureSteps: string[];
  officialLinks: MineralOfficialLink[];
  note: string | null;
};

function getMineralFacilityProcedureModel(args: {
  managementStatus: string | null;
  municipality: string | null;
  delegatedMunicipality: string | null;
  managingAuthority: string | null;
  ownershipStatus: string | null;
}): MineralFacilityProcedureModel {
  const {
    managementStatus,
    municipality,
    delegatedMunicipality,
    managingAuthority,
    ownershipStatus,
  } = args;

  const service2004Url =
    "https://iisda.government.bg/adm_services/services/service/2004";

  const egov2004Url =
    "https://www.identity.egov.bg/wps/portal/egov/dostavchitsi%20na%20uslugi/obshtinski%20administratsii/unificirani%20uslugi/2004?cP=1&q=2004";

  const moewFormsUrl =
    "https://www.moew.government.bg/bg/vodi/administrativni-uslugi/obrazci-na-zayavleniya-za-izdavane-na-razreshitelni/";

  const mineralRegistersUrl =
    "https://www.moew.government.bg/bg/vodi-mineralni-vodi-registri-mineralni-vodi/";

  const unresolved: MineralFacilityProcedureModel = {
    authorityName:
      "Компетентният орган още не е установен с достатъчна конкретност",

    serviceTitle:
      "Първо трябва да се установи точният режим",

    requiredDocuments: [],

    procedureSteps: [
      "Потвърдете правния режим на конкретното съоръжение.",
      "Установете компетентния орган.",
      "След това използвайте официалната процедура и образец за този режим.",
    ],

    officialLinks: [
      {
        label:
          "МОСВ — официални образци на заявления по Закона за водите",
        url: moewFormsUrl,
        kind: "procedure",
      },
      {
        label:
          "МОСВ — регистри за минерални води",
        url: mineralRegistersUrl,
        kind: "register",
      },
    ],

    note:
      "Не трябва да се избира заявление, преди да е потвърден режимът на конкретното съоръжение.",
  };

  if (
    !managementStatus ||
    managementStatus === "TO_RESEARCH" ||
    managementStatus === "MIXED_LEGAL_REGIME" ||
    managementStatus === "SECTION_DEPENDENT"
  ) {
    return unresolved;
  }

  if (managementStatus === "MUNICIPAL") {
    if (!municipality) {
      return {
        ...unresolved,

        serviceTitle:
          "Общинският режим е установен, но компетентната община не е потвърдена",

        procedureSteps: [
          "Установете коя точно община е компетентна за конкретното съоръжение.",
          "Потвърдете връзката между съоръжението и общината от официален източник.",
          "След потвърждаване на органа може да бъде определена точната процедура, заявление и комплект документи.",
        ],

        officialLinks: [
          {
            label:
              "МОСВ — регистри за минерални води",
            url: mineralRegistersUrl,
            kind: "register",
          },
        ],

        note:
          "Не се показват Услуга 2004, общинско заявление или Приложение № 29, докато конкретната компетентна община не бъде потвърдена.",
      };
    }

    const authority =
      municipality
        ? `Община ${municipality}`
        : "Компетентната община";

    return {
      authorityName: authority,

      serviceTitle:
        "Услуга 2004 — разрешително за водовземане от минерални води",

      requiredDocuments: [
        "Заявление за издаване на разрешително за водовземане.",
        ownershipStatus === "PUBLIC_MUNICIPAL"
          ? "За минерална вода — публична общинска собственост: използва се приложимият общински образец по Закона за водите, включително Приложение № 29, когато е приложимо."
          : "Използва се образецът, приложим към установения вид собственост и конкретното съоръжение.",
        "Приложенията, изискани в официалния образец според целта и заявеното количество.",
        "Документ за представителна власт, когато заявлението се подава чрез представител.",
      ],

      procedureSteps: [
        "Определете целта, за която ще ползвате минералната вода.",
        "Определете необходимото количество или дебит.",
        "Проверете има ли действащо право върху конкретното съоръжение и кой е титулярът.",
        "Проверете има ли свободен експлоатационен ресурс за исканото количество.",
        "Попълнете официалния образец.",
        `Подайте документите пред ${authority}.`,
        "Започнете ползването само след възникване на валидно правно основание.",
      ],

      officialLinks: [
        {
          label:
            "Услуга 2004 — административен регистър",
          url: service2004Url,
          kind: "procedure",
        },
        {
          label:
            "Електронна услуга 2004 — eGov",
          url: egov2004Url,
          kind: "procedure",
        },
        {
          label:
            "МОСВ — образци на заявления за минерални води",
          url: moewFormsUrl,
          kind: "official-act",
        },
        {
          label:
            "МОСВ — регистри за минерални води и разрешителни",
          url: mineralRegistersUrl,
          kind: "register",
        },
      ],

      note:
        "Точният комплект приложения зависи от целта, количеството, вида на съоръжението и официалния образец.",
    };
  }

  if (
    managementStatus ===
    "DELEGATED_TO_MUNICIPALITY"
  ) {
    if (!delegatedMunicipality) {
      return {
        ...unresolved,

        serviceTitle:
          "Режимът е предоставен на община, но конкретната община не е потвърдена",

        procedureSteps: [
          "Установете на коя точно община е предоставено управлението.",
          "Потвърдете, че конкретното съоръжение попада в обхвата на предоставянето.",
          "След това използвайте процедурата и образеца за потвърдената община.",
        ],

        officialLinks: [
          {
            label:
              "МОСВ — регистри за минерални води",
            url: mineralRegistersUrl,
            kind: "register",
          },
        ],

        note:
          "Не се показват Услуга 2004 или Приложение № 28, докато конкретната община не бъде потвърдена.",
      };
    }

    const authority =
      delegatedMunicipality
        ? `Община ${delegatedMunicipality}`
        : "Общината, на която е предоставено управлението";

    return {
      authorityName: authority,

      serviceTitle:
        "Услуга 2004 — разрешително за водовземане от предоставено на община находище",

      requiredDocuments: [
        "Заявление за издаване на разрешително за водовземане.",
        "За предоставена на община минерална вода — изключителна държавна собственост, чрез съществуващо съоръжение: Приложение № 28, когато е приложимо.",
        "Приложенията, изискани в официалния образец според целта и количеството.",
        "Документ за представителна власт, когато е приложимо.",
      ],

      procedureSteps: [
        "Потвърдете, че конкретното съоръжение е включено в предоставеното на общината управление.",
        "Определете целта и необходимото количество.",
        "Попълнете приложимия официален образец.",
        `Подайте документите пред ${authority}.`,
        "Компетентният орган проверява ресурса, съществуващите права и допустимостта.",
        "Започнете ползването само след издаване на необходимото разрешително или друго валидно правно основание.",
      ],

      officialLinks: [
        {
          label:
            "Услуга 2004 — административен регистър",
          url: service2004Url,
          kind: "procedure",
        },
        {
          label:
            "Електронна услуга 2004 — eGov",
          url: egov2004Url,
          kind: "procedure",
        },
        {
          label:
            "МОСВ — образци за минерални води, включително Приложение № 28",
          url: moewFormsUrl,
          kind: "official-act",
        },
        {
          label:
            "МОСВ — регистри за минерални води и разрешителни",
          url: mineralRegistersUrl,
          kind: "register",
        },
      ],

      note:
        "Конкретният акт за предоставяне на находището или участъка трябва да бъде съобразен при процедурата.",
    };
  }

  if (
    managementStatus ===
    "STATE_BASIN_DIRECTORATE_MANAGED"
  ) {
    if (!managingAuthority) {
      return {
        ...unresolved,

        serviceTitle:
          "Държавният режим е установен, но компетентната басейнова дирекция не е потвърдена",

        procedureSteps: [
          "Установете коя басейнова дирекция е компетентна за конкретното съоръжение.",
          "Потвърдете компетентността от официалните данни за находището и съоръжението.",
          "След това използвайте приложимия образец и процедура.",
        ],

        officialLinks: [
          {
            label:
              "МОСВ — регистри за минерални води",
            url: mineralRegistersUrl,
            kind: "register",
          },
        ],

        note:
          "Не се показва конкретно заявление пред басейнова дирекция, докато компетентният орган не бъде потвърден.",
      };
    }

    const authority =
      managingAuthority ||
      "Компетентната басейнова дирекция";

    return {
      authorityName: authority,

      serviceTitle:
        "Разрешително за водовземане от минерална вода — държавно управление",

      requiredDocuments: [
        "Заявление за издаване на разрешително за водовземане.",
        "За минерална вода — изключителна държавна собственост: Приложение № 16, когато е приложимо.",
        "Приложенията, посочени в официалния образец според целта, количеството и съоръжението.",
        "Документ за представителна власт, когато е приложимо.",
      ],

      procedureSteps: [
        "Определете целта и необходимото количество.",
        "Попълнете приложимия официален образец.",
        "Приложете изисканите документи.",
        `Подайте заявлението пред ${authority}.`,
        "Басейновата дирекция проверява ресурса, съществуващите права и допустимостта.",
        "Започнете ползването само след издаване на приложимото разрешително.",
      ],

      officialLinks: [
        {
          label:
            "МОСВ — образци на заявления за минерални води, включително Приложение № 16",
          url: moewFormsUrl,
          kind: "official-act",
        },
        {
          label:
            "МОСВ — регистри на разрешителните и минералните води",
          url: mineralRegistersUrl,
          kind: "register",
        },
      ],

      note: null,
    };
  }

  return unresolved;
}


/* NEW_MINERAL_FACILITY_PROCEDURE_V2 */
type NewMineralFacilityProcedureModel = {
  resolved: boolean;
  authorityName: string;
  applicantText: string;
  procedureSteps: string[];
  preparationItems: string[];
  officialLinks: MineralOfficialLink[];
  note: string | null;
};

function getNewMineralFacilityProcedureModel(args: {
  managementStatus: string | null;
  municipality: string | null;
  delegatedMunicipality: string | null;
  managingAuthority: string | null;
}): NewMineralFacilityProcedureModel {
  const {
    managementStatus,
    municipality,
    delegatedMunicipality,
    managingAuthority,
  } = args;

  const moewFormsUrl =
    "https://www.moew.government.bg/bg/vodi/administrativni-uslugi/obrazci-na-zayavleniya-za-izdavane-na-razreshitelni/";

  const mineralRegistersUrl =
    "https://www.moew.government.bg/bg/vodi-mineralni-vodi-registri-mineralni-vodi/";

  const unresolved = (
    note: string
  ): NewMineralFacilityProcedureModel => ({
    resolved: false,

    authorityName:
      "Компетентният орган още не е установен с достатъчна конкретност",

    applicantText:
      "Допустимият заявител не се определя, докато приложимият режим и компетентният орган не бъдат установени.",

    procedureSteps: [],

    preparationItems: [],

    officialLinks: [
      {
        label:
          "МОСВ — официални образци на заявления по Закона за водите",
        url: moewFormsUrl,
        kind: "procedure",
      },
      {
        label:
          "МОСВ — регистри за минерални води",
        url: mineralRegistersUrl,
        kind: "register",
      },
    ],

    note,
  });

  if (
    !managementStatus ||
    managementStatus === "TO_RESEARCH" ||
    managementStatus === "MIXED_LEGAL_REGIME" ||
    managementStatus === "SECTION_DEPENDENT"
  ) {
    return unresolved(
      "Преди да бъде показана процедура за нов сондаж, трябва да бъде установен точният приложим правен режим."
    );
  }

  if (
    managementStatus ===
    "STATE_BASIN_DIRECTORATE_MANAGED"
  ) {
    if (!managingAuthority) {
      return unresolved(
        "Държавният режим е установен, но конкретната компетентна басейнова дирекция не е потвърдена."
      );
    }

    return {
      resolved: true,

      authorityName:
        managingAuthority,

      applicantText:
        "По общия разрешителен ред при държавно управление заявители могат да бъдат юридически лица и еднолични търговци. Специалната възможност физическо лице да бъде заявител при определени минерални води, предоставени на община, не следва автоматично да се прилага към този режим.",

      procedureSteps: [
        "Представете точната координата и намерението за изграждане на ново минерално водовземно съоръжение пред компетентния орган.",
        "Проверете дали на избраната точка и в рамките на конкретното находище може да бъде започната процедура за ново съоръжение.",
        "Определете целта на бъдещото водовземане и необходимото количество или дебит.",
        "Проверете утвърдения и свободния експлоатационен ресурс на находището.",
        "Установете кой точно разрешителен ред и кой официален образец са приложими за новото съоръжение.",
        "Подгответе и подайте изисканите документи пред компетентния орган.",
        "Не започвайте изграждане или водовземане само въз основа на тази автоматична проверка — необходимо е приложимото административно основание.",
      ],

      preparationItems: [
        "Координати на планираното съоръжение.",
        "Данни за имота.",
        "Цел на бъдещото използване на минералната вода.",
        "Необходимо количество или дебит.",
        "Налични хидрогеоложки и проектни данни.",
        "Допълнителните документи, които компетентният орган изиска за конкретната процедура.",
      ],

      officialLinks: [
        {
          label:
            "МОСВ — официални образци на заявления по Закона за водите",
          url: moewFormsUrl,
          kind: "procedure",
        },
        {
          label:
            "МОСВ — регистри за минерални води и разрешителни",
          url: mineralRegistersUrl,
          kind: "register",
        },
      ],

      note:
        "Не се приема автоматично, че образецът за водовземане чрез съществуващо съоръжение е приложим и за изграждане на нов сондаж.",
    };
  }

  if (
    managementStatus ===
    "DELEGATED_TO_MUNICIPALITY"
  ) {
    if (!delegatedMunicipality) {
      return unresolved(
        "Установено е предоставяне на община, но конкретната община не е потвърдена."
      );
    }

    const authority =
      `Община ${delegatedMunicipality}`;

    return {
      resolved: true,

      authorityName:
        authority,

      applicantText:
        "При минерална вода — изключителна държавна собственост, предоставена за управление и ползване на община, заявители могат да бъдат юридически лица и еднолични търговци, а специалният режим допуска и физически лица. Това не дава автоматично право за изграждане на нов сондаж или за водовземане.",

      procedureSteps: [
        `Представете точната координата и намерението за ново съоръжение пред ${authority}.`,
        "Проверете дали действащият акт за предоставяне на находището обхваща компетентността на общината за планираното ново съоръжение.",
        "Потвърдете дали избраната точка може да бъде включена в приложимия режим на находището.",
        "Определете целта на бъдещото водовземане и необходимото количество.",
        "Проверете свободния експлоатационен ресурс и съществуващите права.",
        "Получете потвърждение кой точен административен ред и официален образец се прилагат за новото съоръжение.",
        "Подайте изисканите документи и не започвайте изграждане или водовземане преди необходимото административно основание.",
      ],

      preparationItems: [
        "Координати на планирания сондаж.",
        "Данни за имота.",
        "Предназначение на минералната вода.",
        "Необходимо количество или дебит.",
        "Налични хидрогеоложки и проектни данни.",
        "Документите, изискани от компетентната община и останалите компетентни органи.",
      ],

      officialLinks: [
        {
          label:
            "МОСВ — официални образци на заявления по Закона за водите",
          url: moewFormsUrl,
          kind: "procedure",
        },
        {
          label:
            "МОСВ — регистри за минерални води",
          url: mineralRegistersUrl,
          kind: "register",
        },
      ],

      note:
        "Не се показва автоматично Приложение № 28 като заявление за новия сондаж, защото наличният модел за него е свързан с водовземане чрез съществуващо съоръжение.",
    };
  }

  if (
    managementStatus === "MUNICIPAL"
  ) {
    if (!municipality) {
      return unresolved(
        "Общинският режим е установен, но конкретната компетентна община не може да бъде потвърдена от наличните данни."
      );
    }

    const authority =
      `Община ${municipality}`;

    return {
      resolved: true,

      authorityName:
        authority,

      applicantText:
        "При общински режим не трябва автоматично да се приема, че физическо лице е допустим заявител само защото находището е под общинско управление. Допустимостта се проверява по конкретния приложим режим.",

      procedureSteps: [
        `Представете точната координата и намерението за ново съоръжение пред ${authority}.`,
        "Проверете местния правен режим на находището и приложимите общински решения или наредби.",
        "Потвърдете дали е допустимо изграждане на ново водовземно съоръжение на избраната точка.",
        "Определете целта и необходимото количество минерална вода.",
        "Проверете наличния експлоатационен ресурс и съществуващите права.",
        "Установете точния административен ред и официалния образец.",
        "Подайте изисканите документи и не започвайте изграждане или водовземане преди възникване на необходимото правно основание.",
      ],

      preparationItems: [
        "Координати на планираното съоръжение.",
        "Данни за имота.",
        "Цел на бъдещото използване.",
        "Необходимо количество или дебит.",
        "Налични хидрогеоложки и проектни данни.",
        "Документите, които компетентните органи изискат.",
      ],

      officialLinks: [
        {
          label:
            "МОСВ — официални образци на заявления по Закона за водите",
          url: moewFormsUrl,
          kind: "procedure",
        },
        {
          label:
            "МОСВ — регистри за минерални води",
          url: mineralRegistersUrl,
          kind: "register",
        },
      ],

      note:
        "Не се показват автоматично Услуга 2004 или Приложение № 29 като окончателна процедура за изграждане на нов сондаж.",
    };
  }

  return unresolved(
    "Текущият правен запис не е достатъчен за определяне на процедура за ново минерално съоръжение."
  );
}
/* /NEW_MINERAL_FACILITY_PROCEDURE_V2 */

/* FACILITY_REGIME_EXPLANATION_V1 */
function getMineralFacilityRegimeExplanation(
  managementStatus: string | null
): {
  title: string;
  text: string;
} {
  if (
    managementStatus ===
    "STATE_BASIN_DIRECTORATE_MANAGED"
  ) {
    return {
      title:
        "Държавно управление",
      text:
        "Това съоръжение е под държавно управление. По общия разрешителен ред заявители могат да бъдат юридически лица и еднолични търговци. Специалната възможност физическо лице да бъде заявител за минерална вода се отнася до минерални води – изключителна държавна собственост, които са предоставени за управление и ползване на община, и не следва автоматично да се прилага за това съоръжение. Самото наличие или местоположение на съоръжението не създава право на водовземане.",
    };
  }

  if (
    managementStatus ===
    "DELEGATED_TO_MUNICIPALITY"
  ) {
    return {
      title:
        "Държавна минерална вода, предоставена на община",
      text:
        "Това съоръжение попада в режим на минерална вода – изключителна държавна собственост, предоставена за управление и ползване на община. Заявители могат да бъдат юридически лица и еднолични търговци, а законът допуска и физически лица именно при тази хипотеза. Това не дава автоматично право на водовземане – необходимо е разрешително и трябва да бъдат изпълнени условията за конкретното съоръжение, целта и заявеното количество.",
    };
  }

  if (
    managementStatus ===
    "MUNICIPAL"
  ) {
    return {
      title:
        "Общинско управление",
      text:
        "Това съоръжение е под общинско управление. По общия разрешителен ред заявители могат да бъдат юридически лица и еднолични търговци. Специалното правило, което допуска физически лица при минерални води, е формулирано за минерални води – изключителна държавна собственост, предоставени за управление и ползване на община, затова не трябва автоматично да се приема, че физическо лице е допустим заявител само защото съоръжението е под общинско управление. Самото наличие на съоръжението не създава право на водовземане.",
    };
  }

  if (
    managementStatus ===
    "MIXED_LEGAL_REGIME"
  ) {
    return {
      title:
        "Смесен правен режим",
      text:
        "За това съоръжение още не е установено кой от различните правни режими е приложим. Поради това не може надеждно да се определи кои категории лица могат да бъдат заявители, кой е компетентният орган и коя разрешителна процедура се прилага. Първо трябва да бъде установен точният режим на самото съоръжение.",
    };
  }

  if (
    managementStatus ===
    "SECTION_DEPENDENT"
  ) {
    return {
      title:
        "Режимът зависи от конкретния участък",
      text:
        "Правният режим на това съоръжение зависи от участъка, към който принадлежи. Докато участъкът и неговият режим не бъдат потвърдени, не може надеждно да се определи кой може да бъде заявител, кой е компетентният орган и коя разрешителна процедура е приложима.",
    };
  }

  return {
    title:
      "Правният режим не е установен",
    text:
      "За това конкретно съоръжение няма достатъчно потвърдени данни за приложимия правен режим. Поради това не може да се определи кой може да бъде заявител, към кой орган се подава заявление или коя процедура се прилага. Не трябва да се приема наличие на право за водовземане, докато режимът не бъде потвърден.",
  };
}
/* /FACILITY_REGIME_EXPLANATION_V1 */


type MineralDepositActionPlan = {
  authorityTitle: string;
  authorityName: string;
  whereToCheck: string[];
  checkItems: string[];
  nextSteps: string[];
  officialLinks: MineralOfficialLink[];
  note: string | null;
};

function getMineralDepositActionPlan(
  deposit: MineralDepositDetail
): MineralDepositActionPlan {
  const management = deposit.managementStatus;

  const normalizedName =
    deposit.canonicalName.toLocaleLowerCase(
      "bg-BG"
    );

  const authorityText = [
    deposit.managingAuthority,
    deposit.researchStatus,
    deposit.managementCurrentCaveat,
    deposit.canonicalName
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("bg-BG");

  const municipality =
    deposit.delegatedMunicipality?.trim() ||
    null;

  const links: MineralOfficialLink[] = [];

  // SOFIA_MINERAL_OFFICIAL_DOCUMENTS_START
  const municipalityKey =
    municipality
      ?.trim()
      .toLocaleLowerCase("bg-BG") || "";

  const isSofiaMunicipality =
    municipalityKey === "столична община" ||
    municipalityKey === "софия" ||
    municipalityKey === "община софия";

  if (
    management === "DELEGATED_TO_MUNICIPALITY" &&
    isSofiaMunicipality
  ) {
    links.push(
      {
        label: "📄 Свали заявление – PDF",
        url: "https://www.identity.egov.bg/wps/wcm/connect/dcb6b6ab-f37f-4f85-b88d-64b394f6a662/200401ZVLNv01.pdf?CVID=nDS2EG0&MOD=AJPERES",
        kind: "procedure"
      },
      {
        label: "🖥 Услуга 2004 – информация и подаване",
        url: "https://iisda.government.bg/adm_services/services/service_provision/29695",
        kind: "procedure"
      }
    );
  }
  // SOFIA_MINERAL_OFFICIAL_DOCUMENTS_END


  let basinName: string | null = null;

  // ----------------------------------------------------------
  // BASIN-SPECIFIC MINERAL WATER REGISTERS
  // Only mineral-water-specific official destinations.
  // ----------------------------------------------------------

  if (
    authorityText.includes(
      "източнобеломор"
    ) ||
    authorityText.includes("бдибр") ||
    authorityText.includes("bdibr") ||
    authorityText.includes("earbd")
  ) {
    basinName =
      'Басейнова дирекция „Източнобеломорски район“';

    links.push({
      label:
        "БДИБР · Регистър на разрешителните за минерални води",
      url:
        "https://earbd.bg/Mineralni_vodi-p2451",
      kind: "register"
    });
  }

  if (
    authorityText.includes(
      "западнобеломор"
    ) ||
    authorityText.includes("бдзбр") ||
    authorityText.includes("wabd")
  ) {
    basinName =
      'Басейнова дирекция „Западнобеломорски район“';

    links.push({
      label:
        "БДЗБР · Регистри по Закона за водите",
      url:
        "https://wabd.bg/content/%D1%80%D0%B5%D0%B3%D0%B8%D1%81%D1%82%D1%80%D0%B8-%D0%B8-%D0%BF%D1%80%D0%BE%D1%86%D0%B5%D0%B4%D1%83%D1%80%D0%B8/%D1%80%D0%B5%D0%B3%D0%B8%D1%81%D1%82%D1%80%D0%B8-%D0%BF%D0%BE-%D0%B7%D0%B0%D0%BA%D0%BE%D0%BD%D0%B0-%D0%B7%D0%B0-%D0%B2%D0%BE%D0%B4%D0%B8%D1%82%D0%B5/",
      kind: "register"
    });
  }

  if (
    authorityText.includes("черномор") ||
    authorityText.includes("бдчр") ||
    authorityText.includes("bsbd")
  ) {
    basinName =
      'Басейнова дирекция „Черноморски район“';

    links.push({
      label:
        "БДЧР · Регистър – водовземане от минерални води",
      url:
        "https://www.bsbd.bg/bg/register.html",
      kind: "register"
    });
  }

  if (
    authorityText.includes("дунав") ||
    authorityText.includes("бддр") ||
    authorityText.includes("bddr") ||
    authorityText.includes(
      "bd-dunav"
    )
  ) {
    basinName =
      'Басейнова дирекция „Дунавски район“';

    links.push({
      label:
        "БДДР · Регистри на разрешителни и решения",
      url:
        "https://www.bd-dunav.bg/content/registri/razreshitelni-i-resheniia/",
      kind: "register"
    });
  }

  // ----------------------------------------------------------
  // EXACT DEPOSIT-SPECIFIC OFFICIAL ACTS
  // These are not presented as general procedures.
  // ----------------------------------------------------------

  if (
    normalizedName.includes("велинград") &&
    normalizedName.includes("лъджене")
  ) {
    links.push({
      label:
        "Община Велинград · официален акт за КЕИ-19, Велинград–Лъджене",
      url:
        "https://m.velingrad.bg/?p=68779",
      kind: "official-act"
    });

    if (!basinName) {
      basinName =
        'Басейнова дирекция „Източнобеломорски район“';

      links.unshift({
        label:
          "БДИБР · Регистър на разрешителните за минерални води",
        url:
          "https://earbd.bg/Mineralni_vodi-p2451",
        kind: "register"
      });
    }
  }

  const commonCheckItems = [
    "Кой точно водоизточник или водовземно съоръжение се отнася до имота или планираното ползване.",
    "Има ли действащо разрешително за водовземане.",
    "Кой е титулярът на разрешителното.",
    "От кой орган е издадено разрешителното.",
    "За каква цел е разрешено използването на минералната вода.",
    "Какъв дебит и годишен обем са разрешени.",
    "До коя дата е валидно разрешителното.",
    "Има ли решения за изменение, продължаване, прекратяване или отнемане.",
    "Какъв е утвърденият експлоатационен ресурс и има ли свободна част от него.",
    "Какъв е правният статут на конкретното съоръжение, а не само на находището като цяло."
  ];

  if (
    management ===
    "STATE_BASIN_DIRECTORATE_MANAGED"
  ) {
    return {
      authorityTitle:
        "Официални източници и документи",
      authorityName:
        basinName ||
        deposit.managingAuthority ||
        "Компетентната басейнова дирекция",

      whereToCheck: [
        "В официалния регистър за разрешителни за водовземане от минерални води.",
        "В регистъра или официалните данни за конкретното минерално водовземно съоръжение.",
        "В данните за утвърдения експлоатационен ресурс на находището.",
        "При неяснота – с официално запитване до компетентната басейнова дирекция."
      ],

      checkItems:
        commonCheckItems,

      nextSteps: [
        "Идентифицирайте конкретния водоизточник или съоръжение.",
        "Проверете действащото разрешително и неговия титуляр.",
        "Проверете разрешената цел, дебит, обем и срок.",
        "Проверете утвърдения и свободния експлоатационен ресурс.",
        "Установете дали желаното от вас ползване е допустимо.",
        "Установете коя точно разрешителна процедура се прилага.",
        "Подайте необходимото заявление пред компетентния орган.",
        "Започнете водовземане само след възникване на необходимото правно основание."
      ],

      officialLinks:
        links,

      note:
        basinName
          ? null
          : "От текущите данни не може безопасно да бъде определена конкретна басейнова дирекция. Не използвайте обща процедура, преди компетентният орган да бъде потвърден."
    };
  }

  if (
    management ===
    "DELEGATED_TO_MUNICIPALITY"
  ) {
    return {
      authorityTitle:
        "Официални източници и документи",

      authorityName:
        municipality
          ? `Община ${municipality}`
          : "Общината, на която е предоставено управлението",

      whereToCheck: [
        "В действащия акт за предоставяне на находището или съответния участък на общината.",
        "В общинския регистър на издадените разрешителни за минерална вода, ако такъв е публикуван.",
        "В решенията и административните актове за конкретния водоизточник.",
        ...(basinName
          ? [
              `За ресурса и басейновата компетентност проверете и данните на ${basinName}.`
            ]
          : [])
      ],

      checkItems: [
        ...commonCheckItems,
        "Действа ли към момента предоставянето на управлението на общината.",
        "Включен ли е конкретният водоизточник в предоставената част на находището.",
        "Каква общинска процедура се прилага за конкретната цел."
      ],

      nextSteps: [
        "Идентифицирайте точно водоизточника.",
        "Потвърдете, че съоръжението е част от предоставеното на общината управление.",
        "Проверете действащите разрешителни и придобити права.",
        "Проверете наличния експлоатационен ресурс.",
        "Установете точната общинска процедура.",
        "Подайте необходимите документи пред компетентния общински орган.",
        "Изчакайте издаването на разрешение или друго изискуемо правно основание.",
        "Едва след това започвайте ползването."
      ],

      officialLinks:
        links,

      note:
        municipality
          ? null
          : "В текущия legal record не е потвърдена конкретна община."
    };
  }

  if (
    deposit.ownershipStatus ===
      "PUBLIC_MUNICIPAL" ||
    management === "MUNICIPAL"
  ) {
    return {
      authorityTitle:
        "Официални източници и документи",

      authorityName:
        municipality
          ? `Община ${municipality}`
          : deposit.managingAuthority ||
            "Компетентната община",

      whereToCheck: [
        "В общинските решения и регистри за конкретния минерален водоизточник.",
        "В действащия местен ред за предоставяне или водовземане.",
        "В документите за наличния експлоатационен ресурс."
      ],

      checkItems: [
        ...commonCheckItems,
        "Има ли действаща местна наредба или решение на общинския съвет.",
        "Изисква ли се разрешително, договор или друго правно основание."
      ],

      nextSteps: [
        "Идентифицирайте водоизточника.",
        "Проверете общинския му правен режим.",
        "Проверете действащите права върху него.",
        "Проверете наличния ресурс.",
        "Определете приложимата общинска процедура.",
        "Подайте необходимите документи.",
        "Не започвайте ползване преди придобиването на изискуемото право."
      ],

      officialLinks:
        links,

      note: null
    };
  }

  if (
    management ===
    "MIXED_LEGAL_REGIME"
  ) {
    return {
      authorityTitle:
        "Официални източници и документи",

      authorityName:
        "Компетентният орган за конкретното съоръжение",

      whereToCheck: [
        "Първо идентифицирайте конкретния водоизточник.",
        "Установете дали той е в държавен, общински, концесионен или друг индивидуален режим.",
        "Използвайте само регистрите и актовете, приложими към конкретното съоръжение."
      ],

      checkItems:
        commonCheckItems,

      nextSteps: [
        "Идентифицирайте съоръжението.",
        "Определете индивидуалния му правен режим.",
        "Определете компетентния орган.",
        "Проверете разрешителното и титуляра.",
        "Проверете ресурса.",
        "Продължете по процедурата на установения орган."
      ],

      officialLinks:
        links,

      note:
        "При смесен правен режим не може безопасно да се приложи един и същ ред към всички съоръжения в находището."
    };
  }

  if (
    management ===
      "SECTION_DEPENDENT" ||
    deposit.sections.length > 0
  ) {
    return {
      authorityTitle:
        "Официални източници и документи",

      authorityName:
        "Компетентният орган за конкретния участък",

      whereToCheck: [
        "Първо определете точния участък на находището.",
        "След това идентифицирайте конкретното съоръжение.",
        "Проверете управлението и разрешителния режим именно на този участък."
      ],

      checkItems:
        commonCheckItems,

      nextSteps: [
        "Определете участъка.",
        "Идентифицирайте съоръжението.",
        "Проверете режима на участъка.",
        "Определете компетентния орган.",
        "Проверете разрешителното, титуляра и ресурса.",
        "Продължете само по процедурата за конкретния участък."
      ],

      officialLinks:
        links,

      note:
        "Статусът на находището като цяло не е достатъчен за определяне на правата върху конкретен водоизточник."
    };
  }

  return {
    authorityTitle:
      "Официални източници и документи",

    authorityName:
      deposit.managingAuthority ||
      municipality ||
      "Компетентният орган все още не е потвърден",

    whereToCheck: [
      "В официалния акт за управление на находището.",
      "В официалните данни за конкретния водоизточник.",
      "В действащите разрешителни.",
      "В данните за експлоатационния ресурс."
    ],

    checkItems:
      commonCheckItems,

    nextSteps: [
      "Идентифицирайте конкретния водоизточник.",
      "Установете актуалния му правен режим.",
      "Установете компетентния орган.",
      "Проверете разрешителното и титуляра.",
      "Проверете ресурса.",
      "Едва след потвърждаване на режима преминете към конкретна процедура."
    ],

    officialLinks:
      links,

    note:
      "Текущите данни не са достатъчни за автоматично определяне на конкретна разрешителна процедура."
  };
}

type MineralStatusRightsSummary = {
  resultKind:
    | "CAN_APPLY"
    | "NO_ESTABLISHED_RIGHT"
    | "IDENTIFY_FIRST";

  resultTitle: string;
  explanation: string;

  legalBasis: string[];

  conditions: string[];

  authorityName: string;

  authorityDuties: string[];

  authorityLimits: string[];

  note: string;
};

function getMineralStatusRightsSummary(
  deposit: MineralDepositDetail
): MineralStatusRightsSummary {
  const ownership =
    deposit.ownershipStatus;

  const management =
    deposit.managementStatus;

  const municipality =
    deposit.delegatedMunicipality;

  const eligibility =
    deposit.currentEligibility;

  if (
    management === "SECTION_DEPENDENT" ||
    management === "MIXED_LEGAL_REGIME" ||
    deposit.sections.length > 0
  ) {
    return {
      resultKind: "IDENTIFY_FIRST",

      resultTitle:
        "ПЪРВО УСТАНОВЕТЕ КОНКРЕТНОТО СЪОРЪЖЕНИЕ И УЧАСТЪК",

      explanation:
        "Тук режимът може да е различен за отделните участъци или водоизточници. Не е правилно да се прилага един и същ правен режим към всички съоръжения в находището.",

      legalBasis: [
        "Правото на водовземане се определя за конкретното водовземане и приложимия административен режим.",
        "При различен режим по участъци компетентният орган се определя след идентифициране на конкретния участък."
      ],

      conditions: [
        "Изберете конкретното съоръжение.",
        "Установете към кой участък принадлежи.",
        "Проверете режима на управление за този участък.",
        "Проверете наличния експлоатационен ресурс и допустимия дебит.",
        "След това определете приложимата процедура."
      ],

      authorityName:
        "Определя се след идентифициране на конкретния участък",

      authorityDuties: [
        "Да приложи режима, валиден за конкретния участък.",
        "Да разгледа искането по приложимата административна процедура.",
        "Да съобрази наличния ресурс, допустимия дебит и вече предоставените права."
      ],

      authorityLimits: [
        "Не може да прилага режима на един участък към друг.",
        "Не може да приеме, че близостта на имота до находището създава автоматично право на водовземане.",
        "Не може да разреши водовземане извън допустимия ресурс и техническите ограничения."
      ],

      note:
        "След избор на конкретно съоръжение режимът трябва да се прецени индивидуално за него."
    };
  }

  if (
    ownership === "EXCLUSIVE_STATE" &&
    management === "DELEGATED_TO_MUNICIPALITY"
  ) {
    return {
      resultKind: "CAN_APPLY",

      resultTitle:
        "ИМАТЕ ПРАВО ДА КАНДИДАТСТВАТЕ ЗА ПОЛЗВАНЕ НА МИНЕРАЛНАТА ВОДА",

      explanation:
        municipality
          ? `Находището е предоставено за управление и ползване на ${municipality}. Това не означава, че минералната вода е недостъпна за граждани или инвеститори. Може да бъде придобито право на водовземане при изпълнение на законовите условия и издаване на необходимия акт.`
          : "Находището е предоставено за управление на община. Това не означава, че минералната вода е недостъпна за граждани или инвеститори. Може да бъде придобито право на водовземане при изпълнение на законовите условия.",

      legalBasis: [
        "Чл. 44 от Закона за водите – водовземането се извършва въз основа на разрешително, когато законът изисква такова.",
        "§ 133 от ПЗР към изменението на Закона за водите – режим за предоставяне на минерални води – изключителна държавна собственост, за управление и ползване от общини.",
        "Приложимите правила за подземните и минералните води изискват конкретно правно основание за водовземането."
      ],

      conditions: [
        "Съоръжението трябва да попада в предоставеното находище или участък.",
        "Трябва да има утвърден експлоатационен ресурс.",
        "Трябва да има допустим технически дебит на конкретното съоръжение.",
        "Желаната цел и количество трябва да са допустими.",
        "Преди започване на водовземането трябва да бъде издаден необходимият административен акт."
      ],

      authorityName:
        municipality ||
        "Съответната община",

      authorityDuties: [
        "Да приеме и разгледа редовно подаденото искане.",
        "Да провери дали съоръжението попада в предоставения режим.",
        "Да съобрази разрешаването с наличния ресурс и технически възможния дебит.",
        "Да спазва приложимите условия за опазване на минералната вода.",
        "Да упражнява възложените й функции по управление на предоставеното находище."
      ],

      authorityLimits: [
        "Не може автоматично да твърди, че частно лице няма право да кандидатства само защото водата е държавна собственост.",
        "Не е длъжна да издаде разрешително, когато липсва ресурс или законовите условия не са изпълнени.",
        "Не може да предостави по-голямо количество или дебит от допустимото.",
        "Не може да предостави права извън обхвата на предоставеното й находище или участък."
      ],

      note:
        "Това е право да кандидатствате за придобиване на право на водовземане. То не означава, че можете да започнете водовземане без необходимото разрешение или друг приложим акт."
    };
  }

  if (
    ownership === "PUBLIC_MUNICIPAL" ||
    management === "MUNICIPAL"
  ) {
    return {
      resultKind: "CAN_APPLY",

      resultTitle:
        "ИМАТЕ ПРАВО ДА КАНДИДАТСТВАТЕ ЗА ПОЛЗВАНЕ НА МИНЕРАЛНАТА ВОДА",

      explanation:
        "Общинският режим не означава, че минералната вода е забранена за частно ползване. Право може да бъде придобито по приложимата процедура, когато са изпълнени условията за конкретното съоръжение.",

      legalBasis: [
        "Законът за водите предвижда разрешителен режим за водовземане от минерални води.",
        "При минерални води – публична общинска собственост, компетентността се упражнява от съответния общински орган в предвидените от закона случаи."
      ],

      conditions: [
        "Определете конкретното съоръжение.",
        "Проверете свободния експлоатационен ресурс.",
        "Проверете технически допустимия дебит.",
        "Посочете целта и необходимото количество.",
        "Получете необходимия административен акт преди водовземането."
      ],

      authorityName:
        deposit.managingAuthority ||
        deposit.delegatedMunicipality ||
        "Съответната община",

      authorityDuties: [
        "Да предостави информация за приложимата процедура.",
        "Да разгледа редовно подаденото искане.",
        "Да провери ресурсната и техническата възможност за водовземане.",
        "Да приложи режима за опазване и ефективно използване на минералната вода."
      ],

      authorityLimits: [
        "Не може автоматично да откаже само с твърдение, че частни лица не могат да ползват минерална вода.",
        "Не е длъжна да разреши водовземане при липса на ресурс или неизпълнени законови условия.",
        "Не може да разреши водовземане над наличния ресурс или технически допустимия дебит."
      ],

      note:
        "Конкретното право възниква след издаването на приложимия административен акт и се упражнява само в неговите граници."
    };
  }

  if (
    ownership === "EXCLUSIVE_STATE" &&
    management ===
      "STATE_BASIN_DIRECTORATE_MANAGED"
  ) {
    return {
      resultKind: "CAN_APPLY",

      resultTitle:
        "ИМАТЕ ПРАВО ДА КАНДИДАТСТВАТЕ ЗА ПОЛЗВАНЕ НА МИНЕРАЛНАТА ВОДА",

      explanation:
        "Минералната вода е изключителна държавна собственост, но това само по себе си не означава забрана за ползване от частно лице. Право на водовземане може да бъде придобито по съответната процедура при изпълнение на законовите условия.",

      legalBasis: [
        "Чл. 44 от Закона за водите – водовземането се извършва въз основа на разрешително, когато законът изисква такова.",
        "За държавно управляваните минерални води се прилага компетентността на съответния държавен орган по Закона за водите."
      ],

      conditions: [
        "Определете конкретното съоръжение.",
        "Проверете наличния и свободен експлоатационен ресурс.",
        "Проверете технически възможния дебит.",
        "Посочете целта и необходимото количество.",
        "Изпълнете изискванията за издаване на съответния административен акт."
      ],

      authorityName:
        deposit.managingAuthority ||
        "Компетентната басейнова дирекция",

      authorityDuties: [
        "Да разгледа редовно подаденото искане.",
        "Да провери ресурсната обезпеченост.",
        "Да съобрази техническите ограничения и вече предоставените права.",
        "Да упражнява контрол върху условията на издадените разрешителни."
      ],

      authorityLimits: [
        "Не може автоматично да приеме, че частно лице няма право да кандидатства само защото водата е държавна собственост.",
        "Не е длъжен да издаде разрешително, ако няма свободен ресурс или условията не са изпълнени.",
        "Не може да разреши по-голям дебит или количество от допустимото."
      ],

      note:
        "Държавната собственост определя режима на управление, а не абсолютна забрана за придобиване на право на водовземане."
    };
  }

  if (
    eligibility?.status ===
    "LISTED_FOR_PROVISION"
  ) {
    return {
      resultKind: "NO_ESTABLISHED_RIGHT",

      resultTitle:
        "САМО ВКЛЮЧВАНЕТО В СПИСЪК НЕ ДОКАЗВА, ЧЕ НАХОДИЩЕТО Е ПРЕДОСТАВЕНО НА ОБЩИНАТА",

      explanation:
        "Статусът показва, че находището е включено в процедура за възможно предоставяне. Това само по себе си не доказва действащо предоставяне и не е достатъчно, за да се определи кой орган трябва да разреши конкретното водовземане.",

      legalBasis: [
        "§ 133 предвижда процедура за предоставяне на минерални води на общини.",
        "Включването в списък и действителното предоставяне не са едно и също."
      ],

      conditions: [
        "Проверете има ли последващо решение за предоставяне.",
        "Проверете срока и обхвата на решението.",
        "Установете конкретното съоръжение.",
        "След това определете компетентния орган и процедурата."
      ],

      authorityName:
        "Трябва да бъде установен според актуалното решение за управление",

      authorityDuties: [
        "Да приложи актуалния правен режим.",
        "Да отчете действащите решения за предоставяне.",
        "Да разгледа искането от компетентния орган."
      ],

      authorityLimits: [
        "Не трябва автоматично да се приема, че общината вече управлява находището.",
        "Не трябва автоматично да се приема и че ползването е забранено.",
        "Не може да се даде надежден краен отговор без проверка на актуалното предоставяне."
      ],

      note:
        "Необходимо е първо да се установи дали има действащо решение за предоставяне."
    };
  }

  return {
    resultKind: "NO_ESTABLISHED_RIGHT",

    resultTitle:
      "НЯМАТЕ УСТАНОВЕНО ПРАВО ДА ПОЛЗВАТЕ ВОДАТА В МОМЕНТА",

    explanation:
      "Наличните данни не доказват лично действащо право на водовземане. Това обаче не означава автоматично, че ползването е забранено или че не можете да придобиете такова право.",

    legalBasis: [
      "Правото на водовземане от минерална вода се придобива по предвидения в Закона за водите ред.",
      "Трябва да бъдат установени конкретното съоръжение, режимът на управление и компетентният орган."
    ],

    conditions: [
      "Определете конкретното съоръжение.",
      "Проверете актуалния режим на управление.",
      "Проверете наличния ресурс.",
      "Проверете има ли действащо разрешително или друго правно основание.",
      "Определете процедурата за придобиване на право за желаната цел."
    ],

    authorityName:
      "Компетентният орган все още не е установен надеждно",

    authorityDuties: [
      "Да приложи правилния режим след установяване на статуса.",
      "Да разгледа редовно подадено искане, когато е компетентен."
    ],

    authorityLimits: [
      "Не трябва автоматично да се твърди, че ползването е забранено.",
      "Не трябва да се посочва грешен компетентен орган без достатъчно данни.",
      "Не възниква право само защото имотът е близо до находището."
    ],

    note:
      "Необходима е допълнителна проверка на официалния режим, а не автоматичен отказ."
  };
}

type SelectedMineralFacility =
  NonNullable<
    MineralDepositSearchResult["matchedFacility"]
  >;

function getEffectiveMineralDepositForFacility(
  deposit: MineralDepositDetail,
  facility: SelectedMineralFacility | null
): MineralDepositDetail {
  if (!facility) {
    return deposit;
  }

  const matchedSection =
    deposit.sections.find(
      (section) =>
        section.facilityIds.includes(
          facility.mineralId
        )
    ) || null;

  /*
   * LEGAL PRIORITY
   *
   * 1. Exact section containing the facility.
   * 2. Effective facility status returned by API.
   * 3. Deposit status only when the parent regime
   *    is not mixed / section-dependent.
   *
   * Never guess a regime for an unassigned facility
   * inside MIXED_LEGAL_REGIME or SECTION_DEPENDENT.
   */

  const ambiguousParent =
    deposit.managementStatus ===
      "SECTION_DEPENDENT" ||
    deposit.managementStatus ===
      "MIXED_LEGAL_REGIME";

  const managementStatus =
    matchedSection?.managementStatus ||
    (
      !ambiguousParent
        ? facility.effectiveManagementStatus
        : null
    ) ||
    (
      !ambiguousParent
        ? deposit.managementStatus
        : null
    ) ||
    "TO_RESEARCH";

  const delegatedMunicipality =
    matchedSection?.delegatedMunicipality ||
    (
      managementStatus ===
        "DELEGATED_TO_MUNICIPALITY"
        ? facility.effectiveDelegatedMunicipality
        : null
    ) ||
    (
      managementStatus ===
        "DELEGATED_TO_MUNICIPALITY"
        ? deposit.delegatedMunicipality
        : null
    ) ||
    null;

  const managementTerm =
    matchedSection?.managementTerm ||
    (
      matchedSection
        ? null
        : deposit.managementTerm
    );

  const currentEligibility =
    matchedSection?.currentEligibility ||
    (
      matchedSection
        ? null
        : deposit.currentEligibility
    );

  const researchStatus =
    matchedSection?.researchStatus ||
    (
      managementStatus === "TO_RESEARCH"
        ? "TO_RESEARCH"
        : deposit.researchStatus
    );

  return {
    ...deposit,

    managementStatus,

    delegatedMunicipality,

    managementTerm,

    currentEligibility,

    researchStatus,

    /*
     * A specific facility has already been identified.
     * Prevent generic section-count logic from overriding
     * the resolved facility regime.
     */
    sections: [],
  };
}
function getExistingDepositGuidance(
  deposit: MineralDepositDetail
) {
  const ownership = deposit.ownershipStatus;
  const management = deposit.managementStatus;

  if (
    ownership === "EXCLUSIVE_STATE" &&
    management === "STATE_BASIN_DIRECTORATE_MANAGED"
  ) {
    return {
      title: "Какво означава това за вас",
      canDo: [
        "Можете да проверите конкретния водоизточник или съоръжение, към което се отнася ползването.",
        "Можете да проверите дали за конкретното съоръжение има действащо разрешително и какъв обем или цел на водовземане е разрешен.",
        "Можете да проверите дали има наличен експлоатационен ресурс за ново или изменено водовземане."
      ],
      cannotAssume: [
        "Не възниква автоматично право да ползвате минералната вода само защото имотът ви се намира в района на находището.",
        "Собствеността върху земята не означава собственост върху минералната вода.",
        "Наличието на сондаж или друго водовземно съоръжение не означава само по себе си, че имате право да го използвате.",
        "Не трябва да се приема, че общината е компетентният орган, когато находището е под управление на басейнова дирекция."
      ],
      nextStep:
        "Установете конкретния водоизточник или съоръжение и проверете действащото разрешително, титуляра и допустимия обем на водовземане."
    };
  }

  if (management === "DELEGATED_TO_MUNICIPALITY") {
    return {
      title: "Какво означава това за вас",
      canDo: [
        "Можете да проверите в общината условията за ползване на конкретния водоизточник.",
        "Ако за конкретното съоръжение има налични разрешителни или регистрационни данни в SONDI EXPERT, те са показани в подробния анализ.",
        "SONDI.BG вече е свързал конкретното съоръжение с наличния участък и приложимия му режим."
      ],
      cannotAssume: [
        "Предоставянето на находището на общината не дава автоматично право на всеки собственик на имот да ползва минералната вода.",
        "Не трябва да се приема, че всяко съоръжение в находището е включено в едно и също предоставяне.",
        "Не трябва да се започва водовземане без проверка на конкретното правно основание."
      ],
      nextStep:
        "Уточнете за каква цел искате да използвате минералната вода и какво количество ви е необходимо. След това следвайте приложимата процедура пред посочената община."
    };
  }

  if (
    ownership === "PUBLIC_MUNICIPAL" ||
    management === "MUNICIPAL"
  ) {
    return {
      title: "Какво означава това за вас",
      canDo: [
        "Можете да поискате от съответната община информация за конкретния водоизточник и допустимите начини за ползване.",
        "Можете да проверите дали има общински ред, договор, разрешение или друга процедура за конкретната цел."
      ],
      cannotAssume: [
        "Публичната общинска собственост не означава свободно и безусловно ползване.",
        "Собствеността върху съседен или прилежащ имот не създава автоматично право върху минералната вода.",
        "Не трябва да се приема, че съществуващо съоръжение може да се използва без проверка на правното му основание."
      ],
      nextStep:
        "Проверете при съответната община режима на конкретния водоизточник и процедурата за желаното от вас ползване."
    };
  }

  if (management === "MIXED_LEGAL_REGIME") {
    return {
      title: "Какво означава това за вас",
      canDo: [
        "Можете да установите точно кой водоизточник или съоръжение възнамерявате да използвате.",
        "След идентифициране на съоръжението може да се определи приложимият към него правен режим и компетентният орган."
      ],
      cannotAssume: [
        "Не трябва да се приема един общ управител за цялото находище.",
        "Не трябва да се приема, че режимът на един водоизточник важи автоматично за всички останали.",
        "Не може надеждно да се определи процедурата без идентифициране на конкретния водоизточник."
      ],
      nextStep:
        "Първо идентифицирайте конкретния водоизточник или съоръжение. След това проверете неговия индивидуален правен режим."
    };
  }

  if (
    management === "SECTION_DEPENDENT" ||
    deposit.sections.length > 0
  ) {
    return {
      title: "Какво означава това за вас",
      canDo: [
        "Можете да установите в кой участък на находището се намира конкретният водоизточник.",
        "След определяне на участъка може да се установи правилният управител и приложимата процедура."
      ],
      cannotAssume: [
        "Не трябва да се прилага режимът на един участък към друг.",
        "Не може да се определи надеждно компетентният орган без да е установен конкретният участък."
      ],
      nextStep:
        "Определете участъка и конкретното съоръжение, след което използвайте режима, посочен за този участък."
    };
  }

  return {
    title: "Какво означава това за вас",
    canDo: [
      "Можете да установите конкретния водоизточник и да проверите наличните официални актове за него.",
      "Можете да проверите има ли действащо разрешително, предоставяне или друго правно основание за ползване."
    ],
    cannotAssume: [
      "Не трябва да се приема автоматично кой е компетентният орган.",
      "Не трябва да се приема, че липсата на потвърден управител означава свободно ползване.",
      "Не трябва да се започва водовземане само въз основа на наличието на съоръжение."
    ],
    nextStep:
      "Необходима е допълнителна официална проверка на конкретния водоизточник, управленския акт и действащите разрешителни."
  };
}

type NewUsePurpose =
  | null
  | "household"
  | "irrigation"
  | "animals"
  | "combined"
  | "business"
  | "other";


type OwnerStatus =
  | null
  | "owner"
  | "not-owner";

type SettlementStatus =
  | null
  | "yes"
  | "no"
  | "unknown";

type DailyVolume =
  | null
  | "up-to-10"
  | "over-10"
  | "unknown";

type BasinDirectorate =
  | null
  | "danube"
  | "black-sea"
  | "east-aegean"
  | "west-aegean";

type LegalLocationData = {
  lat: number;
  lng: number;
  basinCode: string | null;
  basinName: string | null;
  formsUrl: string | null;
  existingRegisterUrl?: string | null;
  existingRegisterSearchable?: boolean;
  existingRegisterLookupNote?: string | null;
  formExistingWellPermitUrl?: string | null;
  formAmendGroundwaterPermitUrl?: string | null;
  formOldOwnUseRg2Url?: string | null;
  formNormalOwnUseRg1Url?: string | null;
  formOwnUseUg1Url?: string | null;
  formNewWellPermitUrl?: string | null;
  groundwaterBodies: unknown[];

  mineralContext?: {
    nearbyFacilities: Array<{
      mineralId: string;
      name: string;
      facilityType: string | null;
      settlement: string | null;
      deposit: string | null;
      latitude: number | null;
      longitude: number | null;
      distanceKm: number;

      newFacilityGuidance?: {
        code:
          | "MUNICIPAL_DEPOSIT"
          | "STATE_DELEGATED"
          | "STATE_LISTED_FOR_PROVISION"
          | "STATE_STATUS_RESEARCH"
          | "SECTION_SPECIFIC"
          | "MUNICIPAL_STATUS_RESEARCH"
          | "UNRESOLVED";

        title: string;
        summary: string;
        nextStep: string;
        caution: string;

        authorityLabel: string | null;
        authorityName: string | null;

        currentStatusVerified: boolean;
        requiresSectionIdentification: boolean;
        requiresAdditionalOfficialCheck: boolean;
      } | null;

      legal: {
        depositId: string;
        canonicalName: string;
        officialNumber: number | null;

        ownershipStatus: string | null;

        managementStatus: string | null;
        delegatedMunicipality: string | null;

        managementTerm: {
          type?: string | null;
          years?: number | null;
          end_date?: string | null;
          active_on?: string | null;
          active_on_verified?: boolean | null;
        } | null;

        currentEligibility: {
          status?: string | null;
          year?: number | null;
          official_list_date?: string | null;
          requires_municipal_application?: boolean | null;
          requires_ministerial_decision?: boolean | null;
          requires_new_ministerial_decision?: boolean | null;
          current_delegation_not_assumed?: boolean | null;
        } | null;

        researchStatus: string | null;

        section: {
          sectionId: string | null;
          name: string | null;
          managementStatus: string | null;
          delegatedMunicipality: string | null;
          managementTerm: {
            type?: string | null;
            years?: number | null;
            end_date?: string | null;
            active_on?: string | null;
            active_on_verified?: boolean | null;
          } | null;
          currentEligibility: {
            status?: string | null;
            year?: number | null;
            official_list_date?: string | null;
            requires_municipal_application?: boolean | null;
            requires_ministerial_decision?: boolean | null;
            requires_new_ministerial_decision?: boolean | null;
            current_delegation_not_assumed?: boolean | null;
          } | null;
          researchStatus: string | null;
        } | null;
      } | null;
    }>;

    nearestFacility: unknown | null;

    within1Km: number;
    within5Km: number;
    within10Km: number;
    within25Km: number;

    representedDeposits: string[];
  };
};

type SettlementCandidate =
  LegalLocationData & {
    label: string;
    type?: string;
  };

type ExistingRegistration =
  | null
  | "registered"
  | "unregistered"
  | "unknown";

type ExistingUse =
  | null
  | "own"
  | "business"
  | "other";

type ExistingAge =
  | null
  | "before-2018"
  | "after-2018"
  | "unknown";

type ExistingAction =
  | null
  | "use"
  | "repair"
  | "change"
  | "close";

type RepairType =
  | null
  | "maintenance"
  | "reconstruction"
  | "unknown";

type ExistingBusinessPermit =
  | null
  | "yes"
  | "no"
  | "unknown";

type ExistingOtherKind =
  | null
  | "household"
  | "income"
  | "nonprofit"
  | "unknown";

export default function LegalWizard() {
  const [branch, setBranch] =
    useState<WaterBranch>(null);

  const [ordinaryStage, setOrdinaryStage] =
    useState<OrdinaryStage>("start");

  const [mineralStage, setMineralStage] =
    useState<MineralStage>("start");

  const [
    mineralDepositQuery,
    setMineralDepositQuery,
  ] = useState("");

  const [
    mineralDepositResults,
    setMineralDepositResults,
  ] = useState<MineralDepositSearchResult[]>([]);

  const [
    selectedMineralDeposit,
    setSelectedMineralDeposit,
  ] = useState<MineralDepositDetail | null>(null);
  const [
    selectedMineralFacility,
    setSelectedMineralFacility,
  ] = useState<SelectedMineralFacility | null>(
    null
  );

  /*
   * Prevent history synchronization from pushing a new entry
   * while React state is being changed by browser Back/Forward.
   */
  const legalHistoryNavigationRef =
    useRef(false);


  const [
    selectedFacilityLegalContext,
    setSelectedFacilityLegalContext,
  ] = useState<any>(null);

  const [
    mineralDepositLoading,
    setMineralDepositLoading,
  ] = useState(false);

  const [
    mineralDepositError,
    setMineralDepositError,
  ] = useState("");


  /* NEW_MINERAL_DEPOSIT_CONFIRMATION_V2 */

  /* NEW_MINERAL_LEGAL_DEPOSIT_RESOLVER_V3 */
  const [
    newMineralFacilityResolvedDeposit,
    setNewMineralFacilityResolvedDeposit,
  ] = useState<MineralDepositDetail | null>(
    null
  );

  const [
    newMineralFacilityResolvedDepositLoading,
    setNewMineralFacilityResolvedDepositLoading,
  ] = useState(false);

  const [
    newMineralFacilityResolvedDepositError,
    setNewMineralFacilityResolvedDepositError,
  ] = useState("");

  const [
    newMineralFacilitySelectedDeposit,
    setNewMineralFacilitySelectedDeposit,
  ] = useState<string | null>(null);

  const [
    newMineralFacilityLocation,
    setNewMineralFacilityLocation,
  ] = useState<LegalLocationData | null>(
    null
  );


  /* NEW_MINERAL_EXACT_POINT_STATE_V1 */
  const [
    newMineralFacilityExactPointSelected,
    setNewMineralFacilityExactPointSelected,
  ] = useState(false);

  const [
    newMineralFacilityCandidates,
    setNewMineralFacilityCandidates,
  ] = useState<SettlementCandidate[]>([]);

  const [
    newMineralFacilityError,
    setNewMineralFacilityError,
  ] = useState("");

  const [
    mineralPermitQuery,
    setMineralPermitQuery,
  ] = useState("");

  const [
    mineralPermitResults,
    setMineralPermitResults,
  ] = useState<MineralPermitSearchResult[]>(
    []
  );

  const [
    selectedMineralPermit,
    setSelectedMineralPermit,
  ] = useState<MineralPermitSearchResult | null>(
    null
  );

  const [
    mineralPermitLoading,
    setMineralPermitLoading,
  ] = useState(false);

  const [
    mineralPermitError,
    setMineralPermitError,
  ] = useState("");

  const [
    mineralPermitNumber,
    setMineralPermitNumber,
  ] = useState("");

  const [
    mineralPermitIssuer,
    setMineralPermitIssuer,
  ] = useState("");

  const [
    mineralPermitIssueDate,
    setMineralPermitIssueDate,
  ] = useState("");

  const [
    mineralPermitExpiryDate,
    setMineralPermitExpiryDate,
  ] = useState("");

  const [
    mineralPermitHolder,
    setMineralPermitHolder,
  ] = useState("");

  const [
    mineralPermitFacility,
    setMineralPermitFacility,
  ] = useState("");

  const [
    existingRegistration,
    setExistingRegistration,
  ] = useState<ExistingRegistration>(null);

  const [existingUse, setExistingUse] =
    useState<ExistingUse>(null);

  const [existingAge, setExistingAge] =
    useState<ExistingAge>(null);

  const [existingAction, setExistingAction] =
    useState<ExistingAction>(null);

  const [repairType, setRepairType] =
    useState<RepairType>(null);

  const [existingBusinessPermit, setExistingBusinessPermit] =
    useState<ExistingBusinessPermit>(null);

  const [existingOtherKind, setExistingOtherKind] =
    useState<ExistingOtherKind>(null);

  const [newUsePurpose, setNewUsePurpose] =
    useState<NewUsePurpose>(null);


  const [ownerStatus, setOwnerStatus] =
    useState<OwnerStatus>(null);

  const [settlementStatus, setSettlementStatus] =
    useState<SettlementStatus>(null);

  const [dailyVolume, setDailyVolume] =
    useState<DailyVolume>(null);

  const [plannedDepth, setPlannedDepth] =
    useState("");

  const [basinDirectorate, setBasinDirectorate] =
    useState<BasinDirectorate>(null);

  const [legalLocation, setLegalLocation] =
    useState<LegalLocationData | null>(null);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [settlementQuery, setSettlementQuery] =
    useState("");

  const [settlementCandidates, setSettlementCandidates] =
    useState<SettlementCandidate[]>([]);

  const [settlementSearchError, setSettlementSearchError] =
    useState("");



  /* LEGAL_BROWSER_HISTORY_V1 */

  /*
   * Mark the real /legal entry as the wizard start level.
   * This prevents the first browser Back inside the wizard
   * from immediately returning to /explore.
   */
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const currentState =
      window.history.state || {};

    if (!currentState?.sondiLegalLevel) {
      window.history.replaceState(
        {
          ...currentState,
          sondiLegalLevel: "start",
        },
        "",
        window.location.href
      );
    }
  }, []);

  /*
   * Synchronize React wizard state -> browser history.
   *
   * start
   *   -> deposit
   *   -> facility
   *
   * If a facility is opened directly, create the missing
   * deposit level as an intermediate browser-history entry.
   */
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (legalHistoryNavigationRef.current) {
      legalHistoryNavigationRef.current = false;
      return;
    }

    const currentLevel =
      window.history.state?.sondiLegalLevel ||
      "start";

    if (
      selectedMineralDeposit &&
      selectedMineralFacility
    ) {
      if (currentLevel === "start") {
        window.history.pushState(
          {
            sondiLegalLevel: "deposit",
            depositId:
              selectedMineralDeposit.depositId,
          },
          "",
          "/legal"
        );
      }

      const levelAfterDeposit =
        window.history.state?.sondiLegalLevel;

      if (levelAfterDeposit !== "facility") {
        window.history.pushState(
          {
            sondiLegalLevel: "facility",
            depositId:
              selectedMineralDeposit.depositId,
            facilityId:
              selectedMineralFacility.mineralId,
          },
          "",
          `/legal?facility=${encodeURIComponent(
            selectedMineralFacility.mineralId
          )}`
        );
      }

      return;
    }

    if (selectedMineralDeposit) {
      if (currentLevel !== "deposit") {
        window.history.pushState(
          {
            sondiLegalLevel: "deposit",
            depositId:
              selectedMineralDeposit.depositId,
          },
          "",
          "/legal"
        );
      }

      return;
    }

    /*
     * Branch selection itself is still inside /legal.
     * Keep the base URL clean.
     */
    if (
      branch !== null &&
      currentLevel === "start"
    ) {
      window.history.replaceState(
        {
          ...(window.history.state || {}),
          sondiLegalLevel: "start",
        },
        "",
        "/legal"
      );
    }
  }, [
    branch,
    selectedMineralDeposit,
    selectedMineralFacility,
  ]);

  /*
   * Browser Back / Forward -> React wizard state.
   */
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleLegalPopState = (
      event: PopStateEvent
    ) => {
      const level =
        event.state?.sondiLegalLevel ||
        "start";

      legalHistoryNavigationRef.current = true;

      if (level === "facility") {
        const facilityId =
          event.state?.facilityId;

        if (facilityId) {
          void loadMineralFacilityLegalContext(
            String(facilityId)
          );
        }

        return;
      }

      if (level === "deposit") {
        /*
         * If we are coming back from a facility,
         * the parent deposit is already loaded.
         */
        if (selectedMineralDeposit) {
          setSelectedMineralFacility(null);
          setSelectedFacilityLegalContext(null);
          setBranch("mineral");
          setMineralStage("existing-deposit");
          return;
        }

        const depositId =
          event.state?.depositId;

        if (depositId) {
          void loadMineralDepositDetail(
            String(depositId),
            null
          );
        }

        return;
      }

      /*
       * START LEVEL:
       * return to the initial /legal screen rather than
       * leaving for /explore.
       */
      setSelectedMineralFacility(null);
      setSelectedFacilityLegalContext(null);
      setSelectedMineralDeposit(null);

      setMineralDepositResults([]);
      setMineralDepositQuery("");
      setMineralDepositError("");

      setMineralStage("start");
      setOrdinaryStage("start");
      setBranch(null);
    };

    window.addEventListener(
      "popstate",
      handleLegalPopState
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handleLegalPopState
      );
    };
  }, [
    selectedMineralDeposit,
  ]);


  /*
   * LEGAL_ROOT_BACK_GUARD_V1
   *
   * Browser Back / Android gesture / iOS swipe:
   *
   * /legal start
   *     ↓ choose mineral / ordinary
   * branch screen
   *
   * creates one SAME-PAGE history step.
   *
   * Therefore Back from a branch returns to the first
   * /legal screen instead of leaving the wizard for /map.
   */
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (branch === null) {
      return;
    }

    /*
     * A popstate navigation is already being handled by the
     * existing LEGAL_BROWSER_HISTORY_V1 listener.
     * Do not create a replacement entry while going Back.
     */
    if (legalHistoryNavigationRef.current) {
      legalHistoryNavigationRef.current = false;
      return;
    }

    const currentState =
      window.history.state || {};

    /*
     * Do not push the same branch twice on React rerenders.
     */
    if (
      currentState.sondiLegal === true &&
      currentState.level === "branch" &&
      currentState.branch === branch
    ) {
      return;
    }

    /*
     * The current /legal document becomes the ROOT entry.
     * This is especially important after returning from /map:
     *
     * ... -> /map -> /legal
     *
     * becomes:
     *
     * ... -> /map -> /legal(root) -> /legal(branch)
     *
     * so one Back gesture lands on /legal(root), not /map.
     */
    window.history.replaceState(
      {
        ...currentState,
        sondiLegal: true,
        level: "start",
      },
      "",
      "/legal"
    );

    window.history.pushState(
      {
        sondiLegal: true,
        level: "branch",
        branch,
      },
      "",
      "/legal"
    );
  }, [branch]);

  /* /LEGAL_BROWSER_HISTORY_V1 */

  useEffect(() => {

    /* MAP_RETURN_NEW_MINERAL_FACILITY_V3 */
    let returnToNewMineralFacility =
      false;

    /*
     * LEGAL_DIRECT_ENTRY_ROOT_V1
     *
     * Saved wizard state exists only to return from the map.
     *
     * Normal navigation to /legal must ALWAYS open the
     * first legal screen, where the user chooses the type
     * of water / legal regime.
     *
     * We restore the saved branch only when the map has
     * returned an exact point through lat + lng.
     */
    const initialParams =
      new URLSearchParams(
        window.location.search
      );

    const initialLat =
      initialParams.get("lat");

    const initialLng =
      initialParams.get("lng");

    const isMapReturn =
      Boolean(
        initialLat &&
        initialLng
      );

    if (!isMapReturn) {
      /*
       * Direct /legal entry.
       * Do not revive an old mineral/ordinary workflow.
       */
      window.sessionStorage.removeItem(
        "sondi-legal-new-well"
      );

      setBranch(null);
      setOrdinaryStage("start");
      setMineralStage("start");

      setMineralDepositQuery("");
      setMineralDepositResults([]);
      setSelectedMineralDeposit(null);
      setSelectedMineralFacility(null);
      setSelectedFacilityLegalContext(null);

      setMineralDepositLoading(false);
      setMineralDepositError("");

      setNewUsePurpose(null);
      setOwnerStatus(null);
      setSettlementStatus(null);
      setDailyVolume(null);
      setPlannedDepth("");

      return;
    }

    /*
     * Map return:
     * restore only the state necessary to continue
     * the workflow that opened the map.
     */
    try {
      const saved =
        window.sessionStorage.getItem(
          "sondi-legal-new-well"
        );

      if (saved) {
        const value =
          JSON.parse(saved);

        if (value.branch === "ordinary") {
          setBranch("ordinary");
        }

        if (value.branch === "mineral") {
          setBranch("mineral");
        }

        if (
          [
            "start",
            "existing-deposit",
            "new-facility",
            "has-permit",
            "unknown-status",
          ].includes(value.mineralStage)
        ) {
          setMineralStage(
            value.mineralStage as MineralStage
          );
        }

        if (
          value.ordinaryStage === "new"
        ) {
          setOrdinaryStage("new");
        }

        if (value.newUsePurpose) {
          setNewUsePurpose(
            value.newUsePurpose
          );
        }

        if (value.ownerStatus) {
          setOwnerStatus(
            value.ownerStatus
          );
        }

        if (value.settlementStatus) {
          setSettlementStatus(
            value.settlementStatus
          );
        }

        if (value.dailyVolume) {
          setDailyVolume(
            value.dailyVolume
          );
        }

        if (
          typeof value.plannedDepth ===
          "string"
        ) {
          setPlannedDepth(
            value.plannedDepth
          );
        }
      }
    } catch {}
    /* /LEGAL_DIRECT_ENTRY_ROOT_V1 */

    const params =
      new URLSearchParams(
        window.location.search
      );


    const facility =
      params.get("facility");

    if (facility) {
      void loadMineralFacilityLegalContext(
        facility
      );

      return;
    }

    const lat = params.get("lat");
    const lng = params.get("lng");

    if (!lat || !lng) {
      return;
    }

    setLocationLoading(true);

    fetch(
      `/api/legal-location?lat=${encodeURIComponent(
        lat
      )}&lng=${encodeURIComponent(lng)}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Legal location lookup failed."
          );
        }

        return response.json();
      })
      .then((data) => {
        applyLegalLocation(data);

        if (returnToNewMineralFacility) {

          /*
           * The point selected on the map is the
           * location being checked for the planned
           * NEW mineral facility.
           */
          setBranch("mineral");

          setMineralStage(
            "new-facility"
          );

          setNewMineralFacilityLocation(
            data
          );

          setNewMineralFacilityExactPointSelected(
            true
          );
          setNewMineralFacilitySelectedDeposit(null);


          setNewMineralFacilityCandidates(
            []
          );

          setNewMineralFacilityError(
            ""
          );
        }

      })
      .finally(() => {
        setLocationLoading(false);
      });
  }, []);


  /*
   * NEW MINERAL FACILITY:
   * The user has explicitly confirmed a candidate deposit.
   * We now resolve that name against the canonical legal
   * deposit registry and load the legal deposit detail.
   *
   * Proximity itself never assigns the legal regime.
   */
  useEffect(() => {
    const query = String(
      newMineralFacilitySelectedDeposit ||
        ""
    ).trim();

    if (!query) {
      setNewMineralFacilityResolvedDeposit(
        null
      );

      setNewMineralFacilityResolvedDepositError(
        ""
      );

      setNewMineralFacilityResolvedDepositLoading(
        false
      );

      return;
    }

    let cancelled = false;

    async function resolveSelectedDeposit() {
      setNewMineralFacilityResolvedDeposit(
        null
      );

      setNewMineralFacilityResolvedDepositError(
        ""
      );

      setNewMineralFacilityResolvedDepositLoading(
        true
      );

      try {
        /*
         * STEP 1:
         * Resolve the display name selected by the user
         * to a canonical legal deposit ID.
         */
        const searchResponse = await fetch(
          `/api/legal-location?mineral_query=${encodeURIComponent(
            query
          )}`
        );

        if (!searchResponse.ok) {
          throw new Error(
            "Mineral legal search failed."
          );
        }

        const searchData =
          await searchResponse.json();

        const results: MineralDepositSearchResult[] =
          Array.isArray(searchData.results)
            ? searchData.results
            : [];

        const normalizedQuery =
          query
            .trim()
            .toLocaleLowerCase(
              "bg-BG"
            );

        const canonicalMatch =
          results.find(
            (result) =>
              String(
                result.canonicalName ||
                  ""
              )
                .trim()
                .toLocaleLowerCase(
                  "bg-BG"
                ) ===
              normalizedQuery
          ) || null;

        const aliasMatch =
          results.find(
            (result) =>
              Array.isArray(
                result.aliases
              ) &&
              result.aliases.some(
                (alias) =>
                  String(alias || "")
                    .trim()
                    .toLocaleLowerCase(
                      "bg-BG"
                    ) ===
                  normalizedQuery
              )
          ) || null;

        const resolvedMatch =
          canonicalMatch ||
          aliasMatch ||
          (
            results.length === 1
              ? results[0]
              : null
          );

        if (!resolvedMatch) {
          throw new Error(
            "Canonical mineral deposit not resolved."
          );
        }

        /*
         * STEP 2:
         * Load the complete legal record by deposit ID.
         */
        const detailResponse = await fetch(
          `/api/legal-location?mineral_deposit_id=${encodeURIComponent(
            resolvedMatch.depositId
          )}`
        );

        if (!detailResponse.ok) {
          throw new Error(
            "Mineral legal detail failed."
          );
        }

        const detailData =
          await detailResponse.json();

        const deposit:
          MineralDepositDetail | null =
            detailData.deposit || null;

        if (!deposit) {
          throw new Error(
            "Mineral legal detail missing."
          );
        }

        if (!cancelled) {
          setNewMineralFacilityResolvedDeposit(
            deposit
          );
        }
      } catch {
        if (!cancelled) {
          setNewMineralFacilityResolvedDeposit(
            null
          );

          setNewMineralFacilityResolvedDepositError(
            "Избраното находище е потвърдено, но не може да бъде свързано еднозначно с правния регистър. Не се определят автоматично компетентен орган или процедура."
          );
        }
      } finally {
        if (!cancelled) {
          setNewMineralFacilityResolvedDepositLoading(
            false
          );
        }
      }
    }

    void resolveSelectedDeposit();

    return () => {
      cancelled = true;
    };
  }, [
    newMineralFacilitySelectedDeposit,
  ]);

  function openLegalMap() {
    window.sessionStorage.setItem(
      "sondi-legal-new-well",
      JSON.stringify({
        branch,
        ordinaryStage,
        mineralStage,
        newUsePurpose,
        ownerStatus,
        settlementStatus,
        dailyVolume,
        plannedDepth,
      })
    );

    window.location.href =
      "/map?mode=legal&return=%2Flegal";
  }


  function applyLegalLocation(
    data: LegalLocationData
  ) {
    setLegalLocation(data);

    const basinMap: Record<
      string,
      BasinDirectorate
    > = {
      BG1: "danube",
      BG2: "black-sea",
      BG3: "east-aegean",
      BG4: "west-aegean",
    };

    setBasinDirectorate(
      data.basinCode
        ? basinMap[data.basinCode] || null
        : null
    );
  }

  async function searchSettlement() {
    const query =
      settlementQuery.trim();

    if (!query) {
      return;
    }

    setLocationLoading(true);
    setSettlementSearchError("");
    setSettlementCandidates([]);
    setLegalLocation(null);
    setBasinDirectorate(null);

    try {
      const response = await fetch(
        `/api/legal-location?query=${encodeURIComponent(
          query
        )}`
      );

      if (!response.ok) {
        throw new Error(
          "Settlement search failed."
        );
      }

      const data =
        await response.json();

      const candidates =
        Array.isArray(data.candidates)
          ? data.candidates
          : [];

      setSettlementCandidates(
        candidates
      );

      if (candidates.length === 1) {
        applyLegalLocation(
          candidates[0]
        );
      }

      if (candidates.length === 0) {
        setSettlementSearchError(
          "\u041d\u0435 \u043d\u0430\u043c\u0435\u0440\u0438\u0445\u043c\u0435 \u043d\u0430\u0441\u0435\u043b\u0435\u043d\u043e \u043c\u044f\u0441\u0442\u043e. \u041e\u043f\u0438\u0442\u0430\u0439\u0442\u0435 \u0441 \u0438\u043c\u0435 \u0438 \u043e\u0431\u0449\u0438\u043d\u0430."
        );
      }
    } catch {
      setSettlementSearchError(
        "\u0412\u044a\u0437\u043d\u0438\u043a\u043d\u0430 \u0433\u0440\u0435\u0448\u043a\u0430 \u043f\u0440\u0438 \u0442\u044a\u0440\u0441\u0435\u043d\u0435\u0442\u043e."
      );
    } finally {
      setLocationLoading(false);
    }
  }

  function normalizePermitComparisonText(
    value: string
  ) {
    return value
      .toLocaleLowerCase("bg")
      .replace(/[„“"'`]/g, "")
      .replace(/[.,:;()\-–—]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizePermitFacilityText(
    value: string
  ) {
    return value
      .toLocaleLowerCase("bg")
      .replace(/[„“"'`]/g, "")
      .replace(/№/g, "")
      .replace(
        /[^a-zа-я0-9]+/giu,
        ""
      )
      .trim();
  }

  function normalizePermitFacilityCore(
    value: string
  ) {
    return value
      .toLocaleLowerCase("bg")
      .replace(/[„“"'`]/g, "")
      .replace(/№/g, " ")
      .replace(
        /\b(сондаж|сондажа|сондажен|сондажна|водоизточник|водовземно|съоръжение|каптиран|естествен|извор)\b/giu,
        " "
      )
      .replace(
        /[^a-zа-я0-9]+/giu,
        ""
      )
      .trim();
  }

  function getMineralPermitFacilitySignal() {
    const entered =
      mineralPermitFacility.trim();

    const facilities =
      selectedMineralPermit?.permitFacilities ||
      [];

    if (!entered) {
      return null;
    }

    if (facilities.length === 0) {
      return {
        kind: "not-found" as const,

        title:
          "Няма свързани съоръжения за автоматично сравнение",

        text:
          "За избраното находище текущата база не предоставя съоръжения, с които да сравним въведеното наименование. Това не е извод за документа.",

        matches: [] as typeof facilities,
      };
    }

    const enteredNormalized =
      normalizePermitFacilityText(
        entered
      );

    const enteredCore =
      normalizePermitFacilityCore(
        entered
      );

    const exactMatches =
      facilities.filter(
        (facility) => {
          if (!facility.name) {
            return false;
          }

          return (
            normalizePermitFacilityText(
              facility.name
            ) === enteredNormalized
          );
        }
      );

    if (exactMatches.length === 1) {
      const match =
        exactMatches[0];

      return {
        kind: "exact" as const,

        title:
          "Намерено е точно текстово съвпадение",

        text:
          `Въведеното съоръжение съвпада по нормализирано наименование с „${match.name}“ в текущия минерален master.${
            match.sectionName
              ? ` Съоръжението е свързано с участък „${match.sectionName}“.`
              : ""
          } Това е идентификационен сигнал, а не удостоверяване на разрешителното.`,

        matches:
          exactMatches,
      };
    }

    if (exactMatches.length > 1) {
      return {
        kind: "multiple" as const,

        title:
          "Намерени са няколко еднакво изписани съоръжения",

        text:
          "Самото наименование не е достатъчно за еднозначно свързване. Трябва да се сравнят участъкът, населеното място и оригиналният административен акт.",

        matches:
          exactMatches,
      };
    }

    const likelyMatches =
      facilities.filter(
        (facility) => {
          if (!facility.name) {
            return false;
          }

          const facilityNormalized =
            normalizePermitFacilityText(
              facility.name
            );

          const facilityCore =
            normalizePermitFacilityCore(
              facility.name
            );

          if (
            enteredNormalized.length >= 3 &&
            (
              facilityNormalized.includes(
                enteredNormalized
              ) ||
              enteredNormalized.includes(
                facilityNormalized
              )
            )
          ) {
            return true;
          }

          if (
            enteredCore.length >= 3 &&
            facilityCore.length >= 3 &&
            (
              facilityCore.includes(
                enteredCore
              ) ||
              enteredCore.includes(
                facilityCore
              )
            )
          ) {
            return true;
          }

          return false;
        }
      );

    if (likelyMatches.length === 1) {
      const match =
        likelyMatches[0];

      return {
        kind: "likely" as const,

        title:
          "Намерено е вероятно съвпадение",

        text:
          `Въведеното „${entered}“ вероятно съответства на „${match.name}“.${
            match.sectionName
              ? ` В базата то е свързано с участък „${match.sectionName}“.`
              : ""
          } Изписването трябва да се сравни с оригиналния документ преди окончателно свързване.`,

        matches:
          likelyMatches,
      };
    }

    if (likelyMatches.length > 1) {
      return {
        kind: "multiple" as const,

        title:
          "Има няколко възможни съвпадения",

        text:
          "Въведеното наименование прилича на повече от едно съоръжение в избраното находище. Не трябва автоматично да избираме едно от тях.",

        matches:
          likelyMatches,
      };
    }

    return {
      kind: "not-found" as const,

      title:
        "Съоръжението не е намерено по въведеното наименование",

      text:
        `„${entered}“ не съвпада с наименованията на свързаните съоръжения в текущия mineral master. Това не означава, че разрешителното е неправилно — възможно е различно изписване, старо наименование или непълнота в базата.`,

      matches: [] as typeof facilities,
    };
  }

  function getMineralPermitDateSignal() {
    const issueDate =
      mineralPermitIssueDate.trim();

    const expiryDate =
      mineralPermitExpiryDate.trim();

    if (!issueDate && !expiryDate) {
      return null;
    }

    const today =
      new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const issue =
      issueDate
        ? new Date(
            `${issueDate}T00:00:00`
          )
        : null;

    const expiry =
      expiryDate
        ? new Date(
            `${expiryDate}T00:00:00`
          )
        : null;

    if (
      issue &&
      Number.isNaN(
        issue.getTime()
      )
    ) {
      return {
        kind: "review" as const,

        title:
          "Датата на издаване трябва да се провери",

        text:
          "Въведената дата на издаване не може да бъде разчетена надеждно.",
      };
    }

    if (
      expiry &&
      Number.isNaN(
        expiry.getTime()
      )
    ) {
      return {
        kind: "review" as const,

        title:
          "Посоченият срок трябва да се провери",

        text:
          "Въведената дата за край на срока не може да бъде разчетена надеждно.",
      };
    }

    if (
      issue &&
      issue.getTime() >
        today.getTime()
    ) {
      return {
        kind: "review" as const,

        title:
          "Датата на издаване е след днешната дата",

        text:
          "Въведената дата на издаване е в бъдещето. Проверете дали данните са въведени правилно и ги сравнете с оригиналния документ.",
      };
    }

    if (
      issue &&
      expiry &&
      expiry.getTime() <
        issue.getTime()
    ) {
      return {
        kind: "review" as const,

        title:
          "Посоченият край на срока е преди датата на издаване",

        text:
          "Тази комбинация от въведени дати изглежда несъвместима и трябва да бъде сверена с оригиналния административен акт.",
      };
    }

    if (
      expiry &&
      expiry.getTime() <
        today.getTime()
    ) {
      return {
        kind: "past" as const,

        title:
          "Посоченият срок по въведените данни е минал",

        text:
          `Въведеният краен срок е ${expiryDate}. Това е само календарна проверка на въведената дата и не доказва автоматично, че разрешителното е изгубило действие — възможни са изменение, продължаване, нов акт или други последващи обстоятелства.`,
      };
    }

    if (
      expiry &&
      expiry.getTime() ===
        today.getTime()
    ) {
      return {
        kind: "review" as const,

        title:
          "Посоченият срок е днес",

        text:
          "Необходимо е да се провери точният режим на действие на разрешителното и дали има последващ административен акт.",
      };
    }

    if (
      expiry &&
      expiry.getTime() >
        today.getTime()
    ) {
      return {
        kind: "future" as const,

        title:
          "Посоченият срок още не е настъпил",

        text:
          `По въведените данни крайният срок е ${expiryDate}. Това не удостоверява, че разрешителното е действащо — трябва да се проверят оригиналният акт, измененията, титулярът, съоръжението и останалите условия.`,
      };
    }

    if (
      issue &&
      !expiry
    ) {
      return {
        kind: "incomplete" as const,

        title:
          "Има дата на издаване, но няма въведен краен срок",

        text:
          "Не може да се прави извод за срока на разрешителното само от датата на издаване. Проверете как е определен срокът в самия документ.",
      };
    }

    return {
      kind: "incomplete" as const,

      title:
        "Данните за срока са непълни",

      text:
        "Необходима е проверка на оригиналния документ, за да се установи как е определен срокът на разрешителното.",
    };
  }

  function getMineralPermitIssuerSignal() {
    const issuer =
      mineralPermitIssuer.trim();

    const context =
      selectedMineralPermit?.permitContext;

    if (!issuer || !context) {
      return null;
    }

    if (
      context.requiresSectionIdentification
    ) {
      return {
        kind: "section" as const,

        title:
          "Първо трябва да се установи участъкът",

        text:
          "Находището е с различен режим по участъци. Не може надеждно да се сравни издателят на разрешителното, преди да се установи към кой участък се отнася документът.",
      };
    }

    if (
      context.managementStatus ===
        "DELEGATED_TO_MUNICIPALITY" &&
      context.delegatedMunicipality
    ) {
      const issuerNormalized =
        normalizePermitComparisonText(
          issuer
        );

      const municipalityNormalized =
        normalizePermitComparisonText(
          context.delegatedMunicipality
        );

      const municipalityCore =
        municipalityNormalized
          .replace(
            /^община\s+/,
            ""
          )
          .trim();

      const textMatches =
        issuerNormalized.includes(
          municipalityNormalized
        ) ||
        (
          municipalityCore.length >= 3 &&
          issuerNormalized.includes(
            municipalityCore
          )
        );

      if (textMatches) {
        return {
          kind: "match" as const,

          title:
            "Има текстово съвпадение с посочената община",

          text:
            `Въведеният издател съдържа наименованието на община ${context.delegatedMunicipality}. Това е само ориентировъчно текстово съвпадение и не потвърждава валидността или компетентността по конкретното разрешително.`,
        };
      }

      return {
        kind: "review" as const,

        title:
          "Издателят не съвпада по текст с посочената община",

        text:
          `Правният слой съдържа данни за предоставяне на управлението на община ${context.delegatedMunicipality}, а въведеният издател е „${issuer}“. Това не означава автоматично, че разрешителното е неправилно или невалидно, но изисква проверка на оригиналния акт и актуалната компетентност.`,
      };
    }

    if (
      context.managementStatus ===
      "MIXED_LEGAL_REGIME"
    ) {
      return {
        kind: "unresolved" as const,

        title:
          "Не може да се определи един общ компетентен орган",

        text:
          "Находището е с потвърден смесен правен режим. Различни водоизточници или части могат да са под различен режим, затова издателят не трябва да се оценява автоматично без идентифициране на конкретния водоизточник.",
      };
    }

    if (
      context.managementStatus ===
      "TO_RESEARCH"
    ) {
      return {
        kind: "unresolved" as const,

        title:
          "Не може да се направи надеждно сравнение",

        text:
          "Текущият управител на находището не е потвърден с достатъчно официални данни, затова въведеният издател не трябва да се оценява автоматично.",
      };
    }

    if (
      context.managementStatus ===
      "MUNICIPAL"
    ) {
      return {
        kind: "unresolved" as const,

        title:
          "Необходима е проверка на конкретната община",

        text:
          "Находището е класифицирано като общинско, но текущият permit context не съдържа достатъчно надеждно наименование на конкретната община за автоматично текстово сравнение с издателя.",
      };
    }

    return {
      kind: "unresolved" as const,

      title:
        "Необходима е допълнителна проверка",

      text:
        "Наличният управленски статус не е достатъчен за автоматично сравнение на издателя. Данните трябва да се сверят с оригиналния административен акт или официален регистър.",
    };
  }

  async function searchMineralPermitDeposit() {
    const query =
      mineralPermitQuery.trim();

    if (!query) {
      return;
    }

    setMineralPermitLoading(true);
    setMineralPermitError("");

    setMineralPermitNumber("");
    setMineralPermitIssuer("");
    setMineralPermitIssueDate("");
    setMineralPermitExpiryDate("");
    setMineralPermitHolder("");
    setMineralPermitFacility("");
    setMineralPermitResults([]);
    setSelectedMineralPermit(null);

    try {
      const response = await fetch(
        `/api/legal-location?mineral_permit_query=${encodeURIComponent(
          query
        )}`
      );

      if (!response.ok) {
        throw new Error(
          "Mineral permit search failed."
        );
      }

      const data =
        await response.json();

      const results =
        Array.isArray(data.results)
          ? data.results
          : [];

      setMineralPermitResults(
        results
      );

      if (results.length === 0) {
        setMineralPermitError(
          "Не е намерено минерално находище по това име или номер."
        );
      }
    } catch {
      setMineralPermitError(
        "Възникна грешка при проверката на находището."
      );
    } finally {
      setMineralPermitLoading(false);
    }
  }

  async function searchNewMineralFacilityLocation() {
    const query =
      settlementQuery.trim();

    if (!query) {
      return;
    }

    setLocationLoading(true);
    setNewMineralFacilityError("");

    setMineralPermitQuery("");
    setMineralPermitResults([]);
    setSelectedMineralPermit(null);
    setMineralPermitLoading(false);
    setMineralPermitError("");
    setNewMineralFacilityCandidates([]);
    setNewMineralFacilityLocation(null);
    setNewMineralFacilitySelectedDeposit(null);
    setNewMineralFacilityExactPointSelected(false);

    try {
      const response = await fetch(
        `/api/legal-location?query=${encodeURIComponent(
          query
        )}`
      );

      if (!response.ok) {
        throw new Error(
          "Mineral facility location search failed."
        );
      }

      const data =
        await response.json();

      const candidates =
        Array.isArray(data.candidates)
          ? data.candidates
          : [];

      setNewMineralFacilityCandidates(
        candidates
      );

      if (candidates.length === 1) {
        setNewMineralFacilityLocation(
          candidates[0]
        );
      }

      if (candidates.length === 0) {
        setNewMineralFacilityError(
          "Не е намерено населено място. Опитайте с име и община."
        );
      }
    } catch {
      setNewMineralFacilityError(
        "Възникна грешка при проверката на местоположението."
      );
    } finally {
      setLocationLoading(false);
    }
  }

  function selectNewMineralFacilityLocation(
    candidate: SettlementCandidate
  ) {
    setNewMineralFacilityLocation(
      candidate
    );

    setNewMineralFacilityExactPointSelected(
      false
    );


    setNewMineralFacilityCandidates([]);
  }

  async function searchMineralDeposit() {
    const query =
      mineralDepositQuery.trim();

    if (!query) {
      return;
    }

    setMineralDepositLoading(true);
    setMineralDepositError("");

    setNewMineralFacilityLocation(null);
    setNewMineralFacilityCandidates([]);
    setNewMineralFacilityError("");
    setMineralDepositResults([]);
    setSelectedMineralDeposit(null);
    setSelectedMineralFacility(null);
    setSelectedFacilityLegalContext(null);

    try {
      const response = await fetch(
        `/api/legal-location?mineral_query=${encodeURIComponent(
          query
        )}`
      );

      if (!response.ok) {
        throw new Error(
          "Mineral deposit search failed."
        );
      }

      const data =
        await response.json();

      const results =
        Array.isArray(data.results)
          ? data.results
          : [];

      setMineralDepositResults(
        results
      );

      if (results.length === 0) {
        setMineralDepositError(
          "Не е намерено находище или минерално съоръжение по това име или номер."
        );
      }
    } catch {
      setMineralDepositError(
        "Възникна грешка при търсенето на находище или съоръжение."
      );
    } finally {
      setMineralDepositLoading(false);
    }
  }

  async function loadMineralFacilityLegalContext(
    facilityId: string
  ) {
    const id = facilityId.trim();

    if (!id) {
      return;
    }

    setMineralDepositLoading(true);
    setMineralDepositError("");

    try {
      const contextResponse =
        await fetch(
          `/api/legal-location?mineral_facility_id=${encodeURIComponent(
            id
          )}`
        );

      if (!contextResponse.ok) {
        throw new Error(
          "Mineral facility legal context failed."
        );
      }

      const contextData =
        await contextResponse.json();

      const context =
        contextData?.facility || null;

      setSelectedFacilityLegalContext(
        context
      );

      if (
        !context ||
        !context.legal?.depositId
      ) {
        throw new Error(
          "Facility has no resolved legal deposit."
        );
      }

      const depositResponse =
        await fetch(
          `/api/legal-location?mineral_deposit_id=${encodeURIComponent(
            context.legal.depositId
          )}`
        );

      if (!depositResponse.ok) {
        throw new Error(
          "Mineral deposit detail failed."
        );
      }

      const depositData =
        await depositResponse.json();

      const deposit =
        depositData?.deposit || null;

      if (!deposit) {
        throw new Error(
          "Mineral deposit detail missing."
        );
      }

      const detailFacility =
        Array.isArray(deposit.facilities)
          ? deposit.facilities.find(
              (item: any) =>
                item.facilityId === id ||
                item.mineralId === id
            ) || null
          : null;

      const matchedFacility:
        SelectedMineralFacility = {
          mineralId: id,

          name:
            context.identity?.name ||
            detailFacility?.name ||
            null,

          registryNumber:
            context.identity?.registryNumber ||
            detailFacility?.registryNumber ||
            null,

          facilityType:
            context.identity?.facilityType ||
            detailFacility?.facilityType ||
            null,

          settlement:
            context.identity?.settlement ||
            detailFacility?.settlement ||
            null,

          deposit:
            context.identity?.deposit ||
            context.legal?.depositName ||
            null,

          section:
            context.legal?.sectionName ||
            detailFacility?.sectionName ||
            null,

          effectiveManagementStatus:
            context.legal?.effectiveManagementStatus ||
            null,

          effectiveDelegatedMunicipality:
            context.legal?.effectiveDelegatedMunicipality ||
            null,

          effectiveSource:
            context.legal?.effectiveSource === "section"
              ? "section"
              : "deposit",
        };

      setBranch("mineral");
      setMineralStage("existing-deposit");
      setMineralDepositResults([]);
      setSelectedMineralDeposit(deposit);
      setSelectedMineralFacility(matchedFacility);

    } catch {
      setMineralDepositError(
        "Не може да се зареди правната проверка за конкретното съоръжение."
      );
    } finally {
      setMineralDepositLoading(false);
    }
  }

  async function loadMineralDepositDetail(
    depositId: string,
    matchedFacility:
      SelectedMineralFacility | null = null
  ) {
    setMineralDepositLoading(true);
    setMineralDepositError("");

    try {
      const response = await fetch(
        `/api/legal-location?mineral_deposit_id=${encodeURIComponent(
          depositId
        )}`
      );

      if (!response.ok) {
        throw new Error(
          "Mineral deposit detail failed."
        );
      }

      const data =
        await response.json();

      setSelectedMineralDeposit(
        data.deposit || null
      );

      setSelectedMineralFacility(
        matchedFacility
      );

      /* FACILITY_CONTEXT_SYNC_CORRECTED */
      if (matchedFacility?.mineralId) {
        try {
          const facilityContextResponse =
            await fetch(
              `/api/legal-location?mineral_facility_id=${encodeURIComponent(
                matchedFacility.mineralId
              )}`
            );

          if (facilityContextResponse.ok) {
            const facilityContextData =
              await facilityContextResponse.json();

            setSelectedFacilityLegalContext(
              facilityContextData?.facility || null
            );
          } else {
            setSelectedFacilityLegalContext(null);
          }
        } catch {
          setSelectedFacilityLegalContext(null);
        }
      } else {
        setSelectedFacilityLegalContext(null);
      }
    } catch {
      setMineralDepositError(
        "Не може да се зареди подробният правен статус на находището."
      );
    } finally {
      setMineralDepositLoading(false);
    }
  }

  function reset() {
    setBranch(null);
    setOrdinaryStage("start");
    setMineralStage("start");
    setMineralDepositQuery("");
    setMineralDepositResults([]);
    setSelectedMineralDeposit(null);
    setSelectedMineralFacility(null);
    setSelectedFacilityLegalContext(null);
    setMineralDepositLoading(false);
    setMineralDepositError("");
    setNewMineralFacilitySelectedDeposit(null);
    setNewUsePurpose(null);
    setOwnerStatus(null);
    setSettlementStatus(null);
    setDailyVolume(null);
    setPlannedDepth("");
    setBasinDirectorate(null);
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(
        "sondi-legal-new-well"
      );
    }
  }


  /* LEGAL_HIERARCHICAL_BACK_V3 */
  function handleLegalBack() {
    if (typeof window === "undefined") {
      return;
    }

    /*
     * LEGAL_ROOT_BACK_GUARD_V1
     *
     * Any screen inside a selected water branch returns first
     * to the initial /legal choice screen.
     *
     * It must NOT jump back to /map merely because the map
     * happens to be the previous browser document.
     */
    if (
      branch !== null ||
      selectedMineralDeposit ||
      selectedMineralFacility
    ) {
      reset();

      window.history.replaceState(
        {
          sondiLegal: true,
          level: "start",
        },
        "",
        "/legal"
      );

      return;
    }

    /*
     * Only Back from the actual first /legal screen
     * leaves the legal wizard.
     */
    window.location.href = "/";
  }
  /* /LEGAL_HIERARCHICAL_BACK_V3 */

  return (
    <main className="min-h-screen bg-[#f4f8f8] px-4 py-8 text-[#173f48] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={handleLegalBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#42727a] hover:text-[#173f48]"
        >
          {selectedMineralFacility ||
          selectedMineralDeposit ||
          branch !== null
            ? "← Назад"
            : "← SONDI.BG"}
        </button>

        <section className="mt-6 overflow-hidden rounded-[30px] border border-[#d6e5e7] bg-white shadow-[0_22px_70px_rgba(20,63,73,.08)]">
          <div className="bg-[#173f48] px-6 py-8 text-white sm:px-9 sm:py-10">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#a9d3d7]">
              {
                "\u0417\u0410\u041a\u041e\u041d\u041e\u0412\u0410 \u041f\u0420\u041e\u0412\u0415\u0420\u041a\u0410"
              }
            </div>

            <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">
              {
                "\u041a\u0430\u043a\u0432\u043e \u0442\u0440\u044f\u0431\u0432\u0430 \u0434\u0430 \u043d\u0430\u043f\u0440\u0430\u0432\u044f \u043f\u0440\u0435\u0434\u0438 \u0438 \u0441\u043b\u0435\u0434 \u0441\u043e\u043d\u0434\u0430\u0436?"
              }
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#d8ecee] sm:text-base">
              {
                "\u041e\u0442\u0433\u043e\u0432\u043e\u0440\u0435\u0442\u0435 \u043d\u0430 \u043d\u044f\u043a\u043e\u043b\u043a\u043e \u0432\u044a\u043f\u0440\u043e\u0441\u0430. SONDI.BG \u0449\u0435 \u0432\u0438 \u043f\u043e\u043a\u0430\u0436\u0435 \u043f\u0440\u0438\u043b\u043e\u0436\u0438\u043c\u0438\u044f \u0440\u0435\u0436\u0438\u043c, \u0432\u0430\u0448\u0438\u0442\u0435 \u0437\u0430\u0434\u044a\u043b\u0436\u0435\u043d\u0438\u044f, \u0437\u0430\u0434\u044a\u043b\u0436\u0435\u043d\u0438\u044f\u0442\u0430 \u043d\u0430 \u043a\u043e\u043c\u043f\u0435\u0442\u0435\u043d\u0442\u043d\u0430\u0442\u0430 \u0430\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f \u0438 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438\u0442\u0435 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0438."
              }
            </p>
          </div>

          <div className="p-6 sm:p-9">
            <div className="rounded-2xl border border-[#dce9eb] bg-[#f7fbfb] p-5 text-sm leading-6 text-[#587078]">
              <strong className="text-[#274e57]">
                {
                  "\u0422\u0435\u0440\u043c\u0438\u043d\u0438\u0442\u0435 \u0432 \u0441\u0430\u0439\u0442\u0430"
                }
              </strong>
              <div className="mt-2">
                {
                  "\u0412 SONDI.BG \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430\u043c\u0435 \u043e\u0441\u043d\u043e\u0432\u043d\u043e \u0434\u0443\u043c\u0430\u0442\u0430 \u201e\u0441\u043e\u043d\u0434\u0430\u0436\u201c. \u0412 \u0437\u0430\u043a\u043e\u043d\u0438\u0442\u0435 \u0438 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438\u0442\u0435 \u043e\u0431\u0440\u0430\u0437\u0446\u0438 \u043c\u043e\u0436\u0435 \u0434\u0430 \u0441\u0440\u0435\u0449\u043d\u0435\u0442\u0435 \u0438 \u0442\u0435\u0440\u043c\u0438\u043d\u0438\u0442\u0435 \u201e\u043a\u043b\u0430\u0434\u0435\u043d\u0435\u0446\u201c \u0438 \u201e\u0432\u043e\u0434\u043e\u0432\u0437\u0435\u043c\u043d\u043e \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u0435\u201c."
                }
              </div>
            </div>

            {!branch && (
              <section className="mt-8">
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#6b9298]">
                  {
                    "\u0421\u0422\u042a\u041f\u041a\u0410 1"
                  }
                </div>

                <h2 className="mt-2 text-2xl font-bold">
                  {
                    "\u041a\u0430\u043a\u044a\u0432 \u0442\u0438\u043f \u0432\u043e\u0434\u0430 \u0438 \u0441\u043e\u043d\u0434\u0430\u0436 \u0432\u0438 \u0438\u043d\u0442\u0435\u0440\u0435\u0441\u0443\u0432\u0430?"
                  }
                </h2>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() =>
                      setBranch("ordinary")
                    }
                    className="rounded-3xl border-2 border-[#cfe1e3] bg-white p-6 text-left transition hover:border-[#5e9ea5] hover:bg-[#f5fbfb] hover:shadow-lg"
                  >
                    <div className="text-2xl">
                      {"\ud83d\udca7"}
                    </div>

                    <div className="mt-3 text-xl font-bold">
                      {
                        "\u041e\u0431\u0438\u043a\u043d\u043e\u0432\u0435\u043d\u0438 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0438 \u0432\u043e\u0434\u0438"
                      }
                    </div>

                    <p className="mt-2 text-sm leading-6 text-[#617a81]">
                      {
                        "\u0421\u043e\u043d\u0434\u0430\u0436\u0438 \u0437\u0430 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438 \u043f\u043e\u0442\u0440\u0435\u0431\u043d\u043e\u0441\u0442\u0438, \u0441\u0442\u043e\u043f\u0430\u043d\u0441\u043a\u0438 \u0446\u0435\u043b\u0438 \u0438 \u0434\u0440\u0443\u0433\u0438 \u0441\u043b\u0443\u0447\u0430\u0438."
                      }
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setBranch("mineral")
                    }
                    className="rounded-3xl border-2 border-[#d9ddd9] bg-[#fafbfa] p-6 text-left transition hover:border-[#97aaa0] hover:bg-white"
                  >
                    <div className="text-2xl">
                      {"\u2668\ufe0f"}
                    </div>

                    <div className="mt-3 text-xl font-bold">
                      {
                        "\u041c\u0438\u043d\u0435\u0440\u0430\u043b\u043d\u0438 \u0432\u043e\u0434\u0438"
                      }
                    </div>

                    <p className="mt-2 text-sm leading-6 text-[#617a81]">
                      {
                        "\u041e\u0442\u0434\u0435\u043b\u0435\u043d \u0440\u0435\u0436\u0438\u043c, \u043a\u043e\u0439\u0442\u043e \u0449\u0435 \u0431\u044a\u0434\u0435 \u0440\u0430\u0437\u0440\u0430\u0431\u043e\u0442\u0435\u043d \u0441\u0430\u043c\u043e\u0441\u0442\u043e\u044f\u0442\u0435\u043b\u043d\u043e."
                      }
                    </p>
                  </button>
                </div>
              </section>
            )}

            {branch === "ordinary" &&
              ordinaryStage === "start" && (
                <section className="mt-8">
                  <button
                    type="button"
                    onClick={reset}
                    className="text-sm font-semibold text-[#4d7b82] hover:text-[#173f48]"
                  >
                    {
                      "\u2190 \u041d\u0430\u0437\u0430\u0434"
                    }
                  </button>

                  <div className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[#6b9298]">
                    {
                      "\u041e\u0411\u0418\u041a\u041d\u041e\u0412\u0415\u041d\u0418 \u041f\u041e\u0414\u0417\u0415\u041c\u041d\u0418 \u0412\u041e\u0414\u0418 \u00b7 \u0421\u0422\u042a\u041f\u041a\u0410 2"
                    }
                  </div>

                  <h2 className="mt-2 text-2xl font-bold">
                    {
                      "\u0421\u043e\u043d\u0434\u0430\u0436\u044a\u0442 \u0432\u0435\u0447\u0435 \u0438\u0437\u0433\u0440\u0430\u0434\u0435\u043d \u043b\u0438 \u0435?"
                    }
                  </h2>

                  <p className="mt-3 max-w-3xl text-sm leading-6 text-[#617a81]">
                    {
                      "\u0422\u043e\u0432\u0430 \u0435 \u0432\u0430\u0436\u043d\u043e, \u0437\u0430\u0449\u043e\u0442\u043e \u043f\u0440\u043e\u0446\u0435\u0434\u0443\u0440\u0430\u0442\u0430 \u0437\u0430 \u043d\u043e\u0432 \u0441\u043e\u043d\u0434\u0430\u0436 \u0438 \u0440\u0435\u0436\u0438\u043c\u044a\u0442 \u0437\u0430 \u0432\u0435\u0447\u0435 \u0441\u044a\u0449\u0435\u0441\u0442\u0432\u0443\u0432\u0430\u0449\u043e \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u0435 \u043d\u0435 \u0441\u0430 \u0435\u0434\u043d\u043e \u0438 \u0441\u044a\u0449\u043e."
                    }
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNewUsePurpose(null);
                        setOrdinaryStage("new");
                      }}
                      className="rounded-2xl bg-[#16825c] px-5 py-4 font-bold text-white transition hover:bg-[#126d4d]"
                    >
                      {
                        "\u041d\u0435 \u2014 \u043f\u043b\u0430\u043d\u0438\u0440\u0430\u043c \u043d\u043e\u0432 \u0441\u043e\u043d\u0434\u0430\u0436"
                      }
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setExistingRegistration(null);
                        setExistingUse(null);
                        setExistingAge(null);
                        setExistingAction(null);
                        setRepairType(null);
                        setSettlementQuery("");
                        setSettlementCandidates([]);
                        setSettlementSearchError("");
                        setLegalLocation(null);
                        setBasinDirectorate(null);
                        setOrdinaryStage(
                          "existing"
                        );
                      }}
                      className="rounded-2xl border border-[#bfd7da] bg-white px-5 py-4 font-bold text-[#315d65] transition hover:bg-[#f4fafa]"
                    >
                      {
                        "\u0414\u0430 \u2014 \u0441\u043e\u043d\u0434\u0430\u0436\u044a\u0442 \u0432\u0435\u0447\u0435 \u0441\u044a\u0449\u0435\u0441\u0442\u0432\u0443\u0432\u0430"
                      }
                    </button>
                  </div>
                </section>
              )}

            {branch === "ordinary" &&
              ordinaryStage === "new" && (
                <section className="mt-8 rounded-3xl border border-[#cfe4de] bg-[#f4fbf8] p-6 sm:p-7">
                  <button
                    type="button"
                    onClick={() => {
                      setNewUsePurpose(null);
                      setOrdinaryStage("start");
                    }}
                    className="text-sm font-semibold text-[#4d7b82] hover:text-[#173f48]"
                  >
                    {"\u2190 \u041d\u0430\u0437\u0430\u0434"}
                  </button>

                  <div className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[#40806a]">
                    {"\u041d\u041e\u0412 \u0421\u041e\u041d\u0414\u0410\u0416 \u00b7 \u0421\u0422\u042a\u041f\u041a\u0410 3"}
                  </div>

                  <h2 className="mt-2 text-2xl font-bold">
                    {
                      "\u0417\u0430 \u043a\u0430\u043a\u0432\u043e \u0449\u0435 \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430\u0442\u0435 \u0432\u043e\u0434\u0430\u0442\u0430 \u043e\u0442 \u0441\u043e\u043d\u0434\u0430\u0436\u0430?"
                    }
                  </h2>

                  <p className="mt-3 max-w-3xl text-sm leading-6 text-[#57736a]">
                    {
                      "\u0426\u0435\u043b\u0442\u0430 \u043d\u0430 \u0432\u043e\u0434\u043e\u043f\u043e\u043b\u0437\u0432\u0430\u043d\u0435\u0442\u043e \u0435 \u0432\u0430\u0436\u043d\u0430, \u0437\u0430\u0449\u043e\u0442\u043e \u0440\u0435\u0436\u0438\u043c\u044a\u0442 \u0437\u0430 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438 \u043f\u043e\u0442\u0440\u0435\u0431\u043d\u043e\u0441\u0442\u0438 \u043d\u0435 \u0441\u0435 \u043f\u0440\u0438\u043b\u0430\u0433\u0430 \u043f\u043e \u0441\u044a\u0449\u0438\u044f \u043d\u0430\u0447\u0438\u043d \u043f\u0440\u0438 \u0441\u0442\u043e\u043f\u0430\u043d\u0441\u043a\u0430 \u0434\u0435\u0439\u043d\u043e\u0441\u0442."
                    }
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {[
                      [
                        "household",
                        "\u0417\u0430 \u0434\u043e\u043c\u0430\u043a\u0438\u043d\u0441\u0442\u0432\u043e\u0442\u043e",
                        "\u0412\u043e\u0434\u0430 \u0437\u0430 \u0431\u0438\u0442\u043e\u0432\u0438 \u0438 \u043b\u0438\u0447\u043d\u0438 \u043d\u0443\u0436\u0434\u0438.",
                      ],
                      [
                        "irrigation",
                        "\u0417\u0430 \u043f\u043e\u043b\u0438\u0432\u0430\u043d\u0435 \u0432 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438\u044f \u0438\u043c\u043e\u0442",
                        "\u0413\u0440\u0430\u0434\u0438\u043d\u0430, \u0434\u0432\u043e\u0440 \u0438\u043b\u0438 \u0434\u0440\u0443\u0433\u0438 \u043b\u0438\u0447\u043d\u0438 \u043d\u0435\u0441\u0442\u043e\u043f\u0430\u043d\u0441\u043a\u0438 \u043d\u0443\u0436\u0434\u0438.",
                      ],
                      [
                        "animals",
                        "\u0417\u0430 \u0432\u043e\u0434\u043e\u043f\u043e\u0439 \u043d\u0430 \u043c\u043e\u0438 \u0436\u0438\u0432\u043e\u0442\u043d\u0438",
                        "\u0412\u043e\u0434\u043e\u043f\u043e\u0439 \u0437\u0430 \u043b\u0438\u0447\u043d\u0438 \u043d\u0435\u0441\u0442\u043e\u043f\u0430\u043d\u0441\u043a\u0438 \u043d\u0443\u0436\u0434\u0438.",
                      ],
                      [
                        "combined",
                        "\u041a\u043e\u043c\u0431\u0438\u043d\u0430\u0446\u0438\u044f \u043e\u0442 \u0433\u043e\u0440\u043d\u0438\u0442\u0435",
                        "\u041d\u0430\u043f\u0440\u0438\u043c\u0435\u0440 \u0434\u043e\u043c\u0430\u043a\u0438\u043d\u0441\u0442\u0432\u043e \u0438 \u043f\u043e\u043b\u0438\u0432\u0430\u043d\u0435.",
                      ],
                      [
                        "business",
                        "\u0417\u0430 \u0431\u0438\u0437\u043d\u0435\u0441, \u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0441\u0442\u0432\u043e, \u0443\u0441\u043b\u0443\u0433\u0430, \u043f\u0440\u043e\u0444\u0435\u0441\u0438\u044f \u0438\u043b\u0438 \u0437\u0430\u043d\u0430\u044f\u0442",
                        "\u0421\u0442\u043e\u043f\u0430\u043d\u0441\u043a\u043e \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430\u043d\u0435 \u043d\u0430 \u0432\u043e\u0434\u0430\u0442\u0430.",
                      ],
                      [
                        "other",
                        "\u0414\u0440\u0443\u0433\u043e",
                        "\u0410\u043a\u043e \u043d\u0435 \u0441\u0442\u0435 \u0441\u0438\u0433\u0443\u0440\u043d\u0438 \u0432 \u043a\u043e\u044f \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f \u043f\u043e\u043f\u0430\u0434\u0430 \u0446\u0435\u043b\u0442\u0430.",
                      ],
                    ].map(([value, title, description]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setNewUsePurpose(
                            value as NewUsePurpose
                          );
                          setOwnerStatus(null);
                          setSettlementStatus(null);
                          setDailyVolume(null);
                          setPlannedDepth("");
                        }}
                        className={[
                          "rounded-2xl border p-5 text-left transition",
                          newUsePurpose === value
                            ? "border-[#4e9e84] bg-white shadow-[0_10px_30px_rgba(36,113,88,.10)]"
                            : "border-[#cfe1dc] bg-white/70 hover:border-[#7db5a2] hover:bg-white",
                        ].join(" ")}
                      >
                        <div className="font-bold text-[#234f46]">
                          {title}
                        </div>
                        <div className="mt-2 text-sm leading-6 text-[#617a73]">
                          {description}
                        </div>
                      </button>
                    ))}
                  </div>

                  {newUsePurpose === "business" && (
                    <div className="mt-6 space-y-5">
                      <div className="rounded-2xl border border-[#dfc8a9] bg-[#fff9f1] p-5">
                        <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#8c6d3e]">
                          {
                            "\u0420\u0410\u0417\u0420\u0415\u0428\u0418\u0422\u0415\u041b\u0415\u041d \u0420\u0415\u0416\u0418\u041c"
                          }
                        </div>

                        <h3 className="mt-2 text-lg font-bold text-[#684f2c]">
                          {
                            "\u0417\u0430 \u043d\u043e\u0432 \u0441\u043e\u043d\u0434\u0430\u0436 \u0437\u0430 \u0431\u0438\u0437\u043d\u0435\u0441 \u043f\u044a\u0440\u0432\u043e \u0441\u0435 \u0438\u0441\u043a\u0430 \u0440\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u0435\u043b\u043d\u043e."
                          }
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-[#74664e]">
                          {
                            "\u0417\u0430 \u0432\u043e\u0434\u043e\u0432\u0437\u0435\u043c\u0430\u043d\u0435 \u043e\u0442 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0438 \u0432\u043e\u0434\u0438 \u0447\u0440\u0435\u0437 \u043d\u043e\u0432\u043e \u0432\u043e\u0434\u043e\u0432\u0437\u0435\u043c\u043d\u043e \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u0435 \u0441\u0435 \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430 \u041e\u0431\u0440\u0430\u0437\u0435\u0446 14."
                          }
                        </p>

                        <div className="mt-4 rounded-xl border border-[#e4d6bd] bg-white p-4">
                          <div className="font-bold text-[#684f2c]">
                            {
                              "\u041a\u0430\u043a\u0432\u043e \u0449\u0435 \u0431\u044a\u0434\u0435 \u043f\u0440\u043e\u0432\u0435\u0440\u0435\u043d\u043e:"
                            }
                          </div>

                          <ul className="mt-3 space-y-2 text-sm leading-6 text-[#74664e]">
                            <li>{"\u2022 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u043e\u0442\u043e \u0432\u043e\u0434\u043d\u043e \u0442\u044f\u043b\u043e"}</li>
                            <li>{"\u2022 \u0441\u0432\u043e\u0431\u043e\u0434\u043d\u0438\u044f\u0442 \u0432\u043e\u0434\u0435\u043d \u0440\u0435\u0441\u0443\u0440\u0441"}</li>
                            <li>{"\u2022 \u0438\u0441\u043a\u0430\u043d\u043e\u0442\u043e \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u0438 \u0446\u0435\u043b\u0442\u0430 \u043d\u0430 \u0432\u043e\u0434\u043e\u0432\u0437\u0435\u043c\u0430\u043d\u0435"}</li>
                            <li>{"\u2022 \u043c\u044f\u0441\u0442\u043e\u0442\u043e, \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430\u0442\u0430 \u0438 \u043f\u0440\u043e\u0435\u043a\u0442\u0438\u0440\u0430\u043d\u043e\u0442\u043e \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u0435"}</li>
                            <li>{"\u2022 \u0437\u043e\u043d\u0438\u0442\u0435 \u0437\u0430 \u0437\u0430\u0449\u0438\u0442\u0430 \u043d\u0430 \u0432\u043e\u0434\u0438\u0442\u0435 \u0438 \u0434\u0440\u0443\u0433\u0438\u0442\u0435 \u043e\u0433\u0440\u0430\u043d\u0438\u0447\u0435\u043d\u0438\u044f"}</li>
                          </ul>
                        </div>

                        <div className="mt-4 rounded-xl border border-[#d5e0e1] bg-[#f8fbfb] p-4">
                          <div className="font-bold text-[#355d62]">
                            {
                              "\u0412\u044a\u0432\u0435\u0434\u0435\u0442\u0435 \u043d\u0430\u0441\u0435\u043b\u0435\u043d\u043e\u0442\u043e \u043c\u044f\u0441\u0442\u043e:"
                            }
                          </div>

                          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                            <input
                              type="text"
                              value={settlementQuery}
                              onChange={(event) =>
                                setSettlementQuery(event.target.value)
                              }
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  searchSettlement();
                                }
                              }}
                              placeholder={"\u041d\u0430\u043f\u0440. \u041f\u043b\u043e\u0432\u0434\u0438\u0432"}
                              className="min-w-0 flex-1 rounded-xl border border-[#c4dada] bg-white px-4 py-3 text-[#294f52]"
                            />

                            <button
                              type="button"
                              onClick={searchSettlement}
                              disabled={!settlementQuery.trim() || locationLoading}
                              className="rounded-xl bg-[#176f80] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
                            >
                              {locationLoading
                                ? "\u0422\u044a\u0440\u0441\u0435\u043d\u0435..."
                                : "\u041f\u0440\u043e\u0432\u0435\u0440\u0438"}
                            </button>
                          </div>

                          {settlementCandidates.length > 1 &&
                            !legalLocation && (
                              <div className="mt-4 space-y-2">
                                {settlementCandidates.map(
                                  (candidate, index) => (
                                    <button
                                      key={`${candidate.lat}-${candidate.lng}-${index}`}
                                      type="button"
                                      onClick={() =>
                                        applyLegalLocation(candidate)
                                      }
                                      className="block w-full rounded-xl border border-[#c5ddd4] bg-white px-4 py-3 text-left text-sm"
                                    >
                                      {candidate.label}
                                    </button>
                                  )
                                )}
                              </div>
                            )}

                          {legalLocation && (
                            <div className="mt-4 rounded-xl border border-[#a7cfc1] bg-white p-4">
                              <div className="font-bold text-[#285a4c]">
                                {legalLocation.basinName}
                              </div>

                              {legalLocation.formNewWellPermitUrl && (
                                <a
                                  href={legalLocation.formNewWellPermitUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-4 inline-flex rounded-xl bg-[#9a6b26] px-5 py-3 text-sm font-bold text-white"
                                >
                                  {
                                    "\u0418\u0437\u0442\u0435\u0433\u043b\u0438 \u041e\u0431\u0440\u0430\u0437\u0435\u0446 14"
                                  }
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {newUsePurpose &&
                    newUsePurpose !== "business" && (
                      <div className="mt-7 space-y-6">

                        <div className="rounded-2xl border border-[#bcded2] bg-white p-5">
                          <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#4f8b76]">
                            {"\u0421\u0422\u042a\u041f\u041a\u0410 4"}
                          </div>

                          <h3 className="mt-2 text-lg font-bold text-[#234f46]">
                            {
                              "\u0412\u0438\u0435 \u0438\u043b\u0438 \u043b\u0438\u0446\u0435\u0442\u043e, \u043a\u043e\u0435\u0442\u043e \u0449\u0435 \u043f\u043e\u0434\u0430\u0434\u0435 \u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u0435\u0442\u043e, \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438\u043a \u043d\u0430 \u0438\u043c\u043e\u0442\u0430 \u043b\u0438 \u0435?"
                            }
                          </h3>

                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <button
                              type="button"
                              onClick={() => {
                                setOwnerStatus("owner");
                                setSettlementStatus(null);
                                setDailyVolume(null);
                                setPlannedDepth("");
                              }}
                              className={[
                                "rounded-xl border px-4 py-3 font-semibold transition",
                                ownerStatus === "owner"
                                  ? "border-[#4e9e84] bg-[#eef9f5] text-[#23594a]"
                                  : "border-[#cfe1dc] bg-white text-[#315d54]",
                              ].join(" ")}
                            >
                              {"\u0414\u0430"}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setOwnerStatus("not-owner");
                                setSettlementStatus(null);
                                setDailyVolume(null);
                                setPlannedDepth("");
                              }}
                              className={[
                                "rounded-xl border px-4 py-3 font-semibold transition",
                                ownerStatus === "not-owner"
                                  ? "border-[#d39b78] bg-[#fff7f1] text-[#805036]"
                                  : "border-[#cfe1dc] bg-white text-[#315d54]",
                              ].join(" ")}
                            >
                              {"\u041d\u0435"}
                            </button>
                          </div>

                          {ownerStatus === "not-owner" && (
                            <div className="mt-4 rounded-xl border border-[#e4c9b7] bg-[#fff8f3] p-4 text-sm leading-6 text-[#765746]">
                              {
                                "\u0417\u0430 \u043d\u0430\u043c\u0435\u0440\u0435\u043d\u0438\u0435\u0442\u043e \u0437\u0430 \u0438\u0437\u0433\u0440\u0430\u0436\u0434\u0430\u043d\u0435 \u043d\u0430 \u0441\u043e\u043d\u0434\u0430\u0436 \u041d\u0430\u0440\u0435\u0434\u0431\u0430 \u2116 1 \u043f\u0440\u0435\u0434\u0432\u0438\u0436\u0434\u0430 \u043f\u0438\u0441\u043c\u0435\u043d\u043e \u0443\u0432\u0435\u0434\u043e\u043c\u044f\u0432\u0430\u043d\u0435 \u043e\u0442 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438\u043a\u0430 \u043d\u0430 \u043f\u043e\u0437\u0435\u043c\u043b\u0435\u043d\u0438\u044f \u0438\u043c\u043e\u0442. \u041d\u0443\u0436\u043d\u043e \u0435 \u0443\u0447\u0430\u0441\u0442\u0438\u0435\u0442\u043e \u043d\u0430 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438\u043a\u0430."
                              }
                            </div>
                          )}
                        </div>

                        {ownerStatus === "owner" && (
                          <div className="rounded-2xl border border-[#bcded2] bg-white p-5">
                            <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#4f8b76]">
                              {"\u0421\u0422\u042a\u041f\u041a\u0410 5"}
                            </div>

                            <h3 className="mt-2 text-lg font-bold text-[#234f46]">
                              {
                                "\u0418\u043c\u043e\u0442\u044a\u0442 \u043d\u0430\u043c\u0438\u0440\u0430 \u043b\u0438 \u0441\u0435 \u0432 \u0433\u0440\u0430\u043d\u0438\u0446\u0438\u0442\u0435 \u043d\u0430 \u043d\u0430\u0441\u0435\u043b\u0435\u043d\u043e \u043c\u044f\u0441\u0442\u043e \u0438\u043b\u0438 \u0441\u0435\u043b\u0438\u0449\u043d\u043e \u043e\u0431\u0440\u0430\u0437\u0443\u0432\u0430\u043d\u0438\u0435?"
                              }
                            </h3>

                            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                              {[
                                ["yes", "\u0414\u0430"],
                                ["no", "\u041d\u0435"],
                                ["unknown", "\u041d\u0435 \u0441\u044a\u043c \u0441\u0438\u0433\u0443\u0440\u0435\u043d"],
                              ].map(([value, label]) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => {
                                    setSettlementStatus(
                                      value as SettlementStatus
                                    );
                                    setDailyVolume(null);
                                    setPlannedDepth("");
                                  }}
                                  className={[
                                    "rounded-xl border px-4 py-3 font-semibold transition",
                                    settlementStatus === value
                                      ? "border-[#4e9e84] bg-[#eef9f5] text-[#23594a]"
                                      : "border-[#cfe1dc] bg-white text-[#315d54]",
                                  ].join(" ")}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>

                            {settlementStatus === "no" && (
                              <div className="mt-4 rounded-xl border border-[#e4c9b7] bg-[#fff8f3] p-4 text-sm leading-6 text-[#765746]">
                                {
                                  "\u041e\u0431\u043b\u0435\u043a\u0447\u0435\u043d\u0438\u044f\u0442 \u0440\u0435\u0436\u0438\u043c \u0437\u0430 \u0431\u0435\u0437\u0432\u044a\u0437\u043c\u0435\u0437\u0434\u043d\u043e \u0432\u043e\u0434\u043e\u0432\u0437\u0435\u043c\u0430\u043d\u0435 \u0434\u043e 10 m\u00b3/\u0434\u0435\u043d \u0437\u0430 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438 \u043f\u043e\u0442\u0440\u0435\u0431\u043d\u043e\u0441\u0442\u0438 \u0435 \u043e\u0431\u0432\u044a\u0440\u0437\u0430\u043d \u0441 \u0438\u043c\u043e\u0442\u0438 \u0432 \u0433\u0440\u0430\u043d\u0438\u0446\u0438\u0442\u0435 \u043d\u0430 \u043d\u0430\u0441\u0435\u043b\u0435\u043d\u0438 \u043c\u0435\u0441\u0442\u0430 \u0438 \u0441\u0435\u043b\u0438\u0449\u043d\u0438 \u043e\u0431\u0440\u0430\u0437\u0443\u0432\u0430\u043d\u0438\u044f. \u0422\u043e\u0437\u0438 \u0441\u043b\u0443\u0447\u0430\u0439 \u0442\u0440\u044f\u0431\u0432\u0430 \u0434\u0430 \u0441\u0435 \u043f\u0440\u043e\u0432\u0435\u0440\u0438 \u043f\u043e \u0434\u0440\u0443\u0433 \u0440\u0435\u0436\u0438\u043c."
                                }
                              </div>
                            )}
                          </div>
                        )}

                        {settlementStatus === "yes" && (
                          <div className="rounded-2xl border border-[#bcded2] bg-white p-5">
                            <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#4f8b76]">
                              {"\u0421\u0422\u042a\u041f\u041a\u0410 6"}
                            </div>

                            <h3 className="mt-2 text-lg font-bold text-[#234f46]">
                              {
                                "\u041e\u0447\u0430\u043a\u0432\u0430\u0442\u0435 \u043b\u0438 \u0434\u0430 \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430\u0442\u0435 \u0434\u043e 10 m\u00b3 \u0432\u043e\u0434\u0430 \u0437\u0430 \u0434\u0435\u043d\u043e\u043d\u043e\u0449\u0438\u0435?"
                              }
                            </h3>

                            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                              {[
                                ["up-to-10", "\u0414\u0430, \u0434\u043e 10 m\u00b3/\u0434\u0435\u043d"],
                                ["over-10", "\u041d\u0430\u0434 10 m\u00b3/\u0434\u0435\u043d"],
                                ["unknown", "\u041d\u0435 \u0437\u043d\u0430\u043c"],
                              ].map(([value, label]) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => {
                                    setDailyVolume(
                                      value as DailyVolume
                                    );
                                    setPlannedDepth("");
                                  }}
                                  className={[
                                    "rounded-xl border px-4 py-3 font-semibold transition",
                                    dailyVolume === value
                                      ? "border-[#4e9e84] bg-[#eef9f5] text-[#23594a]"
                                      : "border-[#cfe1dc] bg-white text-[#315d54]",
                                  ].join(" ")}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>

                            {dailyVolume === "over-10" && (
                              <div className="mt-4 rounded-xl border border-[#dfc8a9] bg-[#fff9f1] p-5">
                                <div className="font-bold text-[#684f2c]">
                                  {
                                    "\u041d\u0430\u0434 10 m\u00b3/\u0434\u0435\u043d \u043d\u0435 \u0441\u0435 \u043f\u0440\u0438\u043b\u0430\u0433\u0430 \u043e\u0431\u043b\u0435\u043a\u0447\u0435\u043d\u0438\u044f\u0442 \u0440\u0435\u0436\u0438\u043c."
                                  }
                                </div>

                                <p className="mt-2 text-sm leading-6 text-[#74664e]">
                                  {
                                    "\u0417\u0430 \u043d\u043e\u0432 \u0441\u043e\u043d\u0434\u0430\u0436 \u0441\u0435 \u043f\u0440\u0435\u043c\u0438\u043d\u0430\u0432\u0430 \u043a\u044a\u043c \u0440\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u0435\u043b\u0435\u043d \u0440\u0435\u0436\u0438\u043c \u0441 \u041e\u0431\u0440\u0430\u0437\u0435\u0446 14."
                                  }
                                </p>

                                <div className="mt-3 text-sm leading-6 text-[#74664e]">
                                  {
                                    "\u041f\u0440\u043e\u0432\u0435\u0440\u044f\u0432\u0430\u0442 \u0441\u0435 \u0432\u043e\u0434\u043d\u043e\u0442\u043e \u0442\u044f\u043b\u043e, \u0441\u0432\u043e\u0431\u043e\u0434\u043d\u0438\u044f\u0442 \u0440\u0435\u0441\u0443\u0440\u0441, \u0438\u0441\u043a\u0430\u043d\u043e\u0442\u043e \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e, \u043c\u044f\u0441\u0442\u043e\u0442\u043e \u043d\u0430 \u0441\u043e\u043d\u0434\u0430\u0436\u0430 \u0438 \u0434\u0435\u0439\u0441\u0442\u0432\u0430\u0449\u0438\u0442\u0435 \u0437\u043e\u043d\u0438 \u0438 \u043e\u0433\u0440\u0430\u043d\u0438\u0447\u0435\u043d\u0438\u044f."
                                  }
                                </div>

                                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                  <input
                                    type="text"
                                    value={settlementQuery}
                                    onChange={(event) =>
                                      setSettlementQuery(event.target.value)
                                    }
                                    placeholder={"\u0412\u044a\u0432\u0435\u0434\u0435\u0442\u0435 \u043d\u0430\u0441\u0435\u043b\u0435\u043d\u043e \u043c\u044f\u0441\u0442\u043e"}
                                    className="min-w-0 flex-1 rounded-xl border border-[#dccfb9] bg-white px-4 py-3"
                                  />

                                  <button
                                    type="button"
                                    onClick={searchSettlement}
                                    disabled={!settlementQuery.trim() || locationLoading}
                                    className="rounded-xl bg-[#176f80] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
                                  >
                                    {
                                      "\u041e\u043f\u0440\u0435\u0434\u0435\u043b\u0438 \u0411\u0430\u0441\u0435\u0439\u043d\u043e\u0432\u0430\u0442\u0430 \u0434\u0438\u0440\u0435\u043a\u0446\u0438\u044f"
                                    }
                                  </button>
                                </div>

                                {settlementCandidates.length > 1 &&
                                  !legalLocation && (
                                    <div className="mt-3 space-y-2">
                                      {settlementCandidates.map(
                                        (candidate, index) => (
                                          <button
                                            key={`${candidate.lat}-${candidate.lng}-${index}`}
                                            type="button"
                                            onClick={() =>
                                              applyLegalLocation(candidate)
                                            }
                                            className="block w-full rounded-xl border border-[#d9d3c7] bg-white px-4 py-3 text-left text-sm"
                                          >
                                            {candidate.label}
                                          </button>
                                        )
                                      )}
                                    </div>
                                  )}

                                {legalLocation?.formNewWellPermitUrl && (
                                  <div className="mt-4">
                                    <div className="font-bold text-[#684f2c]">
                                      {legalLocation.basinName}
                                    </div>

                                    <a
                                      href={legalLocation.formNewWellPermitUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="mt-3 inline-flex rounded-xl bg-[#9a6b26] px-5 py-3 text-sm font-bold text-white"
                                    >
                                      {
                                        "\u0418\u0437\u0442\u0435\u0433\u043b\u0438 \u041e\u0431\u0440\u0430\u0437\u0435\u0446 14"
                                      }
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {(dailyVolume === "up-to-10" ||
                          dailyVolume === "unknown") && (
                          <div className="rounded-2xl border border-[#bcded2] bg-white p-5">
                            <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#4f8b76]">
                              {"\u0421\u0422\u042a\u041f\u041a\u0410 7"}
                            </div>

                            <h3 className="mt-2 text-lg font-bold text-[#234f46]">
                              {
                                "\u041a\u0430\u043a\u0432\u0430 \u0435 \u043f\u043b\u0430\u043d\u0438\u0440\u0430\u043d\u0430\u0442\u0430 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430 \u043d\u0430 \u0441\u043e\u043d\u0434\u0430\u0436\u0430?"
                              }
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-[#617a73]">
                              {
                                "\u041f\u0440\u0435\u0434\u0432\u0438\u0434\u0435\u043d\u0430\u0442\u0430 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430 \u0441\u0435 \u043f\u043e\u0441\u043e\u0447\u0432\u0430 \u0432 \u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u0435\u0442\u043e \u0437\u0430 \u043d\u0430\u043c\u0435\u0440\u0435\u043d\u0438\u0435 \u0437\u0430 \u0438\u0437\u0433\u0440\u0430\u0436\u0434\u0430\u043d\u0435."
                              }
                            </p>

                            {/* QUANTITY_UNKNOWN_CONTINUES */}
                            {dailyVolume === "unknown" && (
                              <div className="mt-4 rounded-xl border border-[#d6e5df] bg-[#f7fbf9] p-4 text-sm leading-6 text-[#557168]">
                                {
                                  "\u041f\u0440\u043e\u0434\u044a\u043b\u0436\u0430\u0432\u0430\u043c\u0435 \u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0430\u0442\u0430. \u041a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e\u0442\u043e \u0432\u043e\u0434\u0430 \u043e\u0441\u0442\u0430\u0432\u0430 \u0437\u0430 \u0434\u043e\u0443\u0442\u043e\u0447\u043d\u044f\u0432\u0430\u043d\u0435 \u0441\u043f\u0440\u044f\u043c\u043e \u0433\u0440\u0430\u043d\u0438\u0446\u0430\u0442\u0430 \u043e\u0442 10 m\u00b3/\u0434\u0435\u043d."
                                }
                              </div>
                            )}
                            <div className="mt-4 flex max-w-sm items-center gap-3">
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={plannedDepth}
                                onChange={(event) => {
                                  setPlannedDepth(
                                    event.target.value
                                  );
                                  setBasinDirectorate(null);
                                }}
                                placeholder={"\u041d\u0430\u043f\u0440. 40"}
                                className="w-full rounded-xl border border-[#bfd9d2] bg-white px-4 py-3 text-[#234f46] outline-none focus:border-[#4e9e84]"
                              />
                              <span className="font-semibold text-[#5c7770]">
                                m
                              </span>
                            </div>

                            {plannedDepth && (
                              <div className="mt-5 rounded-xl border border-[#c7dde4] bg-[#f4fafc] p-4">
                                <div className="font-bold text-[#315d68]">
                                  {
                                    "\u0412\u0430\u0436\u043d\u043e \u0437\u0430 \u0411\u0430\u0441\u0435\u0439\u043d\u043e\u0432\u0430\u0442\u0430 \u0434\u0438\u0440\u0435\u043a\u0446\u0438\u044f"
                                  }
                                </div>
                                <p className="mt-2 text-sm leading-6 text-[#58727a]">
                                  {
                                    "\u0410\u043a\u043e \u0437\u0430\u044f\u0432\u0435\u043d\u0430\u0442\u0430 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430 \u043d\u0435 \u043e\u0442\u0433\u043e\u0432\u0430\u0440\u044f \u043d\u0430 \u043d\u043e\u0440\u043c\u0430\u0442\u0438\u0432\u043d\u0438\u0442\u0435 \u0438\u0437\u0438\u0441\u043a\u0432\u0430\u043d\u0438\u044f, \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440\u044a\u0442 \u043d\u0430 \u0411\u0430\u0441\u0435\u0439\u043d\u043e\u0432\u0430\u0442\u0430 \u0434\u0438\u0440\u0435\u043a\u0446\u0438\u044f \u0435 \u0434\u043b\u044a\u0436\u0435\u043d \u0432 \u0441\u0440\u043e\u043a \u0434\u043e 2 \u0434\u043d\u0438 \u043e\u0442 \u043f\u043e\u043b\u0443\u0447\u0430\u0432\u0430\u043d\u0435 \u043d\u0430 \u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u0435\u0442\u043e \u0434\u0430 \u0443\u0432\u0435\u0434\u043e\u043c\u0438 \u0433\u0440\u0430\u0436\u0434\u0430\u043d\u0438\u043d\u0430 \u043f\u043e \u0442\u0435\u043b\u0435\u0444\u043e\u043d\u0430 \u0438 \u043f\u0438\u0441\u043c\u0435\u043d\u043e \u0438 \u0434\u0430 \u043f\u043e\u0441\u043e\u0447\u0438 \u0434\u043e\u043f\u0443\u0441\u0442\u0438\u043c\u0430\u0442\u0430 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430."
                                  }
                                </p>
                              </div>
                            )}

                            {plannedDepth && (
                              <div className="mt-6 space-y-5">

                                <div className="rounded-2xl border border-[#98c9b7] bg-[#edf9f4] p-5">
                                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#3d8069]">
                                    {"\u0421\u0422\u042a\u041f\u041a\u0410 8"}
                                  </div>

                                  <h3 className="mt-2 text-lg font-bold text-[#205443]">
                                    {
                                      "\u041a\u044a\u0434\u0435 \u0441\u0435 \u043d\u0430\u043c\u0438\u0440\u0430 \u0438\u043c\u043e\u0442\u044a\u0442?"
                                    }
                                  </h3>

                                  <p className="mt-2 text-sm leading-6 text-[#527067]">
                                    {
                                      "\u0412\u044a\u0432\u0435\u0434\u0435\u0442\u0435 \u043d\u0430\u0441\u0435\u043b\u0435\u043d\u043e\u0442\u043e \u043c\u044f\u0441\u0442\u043e. SONDI.BG \u0449\u0435 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u0438 \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u043d\u043e \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u043e\u0442\u043e \u0432\u043e\u0434\u043d\u043e \u0442\u044f\u043b\u043e \u0438 \u043a\u043e\u043c\u043f\u0435\u0442\u0435\u043d\u0442\u043d\u0430\u0442\u0430 \u0411\u0430\u0441\u0435\u0439\u043d\u043e\u0432\u0430 \u0434\u0438\u0440\u0435\u043a\u0446\u0438\u044f."
                                    }
                                  </p>

                                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                    <input
                                      type="text"
                                      value={settlementQuery}
                                      onChange={(event) => {
                                        setSettlementQuery(
                                          event.target.value
                                        );
                                      }}
                                      onKeyDown={(event) => {
                                        if (
                                          event.key === "Enter"
                                        ) {
                                          event.preventDefault();
                                          searchSettlement();
                                        }
                                      }}
                                      placeholder={
                                        "\u041d\u0430\u043f\u0440. \u041f\u043b\u043e\u0432\u0434\u0438\u0432, \u0411\u0435\u043b\u0438\u0446\u0430, \u0411\u0435\u0440\u043a\u043e\u0432\u0438\u0446\u0430"
                                      }
                                      className="min-w-0 flex-1 rounded-xl border border-[#bfd9d2] bg-white px-4 py-3 text-[#234f46] outline-none focus:border-[#4e9e84]"
                                    />

                                    <button
                                      type="button"
                                      onClick={searchSettlement}
                                      disabled={
                                        !settlementQuery.trim() ||
                                        locationLoading
                                      }
                                      className="rounded-xl bg-[#176f80] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#125c6a] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      {locationLoading
                                        ? "\u0422\u044a\u0440\u0441\u0435\u043d\u0435..."
                                        : "\u041f\u0440\u043e\u0432\u0435\u0440\u0438"}
                                    </button>
                                  </div>

                                  {settlementSearchError && (
                                    <div className="mt-3 rounded-xl border border-[#e4c9b7] bg-[#fff8f3] p-4 text-sm text-[#765746]">
                                      {settlementSearchError}
                                    </div>
                                  )}

                                  {settlementCandidates.length > 1 &&
                                    !legalLocation && (
                                      <div className="mt-4 space-y-2">
                                        <div className="text-sm font-bold text-[#456b60]">
                                          {
                                            "\u0418\u0437\u0431\u0435\u0440\u0435\u0442\u0435 \u043f\u0440\u0430\u0432\u0438\u043b\u043d\u043e\u0442\u043e \u043d\u0430\u0441\u0435\u043b\u0435\u043d\u043e \u043c\u044f\u0441\u0442\u043e:"
                                          }
                                        </div>

                                        {settlementCandidates.map(
                                          (
                                            candidate,
                                            index
                                          ) => (
                                            <button
                                              key={`${candidate.lat}-${candidate.lng}-${index}`}
                                              type="button"
                                              onClick={() =>
                                                applyLegalLocation(
                                                  candidate
                                                )
                                              }
                                              className="block w-full rounded-xl border border-[#c5ddd4] bg-white px-4 py-3 text-left text-sm text-[#315d54] transition hover:border-[#7eb8a4] hover:bg-[#f8fcfa]"
                                            >
                                              {candidate.label}
                                            </button>
                                          )
                                        )}
                                      </div>
                                    )}

                                  {legalLocation && (
                                    <div className="mt-5 rounded-xl border border-[#9bcbb9] bg-white p-5">
                                      <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#518371]">
                                        {
                                          "\u041e\u041f\u0420\u0415\u0414\u0415\u041b\u0415\u041d\u041e \u0410\u0412\u0422\u041e\u041c\u0410\u0422\u0418\u0427\u041d\u041e"
                                        }
                                      </div>

                                      <div className="mt-2 text-lg font-bold text-[#234f46]">
                                        {legalLocation.basinName}
                                      </div>

                                      <div className="mt-2 text-sm text-[#58736b]">
                                        {
                                          "\u0411\u0430\u0441\u0435\u0439\u043d\u043e\u0432 \u0440\u0430\u0439\u043e\u043d: "
                                        }
                                        <strong>
                                          {legalLocation.basinCode}
                                        </strong>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={openLegalMap}
                                        className="mt-4 text-sm font-bold text-[#176f80] underline underline-offset-4"
                                      >
                                        {
                                          "\u0423\u0442\u043e\u0447\u043d\u0438 \u0442\u043e\u0447\u043d\u043e\u0442\u043e \u043c\u044f\u0441\u0442\u043e \u043d\u0430 \u043a\u0430\u0440\u0442\u0430\u0442\u0430"
                                        }
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {basinDirectorate && (
                                  <div className="rounded-3xl border border-[#c7dde4] bg-white p-6">

                                    <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#4b8290]">
                                      {
                                        "\u0412\u0410\u0428\u0410\u0422\u0410 \u041f\u0420\u041e\u0426\u0415\u0414\u0423\u0420\u0410"
                                      }
                                    </div>

                                    <h3 className="mt-2 text-xl font-bold text-[#244f59]">
                                      {
                                        "\u041d\u043e\u0432 \u0441\u043e\u043d\u0434\u0430\u0436 \u0437\u0430 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438 \u043f\u043e\u0442\u0440\u0435\u0431\u043d\u043e\u0441\u0442\u0438"
                                      }
                                    </h3>

                                    <div className="mt-6 grid gap-4 lg:grid-cols-2">

                                      <div className="rounded-2xl border border-[#d9e8eb] bg-[#f8fcfd] p-5">
                                        <div className="font-bold text-[#295d68]">
                                          {
                                            "\u0031. \u041f\u0440\u0435\u0434\u0438 \u0441\u043e\u043d\u0434\u0438\u0440\u0430\u043d\u0435\u0442\u043e"
                                          }
                                        </div>

                                        <p className="mt-3 text-sm leading-6 text-[#58727a]">
                                          {
                                            "\u0421\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438\u043a\u044a\u0442 \u043f\u043e\u0434\u0430\u0432\u0430 \u043f\u0438\u0441\u043c\u0435\u043d\u043e \u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u0435 \u0434\u043e \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440\u0430 \u043d\u0430 \u0441\u044a\u043e\u0442\u0432\u0435\u0442\u043d\u0430\u0442\u0430 \u0411\u0430\u0441\u0435\u0439\u043d\u043e\u0432\u0430 \u0434\u0438\u0440\u0435\u043a\u0446\u0438\u044f \u0437\u0430 \u043d\u0430\u043c\u0435\u0440\u0435\u043d\u0438\u0435\u0442\u043e \u0437\u0430 \u0438\u0437\u0433\u0440\u0430\u0436\u0434\u0430\u043d\u0435."
                                          }
                                        </p>

                                        <div className="mt-4 font-semibold text-[#385f68]">
                                          {
                                            "\u0423\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u0435\u0442\u043e \u0441\u044a\u0434\u044a\u0440\u0436\u0430:"
                                          }
                                        </div>

                                        <ul className="mt-2 space-y-2 text-sm leading-6 text-[#58727a]">
                                          <li>{"\u2022 \u0434\u0430\u043d\u043d\u0438 \u0437\u0430 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438\u043a\u0430"}</li>
                                          <li>{"\u2022 \u0434\u0430\u043d\u043d\u0438 \u0437\u0430 \u0438\u043c\u043e\u0442\u0430"}</li>
                                          <li>{"\u2022 \u043f\u0440\u0435\u0434\u0432\u0438\u0434\u0435\u043d\u0430 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430"}</li>
                                          <li>{"\u2022 \u0446\u0435\u043b \u043d\u0430 \u0432\u043e\u0434\u043e\u043f\u043e\u043b\u0437\u0432\u0430\u043d\u0435\u0442\u043e"}</li>
                                        </ul>
                                      </div>

                                      <div className="rounded-2xl border border-[#d9e8eb] bg-[#f8fcfd] p-5">
                                        <div className="font-bold text-[#295d68]">
                                          {
                                            "\u0032. \u0421\u043b\u0435\u0434 \u0438\u0437\u0433\u0440\u0430\u0436\u0434\u0430\u043d\u0435\u0442\u043e"
                                          }
                                        </div>

                                        <p className="mt-3 text-sm leading-6 text-[#58727a]">
                                          {
                                            "\u0412 \u0441\u0440\u043e\u043a \u0434\u043e 3 \u043c\u0435\u0441\u0435\u0446\u0430 \u043e\u0442 \u0438\u0437\u0433\u0440\u0430\u0436\u0434\u0430\u043d\u0435\u0442\u043e \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u0435\u0442\u043e \u0441\u0435 \u043e\u0431\u044f\u0432\u044f\u0432\u0430 \u0437\u0430 \u0432\u043f\u0438\u0441\u0432\u0430\u043d\u0435 \u0432 \u0440\u0435\u0433\u0438\u0441\u0442\u044a\u0440\u0430."
                                          }
                                        </p>

                                        <div className="mt-4 font-semibold text-[#385f68]">
                                          {
                                            "\u0417\u0430 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f \u0441\u0435 \u043f\u043e\u0441\u043e\u0447\u0432\u0430\u0442:"
                                          }
                                        </div>

                                        <ul className="mt-2 space-y-2 text-sm leading-6 text-[#58727a]">
                                          <li>{"\u2022 \u0434\u0430\u043d\u043d\u0438 \u0437\u0430 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438\u043a\u0430 \u0438 \u0438\u043c\u043e\u0442\u0430"}</li>
                                          <li>{"\u2022 \u0440\u0435\u0430\u043b\u043d\u0430 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430"}</li>
                                          <li>{"\u2022 \u0434\u0438\u0430\u043c\u0435\u0442\u044a\u0440 \u043d\u0430 \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u0435\u0442\u043e"}</li>
                                          <li>{"\u2022 \u043d\u0430\u0447\u0438\u043d \u043d\u0430 \u0447\u0435\u0440\u043f\u0435\u043d\u0435"}</li>
                                          <li>{"\u2022 \u0446\u0435\u043b \u043d\u0430 \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430\u043d\u0435"}</li>
                                        </ul>
                                      </div>

                                    </div>

                                    <div className="mt-5 rounded-2xl border border-[#c4dce3] bg-[#f2f9fb] p-5">
                                      <div className="font-bold text-[#2f6470]">
                                        {
                                          "\u0417\u0430\u0434\u044a\u043b\u0436\u0435\u043d\u0438\u044f \u043d\u0430 \u0411\u0430\u0441\u0435\u0439\u043d\u043e\u0432\u0430\u0442\u0430 \u0434\u0438\u0440\u0435\u043a\u0446\u0438\u044f"
                                        }
                                      </div>

                                      <ul className="mt-3 space-y-3 text-sm leading-6 text-[#58727a]">
                                        <li>
                                          {
                                            "\u2022 \u0410\u043a\u043e \u043f\u0440\u0435\u0434\u0432\u0438\u0434\u0435\u043d\u0430\u0442\u0430 \u0434\u044a\u043b\u043e\u0447\u0438\u043d\u0430 \u043d\u0435 \u043e\u0442\u0433\u043e\u0432\u0430\u0440\u044f \u043d\u0430 \u0438\u0437\u0438\u0441\u043a\u0432\u0430\u043d\u0438\u044f\u0442\u0430, \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440\u044a\u0442 \u0443\u0432\u0435\u0434\u043e\u043c\u044f\u0432\u0430 \u0433\u0440\u0430\u0436\u0434\u0430\u043d\u0438\u043d\u0430 \u043f\u043e \u0442\u0435\u043b\u0435\u0444\u043e\u043d\u0430 \u0438 \u043f\u0438\u0441\u043c\u0435\u043d\u043e \u0432 \u0441\u0440\u043e\u043a \u0434\u043e 2 \u0434\u043d\u0438 \u0438 \u043f\u043e\u0441\u043e\u0447\u0432\u0430 \u0434\u043e\u043f\u0443\u0441\u0442\u0438\u043c\u0430\u0442\u0430 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430."
                                          }
                                        </li>

                                        <li>
                                          {
                                            "\u2022 \u0421\u043b\u0435\u0434 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u043e\u043d\u043d\u043e\u0442\u043e \u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u0435 \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440\u044a\u0442 \u0438\u0437\u0434\u0430\u0432\u0430 \u0443\u0434\u043e\u0441\u0442\u043e\u0432\u0435\u0440\u0435\u043d\u0438\u0435 \u0437\u0430 \u0432\u043f\u0438\u0441\u0432\u0430\u043d\u0435 \u0432 \u0440\u0435\u0433\u0438\u0441\u0442\u044a\u0440\u0430 \u0432 \u0435\u0434\u043d\u043e\u043c\u0435\u0441\u0435\u0447\u0435\u043d \u0441\u0440\u043e\u043a."
                                          }
                                        </li>
                                      </ul>
                                    </div>

                                    <div className="mt-5 rounded-2xl border border-[#b9d8cb] bg-[#f2faf6] p-5">
                                      <div className="font-bold text-[#28614d]">
                                        {
                                          "\u041e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0438"
                                        }
                                      </div>

                                      <p className="mt-2 text-sm leading-6 text-[#557168]">
                                        {
                                          "\u041f\u0440\u0435\u0434\u0438 \u0438\u0437\u0433\u0440\u0430\u0436\u0434\u0430\u043d\u0435\u0442\u043e \u0441\u0435 \u043f\u043e\u0434\u0430\u0432\u0430 \u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u0435 \u0437\u0430 \u043d\u0430\u043c\u0435\u0440\u0435\u043d\u0438\u0435 \u0437\u0430 \u0438\u0437\u0433\u0440\u0430\u0436\u0434\u0430\u043d\u0435, \u0430 \u0441\u043b\u0435\u0434 \u0438\u0437\u0433\u0440\u0430\u0436\u0434\u0430\u043d\u0435\u0442\u043e \u2014 \u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u0435 \u0437\u0430 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f."
                                        }
                                      </p>

                                      <div className="mt-4 flex flex-wrap gap-3">
                                        {legalLocation?.formOwnUseUg1Url && (
                                          <a
                                            href={legalLocation.formOwnUseUg1Url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="rounded-xl bg-[#176f80] px-4 py-3 text-sm font-bold text-white hover:bg-[#125c6a]"
                                          >
                                            {
                                              "\u0418\u0437\u0442\u0435\u0433\u043b\u0438 \u0423\u04131 \u2014 \u043f\u0440\u0435\u0434\u0438 \u0438\u0437\u0433\u0440\u0430\u0436\u0434\u0430\u043d\u0435"
                                            }
                                          </a>
                                        )}

                                        {legalLocation?.formNormalOwnUseRg1Url && (
                                          <a
                                            href={legalLocation.formNormalOwnUseRg1Url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="rounded-xl border border-[#176f80] bg-white px-4 py-3 text-sm font-bold text-[#176f80]"
                                          >
                                            {
                                              "\u0418\u0437\u0442\u0435\u0433\u043b\u0438 \u0420\u04131 \u2014 \u0441\u043b\u0435\u0434 \u0438\u0437\u0433\u0440\u0430\u0436\u0434\u0430\u043d\u0435"
                                            }
                                          </a>
                                        )}
                                      </div>
                                    </div>

                                    <div className="mt-5 rounded-2xl border border-[#d6dfbd] bg-[#fbfdf5] p-5">
                                      <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#698247]">
                                        {
                                          "\u0421\u0422\u042a\u041f\u041a\u0410 9 \u00b7 \u041c\u0415\u0421\u0422\u041e\u041f\u041e\u041b\u041e\u0416\u0415\u041d\u0418\u0415"
                                        }
                                      </div>

                                      <h3 className="mt-2 text-lg font-bold text-[#435b2e]">
                                        {
                                          "\u041f\u0440\u043e\u0432\u0435\u0440\u0435\u0442\u0435 \u0438\u043c\u043e\u0442\u0430 \u0438 \u0432\u043e\u0434\u043d\u043e\u0442\u043e \u0442\u044f\u043b\u043e"
                                        }
                                      </h3>

                                      <p className="mt-3 text-sm leading-6 text-[#647052]">
                                        {
                                          "\u041f\u0440\u0438 \u0432\u043e\u0434\u043e\u0432\u0437\u0435\u043c\u0430\u043d\u0435 \u0437\u0430 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438 \u043f\u043e\u0442\u0440\u0435\u0431\u043d\u043e\u0441\u0442\u0438 \u0435 \u0432\u0430\u0436\u043d\u043e \u043a\u043e\u0435 \u0435 \u043f\u044a\u0440\u0432\u043e\u0442\u043e \u043e\u0442 \u043f\u043e\u0432\u044a\u0440\u0445\u043d\u043e\u0441\u0442\u0442\u0430 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u043e \u0432\u043e\u0434\u043d\u043e \u0442\u044f\u043b\u043e \u0438 \u043a\u0430\u043a\u044a\u0432 \u0435 \u043e\u0431\u044f\u0432\u0435\u043d\u0438\u044f\u0442 \u043c\u0430\u043a\u0441\u0438\u043c\u0430\u043b\u0435\u043d \u0432\u043e\u0434\u0435\u043d \u043e\u0431\u0435\u043c \u0437\u0430 \u0437\u0435\u043c\u043b\u0438\u0449\u0435\u0442\u043e."
                                        }
                                      </p>

                                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                                        <div className="rounded-xl border border-[#dfe8ce] bg-white p-4">
                                          <div className="font-bold text-[#50683b]">
                                            {
                                              "\u041a\u0430\u043a\u0432\u043e \u043c\u043e\u0436\u0435 \u0434\u0430 \u043f\u0440\u043e\u0432\u0435\u0440\u0438 SONDI.BG"
                                            }
                                          </div>

                                          <ul className="mt-3 space-y-2 text-sm leading-6 text-[#637054]">
                                            <li>
                                              {
                                                "\u2022 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u043e\u0442\u043e \u0432\u043e\u0434\u043d\u043e \u0442\u044f\u043b\u043e \u0437\u0430 \u0440\u0430\u0439\u043e\u043d\u0430"
                                              }
                                            </li>
                                            <li>
                                              {
                                                "\u2022 \u0433\u0435\u043e\u043b\u043e\u0436\u043a\u0438\u044f \u0438 \u0445\u0438\u0434\u0440\u043e\u0433\u0435\u043e\u043b\u043e\u0436\u043a\u0438\u044f \u043a\u043e\u043d\u0442\u0435\u043a\u0441\u0442"
                                              }
                                            </li>
                                            <li>
                                              {
                                                "\u2022 \u043d\u0430\u043b\u0438\u0447\u043d\u0438 \u0432 \u043f\u043b\u0430\u0442\u0444\u043e\u0440\u043c\u0430\u0442\u0430 \u0437\u043e\u043d\u0438 \u0438 \u043e\u0433\u0440\u0430\u043d\u0438\u0447\u0435\u043d\u0438\u044f"
                                              }
                                            </li>
                                          </ul>
                                        </div>

                                        <div className="rounded-xl border border-[#eadfc7] bg-[#fffdf8] p-4">

                                          <p className="mt-3 text-sm leading-6 text-[#74694f]">
                                            {
                                              "SONDI.BG \u043f\u0440\u043e\u0432\u0435\u0440\u044f\u0432\u0430 \u043d\u0430\u043b\u0438\u0447\u043d\u0438\u0442\u0435 \u043a\u0430\u0440\u0442\u043e\u0433\u0440\u0430\u0444\u0441\u043a\u0438 \u0434\u0430\u043d\u043d\u0438 \u0437\u0430 \u0438\u0437\u0431\u0440\u0430\u043d\u043e\u0442\u043e \u043c\u044f\u0441\u0442\u043e \u0438 \u043f\u043e\u043a\u0430\u0437\u0432\u0430 \u0443\u0441\u0442\u0430\u043d\u043e\u0432\u0435\u043d\u0438\u0442\u0435 \u0432 \u043f\u043b\u0430\u0442\u0444\u043e\u0440\u043c\u0430\u0442\u0430 \u0437\u043e\u043d\u0438 \u0438 \u043e\u0433\u0440\u0430\u043d\u0438\u0447\u0435\u043d\u0438\u044f."
                                            }
                                          </p>
                                        </div>
                                      </div>

                                      <a
                                        href="/map?mode=legal&return=%2Flegal"
                                        onClick={(event) => {
                                          event.preventDefault();
                                          openLegalMap();
                                        }}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-4 inline-flex rounded-xl bg-[#5d7d3d] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4d6932]"
                                      >
                                        {
                                          "\u041f\u0440\u043e\u0432\u0435\u0440\u0438 \u043c\u044f\u0441\u0442\u043e\u043f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u0435\u0442\u043e \u0432 \u043a\u0430\u0440\u0442\u0430\u0442\u0430"
                                        }
                                      </a>
                                    </div>

                                    <div className="mt-5 rounded-2xl border border-[#d9c9a9] bg-[#fffaf0] p-5">
                                      <div className="font-bold text-[#745a2e]">
                                        {
                                          "\u0412\u044a\u0437\u043c\u043e\u0436\u043d\u0438 \u0434\u043e\u043f\u044a\u043b\u043d\u0438\u0442\u0435\u043b\u043d\u0438 \u043e\u0433\u0440\u0430\u043d\u0438\u0447\u0435\u043d\u0438\u044f"
                                        }
                                      </div>

                                      <p className="mt-3 text-sm leading-6 text-[#76694f]">
                                        {
                                          "\u0417\u0430 \u043a\u043e\u043d\u043a\u0440\u0435\u0442\u043d\u0438\u044f \u0438\u043c\u043e\u0442 \u043c\u043e\u0436\u0435 \u0434\u0430 \u0438\u043c\u0430 \u0434\u043e\u043f\u044a\u043b\u043d\u0438\u0442\u0435\u043b\u043d\u0438 \u043e\u0433\u0440\u0430\u043d\u0438\u0447\u0435\u043d\u0438\u044f, \u0432\u043a\u043b\u044e\u0447\u0438\u0442\u0435\u043b\u043d\u043e \u0441\u0432\u044a\u0440\u0437\u0430\u043d\u0438 \u0441\u044a\u0441 \u0437\u043e\u043d\u0438 \u0437\u0430 \u0437\u0430\u0449\u0438\u0442\u0430 \u043d\u0430 \u0432\u043e\u0434\u0438\u0442\u0435, \u0441\u0430\u043d\u0438\u0442\u0430\u0440\u043d\u043e-\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u0435\u043b\u043d\u0438 \u0437\u043e\u043d\u0438 \u0438 \u0434\u0440\u0443\u0433\u0438 \u0434\u0435\u0439\u0441\u0442\u0432\u0430\u0449\u0438 \u0430\u043a\u0442\u043e\u0432\u0435. \u0417\u0430\u0442\u043e\u0432\u0430 \u0442\u0435 \u0441\u0435 \u043f\u0440\u043e\u0432\u0435\u0440\u044f\u0432\u0430\u0442 \u0437\u0430 \u043a\u043e\u043d\u043a\u0440\u0435\u0442\u043d\u043e\u0442\u043e \u043c\u044f\u0441\u0442\u043e."
                                        }
                                      </p>
                                    </div>

                                    <div className="mt-5 rounded-3xl border-2 border-[#83bca6] bg-[#edf9f4] p-6">
                                      <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#3d8069]">
                                        {
                                          "\u041f\u0420\u0415\u0414\u0412\u0410\u0420\u0418\u0422\u0415\u041b\u0415\u041d \u0420\u0415\u0417\u0423\u041b\u0422\u0410\u0422"
                                        }
                                      </div>

                                      <h3 className="mt-2 text-xl font-bold text-[#205443]">
                                        {
                                          dailyVolume === "unknown"
                                            ? "\u041f\u0440\u043e\u0432\u0435\u0440\u043a\u0430\u0442\u0430 \u0435 \u043f\u0440\u043e\u0434\u044a\u043b\u0436\u0435\u043d\u0430. \u041a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e\u0442\u043e \u0432\u043e\u0434\u0430 \u043e\u0441\u0442\u0430\u0432\u0430 \u0437\u0430 \u0434\u043e\u0443\u0442\u043e\u0447\u043d\u044f\u0432\u0430\u043d\u0435 \u0441\u043f\u0440\u044f\u043c\u043e \u0433\u0440\u0430\u043d\u0438\u0446\u0430\u0442\u0430 \u043e\u0442 10 m\u00b3/\u0434\u0435\u043d."
                                            : "\u041f\u043e \u0434\u0430\u0434\u0435\u043d\u0438\u0442\u0435 \u043e\u0442\u0433\u043e\u0432\u043e\u0440\u0438 \u0441\u043b\u0443\u0447\u0430\u044f\u0442 \u043f\u043e\u043f\u0430\u0434\u0430 \u0432 \u043f\u044a\u0442\u0435\u043a\u0430\u0442\u0430 \u0437\u0430 \u0441\u043e\u043d\u0434\u0430\u0436 \u0437\u0430 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438 \u043f\u043e\u0442\u0440\u0435\u0431\u043d\u043e\u0441\u0442\u0438."
                                        }
                                      </h3>

                                      <p className="mt-3 text-sm leading-6 text-[#527067]">
                                        {
                                          "\u0410\u043a\u043e \u0441\u0430 \u0438\u0437\u043f\u044a\u043b\u043d\u0435\u043d\u0438 \u0438 \u043c\u0435\u0441\u0442\u043d\u0438\u0442\u0435 \u0443\u0441\u043b\u043e\u0432\u0438\u044f, \u0437\u0430 \u0432\u043e\u0434\u043e\u0432\u0437\u0435\u043c\u0430\u043d\u0435\u0442\u043e \u043d\u0435 \u0441\u0435 \u0438\u0437\u0438\u0441\u043a\u0432\u0430 \u0440\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u0435\u043b\u043d\u043e, \u043d\u043e \u043e\u0441\u0442\u0430\u0432\u0430\u0442 \u0443\u0432\u0435\u0434\u043e\u043c\u0438\u0442\u0435\u043b\u043d\u0438\u044f\u0442 \u0438 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u043e\u043d\u043d\u0438\u044f\u0442 \u0440\u0435\u0436\u0438\u043c."
                                        }
                                      </p>

                                    </div>

                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                </section>
              )}

            {branch === "ordinary" &&
              ordinaryStage === "existing" && (
                <section className="mt-8 rounded-3xl border border-[#d9e4e5] bg-[#fafcfc] p-6 sm:p-7">
                  <button
                    type="button"
                    onClick={() => {
                      setExistingRegistration(null);
                      setExistingUse(null);
                      setExistingAge(null);
                      setExistingAction(null);
                      setRepairType(null);
                      setOrdinaryStage("start");
                    }}
                    className="text-sm font-semibold text-[#4d7b82] hover:text-[#173f48]"
                  >
                    {"\u2190 \u041d\u0430\u0437\u0430\u0434"}
                  </button>

                  <div className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[#527e86]">
                    {
                      "\u0421\u042a\u0429\u0415\u0421\u0422\u0412\u0423\u0412\u0410\u0429 \u0421\u041e\u041d\u0414\u0410\u0416"
                    }
                  </div>

                  <h2 className="mt-2 text-2xl font-bold">
                    {
                      "\u041a\u0430\u043a\u044a\u0432 \u0435 \u0441\u0442\u0430\u0442\u0443\u0441\u044a\u0442 \u043d\u0430 \u0441\u043e\u043d\u0434\u0430\u0436\u0430?"
                    }
                  </h2>

                  <p className="mt-3 max-w-3xl text-sm leading-6 text-[#617a81]">
                    {
                      "\u041f\u0440\u0438 \u0432\u0435\u0447\u0435 \u0438\u0437\u0433\u0440\u0430\u0434\u0435\u043d \u0441\u043e\u043d\u0434\u0430\u0436 \u043f\u044a\u0440\u0432\u043e \u0442\u0440\u044f\u0431\u0432\u0430 \u0434\u0430 \u0443\u0441\u0442\u0430\u043d\u043e\u0432\u0438\u043c \u0434\u0430\u043b\u0438 \u0435 \u0432\u043f\u0438\u0441\u0430\u043d \u0432 \u0440\u0435\u0433\u0438\u0441\u0442\u044a\u0440\u0430 \u043d\u0430 \u0411\u0430\u0441\u0435\u0439\u043d\u043e\u0432\u0430\u0442\u0430 \u0434\u0438\u0440\u0435\u043a\u0446\u0438\u044f."
                    }
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {[
                      [
                        "registered",
                        "\u0414\u0430, \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u0430\u043d \u0435",
                      ],
                      [
                        "unregistered",
                        "\u041d\u0435, \u043d\u0435 \u0435 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u0430\u043d",
                      ],
                      [
                        "unknown",
                        "\u041d\u0435 \u0437\u043d\u0430\u043c",
                      ],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setExistingRegistration(
                            value as ExistingRegistration
                          );
                          setExistingUse(null);
                          setExistingAge(null);
                          setExistingAction(null);
                          setRepairType(null);
                        }}
                        className={`rounded-2xl border px-5 py-4 text-left font-bold transition ${
                          existingRegistration === value
                            ? "border-[#559a88] bg-[#e9f7f2] text-[#235d4e]"
                            : "border-[#cbdcde] bg-white text-[#315d65] hover:bg-[#f4fafa]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>


                  {/* EXISTING_LOCATION_LOOKUP */}
                  {existingRegistration && (
                    <div className="mt-7 rounded-2xl border border-[#cfe0df] bg-[#f6fbfa] p-5">
                      <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#547d79]">
                        {
                          "\u041c\u0415\u0421\u0422\u041e\u041f\u041e\u041b\u041e\u0416\u0415\u041d\u0418\u0415 \u0418 \u0411\u0410\u0421\u0415\u0419\u041d\u041e\u0412\u0410 \u0414\u0418\u0420\u0415\u041a\u0426\u0418\u042f"
                        }
                      </div>

                      <h3 className="mt-2 text-lg font-bold text-[#294f52]">
                        {
                          "\u0412 \u043a\u043e\u0435 \u043d\u0430\u0441\u0435\u043b\u0435\u043d\u043e \u043c\u044f\u0441\u0442\u043e \u0435 \u0441\u043e\u043d\u0434\u0430\u0436\u044a\u0442?"
                        }
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-[#617a81]">
                        {
                          "SONDI.BG \u0449\u0435 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u0438 \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u043d\u043e \u043a\u043e\u043c\u043f\u0435\u0442\u0435\u043d\u0442\u043d\u0430\u0442\u0430 \u0411\u0430\u0441\u0435\u0439\u043d\u043e\u0432\u0430 \u0434\u0438\u0440\u0435\u043a\u0446\u0438\u044f."
                        }
                      </p>

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <input
                          type="text"
                          value={settlementQuery}
                          onChange={(event) => {
                            setSettlementQuery(
                              event.target.value
                            );
                          }}
                          onKeyDown={(event) => {
                            if (
                              event.key === "Enter"
                            ) {
                              event.preventDefault();
                              searchSettlement();
                            }
                          }}
                          placeholder={
                            "\u041d\u0430\u043f\u0440. \u041f\u043b\u043e\u0432\u0434\u0438\u0432, \u0411\u0435\u043b\u0438\u0446\u0430, \u041c\u0430\u0440\u043a\u043e\u0432\u043e"
                          }
                          className="min-w-0 flex-1 rounded-xl border border-[#c4dada] bg-white px-4 py-3 text-[#294f52] outline-none focus:border-[#559a88]"
                        />

                        <button
                          type="button"
                          onClick={searchSettlement}
                          disabled={
                            !settlementQuery.trim() ||
                            locationLoading
                          }
                          className="rounded-xl bg-[#176f80] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#125c6a] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {locationLoading
                            ? "\u0422\u044a\u0440\u0441\u0435\u043d\u0435..."
                            : "\u041f\u0440\u043e\u0432\u0435\u0440\u0438"}
                        </button>
                      </div>

                      {settlementSearchError && (
                        <div className="mt-3 rounded-xl border border-[#e4c9b7] bg-[#fff8f3] p-4 text-sm text-[#765746]">
                          {settlementSearchError}
                        </div>
                      )}

                      {settlementCandidates.length > 1 &&
                        !legalLocation && (
                          <div className="mt-4 space-y-2">
                            <div className="text-sm font-bold text-[#456b60]">
                              {
                                "\u0418\u0437\u0431\u0435\u0440\u0435\u0442\u0435 \u043f\u0440\u0430\u0432\u0438\u043b\u043d\u043e\u0442\u043e \u043d\u0430\u0441\u0435\u043b\u0435\u043d\u043e \u043c\u044f\u0441\u0442\u043e:"
                              }
                            </div>

                            {settlementCandidates.map(
                              (
                                candidate,
                                index
                              ) => (
                                <button
                                  key={`${candidate.lat}-${candidate.lng}-${index}`}
                                  type="button"
                                  onClick={() =>
                                    applyLegalLocation(
                                      candidate
                                    )
                                  }
                                  className="block w-full rounded-xl border border-[#c5ddd4] bg-white px-4 py-3 text-left text-sm text-[#315d54] transition hover:border-[#7eb8a4] hover:bg-[#f8fcfa]"
                                >
                                  {candidate.label}
                                </button>
                              )
                            )}
                          </div>
                        )}

                      {legalLocation && (
                        <div className="mt-5 rounded-xl border border-[#9bcbb9] bg-white p-5">
                          <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#518371]">
                            {
                              "\u041e\u041f\u0420\u0415\u0414\u0415\u041b\u0415\u041d\u041e \u0410\u0412\u0422\u041e\u041c\u0410\u0422\u0418\u0427\u041d\u041e"
                            }
                          </div>

                          <div className="mt-2 text-lg font-bold text-[#234f46]">
                            {legalLocation.basinName}
                          </div>

                          <div className="mt-2 text-sm text-[#58736b]">
                            {
                              "\u0411\u0430\u0441\u0435\u0439\u043d\u043e\u0432 \u0440\u0430\u0439\u043e\u043d: "
                            }
                            <strong>
                              {legalLocation.basinCode}
                            </strong>
                          </div>

                          <button
                            type="button"
                            onClick={openLegalMap}
                            className="mt-4 text-sm font-bold text-[#176f80] underline underline-offset-4"
                          >
                            {
                              "\u0423\u0442\u043e\u0447\u043d\u0438 \u0442\u043e\u0447\u043d\u043e\u0442\u043e \u043c\u044f\u0441\u0442\u043e \u043d\u0430 \u043a\u0430\u0440\u0442\u0430\u0442\u0430"
                            }
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {existingRegistration === "registered" && (
                    <div className="mt-6 rounded-2xl border border-[#b9d9cc] bg-[#effaf5] p-5">
                      <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#43806b]">
                        {
                          "\u0421\u041e\u041d\u0414\u0410\u0416\u042a\u0422 \u0415 \u0420\u0415\u0413\u0418\u0421\u0422\u0420\u0418\u0420\u0410\u041d"
                        }
                      </div>

                      <h3 className="mt-2 text-lg font-bold text-[#235d4e]">
                        {
                          "\u041a\u0430\u043a\u0432\u043e \u0438\u0441\u043a\u0430\u0442\u0435 \u0434\u0430 \u043d\u0430\u043f\u0440\u0430\u0432\u0438\u0442\u0435?"
                        }
                      </h3>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {[
                          [
                            "use",
                            "\u0414\u0430 \u043f\u0440\u043e\u0434\u044a\u043b\u0436\u0430 \u0434\u0430 \u0433\u043e \u043f\u043e\u043b\u0437\u0432\u0430\u043c",
                            "\u0411\u0435\u0437 \u043f\u0440\u043e\u043c\u044f\u043d\u0430 \u043d\u0430 \u043f\u0440\u0435\u0434\u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435\u0442\u043e.",
                          ],
                          [
                            "repair",
                            "\u0420\u0435\u043c\u043e\u043d\u0442 \u0438\u043b\u0438 \u0432\u044a\u0437\u0441\u0442\u0430\u043d\u043e\u0432\u044f\u0432\u0430\u043d\u0435",
                            "\u041f\u043e\u043c\u043f\u0430, \u0442\u0440\u044a\u0431\u0438, \u0444\u0438\u043b\u0442\u0440\u0438 \u0438\u043b\u0438 \u043f\u0440\u043e\u043c\u044f\u043d\u0430 \u043d\u0430 \u043a\u043e\u043d\u0441\u0442\u0440\u0443\u043a\u0446\u0438\u044f\u0442\u0430.",
                          ],
                          [
                            "change",
                            "\u0414\u0430 \u043f\u0440\u043e\u043c\u0435\u043d\u044f \u043f\u0440\u0435\u0434\u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435\u0442\u043e",
                            "\u041d\u0430\u043f\u0440\u0438\u043c\u0435\u0440 \u043e\u0442 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438 \u043d\u0443\u0436\u0434\u0438 \u043a\u044a\u043c \u0441\u0442\u043e\u043f\u0430\u043d\u0441\u043a\u043e \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430\u043d\u0435.",
                          ],
                          [
                            "close",
                            "\u0414\u0430 \u0433\u043e \u043b\u0438\u043a\u0432\u0438\u0434\u0438\u0440\u0430\u043c",
                            "\u041f\u0440\u0435\u0441\u044a\u0445\u043d\u0430\u043b, \u0437\u0430\u0442\u043b\u0430\u0447\u0435\u043d, \u0440\u0430\u0437\u0440\u0443\u0448\u0435\u043d \u0438\u043b\u0438 \u0432\u0435\u0447\u0435 \u043d\u0435\u043d\u0443\u0436\u0435\u043d \u0441\u043e\u043d\u0434\u0430\u0436.",
                          ],
                        ].map(([value, title, description]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => {
                              setExistingAction(
                                value as ExistingAction
                              );
                              setRepairType(null);
                            }}
                            className={`rounded-xl border p-4 text-left transition ${
                              existingAction === value
                                ? "border-[#559a88] bg-white text-[#235d4e]"
                                : "border-[#c8ded5] bg-[#f9fdfb] text-[#456b60] hover:bg-white"
                            }`}
                          >
                            <div className="font-bold">
                              {title}
                            </div>
                            <div className="mt-1 text-xs font-normal leading-5 opacity-80">
                              {description}
                            </div>
                          </button>
                        ))}
                      </div>

                      {existingAction === "use" && (
                        <div className="mt-5 rounded-xl border border-[#c9dfd4] bg-white p-5">
                          <h4 className="font-bold text-[#285a4c]">
                            {
                              "\u041f\u0440\u043e\u0434\u044a\u043b\u0436\u0430\u0432\u0430\u043d\u0435 \u043d\u0430 \u043f\u043e\u043b\u0437\u0432\u0430\u043d\u0435\u0442\u043e"
                            }
                          </h4>

                          <p className="mt-2 text-sm leading-6 text-[#557168]">
                            {
                              "\u0410\u043a\u043e \u0441\u043e\u043d\u0434\u0430\u0436\u044a\u0442 \u043e\u0441\u0442\u0430\u0432\u0430 \u0441\u044a\u0441 \u0441\u044a\u0449\u043e\u0442\u043e \u043f\u0440\u0435\u0434\u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0438 \u043d\u0435 \u0441\u0435 \u043f\u0440\u043e\u043c\u0435\u043d\u044f\u0442 \u0434\u0430\u043d\u043d\u0438\u0442\u0435 \u0437\u0430 \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u0435\u0442\u043e, \u0437\u0430\u043f\u0430\u0437\u0432\u0430\u0442\u0435 \u043f\u043e\u043b\u0437\u0432\u0430\u043d\u0435\u0442\u043e \u0432 \u0440\u0430\u043c\u043a\u0438\u0442\u0435 \u043d\u0430 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u0430\u043d\u043e\u0442\u043e \u043f\u0440\u0435\u0434\u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435."
                            }
                          </p>

                          {legalLocation?.existingRegisterUrl && (
                            <a
                              href={legalLocation.existingRegisterUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-4 inline-flex text-sm font-bold text-[#176f80] underline underline-offset-4"
                            >
                              {
                                "\u041f\u0440\u043e\u0432\u0435\u0440\u0438 \u0441\u043e\u043d\u0434\u0430\u0436\u0430 \u0432 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438\u044f \u0440\u0435\u0433\u0438\u0441\u0442\u044a\u0440"
                              }
                            </a>
                          )}
                          {!legalLocation?.existingRegisterUrl &&
                            legalLocation?.existingRegisterLookupNote && (
                              <div className="mt-4 rounded-xl border border-[#cbdedf] bg-[#f7fbfb] p-4 text-sm leading-6 text-[#557078]">
                                <div className="font-bold text-[#355d62]">
                                  {
                                    "\u041a\u0430\u043a \u0434\u0430 \u043f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u0435 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f\u0442\u0430:"
                                  }
                                </div>
                                <div className="mt-2">
                                  {legalLocation.existingRegisterLookupNote}
                                </div>
                              </div>
                            )}

                        </div>
                      )}

                      {existingAction === "repair" && (
                        <div className="mt-5 rounded-xl border border-[#d2dedf] bg-white p-5">
                          <h4 className="font-bold text-[#355d62]">
                            {
                              "\u0420\u0435\u043c\u043e\u043d\u0442\u044a\u0442 \u043f\u0440\u043e\u043c\u0435\u043d\u044f \u043b\u0438 \u043a\u043e\u043d\u0441\u0442\u0440\u0443\u043a\u0446\u0438\u044f\u0442\u0430 \u043d\u0430 \u0441\u043e\u043d\u0434\u0430\u0436\u0430?"
                            }
                          </h4>

                          <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            {[
                              [
                                "maintenance",
                                "\u041d\u0435",
                                "\u0422\u0435\u0445\u043d\u0438\u0447\u0435\u0441\u043a\u0430 \u043f\u043e\u0434\u0434\u0440\u044a\u0436\u043a\u0430",
                              ],
                              [
                                "reconstruction",
                                "\u0414\u0430",
                                "\u041f\u0440\u043e\u043c\u044f\u043d\u044f\u0442 \u0441\u0435 \u043a\u043e\u043d\u0441\u0442\u0440\u0443\u043a\u0446\u0438\u044f, \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430, \u0444\u0438\u043b\u0442\u0440\u0438 \u0438\u043b\u0438 \u0434\u0440\u0443\u0433\u0438 \u043e\u0441\u043d\u043e\u0432\u043d\u0438 \u043f\u0430\u0440\u0430\u043c\u0435\u0442\u0440\u0438",
                              ],
                              [
                                "unknown",
                                "\u041d\u0435 \u0437\u043d\u0430\u043c",
                                "\u041f\u0440\u043e\u0432\u0435\u0440\u043a\u0430 \u043f\u0440\u0435\u0434\u0438 \u0440\u0430\u0431\u043e\u0442\u0430",
                              ],
                            ].map(([value, title, description]) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() =>
                                  setRepairType(
                                    value as RepairType
                                  )
                                }
                                className={`rounded-xl border p-3 text-left text-sm transition ${
                                  repairType === value
                                    ? "border-[#709ca0] bg-[#eff7f7] text-[#355d62]"
                                    : "border-[#d4e1e2] bg-[#fbfdfd] text-[#567078]"
                                }`}
                              >
                                <div className="font-bold">
                                  {title}
                                </div>
                                <div className="mt-1 text-xs leading-5">
                                  {description}
                                </div>
                              </button>
                            ))}
                          </div>

                          {repairType === "maintenance" && (
                            <div className="mt-4 rounded-xl bg-[#f5f9f9] p-4 text-sm leading-6 text-[#587078]">
                              {
                                "\u0410\u043a\u043e \u0441\u0435 \u0438\u0437\u0432\u044a\u0440\u0448\u0432\u0430 \u0441\u0430\u043c\u043e \u0442\u0435\u0445\u043d\u0438\u0447\u0435\u0441\u043a\u0430 \u043f\u043e\u0434\u0434\u0440\u044a\u0436\u043a\u0430 \u0431\u0435\u0437 \u043f\u0440\u043e\u043c\u044f\u043d\u0430 \u043d\u0430 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u0430\u043d\u0438\u0442\u0435 \u043f\u0430\u0440\u0430\u043c\u0435\u0442\u0440\u0438, \u043d\u0435 \u044f \u0442\u0440\u0435\u0442\u0438\u0440\u0430\u043c\u0435 \u043a\u0430\u0442\u043e \u0440\u0435\u043a\u043e\u043d\u0441\u0442\u0440\u0443\u043a\u0446\u0438\u044f."
                              }
                            </div>
                          )}

                          {repairType === "reconstruction" && (
                            <div className="mt-4 rounded-xl border border-[#e0cdb8] bg-[#fff9f3] p-4 text-sm leading-6 text-[#776957]">
                              <strong>
                                {
                                  "\u0422\u043e\u0432\u0430 \u0435 \u0440\u0435\u043a\u043e\u043d\u0441\u0442\u0440\u0443\u043a\u0446\u0438\u044f."
                                }
                              </strong>
                              <div className="mt-2">
                                {
                                  "\u041f\u0440\u0435\u0434\u0438 \u0438\u0437\u0432\u044a\u0440\u0448\u0432\u0430\u043d\u0435 \u043d\u0430 \u0434\u0435\u0439\u043d\u043e\u0441\u0442\u0438, \u043a\u043e\u0438\u0442\u043e \u043f\u0440\u043e\u043c\u0435\u043d\u044f\u0442 \u043a\u043e\u043d\u0441\u0442\u0440\u0443\u043a\u0446\u0438\u044f\u0442\u0430 \u0438\u043b\u0438 \u043f\u0430\u0440\u0430\u043c\u0435\u0442\u0440\u0438\u0442\u0435 \u043d\u0430 \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u0435\u0442\u043e, \u0441\u0435 \u043f\u0440\u043e\u0432\u0435\u0440\u044f\u0432\u0430 \u043f\u0440\u0438\u043b\u043e\u0436\u0438\u043c\u0438\u044f\u0442 \u0440\u0435\u0436\u0438\u043c \u0437\u0430 \u0440\u0435\u043a\u043e\u043d\u0441\u0442\u0440\u0443\u043a\u0446\u0438\u044f \u0438 \u0438\u0437\u0438\u0441\u043a\u0443\u0435\u043c\u0430\u0442\u0430 \u0442\u0435\u0445\u043d\u0438\u0447\u0435\u0441\u043a\u0430 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430\u0446\u0438\u044f."
                                }
                              </div>

                              {legalLocation?.formAmendGroundwaterPermitUrl && (
                                <a
                                  href={legalLocation.formAmendGroundwaterPermitUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-3 inline-flex rounded-xl bg-[#176f80] px-4 py-2.5 font-bold text-white transition hover:bg-[#125c6a]"
                                >
                                  {
                                    "\u0418\u0437\u0442\u0435\u0433\u043b\u0438 \u041e\u0431\u0440\u0430\u0437\u0435\u0446 32 \u2014 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0435 \u043d\u0430 \u0440\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u0435\u043b\u043d\u043e"
                                  }
                                </a>
                              )}
                            </div>
                          )}

                          {repairType === "unknown" && (
                            <div className="mt-4 rounded-xl bg-[#f5f9f9] p-4 text-sm leading-6 text-[#587078]">
                              {
                                "\u0410\u043a\u043e \u043d\u0435 \u0435 \u044f\u0441\u043d\u043e \u0434\u0430\u043b\u0438 \u0440\u0430\u0431\u043e\u0442\u0430\u0442\u0430 \u043f\u0440\u043e\u043c\u0435\u043d\u044f \u043a\u043e\u043d\u0441\u0442\u0440\u0443\u043a\u0446\u0438\u044f\u0442\u0430, \u043f\u0440\u043e\u0432\u0435\u0440\u044f\u0432\u0430\u043c\u0435 \u0442\u043e\u0447\u043d\u043e \u043a\u0430\u043a\u0432\u0438 \u0434\u0435\u0439\u043d\u043e\u0441\u0442\u0438 \u0449\u0435 \u0441\u0435 \u0438\u0437\u0432\u044a\u0440\u0448\u0430\u0442 \u043f\u0440\u0435\u0434\u0438 \u0434\u0430 \u0441\u0435 \u043f\u0440\u0438\u0435\u043c\u0435, \u0447\u0435 \u0435 \u043e\u0431\u0438\u043a\u043d\u043e\u0432\u0435\u043d \u0440\u0435\u043c\u043e\u043d\u0442."
                              }
                            </div>
                          )}
                        </div>
                      )}

                      {existingAction === "change" && (
                    <div className="mt-6 rounded-2xl border border-[#d9c69f] bg-[#fffaf0] p-5">
                      <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#80652f]">
                        {
                          "\u041f\u0420\u041e\u041c\u042f\u041d\u0410 \u041d\u0410 \u041f\u0420\u0415\u0414\u041d\u0410\u0417\u041d\u0410\u0427\u0415\u041d\u0418\u0415\u0422\u041e"
                        }
                      </div>

                      <h3 className="mt-2 text-lg font-bold text-[#684f2c]">
                        {
                          "\u041f\u0440\u043e\u043c\u044f\u043d\u0430\u0442\u0430 \u043a\u044a\u043c \u0441\u0442\u043e\u043f\u0430\u043d\u0441\u043a\u0438 \u0438\u043b\u0438 \u043d\u0435\u0441\u0442\u043e\u043f\u0430\u043d\u0441\u043a\u0438 \u0446\u0435\u043b\u0438 \u0435 \u0432\u044a\u0437\u043c\u043e\u0436\u043d\u0430, \u043d\u043e \u0441\u0430\u043c\u043e \u043f\u0440\u0438 \u0438\u0437\u043f\u044a\u043b\u043d\u0435\u043d\u0438\u0435 \u043d\u0430 \u0443\u0441\u043b\u043e\u0432\u0438\u044f\u0442\u0430 \u043d\u0430 \u0447\u043b. 121 \u043e\u0442 \u041d\u0430\u0440\u0435\u0434\u0431\u0430 \u2116 1."
                        }
                      </h3>

                      <div className="mt-4 rounded-xl border border-[#e1d6bf] bg-white p-4">
                        <div className="font-bold text-[#684f2c]">
                          {
                            "\u0417\u0430 \u0434\u0430 \u0441\u0435 \u043f\u0440\u043e\u043c\u0435\u043d\u0438 \u043f\u0440\u0435\u0434\u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435\u0442\u043e:"
                          }
                        </div>

                        <ol className="mt-3 space-y-2 text-sm leading-6 text-[#74664e]">
                          <li>
                            {
                              "1. \u0421\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u0435\u0442\u043e \u0442\u0440\u044f\u0431\u0432\u0430 \u0434\u0430 \u0435 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u0430\u043d\u043e \u043f\u043e \u0440\u0435\u0434\u0430 \u043d\u0430 \u0447\u043b. 119."
                            }
                          </li>

                          <li>
                            {
                              "2. \u0422\u0440\u044f\u0431\u0432\u0430 \u0434\u0430 \u0435 \u0440\u0430\u0437\u043f\u043e\u043b\u043e\u0436\u0435\u043d\u043e \u0432 \u0433\u0440\u0430\u043d\u0438\u0446\u0438\u0442\u0435 \u043d\u0430 \u043d\u0430\u0441\u0435\u043b\u0435\u043d\u043e \u043c\u044f\u0441\u0442\u043e \u0438\u043b\u0438 \u0441\u0435\u043b\u0438\u0449\u043d\u043e \u043e\u0431\u0440\u0430\u0437\u0443\u0432\u0430\u043d\u0438\u0435."
                            }
                          </li>

                          <li>
                            {
                              "3. \u0422\u0440\u044f\u0431\u0432\u0430 \u0434\u0430 \u0435 \u043d\u0430\u043b\u0438\u0447\u043d\u0430 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430\u0446\u0438\u044f\u0442\u0430 \u0437\u0430 \u0438\u0437\u0433\u0440\u0430\u0436\u0434\u0430\u043d\u0435\u0442\u043e / \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u0435\u0442\u043e \u043f\u043e \u0447\u043b. 103."
                            }
                          </li>

                          <li>
                            {
                              "4. \u0421\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u0435\u0442\u043e \u0441\u0435 \u043f\u0440\u0438\u0435\u043c\u0430 \u043f\u043e \u0440\u0435\u0434\u0430 \u043d\u0430 \u0447\u043b. 104\u2013106."
                            }
                          </li>

                          <li>
                            {
                              "5. \u0415\u0434\u0432\u0430 \u0441\u043b\u0435\u0434 \u0442\u043e\u0432\u0430 \u043c\u043e\u0436\u0435 \u0434\u0430 \u0441\u0435 \u0438\u0437\u0434\u0430\u0434\u0435 \u0440\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u0435\u043b\u043d\u043e \u0437\u0430 \u0432\u043e\u0434\u043e\u0432\u0437\u0435\u043c\u0430\u043d\u0435 \u0437\u0430 \u0441\u0442\u043e\u043f\u0430\u043d\u0441\u043a\u0438 \u0438\u043b\u0438 \u043d\u0435\u0441\u0442\u043e\u043f\u0430\u043d\u0441\u043a\u0438 \u0446\u0435\u043b\u0438."
                            }
                          </li>
                        </ol>
                      </div>

                      <div className="mt-4 rounded-xl border border-[#e7c9b5] bg-[#fff8f3] p-4 text-sm leading-6 text-[#765746]">
                        {
                          "\u041d\u0435 \u0437\u0430\u043f\u043e\u0447\u0432\u0430\u0439\u0442\u0435 \u0441\u0442\u043e\u043f\u0430\u043d\u0441\u043a\u043e \u0432\u043e\u0434\u043e\u0432\u0437\u0435\u043c\u0430\u043d\u0435 \u0441\u0430\u043c\u043e \u0441 \u043f\u0440\u043e\u043c\u044f\u043d\u0430 \u043d\u0430 \u043f\u0440\u0435\u0434\u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435\u0442\u043e. \u041d\u0443\u0436\u043d\u043e \u0435 \u0434\u0430 \u0435 \u0438\u0437\u0434\u0430\u0434\u0435\u043d\u043e \u0441\u044a\u043e\u0442\u0432\u0435\u0442\u043d\u043e\u0442\u043e \u0440\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u0435\u043b\u043d\u043e."
                        }
                      </div>

                      {legalLocation?.formExistingWellPermitUrl && (
                        <a
                          href={legalLocation.formExistingWellPermitUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-flex rounded-xl bg-[#9a6b26] px-5 py-3 text-sm font-bold text-white"
                        >
                          {
                            "\u0418\u0437\u0442\u0435\u0433\u043b\u0438 \u041e\u0431\u0440\u0430\u0437\u0435\u0446 15 \u2014 \u0432\u043e\u0434\u043e\u0432\u0437\u0435\u043c\u0430\u043d\u0435 \u0447\u0440\u0435\u0437 \u0441\u044a\u0449\u0435\u0441\u0442\u0432\u0443\u0432\u0430\u0449\u043e \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u0435"
                          }
                        </a>
                      )}
                    </div>
                  )}

                  {existingAction === "close" && (
                    <div className="mt-6 rounded-2xl border border-[#dfc8b8] bg-[#fff8f4] p-5">
                      <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#925b3a]">
                        {
                          "\u041b\u0418\u041a\u0412\u0418\u0414\u0418\u0420\u0410\u041d\u0415 \u041d\u0410 \u0421\u042a\u041e\u0420\u042a\u0416\u0415\u041d\u0418\u0415"
                        }
                      </div>

                      <h3 className="mt-2 text-lg font-bold text-[#74462f]">
                        {
                          "\u0420\u0435\u0434\u044a\u0442 \u0437\u0430\u0432\u0438\u0441\u0438 \u043e\u0442 \u0432\u0438\u0434\u0430 \u043d\u0430 \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u0435\u0442\u043e."
                        }
                      </h3>

                      <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <div className="rounded-xl border border-[#ead6c8] bg-white p-4">
                          <div className="font-bold text-[#74462f]">
                            {
                              "\u041a\u043b\u0430\u0434\u0435\u043d\u0435\u0446 \u0437\u0430 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438 \u043f\u043e\u0442\u0440\u0435\u0431\u043d\u043e\u0441\u0442\u0438"
                            }
                          </div>

                          <p className="mt-2 text-sm leading-6 text-[#765f52]">
                            {
                              "\u0410\u043a\u043e \u0435 \u0437\u0430\u0442\u043b\u0430\u0447\u0435\u043d, \u043f\u0440\u0435\u0441\u044a\u0445\u043d\u0430\u043b \u0438\u043b\u0438 \u0440\u0430\u0437\u0440\u0443\u0448\u0435\u043d, \u0447\u043b. 118, \u0430\u043b. 3\u20135 \u043f\u0440\u0435\u0434\u0432\u0438\u0436\u0434\u0430 \u0441\u043f\u0435\u0446\u0438\u0430\u043b\u0435\u043d \u0440\u0435\u0434."
                            }
                          </p>

                          <ol className="mt-3 space-y-2 text-sm leading-6 text-[#765f52]">
                            <li>
                              {
                                "1. \u0417\u0430\u043f\u044a\u043b\u0432\u0430 \u0441\u0435 \u0441\u0430\u043c\u043e \u0441 \u0435\u0441\u0442\u0435\u0441\u0442\u0432\u0435\u043d\u0438 \u0437\u0435\u043c\u043d\u0438 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u0438."
                              }
                            </li>
                            <li>
                              {
                                "2. \u0417\u0430\u043f\u0435\u0447\u0430\u0442\u0432\u0430 \u0441\u0435 \u0441 \u0433\u043b\u0438\u043d\u0435\u0441\u0442 \u0441\u043b\u043e\u0439."
                              }
                            </li>
                            <li>
                              {
                                "3. \u0414\u0435\u0439\u043d\u043e\u0441\u0442\u0438\u0442\u0435 \u0441\u0435 \u0438\u0437\u0432\u044a\u0440\u0448\u0432\u0430\u0442 \u0432 \u043f\u0440\u0438\u0441\u044a\u0441\u0442\u0432\u0438\u0435\u0442\u043e \u043d\u0430 \u043f\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u0438\u0442\u0435\u043b \u043d\u0430 \u043e\u0431\u0449\u0438\u043d\u0430\u0442\u0430."
                              }
                            </li>
                            <li>
                              {
                                "4. \u0421\u044a\u0441\u0442\u0430\u0432\u044f \u0441\u0435 \u043f\u0440\u043e\u0442\u043e\u043a\u043e\u043b."
                              }
                            </li>
                            <li>
                              {
                                "5. \u0421\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438\u043a\u044a\u0442 \u0443\u0432\u0435\u0434\u043e\u043c\u044f\u0432\u0430 \u0411\u0430\u0441\u0435\u0439\u043d\u043e\u0432\u0430\u0442\u0430 \u0434\u0438\u0440\u0435\u043a\u0446\u0438\u044f \u0438 \u043f\u0440\u0438\u043b\u0430\u0433\u0430 \u043f\u0440\u043e\u0442\u043e\u043a\u043e\u043b\u0430 \u0437\u0430 \u043e\u0442\u0440\u0430\u0437\u044f\u0432\u0430\u043d\u0435 \u043d\u0430 \u043f\u0440\u043e\u043c\u044f\u043d\u0430\u0442\u0430 \u0432 \u0440\u0435\u0433\u0438\u0441\u0442\u044a\u0440\u0430."
                              }
                            </li>
                          </ol>
                        </div>

                        <div className="rounded-xl border border-[#ead6c8] bg-white p-4">
                          <div className="font-bold text-[#74462f]">
                            {
                              "\u0414\u0440\u0443\u0433\u043e \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u0435 \u0437\u0430 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0438 \u0432\u043e\u0434\u0438"
                            }
                          </div>

                          <p className="mt-2 text-sm leading-6 text-[#765f52]">
                            {
                              "\u0417\u0430 \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u044f\u0442\u0430 \u0438\u0437\u0432\u044a\u043d \u0441\u043f\u0435\u0446\u0438\u0430\u043b\u043d\u0438\u044f \u0441\u043b\u0443\u0447\u0430\u0439 \u043f\u043e \u0447\u043b. 118, \u0430\u043b. 3 \u043b\u0438\u043a\u0432\u0438\u0434\u0438\u0440\u0430\u043d\u0435\u0442\u043e \u0441\u0435 \u0438\u0437\u0432\u044a\u0440\u0448\u0432\u0430 \u043f\u043e \u0447\u043b. 110 \u043e\u0442 \u041d\u0430\u0440\u0435\u0434\u0431\u0430 \u2116 1."
                            }
                          </p>

                          <div className="mt-3 text-sm leading-6 text-[#765f52]">
                            {
                              "\u041f\u043e \u043e\u0431\u0449\u043e\u0442\u043e \u043f\u0440\u0430\u0432\u0438\u043b\u043e \u0435 \u043d\u0443\u0436\u0435\u043d \u043f\u0440\u043e\u0435\u043a\u0442 \u0437\u0430 \u043b\u0438\u043a\u0432\u0438\u0434\u0430\u0446\u0438\u044f, \u043e\u0434\u043e\u0431\u0440\u0435\u043d \u043e\u0442 \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440\u0430 \u043d\u0430 \u0441\u044a\u043e\u0442\u0432\u0435\u0442\u043d\u0430\u0442\u0430 \u0411\u0430\u0441\u0435\u0439\u043d\u043e\u0432\u0430 \u0434\u0438\u0440\u0435\u043a\u0446\u0438\u044f."
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                    </div>
                  )}

                  {/* EXISTING_REGISTER_CHECK */}
                  {existingRegistration === "unknown" &&
                    legalLocation && (
                      <div className="mt-6 rounded-2xl border border-[#cbdedf] bg-white p-5">
                        <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#5c7f7b]">
                          {
                            "\u041f\u0420\u041e\u0412\u0415\u0420\u041a\u0410 \u041d\u0410 \u0420\u0415\u0413\u0418\u0421\u0422\u0420\u0410\u0426\u0418\u042f\u0422\u0410"
                          }
                        </div>

                        <h3 className="mt-2 text-lg font-bold text-[#294f52]">
                          {legalLocation.existingRegisterSearchable
                            ? "\u041f\u0440\u043e\u0432\u0435\u0440\u0435\u0442\u0435 \u0441\u043e\u043d\u0434\u0430\u0436\u0430 \u0432 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438\u044f \u0440\u0435\u0433\u0438\u0441\u0442\u044a\u0440."
                            : "\u041e\u0442\u0432\u043e\u0440\u0435\u0442\u0435 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0430\u0442\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u043d\u0430 \u0411\u0430\u0441\u0435\u0439\u043d\u043e\u0432\u0430\u0442\u0430 \u0434\u0438\u0440\u0435\u043a\u0446\u0438\u044f \u0437\u0430 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f."}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-[#617a81]">
                          {legalLocation.existingRegisterSearchable
                            ? "\u0417\u0430 \u0442\u043e\u0437\u0438 \u0431\u0430\u0441\u0435\u0439\u043d\u043e\u0432 \u0440\u0430\u0439\u043e\u043d \u0435 \u043d\u0430\u043b\u0438\u0447\u0435\u043d \u043f\u0443\u0431\u043b\u0438\u0447\u0435\u043d \u0440\u0435\u0433\u0438\u0441\u0442\u044a\u0440 \u043d\u0430 \u043a\u043b\u0430\u0434\u0435\u043d\u0446\u0438\u0442\u0435 \u0437\u0430 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438 \u043f\u043e\u0442\u0440\u0435\u0431\u043d\u043e\u0441\u0442\u0438."
                            : "\u041e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0430\u0442\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u0441\u044a\u0434\u044a\u0440\u0436\u0430 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f\u0442\u0430 \u0438 \u043e\u0431\u0440\u0430\u0437\u0446\u0438\u0442\u0435 \u0437\u0430 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f."}
                        </p>

                        {legalLocation.existingRegisterUrl && (
                          <a
                            href={legalLocation.existingRegisterUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 inline-flex rounded-xl bg-[#176f80] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#125c6a]"
                          >
                            {legalLocation.existingRegisterSearchable
                              ? "\u041f\u0440\u043e\u0432\u0435\u0440\u0438 \u0432 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438\u044f \u0440\u0435\u0433\u0438\u0441\u0442\u044a\u0440"
                              : "\u041e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u043d\u0430 \u0411\u0414"}
                          </a>
                        )}
                        {!legalLocation.existingRegisterUrl &&
                          legalLocation.existingRegisterLookupNote && (
                            <div className="mt-4 rounded-xl border border-[#cbdedf] bg-[#f7fbfb] p-4 text-sm leading-6 text-[#557078]">
                              <div className="font-bold text-[#355d62]">
                                {
                                  "\u041a\u0430\u043a \u0434\u0430 \u043f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u0435 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f\u0442\u0430:"
                                }
                              </div>
                              <div className="mt-2">
                                {legalLocation.existingRegisterLookupNote}
                              </div>
                            </div>
                          )}

                      </div>
                    )}

                  {(existingRegistration === "unregistered" ||
                    existingRegistration === "unknown") && (
                    <div className="mt-7 rounded-2xl border border-[#d7e4e2] bg-white p-5">
                      <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#5c7f7b]">
                        {
                          "\u0421\u0422\u042a\u041f\u041a\u0410 2"
                        }
                      </div>

                      <h3 className="mt-2 text-lg font-bold text-[#294f52]">
                        {
                          "\u0417\u0430 \u043a\u0430\u043a\u0432\u043e \u0441\u0435 \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430 \u0432\u043e\u0434\u0430\u0442\u0430?"
                        }
                      </h3>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        {[
                          [
                            "own",
                            "\u0417\u0430 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438 \u043d\u0443\u0436\u0434\u0438",
                          ],
                          [
                            "business",
                            "\u0417\u0430 \u0441\u0442\u043e\u043f\u0430\u043d\u0441\u043a\u0430 \u0434\u0435\u0439\u043d\u043e\u0441\u0442",
                          ],
                          [
                            "other",
                            "\u0414\u0440\u0443\u0433\u043e / \u043d\u0435 \u0441\u044a\u043c \u0441\u0438\u0433\u0443\u0440\u0435\u043d",
                          ],
                        ].map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => {
                              setExistingUse(
                                value as ExistingUse
                              );
                              setExistingAge(null);
                            }}
                            className={`rounded-xl border px-4 py-3 text-left text-sm font-bold transition ${
                              existingUse === value
                                ? "border-[#559a88] bg-[#edf8f4] text-[#235d4e]"
                                : "border-[#d4e1e2] bg-[#fbfdfd] text-[#45666c] hover:bg-[#f3f8f8]"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {existingUse === "own" &&
                    (existingRegistration === "unregistered" ||
                      existingRegistration === "unknown") && (
                      <div className="mt-6 rounded-2xl border border-[#d9e3d0] bg-[#fbfcf8] p-5">
                        <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#70805b]">
                          {
                            "\u0421\u0422\u042a\u041f\u041a\u0410 3"
                          }
                        </div>

                        <h3 className="mt-2 text-lg font-bold text-[#4b6240]">
                          {
                            "\u041f\u043e\u043f\u0430\u0434\u0430 \u043b\u0438 \u0441\u043e\u043d\u0434\u0430\u0436\u044a\u0442 \u0432 \u043f\u0440\u0435\u0445\u043e\u0434\u043d\u0438\u044f \u0440\u0435\u0436\u0438\u043c: \u0434\u043e 27.11.2018 \u0433. \u0437\u0430 \u043d\u0435\u0433\u043e \u043d\u0435 \u0435 \u043f\u043e\u0434\u0430\u0434\u0435\u043d\u043e \u0437\u0430\u044f\u0432\u043b\u0435\u043d\u0438\u0435 \u0437\u0430 \u0432\u043f\u0438\u0441\u0432\u0430\u043d\u0435?"
                          }
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-[#66705c]">
                          {
                            "\u0422\u043e\u0432\u0430 \u0435 \u0432\u0430\u0436\u043d\u0430 \u0437\u0430 \u043f\u0440\u0435\u0446\u0435\u043d\u043a\u0430\u0442\u0430 \u0434\u0430\u043b\u0438 \u0441\u043b\u0443\u0447\u0430\u044f\u0442 \u043f\u043e\u043f\u0430\u0434\u0430 \u0432 \u043f\u0440\u0435\u0445\u043e\u0434\u043d\u0438\u044f \u0440\u0435\u0436\u0438\u043c \u0437\u0430 \u0441\u0442\u0430\u0440\u0438 \u043d\u0435\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u0430\u043d\u0438 \u043a\u043b\u0430\u0434\u0435\u043d\u0446\u0438."
                          }
                        </p>

                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          {[
                            [
                              "before-2018",
                              "\u0414\u0430",
                            ],
                            [
                              "after-2018",
                              "\u041d\u0435",
                            ],
                            [
                              "unknown",
                              "\u041d\u0435 \u0437\u043d\u0430\u043c",
                            ],
                          ].map(([value, label]) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() =>
                                setExistingAge(
                                  value as ExistingAge
                                )
                              }
                              className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                                existingAge === value
                                  ? "border-[#879d6d] bg-[#f1f6e9] text-[#4d633e]"
                                  : "border-[#dce4d2] bg-white text-[#66705c] hover:bg-[#f7f9f4]"
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  {existingUse === "own" &&
                    existingAge === "before-2018" && (
                      <div className="mt-6 rounded-2xl border border-[#9fcdb7] bg-[#eef9f3] p-5">
                        <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#428067]">
                          {
                            "\u041f\u0420\u0415\u0425\u041e\u0414\u0415\u041d \u0420\u0415\u0416\u0418\u041c"
                          }
                        </div>

                        <h3 className="mt-2 text-xl font-bold text-[#205443]">
                          {
                            "\u0421\u0440\u043e\u043a\u044a\u0442 \u0437\u0430 \u043f\u043e\u0434\u0430\u0432\u0430\u043d\u0435 \u043d\u0430 \u0437\u0430\u044f\u0432\u043b\u0435\u043d\u0438\u0435 \u0435 \u0434\u043e 28.11.2039 \u0433."
                          }
                        </h3>

                        <p className="mt-3 text-sm leading-6 text-[#527067]">
                          {
                            "\u0417\u0430 \u043a\u043b\u0430\u0434\u0435\u043d\u0446\u0438 \u0437\u0430 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438 \u043f\u043e\u0442\u0440\u0435\u0431\u043d\u043e\u0441\u0442\u0438 \u043d\u0430 \u0433\u0440\u0430\u0436\u0434\u0430\u043d\u0438\u0442\u0435, \u043f\u043e\u043f\u0430\u0434\u0430\u0449\u0438 \u0432 \u0442\u043e\u0437\u0438 \u0440\u0435\u0436\u0438\u043c, \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f\u0442\u0430 \u0435 \u0431\u0435\u0437 \u0434\u044a\u0440\u0436\u0430\u0432\u043d\u0430 \u0442\u0430\u043a\u0441\u0430."
                          }
                        </p>

                        <div className="mt-4 rounded-xl border border-[#c8e0d4] bg-white p-4 text-sm leading-6 text-[#557168]">
                          <strong>
                            {
                              "\u0417\u0430\u044f\u0432\u043b\u0435\u043d\u0438\u0435\u0442\u043e \u0441\u044a\u0434\u044a\u0440\u0436\u0430:"
                            }
                          </strong>

                          <ul className="mt-2 space-y-1">
                            <li>
                              {
                                "\u2022 \u0434\u0430\u043d\u043d\u0438 \u0437\u0430 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438\u043a\u0430 \u0438 \u0438\u043c\u043e\u0442\u0430"
                              }
                            </li>
                            <li>
                              {
                                "\u2022 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430 \u0438 \u0434\u0438\u0430\u043c\u0435\u0442\u044a\u0440"
                              }
                            </li>
                            <li>
                              {
                                "\u2022 \u043d\u0430\u0447\u0438\u043d \u043d\u0430 \u0447\u0435\u0440\u043f\u0435\u043d\u0435"
                              }
                            </li>
                            <li>
                              {
                                "\u2022 \u0446\u0435\u043b, \u0437\u0430 \u043a\u043e\u044f\u0442\u043e \u0441\u0435 \u043f\u043e\u043b\u0437\u0432\u0430 \u0432\u043e\u0434\u0430\u0442\u0430"
                              }
                            </li>
                          </ul>

                        {/* RG2_OFFICIAL_FORM_LINK */}
                        {legalLocation?.formOldOwnUseRg2Url && (
                          <div className="mt-4">
                            <a
                              href={legalLocation.formOldOwnUseRg2Url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex rounded-xl bg-[#16825c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#126d4d]"
                            >
                              {
                                "\u0418\u0437\u0442\u0435\u0433\u043b\u0438 \u0420\u04132 \u2014 \u0437\u0430\u044f\u0432\u043b\u0435\u043d\u0438\u0435 \u0437\u0430 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f"
                              }
                            </a>

                            <p className="mt-2 text-xs leading-5 text-[#617a69]">
                              {
                                "\u0422\u043e\u0432\u0430 \u0435 \u043a\u043e\u043d\u043a\u0440\u0435\u0442\u043d\u0438\u044f\u0442 \u043e\u0431\u0440\u0430\u0437\u0435\u0446 \u0420\u04132 \u0437\u0430 \u0441\u0442\u0430\u0440 \u043d\u0435\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u0430\u043d \u043a\u043b\u0430\u0434\u0435\u043d\u0435\u0446 \u0437\u0430 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438 \u043f\u043e\u0442\u0440\u0435\u0431\u043d\u043e\u0441\u0442\u0438."
                              }
                            </p>
                          </div>
                        )}
                        </div>
                      </div>
                    )}

                  {existingUse === "own" &&
                    existingAge === "after-2018" && (
                      <div className="mt-6 rounded-2xl border border-[#d9c69f] bg-[#fffaf2] p-5">
                        <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#8a7046]">
                          {
                            "\u041d\u041e\u0420\u041c\u0410\u041b\u0415\u041d \u0420\u0415\u0416\u0418\u041c \u0417\u0410 \u0418\u0417\u0413\u0420\u0410\u0414\u0415\u041d \u0421\u041e\u041d\u0414\u0410\u0416"
                          }
                        </div>

                        <h3 className="mt-2 text-lg font-bold text-[#684f2c]">
                          {
                            "\u0422\u043e\u0437\u0438 \u0441\u043e\u043d\u0434\u0430\u0436 \u043d\u0435 \u043f\u043e\u043f\u0430\u0434\u0430 \u0432 \u043f\u0440\u0435\u0445\u043e\u0434\u043d\u0438\u044f \u0440\u0435\u0436\u0438\u043c \u0420\u04132."
                          }
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-[#74664e]">
                          {
                            "\u0417\u0430 \u0438\u0437\u0433\u0440\u0430\u0434\u0435\u043d \u043a\u043b\u0430\u0434\u0435\u043d\u0435\u0446 \u0437\u0430 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438 \u043f\u043e\u0442\u0440\u0435\u0431\u043d\u043e\u0441\u0442\u0438 \u0441\u0435 \u043f\u0440\u0438\u043b\u0430\u0433\u0430 \u043d\u043e\u0440\u043c\u0430\u043b\u043d\u0430\u0442\u0430 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f \u0441 \u0420\u04131."
                          }
                        </p>

                        <div className="mt-4 rounded-xl border border-[#e3d7bd] bg-white p-4">
                          <div className="font-bold text-[#684f2c]">
                            {
                              "\u041a\u0430\u043a\u0432\u043e \u0434\u0430 \u043d\u0430\u043f\u0440\u0430\u0432\u0438\u0442\u0435:"
                            }
                          </div>

                          <div className="mt-3 space-y-3 text-sm leading-6 text-[#6f6554]">
                            <div>
                              <strong>1.</strong>{" "}
                              {
                                "\u041f\u0440\u043e\u0432\u0435\u0440\u0435\u0442\u0435 \u0434\u0430\u043b\u0438 \u043f\u0440\u0435\u0434\u0438 \u0438\u0437\u0433\u0440\u0430\u0436\u0434\u0430\u043d\u0435\u0442\u043e \u0435 \u043f\u043e\u0434\u0430\u0434\u0435\u043d\u043e \u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u0435 \u0423\u04131 \u0437\u0430 \u043d\u0430\u043c\u0435\u0440\u0435\u043d\u0438\u0435 \u0437\u0430 \u0438\u0437\u0433\u0440\u0430\u0436\u0434\u0430\u043d\u0435."
                              }
                            </div>

                            <div>
                              <strong>2.</strong>{" "}
                              {
                                "\u0422\u044a\u0439 \u043a\u0430\u0442\u043e \u0441\u043e\u043d\u0434\u0430\u0436\u044a\u0442 \u0432\u0435\u0447\u0435 \u0435 \u0438\u0437\u0433\u0440\u0430\u0434\u0435\u043d, \u043f\u043e\u0434\u0430\u0439\u0442\u0435 \u0420\u04131 \u2014 \u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u0435 \u0437\u0430 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u0430\u043d\u0435 \u043d\u0430 \u0438\u0437\u0433\u0440\u0430\u0434\u0435\u043d \u043a\u043b\u0430\u0434\u0435\u043d\u0435\u0446."
                              }
                            </div>

                            <div>
                              <strong>3.</strong>{" "}
                              {
                                "\u0412 \u0420\u04131 \u0441\u0435 \u043f\u043e\u0441\u043e\u0447\u0432\u0430\u0442: \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438\u043a\u044a\u0442, \u0438\u043c\u043e\u0442\u044a\u0442, \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430\u0442\u0430, \u0434\u0438\u0430\u043c\u0435\u0442\u044a\u0440\u044a\u0442, \u043d\u0430\u0447\u0438\u043d\u044a\u0442 \u043d\u0430 \u0447\u0435\u0440\u043f\u0435\u043d\u0435 \u0438 \u0446\u0435\u043b\u0442\u0430 \u043d\u0430 \u043f\u043e\u043b\u0437\u0432\u0430\u043d\u0435."
                              }
                            </div>

                            <div>
                              <strong>4.</strong>{" "}
                              {
                                "\u0410\u043a\u043e \u043d\u044f\u043c\u0430\u0442\u0435 \u0434\u0430\u043d\u043d\u0438 \u0437\u0430 \u043f\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043b\u043d\u043e \u0423\u04131, \u0420\u04132 \u043d\u0435 \u0433\u043e \u0437\u0430\u043c\u0435\u0441\u0442\u0432\u0430. \u041f\u043e\u0434\u0430\u0432\u0430 \u0441\u0435 \u0420\u04131 \u0437\u0430 \u043d\u0430\u043b\u0438\u0447\u043d\u0438\u044f \u0441\u043e\u043d\u0434\u0430\u0436, \u0430 \u0411\u0430\u0441\u0435\u0439\u043d\u043e\u0432\u0430\u0442\u0430 \u0434\u0438\u0440\u0435\u043a\u0446\u0438\u044f \u043f\u0440\u0435\u0446\u0435\u043d\u044f\u0432\u0430 \u043e\u0431\u0441\u0442\u043e\u044f\u0442\u0435\u043b\u0441\u0442\u0432\u0430\u0442\u0430."
                              }
                            </div>
                          </div>

                          {legalLocation?.formNormalOwnUseRg1Url && (
                            <a
                              href={legalLocation.formNormalOwnUseRg1Url}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-4 inline-flex rounded-xl bg-[#b17728] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#95621f]"
                            >
                              {
                                "\u0418\u0437\u0442\u0435\u0433\u043b\u0438 \u0420\u04131 \u2014 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f \u043d\u0430 \u0438\u0437\u0433\u0440\u0430\u0434\u0435\u043d \u0441\u043e\u043d\u0434\u0430\u0436"
                              }
                            </a>
                          )}

                          {legalLocation?.existingRegisterUrl && (
                            <a
                              href={legalLocation.existingRegisterUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="ml-0 mt-3 inline-flex text-sm font-bold text-[#176f80] underline underline-offset-4 sm:ml-4"
                            >
                              {
                                "\u041f\u0440\u043e\u0432\u0435\u0440\u0438 \u0434\u0430\u043b\u0438 \u0441\u043e\u043d\u0434\u0430\u0436\u044a\u0442 \u0432\u0435\u0447\u0435 \u0435 \u0432 \u0440\u0435\u0433\u0438\u0441\u0442\u044a\u0440\u0430"
                              }
                            </a>
                          )}
                          {!legalLocation?.existingRegisterUrl &&
                            legalLocation?.existingRegisterLookupNote && (
                              <div className="mt-4 rounded-xl border border-[#cbdedf] bg-[#f7fbfb] p-4 text-sm leading-6 text-[#557078]">
                                <div className="font-bold text-[#355d62]">
                                  {
                                    "\u041a\u0430\u043a \u0434\u0430 \u043f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u0435 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f\u0442\u0430:"
                                  }
                                </div>
                                <div className="mt-2">
                                  {legalLocation.existingRegisterLookupNote}
                                </div>
                              </div>
                            )}

                        </div>
                      </div>
                    )}

                  {existingUse === "own" &&
                    existingAge === "unknown" && (
                      <div className="mt-6 rounded-2xl border border-[#cbd9dc] bg-white p-5">
                        <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#607b80]">
                          {
                            "\u0421\u041b\u0415\u0414\u0412\u0410\u0429\u0410 \u0421\u0422\u042a\u041f\u041a\u0410"
                          }
                        </div>

                        <h3 className="mt-2 text-lg font-bold text-[#355d62]">
                          {
                            "\u041d\u0435 \u0435 \u043d\u0443\u0436\u043d\u043e \u0434\u0430 \u0437\u043d\u0430\u0435\u0442\u0435 \u0433\u043e\u0434\u0438\u043d\u0430\u0442\u0430, \u0437\u0430 \u0434\u0430 \u043f\u0440\u043e\u0434\u044a\u043b\u0436\u0438\u043c \u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0430\u0442\u0430."
                          }
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-[#61777c]">
                          {
                            "\u041f\u044a\u0440\u0432\u043e \u043f\u0440\u043e\u0432\u0435\u0440\u0435\u0442\u0435 \u0434\u0430\u043b\u0438 \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u0435\u0442\u043e \u0432\u0435\u0447\u0435 \u0435 \u0432\u043f\u0438\u0441\u0430\u043d\u043e. \u0410\u043a\u043e \u043d\u0435 \u0435, \u043f\u0440\u043e\u0446\u0435\u0434\u0443\u0440\u0430\u0442\u0430 \u0437\u0430\u0432\u0438\u0441\u0438 \u043e\u0442 \u0442\u043e\u0432\u0430 \u0434\u0430\u043b\u0438 \u043a\u043b\u0430\u0434\u0435\u043d\u0435\u0446\u044a\u0442 \u0435 \u043e\u0442 \u043f\u0440\u0435\u0445\u043e\u0434\u043d\u0438\u044f \u0440\u0435\u0436\u0438\u043c \u0438\u043b\u0438 \u043e\u0442 \u043d\u043e\u0440\u043c\u0430\u043b\u043d\u0438\u044f \u0440\u0435\u0436\u0438\u043c."
                          }
                        </p>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-xl border border-[#c9decf] bg-[#f5fbf7] p-4">
                            <div className="font-bold text-[#37664f]">
                              {
                                "\u0410\u043a\u043e \u0441\u0435 \u0443\u0441\u0442\u0430\u043d\u043e\u0432\u0438, \u0447\u0435 \u0435 \u043e\u0442 \u043f\u0440\u0435\u0445\u043e\u0434\u043d\u0438\u044f \u0440\u0435\u0436\u0438\u043c"
                              }
                            </div>

                            <p className="mt-2 text-xs leading-5 text-[#617567]">
                              {
                                "\u0418\u0437\u043f\u043e\u043b\u0437\u0432\u0430 \u0441\u0435 \u0420\u04132. \u0421\u0440\u043e\u043a\u044a\u0442 \u0435 \u0434\u043e 28.11.2039 \u0433."
                              }
                            </p>

                            {legalLocation?.formOldOwnUseRg2Url && (
                              <a
                                href={legalLocation.formOldOwnUseRg2Url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex text-sm font-bold text-[#16825c] underline underline-offset-4"
                              >
                                {
                                  "\u0418\u0437\u0442\u0435\u0433\u043b\u0438 \u0420\u04132"
                                }
                              </a>
                            )}
                          </div>

                          <div className="rounded-xl border border-[#e0d3b9] bg-[#fffaf2] p-4">
                            <div className="font-bold text-[#745b38]">
                              {
                                "\u0410\u043a\u043e \u0435 \u0438\u0437\u0433\u0440\u0430\u0434\u0435\u043d \u043f\u043e \u043d\u043e\u0440\u043c\u0430\u043b\u043d\u0438\u044f \u0440\u0435\u0436\u0438\u043c"
                              }
                            </div>

                            <p className="mt-2 text-xs leading-5 text-[#756a56]">
                              {
                                "\u0417\u0430 \u043d\u0430\u043b\u0438\u0447\u043d\u0438\u044f \u0438\u0437\u0433\u0440\u0430\u0434\u0435\u043d \u0441\u043e\u043d\u0434\u0430\u0436 \u0441\u0435 \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430 \u0420\u04131."
                              }
                            </p>

                            {legalLocation?.formNormalOwnUseRg1Url && (
                              <a
                                href={legalLocation.formNormalOwnUseRg1Url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex text-sm font-bold text-[#9b6c25] underline underline-offset-4"
                              >
                                {
                                  "\u0418\u0437\u0442\u0435\u0433\u043b\u0438 \u0420\u04131"
                                }
                              </a>
                            )}
                          </div>
                        </div>

                        {legalLocation?.existingRegisterUrl && (
                          <div className="mt-4 rounded-xl border border-[#cbdedf] bg-[#f7fbfb] p-4">
                            <div className="font-bold text-[#355d62]">
                              {
                                "\u0417\u0430\u043f\u043e\u0447\u043d\u0435\u0442\u0435 \u043e\u0442 \u0442\u0443\u043a:"
                              }
                            </div>

                            <a
                              href={legalLocation.existingRegisterUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-flex rounded-xl bg-[#176f80] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#125c6a]"
                            >
                              {
                                "\u041f\u0440\u043e\u0432\u0435\u0440\u0438 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438\u044f \u0440\u0435\u0433\u0438\u0441\u0442\u044a\u0440"
                              }
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                  {existingUse === "business" && (
                    <div className="mt-6 rounded-2xl border border-[#dcc9ae] bg-[#fff9f1] p-5">
                      <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#8a7046]">
                        {
                          "\u0421\u0422\u041e\u041f\u0410\u041d\u0421\u041a\u041e \u0412\u041e\u0414\u041e\u0412\u0417\u0415\u041c\u0410\u041d\u0415"
                        }
                      </div>

                      <h3 className="mt-2 text-lg font-bold text-[#684f2c]">
                        {
                          "\u041f\u0440\u0438 \u0441\u0442\u043e\u043f\u0430\u043d\u0441\u043a\u043e \u043f\u043e\u043b\u0437\u0432\u0430\u043d\u0435 \u0441\u0430 \u043d\u0443\u0436\u043d\u0438 \u0434\u0432\u0435 \u043e\u0442\u0434\u0435\u043b\u043d\u0438 \u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0438."
                        }
                      </h3>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-[#e1d4bf] bg-white p-4">
                          <div className="font-bold text-[#684f2c]">
                            {
                              "1. \u0421\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u0435\u0442\u043e"
                            }
                          </div>
                          <p className="mt-2 text-sm leading-6 text-[#74664e]">
                            {
                              "\u0422\u0440\u044f\u0431\u0432\u0430 \u0434\u0430 \u0435 \u0432\u043f\u0438\u0441\u0430\u043d\u043e \u043a\u0430\u0442\u043e \u0432\u043e\u0434\u043e\u0432\u0437\u0435\u043c\u043d\u043e \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u0435 \u0437\u0430 \u0441\u0442\u043e\u043f\u0430\u043d\u0441\u043a\u0438 \u0446\u0435\u043b\u0438."
                            }
                          </p>
                        </div>

                        <div className="rounded-xl border border-[#e1d4bf] bg-white p-4">
                          <div className="font-bold text-[#684f2c]">
                            {
                              "2. \u0412\u043e\u0434\u043e\u0432\u0437\u0435\u043c\u0430\u043d\u0435\u0442\u043e"
                            }
                          </div>
                          <p className="mt-2 text-sm leading-6 text-[#74664e]">
                            {
                              "\u0417\u0430 \u0441\u0430\u043c\u043e\u0442\u043e \u0447\u0435\u0440\u043f\u0435\u043d\u0435 \u0437\u0430 \u0441\u0442\u043e\u043f\u0430\u043d\u0441\u043a\u0430 \u0434\u0435\u0439\u043d\u043e\u0441\u0442 \u0435 \u043d\u0443\u0436\u043d\u043e \u0434\u0435\u0439\u0441\u0442\u0432\u0430\u0449\u043e \u0440\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u0435\u043b\u043d\u043e \u0437\u0430 \u0432\u043e\u0434\u043e\u0432\u0437\u0435\u043c\u0430\u043d\u0435."
                            }
                          </p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="font-bold text-[#684f2c]">
                          {
                            "\u0418\u043c\u0430 \u043b\u0438 \u0432\u0435\u0447\u0435 \u0438\u0437\u0434\u0430\u0434\u0435\u043d\u043e \u0440\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u0435\u043b\u043d\u043e \u0437\u0430 \u0432\u043e\u0434\u043e\u0432\u0437\u0435\u043c\u0430\u043d\u0435?"
                          }
                        </div>

                        <div className="mt-3 grid gap-3 sm:grid-cols-3">
                          {[
                            ["yes", "\u0414\u0430"],
                            ["no", "\u041d\u0435"],
                            ["unknown", "\u041d\u0435 \u0437\u043d\u0430\u043c"],
                          ].map(([value, label]) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() =>
                                setExistingBusinessPermit(
                                  value as ExistingBusinessPermit
                                )
                              }
                              className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                                existingBusinessPermit === value
                                  ? "border-[#b88b4a] bg-white text-[#684f2c]"
                                  : "border-[#e0d3bd] bg-[#fffdf9] text-[#75684f]"
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {existingBusinessPermit === "no" && (
                        <div className="mt-5 rounded-xl border border-[#dfc69e] bg-white p-5">
                          <h4 className="font-bold text-[#684f2c]">
                            {
                              "\u041d\u0443\u0436\u043d\u043e \u0435 \u0440\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u0435\u043b\u043d\u043e \u0437\u0430 \u0432\u043e\u0434\u043e\u0432\u0437\u0435\u043c\u0430\u043d\u0435."
                            }
                          </h4>

                          <p className="mt-2 text-sm leading-6 text-[#74664e]">
                            {
                              "\u0422\u044a\u0439 \u043a\u0430\u0442\u043e \u0441\u043e\u043d\u0434\u0430\u0436\u044a\u0442 \u0432\u0435\u0447\u0435 \u0435 \u0438\u0437\u0433\u0440\u0430\u0434\u0435\u043d, \u043f\u0440\u0430\u0432\u0438\u043b\u043d\u0438\u044f\u0442 \u043e\u0431\u0440\u0430\u0437\u0435\u0446 \u0435 \u041e\u0431\u0440\u0430\u0437\u0435\u0446 15 \u2014 \u0437\u0430 \u0432\u043e\u0434\u043e\u0432\u0437\u0435\u043c\u0430\u043d\u0435 \u043e\u0442 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0438 \u0432\u043e\u0434\u0438 \u0447\u0440\u0435\u0437 \u0441\u044a\u0449\u0435\u0441\u0442\u0432\u0443\u0432\u0430\u0449\u043e \u0432\u043e\u0434\u043e\u0432\u0437\u0435\u043c\u043d\u043e \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u0435."
                            }
                          </p>

                          {legalLocation?.formExistingWellPermitUrl && (
                            <a
                              href={legalLocation.formExistingWellPermitUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-4 inline-flex rounded-xl bg-[#9a6b26] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#7f581f]"
                            >
                              {
                                "\u0418\u0437\u0442\u0435\u0433\u043b\u0438 \u041e\u0431\u0440\u0430\u0437\u0435\u0446 15"
                              }
                            </a>
                          )}

                          <div className="mt-4 text-sm leading-6 text-[#74664e]">
                            {
                              "\u041a\u044a\u043c \u0437\u0430\u044f\u0432\u043b\u0435\u043d\u0438\u0435\u0442\u043e \u0441\u0435 \u043f\u0440\u0438\u043b\u0430\u0433\u0430\u0442 \u0434\u0430\u043d\u043d\u0438 \u0437\u0430 \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u0435\u0442\u043e, \u0438\u043c\u043e\u0442\u0430, \u0438\u0441\u043a\u0430\u043d\u043e\u0442\u043e \u0432\u043e\u0434\u043d\u043e \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u0438 \u0446\u0435\u043b\u0442\u0430 \u043d\u0430 \u0432\u043e\u0434\u043e\u0432\u0437\u0435\u043c\u0430\u043d\u0435\u0442\u043e. \u0411\u0430\u0441\u0435\u0439\u043d\u043e\u0432\u0430\u0442\u0430 \u0434\u0438\u0440\u0435\u043a\u0446\u0438\u044f \u043f\u0440\u043e\u0432\u0435\u0440\u044f\u0432\u0430 \u0434\u043e\u043f\u0443\u0441\u0442\u0438\u043c\u043e\u0441\u0442\u0442\u0430 \u0438 \u043d\u0430\u043b\u0438\u0447\u043d\u0438\u044f \u0440\u0435\u0441\u0443\u0440\u0441."
                            }
                          </div>
                        </div>
                      )}

                      {existingBusinessPermit === "yes" && (
                        <div className="mt-5 rounded-xl border border-[#c9d9c9] bg-white p-5">
                          <h4 className="font-bold text-[#416246]">
                            {
                              "\u0410\u043a\u043e \u0440\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u0435\u043b\u043d\u043e\u0442\u043e \u0435 \u0432\u0430\u043b\u0438\u0434\u043d\u043e, \u043f\u043e\u043b\u0437\u0432\u0430\u0439\u0442\u0435 \u0432\u043e\u0434\u0430\u0442\u0430 \u0441\u0430\u043c\u043e \u0432 \u043d\u0435\u0433\u043e\u0432\u0438\u0442\u0435 \u0443\u0441\u043b\u043e\u0432\u0438\u044f."
                            }
                          </h4>

                          <p className="mt-2 text-sm leading-6 text-[#607363]">
                            {
                              "\u041f\u0440\u043e\u0432\u0435\u0440\u0435\u0442\u0435 \u0441\u0440\u043e\u043a\u0430, \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043d\u043e\u0442\u043e \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e, \u0446\u0435\u043b\u0442\u0430 \u043d\u0430 \u0432\u043e\u0434\u043e\u0432\u0437\u0435\u043c\u0430\u043d\u0435 \u0438 \u0432\u0441\u0438\u0447\u043a\u0438 \u043f\u043e\u0441\u0442\u0430\u0432\u0435\u043d\u0438 \u0443\u0441\u043b\u043e\u0432\u0438\u044f."
                            }
                          </p>

                          {legalLocation?.formAmendGroundwaterPermitUrl && (
                            <a
                              href={legalLocation.formAmendGroundwaterPermitUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-4 inline-flex rounded-xl border border-[#76957b] bg-[#f7fbf7] px-5 py-3 text-sm font-bold text-[#416246]"
                            >
                              {
                                "\u041e\u0431\u0440\u0430\u0437\u0435\u0446 32 \u2014 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0435 / \u043f\u0440\u043e\u0434\u044a\u043b\u0436\u0430\u0432\u0430\u043d\u0435 / \u043f\u0440\u0435\u0438\u0437\u0434\u0430\u0432\u0430\u043d\u0435"
                              }
                            </a>
                          )}
                        </div>
                      )}

                      {existingBusinessPermit === "unknown" && (
                        <div className="mt-5 rounded-xl border border-[#cbdedf] bg-white p-5">
                          <h4 className="font-bold text-[#355d62]">
                            {
                              "\u041f\u0440\u043e\u0432\u0435\u0440\u0435\u0442\u0435 \u043f\u0440\u0435\u0434\u0438 \u0434\u0430 \u043f\u043e\u0434\u0430\u0432\u0430\u0442\u0435 \u043d\u043e\u0432\u043e \u0437\u0430\u044f\u0432\u043b\u0435\u043d\u0438\u0435."
                            }
                          </h4>

                          <p className="mt-2 text-sm leading-6 text-[#61777c]">
                            {
                              "\u0412 \u0440\u0435\u0433\u0438\u0441\u0442\u044a\u0440\u0430 \u043d\u0430 \u0411\u0430\u0441\u0435\u0439\u043d\u043e\u0432\u0430\u0442\u0430 \u0434\u0438\u0440\u0435\u043a\u0446\u0438\u044f \u043f\u0440\u043e\u0432\u0435\u0440\u0435\u0442\u0435 \u0434\u0430\u043b\u0438 \u0438\u043c\u0430 \u0438\u0437\u0434\u0430\u0434\u0435\u043d\u043e \u0440\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u0435\u043b\u043d\u043e \u0437\u0430 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0438 \u0432\u043e\u0434\u0438 \u0437\u0430 \u0442\u043e\u0437\u0438 \u0438\u043c\u043e\u0442 / \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u0435."
                            }
                          </p>

                          <div className="mt-4 text-sm leading-6 text-[#61777c]">
                            {
                              "\u0410\u043a\u043e \u043d\u044f\u043c\u0430 \u0440\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u0435\u043b\u043d\u043e \u2014 \u043f\u044a\u0442\u044f\u0442 \u0435 \u041e\u0431\u0440\u0430\u0437\u0435\u0446 15. \u0410\u043a\u043e \u0438\u043c\u0430, \u043d\u043e \u0442\u0440\u044f\u0431\u0432\u0430 \u0434\u0430 \u0441\u0435 \u043f\u0440\u043e\u043c\u0435\u043d\u0438 \u0438\u043b\u0438 \u043f\u0440\u043e\u0434\u044a\u043b\u0436\u0438 \u2014 \u041e\u0431\u0440\u0430\u0437\u0435\u0446 32."
                            }
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {existingUse === "other" && (
                    <div className="mt-6 rounded-2xl border border-[#d5dedf] bg-white p-5">
                      <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#607b80]">
                        {
                          "\u041d\u0415\u041a\u0410 \u0423\u0422\u041e\u0427\u041d\u0418\u041c \u041f\u0420\u0415\u0414\u041d\u0410\u0417\u041d\u0410\u0427\u0415\u041d\u0418\u0415\u0422\u041e"
                        }
                      </div>

                      <h3 className="mt-2 text-lg font-bold text-[#355d62]">
                        {
                          "\u041a\u043e\u0435 \u043e\u043f\u0438\u0441\u0432\u0430 \u043d\u0430\u0439-\u0434\u043e\u0431\u0440\u0435 \u043a\u0430\u043a \u0441\u0435 \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430 \u0432\u043e\u0434\u0430\u0442\u0430?"
                        }
                      </h3>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {[
                          [
                            "household",
                            "\u0417\u0430 \u0434\u043e\u043c\u0430, \u0434\u0432\u043e\u0440\u0430, \u0433\u0440\u0430\u0434\u0438\u043d\u0430\u0442\u0430 \u0438\u043b\u0438 \u0436\u0438\u0432\u043e\u0442\u043d\u0438",
                          ],
                          [
                            "income",
                            "\u0417\u0430 \u0431\u0438\u0437\u043d\u0435\u0441, \u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0441\u0442\u0432\u043e, \u0443\u0441\u043b\u0443\u0433\u0430 \u0438\u043b\u0438 \u0434\u0435\u0439\u043d\u043e\u0441\u0442 \u0441 \u043f\u0440\u0438\u0445\u043e\u0434\u0438",
                          ],
                          [
                            "nonprofit",
                            "\u0417\u0430 \u0444\u0438\u0440\u043c\u0430 / \u043e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0446\u0438\u044f, \u043d\u043e \u043d\u0435 \u043c\u043e\u0433\u0430 \u0434\u0430 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f \u0440\u0435\u0436\u0438\u043c\u0430",
                          ],
                          [
                            "unknown",
                            "\u041d\u0435 \u0437\u043d\u0430\u043c \u043a\u0430\u043a \u0441\u0435 \u043a\u043b\u0430\u0441\u0438\u0444\u0438\u0446\u0438\u0440\u0430",
                          ],
                        ].map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() =>
                              setExistingOtherKind(
                                value as ExistingOtherKind
                              )
                            }
                            className={`rounded-xl border p-4 text-left text-sm font-bold transition ${
                              existingOtherKind === value
                                ? "border-[#729da1] bg-[#f4f9f9] text-[#355d62]"
                                : "border-[#d5e1e2] bg-white text-[#61777c]"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      {existingOtherKind === "household" && (
                        <div className="mt-5 rounded-xl border border-[#c9dfd4] bg-[#f5fbf7] p-4 text-sm leading-6 text-[#557168]">
                          <strong>
                            {
                              "\u0422\u043e\u0432\u0430 \u0435 \u0440\u0435\u0436\u0438\u043c \u201e\u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438 \u043f\u043e\u0442\u0440\u0435\u0431\u043d\u043e\u0441\u0442\u0438\u201c."
                            }
                          </strong>
                          <div className="mt-2">
                            {
                              "\u0412\u044a\u0440\u043d\u0435\u0442\u0435 \u0441\u0435 \u043d\u0430 \u201e\u0417\u0430 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438 \u043d\u0443\u0436\u0434\u0438\u201c. \u0422\u0430\u043c SONDI.BG \u0449\u0435 \u043f\u0440\u043e\u0432\u0435\u0440\u0438 \u0433\u043e\u0434\u0438\u043d\u0430\u0442\u0430 \u043d\u0430 \u0438\u0437\u0433\u0440\u0430\u0436\u0434\u0430\u043d\u0435 \u0438 \u0434\u0430\u043b\u0438 \u0441\u0435 \u043f\u0440\u0438\u043b\u0430\u0433\u0430 \u0420\u04131 \u0438\u043b\u0438 \u0420\u04132."
                            }
                          </div>
                        </div>
                      )}

                      {existingOtherKind === "income" && (
                        <div className="mt-5 rounded-xl border border-[#dfcfae] bg-[#fffaf2] p-4 text-sm leading-6 text-[#74664e]">
                          <strong>
                            {
                              "\u0422\u043e\u0432\u0430 \u0435 \u0441\u0442\u043e\u043f\u0430\u043d\u0441\u043a\u043e \u0432\u043e\u0434\u043e\u0432\u0437\u0435\u043c\u0430\u043d\u0435."
                            }
                          </strong>
                          <div className="mt-2">
                            {
                              "\u0418\u0437\u0431\u0435\u0440\u0435\u0442\u0435 \u201e\u0417\u0430 \u0441\u0442\u043e\u043f\u0430\u043d\u0441\u043a\u0430 \u0434\u0435\u0439\u043d\u043e\u0441\u0442\u201c. \u0429\u0435 \u043f\u0440\u043e\u0432\u0435\u0440\u0438\u043c \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f\u0442\u0430 \u043d\u0430 \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u0435\u0442\u043e \u0438 \u0440\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u0435\u043b\u043d\u043e\u0442\u043e."
                            }
                          </div>
                        </div>
                      )}

                      {existingOtherKind === "nonprofit" && (
                        <div className="mt-5 rounded-xl border border-[#d5d7e2] bg-[#f8f8fc] p-4 text-sm leading-6 text-[#626579]">
                          <strong>
                            {
                              "\u0422\u043e\u0437\u0438 \u0441\u043b\u0443\u0447\u0430\u0439 \u043d\u0435 \u0435 \u201e\u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438 \u043f\u043e\u0442\u0440\u0435\u0431\u043d\u043e\u0441\u0442\u0438 \u043d\u0430 \u0433\u0440\u0430\u0436\u0434\u0430\u043d\u0438\u043d\u201c."
                            }
                          </strong>
                          <div className="mt-2">
                            {
                              "\u0417\u0430 \u044e\u0440\u0438\u0434\u0438\u0447\u0435\u0441\u043a\u043e \u043b\u0438\u0446\u0435 \u0438\u043b\u0438 \u043e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0446\u0438\u044f \u0441\u0435 \u043f\u0440\u043e\u0432\u0435\u0440\u044f\u0432\u0430\u0442 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f\u0442\u0430 \u043d\u0430 \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u0435\u0442\u043e \u0438 \u0440\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u0435\u043b\u043d\u0438\u044f\u0442 \u0440\u0435\u0436\u0438\u043c \u0441\u043f\u043e\u0440\u0435\u0434 \u0446\u0435\u043b\u0442\u0430 \u043d\u0430 \u0432\u043e\u0434\u043e\u0432\u0437\u0435\u043c\u0430\u043d\u0435\u0442\u043e."
                            }
                          </div>
                        </div>
                      )}

                      {existingOtherKind === "unknown" && (
                        <div className="mt-5 rounded-xl border border-[#cbdedf] bg-[#f7fbfb] p-4 text-sm leading-6 text-[#557078]">
                          <strong>
                            {
                              "\u041e\u0442\u0433\u043e\u0432\u043e\u0440\u0435\u0442\u0435 \u0441\u0430\u043c\u043e \u043d\u0430 \u0435\u0434\u0438\u043d \u043f\u0440\u0430\u043a\u0442\u0438\u0447\u0435\u043d \u0432\u044a\u043f\u0440\u043e\u0441:"
                            }
                          </strong>
                          <div className="mt-2">
                            {
                              "\u0412\u043e\u0434\u0430\u0442\u0430 \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430 \u043b\u0438 \u0441\u0435 \u043f\u0440\u0438 \u0434\u0435\u0439\u043d\u043e\u0441\u0442, \u043e\u0442 \u043a\u043e\u044f\u0442\u043e \u0441\u0435 \u043f\u043e\u043b\u0443\u0447\u0430\u0432\u0430\u0442 \u043f\u0440\u0438\u0445\u043e\u0434\u0438, \u0441\u0442\u043e\u043a\u0438 \u0438\u043b\u0438 \u0443\u0441\u043b\u0443\u0433\u0438? \u0410\u043a\u043e \u0434\u0430 \u2014 \u0438\u0437\u0431\u0435\u0440\u0435\u0442\u0435 \u201e\u0417\u0430 \u0441\u0442\u043e\u043f\u0430\u043d\u0441\u043a\u0430 \u0434\u0435\u0439\u043d\u043e\u0441\u0442\u201c. \u0410\u043a\u043e \u043d\u0435 \u0438 \u0435 \u0441\u0430\u043c\u043e \u0437\u0430 \u0434\u043e\u043c\u0430 / \u0434\u0432\u043e\u0440\u0430 \u2014 \u201e\u0417\u0430 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438 \u043d\u0443\u0436\u0434\u0438\u201c."
                            }
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </section>
              )}

            {branch === "mineral" && (
              <section className="mt-8 rounded-3xl border border-[#e1ddd3] bg-[#fcfaf5] p-6 sm:p-7">
                <button
                  type="button"
                  onClick={reset}
                  className="text-sm font-semibold text-[#4d7b82] hover:text-[#173f48]"
                >
                  {
                    "\u2190 \u041d\u0430\u0437\u0430\u0434"
                  }
                </button>

                <div className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[#96784f]">
                  {
                    "\u041c\u0418\u041d\u0415\u0420\u0410\u041b\u041d\u0418 \u0412\u041e\u0414\u0418"
                  }
                </div>

                <h2 className="mt-2 text-2xl font-bold">
                  {
                    "\u041e\u0442\u0434\u0435\u043b\u0435\u043d \u043f\u0440\u0430\u0432\u0435\u043d \u0440\u0435\u0436\u0438\u043c"
                  }
                </h2>

                {mineralStage === "start" && (
                  <>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6f695d]">
                      {
                        "Изберете какво искате да направите. При минералните води режимът зависи от находището, собствеността, управлението, съоръжението и издадените разрешителни."
                      }
                    </p>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      {[
                        [
                          "existing-deposit",
                          "🏛️",
                          "Ползвам съществуващо находище",
                          "Проверка на находището, кой го управлява, наличния ресурс и приложимата процедура.",
                        ],
                        [
                          "new-facility",
                          "⛏️",
                          "Нов сондаж / ново съоръжение",
                          "Проверка какъв е режимът, ако планирате ново водовземно съоръжение за минерална вода.",
                        ],
                        /* MINERAL_REAL_LIFE_CARDS_V3 */
                        [
                          "has-permit",
                          "🌡️",
                          "При обикновен сондаж излезе топла вода",
                          "Сондирах за обикновена вода, но се появи топла или вероятно минерална вода. Какво трябва да направя и мога ли законно да я използвам?",
                        ],
                        [
                          "unknown-status",
                          "🏡",
                          "Топла вода под моя имот — какви са ми правата?",
                          "Чия е водата, могат ли да ми вземат имота и при какви условия мога законно да използвам топлата вода?",
                        ],
                        [                           "investment-denied",                           "⚖️",                           "Инвестирал съм, а ми отказват ползване",                           "Вложил съм средства в сондаж или проект, открита е минерална вода, но държавата или общината ограничава или отказва използването ѝ. Какви са ми правата?",                         ],
                        /* /MINERAL_REAL_LIFE_CARDS_V3 */
                      ].map(
                        ([
                          value,
                          icon,
                          title,
                          description,
                        ]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() =>
                              setMineralStage(
                                value as MineralStage
                              )
                            }
                            className="rounded-2xl border border-[#ded4c3] bg-white p-5 text-left transition hover:border-[#b99b6b] hover:bg-[#fffdf8] hover:shadow-md"
                          >
                            <div className="text-2xl">
                              {icon}
                            </div>

                            <div className="mt-3 font-bold text-[#684f2c]">
                              {title}
                            </div>

                            <div className="mt-2 text-sm leading-6 text-[#776d5d]">
                              {description}
                            </div>
                          </button>
                        )
                      )}
                    </div>
                  </>
                )}

                {mineralStage !== "start" && (
                  <div className="mt-6 rounded-2xl border border-[#ddcfb8] bg-white p-5">
                    <button
                      type="button"
                      onClick={() =>
                        setMineralStage("start")
                      }
                      className="text-sm font-semibold text-[#8a7046] hover:text-[#684f2c]"
                    >
                      {"← Назад към изборите"}
                    </button>

                    <div className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-[#96784f]">
                      {"ИЗБРАНА ПРОЦЕДУРА"}
                    </div>

                    <h3 className="mt-2 text-xl font-bold text-[#684f2c]">
                      {mineralStage === "existing-deposit"
                        ? "Ползвам съществуващо находище"
                        : mineralStage === "new-facility"
                          ? "Нов сондаж / ново съоръжение"
                          : mineralStage === "has-permit"
                            ? "При обикновен сондаж излезе топла вода"
                            : mineralStage === "unknown-status"
                              ? "Топла вода под моя имот — какви са ми правата?"
                              : "Инвестирал съм, а ми отказват ползване"}
                    </h3>

                    {/* MINERAL_ACCIDENTAL_HOT_WATER_V3 */}
                    {mineralStage === "has-permit" && (
                      <div className="mt-6 space-y-5">

                        <div className="rounded-2xl border border-[#d8c7a8] bg-[#fffaf1] p-5">
                          <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#8a7046]">
                            СЛУЧАЙНО ОТКРИТА ТОПЛА ВОДА
                          </div>

                          <h4 className="mt-2 text-xl font-bold leading-8 text-[#684f2c]">
                            Сондирах за обикновена вода, но излезе топла. Какво правя?
                          </h4>

                          <p className="mt-3 text-sm leading-6 text-[#746957]">
                            Самата температура е важен сигнал, но не е достатъчна сама по себе си, за да се приеме, че вече е доказана минерална вода. Първо трябва да се установи какъв водоизточник е достигнат и какъв правен режим се прилага.
                          </p>
                        </div>

                        {/* MINERAL_MEANING_RIGHTS_V2 */}

                        <div className="rounded-2xl border border-[#c8d9d4] bg-white p-5">
                          <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#397064]">
                            КАКВО ОЗНАЧАВА „МИНЕРАЛНА ВОДА“?
                          </div>

                          <p className="mt-3 text-sm leading-6 text-[#536762]">
                            Топла вода и минерална вода не са едно и също.
                          </p>

                          <div className="mt-4 grid gap-4 md:grid-cols-2">

                            <div className="rounded-xl border border-[#d5e3df] bg-[#f7fbfa] p-4">
                              <div className="font-bold text-[#28594f]">
                                🌡️ Топла / термална вода
                              </div>

                              <p className="mt-2 text-sm leading-6 text-[#60736e]">
                                Това описва температурата на водата. Подземната вода може да е топла заради дълбочината, геотермалния градиент и движението си през по-топли скални пластове.
                              </p>
                            </div>

                            <div className="rounded-xl border border-[#dfd0b8] bg-[#fffaf1] p-4">
                              <div className="font-bold text-[#684f2c]">
                                💧 Минерална вода
                              </div>

                              <p className="mt-2 text-sm leading-6 text-[#746957]">
                                При минералната вода се разглеждат произходът и устойчивите физико-химични характеристики — минерализация, йонен състав, специфични компоненти, температура и други показатели — както и официалният статут на водоизточника или находището.
                              </p>
                            </div>

                          </div>

                          <div className="mt-4 rounded-xl border border-[#d9c9ae] bg-[#fffdf8] p-4 text-sm leading-6 text-[#684f2c]">
                            <strong>Важно:</strong>{" "}
                            топлата вода не е автоматично минерална, а минералната вода не е задължително гореща. Има и минерални води с ниска температура.
                          </div>

                          <p className="mt-4 text-sm leading-6 text-[#746957]">
                            Затова само измерване на 30°C, 40°C или 50°C не е достатъчно, за да се определи правният статут на водата. Трябва да се установи какъв водоизточник е достигнат и дали той е част от известно минерално находище или ново минерално проявление.
                          </p>
                        </div>

                        <div className="rounded-2xl border border-[#b9d8cf] bg-[#f4fbf8] p-5">
                          <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#397064]">
                            КАКВИ СА МОИТЕ ПРАВА?
                          </div>

                          <div className="mt-4 space-y-4 text-sm leading-6 text-[#536762]">

                            <div className="flex gap-3">
                              <span className="font-bold text-[#2f7668]">✓</span>
                              <div>
                                <strong>Имате право да бъде установено какъв водоизточник сте достигнали.</strong>
                                {" "}Трябва да се изясни находището или водното тяло, приложимият режим и компетентният орган.
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <span className="font-bold text-[#2f7668]">✓</span>
                              <div>
                                <strong>Не губите автоматично собствеността върху имота си.</strong>
                                {" "}Режимът на минералната вода е отделен от собствеността върху земята.
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <span className="font-bold text-[#2f7668]">✓</span>
                              <div>
                                <strong>Можете да поискате законно ползване на водата, когато конкретният режим го допуска.</strong>
                                {" "}Компетентният орган преценява заявлението според находището, свободния ресурс, предназначението и допустимия заявител.
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <span className="font-bold text-[#2f7668]">✓</span>
                              <div>
                                <strong>Случайното откриване на топла вода само по себе си не означава, че сте извършили нарушение.</strong>
                                {" "}От значение е по какъв ред е започнат сондажът и какво предприемате след откриването.
                              </div>
                            </div>

                          </div>

                          <div className="mt-5 rounded-xl border border-[#e1c5b8] bg-[#fff8f4] p-4">
                            <div className="font-bold text-[#8a5a45]">
                              Какво право нямам автоматично?
                            </div>

                            <p className="mt-2 text-sm leading-6 text-[#76584b]">
                              Не възниква автоматично право да изпомпвате, продавате, подавате към басейн, хотел или друг обект само защото водата е открита в сондаж във вашия имот. Правото за водовземане се урежда отделно.
                            </p>
                          </div>

                        </div>

                        {/* /MINERAL_MEANING_RIGHTS_V2 */}
                        <div className="rounded-2xl border border-[#bdd7d0] bg-[#f4fbf8] p-5">
                          <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#397064]">
                            КАКВО ДА НАПРАВЯ ВЕДНАГА
                          </div>

                          <div className="mt-4 space-y-4 text-sm leading-6 text-[#536762]">

                            <div className="flex gap-3">
                              <strong className="text-[#397064]">
                                1.
                              </strong>

                              <div>
                                Не започвайте автоматично да използвате водата като обикновен частен сондаж. Запишете дълбочината, температурата, приблизителния дебит и точните координати.
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <strong className="text-[#397064]">
                                2.
                              </strong>

                              <div>
                                Проверява се има ли известно минерално находище, минерален сондаж или друг официално установен минерален водоизточник в района.
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <strong className="text-[#397064]">
                                3.
                              </strong>

                              <div>
                                Установява се кой е компетентният орган и какъв режим важи за конкретното място и водоизточник.
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <strong className="text-[#397064]">
                                4.
                              </strong>

                              <div>
                                Ако водата бъде установена като минерална, не трябва да продължавате по режима за обикновен сондаж. Трябва да се приложи специалният режим за минералната вода.
                              </div>
                            </div>

                          </div>
                        </div>

                        <div className="rounded-xl border border-[#e1c5b8] bg-[#fff8f4] p-5">
                          <div className="text-xs font-bold uppercase tracking-[0.1em] text-[#8a5a45]">
                            ЩЕ МЕ НАКАРАТ ЛИ ДА ЗАТВОРЯ СОНДАЖА?
                          </div>

                          <p className="mt-2 text-sm leading-6 text-[#76584b]">
                            Не може автоматично да се каже „да“ за всеки случай. Важно е да не започва нерегламентирано водовземане и да не се уврежда водоносният хоризонт. Какво следва със съоръжението зависи от установения водоизточник и от документите, с които е започнат сондажът.
                          </p>
                        </div>

                        <div className="rounded-xl border border-[#d8c7a8] bg-white p-5">
                          <div className="text-xs font-bold uppercase tracking-[0.1em] text-[#8a7046]">
                            МОГА ЛИ ДА ЗАПАЗЯ И ДА ПОЛЗВАМ ВОДАТА?
                          </div>

                          <p className="mt-2 text-sm leading-6 text-[#746957]">
                            Възможно е да има законов път за ползване. Това обаче зависи от собствеността и управлението на водата, наличния ресурс, предназначението и дали конкретният режим допуска вас като заявител. Самото откриване на водата не създава автоматично право за водовземане.
                          </p>
                        </div>

                        <div className="rounded-xl border border-[#bfd8d2] bg-[#f5fbf9] p-5">
                          <div className="text-xs font-bold uppercase tracking-[0.1em] text-[#397064]">
                            ПРОВЕРИ ТОЧНОТО МЯСТО
                          </div>

                          <p className="mt-2 text-sm leading-6 text-[#64777a]">
                            Изберете точната точка на сондажа. SONDI.BG ще провери известните минерални находища и съоръжения около мястото и наличния им правен контекст.
                          </p>

                          <button
                            type="button"
                            onClick={openLegalMap}
                            className="mt-4 rounded-xl bg-[#28594f] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#214c43]"
                          >
                            Провери сондажа на картата
                          </button>
                        </div>

                      </div>
                    )}
                    {/* /MINERAL_ACCIDENTAL_HOT_WATER_V3 */}

                    {/* MINERAL_PRIVATE_PROPERTY_V3 */}
                    {mineralStage === "unknown-status" && (
                      <div className="mt-6 space-y-5">

                        <div className="rounded-2xl border border-[#bdd7d0] bg-[#f4fbf8] p-5">
                          <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#397064]">
                            ТОПЛА ВОДА ПОД МОЯ ИМОТ
                          </div>

                          <h4 className="mt-2 text-xl font-bold leading-8 text-[#28594f]">
                            Не — само защото под имота има минерална вода, не означава, че автоматично ще ви вземат имота.
                          </h4>

                          <p className="mt-3 text-sm leading-6 text-[#536762]">
                            Собствеността върху земята и собствеността или правният режим на минералната вода са различни неща. Имотът може да е ваш, а минералната вода да е публична държавна или публична общинска собственост.
                          </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">

                          <div className="rounded-xl border border-[#b9d8cf] bg-white p-5">
                            <div className="text-xs font-bold uppercase tracking-[0.1em] text-[#397064]">
                              МОЯТ ИМОТ
                            </div>

                            <p className="mt-3 text-sm leading-6 text-[#536762]">
                              Откриването на минерална вода само по себе си не прехвърля собствеността върху частния ви парцел на държавата или общината.
                            </p>
                          </div>

                          <div className="rounded-xl border border-[#e2c8b9] bg-white p-5">
                            <div className="text-xs font-bold uppercase tracking-[0.1em] text-[#8a5a45]">
                              ВОДАТА
                            </div>

                            <p className="mt-3 text-sm leading-6 text-[#76584b]">
                              Това, че земята е ваша, не означава автоматично, че имате право да изпомпвате минералната вода или да я използвате за къща, басейн, хотел или друг бизнес.
                            </p>
                          </div>

                        </div>

                        <div className="rounded-xl border border-[#d8c7a8] bg-[#fffaf1] p-5">
                          <div className="text-xs font-bold uppercase tracking-[0.1em] text-[#8a7046]">
                            В ГРАДА ИМА МИНЕРАЛНА ВОДА. ХОТЕЛ Я ПОЛЗВА. МОГА ЛИ И АЗ?
                          </div>

                          <p className="mt-2 text-sm leading-6 text-[#746957]">
                            Не автоматично. Хотелът може да използва конкретно съоръжение по отделно разрешително, с определен дебит, срок и предназначение.
                          </p>

                          <p className="mt-3 text-sm leading-6 text-[#746957]">
                            За вашата къща трябва отделно да се установи кое е находището, кой го управлява, има ли свободен ресурс и дали конкретният режим допуска физическо лице като заявител.
                          </p>
                        </div>

                        <div className="rounded-xl border border-[#d8c7a8] bg-white p-5">
                          <div className="text-xs font-bold uppercase tracking-[0.1em] text-[#8a7046]">
                            АКО ИСКАМ СПА, ХОТЕЛ, БАСЕЙН ИЛИ БИЗНЕС
                          </div>

                          <p className="mt-2 text-sm leading-6 text-[#746957]">
                            Тогава първо се установяват конкретният водоизточник, наличният ресурс и правото за водовземане. След това се определят допустимият дебит, предназначението и останалите процедури по инвестиционния проект.
                          </p>

                          <div className="mt-4 rounded-lg border border-[#e0d4c1] bg-[#fffaf1] p-4 text-sm font-semibold leading-6 text-[#684f2c]">
                            „Има топла вода под имота“ не означава автоматично „имам право да изградя СПА и да я използвам“.
                          </div>
                        </div>

                        <div className="rounded-xl border border-[#c9b27f] bg-[#fffaf1] p-5">
                          <div className="text-xs font-bold uppercase tracking-[0.1em] text-[#8a642c]">
                            РАЗРЕШИТЕЛНО ИЛИ КОНЦЕСИЯ?
                          </div>

                          <p className="mt-2 text-sm leading-6 text-[#746957]">
                            Това са различни правни механизми. За много практически случаи първият въпрос е какво право за водовземане е приложимо към конкретното находище и конкретния потребител.
                          </p>

                          <p className="mt-3 text-sm leading-6 text-[#746957]">
                            Не трябва автоматично да се приема, че собственик на къща, хотел или басейн трябва непременно да „вземе концесия“.
                          </p>
                        </div>

                        <div className="rounded-xl border border-[#bfd8d2] bg-[#f5fbf9] p-5">
                          <div className="text-xs font-bold uppercase tracking-[0.1em] text-[#397064]">
                            ПРОВЕРИ МОЯ ИМОТ
                          </div>

                          <p className="mt-2 text-sm leading-6 text-[#64777a]">
                            Посочете точната точка на имота. SONDI.BG ще провери известните минерални находища и съоръжения наоколо и потвърдения правен режим.
                          </p>

                          <button
                            type="button"
                            onClick={openLegalMap}
                            className="mt-4 rounded-xl bg-[#28594f] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#214c43]"
                          >
                            Избери имота на картата
                          </button>
                        </div>

                      </div>
                    )}
                    {/* /MINERAL_PRIVATE_PROPERTY_V3 */}
                    {/* MINERAL_INVESTMENT_DENIED_V1 */}
                    {mineralStage === "investment-denied" && (
                      <div className="mt-6 space-y-5">

                        <div className="rounded-2xl border border-[#d8c7a8] bg-[#fffaf1] p-5">
                          <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#8a7046]">
                            НАПРАВИЛ СЪМ ИНВЕСТИЦИЯ
                          </div>

                          <h4 className="mt-2 text-xl font-bold leading-8 text-[#684f2c]">
                            Вложил съм хиляди в сондаж, открил съм минерална вода, а сега ми казват, че не мога да я използвам. Какво следва?
                          </h4>

                          <p className="mt-3 text-sm leading-6 text-[#746957]">
                            Самата инвестиция не създава автоматично право върху минералната вода. Но и направената законна инвестиция не е без значение. Трябва да се провери с какво правно основание е започнат проектът, какво е установено при сондирането и на какво точно правно основание администрацията ограничава ползването.
                          </p>
                        </div>

                        <div className="rounded-2xl border border-[#bdd7d0] bg-[#f4fbf8] p-5">
                          <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#397064]">
                            ПЪРВИЯТ ВЪПРОС Е: КАКВО ТОЧНО ВИ ОТКАЗВАТ?
                          </div>

                          <div className="mt-4 space-y-3 text-sm leading-6 text-[#536762]">

                            <div>
                              <strong>Устно ви казват, че не може.</strong>
                              {" "}Устното становище не е същото като мотивиран административен акт.
                            </div>

                            <div>
                              <strong>Отказват да издадат разрешително.</strong>
                              {" "}Тогава трябва да се видят конкретните мотиви — липса на ресурс, недопустим заявител, режим на находището, защита на водоизточника или друго законово основание.
                            </div>

                            <div>
                              <strong>Имате разрешително, но искат да го изменят, прекратят или отнемат.</strong>
                              {" "}Това е различна ситуация и трябва да се проверят условията на самото разрешително, законовото основание и процедурата, по която администрацията действа.
                            </div>

                            <div>
                              <strong>Забраняват експлоатацията на самия сондаж.</strong>
                              {" "}Трябва да се установи дали проблемът е в съоръжението, в правото за водовземане, в режима на минералната вода или в друга процедура.
                            </div>

                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#d8c7a8] bg-white p-5">
                          <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#8a7046]">
                            КАКВО ЗНАЧЕНИЕ ИМА, ЧЕ ВЕЧЕ СЪМ ИНВЕСТИРАЛ?
                          </div>

                          <p className="mt-3 text-sm leading-6 text-[#746957]">
                            Разходите сами по себе си не превръщат минералната вода във ваша собственост и не гарантират разрешение за водовземане.
                          </p>

                          <p className="mt-3 text-sm leading-6 text-[#746957]">
                            Но ако инвестицията е направена въз основа на издадени разрешения, съгласувания, административни актове или действия на компетентните органи, тези обстоятелства трябва да бъдат отчетени при последващо решение, което засяга вече създадени права или направена инвестиция.
                          </p>

                          <p className="mt-3 text-sm leading-6 text-[#746957]">
                            Особено важно е дали ограниченията са били известни предварително или са възникнали след проучването и изграждането на съоръжението.
                          </p>
                        </div>

                        <div className="rounded-2xl border border-[#e1c5b8] bg-[#fff8f4] p-5">
                          <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#8a5a45]">
                            КОГА ОТКАЗЪТ МОЖЕ ДА Е ЗАКОНОСЪОБРАЗЕН?
                          </div>

                          <div className="mt-4 space-y-3 text-sm leading-6 text-[#76584b]">

                            <div>
                              • Няма наличен свободен ресурс за поисканото водно количество.
                            </div>

                            <div>
                              • Исканото ползване противоречи на приложимия режим или на ограничения за опазване на находището.
                            </div>

                            <div>
                              • Заявителят не е сред лицата, които могат да получат право при конкретния режим.
                            </div>

                            <div>
                              • Искането е към орган, който не е компетентен за конкретното находище или участък.
                            </div>

                            <div>
                              • Проектът изисква допълнителни строителни, екологични, санитарни или други разрешения, които не са изпълнени.
                            </div>

                            <div>
                              • Нарушени са условия на вече издадено разрешително и законът допуска изменение, прекратяване или отнемане.
                            </div>

                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#b9d8cf] bg-[#f4fbf8] p-5">
                          <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#397064]">
                            КОГА ИМА СМИСЪЛ ДА СЕ ПРОВЕРИ ИЛИ ОСПОРИ РЕШЕНИЕТО?
                          </div>

                          <div className="mt-4 space-y-3 text-sm leading-6 text-[#536762]">

                            <div>
                              ✓ Не е посочено ясно правното основание за отказа.
                            </div>

                            <div>
                              ✓ Решението е издадено от орган, чиято компетентност е спорна.
                            </div>

                            <div>
                              ✓ Не са разгледани представени доказателства, разрешения или вече направени законни инвестиции.
                            </div>

                            <div>
                              ✓ Администрацията се позовава на собствено неизпълнено задължение или на обстоятелство, върху което инвеститорът не е имал контрол.
                            </div>

                            <div>
                              ✓ Приложена е най-тежката мярка, без да се обясни защо по-лека законосъобразна мярка не е достатъчна.
                            </div>

                            <div>
                              ✓ Има действащо разрешително, но се твърди, че трябва да бъде отнето, без да са изпълнени условията за това.
                            </div>

                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#c9b27f] bg-[#fffaf1] p-5">
                          <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#8a642c]">
                            РЕАЛЕН ПРИМЕР: „БАНСКО ТЕРМЕ“
                          </div>
                          {/* BANSKO_TERME_CASE_DETAILS_V1 */}
                          <div className="mt-3 rounded-xl border border-[#dfd0b8] bg-white p-4">
                            <div className="text-sm font-bold text-[#684f2c]">
                              Адм. дело №2411/2023 г.
                            </div>

                            <div className="mt-1 text-sm text-[#746957]">
                              Решение №5898 от 09.10.2023 г.
                            </div>

                            <div className="mt-1 text-sm text-[#746957]">
                              Административен съд София-град · Второ отделение · 48 състав
                            </div>

                            <div className="mt-3 text-sm leading-6 text-[#746957]">
                              Жалбоподател: „Банско Терме“ ЕООД
                            </div>

                            <div className="mt-1 text-sm leading-6 text-[#746957]">
                              Предмет: оспорване на решение за отнемане на разрешително за водовземане от минерална вода.
                            </div>
                          </div>
                          {/* /BANSKO_TERME_CASE_DETAILS_V1 */}

                          <p className="mt-3 text-sm leading-6 text-[#746957]">
                            В съдебен спор за минерална вода дружеството оспорва отнемането на вече издадено разрешително за водовземане.
                          </p>

                          <p className="mt-3 text-sm leading-6 text-[#746957]">
                            Съдът отменя административния акт. Сред мотивите са, че засегнатата страна не е получила необходимата възможност да участва и да изложи възраженията си, че не са били изпълнени предпоставките за отнемане според разрешителното и че администрацията не е мотивирала защо избира най-тежката мярка вместо други възможни действия.
                          </p>

                          <div className="mt-4 rounded-lg border border-[#d8c7a8] bg-white p-4 text-sm leading-6 text-[#684f2c]">
                            <strong>Какво показва този пример?</strong>
                            {" "}Не че всеки инвеститор непременно ще спечели спор, а че отказът, прекратяването или отнемането на право трябва да имат конкретно правно основание, да са издадени по правилната процедура и могат да бъдат проверени от съд.
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#d8c7a8] bg-white p-5">
                          <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#8a7046]">
                            КАКВО ТРЯБВА ДА ИЗИСКАМ ОТ АДМИНИСТРАЦИЯТА?
                          </div>

                          <div className="mt-4 space-y-3 text-sm leading-6 text-[#746957]">

                            <div>
                              <strong>1. Писмен акт.</strong>
                              {" "}Не разчитайте само на устно „не може“.
                            </div>

                            <div>
                              <strong>2. Точно правно основание.</strong>
                              {" "}Коя разпоредба и кой режим се прилагат към конкретния водоизточник.
                            </div>

                            <div>
                              <strong>3. Кой е компетентният орган.</strong>
                              {" "}Басейнова дирекция, община или друг орган според конкретния режим.
                            </div>

                            <div>
                              <strong>4. Конкретни мотиви.</strong>
                              {" "}Има ли липса на ресурс, ограничение за предназначението, проблем със съоръжението или нарушение на условие.
                            </div>

                            <div>
                              <strong>5. Има ли законен алтернативен път.</strong>
                              {" "}Ново заявление, изменение на разрешително, друг допустим дебит, друго предназначение или друг приложим административен ред.
                            </div>

                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#bdd7d0] bg-[#f4fbf8] p-5">
                          <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#397064]">
                            НАЙ-ВАЖНОТО
                          </div>

                          <p className="mt-3 text-sm font-semibold leading-6 text-[#28594f]">
                            Инвестицията не ви дава автоматично право върху минералната вода. Но администрацията също не може да пренебрегне процедурата, вече издадените права и релевантните факти и просто да приключи въпроса с „забраняваме ви“.
                          </p>

                          <p className="mt-3 text-sm leading-6 text-[#536762]">
                            Трябва да има конкретен режим, компетентен орган, мотивиран акт и законово основание. Когато такъв акт засяга ваши права или законни интереси, той може да подлежи на административен и съдебен контрол по приложимия ред.
                          </p>
                        </div>

                        <div className="rounded-xl border border-[#e0d4c1] bg-[#fffdf8] p-4 text-xs leading-5 text-[#7b6b58]">
                          Тази информация е обща правна ориентация. При реален отказ, заповед за спиране или отнемане на разрешително трябва да се анализира самият административен акт, защото правата и сроковете за оспорване зависят от конкретния документ.
                        </div>

                      </div>
                    )}
                    {/* /MINERAL_INVESTMENT_DENIED_V1 */}
                    {mineralStage === "new-facility" && (
                      <div className="mt-6 space-y-5">
                        <div className="rounded-2xl border border-[#dccfb9] bg-[#fffdf8] p-5">
                          <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#8a7046]">
                            {
                              "НОВО СЪОРЪЖЕНИЕ · СТЪПКА 1"
                            }
                          </div>

                          <h4 className="mt-2 text-lg font-bold text-[#684f2c]">
                            {
                              "Къде планирате новия сондаж или съоръжение?"
                            }
                          </h4>

                          <p className="mt-2 text-sm leading-6 text-[#746957]">
                            {
                              "Първо проверяваме дали около мястото има представено минерално находище или водовземно съоръжение и какъв е правният му статус."
                            }
                          </p>

                          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                            <input
                              type="text"
                              value={settlementQuery}
                              onChange={(event) => {
                                setSettlementQuery(
                                  event.target.value
                                );
                              }}
                              onKeyDown={(event) => {
                                if (
                                  event.key === "Enter"
                                ) {
                                  event.preventDefault();

                                  searchNewMineralFacilityLocation();
                                }
                              }}
                              placeholder={
                                "Напр. Хисаря, Велинград, Баня"
                              }
                              className="min-w-0 flex-1 rounded-xl border border-[#d6c8ae] bg-white px-4 py-3 text-[#684f2c] outline-none focus:border-[#ad8a55]"
                            />

                            <button
                              type="button"
                              onClick={
                                searchNewMineralFacilityLocation
                              }
                              disabled={
                                !settlementQuery.trim() ||
                                locationLoading
                              }
                              className="rounded-xl bg-[#9a6b26] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#80581f] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {locationLoading
                                ? "Проверка..."
                                : "Провери мястото"}
                            </button>
                          </div>

                          {newMineralFacilityError && (
                            <div className="mt-4 rounded-xl border border-[#e2cbb9] bg-[#fff8f3] p-4 text-sm text-[#765746]">
                              {
                                newMineralFacilityError
                              }
                            </div>
                          )}

                          {newMineralFacilityCandidates
                            .length > 1 &&
                            !newMineralFacilityLocation && (
                              <div className="mt-5 space-y-2">
                                <div className="text-sm font-bold text-[#745a2e]">
                                  {
                                    "Изберете правилното място:"
                                  }
                                </div>

                                {newMineralFacilityCandidates.map(
                                  (
                                    candidate,
                                    index
                                  ) => (
                                    <button
                                      key={`${candidate.lat}-${candidate.lng}-${index}`}
                                      type="button"
                                      onClick={() =>
                                        selectNewMineralFacilityLocation(
                                          candidate
                                        )
                                      }
                                      className="block w-full rounded-xl border border-[#ddd0b8] bg-white px-4 py-3 text-left text-sm text-[#684f2c] transition hover:border-[#b99b6b] hover:bg-[#fffdf8]"
                                    >
                                      {
                                        candidate.label
                                      }
                                    </button>
                                  )
                                )}
                              </div>
                            )}
                        </div>

                        {newMineralFacilityLocation && (
                          <div className="rounded-2xl border border-[#d8c7a8] bg-[#fffaf1] p-5">
                            <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#8a7046]">
                              {
                                "ПРОВЕРКА НА РАЙОНА"
                              }
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-4">
                              {[
                                [
                                  "до 1 km",
                                  newMineralFacilityLocation
                                    .mineralContext
                                    ?.within1Km || 0,
                                ],
                                [
                                  "до 5 km",
                                  newMineralFacilityLocation
                                    .mineralContext
                                    ?.within5Km || 0,
                                ],
                                [
                                  "до 10 km",
                                  newMineralFacilityLocation
                                    .mineralContext
                                    ?.within10Km || 0,
                                ],
                                [
                                  "до 25 km",
                                  newMineralFacilityLocation
                                    .mineralContext
                                    ?.within25Km || 0,
                                ],
                              ].map(
                                ([label, value]) => (
                                  <div
                                    key={String(label)}
                                    className="rounded-xl border border-[#e2d6c2] bg-white p-3"
                                  >
                                    <div className="text-xs text-[#84745d]">
                                      {label}
                                    </div>

                                    <div className="mt-1 text-xl font-bold text-[#684f2c]">
                                      {value}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>

                            {newMineralFacilityLocation
                              .mineralContext
                              ?.nearbyFacilities
                              ?.length ? (
                              <div className="mt-5 space-y-3">
                                <div className="text-sm font-bold text-[#684f2c]">
                                  {
                                    "Най-близки минерални съоръжения"
                                  }
                                </div>

                                {newMineralFacilityLocation.mineralContext.nearbyFacilities
                                  .slice(0, 5)
                                  .map(
                                    (facility) => (
                                      <div
                                        key={
                                          facility.mineralId
                                        }
                                        className="rounded-xl border border-[#dccfb9] bg-white p-4"
                                      >
                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                                          <div>
                                            <div className="font-bold text-[#684f2c]">
                                              {
                                                facility.name
                                              }
                                            </div>

                                            <div className="mt-1 text-xs text-[#84745d]">
                                              {facility.deposit ||
                                                "Находище без изведено име"}
                                            </div>
                                          </div>

                                          <div className="text-sm font-bold text-[#8a7046]">
                                            {facility.distanceKm.toFixed(
                                              2
                                            )}{" "}
                                            km
                                          </div>
                                        </div>

                                        {facility.legal && (
                                          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                                            <div>
                                              <span className="text-[#897967]">
                                                {
                                                  "Собственост: "
                                                }
                                              </span>
                                              <strong>
                                                {formatLegalOwnershipStatus(
                                                  facility.legal
                                                    .ownershipStatus
                                                )}
                                              </strong>
                                            </div>

                                            <div>
                                              <span className="text-[#897967]">
                                                {
                                                  "Управление: "
                                                }
                                              </span>
                                              <strong>
                                                {formatLegalManagementStatus(
                                                  facility.legal
                                                    .section
                                                    ?.managementStatus ||
                                                    facility.legal
                                                      .managementStatus
                                                )}
                                              </strong>
                                            </div>
                                          </div>
                                        )}

                                      </div>
                                    )
                                  )}

                              </div>
                            ) : (
                              <div className="mt-5 rounded-xl border border-[#e2d6c2] bg-white p-4 text-sm leading-6 text-[#746957]">
                                {
                                  "В радиус до 25 km няма минерално водовземно съоръжение с координати в текущата база на SONDI.BG. Това не означава, че районът няма минерални води и не е достатъчно основание за започване на сондаж."
                                }
                              </div>
                            )}


                            {/* NEW_MINERAL_LOCATION_ASSESSMENT_V1 */}
                            <div className="mt-5 rounded-2xl border border-[#d8c7a8] bg-[#fffaf1] p-5">
                              <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#96784f]">
                                КАКВО ОЗНАЧАВА ТОВА ЗА ПЛАНИРАНИЯ НОВ СОНДАЖ
                              </div>

                              <h4 className="mt-2 text-lg font-bold text-[#684f2c]">
                                {newMineralFacilityExactPointSelected
                                  ? "Точната точка е избрана"
                                  : "Точният правен режим още не е установен"}
                              </h4>

                              <div className="mt-3 space-y-3 text-sm leading-6 text-[#74664e]">
                                <p>
                                  Съоръженията, показани по-горе, служат само като ориентир за минералните водоизточници около избраното място.
                                </p>

                                <p>
                                  Близостта до съществуващ минерален водоизточник не означава автоматично, че планираният нов сондаж попада в същото находище, участък или правен режим.
                                </p>

                                <p>
                                  Затова не определяме компетентен орган или процедура, докато наличните пространствени данни не позволят надеждно свързване с конкретно находище или участък.
                                </p>
                              </div>

                              <div className="mt-4 rounded-xl border border-[#dfcfb5] bg-white p-4">
                                <div className="text-xs font-bold uppercase tracking-[0.1em] text-[#8a7046]">
                                  {newMineralFacilityExactPointSelected
                                    ? "РЕЗУЛТАТ ОТ ПРОСТРАНСТВЕНАТА ПРОВЕРКА"
                                    : "СЛЕДВАЩА СТЪПКА"}
                                </div>

                                <div className="mt-2 text-sm font-semibold leading-6 text-[#684f2c]">
                                  {newMineralFacilityExactPointSelected
                                    ? "Точната координата на планираното съоръжение е получена и районът е проверен. Ако текущите пространствени данни не позволяват еднозначно определяне на конкретно минерално находище или участък, проверката спира тук и не се извеждат автоматично правен режим, компетентен орган или процедура."
                                    : "Посочете точната точка на планираното съоръжение на картата. След това SONDI.BG ще провери дали точката може да бъде свързана с конкретно минерално находище или участък."}
                                </div>
                              </div>
                            </div>
                            {/* /NEW_MINERAL_LOCATION_ASSESSMENT_V1 */}

                            {newMineralFacilityExactPointSelected && (
                              <div className="mt-5 rounded-2xl border border-[#cbb994] bg-white p-5">
                                <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#8a7046]">
                                  ВЪЗМОЖНО МИНЕРАЛНО НАХОДИЩЕ
                                </div>

                                {(() => {
                                  const depositNames =
                                    Array.from(
                                      new Set(
                                        (
                                          newMineralFacilityLocation
                                            ?.mineralContext
                                            ?.nearbyFacilities ||
                                          []
                                        )
                                          .map(
                                            (facility) =>
                                              String(
                                                facility.deposit ||
                                                  ""
                                              ).trim()
                                          )
                                          .filter(Boolean)
                                      )
                                    );

                                  if (
                                    depositNames.length === 0
                                  ) {
                                    return (
                                      <div className="mt-3 rounded-xl border border-[#e2d6c2] bg-[#fffaf5] p-4 text-sm leading-6 text-[#746957]">
                                        От близките официални съоръжения не може да бъде установено конкретно минерално находище. На този етап не определяме автоматично правен режим или компетентен орган.
                                      </div>
                                    );
                                  }

                                  return (
                                    <div className="mt-3 space-y-4">
                                      <p className="text-sm leading-6 text-[#746957]">
                                        По официалните минерални съоръжения около избраната точка са установени следните възможни находища. Изберете находище само ако знаете, че планираният проект се отнася към него.
                                      </p>

                                      <div className="flex flex-wrap gap-3">
                                        {depositNames.map(
                                          (depositName) => (
                                            <button
                                              key={
                                                depositName
                                              }
                                              type="button"
                                              onClick={() =>
                                                setNewMineralFacilitySelectedDeposit(
                                                  depositName
                                                )
                                              }
                                              className={
                                                newMineralFacilitySelectedDeposit ===
                                                depositName
                                                  ? "rounded-xl border border-[#8a642c] bg-[#8a642c] px-4 py-3 text-sm font-bold text-white"
                                                  : "rounded-xl border border-[#cdb98f] bg-[#fffdf8] px-4 py-3 text-sm font-bold text-[#684f2c] transition hover:bg-[#fff8eb]"
                                              }
                                            >
                                              {
                                                depositName
                                              }
                                            </button>
                                          )
                                        )}
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          setNewMineralFacilitySelectedDeposit(
                                            null
                                          )
                                        }
                                        className="text-sm font-semibold text-[#6d7773] underline underline-offset-4"
                                      >
                                        Не знам към кое находище е проектът
                                      </button>

                                      {newMineralFacilitySelectedDeposit && (
                                        <div className="rounded-xl border border-[#d8c7a8] bg-[#fffaf1] p-4">
                                          <div className="text-xs font-bold uppercase tracking-[0.1em] text-[#8a7046]">
                                            ИЗБРАНО НАХОДИЩЕ
                                          </div>

                                          <div className="mt-2 text-base font-bold text-[#684f2c]">
                                            {
                                              newMineralFacilitySelectedDeposit
                                            }
                                          </div>

                                          <p className="mt-2 text-sm leading-6 text-[#746957]">
                                            Изборът на находище не означава автоматично право за изграждане или водовземане. Следващата проверка ще установи правния режим на избраното находище и дали може да бъде определен компетентният орган за планираното ново съоръжение.
                                          </p>
                                        </div>
                                      )}

                                      {newMineralFacilityResolvedDepositLoading && (
                                        <div className="rounded-xl border border-[#d8c7a8] bg-[#fffdf8] p-4 text-sm font-semibold text-[#746957]">
                                          Зарежда се правният режим на избраното находище...
                                        </div>
                                      )}

                                      {newMineralFacilityResolvedDepositError && (
                                        <div className="rounded-xl border border-[#e2c8b9] bg-[#fff8f4] p-4 text-sm leading-6 text-[#8a5a45]">
                                          {
                                            newMineralFacilityResolvedDepositError
                                          }
                                        </div>
                                      )}

                                      {newMineralFacilityResolvedDeposit && (
                                        <div className="rounded-2xl border border-[#bfd8d2] bg-[#f5fbf9] p-5">
                                          <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#397064]">
                                            ПРАВЕН РЕЖИМ НА ИЗБРАНОТО НАХОДИЩЕ
                                          </div>

                                          <div className="mt-2 text-lg font-bold text-[#28594f]">
                                            {
                                              newMineralFacilityResolvedDeposit.canonicalName
                                            }
                                          </div>

                                          <div className="mt-4 space-y-3 text-sm leading-6 text-[#58736b]">
                                            <div>
                                              <strong>
                                                Режим на управление:
                                              </strong>{" "}
                                              {formatLegalManagementStatus(
                                                newMineralFacilityResolvedDeposit.managementStatus
                                              )}
                                            </div>

                                            {newMineralFacilityResolvedDeposit.managingAuthority && (
                                              <div>
                                                <strong>
                                                  Компетентен орган според правния запис:
                                                </strong>{" "}
                                                {
                                                  newMineralFacilityResolvedDeposit.managingAuthority
                                                }
                                              </div>
                                            )}

                                            {!newMineralFacilityResolvedDeposit.managingAuthority &&
                                              newMineralFacilityResolvedDeposit.delegatedMunicipality && (
                                                <div>
                                                  <strong>
                                                    Делегирано управление:
                                                  </strong>{" "}
                                                  {
                                                    newMineralFacilityResolvedDeposit.delegatedMunicipality
                                                  }
                                                </div>
                                              )}
                                          </div>

                                          {(newMineralFacilityResolvedDeposit.managementStatus ===
                                            "SECTION_DEPENDENT" ||
                                            newMineralFacilityResolvedDeposit.managementStatus ===
                                              "MIXED_LEGAL_REGIME") ? (
                                            <div className="mt-4 rounded-xl border border-[#dfcfb5] bg-white p-4">
                                              <div className="text-xs font-bold uppercase tracking-[0.1em] text-[#8a7046]">
                                                НЕОБХОДИМ Е КОНКРЕТЕН УЧАСТЪК
                                              </div>

                                              <p className="mt-2 text-sm leading-6 text-[#746957]">
                                                Правният режим на това находище зависи от конкретния участък. Докато участъкът не бъде установен, не се извеждат автоматично компетентен орган или процедура за новото съоръжение.
                                              </p>

                                              {newMineralFacilityResolvedDeposit.sections?.length ? (
                                                <p className="mt-2 text-sm leading-6 text-[#746957]">
                                                  В правния запис са налични{" "}
                                                  <strong>
                                                    {
                                                      newMineralFacilityResolvedDeposit.sections.length
                                                    }
                                                  </strong>{" "}
                                                  участъка.
                                                </p>
                                              ) : null}
                                            </div>
                                          ) : (
                                            /* NEW_MINERAL_REAL_PROCEDURE_RESULT_V1 */
                                            (() => {
                                              const management =
                                                newMineralFacilityResolvedDeposit.managementStatus;

                                              const municipalityMatch =
                                                newMineralFacilitySelectedDeposit?.match(
                                                  /община\s+([^,]+)/i
                                                );

                                              const municipality =
                                                municipalityMatch?.[1]?.trim() ||
                                                null;

                                              const procedure =
                                                getNewMineralFacilityProcedureModel(
                                                  {
                                                    managementStatus:
                                                      management,

                                                    municipality,

                                                    delegatedMunicipality:
                                                      newMineralFacilityResolvedDeposit.delegatedMunicipality,

                                                    managingAuthority:
                                                      newMineralFacilityResolvedDeposit.managingAuthority,
                                                  }
                                                );

                                              const isState =
                                                management ===
                                                "STATE_BASIN_DIRECTORATE_MANAGED";

                                              const isDelegated =
                                                management ===
                                                "DELEGATED_TO_MUNICIPALITY";

                                              const isMunicipal =
                                                management ===
                                                "MUNICIPAL";

                                              const isUnresolved =
                                                !management ||
                                                management ===
                                                  "TO_RESEARCH" ||
                                                management ===
                                                  "MIXED_LEGAL_REGIME" ||
                                                management ===
                                                  "SECTION_DEPENDENT";

                                              const moewFormsUrl =
                                                "https://www.moew.government.bg/bg/vodi/administrativni-uslugi/obrazci-na-zayavleniya-za-izdavane-na-razreshitelni/";

                                              const mineralRegistersUrl =
                                                "https://www.moew.government.bg/bg/vodi-mineralni-vodi-registri-mineralni-vodi/";

                                              let possibilityTitle =
                                                "Не може да се определи автоматично";

                                              let possibilityText =
                                                "Наличните данни не са достатъчни, за да се каже дали за тази точка може да се започне процедура за нов минерален сондаж.";

                                              let areaTreatment =
                                                "Правният режим за избраната точка все още не е установен достатъчно точно.";

                                              let applicantText =
                                                "Допустимият заявител не може да бъде определен преди установяване на конкретния режим.";

                                              let formTitle:
                                                string | null =
                                                  null;

                                              let formText:
                                                string | null =
                                                  null;

                                              let steps:
                                                string[] = [];

                                              if (isState) {
                                                possibilityTitle =
                                                  "ДА — по принцип може да се кандидатства за нов минерален сондаж";

                                                possibilityText =
                                                  `Избраното находище „${newMineralFacilityResolvedDeposit.canonicalName}“ е с държавно управление. Законодателството предвижда отделна процедура за водовземане от минерална вода чрез НОВО съоръжение. Това означава, че нов сондаж не е забранен по принцип, но конкретната точка трябва да бъде одобрена и да има наличен експлоатационен ресурс.`;

                                                areaTreatment =
                                                  `За този режим разрешителната процедура е пред ${procedure.authorityName}. Именно този орган решава дали ново съоръжение на конкретната точка е допустимо и при какви условия.`;

                                                applicantText =
                                                  "По общия ред при държавно минерално находище заявители са юридически лица и еднолични търговци. Собствеността върху имота сама по себе си не дава право на физическо лице да изгради минерален сондаж.";

                                                formTitle =
                                                  "Приложение № 16";

                                                formText =
                                                  "Това е официалното заявление за разрешително за водовземане от минерална вода – изключителна държавна собственост, чрез съществуващи ИЛИ чрез нови съоръжения.";

                                                steps = [
                                                  `Първо се подава заявление за водовземане чрез НОВО съоръжение пред ${procedure.authorityName}. За държавна минерална вода това е процедурата по Приложение № 16.`,
                                                  "В заявлението се посочват имотът и точната точка на бъдещия сондаж, предназначението на водата и необходимото количество.",
                                                  "Компетентният орган разглежда дали ново съоръжение на тази точка е допустимо, има ли свободен експлоатационен ресурс и дали исканото водовземане не влиза в конфликт със съществуващи права и ограничения.",
                                                  "Ако процедурата бъде одобрена, разрешителното определя условията, при които новото водовземно съоръжение може да бъде изградено и проучено.",
                                                  "Сондажът се изгражда при условията на разрешителното и приложимите технически и устройствени правила. Резултатите от изграждането и проучването определят окончателните параметри на водовземането.",
                                                  "След изграждането съоръжението се приема и въвежда в експлоатация по приложимия ред на ЗУТ.",
                                                  "Водовземането започва след изпълнение на условията в разрешителното и представяне на необходимия документ за въвеждане на съоръжението в експлоатация.",
                                                ];
                                              }
                                              else if (isMunicipal) {
                                                possibilityTitle =
                                                  "ДА — по принцип има процедура и за ново минерално съоръжение";

                                                possibilityText =
                                                  `За минерална вода – публична общинска собственост нормативният ред предвижда водовземане и чрез НОВИ съоръжения. Това не означава автоматично разрешение за тази точка — общината трябва да одобри проекта и да има наличен ресурс.`;

                                                areaTreatment =
                                                  `За избраното находище компетентният местен орган е ${procedure.authorityName}. Общината разглежда допустимостта на новото съоръжение според режима на находището, наличния ресурс и местните правила.`;

                                                applicantText =
                                                  "Кой може да бъде заявител се определя по приложимия общински режим. SONDI.BG не приема автоматично, че всеки собственик на имота има право да изгради минерален сондаж.";

                                                formTitle =
                                                  "Приложение № 29";

                                                formText =
                                                  "Официалният образец е за водовземане от минерална вода – публична общинска собственост, чрез съществуващи или НОВИ съоръжения.";

                                                steps = [
                                                  `Заявлението за новото съоръжение се подава пред ${procedure.authorityName}.`,
                                                  "Посочват се точната точка, имотът, целта на използването и необходимото количество минерална вода.",
                                                  "Общината разглежда дали нов сондаж на тази точка е допустим и дали има ресурс, който може да бъде предоставен.",
                                                  "При положително решение се определят условията за изграждането и параметрите на бъдещото водовземане.",
                                                  "Новото съоръжение се изгражда по одобрения проект и при условията на разрешението.",
                                                  "След изграждането се извършва приемане/въвеждане в експлоатация по приложимия ред.",
                                                  "Водовземането може да започне едва след изпълнение на разрешителните условия.",
                                                ];
                                              }
                                              else if (isDelegated) {
                                                possibilityTitle =
                                                  "ВЪЗМОЖНО Е, НО ЗА НОВ СОНДАЖ Е НУЖНО ИЗРИЧНО ПОТВЪРЖДЕНИЕ ОТ ОБЩИНАТА";

                                                possibilityText =
                                                  `Находището е изключителна държавна собственост, но е предоставено за управление на ${procedure.authorityName}. Общината може да издава разрешителни за предоставените минерални води, но за НОВО съоръжение трябва да се установи дали конкретният акт за предоставяне и местният ред обхващат изграждането на нов сондаж на тази точка.`;

                                                areaTreatment =
                                                  `Първият компетентен орган е ${procedure.authorityName}. За разлика от държавния режим с Приложение № 16 и публичната общинска собственост с Приложение № 29, SONDI.BG няма да показва автоматично образец за нов сондаж, докато общината не потвърди приложимия ред.`;

                                                applicantText =
                                                  "При предоставена на община държавна минерална вода законът допуска специален режим на заявителите, включително физически лица при предвидените условия. Това не означава автоматично право за изграждане на нов сондаж.";

                                                steps = [
                                                  `Подавате искане до ${procedure.authorityName}, в което изрично посочвате, че става дума за изграждане на НОВО минерално водовземно съоръжение.`,
                                                  "Общината установява дали предоставеното ѝ управление обхваща възможността за ново съоръжение в тази част на находището.",
                                                  "Ако ново съоръжение е допустимо, общината определя приложимия разрешителен ред, необходимите документи и условията за изграждането.",
                                                  "След разрешаване съоръжението се изгражда при определените технически и правни условия.",
                                                  "Водовземането може да започне едва след изпълнение на условията и въвеждане на съоръжението по приложимия ред.",
                                                ];
                                              }

                                              if (isUnresolved) {
                                                return (
                                                  <div className="mt-4 rounded-2xl border border-[#e1c5b8] bg-[#fff8f4] p-5">
                                                    <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#8a5a45]">
                                                      МОЖЕ ЛИ ДА СЕ ИЗГРАДИ НОВ МИНЕРАЛЕН СОНДАЖ ТУК?
                                                    </div>

                                                    <div className="mt-2 text-lg font-bold text-[#764b3a]">
                                                      Не може да се определи още
                                                    </div>

                                                    <p className="mt-3 text-sm leading-6 text-[#76584b]">
                                                      Правният режим на тази точка зависи от конкретен участък или още не е установен достатъчно точно. Затова SONDI.BG няма да ви показва процедура, която може да е грешна.
                                                    </p>
                                                  </div>
                                                );
                                              }

                                              return (
                                                <div className="mt-4 space-y-4">

                                                  <div className="rounded-2xl border border-[#b8d6cd] bg-[#f2faf7] p-5">
                                                    <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#397064]">
                                                      МОЖЕ ЛИ ДА СЕ ИЗГРАДИ НОВ МИНЕРАЛЕН СОНДАЖ ТУК?
                                                    </div>

                                                    <div className="mt-2 text-xl font-bold leading-8 text-[#28594f]">
                                                      {
                                                        possibilityTitle
                                                      }
                                                    </div>

                                                    <p className="mt-3 text-sm leading-6 text-[#536762]">
                                                      {
                                                        possibilityText
                                                      }
                                                    </p>
                                                  </div>

                                                  <div className="rounded-xl border border-[#d8c7a8] bg-[#fffaf1] p-5">
                                                    <div className="text-xs font-bold uppercase tracking-[0.1em] text-[#8a7046]">
                                                      КАК СЕ ТРЕТИРА ТОЗИ РАЙОН
                                                    </div>

                                                    <p className="mt-2 text-sm leading-6 text-[#746957]">
                                                      {
                                                        areaTreatment
                                                      }
                                                    </p>

                                                    <div className="mt-3 text-sm font-bold text-[#684f2c]">
                                                      Компетентен орган:{" "}
                                                      {
                                                        procedure.authorityName
                                                      }
                                                    </div>
                                                  </div>

                                                  {formTitle &&
                                                    formText && (
                                                    <div className="rounded-xl border border-[#c4d9d3] bg-white p-5">
                                                      <div className="text-xs font-bold uppercase tracking-[0.1em] text-[#397064]">
                                                        КОЯ Е ПРОЦЕДУРАТА
                                                      </div>

                                                      <div className="mt-2 text-lg font-bold text-[#28594f]">
                                                        {
                                                          formTitle
                                                        }
                                                      </div>

                                                      <p className="mt-2 text-sm leading-6 text-[#536762]">
                                                        {
                                                          formText
                                                        }
                                                      </p>

                                                      <a
                                                        href={
                                                          moewFormsUrl
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-4 inline-flex rounded-lg border border-[#b9d8cf] bg-[#f2faf7] px-4 py-3 text-sm font-bold text-[#28594f] hover:bg-[#e9f6f2]"
                                                      >
                                                        Отвори официалния образец в МОСВ →
                                                      </a>
                                                    </div>
                                                  )}

                                                  <div className="rounded-xl border border-[#d8c7a8] bg-white p-5">
                                                    <div className="text-xs font-bold uppercase tracking-[0.1em] text-[#8a7046]">
                                                      КАК ПРОТИЧА ПРОЦЕДУРАТА
                                                    </div>

                                                    <div className="mt-4 space-y-4">
                                                      {steps.map(
                                                        (
                                                          step,
                                                          index
                                                        ) => (
                                                          <div
                                                            key={`${index}-${step}`}
                                                            className="flex gap-3"
                                                          >
                                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f2eadb] text-sm font-bold text-[#8a642c]">
                                                              {
                                                                index +
                                                                1
                                                              }
                                                            </div>

                                                            <p className="pt-0.5 text-sm leading-6 text-[#665d50]">
                                                              {
                                                                step
                                                              }
                                                            </p>
                                                          </div>
                                                        )
                                                      )}
                                                    </div>
                                                  </div>

                                                  <div className="rounded-xl border border-[#d8c7a8] bg-[#fffaf1] p-5">
                                                    <div className="text-xs font-bold uppercase tracking-[0.1em] text-[#8a7046]">
                                                      КОЙ МОЖЕ ДА КАНДИДАТСТВА
                                                    </div>

                                                    <p className="mt-2 text-sm leading-6 text-[#746957]">
                                                      {
                                                        applicantText
                                                      }
                                                    </p>
                                                  </div>

                                                  <div className="rounded-xl border border-[#e1c5b8] bg-[#fff8f4] p-5">
                                                    <div className="text-xs font-bold uppercase tracking-[0.1em] text-[#8a5a45]">
                                                      КОГА НОВИЯТ СОНДАЖ НЯМА ДА БЪДЕ РАЗРЕШЕН
                                                    </div>

                                                    <p className="mt-2 text-sm leading-6 text-[#76584b]">
                                                      Фактът, че точката е в район с минерални води, не е достатъчен. Разрешение може да не бъде издадено, ако за конкретната точка има законова или техническа пречка, няма свободен експлоатационен ресурс, проектът засяга съществуващи права или не изпълнява условията за опазване на находището.
                                                    </p>
                                                  </div>

                                                  <div className="rounded-xl border border-[#bfd8d2] bg-[#f5fbf9] p-4">
                                                    <div className="text-xs font-bold uppercase tracking-[0.1em] text-[#397064]">
                                                      ОФИЦИАЛНИ ИЗТОЧНИЦИ
                                                    </div>

                                                    <div className="mt-3 flex flex-col gap-2">
                                                      <a
                                                        href={
                                                          moewFormsUrl
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="rounded-lg border border-[#c6ddd7] bg-white px-4 py-3 text-sm font-bold text-[#28594f] hover:bg-[#edf8f5]"
                                                      >
                                                        МОСВ — образци на заявления по Закона за водите →
                                                      </a>

                                                      <a
                                                        href={
                                                          mineralRegistersUrl
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="rounded-lg border border-[#c6ddd7] bg-white px-4 py-3 text-sm font-bold text-[#28594f] hover:bg-[#edf8f5]"
                                                      >
                                                        МОСВ — регистри за минералните води →
                                                      </a>
                                                    </div>
                                                  </div>

                                                </div>
                                              );
                                            })()
                                            /* /NEW_MINERAL_REAL_PROCEDURE_RESULT_V1 */
                                          )}
                                        </div>
                                      )}

                                    </div>
                                  );
                                })()}
                              </div>
                            )}


                            {!newMineralFacilityExactPointSelected && (
                            <button
                              type="button"
                              onClick={openLegalMap}
                              className="mt-5 rounded-xl border border-[#cdb98f] bg-white px-4 py-3 text-sm font-bold text-[#8a642c] transition hover:bg-[#fffdf8]"
                            >
                              {
                                "Уточни точната точка на картата"
                              }
                            </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {mineralStage === "existing-deposit" && (
                      <div className="mt-6 space-y-5">
                        <div className="rounded-2xl border border-[#dccfb9] bg-[#fffdf8] p-5">
                          <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#8a7046]">
                            {"СТЪПКА 1 · НАХОДИЩЕ ИЛИ СЪОРЪЖЕНИЕ"}
                          </div>

                          <h4 className="mt-2 text-lg font-bold text-[#684f2c]">
                            {
                              "Кое минерално находище или съоръжение търсите?"
                            }
                          </h4>

                          <p className="mt-2 text-sm leading-6 text-[#746957]">
                            {
                              "Търсете по официално или известно име, номер на находище, име или номер на минерално съоръжение."
                            }
                          </p>

                          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                            <input
                              type="text"
                              value={
                                mineralDepositQuery
                              }
                              onChange={(event) => {
                                setMineralDepositQuery(
                                  event.target.value
                                );
                              }}
                              onKeyDown={(event) => {
                                if (
                                  event.key === "Enter"
                                ) {
                                  event.preventDefault();
                                  searchMineralDeposit();
                                }
                              }}
                              placeholder={
                                "Напр. Хисаря, Велинград или 31"
                              }
                              className="min-w-0 flex-1 rounded-xl border border-[#d6c8ae] bg-white px-4 py-3 text-[#684f2c] outline-none focus:border-[#ad8a55]"
                            />

                            <button
                              type="button"
                              onClick={
                                searchMineralDeposit
                              }
                              disabled={
                                !mineralDepositQuery.trim() ||
                                mineralDepositLoading
                              }
                              className="rounded-xl bg-[#9a6b26] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#80581f] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {mineralDepositLoading
                                ? "Търсене..."
                                : "Търси"}
                            </button>
                          </div>

                          {mineralDepositError && (
                            <div className="mt-4 rounded-xl border border-[#e2cbb9] bg-[#fff8f3] p-4 text-sm text-[#765746]">
                              {
                                mineralDepositError
                              }
                            </div>
                          )}

                          {mineralDepositResults.length >
                            0 &&
                            !selectedMineralDeposit && (
                              <div className="mt-5 space-y-3">
                                <div className="text-sm font-bold text-[#745a2e]">
                                  {
                                    "Намерени находища и съоръжения:"
                                  }
                                </div>

                                {mineralDepositResults.map(
                                  (deposit) => (
                                    <button
                                      key={
                                          deposit.matchedFacility
                                            ? `${deposit.depositId}::${deposit.matchedFacility.mineralId}`
                                            : deposit.depositId
                                        }
                                      type="button"
                                      onClick={() =>
                                        loadMineralDepositDetail(
                                          deposit.depositId,
                                          deposit.matchedFacility ||
                                            null
                                        )
                                      }
                                      className="block w-full rounded-xl border border-[#ddd0b8] bg-white p-4 text-left transition hover:border-[#b99b6b] hover:bg-[#fffdf8]"
                                    >
                                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                          {deposit.matchedFacility && (
                                              <div className="mb-2 inline-flex rounded-full border border-[#bcd9d3] bg-[#edf8f5] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#327064]">
                                                Намерено съоръжение
                                              </div>
                                            )}

                                            <div className="font-bold text-[#684f2c]">
                                              {deposit.matchedFacility
                                                ?.name ||
                                                deposit.canonicalName}
                                            </div>

                                            {deposit.matchedFacility && (
                                              <div className="mt-2 space-y-1 text-xs leading-5 text-[#776b5b]">
                                                <div>
                                                  {`Находище: ${deposit.canonicalName}`}
                                                </div>

                                                {deposit.matchedFacility
                                                  .section && (
                                                  <div>
                                                    {`Участък: ${deposit.matchedFacility.section}`}
                                                  </div>
                                                )}

                                                {deposit.matchedFacility
                                                  .registryNumber && (
                                                  <div>
                                                    {`Рег. №: ${deposit.matchedFacility.registryNumber}`}
                                                  </div>
                                                )}
                                              </div>
                                            )}

                                          <div className="mt-1 text-xs text-[#84745d]">
                                            {deposit.officialNumber !=
                                            null
                                              ? `Официален № ${deposit.officialNumber}`
                                              : "Без изведен официален номер"}
                                          </div>
                                        </div>

                                        <div className="text-xs font-bold text-[#8a7046]">
                                          {
                                            deposit.facilityCount
                                          }{" "}
                                          съоръжения в находището
                                        </div>
                                      </div>

                                      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                                        <div>
                                          <span className="text-[#897967]">
                                            {
                                              "Собственост: "
                                            }
                                          </span>
                                          <strong>
                                            {formatLegalOwnershipStatus(
                                              deposit.ownershipStatus
                                            )}
                                          </strong>
                                        </div>

                                        <div>
                                          <span className="text-[#897967]">
                                            {
                                              "Управление: "
                                            }
                                          </span>
                                          <strong>
                                            {formatLegalManagementStatus(
                                              deposit.managementStatus
                                            )}
                                          </strong>
                                        </div>
                                      </div>

                                      <div className="mt-4 flex justify-end">
                                        <span className="rounded-lg bg-[#a8731a] px-4 py-2 text-sm font-bold text-white">
                                          {deposit.matchedFacility
                                            ? "Избери това съоръжение →"
                                            : "Избери това находище →"}
                                        </span>
                                      </div>
                                    </button>
                                  )
                                )}
                              </div>
                            )}
                        </div>

                        {/* REAL_FACILITY_RESULT_V3 */}
                        {selectedMineralDeposit && selectedMineralFacility && (
                          <div className="rounded-2xl border border-[#b8d8cc] bg-[#f5fbf8] p-5 sm:p-6">
                            <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#397064]">
                              ПРАВНА ПРОВЕРКА НА СЪОРЪЖЕНИЕТО
                            </div>

                            <h3 className="mt-2 text-2xl font-bold text-[#245d55]">
                              {selectedMineralFacility.name ||
                                selectedMineralFacility.mineralId}
                            </h3>

                            <div className="mt-4 grid gap-2 text-sm leading-6 text-[#536f69] sm:grid-cols-2">
                              <div>
                                <span className="font-semibold">Находище: </span>
                                {selectedMineralDeposit.canonicalName}
                              </div>

                              {selectedFacilityLegalContext?.identity?.settlement && (
                                <div>
                                  <span className="font-semibold">Населено място: </span>
                                  {selectedFacilityLegalContext.identity.settlement}
                                </div>
                              )}

                              {selectedFacilityLegalContext?.identity?.municipality && (
                                <div>
                                  <span className="font-semibold">Община: </span>
                                  {selectedFacilityLegalContext.identity.municipality}
                                </div>
                              )}

                              {selectedMineralFacility.registryNumber && (
                                <div>
                                  <span className="font-semibold">Регистрационен №: </span>
                                  {selectedMineralFacility.registryNumber}
                                </div>
                              )}

                              {selectedMineralFacility.section && (
                                <div>
                                  <span className="font-semibold">Участък: </span>
                                  {selectedMineralFacility.section}
                                </div>
                              )}
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                              <div className="rounded-xl border border-[#b9d8d0] bg-white p-4">
                                <div className="text-xs font-bold uppercase tracking-[0.1em] text-[#397064]">
                                  УСТАНОВЕН ПРАВЕН РЕЖИМ
                                </div>

                                <div className="mt-2 text-base font-bold text-[#285f54]">
                                  {selectedFacilityLegalContext?.legal?.effectiveManagementStatus === "MUNICIPAL"
                                    ? selectedFacilityLegalContext?.identity?.municipality
                                      ? `Общинско управление — Община ${selectedFacilityLegalContext.identity.municipality}`
                                      : "Общинско управление"
                                    : selectedFacilityLegalContext?.legal?.effectiveManagementStatus === "DELEGATED_TO_MUNICIPALITY"
                                      ? selectedFacilityLegalContext?.legal?.effectiveDelegatedMunicipality
                                        ? `Предоставено за управление на Община ${selectedFacilityLegalContext.legal.effectiveDelegatedMunicipality}`
                                        : "Предоставено за общинско управление"
                                      : selectedFacilityLegalContext?.legal?.effectiveManagementStatus === "STATE_BASIN_DIRECTORATE_MANAGED"
                                        ? `Държавно управление — ${selectedFacilityLegalContext?.legal?.managingAuthority || selectedMineralDeposit.managingAuthority || "компетентната басейнова дирекция"}`
                                        : selectedFacilityLegalContext?.legal?.effectiveManagementStatus === "TO_RESEARCH"
                                          ? "Режимът за това съоръжение не е окончателно потвърден"
                                          : formatLegalManagementStatus(
                                              selectedFacilityLegalContext?.legal?.effectiveManagementStatus ||
                                              selectedMineralFacility.effectiveManagementStatus
                                            )}
                                </div>

                                <div className="mt-2 text-sm leading-6 text-[#5c706a]">
                                  {selectedFacilityLegalContext?.legal?.effectiveSource === "section"
                                    ? "Определен е по конкретния участък, към който е свързано съоръжението."
                                    : selectedFacilityLegalContext?.legal?.effectiveSource === "facility-legal"
                                      ? "Определен е по правния запис за конкретното съоръжение."
                                      : selectedFacilityLegalContext?.legal?.effectiveSource === "deposit"
                                        ? "Определен е от еднозначния режим на находището."
                                        : "Наличните правни данни не позволяват по-конкретно определяне."}
                                </div>
                              </div>

                              <div className="rounded-xl border border-[#b9d8d0] bg-white p-4">
                                <div className="text-xs font-bold uppercase tracking-[0.1em] text-[#397064]">
                                  КОМПЕТЕНТЕН ОРГАН
                                </div>

                                <div className="mt-2 text-base font-bold text-[#285f54]">
                                  {selectedFacilityLegalContext?.legal?.effectiveManagementStatus === "STATE_BASIN_DIRECTORATE_MANAGED"
                                    ? selectedFacilityLegalContext?.legal?.managingAuthority ||
                                      selectedMineralDeposit.managingAuthority ||
                                      "Компетентната басейнова дирекция"
                                    : selectedFacilityLegalContext?.identity?.municipality
                                      ? `Община ${selectedFacilityLegalContext.identity.municipality}`
                                      : selectedFacilityLegalContext?.legal?.effectiveDelegatedMunicipality
                                        ? `Община ${selectedFacilityLegalContext.legal.effectiveDelegatedMunicipality}`
                                        : "Не е потвърден с достатъчна конкретност"}
                                </div>
                              </div>
                            </div>

                            {Array.isArray(
                              selectedFacilityLegalContext?.officialSources
                            ) &&
                              selectedFacilityLegalContext.officialSources.length > 0 && (
                                <div className="mt-5 rounded-xl border border-[#9fcfc3] bg-white p-4">
                                  <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#397064]">
                                    ОФИЦИАЛНИ ДОКУМЕНТИ ЗА ТОЧНО ТОВА СЪОРЪЖЕНИЕ
                                  </div>

                                  <div className="mt-2 text-sm leading-6 text-[#5d716b]">
                                    Намерените документи по-долу са свързани с избраното съоръжение, а не са общи текстове за находището.
                                  </div>

                                  <div className="mt-3 flex flex-col gap-2">
                                    {selectedFacilityLegalContext.officialSources.map(
                                      (source: any, index: number) => (
                                        <a
                                          key={`${source.url}-${index}`}
                                          href={source.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="rounded-lg border border-[#c8ddd7] bg-[#f7fbfa] px-3 py-3 text-sm font-semibold text-[#285f54] hover:bg-[#edf7f4]"
                                        >
                                          <div>
                                            {source.title || "Официален източник"}
                                          </div>

                                          <div className="mt-1 text-xs font-normal text-[#67817a]">
                                            {/\.pdf(?:$|\?)/i.test(source.url)
                                              ? "📄 PDF документ — отвори / свали"
                                              : "🔗 Официална страница / регистър"}
                                          </div>
                                        </a>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {(() => {
                              /*
                               * CLEAN FACILITY PRACTICAL RESULT
                               *
                               * IMPORTANT:
                               * Do NOT render the legacy deposit guidance/checklists
                               * inside the exact-facility result.
                               */

                              const facilityLegalStatus =
                                selectedFacilityLegalContext?.legal
                                  ?.effectiveManagementStatus ||
                                selectedMineralFacility
                                  .effectiveManagementStatus ||
                                "TO_RESEARCH";

                              const delegatedMunicipality =
                                selectedFacilityLegalContext?.legal
                                  ?.effectiveDelegatedMunicipality ||
                                null;

                              const exactMunicipality =
                                selectedFacilityLegalContext?.identity
                                  ?.municipality ||
                                null;

                              const managingAuthority =
                                selectedFacilityLegalContext?.legal
                                  ?.effectiveManagingAuthority ||
                                selectedFacilityLegalContext?.legal
                                  ?.managingAuthority ||
                                selectedMineralDeposit
                                  .managingAuthority ||
                                null;

                              const effectiveFacilityDeposit: MineralDepositDetail = {
                                ...selectedMineralDeposit,
                                managementStatus:
                                  facilityLegalStatus,
                                delegatedMunicipality,
                                managingAuthority,
                                sections: [],
                              };

                              const procedureModel =
                                getMineralFacilityProcedureModel({
                                  managementStatus:
                                    facilityLegalStatus,

                                  municipality:
                                    exactMunicipality,

                                  delegatedMunicipality:
                                    delegatedMunicipality,

                                  managingAuthority:
                                    managingAuthority,

                                  ownershipStatus:
                                    selectedMineralDeposit
                                      .ownershipStatus,
                                });

                              const procedureLinks =
                                procedureModel.officialLinks;
                              const unresolved =
                                facilityLegalStatus ===
                                  "TO_RESEARCH" ||
                                selectedFacilityLegalContext
                                  ?.legal?.effectiveSource ===
                                  "unresolved" ||
                                procedureModel.authorityName ===
                                  "Компетентният орган още не е установен с достатъчна конкретност" ||
                                (
                                  facilityLegalStatus ===
                                    "MUNICIPAL" &&
                                  !exactMunicipality
                                ) ||
                                (
                                  facilityLegalStatus ===
                                    "DELEGATED_TO_MUNICIPALITY" &&
                                  !delegatedMunicipality
                                ) ||
                                (
                                  facilityLegalStatus ===
                                    "STATE_BASIN_DIRECTORATE_MANAGED" &&
                                  !managingAuthority
                                );

                              const authorityName =
                                procedureModel.authorityName;
                              const regimeExplanation =
                                getMineralFacilityRegimeExplanation(
                                  facilityLegalStatus
                                );

                              const rights = [
                                regimeExplanation.text,
                              ];

                              const requiredSteps =
                                procedureModel.procedureSteps;

                              const requiredDocuments =
                                procedureModel.requiredDocuments;

                              return (
                                <div className="mt-5 space-y-4">


                                  <div className="rounded-xl border border-[#b9d8d0] bg-white p-4">
                                    <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#397064]">
                                      КОЙ МОЖЕ ДА БЪДЕ ЗАЯВИТЕЛ И КАКВО НЕ ВЪЗНИКВА АВТОМАТИЧНО
                                    </div>

                                    <div className="mt-3 space-y-2 text-sm leading-6 text-[#536f69]">
                                      {rights.map((item: string) => (
                                        <div
                                          key={item}
                                          className="flex gap-2"
                                        >
                                          <span className="font-bold text-[#2f7668]">
                                            ✓
                                          </span>
                                          <span>{item}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="rounded-xl border border-[#b9d8d0] bg-white p-4">
                                    <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#397064]">
                                      КЪМ КОГО СЕ ОБРЪЩАТЕ
                                    </div>

                                    <div className="mt-2 text-base font-bold text-[#285f54]">
                                      {authorityName}
                                    </div>
                                  </div>

                                  {!unresolved && requiredSteps.length > 0 && (
                                    <div className="rounded-xl border border-[#d8c7a8] bg-[#fffaf1] p-4">
                                      <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#8a7046]">
                                        АКО ОТГОВАРЯТЕ НА УСЛОВИЯТА ЗА ЗАЯВИТЕЛ — КАКВО ТРЯБВА ДА НАПРАВИТЕ
                                      </div>

                                      <div className="mt-2 text-sm leading-6 text-[#536f69]">
                                        Следващите стъпки са приложими, ако попадате сред допустимите заявители, описани по-горе.
                                      </div>

                                      <ol className="mt-3 list-none space-y-3 text-sm leading-6 text-[#684f2c]">
                                        {requiredSteps.map(
                                          (
                                            item: string,
                                            index: number
                                          ) => (
                                            <li
                                              key={item}
                                              className="flex gap-3"
                                            >
                                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f0e4cd] text-xs font-bold text-[#7c5b24]">
                                                {index + 1}
                                              </span>

                                              <span>{item}</span>
                                            </li>
                                          )
                                        )}
                                      </ol>
                                    </div>
                                  )}

                                  {!unresolved && requiredDocuments.length > 0 && (
                                    <div className="rounded-xl border border-[#d8c7a8] bg-[#fffaf1] p-4">
                                      <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#8a7046]">
                                        КАКВИ ДОКУМЕНТИ СА НЕОБХОДИМИ
                                      </div>

                                      <div className="mt-2 text-sm font-semibold text-[#684f2c]">
                                        {procedureModel.serviceTitle}
                                      </div>

                                      <ol className="mt-3 list-none space-y-3 text-sm leading-6 text-[#684f2c]">
                                        {requiredDocuments.map(
                                          (
                                            item: string,
                                            index: number
                                          ) => (
                                            <li
                                              key={item}
                                              className="flex gap-3"
                                            >
                                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f0e4cd] text-xs font-bold text-[#7c5b24]">
                                                {index + 1}
                                              </span>

                                              <span>{item}</span>
                                            </li>
                                          )
                                        )}
                                      </ol>

                                      {procedureModel.note && (
                                        <div className="mt-3 text-xs leading-5 text-[#746957]">
                                          {procedureModel.note}
                                        </div>
                                      )}
                                    </div>
                                  )}



                                  {!unresolved && Array.isArray(procedureLinks) &&
                                    procedureLinks.length > 0 && (
                                      <div className="rounded-xl border border-[#9fcfc3] bg-white p-4">
                                        <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#397064]">
                                          ОФИЦИАЛНИ ЗАЯВЛЕНИЯ, ПРОЦЕДУРИ И РЕГИСТРИ
                                        </div>

                                        <div className="mt-2 text-sm leading-6 text-[#5d716b]">
                                          Използвайте тези официални източници за подаване на заявление, проверка на процедурата или справка в съответния регистър.
                                        </div>

                                        <div className="mt-3 flex flex-col gap-2">
                                          {procedureLinks.map(
                                            (
                                              link: MineralOfficialLink,
                                              index: number
                                            ) => (
                                              <a
                                                key={`${link.url}-${index}`}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="rounded-lg border border-[#c8ddd7] bg-[#f7fbfa] px-3 py-3 text-sm font-semibold text-[#285f54] hover:bg-[#edf7f4]"
                                              >
                                                <div>
                                                  {link.kind ===
                                                  "procedure"
                                                    ? "🖥 "
                                                    : link.kind ===
                                                        "official-act"
                                                      ? "📄 "
                                                      : "📋 "}
                                                  {link.label}
                                                </div>

                                                <div className="mt-1 text-xs font-normal text-[#67817a]">
                                                  Отвори официалния източник →
                                                </div>
                                              </a>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}

                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {selectedMineralDeposit && !selectedMineralFacility && (
                          <div className="rounded-2xl border border-[#d8c7a8] bg-[#fffaf1] p-5">

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedMineralDeposit(
                                  null
                                )
                              }
                              className="text-sm font-bold text-[#8a642c] hover:text-[#684f2c]"
                            >
                              {
                                "← Избери друго находище"
                              }
                            </button>

                            <div className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-[#8a7046]">
                              {
                                "ПРАВЕН СТАТУС НА НАХОДИЩЕТО"
                              }
                            </div>

                            <h4 className="mt-2 text-xl font-bold text-[#684f2c]">
                              {
                                selectedMineralDeposit.canonicalName
                              }
                            </h4>

                            <div className="mt-1 text-sm text-[#84745d]">
                              {selectedMineralDeposit.officialNumber !=
                              null
                                ? `Официален № ${selectedMineralDeposit.officialNumber}`
                                : "Официален номер не е изведен в текущия legal record"}
                            </div>

                            <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                              <div className="rounded-xl border border-[#e0d4c1] bg-white p-4">
                                <div className="text-xs text-[#897967]">
                                  {"Собственост"}
                                </div>
                                <div className="mt-1 font-bold text-[#684f2c]">
                                  {formatLegalOwnershipStatus(
                                    selectedMineralDeposit.ownershipStatus
                                  )}
                                </div>
                              </div>

                              <div className="rounded-xl border border-[#e0d4c1] bg-white p-4">
                                <div className="text-xs text-[#897967]">
                                  {"Управление"}
                                </div>
                                <div className="mt-1 font-bold text-[#684f2c]">
                                  {formatLegalManagementStatus(
                                    selectedMineralDeposit.managementStatus
                                  )}
                                </div>
                              </div>

                              {selectedMineralDeposit.delegatedMunicipality && (
                                <div className="rounded-xl border border-[#e0d4c1] bg-white p-4">
                                  <div className="text-xs text-[#897967]">
                                    {
                                      "Предоставено на община"
                                    }
                                  </div>
                                  <div className="mt-1 font-bold text-[#684f2c]">
                                    {
                                      selectedMineralDeposit.delegatedMunicipality
                                    }
                                  </div>
                                </div>
                              )}

                              {selectedMineralDeposit.managementTerm
                                ?.end_date && (
                                <div className="rounded-xl border border-[#e0d4c1] bg-white p-4">
                                  <div className="text-xs text-[#897967]">
                                    {
                                      "Посочен срок до"
                                    }
                                  </div>
                                  <div className="mt-1 font-bold text-[#684f2c]">
                                    {
                                      selectedMineralDeposit.managementTerm.end_date
                                    }
                                  </div>
                                </div>
                              )}
                            </div>

                            {selectedMineralDeposit.currentEligibility
                              ?.status ===
                              "LISTED_FOR_PROVISION" && (
                              <div className="mt-4 rounded-xl border border-[#e0c799] bg-[#fff8e9] p-4 text-sm leading-6 text-[#71552e]">
                                {`Находището е включено в списък по §133 за ${selectedMineralDeposit.currentEligibility.year || "съответната година"}. Това не означава автоматично, че към момента има действащо предоставяне на община.`}
                              </div>
                            )}

                            {selectedMineralDeposit.managementTerm
                              ?.active_on_verified ===
                              false && (
                              <div className="mt-4 rounded-xl border border-[#d8d0c2] bg-white p-4 text-sm leading-6 text-[#746957]">
                                {
                                  "Посоченият срок е извлечен от наличен акт, но текущото упражняване на предоставеното право не е независимо потвърдено към днешна дата."
                                }
                              </div>
                            )}

                            {selectedMineralDeposit.sections
                              .length > 0 && (
                              <div className="mt-6">
                                <div className="text-sm font-bold text-[#684f2c]">
                                  {
                                    "Части на находището с различно управление"
                                  }
                                </div>

                                    <p className="mt-2 text-sm leading-6 text-[#756956]">
                                      Това находище е разделено на отделни части. За всяка част може да отговаря различна община или друг компетентен орган.
                                    </p>

                                <div className="mt-3 space-y-3">
                                  {selectedMineralDeposit.sections.map(
                                    (
                                      section,
                                      index
                                    ) => (
                                      <div
                                        key={
                                          section.sectionId ||
                                          `${section.name}-${index}`
                                        }
                                        className="rounded-xl border border-[#dccfb9] bg-white p-4"
                                      >
                                        <div className="font-bold text-[#684f2c]">
                                          {section.name ||
                                            section.sectionId ||
                                            `Участък ${index + 1}`}
                                        </div>

                                        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                                          <div>
                                            <span className="text-[#897967]">
                                              {
                                                "Управление: "
                                              }
                                            </span>
                                            <strong>
                                              {formatLegalManagementStatus(
                                                section.managementStatus
                                              )}
                                            </strong>
                                          </div>

                                          {section.delegatedMunicipality && (
                                            <div>
                                              <span className="text-[#897967]">
                                                {
                                                  "Община: "
                                                }
                                              </span>
                                              <strong>
                                                {
                                                  section.delegatedMunicipality
                                                }
                                              </strong>
                                            </div>
                                          )}

                                          {section.managementTerm
                                            ?.end_date && (
                                            <div>
                                              <span className="text-[#897967]">
                                                {
                                                  "Посочен срок до: "
                                                }
                                              </span>
                                              <strong>
                                                {
                                                  section.managementTerm.end_date
                                                }
                                              </strong>
                                            </div>
                                          )}

                                          <div>
                                            <span className="text-[#897967]">
                                              {
                                                "Свързани съоръжения: "
                                              }
                                            </span>
                                            <strong>
                                              {
                                                section
                                                  .facilityIds
                                                  .length
                                              }
                                            </strong>
                                          </div>
                                        </div>

                                        {section.currentEligibility
                                          ?.status ===
                                          "LISTED_FOR_PROVISION" && (
                                          <div className="mt-3 rounded-lg border border-[#e3cda5] bg-[#fff9ee] p-3 text-xs leading-5 text-[#745a2e]">
                                            {`Участъкът е включен в списък по §133 за ${section.currentEligibility.year || "съответната година"}. Не приемаме автоматично, че има действащо предоставяне.`}
                                          </div>
                                        )}

                                        {section.managementTerm
                                          ?.active_on_verified ===
                                          false && (
                                          <div className="mt-3 text-xs leading-5 text-[#7b6b58]">
                                            {
                                              "Текущото упражняване на предоставянето не е независимо потвърдено."
                                            }
                                          </div>
                                        )}
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                            {selectedMineralDeposit.facilities &&
                              selectedMineralDeposit.facilities.length > 0 && (
                                  <details
                                    open={selectedMineralDeposit.facilities.length <= 2}
                                    className="mt-6 overflow-hidden rounded-2xl border border-[#bdd5cf] bg-[#f4faf8]"
                                  >
                                    <summary className="cursor-pointer select-none list-none px-5 py-4 text-[#28594f]">
                                      <div className="flex items-center justify-between gap-4">
                                        <div>
                                          <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#397064]">
                                            СЪОРЪЖЕНИЯ В ТОВА НАХОДИЩЕ
                                          </div>
                                          <div className="mt-1 text-lg font-bold">
                                            {`Водоизточници и съоръжения (${selectedMineralDeposit.facilities.length})`}
                                          </div>
                                        </div>
                                        <span className="shrink-0 rounded-full border border-[#bdd5cf] bg-white px-3 py-1 text-xs font-bold text-[#397064]">
                                          Покажи ▼
                                        </span>
                                      </div>
                                    </summary>
                                    <div className="border-t border-[#d8e7e3] p-5">
                                      <h4 className="text-lg font-bold text-[#28594f]">
                                        Вижте конкретните водоизточници на картата
                                      </h4>
                                      <p className="mt-2 text-sm leading-6 text-[#64756f]">
                                        Картата показва къде се намира конкретното минерално съоръжение и какъв е пространственият му контекст спрямо други водоизточници, геологията и останалите налични слоеве в SONDI.BG.
                                      </p>

                                  <div className="mt-4 rounded-lg border border-[#cfe0db] bg-white p-3 text-xs leading-5 text-[#64756f]">
                                    Правната проверка започва от находището. След като го изберете, използвайте конкретното съоръжение от списъка, защото разрешителното, титулярът и приложимият режим могат да са различни за отделните водоизточници или участъци.
                                  </div>
                                  <div className="mt-4 space-y-3">
                                    {selectedMineralDeposit.facilities.map(
                                      (facility) => (
                                        <div
                                          key={facility.facilityId}
                                          className="rounded-xl border border-[#cfe0db] bg-white p-4"
                                        >
                                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                              <div className="font-bold text-[#28594f]">
                                                {facility.name ||
                                                  facility.facilityId}
                                              </div>

                                              {facility.facilityType && (
                                                <div className="mt-1 text-sm text-[#6c7d77]">
                                                  {facility.facilityType}
                                                </div>
                                              )}

                                              {facility.sectionName && (
                                                <div className="mt-1 text-xs text-[#897967]">
                                                  {`Участък: ${facility.sectionName}`}
                                                </div>
                                              )}

                                              {facility.settlement && (
                                                <div className="mt-1 text-xs text-[#897967]">
                                                  {facility.settlement}
                                                </div>
                                              )}

                                              <div className="mt-2 text-xs text-[#8a7b68]">
                                                {`ID: ${facility.facilityId}`}
                                              </div>
                                            </div>

                                            <div className="mb-3 rounded-lg border border-[#cfe0db] bg-[#f4fbf8] p-3 text-xs leading-5 text-[#536f69]">
                                              <div className="font-bold text-[#2f6f62]">
                                                В подробния анализ
                                              </div>

                                              <div className="mt-2">
                                                ✓ Анализ на съоръжението, точката и минералния потенциал около нея
                                              </div>
                                            </div>

                                            <a
                                              href={`/legal?facility=${encodeURIComponent(
                                                facility.facilityId
                                              )}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="mb-3 inline-flex w-full items-center justify-center rounded-lg border border-[#b9d7cf] bg-[#eef8f5] px-4 py-2.5 text-sm font-bold text-[#285f54] hover:bg-[#e3f3ee]"
                                            >
                                              ⚖ Провери законовия режим за това съоръжение →
                                            </a>
{facility.mapUrl &&
                                            facility.hasCoordinates ? (
                                              <a
                                                href={facility.mapUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#173f48] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#24545e]"
                                              >
                                                📍 Виж това съоръжение на картата →
                                              </a>
                                            ) : (
                                              <div className="max-w-xs rounded-lg border border-[#e2d5c0] bg-[#fffaf1] px-3 py-2 text-xs leading-5 text-[#7a6851]">
                                                Точно местоположение на картата все още не е потвърдено.
                                              </div>
                                            )}
                                          </div>

                                          {facility.hasCoordinates &&
                                            facility.latitude != null &&
                                            facility.longitude != null && (
                                              <div className="mt-3 text-xs text-[#75817d]">
                                                {`Координати: ${facility.latitude.toFixed(
                                                  6
                                                )}, ${facility.longitude.toFixed(
                                                  6
                                                )}`}
                                              </div>
                                            )}
                                        </div>
                                      )
                                    )}
                                  </div>

                                    </div>
                                  </details>
                              )}
                            {/* DEPOSIT_ORIENTATION_ONLY_V1 */}
                            <div className="mt-6 rounded-2xl border border-[#b8cfd1] bg-white p-5 sm:p-6">
                              <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#55777a]">
                                КАКВО ОЗНАЧАВА ТОЗИ РЕЖИМ
                              </div>

                              <h4 className="mt-2 text-xl font-bold text-[#315f63]">
                                Това е общият правен режим на находището
                              </h4>

                              <div className="mt-3 text-sm leading-6 text-[#5b6d70]">
                                На този етап SONDI.BG показва режима на находището като цяло. Той определя начина на управление, но не доказва сам по себе си право за водовземане от всяко съоръжение в находището.
                              </div>

                              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-xl border border-[#d7e2e3] bg-[#fafcfc] p-4">
                                  <div className="text-xs font-bold uppercase tracking-[0.1em] text-[#60787b]">
                                    Установен общ режим
                                  </div>

                                  <div className="mt-2 font-bold text-[#315f63]">
                                    {formatLegalManagementStatus(
                                      selectedMineralDeposit.managementStatus
                                    )}
                                  </div>
                                </div>

                                <div className="rounded-xl border border-[#d7e2e3] bg-[#fafcfc] p-4">
                                  <div className="text-xs font-bold uppercase tracking-[0.1em] text-[#60787b]">
                                    Следваща проверка
                                  </div>

                                  <div className="mt-2 text-sm leading-6 text-[#53676b]">
                                    Конкретно водовземно съоръжение, неговият приложим режим и компетентният орган.
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4 rounded-xl border border-[#e2c98f] bg-[#fff9e9] p-4">
                                <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#80662b]">
                                  ЗА ДА ПОЛУЧИТЕ КОНКРЕТЕН ОТГОВОР
                                </div>

                                <div className="mt-2 text-sm leading-6 text-[#71582c]">
                                  Изберете конкретно съоръжение от списъка по-горе. Едва тогава SONDI.BG ще покаже:
                                </div>

                                <div className="mt-3 space-y-2 text-sm leading-6 text-[#71582c]">
                                  <div className="flex gap-2">
                                    <span className="font-bold">1.</span>
                                    <span>точния режим за избраното съоръжение;</span>
                                  </div>

                                  <div className="flex gap-2">
                                    <span className="font-bold">2.</span>
                                    <span>компетентния орган;</span>
                                  </div>

                                  <div className="flex gap-2">
                                    <span className="font-bold">3.</span>
                                    <span>може ли да се придобие право за водовземане;</span>
                                  </div>

                                  <div className="flex gap-2">
                                    <span className="font-bold">4.</span>
                                    <span>необходимите документи и процедура;</span>
                                  </div>

                                  <div className="flex gap-2">
                                    <span className="font-bold">5.</span>
                                    <span>официалните заявления, регистри и линкове.</span>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4 rounded-lg border border-[#d7dfe0] bg-[#fafcfc] p-3 text-xs leading-5 text-[#637477]">
                                Не се извежда конкретно заявление или разрешителна процедура само от режима на находището, защото отделните съоръжения могат да имат различен правен контекст.
                              </div>
                            </div>
                            {/* /DEPOSIT_ORIENTATION_ONLY_V1 */}

                            <div className="mt-5 rounded-xl border border-[#e0d4c1] bg-white p-4 text-xs leading-5 text-[#7b6b58]">
                              {
                                "Тази справка показва текущите проверени данни в правния слой на SONDI.BG. Когато текущият управител не е потвърден или правният режим зависи от конкретен участък, не се прави автоматичен извод за компетентен орган или право на ползване без допълнителна проверка."
                              }
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {mineralStage === "unknown-status" && (
                      <div className="mt-6 space-y-5">
                        <div className="rounded-2xl border border-[#dccfb9] bg-[#fffdf8] p-5">
                          <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#8a7046]">
                            {"СТЪПКА 1 · МЕСТОПОЛОЖЕНИЕ"}
                          </div>

                          <h4 className="mt-2 text-lg font-bold text-[#684f2c]">
                            {
                              "Къде се намира мястото, което искате да проверите?"
                            }
                          </h4>

                          <p className="mt-2 text-sm leading-6 text-[#746957]">
                            {
                              "Въведете населено място. След избора SONDI.BG ще провери минералните съоръжения и находища, представени в платформата около тази точка."
                            }
                          </p>

                          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                            <input
                              type="text"
                              value={settlementQuery}
                              onChange={(event) => {
                                setSettlementQuery(
                                  event.target.value
                                );
                              }}
                              onKeyDown={(event) => {
                                if (
                                  event.key === "Enter"
                                ) {
                                  event.preventDefault();
                                  searchSettlement();
                                }
                              }}
                              placeholder={
                                "Напр. Хисаря, Велинград, Сапарева баня"
                              }
                              className="min-w-0 flex-1 rounded-xl border border-[#d6c8ae] bg-white px-4 py-3 text-[#684f2c] outline-none focus:border-[#ad8a55]"
                            />

                            <button
                              type="button"
                              onClick={searchSettlement}
                              disabled={
                                !settlementQuery.trim() ||
                                locationLoading
                              }
                              className="rounded-xl bg-[#9a6b26] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#80581f] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {locationLoading
                                ? "Търсене..."
                                : "Провери"}
                            </button>
                          </div>

                          {settlementSearchError && (
                            <div className="mt-3 rounded-xl border border-[#e4c9b7] bg-[#fff8f3] p-4 text-sm text-[#765746]">
                              {settlementSearchError}
                            </div>
                          )}

                          {settlementCandidates.length > 1 &&
                            !legalLocation && (
                              <div className="mt-4 space-y-2">
                                <div className="text-sm font-bold text-[#745a2e]">
                                  {
                                    "Изберете правилното населено място:"
                                  }
                                </div>

                                {settlementCandidates.map(
                                  (
                                    candidate,
                                    index
                                  ) => (
                                    <button
                                      key={`${candidate.lat}-${candidate.lng}-${index}`}
                                      type="button"
                                      onClick={() =>
                                        applyLegalLocation(
                                          candidate
                                        )
                                      }
                                      className="block w-full rounded-xl border border-[#ddd0b8] bg-white px-4 py-3 text-left text-sm text-[#684f2c] transition hover:border-[#b99b6b] hover:bg-[#fffdf8]"
                                    >
                                      {candidate.label}
                                    </button>
                                  )
                                )}
                              </div>
                            )}

                          {legalLocation && (
                            <div className="mt-5 rounded-xl border border-[#cdb98f] bg-white p-5">
                              <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#8a7046]">
                                {
                                  "ИЗБРАНО МЕСТОПОЛОЖЕНИЕ"
                                }
                              </div>

                              <div className="mt-2 font-bold text-[#684f2c]">
                                {legalLocation.basinName ||
                                  "Местоположението е определено"}
                              </div>

                              <button
                                type="button"
                                onClick={openLegalMap}
                                className="mt-3 text-sm font-bold text-[#8a642c] underline underline-offset-4"
                              >
                                {
                                  "Уточни точната точка на картата"
                                }
                              </button>
                            </div>
                          )}
                        </div>

                        {legalLocation?.mineralContext && (
                          <div className="rounded-2xl border border-[#d8c7a8] bg-[#fffaf1] p-5">
                            <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#8a7046]">
                              {
                                "МИНЕРАЛНИ ВОДИ ОКОЛО ИЗБРАНАТА ТОЧКА"
                              }
                            </div>

                            <div className="mt-3 grid gap-3 sm:grid-cols-4">
                              {[
                                [
                                  "до 1 km",
                                  legalLocation.mineralContext
                                    .within1Km,
                                ],
                                [
                                  "до 5 km",
                                  legalLocation.mineralContext
                                    .within5Km,
                                ],
                                [
                                  "до 10 km",
                                  legalLocation.mineralContext
                                    .within10Km,
                                ],
                                [
                                  "до 25 km",
                                  legalLocation.mineralContext
                                    .within25Km,
                                ],
                              ].map(
                                ([label, value]) => (
                                  <div
                                    key={String(label)}
                                    className="rounded-xl border border-[#e2d6c2] bg-white p-3"
                                  >
                                    <div className="text-xs text-[#84745d]">
                                      {label}
                                    </div>

                                    <div className="mt-1 text-xl font-bold text-[#684f2c]">
                                      {value}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>

                            {legalLocation.mineralContext
                              .nearbyFacilities.length ===
                              0 && (
                              <div className="mt-5 rounded-xl border border-[#e2d6c2] bg-white p-4 text-sm leading-6 text-[#746957]">
                                {
                                  "В радиус до 25 km няма минерално водовземно съоръжение с координати в текущата база на SONDI.BG. Това не доказва, че в района няма минерални води."
                                }
                              </div>
                            )}

                            {legalLocation.mineralContext
                              .nearbyFacilities.length >
                              0 && (
                              <div className="mt-5 space-y-3">
                                {legalLocation.mineralContext.nearbyFacilities.map(
                                  (facility) => {
                                    const legal =
                                      facility.legal;

                                    const effective =
                                      legal?.section ||
                                      null;

                                    const management =
                                      effective
                                        ?.managementStatus ||
                                      legal
                                        ?.managementStatus ||
                                      null;

                                    const municipality =
                                      effective
                                        ?.delegatedMunicipality ||
                                      legal
                                        ?.delegatedMunicipality ||
                                      null;

                                    const term =
                                      effective
                                        ?.managementTerm ||
                                      legal
                                        ?.managementTerm ||
                                      null;

                                    const eligibility =
                                      effective
                                        ?.currentEligibility ||
                                      legal
                                        ?.currentEligibility ||
                                      null;

                                    return (
                                      <div
                                        key={
                                          facility.mineralId
                                        }
                                        className="rounded-xl border border-[#dccfb9] bg-white p-4"
                                      >
                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                                          <div>
                                            <div className="font-bold text-[#684f2c]">
                                              {
                                                facility.name
                                              }
                                            </div>

                                            <div className="mt-1 text-xs text-[#84745d]">
                                              {facility.deposit ||
                                                "Находище без изведено име"}
                                            </div>
                                          </div>

                                          <div className="text-sm font-bold text-[#8a7046]">
                                            {facility.distanceKm.toFixed(
                                              2
                                            )}{" "}
                                            km
                                          </div>
                                        </div>

                                        {legal ? (
                                          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                                            <div>
                                              <span className="text-[#897967]">
                                                {
                                                  "Находище: "
                                                }
                                              </span>
                                              <strong>
                                                {
                                                  legal.canonicalName
                                                }
                                              </strong>
                                            </div>

                                            <div>
                                              <span className="text-[#897967]">
                                                {
                                                  "№ в списъка: "
                                                }
                                              </span>
                                              <strong>
                                                {legal.officialNumber ??
                                                  "—"}
                                              </strong>
                                            </div>

                                            <div>
                                              <span className="text-[#897967]">
                                                {
                                                  "Собственост: "
                                                }
                                              </span>
                                              <strong>
                                                {formatLegalOwnershipStatus(
                                                  legal.ownershipStatus
                                                )}
                                              </strong>
                                            </div>

                                            <div>
                                              <span className="text-[#897967]">
                                                {
                                                  "Управление: "
                                                }
                                              </span>
                                              <strong>
                                                {formatLegalManagementStatus(
                                                  management
                                                )}
                                              </strong>
                                            </div>

                                            {municipality && (
                                              <div>
                                                <span className="text-[#897967]">
                                                  {
                                                    "Община: "
                                                  }
                                                </span>
                                                <strong>
                                                  {
                                                    municipality
                                                  }
                                                </strong>
                                              </div>
                                            )}

                                            {term?.end_date && (
                                              <div>
                                                <span className="text-[#897967]">
                                                  {
                                                    "Посочен срок до: "
                                                  }
                                                </span>
                                                <strong>
                                                  {
                                                    term.end_date
                                                  }
                                                </strong>
                                              </div>
                                            )}

                                            {legal.section && (
                                              <div className="sm:col-span-2">
                                                <span className="text-[#897967]">
                                                  {
                                                    "Участък: "
                                                  }
                                                </span>
                                                <strong>
                                                  {legal.section.name ||
                                                    legal.section.sectionId ||
                                                    "определен участък"}
                                                </strong>
                                              </div>
                                            )}

                                            {eligibility?.status ===
                                              "LISTED_FOR_PROVISION" && (
                                              <div className="sm:col-span-2 rounded-lg border border-[#e3cda5] bg-[#fff9ee] p-3 text-[#745a2e]">
                                                {
                                                  "Находището/участъкът е включен в списък по §133 за предоставяне. Това само по себе си не доказва действащо предоставяне на община."
                                                }
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          <div className="mt-3 rounded-lg border border-[#e4d9c7] bg-[#fdfbf7] p-3 text-sm text-[#746957]">
                                            {
                                              "Съоръжението е в минералния master, но към него не е намерен еднозначен legal record."
                                            }
                                          </div>
                                        )}
                                      </div>
                                    );
                                  }
                                )}

                                <div className="rounded-xl border border-[#e0cdb3] bg-[#fffdf8] p-4 text-xs leading-5 text-[#7b6b58]">
                                  {
                                    "Важно: показаните съоръжения са подредени по разстояние до избраната точка. Близостта до съоръжение не означава автоматично, че конкретният имот попада в същото минерално находище или участък."
                                  }
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
</section>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
