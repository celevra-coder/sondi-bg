import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

function cleanText(value: unknown) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = cleanText(body.email);
    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    const companyName =
      cleanText(body.company_name);

    const phone =
      cleanText(body.phone);

    const services =
      Array.isArray(body.services)
        ? body.services
            .map((item: unknown) =>
              cleanText(item)
            )
            .filter(Boolean)
        : [];

    const workRegions =
      Array.isArray(body.work_regions)
        ? body.work_regions
            .map((item: unknown) =>
              cleanText(item)
            )
            .filter(Boolean)
        : [];

    const worksNationwide =
      body.works_nationwide === true;

    if (!email) {
      return NextResponse.json(
        {
          error:
            "\u0412\u044a\u0432\u0435\u0434\u0435\u0442\u0435 \u0438\u043c\u0435\u0439\u043b.",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          error:
            "\u041f\u0430\u0440\u043e\u043b\u0430\u0442\u0430 \u0442\u0440\u044f\u0431\u0432\u0430 \u0434\u0430 \u0435 \u043f\u043e\u043d\u0435 6 \u0441\u0438\u043c\u0432\u043e\u043b\u0430.",
        },
        { status: 400 }
      );
    }

    if (companyName.length < 2) {
      return NextResponse.json(
        {
          error:
            "\u0412\u044a\u0432\u0435\u0434\u0435\u0442\u0435 \u0438\u043c\u0435 \u0438\u043b\u0438 \u0444\u0438\u0440\u043c\u0430.",
        },
        { status: 400 }
      );
    }

    if (phone.length < 5) {
      return NextResponse.json(
        {
          error:
            "\u0412\u044a\u0432\u0435\u0434\u0435\u0442\u0435 \u0432\u0430\u043b\u0438\u0434\u0435\u043d \u0442\u0435\u043b\u0435\u0444\u043e\u043d.",
        },
        { status: 400 }
      );
    }

    if (services.length === 0) {
      return NextResponse.json(
        {
          error:
            "\u0418\u0437\u0431\u0435\u0440\u0435\u0442\u0435 \u043f\u043e\u043d\u0435 \u0435\u0434\u043d\u0430 \u0443\u0441\u043b\u0443\u0433\u0430.",
        },
        { status: 400 }
      );
    }

    if (
      !worksNationwide &&
      workRegions.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "\u0418\u0437\u0431\u0435\u0440\u0435\u0442\u0435 \u043f\u043e\u043d\u0435 \u0435\u0434\u043d\u0430 \u043e\u0431\u043b\u0430\u0441\u0442.",
        },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const {
      data: created,
      error: createError,
    } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          account_type: "provider",
        },
      });

    if (createError || !created.user) {
      const message =
        createError?.message || "";

      const duplicate =
        message.toLowerCase().includes(
          "already"
        ) ||
        message.toLowerCase().includes(
          "registered"
        ) ||
        message.toLowerCase().includes(
          "exists"
        );

      return NextResponse.json(
        {
          error: duplicate
            ? "\u0422\u043e\u0437\u0438 \u0438\u043c\u0435\u0439\u043b \u0432\u0435\u0447\u0435 \u0438\u043c\u0430 \u0430\u043a\u0430\u0443\u043d\u0442 \u0432 SONDI.BG. \u0412\u043b\u0435\u0437\u0442\u0435 \u0432 \u0430\u043a\u0430\u0443\u043d\u0442\u0430 \u0441\u0438 \u0438 \u0438\u0437\u043f\u0440\u0430\u0442\u0435\u0442\u0435 \u043f\u0440\u043e\u0444\u0438\u043b\u0430."
            : message ||
              "\u041d\u0435 \u0443\u0441\u043f\u044f\u0445\u043c\u0435 \u0434\u0430 \u0441\u044a\u0437\u0434\u0430\u0434\u0435\u043c \u0430\u043a\u0430\u0443\u043d\u0442\u0430.",
        },
        {
          status: duplicate
            ? 409
            : 400,
        }
      );
    }

    const userId =
      created.user.id;

    async function rollbackUser() {
      try {
        await admin.auth.admin.deleteUser(
          userId
        );
      } catch (error) {
        console.error(
          "provider registration rollback error",
          error
        );
      }
    }

    const { error: profileError } =
      await admin
        .from("user_profiles")
        .upsert(
          {
            user_id: userId,
            account_type: "provider",
          },
          {
            onConflict: "user_id",
          }
        );

    if (profileError) {
      await rollbackUser();

      console.error(
        "provider user profile creation error",
        profileError
      );

      return NextResponse.json(
        {
          error:
            "\u041d\u0435 \u0443\u0441\u043f\u044f\u0445\u043c\u0435 \u0434\u0430 \u0441\u044a\u0437\u0434\u0430\u0434\u0435\u043c \u043f\u0440\u043e\u0444\u0438\u043b\u0430 \u043d\u0430 \u0430\u043a\u0430\u0443\u043d\u0442\u0430.",
        },
        { status: 500 }
      );
    }

    const { error: providerError } =
      await admin
        .from("service_providers")
        .insert({
          owner_id: userId,
          company_name: companyName,
          phone,
          email,
          website_or_facebook:
            cleanText(
              body.website_or_facebook
            ) || null,
          services,
          work_regions:
            worksNationwide
              ? []
              : workRegions,
          works_nationwide:
            worksNationwide,
          max_depth:
            cleanText(body.max_depth) ||
            null,
          diameters:
            cleanText(body.diameters) ||
            null,
          drilling_method:
            cleanText(
              body.drilling_method
            ) || null,
          equipment:
            cleanText(body.equipment) ||
            null,
          presentation:
            cleanText(
              body.presentation
            ) || null,
          status: "pending",
        });

    if (providerError) {
      await rollbackUser();

      console.error(
        "provider application creation error",
        providerError
      );

      return NextResponse.json(
        {
          error:
            "\u041d\u0435 \u0443\u0441\u043f\u044f\u0445\u043c\u0435 \u0434\u0430 \u0438\u0437\u043f\u0440\u0430\u0442\u0438\u043c \u043f\u0440\u043e\u0444\u0438\u043b\u0430 \u0437\u0430 \u043e\u0434\u043e\u0431\u0440\u0435\u043d\u0438\u0435.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(
      "provider registration route error",
      error
    );

    return NextResponse.json(
      {
        error:
          "\u0412\u044a\u0437\u043d\u0438\u043a\u043d\u0430 \u0433\u0440\u0435\u0448\u043a\u0430 \u043f\u0440\u0438 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f\u0442\u0430.",
      },
      { status: 500 }
    );
  }
}