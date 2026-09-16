import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

function cleanText(value: unknown) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

export async function POST(request: Request) {
  let createdUserId = "";

  try {
    const body = await request.json();

    const email = cleanText(body.contact_email);
    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    const service = cleanText(body.service);
    const region = cleanText(body.region);
    const locality =
      cleanText(body.locality) || null;
    const desiredPeriod =
      cleanText(body.desired_period) || null;
    const estimatedDepth =
      cleanText(body.estimated_depth) || null;
    const machineAccess =
      cleanText(body.machine_access) || "unknown";
    const description =
      cleanText(body.description);
    const phone =
      cleanText(body.contact_phone) || null;

    if (!email) {
      return NextResponse.json(
        {
          error:
            "\u0412\u044a\u0432\u0435\u0434\u0435\u0442\u0435 \u0438\u043c\u0435\u0439\u043b, \u0437\u0430 \u0434\u0430 \u0441\u0435 \u0441\u044a\u0437\u0434\u0430\u0434\u0435 \u0430\u043a\u0430\u0443\u043d\u0442.",
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

    if (!service) {
      return NextResponse.json(
        {
          error:
            "\u0418\u0437\u0431\u0435\u0440\u0435\u0442\u0435 \u0443\u0441\u043b\u0443\u0433\u0430.",
        },
        { status: 400 }
      );
    }

    if (!region) {
      return NextResponse.json(
        {
          error:
            "\u0418\u0437\u0431\u0435\u0440\u0435\u0442\u0435 \u043e\u0431\u043b\u0430\u0441\u0442.",
        },
        { status: 400 }
      );
    }

    if (description.length < 10) {
      return NextResponse.json(
        {
          error:
            "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435\u0442\u043e \u0442\u0440\u044f\u0431\u0432\u0430 \u0434\u0430 \u0435 \u043f\u043e\u043d\u0435 10 \u0441\u0438\u043c\u0432\u043e\u043b\u0430.",
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
          account_type: "both",
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
            ? "\u0422\u043e\u0437\u0438 \u0438\u043c\u0435\u0439\u043b \u0432\u0435\u0447\u0435 \u0438\u043c\u0430 \u0430\u043a\u0430\u0443\u043d\u0442 \u0432 SONDI.BG. \u0412\u043b\u0435\u0437\u0442\u0435 \u0432 \u0430\u043a\u0430\u0443\u043d\u0442\u0430 \u0441\u0438 \u0438 \u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0432\u0430\u0439\u0442\u0435 \u0437\u0430\u044f\u0432\u043a\u0430\u0442\u0430."
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

    createdUserId = created.user.id;

    async function rollbackUser() {
      if (!createdUserId) return;

      try {
        await admin.auth.admin.deleteUser(
          createdUserId
        );
      } catch (error) {
        console.error(
          "request registration rollback error",
          error
        );
      }
    }

    const { error: profileError } =
      await admin
        .from("user_profiles")
        .upsert(
          {
            user_id: createdUserId,
            account_type: "both",
          },
          {
            onConflict: "user_id",
          }
        );

    if (profileError) {
      await rollbackUser();

      return NextResponse.json(
        {
          error:
            "\u041d\u0435 \u0443\u0441\u043f\u044f\u0445\u043c\u0435 \u0434\u0430 \u0441\u044a\u0437\u0434\u0430\u0434\u0435\u043c \u043f\u0440\u043e\u0444\u0438\u043b\u0430.",
        },
        { status: 500 }
      );
    }

    const {
      data: insertedRequest,
      error: requestError,
    } =
      await admin
        .from("service_requests")
        .insert({
          owner_id: createdUserId,
          service,
          region,
          locality,
          desired_period: desiredPeriod,
          estimated_depth: estimatedDepth,
          machine_access: machineAccess,
          description,
          contact_phone: phone,
          contact_email: email,
          status: "pending",
        })
        .select("id")
        .single();

    if (
      requestError ||
      !insertedRequest
    ) {
      await rollbackUser();

      return NextResponse.json(
        {
          error:
            requestError?.message ||
            "\u041d\u0435 \u0443\u0441\u043f\u044f\u0445\u043c\u0435 \u0434\u0430 \u0437\u0430\u043f\u0430\u0437\u0438\u043c \u0437\u0430\u044f\u0432\u043a\u0430\u0442\u0430.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      user_id: createdUserId,
      request_id: insertedRequest.id,
    });
  } catch (error) {
    console.error(
      "request register route error",
      error
    );

    return NextResponse.json(
      {
        error:
          "\u0412\u044a\u0437\u043d\u0438\u043a\u043d\u0430 \u0433\u0440\u0435\u0448\u043a\u0430 \u043f\u0440\u0438 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f\u0442\u0430 \u0438 \u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0432\u0430\u043d\u0435\u0442\u043e.",
      },
      { status: 500 }
    );
  }
}
