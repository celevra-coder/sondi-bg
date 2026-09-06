import { NextResponse } from "next/server";
import Stripe from "stripe";

import { createClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminRow) {
      return NextResponse.json(
        {
          error:
            "Administrators do not use the EXPERT payment system.",
        },
        { status: 403 }
      );
    }

    const stripeKey =
      process.env.STRIPE_SECRET_KEY;
    const priceId =
      process.env.STRIPE_PRICE_ID;

    if (!stripeKey || !priceId) {
      throw new Error(
        "Missing Stripe environment variables."
      );
    }

    const stripe = new Stripe(stripeKey);

    const origin = new URL(request.url).origin;

    const session =
      await stripe.checkout.sessions.create({
        mode: "payment",

        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],

        client_reference_id: user.id,

        customer_email:
          user.email || undefined,

        metadata: {
          sondi_user_id: user.id,
          sondi_purchase_type:
            "expert_balance",
          sondi_tier: "single",
          deposited_cents: "199",
          analysis_price_cents: "199",
        },

        success_url:
          `${origin}/account?payment=success&session_id={CHECKOUT_SESSION_ID}`,

        cancel_url:
          `${origin}/account?payment=cancelled`,
      });

    if (!session.url) {
      throw new Error(
        "Stripe Checkout URL was not created."
      );
    }

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error(
      "Stripe checkout error",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to create Stripe Checkout session.",
      },
      { status: 500 }
    );
  }
}