import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code =
    requestUrl.searchParams.get("code");

  const nextParam =
    requestUrl.searchParams.get("next");

  const nextCookie =
    request.cookies.get(
      "sondi_auth_next"
    )?.value;

  const accountTypeCookie =
    request.cookies.get(
      "sondi_account_type"
    )?.value;

  const next =
    nextParam ||
    nextCookie ||
    "/explore";

  const safeNext =
    next.startsWith("/") &&
    !next.startsWith("//")
      ? next
      : "/explore";

  let response =
    NextResponse.redirect(
      new URL(
        safeNext,
        request.url
      )
    );

  response.cookies.set(
    "sondi_auth_next",
    "",
    {
      path: "/",
      maxAge: 0,
    }
  );

  response.cookies.set(
    "sondi_account_type",
    "",
    {
      path: "/",
      maxAge: 0,
    }
  );

  if (code) {
    const supabase =
      createServerClient(
        process.env
          .NEXT_PUBLIC_SUPABASE_URL!,
        process.env
          .NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(
                ({
                  name,
                  value,
                  options,
                }) => {
                  response.cookies.set(
                    name,
                    value,
                    options
                  );
                }
              );
            },
          },
        }
      );

    const { error } =
      await supabase.auth
        .exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const allowedAccountType =
          accountTypeCookie === "client" ||
          accountTypeCookie === "provider" ||
          accountTypeCookie === "both";

        if (allowedAccountType) {
          await supabase
            .from("user_profiles")
            .upsert(
              {
                user_id: user.id,
                account_type: accountTypeCookie,
              },
              {
                onConflict: "user_id",
              }
            );
        } else {
          const { data: existingProfile } =
            await supabase
              .from("user_profiles")
              .select("user_id")
              .eq("user_id", user.id)
              .maybeSingle();

          if (!existingProfile) {
            await supabase
              .from("user_profiles")
              .insert({
                user_id: user.id,
                account_type: "client",
              });
          }
        }
      }
    }
  }

  return response;
}
