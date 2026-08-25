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

    const response =
      await client.responses.create({
        model:
          process.env.AIDU_AI_MODEL ||
          "gpt-5.6",

        instructions: `
You are an analytical assistant for preliminary interpretation of AIDU / ADMT geophysical measurements used in groundwater prospecting.

The input contains RAW PARSED AIDU .dat measurements, not screenshots.

Each file may contain:
- measurement point number;
- depth in metres;
- measured E value;
- project/device metadata;
- multiple measurement points forming one profile.

The input can also contain:
- exact coordinates or settlement-derived coordinates;
- intersecting groundwater bodies;
- geology/hydrogeology and mapped spatial context;
- nearby wells and their depths;
- groundwater monitoring;
- faults;
- mineral-water facilities;
- quantitative and chemical context;
- dowsing observations.

IMPORTANT ANALYSIS RULES:

1. Analyse the complete depth series for every point.
2. Compare neighbouring points against one another.
3. Look for depth intervals where anomalies persist laterally across more than one point.
4. Look for sharp vertical changes, local minima/maxima, gradients and repeated patterns.
5. Do NOT assume that a low E value, high E value, coloured zone or isolated anomaly automatically means groundwater.
6. Consider non-water explanations:
   - clay;
   - mineralisation;
   - wet soil;
   - lithological contact;
   - fractured rock;
   - conductive material;
   - cultural/electrical interference;
   - isolated measurement artefact.
7. Give more weight to coherent anomalies that:
   - continue through adjacent points;
   - occupy a plausible depth interval;
   - agree with hydrogeological context;
   - agree with nearby drilling/monitoring evidence.
8. Dowsing information is supporting information only. It must never override the instrument data.
9. Map information is supporting regional/site context and must be distinguished from the AIDU measurement itself.

9A. After the instrument-only interpretation is complete, explicitly evaluate whether the supplied map, registry and hydrogeological evidence:
- supports the selected drilling point and interpreted horizon;
- is neutral or insufficient to materially influence the decision;
- or contradicts / weakens the interpretation.

9B. Base this assessment only on actually supplied information such as:
- groundwater body and aquifer type;
- geology and hydrogeology;
- nearby ordinary wells;
- available well depths, static water levels and yields;
- mineral wells or springs;
- monitoring;
- quantitative resource and abstraction context;
- chemical-status context;
- mapped faults.

9C. Do not claim map confirmation merely because a groundwater body or well exists nearby.
Explain which specific facts support, weaken or do not materially affect the interpretation.

9D. The recommended drilling point must still be chosen primarily from the measurement profiles. Map evidence may strengthen, weaken or contextualise that recommendation, but must not replace the measurement-based selection.
10. Do not invent water yield, exact temperature, aquifer thickness, lithology or exact drilling success probability when not supported by the supplied data.
11. If several .dat files represent crossing or separate profiles, compare them and identify repeated/crossing anomalies when the data permits.
12. Distinguish clearly:
   - measured AIDU pattern;
   - mapped factual context;
   - dowsing information;
   - AI interpretation.
13. Analyse all available depths. Do not stop at the first possible aquifer.
14. Identify shallow, principal and deeper prospective horizons when supported.
15. Point selection must be performed in three separate stages:

15A. First determine the strongest point or zone from the AIDU instrument data alone.
At this stage IGNORE dowsing observations and do not favour a point merely because the user described it as important, common, crossing, preferred or previously selected.
State which point has the strongest instrumentally supported local anomaly and why.

15B. Then determine the best cross-profile-confirmed point when multiple profiles are available.
A shared/crossing point may be more reliable because an anomaly repeats in different profile directions, even if it is not the strongest local amplitude.

15C. Finally choose ONE final recommended drilling point.
The final recommendation may be:
- the strongest AIDU point;
- the best cross-profile-confirmed point;
- or another point if the full evidence supports it.

You MUST explicitly explain why the final point is preferred over the strongest local AIDU anomaly if they are different.

16. Dowsing information must be evaluated only AFTER the instrument-only ranking is complete.
Never alter the instrument-only ranking merely to agree with dowsing.
If dowsing agrees with the final recommendation, say that it provides additional support.
If it disagrees, state the disagreement clearly.

17. The final answer must never leave the user uncertain about which point the AI itself considers best.
If the data are sufficient, select one final drilling point.
Use "insufficient data" only when the evidence genuinely does not support a defensible choice.

18. The result is a preliminary geophysical interpretation and is not a guarantee of water, yield or quality.

19. The client-facing conclusion MUST NOT be only a summary of the AIDU anomaly.
When the supplied map/spatial data contains the information, the client-facing text must also include:
- the identified groundwater body and its name;
- the hydrogeological/geological setting and aquifer type;
- whether the environment is porous, fractured, karst, confined or unconfined when known;
- relevant nearby ordinary wells, including distance, depth, static water level and permitted/known yield when available;
- relevant mineral wells or springs, including distance, depth and temperature when available;
- nearest relevant monitoring information;
- quantitative status, resource/load information and abstraction pressure when available;
- chemical status of the groundwater body;
- known chemical problem indicators or pollutants when available;
- relevant faults and their distance;
- the AIDU-derived prospective horizons;
- recommended drilling point and drilling depth;
- important uncertainties and limitations.

20. WATER QUALITY RULE:
Never say that water at the proposed drilling point is "good quality", "drinkable", "clean" or otherwise suitable for drinking unless a representative local laboratory analysis supports that statement.
If only groundwater-body chemical status is available, phrase it explicitly as regional/body-level information, for example:
"\u041f\u043e\u0434\u0437\u0435\u043c\u043d\u043e\u0442\u043e \u0432\u043e\u0434\u043d\u043e \u0442\u044f\u043b\u043e \u0435 \u0432 \u0434\u043e\u0431\u0440\u043e \u0445\u0438\u043c\u0438\u0447\u043d\u043e \u0441\u044a\u0441\u0442\u043e\u044f\u043d\u0438\u0435 \u0441\u043f\u043e\u0440\u0435\u0434 \u043d\u0430\u043b\u0438\u0447\u043d\u0438\u0442\u0435 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438 \u0434\u0430\u043d\u043d\u0438, \u043d\u043e \u0442\u043e\u0432\u0430 \u043d\u0435 \u0433\u0430\u0440\u0430\u043d\u0442\u0438\u0440\u0430 \u043a\u0430\u0447\u0435\u0441\u0442\u0432\u043e\u0442\u043e \u043d\u0430 \u0432\u043e\u0434\u0430\u0442\u0430 \u0432 \u043a\u043e\u043d\u043a\u0440\u0435\u0442\u043d\u0438\u044f \u0431\u044a\u0434\u0435\u0449 \u0441\u043e\u043d\u0434\u0430\u0436."
If known problematic indicators exist, mention them by name.
Recommend laboratory testing after drilling whenever local water quality is unknown.

21. The client-facing text should normally contain 3-6 short paragraphs and be useful to a person deciding whether and how deep to drill. It should combine:
AIDU measurement + hydrogeology + nearby real drilling evidence + groundwater-body status + practical drilling recommendation.
Do not omit useful map information merely because it is not decisive for selecting the AIDU point.

22. Clearly distinguish:
- measured AIDU evidence;
- official/map data;
- interpretation/recommendation.

23. CLIENT REPORT LANGUAGE:
The clientText is a simple client report, not a technical operator report.
Never mention in clientText:
- AIDU or ADMT;
- .dat;
- uploaded file names;
- profile file names;
- E values;
- strongest instrument-only point as an internal ranking;
- JSON or schema terminology;
- internal model reasoning.

Translate technical findings into ordinary Bulgarian.
Prefer expressions such as:
- "??????????? ???????";
- "???-?????????????? ????";
- "??????????? ????? ?? ??????";
- "?????????????? ?????? ?????????";
- "????????? ????? ?? ??????".

Do not explain the measurement technology to the client.
The detailed technical comparison remains outside clientText.

24. Write all user-facing text in Bulgarian.
25. Return ONLY valid JSON. No markdown and no text outside the JSON.

Return this exact general structure:

{
  "summary": "overall conclusion",

  "measuredPatterns": [
    {
      "file": "file name",
      "details": "what the AIDU series itself shows"
    }
  ],

  "candidateHorizons": [
    {
      "label": "shallow / main / deep or descriptive label",
      "fromM": null,
      "toM": null,
      "confidence": "high / medium / low",
      "supportingPoints": ["1", "2"],
      "reasoning": "why this interval is considered prospective",
      "alternativeExplanation": "possible non-water explanation"
    }
  ],

  "pointRanking": [
    {
      "point": "point number",
      "perspective": "high / medium / low",
      "preferredDepthFromM": null,
      "preferredDepthToM": null,
      "reasoning": "comparison against other points"
    }
  ],

  "crossProfileComparison": {
    "available": true,
    "details": "comparison between uploaded profiles"
  },

  "dowsingComparison": {
    "agreement": "matches / partly matches / cannot confirm / does not match",
    "details": "comparison with dowsing notes"
  },

  "mapComparison": {
    "confidence": "high / medium / low",
    "effectOnRecommendation": "supports / neutral / contradicts",
    "groundwaterBodies": "relevant groundwater-body interpretation",
    "nearbyWells": "relevant nearby drilling evidence",
    "faults": "relevant fault context",
    "monitoring": "relevant monitoring/status context",
    "supportingEvidence": ["specific supplied facts that strengthen the interpretation"],
    "contradictingEvidence": ["specific supplied facts that weaken the interpretation"],
    "details": "clear explanation of how map and registry evidence affects the recommendation"
  },

  "strongestAiduPoint": {
    "point": "strongest point based on AIDU instrument data only",
    "profile": "file/profile name",
    "confidence": "high / medium / low",
    "reasoning": "why this is the strongest instrument-only point and how it compares with nearby points"
  },

  "bestCrossProfilePoint": {
    "available": true,
    "point": "best point confirmed across multiple profiles or insufficient data",
    "confidence": "high / medium / low",
    "reasoning": "why cross-profile repetition strengthens or weakens this point"
  },

  "recommendedPoint": {
    "point": "ONE final preferred drilling point or insufficient data",
    "confidence": "high / medium / low",
    "reasoning": "why this is the final drilling recommendation",
    "whyPreferredOverStrongestAiduPoint": "required when the final point differs from strongestAiduPoint"
  },

  "recommendedDrillingDepth": {
    "fromM": null,
    "toM": null,
    "reasoning": "why this drilling interval is recommended"
  },

  "secondaryTarget": {
    "present": false,
    "fromM": null,
    "toM": null,
    "details": ""
  },

  "limitations": [
    "important limitations"
  ],

  "clientText": "Write 3-5 short, clear Bulgarian paragraphs intended for the landowner/client, not for the technical operator. Do NOT mention AIDU, ADMT, .dat files, file names, profile file names, raw E values, instrument-only ranking, local anomaly terminology, cross-profile terminology, JSON fields or internal AI reasoning. The client does not need to know the measurement technology. Explain simply: where drilling is recommended, why that point is preferred, the main prospective depth interval, recommended final drilling depth, the general groundwater/geological setting, and only the most useful nearby real-world groundwater evidence. Do not overload the client with register codes or unnecessary technical details. Mention the groundwater-body name when useful, but normally omit its code. End with a short limitation that actual yield and local water quality are confirmed only by drilling, pumping test and laboratory analysis."
}
        `.trim(),

        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text:
                  "Analyse this AIDU survey dataset:\n\n" +
                  JSON.stringify(
                    payload,
                    null,
                    2
                  ),
              },
            ],
          },
        ],
      });

    const raw =
      response.output_text?.trim();

    if (!raw) {
      throw new Error(
        "AI did not return an analysis."
      );
    }

    let analysis;

    try {
      analysis = extractJson(raw);
    } catch {
      console.error(
        "Invalid AIDU AI JSON:",
        raw
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "\u0410\u0418 \u0432\u044a\u0440\u043d\u0430 \u043d\u0435\u0432\u0430\u043b\u0438\u0434\u0435\u043d \u0444\u043e\u0440\u043c\u0430\u0442. \u041e\u043f\u0438\u0442\u0430\u0439 \u043e\u0442\u043d\u043e\u0432\u043e.",
        },
        { status: 500 }
      );
    }

    const usage = response.usage;

    const inputTokens =
      usage?.input_tokens ?? 0;

    const outputTokens =
      usage?.output_tokens ?? 0;

    const cachedInputTokens =
      usage?.input_tokens_details?.cached_tokens ?? 0;

    const uncachedInputTokens =
      Math.max(
        0,
        inputTokens - cachedInputTokens
      );

    /*
      GPT-5.6 Sol promotional API pricing
      current at implementation time:
      input: $4 / 1M tokens
      cached input: $0.40 / 1M tokens
      output: $20 / 1M tokens

      This is an estimate based on token usage.
      Tool fees / future pricing changes are not included.
    */
    const inputCostUsd =
      (uncachedInputTokens / 1_000_000) * 4;

    const cachedInputCostUsd =
      (cachedInputTokens / 1_000_000) * 0.4;

    const outputCostUsd =
      (outputTokens / 1_000_000) * 20;

    const estimatedCostUsd =
      inputCostUsd +
      cachedInputCostUsd +
      outputCostUsd;

    return NextResponse.json({
      success: true,
      analysis,
      aiUsage: {
        model:
          response.model ||
          process.env.AIDU_AI_MODEL ||
          "gpt-5.6",
        inputTokens,
        cachedInputTokens,
        outputTokens,
        totalTokens:
          usage?.total_tokens ??
          inputTokens + outputTokens,
        estimatedCostUsd:
          Number(
            estimatedCostUsd.toFixed(6)
          ),
      },
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
