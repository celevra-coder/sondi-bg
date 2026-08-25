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
      SOL STAGE A ? STRICTLY ISOLATED INSTRUMENT ANALYSIS
      ==========================================================

      This call sees ONLY the parsed measurement profiles.

      It does NOT receive:
      - coordinates;
      - settlement/location;
      - groundwater bodies;
      - geology;
      - nearby wells;
      - faults;
      - monitoring;
      - mineral-water information;
      - dowsing / field notes;
      - statements about common/crossing/preferred points.

      This makes the instrument ranking independent from
      operator expectations and map context.
    */

    const instrumentResponse =
      await client.responses.create({
        model:
          process.env.AIDU_AI_MODEL ||
          "gpt-5.6",

        reasoning: {
          effort: "medium",
        },

        max_output_tokens: 7000,

        text: {
          format: {
            type: "json_schema",
            name: "aidu_instrument_analysis",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: [
                "summary",
                "measuredPatterns",
                "candidateHorizons",
                "pointRanking",
                "profileComparison",
                "strongestInstrumentPoint",
                "secondaryInstrumentCandidates",
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
                      "supportingLocations",
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

                      supportingLocations: {
                        type: "array",
                        items: {
                          type: "object",
                          additionalProperties: false,
                          required: [
                            "profile",
                            "points"
                          ],
                          properties: {
                            profile: {
                              type: "string"
                            },
                            points: {
                              type: "array",
                              items: {
                                type: "string"
                              }
                            }
                          }
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
                      "profile",
                      "point",
                      "perspective",
                      "preferredDepthFromM",
                      "preferredDepthToM",
                      "reasoning"
                    ],
                    properties: {
                      profile: {
                        type: "string"
                      },

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

                profileComparison: {
                  type: "object",
                  additionalProperties: false,
                  required: [
                    "details"
                  ],
                  properties: {
                    details: {
                      type: "string"
                    }
                  }
                },

                strongestInstrumentPoint: {
                  type: "object",
                  additionalProperties: false,
                  required: [
                    "profile",
                    "point",
                    "confidence",
                    "preferredDepthFromM",
                    "preferredDepthToM",
                    "reasoning"
                  ],
                  properties: {
                    profile: {
                      type: "string"
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
                },

                secondaryInstrumentCandidates: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: [
                      "profile",
                      "point",
                      "confidence",
                      "reasoning"
                    ],
                    properties: {
                      profile: {
                        type: "string"
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
You are performing STAGE A of a groundwater geophysical interpretation.

You receive ONLY parsed geophysical measurement profiles.

This stage must be completely independent of:
- field notes;
- dowsing;
- map data;
- geology;
- groundwater-body information;
- nearby wells;
- operator preferences;
- statements that a point is common, crossing, preferred or important.

You do not know any of those things.

IMPORTANT:

1. Analyse every measurement point and every available depth.

2. Compare points WITHIN each profile.

3. Identify:
- sharp vertical transitions;
- broad depth anomalies;
- persistent anomalies across several consecutive depths;
- lateral continuation into neighbouring points;
- local maxima/minima and contrasts;
- shallow, principal and deeper candidate intervals.

4. Do not assume that high or low measured values automatically mean water.

5. Explicitly consider alternative explanations such as:
- clay;
- mineralisation;
- lithological contact;
- wet sediments;
- fractured material;
- conductive material;
- interference;
- isolated artefact.

6. Rank the measurement points based ONLY on the numerical profiles.

7. A strong drilling candidate should preferably combine:
- local contrast against neighbouring points;
- persistence over several depths;
- lateral support from adjacent points;
- a coherent depth interval.

8. If several uploaded profiles contain the same point NUMBER, DO NOT assume those point numbers represent the same physical location.
Without field information, identical point numbers in different files are merely labels.

9. You may compare the general depth patterns between profiles, but you must not claim that two profiles physically intersect.

10. Identify ONE strongest instrument-only point overall.

11. Also identify strong secondary candidates when justified.

12. Analyse all available depths. Do not stop at the first anomaly.

13. Do not use groundwater, geology or drilling terminology as if it were proven.
Describe the measured pattern first and state that water is only one possible interpretation.

14. Write detailed technical reasoning in Bulgarian.

15. Return the result using the required structured output schema.
Do not add any text outside the structured result.
        `.trim(),

        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text:
                  "Analyse ONLY these measurement profiles. No field or map context exists in this stage:\n\n" +
                  JSON.stringify(
                    {
                      aiduFiles,
                    },
                    null,
                    2
                  ),
              },
            ],
          },
        ],
      });

    const instrumentRaw =
      instrumentResponse
        .output_text
        ?.trim();

    if (!instrumentRaw) {
      throw new Error(
        "AI did not return the isolated instrument analysis."
      );
    }

    let instrumentAnalysis;

    try {
      instrumentAnalysis =
        JSON.parse(
          instrumentRaw
        );
    } catch {
      console.error(
        "Invalid isolated structured output:",
        instrumentRaw
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "\u0410\u0418 \u043d\u0435 \u0443\u0441\u043f\u044f \u0434\u0430 \u0441\u044a\u0437\u0434\u0430\u0434\u0435 \u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0438\u0440\u0430\u043d \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u0430\u043b\u0435\u043d \u0430\u043d\u0430\u043b\u0438\u0437.",
        },
        {
          status: 500,
        }
      );
    }

    /*
      ==========================================================
      SOL STAGE B ? INTEGRATED TECHNICAL DECISION
      ==========================================================

      Stage B does NOT receive raw measurement arrays.

      It receives the completed Stage A interpretation as a
      locked measurement assessment, plus field/map context.

      Therefore operator notes cannot retroactively change
      which point was strongest in the raw instrument data.
    */

    const integrationPayload = {
      location: {
        label:
          locationLabel ||
          "Location supplied by coordinates",
        latitude,
        longitude,
      },

      lockedInstrumentAnalysis:
        instrumentAnalysis,

      groundwaterBodies,

      spatialContext,

      fieldNotes:
        dowsingNotes ||
        "No additional field information supplied.",
    };

    const integrationResponse =
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
            name: "aidu_integrated_analysis",
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
                        type: ["number", "null"]
                      },
                      toM: {
                        type: ["number", "null"]
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
                        type: ["number", "null"]
                      },
                      preferredDepthToM: {
                        type: ["number", "null"]
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
                      type: ["number", "null"]
                    },
                    toM: {
                      type: ["number", "null"]
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
                      type: ["number", "null"]
                    },
                    toM: {
                      type: ["number", "null"]
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
You are performing STAGE B of a professional preliminary groundwater interpretation.

A separate isolated Sol analysis has already examined the RAW measurement profiles.

Its result is supplied as:
lockedInstrumentAnalysis

CRITICAL RULE:

The instrument-only findings are LOCKED.

You MUST NOT retroactively alter:
- which point was strongest from raw measurements;
- the instrument-only ranking;
- the measured depth behaviour;
- the instrument-only candidate horizons.

You do NOT receive the raw measurement arrays in this stage.

Your job is to integrate the locked instrument result with:
- field information about profile geometry or physically identical points;
- dowsing notes;
- groundwater-body information;
- geology/hydrogeology;
- nearby wells;
- monitoring;
- faults;
- mineral-water context;
- quantitative and chemical status.

RULES:

1. First state faithfully which point Stage A identified as the strongest instrument-only point.

2. Then evaluate profile geometry supplied in the field notes.

If the notes explicitly state that a point in one profile is the SAME PHYSICAL LOCATION as a point in another profile, you may treat that as genuine cross-profile confirmation.

Do not infer physical intersections merely from identical point numbers.

3. Determine the best genuinely cross-profile-confirmed point, when such information exists.

4. Cross-profile confirmation is valuable, but it does NOT automatically override a substantially stronger local instrument anomaly.

Evaluate the trade-off explicitly.

5. Choose ONE final drilling point.

It may be:
- the strongest instrument-only point;
- the best independently cross-profile-confirmed point;
- or another candidate only when the supplied evidence clearly justifies it.

6. If the final point differs from the locked strongest instrument point, explain precisely what additional evidence justifies the change.

Do not use vague statements such as "more reliable" without explaining:
- what was independently repeated;
- at what depths;
- how strong the repeated evidence is;
- and why that outweighs the stronger local anomaly.

7. Never change the locked instrument ranking merely because:
- dowsing selected a point;
- the operator called a point important;
- the point is described as common/crossing;
- a nearby well exists;
- a groundwater body exists.

8. Dowsing is supporting information only.
It never modifies the locked instrument-only ranking.

9. Map and registry information is contextual evidence.

Explicitly distinguish whether it:
- supports the GENERAL hydrogeological plausibility;
- supports a particular DEPTH interval;
- directly supports a SPECIFIC drilling point;
- is neutral;
- or weakens the interpretation.

A nearby well or groundwater body does NOT by itself confirm the selected point.

10. Consider alternative explanations for the measured anomaly:
- clay;
- mineralisation;
- lithological contact;
- wet sediments;
- fractured material;
- conductive layers;
- artefacts.

11. Analyse shallow, principal and deeper prospective intervals when supported by the locked instrument analysis.

12. Do not invent:
- yield;
- exact temperature;
- aquifer thickness;
- local water level;
- local water quality;
- drilling success probability;
- lithology not supplied by the official/context data.

13. WATER QUALITY:
Groundwater-body chemical status is regional information only.
It never proves that water from the future borehole is drinkable or locally of good quality.

14. Nearby wells:
Use depth, water level, yield and purpose only when those values are actually supplied.

15. Mineral wells:
Do not infer thermal/mineral water merely from proximity.

16. The final technical analysis must be detailed.
Do not compress technically meaningful reasoning.

17. Write all user-facing content in Bulgarian.

18. Return the result using the required structured output schema.
Do not add text outside the structured result.
        `.trim(),

        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text:
                  "Integrate this LOCKED instrument analysis with the independent field and map context:\n\n" +
                  JSON.stringify(
                    integrationPayload,
                    null,
                    2
                  ),
              },
            ],
          },
        ],
      });

    const raw =
      integrationResponse
        .output_text
        ?.trim();

    if (!raw) {
      throw new Error(
        "AI did not return the integrated analysis."
      );
    }

    let analysis;

    try {
      analysis =
        JSON.parse(raw);
    } catch {
      console.error(
        "Invalid integrated structured output:",
        raw
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "\u0410\u0418 \u043d\u0435 \u0443\u0441\u043f\u044f \u0434\u0430 \u0441\u044a\u0437\u0434\u0430\u0434\u0435 \u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0438\u0440\u0430\u043d \u0438\u043d\u0442\u0435\u0433\u0440\u0438\u0440\u0430\u043d \u0430\u043d\u0430\u043b\u0438\u0437.",
        },
        {
          status: 500,
        }
      );
    }

    /*
      Keep the isolated Stage A result available internally
      inside the returned analysis.

      This is useful for QA and makes it possible to verify
      that Stage B did not silently rewrite the measurement
      conclusion.
    */
    analysis.instrumentOnlyAnalysis =
      instrumentAnalysis;

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
