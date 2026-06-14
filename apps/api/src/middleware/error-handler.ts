import type { ErrorHandler } from "hono";
import type { Env, Variables } from "../types/env";

export const errorHandler: ErrorHandler<{
  Bindings: Env;
  Variables: Variables;
}> = (err, c) => {
  console.error(`[${c.get("requestId")}] Error:`, err);

  if (err.message.includes("Validation")) {
    return c.json(
      {
        success: false,
        error: err.message,
      },
      400
    );
  }

  return c.json(
    {
      success: false,
      error: "Internal server error",
    },
    500
  );
};
