import { createMiddleware } from "hono/factory";
import type { Env, Variables } from "../types/env";

export const requestId = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  const id = crypto.randomUUID();
  c.set("requestId", id);
  c.header("X-Request-ID", id);
  await next();
});
