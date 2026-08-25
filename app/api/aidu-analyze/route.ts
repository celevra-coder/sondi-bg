import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function extractJson(raw: string) {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(cleaned);
}

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error:
            "\u041b\u0438\u043f\u0441\u0432\u0430 OPENAI_API_KEY.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const latitude = Number(body?.latitude);
    const longitude = Number(body?.longitude);

    const locationLabel =
      typeof body?.locationLabel === "string"
        ? body.locationLabel.trim()
        : "";

    const dowsingNotes =
      typeof body?.dowsingNotes === "string"
        ? body.dowsingNotes.trim()
        : "";

    const aiduFiles =
      Array.isArray(body?.aiduFiles)
        ? body.aiduFiles
        : [];

    const groundwaterBodies =
      Array.isArray(body?.groundwaterBodies)
        ? body.groundwaterBodies
        : [];

    const spatialContext =
      body?.spatialContext ?? null;

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "\u041b\u0438\u043f\u0441\u0432\u0430 \u0432\u0430\u043b\u0438\u0434\u043d\u0430 \u043b\u043e\u043a\u0430\u0446\u0438\u044f.",
        },
        { status: 400 }
      );
    }

    if (aiduFiles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "\u041d\u044f\u043c\u0430 \u043f\u043e\u0434\u0430\u0434\u0435\u043d\u0438 AIDU .dat \u0434\u0430\u043d\u043d\u0438.",
        },
        { status: 400 }
      );
    }

    const payload = {
      location: {
        label:
          locationLabel ||
          "Location supplied by coordinates",
        latitude,
        longitude,
      },
      groundwaterBodies,
      spatialContext,
      dowsingNotes:
        dowsingNotes ||
        "No dowsing information supplied.",
      aiduFiles,
    };

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    /*
      ==========================================================
      SINGLE SOL ANALYSIS ? OPERATOR-GUIDED ZONE INTERPRETATION
      ==========================================================

      The operator defines the field hypothesis and, when stated,
      the operational drilling point.

      Sol analyses the measurements, neighbouring-point continuity,
      depth intervals and spatial zones around that field hypothesis.

      Sol does NOT automatically replace an explicitly selected
      operator drilling point.
    */

    const analysisPayload = {
      location: {
        label:
          locationLabel ||
          "Location supplied by coordinates",
        latitude,
        longitude,
      },

      aiduFiles,

      groundwaterBodies,

      spatialContext,

      fieldNotes:
        dowsingNotes ||
        "No additional field information supplied.",
    };

    const response =
      await client.responses.create({
        model:
          process.env.AIDU_AI_MODEL ||
          "gpt-5.6",

        reasoning: {
          effort: "medium",
        },

        max_output_tokens: 9000,

        text: {
          format: {
            type: "json_schema",
            name: "aidu_operator_guided_analysis",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: [
                "summary",
                "measuredPatterns",
                "candidateHorizons",
                "pointRanking",
                "crossProfileComparison",
                "dowsingComparison",
                "mapComparison",
                "strongestAiduPoint",
                "bestCrossProfilePoint",
                "recommendedPoint",
                "recommendedDrillingDepth",
                "secondaryTarget",
                "limitations"
              ],
              properties: {
                summary: {
                  type: "string"
                },

                measuredPatterns: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: [
                      "file",
                      "details"
                    ],
                    properties: {
                      file: {
                        type: "string"
                      },
                      details: {
                        type: "string"
                      }
                    }
                  }
                },

                candidateHorizons: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: [
                      "label",
                      "fromM",
                      "toM",
                      "confidence",
                      "supportingPoints",
                      "reasoning",
                      "alternativeExplanation"
                    ],
                    properties: {
                      label: {
                        type: "string"
                      },
                      fromM: {
                        type: [
                          "number",
                          "null"
                        ]
                      },
                      toM: {
                        type: [
                          "number",
                          "null"
                        ]
                      },
                      confidence: {
                        type: "string",
                        enum: [
                          "high",
                          "medium",
                          "low"
                        ]
                      },
                      supportingPoints: {
                        type: "array",
                        items: {
                          type: "string"
                        }
                      },
                      reasoning: {
                        type: "string"
                      },
                      alternativeExplanation: {
                        type: "string"
                      }
                    }
                  }
                },

                pointRanking: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: [
                      "point",
                      "perspective",
                      "preferredDepthFromM",
                      "preferredDepthToM",
                      "reasoning"
                    ],
                    properties: {
                      point: {
                        type: "string"
                      },
                      perspective: {
                        type: "string",
                        enum: [
                          "high",
                          "medium",
                          "low"
                        ]
                      },
                      preferredDepthFromM: {
                        type: [
                          "number",
                          "null"
                        ]
                      },
                      preferredDepthToM: {
                        type: [
                          "number",
                          "null"
                        ]
                      },
                      reasoning: {
                        type: "string"
                      }
                    }
                  }
                },

                crossProfileComparison: {
                  type: "object",
                  additionalProperties: false,
                  required: [
                    "available",
                    "details"
                  ],
                  properties: {
                    available: {
                      type: "boolean"
                    },
                    details: {
                      type: "string"
                    }
                  }
                },

                dowsingComparison: {
                  type: "object",
                  additionalProperties: false,
                  required: [
                    "agreement",
                    "details"
                  ],
                  properties: {
                    agreement: {
                      type: "string",
                      enum: [
                        "matches",
                        "partly matches",
                        "cannot confirm",
                        "does not match"
                      ]
                    },
                    details: {
                      type: "string"
                    }
                  }
                },

                mapComparison: {
                  type: "object",
                  additionalProperties: false,
                  required: [
                    "confidence",
                    "effectOnRecommendation",
                    "groundwaterBodies",
                    "nearbyWells",
                    "faults",
                    "monitoring",
                    "supportingEvidence",
                    "contradictingEvidence",
                    "details"
                  ],
                  properties: {
                    confidence: {
                      type: "string",
                      enum: [
                        "high",
                        "medium",
                        "low"
                      ]
                    },
                    effectOnRecommendation: {
                      type: "string",
                      enum: [
                        "supports",
                        "neutral",
                        "contradicts"
                      ]
                    },
                    groundwaterBodies: {
                      type: "string"
                    },
                    nearbyWells: {
                      type: "string"
                    },
                    faults: {
                      type: "string"
                    },
                    monitoring: {
                      type: "string"
                    },
                    supportingEvidence: {
                      type: "array",
                      items: {
                        type: "string"
                      }
                    },
                    contradictingEvidence: {
                      type: "array",
                      items: {
                        type: "string"
                      }
                    },
                    details: {
                      type: "string"
                    }
                  }
                },

                strongestAiduPoint: {
                  type: "object",
                  additionalProperties: false,
                  required: [
                    "point",
                    "profile",
                    "confidence",
                    "reasoning"
                  ],
                  properties: {
                    point: {
                      type: "string"
                    },
                    profile: {
                      type: "string"
                    },
                    confidence: {
                      type: "string",
                      enum: [
                        "high",
                        "medium",
                        "low"
                      ]
                    },
                    reasoning: {
                      type: "string"
                    }
                  }
                },

                bestCrossProfilePoint: {
                  type: "object",
                  additionalProperties: false,
                  required: [
                    "available",
                    "point",
                    "confidence",
                    "reasoning"
                  ],
                  properties: {
                    available: {
                      type: "boolean"
                    },
                    point: {
                      type: "string"
                    },
                    confidence: {
                      type: "string",
                      enum: [
                        "high",
                        "medium",
                        "low"
                      ]
                    },
                    reasoning: {
                      type: "string"
                    }
                  }
                },

                recommendedPoint: {
                  type: "object",
                  additionalProperties: false,
                  required: [
                    "point",
                    "confidence",
                    "reasoning",
                    "whyPreferredOverStrongestAiduPoint"
                  ],
                  properties: {
                    point: {
                      type: "string"
                    },
                    confidence: {
                      type: "string",
                      enum: [
                        "high",
                        "medium",
                        "low"
                      ]
                    },
                    reasoning: {
                      type: "string"
                    },
                    whyPreferredOverStrongestAiduPoint: {
                      type: "string"
                    }
                  }
                },

                recommendedDrillingDepth: {
                  type: "object",
                  additionalProperties: false,
                  required: [
                    "fromM",
                    "toM",
                    "reasoning"
                  ],
                  properties: {
                    fromM: {
                      type: [
                        "number",
                        "null"
                      ]
                    },
                    toM: {
                      type: [
                        "number",
                        "null"
                      ]
                    },
                    reasoning: {
                      type: "string"
                    }
                  }
                },

                secondaryTarget: {
                  type: "object",
                  additionalProperties: false,
                  required: [
                    "present",
                    "fromM",
                    "toM",
                    "details"
                  ],
                  properties: {
                    present: {
                      type: "boolean"
                    },
                    fromM: {
                      type: [
                        "number",
                        "null"
                      ]
                    },
                    toM: {
                      type: [
                        "number",
                        "null"
                      ]
                    },
                    details: {
                      type: "string"
                    }
                  }
                },

                limitations: {
                  type: "array",
                  items: {
                    type: "string"
                  }
                }
              }
            }
          }
        },

        instructions: `
You are the technical analytical assistant for a field groundwater survey.

The operator supplies:
- parsed geophysical measurement profiles;
- field observations;
- dowsing-selected points when available;
- profile geometry;
- terrain/elevation information when available;
- an explicitly selected drilling point when one has already been chosen;
- official groundwater, geology and nearby-well context.

YOUR ROLE HAS CHANGED.

You are NOT primarily an autonomous point-selection system.

Your primary job is to:
- analyse and visualise the operator's field interpretation;
- examine continuity between neighbouring measurement points;
- identify coherent depth zones;
- determine whether selected points can reasonably belong to one common subsurface zone;
- determine the approximate depth development of those zones;
- evaluate how well the measurements support the operator's interpretation;
- integrate relevant hydrogeological/map information;
- provide drilling-depth guidance.

============================================================
CORE ANALYSIS METHOD
============================================================

1. Analyse the COMPLETE depth series for all relevant points.

2. Give strong importance to relationships BETWEEN NEIGHBOURING POINTS.

Do not reduce the analysis to finding the single largest measured value.

3. Think spatially, in a manner analogous to interpreting an N2D-style 2D contour section.

The objective is NOT to find the single numerically strongest point.

The objective is to reconstruct the spatial development of the operator-defined subsurface zone from neighbouring measurement points and depths.

Look for:
- laterally continuous zones;
- zones spanning several neighbouring points;
- coherent depth bands;
- upper and lower boundaries;
- widening or narrowing with depth;
- shifting of the apparent zone centre with depth;
- inclined or dipping structures;
- centres and margins of anomalies;
- separation between different zones;
- merging or splitting of zones;
- continuity or interruption between operator-selected points.

If the apparent centre moves from one point toward an adjacent point with increasing depth, explicitly describe this as a possible inclined / laterally shifting structure rather than treating it as a reason to change the drilling point automatically.

Interpret the FIELD GEOMETRY first, not the absolute numerical maximum.

4. When the operator identifies several points, for example:
"points 3, 4 and 5 are indicated; determine whether they form one common body",

the CENTRAL TASK is to determine whether the measured behaviour at 3-4-5 and their immediate neighbours is compatible with ONE continuous subsurface zone.

Treat the operator's proposed geometry as the working field hypothesis.

Do not replace that task with a global ranking of unrelated points elsewhere in the profile.

For the operator-defined group, reconstruct the zone in depth and laterally:
- where it first appears;
- how wide it is;
- whether it continues through all selected points;
- whether one point represents the centre while others represent margins;
- whether the centre moves laterally with depth;
- whether the structure appears inclined;
- whether it broadens or narrows;
- whether it separates into shallow and deeper branches;
- whether a deeper secondary body appears beneath or beside the main one.

Explain:
- where the zone begins;
- approximate depth interval;
- whether continuity exists between the points;
- where it strengthens or weakens;
- whether it appears to split;
- whether there is a second deeper zone.

5. Do NOT automatically search the whole profile for a different "winner" when the operator has already defined the points of interest.

============================================================
OPERATOR-SELECTED DRILLING POINT
============================================================

6. Detect whether the field notes contain an EXPLICIT operator-selected drilling point.

Examples:
- "??????? ????? 4";
- "??????? ????? 4";
- "?????? ?? ????? 4";
- "????? 4 ? ?? ??????";
- "??????????? ????? 4";
- equivalent wording.

If an explicit operator-selected drilling point exists:

- recommendedPoint MUST be that point.
- Do NOT replace it with another point.
- Analyse how the interpreted zone passes through or around that point.
- Determine how strongly the measurements support it.
- Explain any relevant weakness without changing the operational decision.

If measurements materially contradict the selected point, state this clearly.

Never fabricate measurement support merely to agree with the operator.

7. Terrain/elevation reasoning supplied by the operator is valid FIELD CONTEXT.

For example:
"point 4 is lower in elevation than points 3 and 5."

Use this when discussing why the selected point may be operationally or hydrogeologically preferred.

Do NOT invent elevations that were not supplied.

============================================================
DOWSING / FIELD POINTS
============================================================

8. Dowsing-selected points define FIELD CANDIDATES.

If the operator says:
"dowsing indicated points 3, 4 and 5",

do NOT automatically interpret this as an instruction that one of them must be the strongest measured point.

Instead evaluate whether their measurement patterns are spatially compatible with the proposed common zone.

9. Do not dismiss the field interpretation simply because another isolated point elsewhere has a larger absolute measurement value.

Absolute amplitude alone must NOT dominate the analysis.

============================================================
WHEN TO COMPARE POINTS
============================================================

10. Only make a decisive "which point is better" comparison when:

- the operator explicitly asks which point is more prospective;
- OR no field geometry, crossing point or operator-defined candidate zone provides a preferred interpretive position.

If a genuine common/crossing point is explicitly supplied by the operator, do NOT start a global point-ranking contest by default.

Analyse the geometry around that crossing first.

If explicitly asked to compare points, consider:
- continuity with neighbouring points;
- depth persistence;
- width of the interpreted zone;
- profile geometry;
- supplied terrain/elevation;
- repetition across intersecting profiles;
- hydrogeological context;
not merely absolute amplitude.

============================================================
CROSSING PROFILES
============================================================

11. If field notes explicitly state that two profile points are the SAME PHYSICAL LOCATION, treat that as a genuine crossing/control point.

A genuine crossing point is especially important because it allows the same physical location to be evaluated from two different profile directions.

When two nearly perpendicular profiles cross at the same physical point, treat that crossing point as the PRIMARY CONTROL POINT for the interpretation unless the measurements at that point clearly contradict the proposed geometry.

Do NOT automatically replace the crossing point with another local anomaly merely because another point has a higher absolute amplitude or a visually stronger local maximum.

The importance of the crossing point comes from:
- independent observation from two profile directions;
- repeated depth boundaries;
- repeated prospective intervals;
- spatial compatibility of the same interpreted body;
- the possibility that the body widens, narrows or shifts laterally away from the crossing with depth.

A stronger local response at another point may represent:
- the centre of the same body away from the crossing;
- lateral widening;
- an inclined structure;
- a local thickening;
- or a separate feature.

It must NOT automatically become the preferred drilling point unless the operator explicitly asks for a point comparison or the crossing point is clearly unsupported.

12. Do NOT infer that identical point numbers in separate files are physically identical unless the field notes say so.

13. At a genuine crossing point, compare in detail:
- the first depth at which the zone appears in each profile;
- upper and lower boundaries;
- repeated depth intervals;
- continuity with neighbouring points on each profile;
- whether the same interpreted body can reasonably pass through the crossing;
- whether the apparent centre shifts away from the crossing with depth;
- whether this shift can indicate an inclined structure;
- whether one profile shows the zone as narrow while the other shows it as broader;
- whether a second deeper zone is present in only one direction.

If both profiles support a similar depth interval at the same physical crossing point, describe this as meaningful cross-direction spatial confirmation even when the absolute amplitudes are moderate.

In this situation, the crossing point should normally remain the preferred interpretive/drilling position because the same physical location is supported from two independent directions.

Do not reject it only because another point elsewhere shows a stronger local amplitude.

Only move away from the crossing point when:
- the operator explicitly requests a comparison and another point is clearly preferable;
- or the measurements at the crossing materially fail to support the proposed common zone.

============================================================
DEPTH INTERPRETATION
============================================================

14. Identify the vertical development of the operator-defined structure, including when supported:
- shallow possible zone;
- transition zone;
- principal prospective zone;
- deeper continuation;
- deeper secondary zone.

Where useful, describe the interpretation in a sequence such as:
- shallow response around X-Y m;
- stronger common zone beginning around X m;
- main body continuing through X-Y m;
- deeper secondary development below Y m.

The purpose is to explain how the interpreted body evolves with depth, not merely to name one preferred interval.

15. Distinguish:
- TARGET INTERVAL;
- PROJECTED FINAL DRILLING DEPTH.

The lower boundary of an interpreted anomaly is NOT automatically the final drilling depth.

When appropriate, recommend drilling slightly below the principal target interval so the full zone and its lower boundary can be checked.

Do not extend deeper without measurement or field justification.

============================================================
NON-WATER EXPLANATIONS
============================================================

16. Geophysical response is not proof of groundwater.

Consider:
- clay;
- mineralisation;
- lithological contacts;
- wet sediments;
- conductive layers;
- fractured material;
- cultural/electrical interference;
- measurement artefacts.

17. Describe these as uncertainties, but do not allow generic disclaimers to replace the actual field interpretation.

============================================================
MAP / OFFICIAL CONTEXT
============================================================

18. Use groundwater body, geology, wells, monitoring, faults and mineral-water information as CONTEXT.

Explicitly distinguish whether those data:
- support general regional groundwater plausibility;
- support a particular depth;
- directly support the selected point;
- are neutral;
- or weaken the interpretation.

19. A nearby well or groundwater body does NOT by itself confirm the selected drilling point.

20. Mineral-water proximity does NOT prove thermal/mineral water at the survey point.

============================================================
WATER QUALITY
============================================================

21. Groundwater-body chemical status is regional information.

Never claim that future borehole water is drinkable or locally good quality without representative laboratory analysis.

============================================================
OUTPUT / EXISTING SONDI STRUCTURE
============================================================

22. Preserve the existing SONDI technical-report structure.

23. Write detailed technical reasoning in Bulgarian.

24. Do not unnecessarily shorten the analysis.

25. recommendedPoint rules:

IF an operator-selected drilling point exists:
- recommendedPoint.point = operator-selected point;
- reasoning explains measurement support + field reason + hydro context;
- do not pretend the AI independently selected another point.

IF no operator-selected point exists:
- provide a recommendation only from the available evidence.

26. strongestAiduPoint is retained ONLY for compatibility with the existing SONDI interface.

IMPORTANT:
This field must NOT be treated as a contest for the highest absolute measured value.

When a genuine crossing/control point is explicitly provided, prefer a representative point consistent with that operator-defined geometry rather than an unrelated numerical maximum elsewhere in the profile.

When the operator has defined a zone or selected drilling point:
- use the most technically representative point within that operator-defined interpretation;
- base the explanation on zone continuity, depth persistence, neighbouring-point behaviour and geometry;
- do not use an unrelated point elsewhere in the profile merely because it has a larger absolute value.

When an explicit operator-selected drilling point exists, this field must NOT drive or alter the final recommendation.

Do not allow this compatibility field to derail the requested N2D-style zone interpretation.

27. bestCrossProfilePoint should describe the best physically confirmed crossing point only when such a crossing is explicitly known.

28. pointRanking must focus primarily on the operator-defined candidate points and immediately relevant neighbours.

Do not create a contest across unrelated points unless the operator asked for it.

29. Return the result using the required structured output schema only.
        `.trim(),

        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text:
                  "Analyse this field survey according to the operator-guided zone interpretation rules:\n\n" +
                  JSON.stringify(
                    analysisPayload,
                    null,
                    2
                  ),
              },
            ],
          },
        ],
      });

    const raw =
      response
        .output_text
        ?.trim();

    if (!raw) {
      throw new Error(
        "AI did not return an analysis."
      );
    }

    let analysis;

    try {
      analysis =
        JSON.parse(raw);
    } catch {
      console.error(
        "Invalid operator-guided structured output:",
        raw
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "\u0410\u0418 \u043d\u0435 \u0443\u0441\u043f\u044f \u0434\u0430 \u0441\u044a\u0437\u0434\u0430\u0434\u0435 \u0432\u0430\u043b\u0438\u0434\u0435\u043d \u0442\u0435\u0445\u043d\u0438\u0447\u0435\u0441\u043a\u0438 \u0430\u043d\u0430\u043b\u0438\u0437.",
        },
        {
          status: 500,
        }
      );
    }

    /*
      Sol has already made the technical decision.

      Luna receives the finished technical interpretation and
      selected contextual evidence only. It does NOT re-rank
      survey points or choose a different drilling target.
    */
    try {
      const clientReportResponse =
        await client.responses.create({
          model:
            process.env.AIDU_CLIENT_MODEL ||
            "gpt-5.6-luna",

          reasoning: {
            effort: "low",
          },

          text: {
            verbosity: "medium",
          },

          max_output_tokens: 1800,

          instructions: `
You write the client-facing Bulgarian report for a groundwater survey.

A separate frontier model has ALREADY completed the technical interpretation.
Its technical conclusions are authoritative.

STRICT RULES:

1. Do not independently reinterpret or re-rank the raw measurements.
2. Do not change the recommended drilling point.
3. Do not change the recommended drilling depth.
4. Do not invent yield, temperature, water quality, aquifer thickness or success probability.
5. Use the supplied technical analysis as the source of truth.
6. Convert technical findings into clear ordinary Bulgarian for the landowner.
7. Write a useful and reasonably complete report, normally 4-7 short paragraphs.
8. Explain:
   - where drilling is recommended;
   - why this location is preferred;
   - the main prospective depth interval;
   - recommended drilling depth;
   - relevant groundwater/geological setting;
   - useful nearby real wells, springs, monitoring or faults when supplied;
   - whether official/map information supports, is neutral to, or weakens the interpretation;
   - meaningful uncertainty and limitations.
9. Do not overload the client with register codes or raw measurement terminology.

9A. Never expose uploaded profile/file names such as HOTOVO1, HOTOVO2 or similar names in the client report.
When a profile distinction is useful, translate it into ordinary Bulgarian, for example:
- "??????? ???????????? ???????????";
- "??????? ???????????? ???????????";
- "?????? ???????? ?????";
- "????????? ???????????? ?????".

9B. When map, registry or official hydrogeological information proves only that groundwater is regionally plausible, do NOT describe it as confirmation of the exact drilling point.
Distinguish clearly between:
- support for the general hydrogeological setting;
- support for a depth interval;
- direct support for a specific drilling point.

If the supplied technical analysis says that map evidence supports the general groundwater potential but does not distinguish between measurement points, phrase it accordingly.

10. Never mention:
   - AIDU;
   - ADMT;
   - .dat;
   - uploaded file names;
   - profile file names such as HOTOVO1 or HOTOVO2;
   - E values;
   - JSON;
   - internal model reasoning;
   - instrument-only ranking terminology.

11. Do not state that local water is drinkable or good quality without a representative laboratory test.
12. If groundwater-body chemical status is mentioned, clearly state that it is regional/body-level information and does not guarantee local borehole water quality.
13. End with the practical limitation that actual yield and local quality are confirmed by drilling, pumping test and laboratory analysis.
14. Output ONLY the Bulgarian client report as plain text. No JSON and no markdown headings.
          `.trim(),

          input: [
            {
              role: "user",
              content: [
                {
                  type: "input_text",
                  text:
                    JSON.stringify(
                      {
                        location:
                          payload.location,

                        technicalAnalysis:
                          analysis,

                        groundwaterBodies,

                        spatialContext,

                        additionalSiteInformation:
                          dowsingNotes ||
                          null,
                      },
                      null,
                      2
                    ),
                },
              ],
            },
          ],
        });

      const clientText =
        clientReportResponse
          .output_text
          ?.trim();

      if (clientText) {
        analysis.clientText =
          clientText;
      } else {
        analysis.clientText =
          analysis.summary ||
          "\u0422\u0435\u0445\u043d\u0438\u0447\u0435\u0441\u043a\u0438\u044f\u0442 \u0430\u043d\u0430\u043b\u0438\u0437 \u0435 \u0437\u0430\u0432\u044a\u0440\u0448\u0435\u043d.";
      }
    } catch (clientReportError) {
      /*
        A Luna formatting failure must never destroy an
        already completed Sol technical interpretation.
      */
      console.error(
        "AIDU Luna client report failed:",
        clientReportError
      );

      analysis.clientText =
        analysis.summary ||
        "\u0422\u0435\u0445\u043d\u0438\u0447\u0435\u0441\u043a\u0438\u044f\u0442 \u0430\u043d\u0430\u043b\u0438\u0437 \u0435 \u0437\u0430\u0432\u044a\u0440\u0448\u0435\u043d.";
    }

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error(
      "AIDU analysis failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "\u041d\u0435\u0443\u0441\u043f\u0435\u0448\u0435\u043d AIDU AI \u0430\u043d\u0430\u043b\u0438\u0437.",
      },
      { status: 500 }
    );
  }
}
