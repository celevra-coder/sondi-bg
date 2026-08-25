import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "../../../lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function makeShareCode() {
  return randomBytes(9)
    .toString("base64url");
}

export async function POST(
  request: Request
) {
  try {
    const supabase =
      await createClient();

    // AIDU sharing currently does not require a user account.

    const body =
      await request.json();

    const {
      locationLabel,
      latitude,
      longitude,
      groundwaterBodies,
      analysis,
      aiduFiles,
    } = body ?? {};

    if (!analysis) {
      return NextResponse.json(
        {
          success: false,
          error:
            "\u041b\u0438\u043f\u0441\u0432\u0430 \u0433\u043e\u0442\u043e\u0432 \u0430\u043d\u0430\u043b\u0438\u0437.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Array.isArray(aiduFiles) ||
      aiduFiles.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "\u041b\u0438\u043f\u0441\u0432\u0430\u0442 \u0434\u0430\u043d\u043d\u0438\u0442\u0435 \u0437\u0430 3D \u0432\u0438\u0437\u0443\u0430\u043b\u0438\u0437\u0430\u0446\u0438\u044f\u0442\u0430.",
        },
        {
          status: 400,
        }
      );
    }

    const shareCode =
      makeShareCode();

    const {
      error,
    } =
      await supabase
        .from(
          "aidu_shared_analyses"
        )
        .insert({
          share_code:
            shareCode,

          owner_id:
            null,

          location_label:
            locationLabel || null,

          latitude:
            Number.isFinite(
              Number(latitude)
            )
              ? Number(latitude)
              : null,

          longitude:
            Number.isFinite(
              Number(longitude)
            )
              ? Number(longitude)
              : null,

          groundwater_bodies:
            groundwaterBodies ??
            [],

          analysis,

          client_text:
            analysis?.clientText ??
            null,

          aidu_files:
            aiduFiles,

          is_public:
            true,
        });

    if (error) {
      console.error(
        "AIDU share insert error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "\u041d\u0435 \u043c\u043e\u0436\u0430 \u0434\u0430 \u0441\u0435 \u0437\u0430\u043f\u0438\u0448\u0435 \u0441\u043f\u043e\u0434\u0435\u043b\u0435\u043d\u0438\u044f\u0442 \u0430\u043d\u0430\u043b\u0438\u0437.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      code: shareCode,
      path:
        "/a/" + shareCode,
    });
  } catch (error) {
    console.error(
      "AIDU sharing error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "\u041d\u0435\u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043f\u043e\u0434\u0435\u043b\u044f\u043d\u0435 \u043d\u0430 \u0430\u043d\u0430\u043b\u0438\u0437\u0430.",
      },
      {
        status: 500,
      }
    );
  }
}
