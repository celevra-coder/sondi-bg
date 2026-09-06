import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "authentication_required" },
        { status: 401 }
      );
    }

    const { data: adminRow, error: adminError } =
      await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (adminError) {
      throw adminError;
    }

    if (adminRow) {
      return NextResponse.json({
        admin: true,
        unlimited: true,
        free_analyses_remaining: 0,
        paid_balance_cents: 0,
        analysis_price_cents: 0,
        remaining_paid_analyses: 0,
        can_top_up: false,
        analyses: [],
      });
    }

    const [
      walletResult,
      lotsResult,
      analysesResult,
    ] = await Promise.all([
      supabase
        .from("expert_wallets")
        .select("free_analyses_remaining")
        .eq("user_id", user.id)
        .maybeSingle(),

      supabase
        .from("expert_balance_lots")
        .select(
          "id, remaining_cents, analysis_price_cents, created_at"
        )
        .eq("user_id", user.id)
        .gt("remaining_cents", 0)
        .order("created_at", {
          ascending: true,
        }),

      supabase
        .from("expert_analyses")
        .select(
          "id, analysis_key, latitude, longitude, primary_gwb, groundwater_bodies, query_params, payment_type, charged_cents, analysis_version, location_label, pdf_storage_path, pdf_generated_at, driller_pdf_storage_path, driller_pdf_generated_at, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        }),
    ]);

    if (walletResult.error) {
      throw walletResult.error;
    }

    if (lotsResult.error) {
      throw lotsResult.error;
    }

    if (analysesResult.error) {
      throw analysesResult.error;
    }

    const lots = lotsResult.data || [];

    const paidBalanceCents =
      lots.reduce(
        (sum, lot) =>
          sum +
          Number(lot.remaining_cents || 0),
        0
      );

    const analysisPriceCents =
      lots.length > 0
        ? Number(
            lots[0].analysis_price_cents || 0
          )
        : 0;

    const remainingPaidAnalyses =
      analysisPriceCents > 0
        ? Math.floor(
            paidBalanceCents /
              analysisPriceCents
          )
        : 0;

    return NextResponse.json({
      admin: false,
      unlimited: false,
      free_analyses_remaining:
        walletResult.data
          ?.free_analyses_remaining ?? 2,
      paid_balance_cents:
        paidBalanceCents,
      analysis_price_cents:
        analysisPriceCents,
      remaining_paid_analyses:
        remainingPaidAnalyses,
      can_top_up:
        paidBalanceCents === 0,
      analyses:
        analysesResult.data || [],
    });
  } catch (error) {
    console.error(
      "EXPERT account error",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load SONDI EXPERT account data.",
      },
      { status: 500 }
    );
  }
}