import "server-only";

import {
  getExactMineralFacilityRecord,
  getMineralWaterProfile,
} from "@/lib/mineral-water-profile";

import {
  getMineralLegalByFacilityId,
} from "@/lib/mineral-water-legal";

export type MineralFacilityOfficialSource = {
  title: string | null;
  url: string;
  sourceType: string | null;
  published: string | null;
};

type Obj =
  Record<string, any>;

function cleanString(
  value: unknown
): string | null {
  const text =
    String(value ?? "").trim();

  return text || null;
}

function firstString(
  ...values: unknown[]
): string | null {
  for (const value of values) {
    const text =
      cleanString(value);

    if (text) {
      return text;
    }
  }

  return null;
}

function validUrl(
  value: unknown
): string | null {
  const valueText =
    cleanString(value);

  if (
    !valueText ||
    !/^https?:\/\//i.test(valueText)
  ) {
    return null;
  }

  return valueText;
}

function addSource(
  result: MineralFacilityOfficialSource[],
  seen: Set<string>,
  source: any
) {
  if (!source) return;

  const url =
    typeof source === "string"
      ? validUrl(source)
      : validUrl(
          source.source_url ??
          source.sourceUrl ??
          source.verified_source_url ??
          source.verifiedSourceUrl ??
          source.official_url ??
          source.officialUrl ??
          source.document_url ??
          source.documentUrl ??
          source.pdf_url ??
          source.pdfUrl ??
          source.register_url ??
          source.registerUrl ??
          source.url
        );

  if (
    !url ||
    seen.has(url)
  ) {
    return;
  }

  seen.add(url);

  result.push({
    title:
      typeof source === "object"
        ? firstString(
            source.title,
            source.name,
            source.verified_source,
            source.source
          )
        : null,

    url,

    sourceType:
      typeof source === "object"
        ? firstString(
            source.source_type,
            source.sourceType,
            source.type
          )
        : null,

    published:
      typeof source === "object"
        ? firstString(
            source.published,
            source.source_date,
            source.date
          )
        : null,
  });
}

function getResearchRecord(
  record: Obj
): Obj {
  return (
    record.pro
      ?.research_source_record ||
    {}
  );
}

function getResearchEnrichment(
  record: Obj
): Obj {
  const value =
    record.pro
      ?.research_enrichment;

  return (
    value &&
    !Array.isArray(value)
      ? value
      : {}
  );
}

function researchProvesDistinctFacility(
  record: Obj
): boolean {
  const research =
    getResearchRecord(record);

  const manualResolution =
    firstString(
      research.manual_resolution,
      record.pro?.manual_resolution
    )?.toUpperCase();

  const researchStatus =
    firstString(
      research.research_status,
      record.pro?.research_status
    )?.toUpperCase();

  return (
    manualResolution === "MISSING" ||
    researchStatus ===
      "CONFIRMED_MISSING"
  );
}

function resolveExactIdentity(
  record: Obj
) {
  const research =
    getResearchRecord(record);

  const enrichment =
    getResearchEnrichment(record);

  const existing =
    record.pro
      ?.existing_properties ||
    {};

  const distinct =
    researchProvesDistinctFacility(
      record
    );

  /*
   * If research proves that this is a separate facility,
   * existing_properties must NOT donate identity fields.
   */
  if (distinct) {
    return {
      distinct,

      name:
        firstString(
          research.mh_facility,
          record.identity?.name
        ),

      facilityType:
        firstString(
          research.current_category,
          record.identity?.facility_type
        ),

      settlement:
        firstString(
          research.current_settlement,
          research.mh_settlement,
          record.identity?.settlement
        ),

      municipality:
        firstString(
          research.current_municipality,
          research.mh_municipality
        ),

      deposit:
        firstString(
          enrichment.current_deposit_name,
          research.mh_deposit,
          record.identity?.deposit
        ),

      registryNumber:
        firstString(
          research.registry_number,
          research.registryNumber,
          record.identity?.registry_number,
          record.identity?.registryNumber
        ),
    };
  }

  return {
    distinct,

    name:
      firstString(
        record.identity?.name,
        existing.facility,
        research.mh_facility
      ),

    facilityType:
      firstString(
        record.identity?.facility_type,
        existing.facility_type,
        research.current_category
      ),

    settlement:
      firstString(
        record.identity?.settlement,
        existing.settlement,
        research.current_settlement,
        research.mh_settlement
      ),

    municipality:
      firstString(
        existing.municipality,
        research.current_municipality,
        research.mh_municipality,
        record.identity?.municipality
      ),

    deposit:
      firstString(
        record.identity?.deposit,
        existing.deposit,
        enrichment.current_deposit_name,
        research.mh_deposit
      ),

    registryNumber:
      firstString(
        existing.registry_number,
        existing.registryNumber,
        record.identity?.registry_number,
        record.identity?.registryNumber,
        research.registry_number,
        research.registryNumber
      ),
  };
}

