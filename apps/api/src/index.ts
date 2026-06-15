import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { Env, Variables } from "./types/env";
import { requestId, errorHandler } from "./middleware";
import { health } from "./modules/health";
import { analyze } from "./modules/analyze";
import { compare } from "./modules/compare";
import { history } from "./modules/history";
import { watchlistController } from "./modules/watchlist";
import { alertsController } from "./modules/alerts";
import { meController } from "./modules/me";
import { billingController } from "./modules/billing";
import { uploadController } from "./modules/upload";
import { b2bController } from "./modules/b2b";
import { runWatchlistCheck } from "./jobs/watchlist-check.job";

const LOCAL_ORIGINS = ["http://localhost:5173", "http://localhost:3000"];

function getAllowedOrigins(frontendUrl?: string): string[] {
  const origins = [...LOCAL_ORIGINS];
  if (frontendUrl) origins.push(frontendUrl);
  return origins;
}

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Global middleware
app.use("*", logger());
app.use("*", requestId);
app.use("*", async (c, next) => {
  const allowedOrigins = getAllowedOrigins(c.env.FRONTEND_URL);

  return cors({
    origin: (origin) => {
      if (!origin) return allowedOrigins[0];
      return allowedOrigins.includes(origin) ? origin : null;
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })(c, next);
});

// Error handling
app.onError(errorHandler);

// Root route
app.get("/", (c) => {
  return c.json({
    success: true,
    data: {
      name: "TrueStock API",
      version: "0.0.1",
      description: "AI-powered stock analysis for Vietnamese F0 investors",
    },
  });
});

// Mount routes
app.route("/health", health);
app.route("/api/analyze", analyze);
app.route("/api/compare", compare);
app.route("/api/history", history);
app.route("/api/watchlist", watchlistController);
app.route("/api/alerts", alertsController);
app.route("/api/me", meController);
app.route("/api/webhooks", billingController);
app.route("/api/upload", uploadController);

// B2B API routes (versioned)
app.route("/v1", b2bController);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: "Not found",
    },
    404
  );
});

// Cloudflare Workers scheduled handler for cron jobs
const scheduled = async (
  _event: ScheduledEvent,
  env: Env,
  ctx: ExecutionContext
) => {
  ctx.waitUntil(
    runWatchlistCheck({
      DATABASE_URL: env.DATABASE_URL,
      RESEND_API_KEY: env.RESEND_API_KEY,
      FRONTEND_URL: env.FRONTEND_URL,
    }).then((result) => {
      console.log(
        `Watchlist check completed: ${result.checked} items checked, ${result.alerts} alerts created, ${result.emails} emails sent`
      );
    })
  );
};

export default {
  fetch: app.fetch,
  scheduled,
};
