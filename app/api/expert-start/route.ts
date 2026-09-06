import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const CURRENT_EXPERT_VERSION = 1;

function buildAnalysisKey(
  lat: number,
  lng: number
) {
  return `${lat.toFixed(6)},${lng.toFixed(6)}`;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "authentication_required",
        },
        { status: 401 }
      );
    }

    let body: {
      lat?: unknown;
      lng?: unknown;
      gwb?: unknown;
      gwbs?: unknown;
      queryParams?: unknown;
    } = {};

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "invalid_request",
        },
        { status: 400 }
      );
    }

    const lat = Number(body.lat);
    const lng = Number(body.lng);

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

    const primaryGwb =
      typeof body.gwb === "string"
        ? body.gwb.trim()
        : "";

    const groundwaterBodies =
      Array.isArray(body.gwbs)
        ? body.gwbs
            .filter(
              (value): value is string =>
                typeof value === "string"
            )
            .map((value) => value.trim())
            .filter(Boolean)
        : [];

    if (
      primaryGwb &&
      !groundwaterBodies.includes(
        primaryGwb
      )
    ) {
      groundwaterBodies.unshift(
        primaryGwb
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
        ok: true,
        admin: true,
        unlimited: true,
        access_type: "admin",
        charged_cents: 0,
        current_version:
          CURRENT_EXPERT_VERSION,
      });
    }

    const analysisKey =
      buildAnalysisKey(lat, lng);

    const queryParams =
      body.queryParams &&
      typeof body.queryParams ===
        "object" &&
      !Array.isArray(body.queryParams)
        ? body.queryParams
        : {};

    const locationLabel =
      typeof (
        queryParams as Record<
          string,
          unknown
        >
      ).location_label === "string"
        ? String(
            (
              queryParams as Record<
                string,
                unknown
              >
            ).location_label
          ).trim()
        : "";

    const admin =
      createAdminClient();

    const { data, error } =
      await admin.rpc(
        "create_sondi_expert_analysis",
        {
          p_user_id: user.id,
          p_analysis_key:
            analysisKey,
          p_latitude: lat,
          p_longitude: lng,
          p_primary_gwb:
            primaryGwb || null,
          p_groundwater_bodies:
            groundwaterBodies,
          p_query_params:
            queryParams,
          p_analysis_version:
            CURRENT_EXPERT_VERSION,
        }
      );

    if (error) {
      const message =
        String(error.message || "");

      if (
        message.includes(
          "NO_EXPERT_ACCESS"
        )
      ) {
        return NextResponse.json(
          {
            error: "no_expert_access",
          },
          { status: 402 }
        );
      }

      if (
        message.includes(
          "INSUFFICIENT_EXPERT_BALANCE"
        )
      ) {
        return NextResponse.json(
          {
            error:
              "insufficient_expert_balance",
          },
          { status: 402 }
        );
      }

      throw error;
    }

    const result =
      Array.isArray(data) &&
      data.length > 0
        ? data[0]
        : null;

    if (!result) {
      throw new Error(
        "EXPERT analysis result missing."
      );
    }

    if (locationLabel) {
      const {
        error: locationLabelError,
      } = await admin
        .from("expert_analyses")
        .update({
          location_label:
            locationLabel.slice(0, 500),
        })
        .eq(
          "id",
          result.analysis_id
        )
        .eq(
          "user_id",
          user.id
        );

      if (locationLabelError) {
        console.error(
          "EXPERT location label save error",
          locationLabelError
        );
      }
    }
    return NextResponse.json({
      ok: true,
      admin: false,
      unlimited: false,
      current_version:
        CURRENT_EXPERT_VERSION,
      analysis_id:
        result.analysis_id,
      access_type:
        result.access_type,
      charged_cents:
        Number(
          result.charged_cents || 0
        ),
      free_analyses_remaining:
        Number(
          result
            .free_analyses_remaining ||
            0
        ),
      paid_balance_remaining_cents:
        Number(
          result
            .paid_balance_remaining_cents ||
            0
        ),
      analysis_price_cents:
        Number(
          result
            .analysis_price_cents ||
            0
        ),
    });
  } catch (error) {
    console.error(
      "EXPERT start error",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to start SONDI EXPERT analysis.",
      },
      { status: 500 }
    );
  }
}