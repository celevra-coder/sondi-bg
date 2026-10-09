import "server-only";

import fs from "node:fs";
import path from "node:path";

export type VratsaDepthLithologyConfidence =
  | "VERY_HIGH"
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "UNRESOLVED";

export type VratsaDepthLithologyRuleType =
  | "DIRECT_DEPTH_TEMPLATE"
  | "CONDITIONAL_TEMPLATE"
  | "REGIONAL_SEQUENCE"
  | "STRUCTURAL_FALLBACK"
  | "UNRESOLVED";

export type VratsaDepthLithologyStatus =
  | "OK"
  | "CONDITIONAL_LITHOLOGY"
  | "UNRESOLVED"
  | "INVALID_INPUT"
  | "DATA_UNAVAILABLE";

export type VratsaDepthLithologySelector =
  | "VARBITSA_MARL_MODEL"
  | "SUMER_SURFACE_POLYGON"
  | "MRAMOREN_SURFACE_POLYGON"
  | "VRATSA_URGONIAN_POLYGON"
  | "PASTRINA_KRIVODOL_POLYGON"
  | "MEZDRA_FORMATION_POLYGON"
  | "KAYLAKA_KARLUKOVO_ROMAN_POLYGON"
  | "SOUTH_MEZDRA_SYNCLINE_MORAVITSA_CONTROL"
  | "KAPITANITSA"
  | "RAVNISHTETO"
  | "OSTROV_LOWLAND"
  | null;

export type ResolveVratsaDepthLithologyInput = {
  zoneId:
    | "VRA-Z01"
    | "VRA-Z02"
    | "VRA-Z03"
    | "VRA-Z04";

  municipality?: string | null;

  depthM: number;

  selector?:
    VratsaDepthLithologySelector;
};

export type VratsaDepthLithologyResult = {
  status:
    VratsaDepthLithologyStatus;

  zone_id:
    string;

  municipality:
    string | null;

  depth_m:
    number;

  selector:
    string | null;

  probable_lithology:
    string | null;

  alternative_lithologies:
    string[];

  confidence:
    VratsaDepthLithologyConfidence;

  raw_confidence:
    string | null;

  rule_type:
    VratsaDepthLithologyRuleType;

  source_record_ids:
    string[];

  source_ids:
    string[];

  limitations:
    string[];
};

type AnyObject =
  Record<string, any>;

let cachedModel:
  AnyObject | null = null;

function modelPath(): string {
  return path.join(
    process.cwd(),
    "data",
    "soil-lithology",
    "runtime",
    "vratsa",
    "depth_lithology_model.json"
  );
}

function loadModel():
  AnyObject | null {

  if (cachedModel) {
    return cachedModel;
  }

  try {
    const file =
      modelPath();

    const raw =
      fs.readFileSync(
        file,
        "utf8"
      );

    cachedModel =
      JSON.parse(raw);

    return cachedModel;
  }
  catch {
    return null;
  }
}

