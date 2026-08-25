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
          process.env.AIDU_AI_MODEL ||
          "gpt-5.6",

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

2. Use the completed analysis as the starting point, but you may critically reassess it when the user asks why one point or depth was preferred.

3. When comparing points, distinguish:
- strongest AIDU instrument-only point;
- best cross-profile-confirmed point;
- final recommended drilling point.

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

8. If the evidence supports changing the recommendation, say so explicitly and explain why.

9. Keep answers practical and concise unless the user asks for a detailed explanation.

10. Write entirely in Bulgarian.

11. Do not output JSON, field names, code, markdown tables or technical schema. Write normal readable Bulgarian prose suitable for an experienced field operator.
        `.trim(),

        input:
          `???????? ?? ??:\n${JSON.stringify(
            caseContext
          )}\n\n` +
          (
            conversationText
              ? `???????? ????:\n${conversationText}\n\n`
              : ""
          ) +
          `??? ?????? ?? ???????:\n${question.trim()}`,
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
      aiUsage:
        calculateUsageCost(
          response
        ),
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
