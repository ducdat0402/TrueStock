import { Hono } from "hono";
import type { Env, Variables } from "../../types/env";
import { requireAuth } from "../../middleware/clerk-auth";
import { HistoryService } from "./history.service";

const history = new Hono<{ Bindings: Env; Variables: Variables }>();

history.use("*", requireAuth);

history.get("/", async (c) => {
  try {
    const userId = c.get("userId");
    if (!userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const service = new HistoryService(c.env);
    const data = await service.getUserHistory(userId);

    return c.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ success: false, error: message }, 500);
  }
});

export { history };