function validNumber(
  value: unknown
): value is number {

  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

function normalizeMunicipality(
  value:
    string | null | undefined
): string | null {

  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const clean =
    value.trim();

  return clean || null;
}

function normalizeConfidence(
  value:
    unknown
): VratsaDepthLithologyConfidence {

  if (
    typeof value !== "string"
  ) {
    return "UNRESOLVED";
  }

  const upper =
    value.toUpperCase();

  /*
   * Mixed confidence ranges are normalized
   * conservatively to their lower bound.
   *
   * LOW_TO_MEDIUM   -> LOW
   * MEDIUM_TO_HIGH  -> MEDIUM
   *
   * This avoids silently overstating the
   * certainty of regional/structural models.
   */
  if (
    upper.includes("VERY_HIGH")
  ) {
    return "VERY_HIGH";
  }

  if (
    upper.includes("LOW")
  ) {
    return "LOW";
  }

  if (
    upper.includes("MEDIUM")
  ) {
    return "MEDIUM";
  }

  if (
    upper.includes("HIGH")
  ) {
    return "HIGH";
  }

  return "UNRESOLVED";
}

function uniqueStrings(
  values:
    Array<string | null | undefined>
): string[] {

  return [
    ...new Set(
      values.filter(
        (
          value
        ): value is string =>
          typeof value === "string" &&
          value.trim().length > 0
      )
    ),
  ];
}

function depthKey(
  depthM: number
): string {

  if (
    Math.abs(
      depthM -
      Math.round(depthM)
    ) < 1e-9
  ) {
    return `${Math.round(depthM)}_m`;
  }

  return `${depthM}_m`;
}

function collectSources(
  ...items:
    AnyObject[]
): {
  recordIds: string[];
  sourceIds: string[];
} {

  const recordIds:
    string[] = [];

  const sourceIds:
    string[] = [];

  for (
    const item of items
  ) {

    if (!item) {
      continue;
    }

    if (
      typeof item.record_id ===
      "string"
    ) {
      recordIds.push(
        item.record_id
      );
    }

    if (
      Array.isArray(
        item.source_ids
      )
    ) {
      for (
        const sourceId of
        item.source_ids
      ) {
        if (
          typeof sourceId ===
          "string"
        ) {
          sourceIds.push(
            sourceId
          );
        }
      }
    }
  }

  return {
    recordIds:
      uniqueStrings(
        recordIds
      ),

    sourceIds:
      uniqueStrings(
        sourceIds
      ),
  };
}

function unresolved(
  input:
    ResolveVratsaDepthLithologyInput,
  status:
    VratsaDepthLithologyStatus,
  limitation:
    string
): VratsaDepthLithologyResult {

  return {
    status,

    zone_id:
      input.zoneId,

    municipality:
      normalizeMunicipality(
        input.municipality
      ),

    depth_m:
      input.depthM,

    selector:
      input.selector || null,

    probable_lithology:
      null,

    alternative_lithologies:
      [],

    confidence:
      "UNRESOLVED",

    raw_confidence:
      null,

    rule_type:
      "UNRESOLVED",

    source_record_ids:
      [],

    source_ids:
      [],

    limitations: [
      limitation,
    ],
  };
}

function exactRule(
  rules:
    AnyObject | undefined,
  depthM:
    number
): string | null {

  if (!rules) {
    return null;
  }

  const key =
    depthKey(depthM);

  const value =
    rules[key];

  return (
    typeof value === "string"
      ? value
      : null
  );
}

function findNearestRuleAlternatives(
  rules:
    AnyObject | undefined,
  depthM:
    number
): string[] {

  if (!rules) {
    return [];
  }

  const parsed:
    Array<{
      depth: number;
      text: string;
    }> = [];

  for (
    const [
      key,
      value,
    ] of Object.entries(
      rules
    )
  ) {

    if (
      typeof value !==
      "string"
    ) {
      continue;
    }

    const match =
      key.match(
        /^(\d+(?:\.\d+)?)_m$/
      );

    if (!match) {
      continue;
    }

    parsed.push({
      depth:
        Number(match[1]),
      text:
        value,
    });
  }

  if (
    parsed.length === 0
  ) {
    return [];
  }

  parsed.sort(
    (a, b) =>
      Math.abs(
        a.depth - depthM
      ) -
      Math.abs(
        b.depth - depthM
      )
  );

  return uniqueStrings(
    parsed
      .slice(0, 2)
      .map(
        item =>
          item.text
      )
  );
}

function resolveZ01(
  zone:
    AnyObject,
  input:
    ResolveVratsaDepthLithologyInput
): VratsaDepthLithologyResult {

  const selector =
    input.selector || null;

  const localTemplates =
    zone.local_templates || [];

  if (selector) {

    const local =
      Array.isArray(
        localTemplates
      )
        ? localTemplates.find(
            (
              item:
                AnyObject
            ) =>
              item.template_id ===
              selector
          )
        : null;

    if (local) {

      const sources =
        collectSources(
          local
        );

      return {
        status:
          "CONDITIONAL_LITHOLOGY",

        zone_id:
          input.zoneId,

        municipality:
          normalizeMunicipality(
            input.municipality
          ),

        depth_m:
          input.depthM,

        selector,

        probable_lithology:
          typeof local.sequence ===
          "string"
            ? local.sequence
            : null,

        alternative_lithologies:
          [],

        confidence:
          "HIGH",

        raw_confidence:
          "LOCAL_MODEL",

        rule_type:
          "CONDITIONAL_TEMPLATE",

        source_record_ids:
          sources.recordIds,

        source_ids:
          sources.sourceIds,

        limitations: [
          typeof local.activation ===
          "string"
            ? local.activation
            : "Local model may only be used when spatially justified.",
        ],
      };
    }
  }

  const regional =
    zone.regional_sequence ||
    {};

  const sequence =
    Array.isArray(
      regional.sequence
    )
      ? regional.sequence
      : [];

  const neogene =
    sequence.filter(
      (
        item:
          AnyObject
      ) =>
        item.unit !==
        "Quaternary"
    );

  const alternatives =
    uniqueStrings(
      neogene.map(
        (
          item:
            AnyObject
        ) => {

          const unit =
            typeof item.unit ===
            "string"
              ? item.unit
              : "";

          const material =
            typeof item.probable_material ===
            "string"
              ? item.probable_material
              : "";

          return [
            unit,
            material,
          ]
            .filter(Boolean)
            .join(": ");
        }
      )
    );

  const sources =
    collectSources(
      regional
    );

  /*
   * The regional model documents >550 m
   * of Neogene/Cenozoic sequence, but does
   * not expose exact local contacts.
   *
   * Therefore, once clearly below the
   * shallow Quaternary range, return the
   * broad Neogene lithology, not a falsely
   * precise formation contact.
   */
  if (
    input.depthM >= 50
  ) {
    return {
      status:
        "OK",

      zone_id:
        input.zoneId,

      municipality:
        normalizeMunicipality(
          input.municipality
        ),

      depth_m:
        input.depthM,

      selector:
        null,

      probable_lithology:
        "Neogene clay-sand sedimentary sequence",

      alternative_lithologies:
        alternatives,

      confidence:
        "MEDIUM",

      raw_confidence:
        regional.confidence ||
        "HIGH_REGIONAL",

      rule_type:
        "REGIONAL_SEQUENCE",

      source_record_ids:
        sources.recordIds,

      source_ids:
        sources.sourceIds,

      limitations: [
        "Exact local Romanian/Dacian contact depth is not machine-resolved.",
        "Local shallow 3D model must override this regional fallback where its geometry is resolved.",
      ],
    };
  }

  return {
    status:
      "CONDITIONAL_LITHOLOGY",

    zone_id:
      input.zoneId,

    municipality:
      normalizeMunicipality(
        input.municipality
      ),

    depth_m:
      input.depthM,

    selector:
      null,

    probable_lithology:
      null,

    alternative_lithologies:
      [
        "Quaternary loess/alluvial deposits",
        "Brusartsi Formation clay/sand sequence",
      ],

    confidence:
      "MEDIUM",

    raw_confidence:
      "LOCAL_MODEL_REQUIRED",

    rule_type:
      "STRUCTURAL_FALLBACK",

    source_record_ids:
      uniqueStrings([
        "VRA-CTX-011",
        regional.record_id,
      ]),

    source_ids:
      uniqueStrings([
        ...(zone.evidence || [])
          .flatMap(
            (
              item:
                AnyObject
            ) =>
              Array.isArray(
                item.source_ids
              )
                ? item.source_ids
                : []
          ),
        ...sources.sourceIds,
      ]),

    limitations: [
      "0-50 m lithology depends strongly on local terrace/3D-model geometry.",
      "No exact shallow model surface selector is currently resolved.",
    ],
  };
}

function resolveZ02(
  zone:
    AnyObject,
  input:
    ResolveVratsaDepthLithologyInput
): VratsaDepthLithologyResult {

  const municipality =
    normalizeMunicipality(
      input.municipality
    );

  if (!municipality) {
    return unresolved(
      input,
      "UNRESOLVED",
      "VRA-Z02 requires municipality-specific model routing."
    );
  }

  const municipalModels =
    zone.municipality_models ||
    {};

  const model =
    municipalModels[
      municipality
    ];

  if (!model) {
    return unresolved(
      input,
      "UNRESOLVED",
      `No municipality model encoded for ${municipality}.`
    );
  }

  const sources =
    collectSources(
      model
    );

  if (
    model.selector_required
  ) {

    const subzones =
      model.subzones || {};

    const selector =
      input.selector || null;

    const selected =
      selector
        ? subzones[selector]
        : null;

    /*
     * If a valid geomorphic subzone is known,
     * use it directly.
     */
    if (selected) {

      const exact =
        selected[
          depthKey(
            input.depthM
          )
        ];

      const material =
        typeof exact === "string"
          ? exact
          : (
              typeof selected.material ===
              "string"
                ? selected.material
                : (
                    typeof selected.surface_model ===
                    "string"
                      ? selected.surface_model
                      : null
                  )
            );

      return {
        status:
          material
            ? "OK"
            : "CONDITIONAL_LITHOLOGY",

        zone_id:
          input.zoneId,

        municipality,

        depth_m:
          input.depthM,

        selector,

        probable_lithology:
          material,

        alternative_lithologies:
          [],

        confidence:
          material
            ? "HIGH"
            : "MEDIUM",

        raw_confidence:
          "GEOMORPHIC_SUBZONE_RESOLVED",

        rule_type:
          "CONDITIONAL_TEMPLATE",

        source_record_ids:
          sources.recordIds,

        source_ids:
          sources.sourceIds,

        limitations: [
          "This interpretation is valid only for the resolved Oryahovo geomorphic subzone.",
        ],
      };
    }

    /*
     * Without a selector, expose all materially
     * distinct subzone alternatives.
     */
    const alternatives:
      string[] = [];

    for (
      const subzone of Object.values(
        subzones
      ) as AnyObject[]
    ) {

      if (
        typeof subzone.material ===
        "string"
      ) {
        alternatives.push(
          subzone.material
        );
      }

      if (
        typeof subzone.surface_model ===
        "string"
      ) {
        alternatives.push(
          subzone.surface_model
        );
      }

      for (
        const [
          key,
          value,
        ] of Object.entries(
          subzone
        )
      ) {

        if (
          typeof value !==
          "string"
        ) {
          continue;
        }

        if (
          /^\d+_m$/.test(
            key
          )
        ) {
          alternatives.push(
            value
          );
        }
      }
    }

    /*
     * Explicit scientific fallback:
     * the encoded Oryahovo model contains
     * plateau loess and Danube floodplain
     * alluvium as distinct competing settings.
     */
    if (
      alternatives.length === 0
    ) {
      alternatives.push(
        "loess / loess complex",
        "Danube floodplain alluvium"
      );
    }

    return {
      status:
        "CONDITIONAL_LITHOLOGY",

      zone_id:
        input.zoneId,

      municipality,

      depth_m:
        input.depthM,

      selector:
        null,

      probable_lithology:
        null,

      alternative_lithologies:
        uniqueStrings(
          alternatives
        ),

      confidence:
        "MEDIUM",

      raw_confidence:
        "GEOMORPHIC_SUBZONE_REQUIRED",

      rule_type:
        "CONDITIONAL_TEMPLATE",

      source_record_ids:
        sources.recordIds,

      source_ids:
        sources.sourceIds,

      limitations: [
        `Required selector: ${model.selector_required}.`,
        "Plateau-loess and Danube-floodplain models must not be mixed.",
      ],
    };
  }

  if (
    Array.isArray(
      model.rules
    )
  ) {

    const exact =
      model.rules.find(
        (
          rule:
            AnyObject
        ) =>
          rule.depth_m ===
          input.depthM
      );

    if (exact) {

      const rawConfidence =
        typeof exact.confidence ===
        "string"
          ? exact.confidence
          : null;

      return {
        status:
          "OK",

        zone_id:
          input.zoneId,

        municipality,

        depth_m:
          input.depthM,

        selector:
          null,

        probable_lithology:
          typeof exact.probable ===
          "string"
            ? exact.probable
            : null,

        alternative_lithologies:
          [],

        confidence:
          normalizeConfidence(
            rawConfidence
          ),

        raw_confidence:
          rawConfidence,

        rule_type:
          "DIRECT_DEPTH_TEMPLATE",

        source_record_ids:
          sources.recordIds,

        source_ids:
          sources.sourceIds,

        limitations:
          exact.probable &&
          (
            exact.probable.includes(
              " OR "
            ) ||
            exact.probable.includes(
              "depending"
            )
          )
            ? [
                "The source model itself is conditional at this depth.",
              ]
            : [],
      };
    }

    const ordered =
      model.rules
        .filter(
          (
            rule:
              AnyObject
          ) =>
            validNumber(
              rule.depth_m
            ) &&
            typeof rule.probable ===
              "string"
        )
        .sort(
          (
            a:
              AnyObject,
            b:
              AnyObject
          ) =>
            Math.abs(
              a.depth_m -
              input.depthM
            ) -
            Math.abs(
              b.depth_m -
              input.depthM
            )
        );

    return {
      status:
        "CONDITIONAL_LITHOLOGY",

      zone_id:
        input.zoneId,

      municipality,

      depth_m:
        input.depthM,

      selector:
        null,

      probable_lithology:
        null,

      alternative_lithologies:
        uniqueStrings(
          ordered
            .slice(0, 2)
            .map(
              (
                rule:
                  AnyObject
              ) =>
                rule.probable
            )
        ),

      confidence:
        "MEDIUM",

      raw_confidence:
        "BETWEEN_ENCODED_DEPTH_ANCHORS",

      rule_type:
        "REGIONAL_SEQUENCE",

      source_record_ids:
        sources.recordIds,

      source_ids:
        sources.sourceIds,

      limitations: [
        "Requested depth is between explicitly encoded depth anchors.",
        "No artificial contact interpolation was performed.",
      ],
    };
  }

  if (
    Array.isArray(
      model.sequence
    )
  ) {

    return {
      status:
        "CONDITIONAL_LITHOLOGY",

      zone_id:
        input.zoneId,

      municipality,

      depth_m:
        input.depthM,

      selector:
        null,

      probable_lithology:
        null,

      alternative_lithologies:
        uniqueStrings(
          model.sequence.map(
            (
              item:
                AnyObject
            ) =>
              [
                item.unit,
                item.material,
              ]
                .filter(Boolean)
                .join(": ")
          )
        ),

      confidence:
        normalizeConfidence(
          model.confidence
        ),

      raw_confidence:
        model.confidence ||
        null,

      rule_type:
        "REGIONAL_SEQUENCE",

      source_record_ids:
        sources.recordIds,

      source_ids:
        sources.sourceIds,

      limitations: [
        model.guard ||
        "Exact formation depth requires additional structural control.",
      ],
    };
  }

  return unresolved(
    input,
    "UNRESOLVED",
    "No usable VRA-Z02 depth rule was resolved."
  );
}

function resolveZ03(
  zone:
    AnyObject,
  input:
    ResolveVratsaDepthLithologyInput
): VratsaDepthLithologyResult {

  const selector =
    input.selector || null;

  const local =
    zone.local_templates?.[
      selector || ""
    ];

  if (local) {

    const rule =
      exactRule(
        local.rules,
        input.depthM
      );

    const alternatives =
      rule
        ? []
        : findNearestRuleAlternatives(
            local.rules,
            input.depthM
          );

    const sources =
      collectSources(
        local
      );

    return {
      status:
        rule
          ? "OK"
          : "CONDITIONAL_LITHOLOGY",

      zone_id:
        input.zoneId,

      municipality:
        normalizeMunicipality(
          input.municipality
        ),

      depth_m:
        input.depthM,

      selector,

      probable_lithology:
        rule,

      alternative_lithologies:
        alternatives,

      confidence:
        rule
          ? normalizeConfidence(
              local.confidence
            )
          : "MEDIUM",

      raw_confidence:
        local.confidence ||
        null,

      rule_type:
        "DIRECT_DEPTH_TEMPLATE",

      source_record_ids:
        sources.recordIds,

      source_ids:
        sources.sourceIds,

      limitations:
        rule
          ? []
          : [
              "Requested depth is not an explicit local template anchor.",
            ],
    };
  }

  const conditional =
    zone
      .conditional_surface_templates?.[
        selector || ""
      ];

  if (conditional) {

    const rule =
      exactRule(
        conditional.rules,
        input.depthM
      );

    const alternatives =
      rule
        ? []
        : findNearestRuleAlternatives(
            conditional.rules,
            input.depthM
          );

    const rawConfidence =
      conditional.confidence ||
      conditional.confidence_0_300 ||
      conditional.confidence_0_100 ||
      conditional.confidence_0_200 ||
      conditional.confidence_500 ||
      null;

    return {
      status:
        rule
          ? "OK"
          : "CONDITIONAL_LITHOLOGY",

      zone_id:
        input.zoneId,

      municipality:
        normalizeMunicipality(
          input.municipality
        ),

      depth_m:
        input.depthM,

      selector,

      probable_lithology:
        rule,

      alternative_lithologies:
        alternatives,

      confidence:
        normalizeConfidence(
          rawConfidence
        ),

      raw_confidence:
        rawConfidence,

      rule_type:
        "CONDITIONAL_TEMPLATE",

      source_record_ids:
        ["VRA-CTX-025"],

      source_ids:
        Array.isArray(
          zone.source_ids
        )
          ? zone.source_ids
          : [],

      limitations:
        rule
          ? [
              "Template is valid only for the resolved surface geological polygon/facies context.",
            ]
          : [
              "Requested depth is outside explicit template anchors.",
            ],
    };
  }

  const fallback =
    zone
      .fallback_output_when_surface_polygon_unknown ||
    {};

  return {
    status:
      "CONDITIONAL_LITHOLOGY",

    zone_id:
      input.zoneId,

    municipality:
      normalizeMunicipality(
        input.municipality
      ),

    depth_m:
      input.depthM,

    selector:
      null,

    probable_lithology:
      null,

    alternative_lithologies:
      Array.isArray(
        fallback.allowed_alternatives
      )
        ? fallback.allowed_alternatives
        : [],

    confidence:
      normalizeConfidence(
        fallback.confidence
      ),

    raw_confidence:
      fallback.confidence ||
      null,

    rule_type:
      "STRUCTURAL_FALLBACK",

    source_record_ids:
      ["VRA-CTX-025"],

    source_ids:
      Array.isArray(
        zone.source_ids
      )
        ? zone.source_ids
        : [],

    limitations:
      uniqueStrings([
        fallback.note,
        ...(Array.isArray(
          zone.facies_guards
        )
          ? zone.facies_guards
          : []),
      ]),
  };
}

function resolveZ04(
  zone:
    AnyObject,
  input:
    ResolveVratsaDepthLithologyInput
): VratsaDepthLithologyResult {

  const selector =
    input.selector || null;

  const conditional =
    zone
      .conditional_templates?.[
        selector || ""
      ];

  if (conditional) {

    const rules =
      conditional.rules ||
      {};

    /*
     * Z04 templates include interval keys
     * such as 0_50_m and 50_100_m.
     */
    let matched:
      string | null = null;

    for (
      const [
        key,
        value,
      ] of Object.entries(
        rules
      )
    ) {

      if (
        typeof value !==
        "string"
      ) {
        continue;
      }

      const interval =
        key.match(
          /^(\d+)_(\d+)_m$/
        );

      if (
        interval
      ) {

        const from =
          Number(
            interval[1]
          );

        const to =
          Number(
            interval[2]
          );

        if (
          input.depthM >= from &&
          input.depthM <= to
        ) {
          matched =
            value;
          break;
        }
      }
    }

    const rawConfidence =
      conditional.confidence ||
      (
        input.depthM <= 80
          ? conditional.confidence_0_80
          : conditional.confidence_100_200
      ) ||
      conditional.confidence ||
      null;

    return {
      status:
        matched
          ? "OK"
          : "CONDITIONAL_LITHOLOGY",

      zone_id:
        input.zoneId,

      municipality:
        normalizeMunicipality(
          input.municipality
        ),

      depth_m:
        input.depthM,

      selector,

      probable_lithology:
        matched,

      alternative_lithologies:
        matched
          ? []
          : uniqueStrings(
              Object.values(
                rules
              ).filter(
                (
                  value
                ): value is string =>
                  typeof value ===
                  "string"
              )
            ),

      confidence:
        normalizeConfidence(
          rawConfidence
        ),

      raw_confidence:
        rawConfidence,

      rule_type:
        "CONDITIONAL_TEMPLATE",

      source_record_ids:
        [
          zone.record_id ||
          "VRA-CTX-026",
        ],

      source_ids:
        Array.isArray(
          zone.source_ids
        )
          ? zone.source_ids
          : [],

      limitations: [
        "Template is valid only when the surface formation and structural position are spatially justified.",
      ],
    };
  }

  const fallback =
    zone
      .fallback_output_when_structure_unknown ||
    {};

  return {
    status:
      "CONDITIONAL_LITHOLOGY",

    zone_id:
      input.zoneId,

    municipality:
      normalizeMunicipality(
        input.municipality
      ),

    depth_m:
      input.depthM,

    selector:
      null,

    probable_lithology:
      null,

    alternative_lithologies:
      Array.isArray(
        fallback.allowed_alternatives
      )
        ? fallback.allowed_alternatives
        : [],

    confidence:
      normalizeConfidence(
        fallback.confidence
      ),

    raw_confidence:
      fallback.confidence ||
      null,

    rule_type:
      "STRUCTURAL_FALLBACK",

    source_record_ids:
      [
        zone.record_id ||
        "VRA-CTX-026",
      ],

    source_ids:
      Array.isArray(
        zone.source_ids
      )
        ? zone.source_ids
        : [],

    limitations:
      uniqueStrings([
        fallback.note,
        ...(Array.isArray(
          zone.structural_guards
        )
          ? zone.structural_guards
          : []),
      ]),
  };
}

export function resolveVratsaDepthLithology(
  input:
    ResolveVratsaDepthLithologyInput
): VratsaDepthLithologyResult {

  if (
    !validNumber(
      input.depthM
    ) ||
    input.depthM < 0
  ) {
    return unresolved(
      input,
      "INVALID_INPUT",
      "Depth must be a finite non-negative number."
    );
  }

  const model =
    loadModel();

  if (!model) {
    return unresolved(
      input,
      "DATA_UNAVAILABLE",
      "Vratsa depth lithology model could not be loaded."
    );
  }

  const zone =
    model.zones?.[
      input.zoneId
    ];

  if (!zone) {
    return unresolved(
      input,
      "UNRESOLVED",
      `Unknown Vratsa model zone: ${input.zoneId}`
    );
  }

  switch (
    input.zoneId
  ) {

    case "VRA-Z01":
      return resolveZ01(
        zone,
        input
      );

    case "VRA-Z02":
      return resolveZ02(
        zone,
        input
      );

    case "VRA-Z03":
      return resolveZ03(
        zone,
        input
      );

    case "VRA-Z04":
      return resolveZ04(
        zone,
        input
      );

    default:
      return unresolved(
        input,
        "UNRESOLVED",
        "No resolver exists for this zone."
      );
  }
}