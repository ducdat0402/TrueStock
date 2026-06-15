import { Hono } from "hono";
import type { Env, Variables } from "../../types/env";
import { requireAuth } from "../../middleware/clerk-auth";
import { requirePlan } from "../../middleware/plan-guard";
import { WatchlistService } from "./watchlist.service";

const watchlistController = new Hono<{ Bindings: Env; Variables: Variables }>();

// Watchlist is a Premium feature
watchlistController.use("*", requireAuth);
watchlistController.use("*", requirePlan("premium", "b2b"));

// GET /api/watchlist - get user's watchlist
watchlistController.get("/", async (c) => {
  try {
    const userId = c.get("userId");
    if (!userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const service = new WatchlistService(c.env);
    const items = await service.getWatchlist(userId);
    return c.json({ success: true, data: items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ success: false, error: message }, 500);
  }
});

// GET /api/watchlist/:ticker - check if ticker is in watchlist
watchlistController.get("/:ticker", async (c) => {
  try {
    const userId = c.get("userId");
    if (!userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const ticker = c.req.param("ticker");

    const service = new WatchlistService(c.env);
    const isInWatchlist = await service.isInWatchlist(userId, ticker);
    return c.json({ success: true, data: { isInWatchlist } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ success: false, error: message }, 500);
  }
});

// POST /api/watchlist - add to watchlist
watchlistController.post("/", async (c) => {
  try {
    const userId = c.get("userId");
    if (!userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const body = await c.req.json<{ ticker: string; score?: number }>();
    const { ticker, score } = body;

    if (!ticker || typeof ticker !== "string") {
      return c.json({ success: false, error: "Ticker is required" }, 400);
    }

    const service = new WatchlistService(c.env);
    const item = await service.addToWatchlist(userId, ticker, score);
    return c.json({ success: true, data: item });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("giới hạn") ? 400 : 500;
    return c.json({ success: false, error: message }, status);
  }
});

// DELETE /api/watchlist/:ticker - remove from watchlist
watchlistController.delete("/:ticker", async (c) => {
  try {
    const userId = c.get("userId");
    if (!userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const ticker = c.req.param("ticker");

    const service = new WatchlistService(c.env);
    const removed = await service.removeFromWatchlist(userId, ticker);
    return c.json({ success: true, data: { removed } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ success: false, error: message }, 500);
  }
});

export { watchlistController };
