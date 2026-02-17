import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const logStep = (step: string, details?: unknown) => {
  console.log(`[STRIPE-WEBHOOK] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    logStep("ERROR", { message: "Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET" });
    return new Response("Server misconfigured", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    logStep("Signature verification failed", { error: String(err) });
    return new Response("Invalid signature", { status: 400 });
  }

  logStep("Event received", { type: event.type, id: event.id });

  // Idempotency: check if already processed
  const { data: existing } = await supabase
    .from("stripe_events")
    .select("id, processed")
    .eq("stripe_event_id", event.id)
    .maybeSingle();

  if (existing?.processed) {
    logStep("Event already processed, skipping", { eventId: event.id });
    return new Response(JSON.stringify({ received: true, skipped: true }), { status: 200 });
  }

  // Insert event (or ignore if duplicate)
  if (!existing) {
    await supabase.from("stripe_events").insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event.data.object as Record<string, unknown>,
    });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(supabase, stripe, session);
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(supabase, subscription);
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(supabase, invoice);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoiceFailed(supabase, invoice);
        break;
      }
      default:
        logStep("Unhandled event type", { type: event.type });
    }

    // Mark as processed
    await supabase
      .from("stripe_events")
      .update({ processed: true })
      .eq("stripe_event_id", event.id);

    logStep("Event processed successfully", { eventId: event.id });
  } catch (err) {
    const msg = String(err);
    logStep("ERROR processing event", { eventId: event.id, error: msg });
    await supabase
      .from("stripe_events")
      .update({ error_message: msg })
      .eq("stripe_event_id", event.id);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});

async function handleCheckoutCompleted(
  supabase: ReturnType<typeof createClient>,
  stripe: Stripe,
  session: Stripe.Checkout.Session
) {
  logStep("Checkout completed", { sessionId: session.id, customerId: session.customer });
  
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  const userId = session.metadata?.user_id;

  if (!userId || !subscriptionId) {
    logStep("Missing user_id or subscription_id in session");
    return;
  }

  // Get tenant for user
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("owner_id", userId)
    .limit(1)
    .maybeSingle();

  if (!tenant) {
    logStep("No tenant found for user", { userId });
    return;
  }

  // Get subscription from Stripe to find price/product
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = sub.items.data[0]?.price?.id;

  // Find matching plan
  const { data: plan } = await supabase
    .from("plans")
    .select("id")
    .eq("stripe_price_id", priceId)
    .maybeSingle();

  // Upsert subscription
  await supabase.from("subscriptions").upsert({
    tenant_id: tenant.id,
    user_id: userId,
    plan_id: plan?.id || null,
    stripe_subscription_id: subscriptionId,
    stripe_customer_id: customerId,
    status: sub.status,
    current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    cancel_at_period_end: sub.cancel_at_period_end,
  }, { onConflict: "stripe_subscription_id" });

  // Refresh credits based on plan
  if (plan) {
    const { data: planData } = await supabase
      .from("plans")
      .select("included_credits")
      .eq("id", plan.id)
      .single();

    if (planData && planData.included_credits > 0) {
      await supabase.from("credits").upsert({
        tenant_id: tenant.id,
        user_id: userId,
        balance: planData.included_credits,
        last_refill_at: new Date().toISOString(),
      }, { onConflict: "tenant_id" });
    }
  }

  logStep("Subscription and credits created", { tenantId: tenant.id, planId: plan?.id });
}

async function handleSubscriptionChange(
  supabase: ReturnType<typeof createClient>,
  subscription: Stripe.Subscription
) {
  logStep("Subscription changed", { subId: subscription.id, status: subscription.status });

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) logStep("Failed to update subscription", { error: error.message });
}

async function handleInvoicePaid(
  supabase: ReturnType<typeof createClient>,
  invoice: Stripe.Invoice
) {
  logStep("Invoice paid", { invoiceId: invoice.id });

  // Find tenant via subscription
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("id, tenant_id")
    .eq("stripe_subscription_id", invoice.subscription as string)
    .maybeSingle();

  if (!sub) return;

  await supabase.from("invoices").upsert({
    tenant_id: sub.tenant_id,
    subscription_id: sub.id,
    stripe_invoice_id: invoice.id,
    amount_due_cents: invoice.amount_due,
    amount_paid_cents: invoice.amount_paid,
    currency: invoice.currency,
    status: "paid",
    period_start: new Date((invoice.period_start || 0) * 1000).toISOString(),
    period_end: new Date((invoice.period_end || 0) * 1000).toISOString(),
  }, { onConflict: "stripe_invoice_id" });

  if (invoice.payment_intent) {
    await supabase.from("payments").upsert({
      tenant_id: sub.tenant_id,
      invoice_id: sub.id,
      stripe_payment_intent_id: invoice.payment_intent as string,
      amount_cents: invoice.amount_paid,
      status: "succeeded",
      paid_at: new Date().toISOString(),
    }, { onConflict: "stripe_payment_intent_id" });
  }
}

async function handleInvoiceFailed(
  supabase: ReturnType<typeof createClient>,
  invoice: Stripe.Invoice
) {
  logStep("Invoice payment failed", { invoiceId: invoice.id });

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("id, tenant_id")
    .eq("stripe_subscription_id", invoice.subscription as string)
    .maybeSingle();

  if (!sub) return;

  await supabase.from("invoices").upsert({
    tenant_id: sub.tenant_id,
    subscription_id: sub.id,
    stripe_invoice_id: invoice.id,
    amount_due_cents: invoice.amount_due,
    amount_paid_cents: 0,
    currency: invoice.currency,
    status: "payment_failed",
  }, { onConflict: "stripe_invoice_id" });
}
