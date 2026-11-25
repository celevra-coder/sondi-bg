import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function result(eligible: boolean) {
  return NextResponse.json(
    { eligible },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    }
  );
}

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      if (
        !user &&
        authError.name === "AuthSessionMissingError"
      ) {
        return result(true);
      }

      return result(false);
    }

    if (!user) {
      return result(true);
    }

    const now = new Date().toISOString();

    const [admin, timeAccess, balance] = await Promise.all([
      supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle(),

      supabase
        .from("expert_time_access")
        .select("expires_at")
        .eq("user_id", user.id)
        .lte("starts_at", now)
        .gt("expires_at", now)
        .limit(1)
        .maybeSingle(),

      supabase
        .from("expert_balance_lots")
        .select("remaining_cents")
        .eq("user_id", user.id)
        .gt("remaining_cents", 0)
        .limit(1)
        .maybeSingle(),
    ]);

    if (admin.error || timeAccess.error || balance.error) {
      return result(false);
    }

    const protectedUser = Boolean(
      admin.data || timeAccess.data || balance.data
    );

    return result(!protectedUser);
  } catch {
    return result(false);
  }
}