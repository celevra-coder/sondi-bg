import { NextResponse } from "next/server";
import Stripe from "stripe";

import { createClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

type TierKey =
  | "199"
  | "500"
  | "1000"
  | "2000";

type TierConfig = {
  depositedCents: number;
  analysisPriceCents: number;
  priceId: string | undefined;
};

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

    const { data: balanceLots, error: balanceError } =
      await supabase
        .from("expert_balance_lots")
        .select("remaining_cents")
        .eq("user_id", user.id)
        .gt("remaining_cents", 0);

    if (balanceError) {
      throw balanceError;
    }

    const currentPaidBalanceCents = (
      balanceLots || []
    ).reduce(
      (sum, lot) =>
        sum + Number(lot.remaining_cents || 0),
      0
    );

    if (currentPaidBalanceCents > 0) {
      return NextResponse.json(
        {
          error: "existing_balance",
          message:
            "Current EXPERT balance must be used before adding more funds.",
          balance_cents:
            currentPaidBalanceCents,
        },
        { status: 409 }
      );
    }

    let body: unknown = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const requestedTier =
      typeof body === "object" &&
      body !== null &&
      "tier" in body
        ? String(
            (body as { tier?: unknown }).tier || ""
          )
        : "";

    const tiers: Record<TierKey, TierConfig> = {
      "199": {
        depositedCents: 199,
        analysisPriceCents: 199,
        priceId:
          process.env.STRIPE_PRICE_199,
      },
      "500": {
        depositedCents: 500,
        analysisPriceCents: 125,
        priceId:
          process.env.STRIPE_PRICE_500,
      },
      "1000": {
        depositedCents: 1000,
        analysisPriceCents: 100,
        priceId:
          process.env.STRIPE_PRICE_1000,
      },
      "2000": {
        depositedCents: 2000,
        analysisPriceCents: 80,
        priceId:
          process.env.STRIPE_PRICE_2000,
      },
    };

    if (
      !Object.prototype.hasOwnProperty.call(
        tiers,
        requestedTier
      )
    ) {
      return NextResponse.json(
        {
          error: "invalid_tier",
        },
        { status: 400 }
      );
    }

    const tier =
      tiers[requestedTier as TierKey];

    const stripeKey =
      process.env.STRIPE_SECRET_KEY;

    if (!stripeKey || !tier.priceId) {
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
            price: tier.priceId,
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
          sondi_tier: requestedTier,
          deposited_cents: String(
            tier.depositedCents
          ),
          analysis_price_cents: String(
            tier.analysisPriceCents
          ),
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