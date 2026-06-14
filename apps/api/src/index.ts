import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { Env, Variables } from "./types/env";
import { requestId, errorHandler } from "./middleware";
import { health } from "./modules/health";
import { analyze } from "./modules/analyze";
import { history } from "./modules/history";

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
app.route("/api/history", history);

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

export default app;
