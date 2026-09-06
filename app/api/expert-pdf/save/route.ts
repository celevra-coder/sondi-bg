import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
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

    const formData = await request.formData();

    const analysisId =
      String(
        formData.get("analysis_id") || ""
      ).trim();

    const kind =
      String(
        formData.get("kind") || ""
      ).trim();

    const file =
      formData.get("file");

    if (
      !analysisId ||
      !["expert", "driller"].includes(kind) ||
      !(file instanceof File)
    ) {
      return NextResponse.json(
        { error: "invalid_request" },
        { status: 400 }
      );
    }

    if (
      file.type !== "application/pdf"
    ) {
      return NextResponse.json(
        { error: "invalid_file_type" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "file_too_large" },
        { status: 413 }
      );
    }

    const { data: adminRow } =
      await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    let query = supabase
      .from("expert_analyses")
      .select(
        "id, user_id, latitude, longitude, location_label, created_at"
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

    const safeKind =
      kind === "driller"
        ? "driller"
        : "expert";

    const storagePath =
      `${analysis.user_id}/${analysis.id}/${safeKind}.pdf`;

    const bytes =
      new Uint8Array(
        await file.arrayBuffer()
      );

    const admin =
      createAdminClient();

    const {
      error: uploadError,
    } = await admin.storage
      .from("expert-pdfs")
      .upload(
        storagePath,
        bytes,
        {
          contentType:
            "application/pdf",
          upsert: true,
        }
      );

    if (uploadError) {
      throw uploadError;
    }

    const updateData =
      safeKind === "expert"
        ? {
            pdf_storage_path:
              storagePath,
            pdf_generated_at:
              new Date().toISOString(),
          }
        : {
            driller_pdf_storage_path:
              storagePath,
            driller_pdf_generated_at:
              new Date().toISOString(),
          };

    const {
      error: updateError,
    } = await admin
      .from("expert_analyses")
      .update(updateData)
      .eq("id", analysis.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      ok: true,
      kind: safeKind,
      storage_path:
        storagePath,
    });
  } catch (error) {
    console.error(
      "EXPERT PDF save error",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to save SONDI EXPERT PDF.",
      },
      { status: 500 }
    );
  }
}