import { Hono } from "hono";
import type { Env, Variables } from "../../types/env";

const health = new Hono<{ Bindings: Env; Variables: Variables }>();

health.get("/", (c) => {
  return c.json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: c.env.ENVIRONMENT,
    },
  });
});

health.get("/ready", (c) => {
  return c.json({
    success: true,
    data: {
      status: "ready",
      timestamp: new Date().toISOString(),
    },
  });
});

export { health };
