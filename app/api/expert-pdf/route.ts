import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
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

    const url = new URL(request.url);
    const analysisId =
      url.searchParams.get("analysis_id")?.trim() || "";

    const kind =
      url.searchParams.get("kind") === "driller"
        ? "driller"
        : "expert";

    if (!analysisId) {
      return NextResponse.json(
        { error: "missing_analysis_id" },
        { status: 400 }
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

    let query = supabase
      .from("expert_analyses")
      .select(
        "id, user_id, pdf_storage_path, driller_pdf_storage_path, location_label, created_at"
      )
      .eq("id", analysisId);

    if (!adminRow) {
      query = query.eq(
        "user_id",
        user.id
      );
    }

    const {
      data: analysis,
      error: analysisError,
    } = await query.maybeSingle();

    if (analysisError) {
      throw analysisError;
    }

    if (!analysis) {
      return NextResponse.json(
        { error: "analysis_not_found" },
        { status: 404 }
      );
    }
    const storagePath =
      kind === "driller"
        ? analysis.driller_pdf_storage_path
        : analysis.pdf_storage_path;

    if (!storagePath) {
      return NextResponse.json(
        { error: "pdf_not_ready" },
        { status: 404 }
      );
    }
const admin =
      createAdminClient();

    const {
      data: signed,
      error: signedError,
    } = await admin.storage
      .from("expert-pdfs")
      .createSignedUrl(
        storagePath,
        300
      );

    if (signedError) {
      throw signedError;
    }

    if (!signed?.signedUrl) {
      throw new Error(
        "Signed PDF URL missing."
      );
    }

    return NextResponse.json({
      url: signed.signedUrl,
      expires_in: 300,
      location_label:
        analysis.location_label,
      created_at:
        analysis.created_at,
    });
  } catch (error) {
    console.error(
      "EXPERT PDF access error",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to open SONDI EXPERT PDF.",
      },
      { status: 500 }
    );
  }
}