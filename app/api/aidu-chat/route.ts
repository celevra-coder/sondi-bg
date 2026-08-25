import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function calculateUsageCost(response: any) {
  const usage = response?.usage;

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
    GPT-5.6 Sol promotional pricing:
    input: $4 / 1M
    cached input: $0.40 / 1M
    output: $20 / 1M
  */

  const estimatedCostUsd =
    (
      uncachedInputTokens /
      1_000_000
    ) *
      4 +
    (
      cachedInputTokens /
      1_000_000
    ) *
      0.4 +
    (
      outputTokens /
      1_000_000
    ) *
      20;

  return {
    model:
      response?.model ||
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
  };
}

export async function POST(
  request: Request
) {
  try {
    if (
      !process.env.OPENAI_API_KEY
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "OPENAI_API_KEY ?? ? ????????????.",
        },
        {
          status: 500,
        }
      );
    }

    const body =
      await request.json();

    const {
      question,
      history,
      analysis,
      latitude,
      longitude,
      locationLabel,
      groundwaterBodies,
      spatialContext,
      dowsingNotes,
      aiduFiles,
    } = body ?? {};

    if (
      typeof question !== "string" ||
      !question.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "?????? ?????? ??? AI.",
        },
        {
          status: 400,
        }
      );
    }

    if (!analysis) {
      return NextResponse.json(
        {
          success: false,
          error:
            "?????? ????? AIDU ??????.",
        },
        {
          status: 400,
        }
      );
    }

    const safeHistory: ChatMessage[] =
      Array.isArray(history)
        ? history
            .filter(
              (item: any) =>
                (
                  item?.role ===
                    "user" ||
                  item?.role ===
                    "assistant"
                ) &&
                typeof item?.content ===
                  "string"
            )
            .slice(-12)
        : [];

    const caseContext = {
      location: {
        label:
          locationLabel || "",
        latitude,
        longitude,
      },

      groundwaterBodies:
        groundwaterBodies ?? [],

      spatialContext:
        spatialContext ?? null,

      dowsingNotes:
        dowsingNotes || "",

      aiduFiles:
        aiduFiles ?? [],

      completedAnalysis:
        analysis,
    };

    const client = new OpenAI({
      apiKey:
        process.env.OPENAI_API_KEY,
    });

    const conversationText =
      safeHistory
        .map(message => {
          const label =
            message.role === "user"
              ? "??"
              : "AI";

          return (
            label +
            ": " +
            message.content
          );
        })
        .join("\n\n");

    const response =
      await client.responses.create({
        model:
          process.env.AIDU_CHAT_MODEL ||
          "gpt-5.6-luna",

        reasoning: {
          effort: "low",
        },

        text: {
          verbosity: "medium",
        },

        max_output_tokens: 2500,

        instructions: `
You are the follow-up analytical assistant for a completed AIDU groundwater-prospecting case in SONDI.BG.

You have access to:
- the already completed AI interpretation;
- the parsed AIDU .dat measurements;
- groundwater-body information;
- geology/hydrogeology and spatial context;
- nearby wells and monitoring;
- faults and mineral-water context;
- dowsing notes;
- the previous conversation.

IMPORTANT RULES:

1. Answer the user's specific question about THIS case, not groundwater prospecting in general.

2. The completed technical analysis is authoritative for the current case.
You may explain, compare and critically discuss why a point or depth was preferred, but do not silently replace the final technical recommendation.

2A. If the completed technical analysis explicitly names a backup / secondary drilling point, preserve that backup point.
Do NOT invent a different backup point from your own interpretation.
If the user asks for an alternative, use the Sol-defined backup point first when one exists.

2B. If the user explicitly requests a fresh technical re-interpretation that could change the final point or drilling depth, explain that this requires running a new full technical analysis.
Do not pretend that ordinary follow-up chat is equivalent to a fresh Sol analysis.

3. When comparing points, distinguish:
- strongest instrument-only point;
- best cross-profile-confirmed point;
- final recommended drilling point;
- explicitly stated backup point, when the technical analysis contains one.

4. Dowsing is supporting information only and never overrides instrument data.

5. Do not invent:
- yield;
- water quality;
- temperature;
- lithology;
- exact probability;
- well depth or water level that is not present in the supplied data.

6. When discussing water quality, distinguish groundwater-body/regional chemical status from the actual future well. A future well requires laboratory testing.

7. If the user challenges the original recommendation, answer directly. It is allowed to say that another point is stronger instrumentally while the final recommendation remains different because of cross-profile confirmation.

8. Do not change the final recommendation or invent a new backup point during ordinary chat.
If the user presents genuinely new measurement data or explicitly requests a fresh technical re-analysis, state that a new full technical analysis should be run.

9. Keep answers practical and concise unless the user asks for a detailed explanation.

10. Write entirely in Bulgarian.

11. Do not output JSON, field names, code, markdown tables or technical schema. Write normal readable Bulgarian prose suitable for an experienced field operator.
        `.trim(),

        input:
          "\u041a\u043e\u043d\u0442\u0435\u043a\u0441\u0442 \u043d\u0430 \u043e\u0431\u0435\u043a\u0442\u0430:\n" +
          JSON.stringify(
            caseContext
          ) +
          "\n\n" +
          (
            conversationText
              ? "\u041f\u0440\u0435\u0434\u0438\u0448\u0435\u043d \u0440\u0430\u0437\u0433\u043e\u0432\u043e\u0440:\n" +
                conversationText +
                "\n\n"
              : ""
          ) +
          "\u041d\u043e\u0432 \u0432\u044a\u043f\u0440\u043e\u0441 \u043e\u0442 \u043e\u043f\u0435\u0440\u0430\u0442\u043e\u0440\u0430:\n" +
          question.trim(),
      });

    const answer =
      response.output_text?.trim();

    if (!answer) {
      throw new Error(
        "AI ?? ????? ???????."
      );
    }

    return NextResponse.json({
      success: true,
      answer,
    });
  } catch (error) {
    console.error(
      "AIDU chat error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "????????? AI ????????.",
      },
      {
        status: 500,
      }
    );
  }
}
