import { Hono } from "hono";
import { Webhook } from "svix";
import type { Env } from "../../types/env";
import type { UserPlan } from "../../types/env";
import { UserRepository } from "../users/user.repository";

export const billingController = new Hono<{ Bindings: Env }>();

interface ClerkPayer {
  user_id?: string;
  organization_id?: string;
}

interface ClerkPlan {
  slug?: string;
}

interface ClerkSubscriptionItem {
  plan?: ClerkPlan;
  status?: string;
}

interface ClerkBillingData {
  id?: string;
  status?: string;
  payer?: ClerkPayer;
  plan?: ClerkPlan;
  items?: ClerkSubscriptionItem[];
}

interface ClerkWebhookEvent {
  type: string;
  data: ClerkBillingData;
}

const FREE_PLAN_SLUGS = new Set(["free", "default"]);

function getClerkUserId(data: ClerkBillingData): string | null {
  return data.payer?.user_id ?? null;
}

function getPlanSlug(data: ClerkBillingData): string | null {
  if (data.plan?.slug) return data.plan.slug;
  return data.items?.[0]?.plan?.slug ?? null;
}

function resolveUserPlan(data: ClerkBillingData, status?: string): UserPlan {
  const slug = getPlanSlug(data)?.toLowerCase();
  const normalizedStatus = (status ?? data.status ?? "").toLowerCase();

  if (slug && !FREE_PLAN_SLUGS.has(slug) && normalizedStatus === "active") {
    return "premium";
  }

  return "free";
}

// POST /api/webhooks/clerk-billing - handle Clerk Billing webhooks
billingController.post("/clerk-billing", async (c) => {
  const webhookSecret = c.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET not configured");
    return c.json({ error: "Webhook secret not configured" }, 500);
  }

  const svixId = c.req.header("svix-id");
  const svixTimestamp = c.req.header("svix-timestamp");
  const svixSignature = c.req.header("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return c.json({ error: "Missing Svix headers" }, 400);
  }

  const body = await c.req.text();

  const wh = new Webhook(webhookSecret);
  let event: ClerkWebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return c.json({ error: "Invalid webhook signature" }, 400);
  }

  const userRepo = new UserRepository(c.env.DATABASE_URL);

  try {
    const clerkUserId = getClerkUserId(event.data);
    const subscriptionId = event.data.id ?? null;

    switch (event.type) {
      case "subscription.created":
      case "subscription.updated":
      case "subscription.active": {
        if (!clerkUserId) {
          console.error(`No payer.user_id in ${event.type}`);
          break;
        }

        const plan = resolveUserPlan(event.data);
        await userRepo.updatePlan(clerkUserId, plan, subscriptionId);
        console.log(`${event.type}: user ${clerkUserId} -> ${plan}`);
        break;
      }

      case "subscriptionItem.active": {
        if (!clerkUserId) {
          console.error("No payer.user_id in subscriptionItem.active");
          break;
        }

        const plan = resolveUserPlan(event.data, "active");
        await userRepo.updatePlan(clerkUserId, plan, subscriptionId);
        console.log(`subscriptionItem.active: user ${clerkUserId} -> ${plan}`);
        break;
      }

      case "subscriptionItem.canceled":
      case "subscriptionItem.ended":
      case "subscriptionItem.abandoned": {
        if (!clerkUserId) {
          console.error(`No payer.user_id in ${event.type}`);
          break;
        }

        await userRepo.updatePlan(clerkUserId, "free", null);
        console.log(`${event.type}: user ${clerkUserId} -> free`);
        break;
      }

      case "subscription.past_due":
      case "subscriptionItem.pastDue": {
        console.log(`Billing issue for user ${clerkUserId ?? "unknown"}: ${event.type}`);
        break;
      }

      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    return c.json({ received: true });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return c.json({ error: "Failed to process webhook" }, 500);
  }
});
