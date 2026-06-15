import { Hono } from "hono";
import type { Env, Variables } from "../../types/env";
import { requireAuth } from "../../middleware/clerk-auth";
import { requirePlan } from "../../middleware/plan-guard";
import { AlertsService } from "./alerts.service";

const alertsController = new Hono<{ Bindings: Env; Variables: Variables }>();

// Alerts are a Premium feature
alertsController.use("*", requireAuth);
alertsController.use("*", requirePlan("premium", "b2b"));

// GET /api/alerts - get user's alerts
alertsController.get("/", async (c) => {
  try {
    const userId = c.get("userId");
    if (!userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const service = new AlertsService(c.env);
    const alerts = await service.getAlerts(userId);
    const unreadCount = await service.getUnreadCount(userId);

    return c.json({ success: true, data: { alerts, unreadCount } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ success: false, error: message }, 500);
  }
});

// GET /api/alerts/unread - get unread count
alertsController.get("/unread", async (c) => {
  try {
    const userId = c.get("userId");
    if (!userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const service = new AlertsService(c.env);
    const count = await service.getUnreadCount(userId);

    return c.json({ success: true, data: { count } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ success: false, error: message }, 500);
  }
});

// PATCH /api/alerts/:id/read - mark alert as read
alertsController.patch("/:id/read", async (c) => {
  try {
    const userId = c.get("userId");
    if (!userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const alertId = c.req.param("id");
    const service = new AlertsService(c.env);
    await service.markAsRead(userId, alertId);

    return c.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ success: false, error: message }, 500);
  }
});

// PATCH /api/alerts/read-all - mark all alerts as read
alertsController.patch("/read-all", async (c) => {
  try {
    const userId = c.get("userId");
    if (!userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const service = new AlertsService(c.env);
    await service.markAllAsRead(userId);

    return c.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ success: false, error: message }, 500);
  }
});

// GET /api/alerts/preferences - get user preferences
alertsController.get("/preferences", async (c) => {
  try {
    const userId = c.get("userId");
    if (!userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const service = new AlertsService(c.env);
    const prefs = await service.getPreferences(userId);

    return c.json({ success: true, data: prefs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ success: false, error: message }, 500);
  }
});

// PATCH /api/alerts/preferences - update user preferences
alertsController.patch("/preferences", async (c) => {
  try {
    const userId = c.get("userId");
    if (!userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const body = await c.req.json<{ emailEnabled?: boolean; threshold?: number }>();
    const service = new AlertsService(c.env);
    await service.updatePreferences(userId, body);

    const updated = await service.getPreferences(userId);
    return c.json({ success: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ success: false, error: message }, 500);
  }
});

export { alertsController };