function resolveExactSources(
  record: Obj,
  distinct: boolean
): MineralFacilityOfficialSource[] {
  const result:
    MineralFacilityOfficialSource[] =
      [];

  const seen =
    new Set<string>();

  const research =
    getResearchRecord(record);

  const enrichment =
    getResearchEnrichment(record);

  /*
   * When the facility is research-confirmed as distinct,
   * use only evidence belonging to that researched facility.
   */
  if (distinct) {
    if (
      Array.isArray(
        research.mh_documents
      )
    ) {
      for (
        const source
        of research.mh_documents
      ) {
        addSource(
          result,
          seen,
          source
        );
      }
    }

    addSource(
      result,
      seen,
      {
        title:
          enrichment.verified_source,

        source_type:
          enrichment.source_type ||
          "verified_research",

        source_url:
          enrichment
            .verified_source_url,
      }
    );

    return result;
  }

  /*
   * Normal exact facility record.
   */
  if (Array.isArray(record.sources)) {
    for (
      const source
      of record.sources
    ) {
      addSource(
        result,
        seen,
        source
      );
    }
  }

  if (
    Array.isArray(
      research.mh_documents
    )
  ) {
    for (
      const source
      of research.mh_documents
    ) {
      addSource(
        result,
        seen,
        source
      );
    }
  }

  addSource(
    result,
    seen,
    {
      title:
        enrichment.verified_source,

      source_type:
        enrichment.source_type ||
        "verified_research",

      source_url:
        enrichment
          .verified_source_url,
    }
  );

  const existing =
    record.pro
      ?.existing_properties;

  if (existing) {
    addSource(
      result,
      seen,
      {
        title:
          existing.source,

        source_type:
          "existing_register",

        source_url:
          existing.source_url,

        published:
          existing.source_date,
      }
    );
  }

  return result;
}

export function resolveMineralFacilityLegalContext(
  facilityId: string
) {
  const id =
    String(facilityId ?? "").trim();

  if (!id) {
    return null;
  }

  /*
   * ========================================================
   * IDENTITY
   * ========================================================
   * Exact mineral_id only.
   */
  const exactRecord =
    getExactMineralFacilityRecord(
      id
    );

  if (!exactRecord) {
    return null;
  }

  const identity =
    resolveExactIdentity(
      exactRecord
    );

  /*
   * Rich profile is retained only for technical values.
   * It is NOT the authority for legal identity.
   */
  const profile =
    getMineralWaterProfile(
      id
    );

  /*
   * ========================================================
   * LEGAL MATCH
   * ========================================================
   * getMineralLegalByFacilityId uses explicit facility_ids.
   * Section exists only when section.facility_ids contains id.
   */
  const legalMatch =
    getMineralLegalByFacilityId(
      id
    );

  const deposit =
    legalMatch?.deposit ||
    null;

  const section =
    legalMatch?.section ||
    null;

  const parentManagementStatus =
    deposit?.management_status ??
    null;

  const parentIsAmbiguous =
    parentManagementStatus ===
      "MIXED_LEGAL_REGIME" ||
    parentManagementStatus ===
      "SECTION_DEPENDENT";

  let effectiveManagementStatus:
    string | null =
      "TO_RESEARCH";

  let effectiveDelegatedMunicipality:
    string | null =
      null;

  let effectiveManagingAuthority:
    string | null =
      null;

  let effectiveSource:
    "section" |
    "deposit" |
    "unresolved" =
      "unresolved";

  /*
   * Exact section always wins.
   */
  if (
    section &&
    section.management_status
  ) {
    effectiveManagementStatus =
      section.management_status;

    effectiveDelegatedMunicipality =
      section.delegated_municipality ??
      null;

    effectiveManagingAuthority =
      deposit?.managing_authority ??
      null;

    effectiveSource =
      "section";
  }

  /*
   * A mixed/section-dependent parent MUST NOT be inherited
   * if this facility is not assigned to an exact section.
   */
  else if (parentIsAmbiguous) {
    effectiveManagementStatus =
      "TO_RESEARCH";

    effectiveDelegatedMunicipality =
      null;

    effectiveManagingAuthority =
      null;

    effectiveSource =
      "unresolved";
  }

  /*
   * Only a single, non-ambiguous deposit regime may be
   * inherited by a facility listed explicitly in facility_ids.
   */
  else if (
    deposit &&
    parentManagementStatus
  ) {
    effectiveManagementStatus =
      parentManagementStatus;

    effectiveDelegatedMunicipality =
      deposit.delegated_municipality ??
      null;

    effectiveManagingAuthority =
      deposit.managing_authority ??
      null;

    effectiveSource =
      "deposit";
  }

  const officialSources =
    resolveExactSources(
      exactRecord,
      identity.distinct
    );

  return {
    facilityId: id,

    identity: {
      name:
        identity.name,

      facilityType:
        identity.facilityType,

      settlement:
        identity.settlement,

      municipality:
        identity.municipality,

      deposit:
        identity.deposit,

      registryNumber:
        identity.registryNumber,
    },

    legal: {
      depositId:
        deposit?.deposit_id ??
        null,

      depositName:
        deposit?.canonical_name ??
        identity.deposit,

      sectionId:
        section?.section_id ??
        null,

      sectionName:
        section?.name ??
        null,

      effectiveManagementStatus,

      effectiveDelegatedMunicipality,

      effectiveManagingAuthority,

      effectiveSource,

      parentManagementStatus,

      isParentAmbiguous:
        parentIsAmbiguous,

      ownershipStatus:
        deposit?.ownership_status ??
        null,

      managingAuthority:
        effectiveManagingAuthority,

      delegatedMunicipality:
        effectiveDelegatedMunicipality,
    },

    availability: {
      hasRegistryNumber:
        Boolean(
          identity.registryNumber
        ),

      hasDepth:
        profile?.depthM != null,

      hasTemperature:
        profile?.temperatureC != null,

      hasOfficialSources:
        officialSources.length > 0,

      officialSourceCount:
        officialSources.length,
    },

    officialSources,

    profile,

    resolution: {
      masterIdentity:
        "exact-mineral-id",

      legalIdentity:
        legalMatch
          ? "explicit-facility-id"
          : "unresolved",

      effectiveLegalSource:
        effectiveSource,

      usedRelatedRecords:
        false,

      researchDistinctFacility:
        identity.distinct,

      existingPropertiesUsedForIdentity:
        !identity.distinct,
    },
  };
}
