import { createMiddleware } from "hono/factory";
import { verifyToken } from "@clerk/backend";
import type { Env, Variables } from "../types/env";
import { UserRepository } from "../modules/users/user.repository";

async function resolveAuth(
  authHeader: string | undefined,
  env: Env
): Promise<{ clerkId: string; userId: string } | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  if (!token || env.CLERK_SECRET_KEY === "your_clerk_secret_key_here") return null;

  try {
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    });

    if (!payload.sub) return null;

    const userRepo = new UserRepository(env.DATABASE_URL);
    const user = await userRepo.findOrCreate(payload.sub);

    return { clerkId: payload.sub, userId: user.id };
  } catch {
    return null;
  }
}

// Xác thực tùy chọn — dùng cho POST /api/analyze (lưu history nếu đã login)
export const optionalAuth = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  const auth = await resolveAuth(c.req.header("Authorization"), c.env);
  if (auth) {
    c.set("clerkId", auth.clerkId);
    c.set("userId", auth.userId);
  }
  await next();
});

// Xác thực bắt buộc — dùng cho GET /api/history
export const requireAuth = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  const auth = await resolveAuth(c.req.header("Authorization"), c.env);

  if (!auth) {
    return c.json({ success: false, error: "Unauthorized" }, 401);
  }

  c.set("clerkId", auth.clerkId);
  c.set("userId", auth.userId);
  return next();
});
