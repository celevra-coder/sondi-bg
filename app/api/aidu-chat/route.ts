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
          format: {
            type: "json_schema",
            name: "aidu_followup_chat",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: [
                "answer",
                "revisionRequested",
                "revisionInstruction"
              ],
              properties: {
                answer: {
                  type: "string"
                },
                revisionRequested: {
                  type: "boolean"
                },
                revisionInstruction: {
                  type: "string"
                }
              }
            }
          }
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

2. The completed technical analysis is the CURRENT working conclusion.
You may explain it, challenge it and discuss alternatives.

3. Distinguish carefully between:

A) HYPOTHETICAL DISCUSSION

Examples:
- "? ??? ?????????? ????? 4?"
- "?? ? ?? ??-????? ????? 6?"
- "????? ?? ????? ??? ????????? ?? 90 ??"
- "???? ?? ???? ?? ? ????? ?????"

For hypothetical discussion:
- revisionRequested = false.
- Answer the question normally.
- Do NOT change the analysis.

B) FINALIZED CHANGE / NEW OPERATOR CONCLUSION

Examples include wording equivalent to:
- "?????, ???? ???? ????? 4."
- "???????? ?? ????? 4."
- "?????? ????? 4."
- "?????? ????? 4 ? ?????????."
- "??????? ???????????? ?????? ????."
- "??????? ???????."
- "?????? ???????."
- "????????? ???????."
- "????????? ???????????? ????."
- "??????? ???????????."
- "?????? ?????? ?????? ????."
- "?????? ???? ? ???????."
- "??????? ??????????."
- "??????? ??????????? ?? 80 ?."
- "???? ???????? ?????? ???? 90 ?."
- "???? ????????, ?? ???? ? ???? ???? ????."
- "???? ????????? ????????? ?? ????? ??????????."
- or any semantically equivalent wording clearly showing that the operator has reached a NEW FINAL WORKING CONCLUSION.

For a finalized change:
- revisionRequested = true.
- revisionInstruction must contain a concise, self-contained Bulgarian description of the NEW conclusion that the technical Sol analysis must use.
- Include all necessary context from the recent conversation.
- Do NOT include speculative alternatives that the operator rejected.
- The instruction should be usable independently without rereading the whole conversation.

Example revisionInstruction:
"?????? ????? 4 ???? ??????? ??????? ?????. ?????????? ??????, ?? ?? ? ??-????? ?? ??????????? ?? ????? 3 ? 5. ?????????? ?????? ???? ????? 3-4-5 ?????? ???? ????????? ? ???????????? ???????? ?????????."

4. A command such as:
"??????? ???????????? ?????? ????"
must use the PREVIOUS CONVERSATION to determine what conclusion has just been agreed.

Do not require the operator to repeat the conclusion.

5. If the operator clearly accepts a new conclusion with phrases such as:
"??, ????",
"????? ????",
"?????, ???? ??????",
"???? ? ????",
"???????? ????",
after discussing a concrete change, treat this as a finalized revision when the conversation makes the accepted change unambiguous.

6. If it is genuinely unclear whether the operator is merely considering an alternative or actually changing the analysis:
- revisionRequested = false;
- ask briefly for confirmation.

7. When revisionRequested = false:
revisionInstruction MUST be an empty string.

8. When revisionRequested = true:
do not pretend the ordinary chat itself has technically recalculated the survey.
Explain naturally that the analysis will be updated according to the newly reached conclusion.

9. Dowsing, field geometry, denivelation, common/crossing points and operator interpretation are valid field context.
Do not invent information that was not supplied.

10. Do not invent:
- yield;
- water quality;
- temperature;
- lithology;
- exact probability;
- well depth or water level not present in the data.

11. When discussing water quality, distinguish regional groundwater-body chemical status from the actual future well.

12. Keep ordinary chat answers practical and concise unless the operator asks for detail.

13. Write entirely in Bulgarian.

14. Return ONLY the required structured output.
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

    const raw =
      response.output_text?.trim();

    if (!raw) {
      throw new Error(
        "AI did not return an answer."
      );
    }

    let chatResult: {
      answer: string;
      revisionRequested: boolean;
      revisionInstruction: string;
    };

    try {
      chatResult =
        JSON.parse(raw);
    } catch {
      console.error(
        "Invalid AIDU chat structured output:",
        raw
      );

      throw new Error(
        "AI returned an invalid chat response."
      );
    }

    return NextResponse.json({
      success: true,
      answer:
        chatResult.answer,
      revisionRequested:
        chatResult.revisionRequested,
      revisionInstruction:
        chatResult.revisionRequested
          ? chatResult.revisionInstruction
          : "",
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
