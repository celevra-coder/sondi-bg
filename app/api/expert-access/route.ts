import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

const CURRENT_EXPERT_VERSION = 1;

function buildAnalysisKey(
  lat: number,
  lng: number
) {
  return `${lat.toFixed(6)},${lng.toFixed(6)}`;
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        authenticated: false,
      });
    }

    const url = new URL(request.url);
    const lat = Number(
      url.searchParams.get("lat")
    );
    const lng = Number(
      url.searchParams.get("lng")
    );

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      return NextResponse.json(
        {
          error: "invalid_coordinates",
        },
        { status: 400 }
      );
    }

    const { data: adminRow } =
      await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (adminRow) {
      return NextResponse.json({
        authenticated: true,
        admin: true,
        unlimited: true,
        current_version:
          CURRENT_EXPERT_VERSION,
      });
    }

    const analysisKey =
      buildAnalysisKey(lat, lng);

    const [
      walletResult,
      lotsResult,
      previousResult,
    ] = await Promise.all([
      supabase
        .from("expert_wallets")
        .select(
          "free_analyses_remaining"
        )
        .eq("user_id", user.id)
        .maybeSingle(),

      supabase
        .from("expert_balance_lots")
        .select(
          "remaining_cents, analysis_price_cents, created_at"
        )
        .eq("user_id", user.id)
        .gt("remaining_cents", 0)
        .order("created_at", {
          ascending: true,
        }),

      supabase
        .from("expert_analyses")
        .select(
          "id, created_at, analysis_version, charged_cents, payment_type"
        )
        .eq("user_id", user.id)
        .eq(
          "analysis_key",
          analysisKey
        )
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle(),
    ]);

    if (walletResult.error) {
      throw walletResult.error;
    }

    if (lotsResult.error) {
      throw lotsResult.error;
    }

    if (previousResult.error) {
      throw previousResult.error;
    }

    const freeRemaining =
      walletResult.data
        ?.free_analyses_remaining ?? 2;

    const lots =
      lotsResult.data || [];

    const paidBalanceCents =
      lots.reduce(
        (sum, lot) =>
          sum +
          Number(
            lot.remaining_cents || 0
          ),
        0
      );

    const activePriceCents =
      lots.length > 0
        ? Number(
            lots[0]
              .analysis_price_cents || 0
          )
        : 0;

    const previous =
      previousResult.data || null;

    const hasUpdate =
      previous !== null &&
      Number(
        previous.analysis_version || 1
      ) < CURRENT_EXPERT_VERSION;

    return NextResponse.json({
      authenticated: true,
      admin: false,
      unlimited: false,
      current_version:
        CURRENT_EXPERT_VERSION,
      analysis_key:
        analysisKey,
      free_analyses_remaining:
        freeRemaining,
      paid_balance_cents:
        paidBalanceCents,
      analysis_price_cents:
        activePriceCents,
      can_top_up:
        paidBalanceCents === 0,
      previous_analysis: previous
        ? {
            id: previous.id,
            created_at:
              previous.created_at,
            analysis_version:
              previous.analysis_version,
            charged_cents:
              previous.charged_cents,
            payment_type:
              previous.payment_type,
            update_available:
              hasUpdate,
          }
        : null,
    });
  } catch (error) {
    console.error(
      "EXPERT access status error",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load EXPERT access status.",
      },
      { status: 500 }
    );
  }
}