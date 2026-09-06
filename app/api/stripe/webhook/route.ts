import { NextResponse } from "next/server";
import Stripe from "stripe";

import { createAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripeKey =
    process.env.STRIPE_SECRET_KEY;
  const webhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    return NextResponse.json(
      {
        error:
          "Missing Stripe webhook environment variables.",
      },
      { status: 500 }
    );
  }

  const signature =
    request.headers.get(
      "stripe-signature"
    );

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 }
    );
  }

  const payload =
    await request.text();

  const stripe =
    new Stripe(stripeKey);

  let event: Stripe.Event;

  try {
    event =
      stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );
  } catch (error) {
    console.error(
      "Stripe webhook signature error",
      error
    );

    return NextResponse.json(
      {
        error:
          "Invalid Stripe webhook signature.",
      },
      { status: 400 }
    );
  }

  try {
    if (
      event.type ===
      "checkout.session.completed"
    ) {
      const session =
        event.data
          .object as Stripe.Checkout.Session;

      if (
        session.payment_status !==
        "paid"
      ) {
        return NextResponse.json({
          received: true,
          ignored: "payment_not_paid",
        });
      }

      const userId =
        session.metadata
          ?.sondi_user_id ||
        session.client_reference_id;

      const depositedCents =
        Number(
          session.metadata
            ?.deposited_cents
        );

      const analysisPriceCents =
        Number(
          session.metadata
            ?.analysis_price_cents
        );

      if (
        !userId ||
        !Number.isInteger(
          depositedCents
        ) ||
        depositedCents <= 0 ||
        !Number.isInteger(
          analysisPriceCents
        ) ||
        analysisPriceCents <= 0
      ) {
        throw new Error(
          "Invalid SONDI EXPERT checkout metadata."
        );
      }

      const paymentIntentId =
        typeof session.payment_intent ===
        "string"
          ? session.payment_intent
          : session.payment_intent?.id ||
            "";

      const supabase =
        createAdminClient();

      const { error } =
        await supabase.rpc(
          "credit_expert_balance_from_stripe",
          {
            p_user_id: userId,
            p_checkout_session_id:
              session.id,
            p_payment_intent_id:
              paymentIntentId,
            p_deposited_cents:
              depositedCents,
            p_analysis_price_cents:
              analysisPriceCents,
          }
        );

      if (error) {
        throw error;
      }
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error(
      "Stripe webhook processing error",
      error
    );

    return NextResponse.json(
      {
        error:
          "Stripe webhook processing failed.",
      },
      { status: 500 }
    );
  }
}