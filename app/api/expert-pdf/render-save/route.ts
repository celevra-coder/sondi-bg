import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";

import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const maxDuration = 60;

function localChromePath() {
  if (process.platform !== "win32") {
    return null;
  }

  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ];

  return (
    candidates.find((candidate) =>
      existsSync(candidate)
    ) || null
  );
}

export async function POST(request: Request) {
  let browser: Awaited<
    ReturnType<typeof puppeteer.launch>
  > | null = null;

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

    const body = await request.json();

    const analysisId =
      String(body?.analysis_id || "").trim();

    const kind =
      body?.kind === "driller"
        ? "driller"
        : "expert";

    const html =
      String(body?.html || "");

    if (
      !analysisId ||
      !html ||
      html.length < 100
    ) {
      return NextResponse.json(
        { error: "invalid_request" },
        { status: 400 }
      );
    }

    if (html.length > 6_000_000) {
      return NextResponse.json(
        { error: "html_too_large" },
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
      .select("id, user_id")
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

    const localExecutable =
      localChromePath();

    const executablePath =
      localExecutable ||
      (await chromium.executablePath());

    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath,
      headless: true,
    });

    const page =
      await browser.newPage();

    await page.setViewport({
      width: 1280,
      height: 1600,
      deviceScaleFactor: 1,
    });

    await page.emulateMediaType("print");

    await page.setContent(
      html,
      {
        waitUntil: "load",
        timeout: 30000,
      }
    );

    await page.evaluate(async () => {
      if (
        "fonts" in document &&
        document.fonts?.ready
      ) {
        await document.fonts.ready;
      }
    });

    const pdf =
      await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
        displayHeaderFooter: false,
      });

    if (pdf.byteLength < 1000) {
      throw new Error(
        "Generated PDF is unexpectedly small."
      );
    }

    const storagePath =
      `${analysis.user_id}/${analysis.id}/${kind}.pdf`;

    const admin =
      createAdminClient();

    const {
      error: uploadError,
    } = await admin.storage
      .from("expert-pdfs")
      .upload(
        storagePath,
        pdf,
        {
          contentType: "application/pdf",
          upsert: true,
        }
      );

    if (uploadError) {
      throw uploadError;
    }

    const now =
      new Date().toISOString();

    const updateData =
      kind === "driller"
        ? {
            driller_pdf_storage_path:
              storagePath,
            driller_pdf_generated_at:
              now,
          }
        : {
            pdf_storage_path:
              storagePath,
            pdf_generated_at:
              now,
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
      kind,
      storage_path: storagePath,
      size: pdf.byteLength,
    });
  } catch (error) {
    console.error(
      "Chromium PDF render/save error",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to render and save PDF.",
      },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}